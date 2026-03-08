const TMDB_API_KEY = 'c6a1e6f821f34f9deda07b81a0c04c72';

let currentUser = null;
let partner = null;
let allProfiles = [];
let watchlist = [];
let myHistory = [];
let partnerHistory = [];

let selectedMovie = null;
let currentTicketMovie = null;
let currentTicketDate = null;
let pendingRatingId = null;

// === VIBRAÇÃO (HAPTIC FEEDBACK) ===
const haptic = () => { if (navigator.vibrate) navigator.vibrate(40); };

async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return window.location.href = 'index.html';
    currentUser = session.user;

    setupGlobalModals();
    await loadData();
    setupNavigation();
    setupSearchAndActionSheet();
    setupTicketActions();
}

async function loadData() {
    let { data: profs } = await supabaseClient.from('profiles').select('*');
    profs = profs || [];

    let me = profs.find(p => p.id === currentUser.id);
    if (!me) {
        const { data: newProfile } = await supabaseClient.from('profiles').insert({ id: currentUser.id, name: "Novo Usuário" }).select().single();
        if (newProfile) { profs.push(newProfile); me = newProfile; }
    }

    allProfiles = profs;
    partner = allProfiles.find(p => p.id !== currentUser.id);

    const { data: wData } = await supabaseClient.from('watchlist').select('id, movie_id, scheduled_date, movies(*)').order('added_at', { ascending: false });
    watchlist = wData || [];

    const scheduledItem = watchlist.find(w => w.scheduled_date !== null);
    if (scheduledItem) {
        currentTicketMovie = scheduledItem.movies;
        currentTicketDate = scheduledItem.scheduled_date;
    } else {
        currentTicketMovie = null; currentTicketDate = null;
    }

    const { data: hData } = await supabaseClient.from('watched').select('*, movies(*)').eq('user_id', currentUser.id).order('watched_at', { ascending: false });
    myHistory = hData || [];

    if (partner) {
        const { data: pHist } = await supabaseClient.from('watched').select('*, movies(*)').eq('user_id', partner.id).order('watched_at', { ascending: false });
        partnerHistory = pHist || [];
    }

    updateGlobalUI();
    renderWatchlist();
    
    if (document.getElementById('network-section').classList.contains('active')) {
        renderProfile(document.getElementById('tab-me').classList.contains('active') ? currentUser.id : partner?.id);
    }
}

function updateGlobalUI() {
    const me = allProfiles.find(p => p.id === currentUser.id);
    const myName = (me && me.name !== "Novo Usuário") ? me.name : "Eu";
    const partnerName = (partner && partner.name !== "Novo Usuário") ? partner.name : "Parceiro";

    const myAvatarEl = document.getElementById('my-header-avatar');
    if (myAvatarEl) myAvatarEl.src = me?.avatar_url || 'assets/img/sem-capa.png';
    const partnerAvatarEl = document.getElementById('partner-header-avatar');
    if (partnerAvatarEl) partnerAvatarEl.src = partner?.avatar_url || 'assets/img/sem-capa.png';
    const tabPartnerEl = document.getElementById('tab-partner');
    if (tabPartnerEl) tabPartnerEl.innerText = partnerName;

    // Estatísticas da Home
    let sharedMovies = [];
    if (partner) {
        const myIds = myHistory.map(h => h.movie_id);
        sharedMovies = partnerHistory.filter(h => myIds.includes(h.movie_id));
        document.getElementById('home-stat-juntos').innerText = sharedMovies.length;
    }

    const sharedMyNotes = myHistory.filter(h => sharedMovies.find(s => s.movie_id === h.movie_id && h.rating !== null));
    const sharedPartnerNotes = partnerHistory.filter(h => sharedMovies.find(s => s.movie_id === h.movie_id && h.rating !== null));

    if (sharedMyNotes.length > 0) {
        const sumMe = sharedMyNotes.reduce((acc, h) => acc + parseFloat(h.rating), 0);
        const sumPartner = sharedPartnerNotes.reduce((acc, h) => acc + parseFloat(h.rating), 0);
        const totalRatings = sharedMyNotes.length + sharedPartnerNotes.length;
        document.getElementById('home-stat-media').innerText = ((sumMe + sumPartner) / totalRatings).toFixed(1);
        const genres = sharedMyNotes.map(h => h.movies.genre).filter(g => g && g !== "Variado");
        document.getElementById('home-stat-genre').innerText = genres.length ? genres.sort((a,b) => genres.filter(v => v===a).length - genres.filter(v => v===b).length).pop() : "Variado";

        const mediaMe = sumMe / sharedMyNotes.length;
        const mediaPa = sumPartner / sharedPartnerNotes.length;
        let critName = "-", critMedia = "-", critImg = "assets/img/sem-capa.png";
        if (mediaMe < mediaPa) {
            critName = myName; critMedia = mediaMe.toFixed(1); critImg = me?.avatar_url;
        } else if (mediaPa < mediaMe) {
            critName = partnerName; critMedia = mediaPa.toFixed(1); critImg = partner?.avatar_url;
        } else {
            critName = "Empate"; critMedia = mediaMe.toFixed(1);
        }
        document.getElementById('crit-name').innerText = critName;
        document.getElementById('crit-media').innerText = `Média: ${critMedia}`;
        document.getElementById('crit-avatar').src = critImg || 'assets/img/sem-capa.png';
    } else {
        document.getElementById('home-stat-media').innerText = "0.0";
        document.getElementById('home-stat-genre').innerText = "-";
        document.getElementById('crit-name').innerText = "Ainda não";
        document.getElementById('crit-media').innerText = "Vejam algo juntos";
    }

    const pending = myHistory.find(h => h.rating === null);
    const btnShareWA = document.getElementById('btn-share-wa');

    if (pending) {
        document.getElementById('ticket-btns').classList.add('hidden');
        document.getElementById('pending-rating-box').classList.remove('hidden');
        document.getElementById('ticket-title').innerText = pending.movies.title;
        document.getElementById('ticket-poster').src = pending.movies.poster_url;
        document.getElementById('ticket-date').innerText = "Aguardando sua nota";
        pendingRatingId = pending.id;
        currentTicketMovie = null;
        if(btnShareWA) btnShareWA.classList.add('hidden');
    } else {
        document.getElementById('ticket-btns').classList.remove('hidden');
        document.getElementById('pending-rating-box').classList.add('hidden');
        pendingRatingId = null;

        if (currentTicketMovie) {
            document.getElementById('ticket-title').innerText = currentTicketMovie.title;
            document.getElementById('ticket-poster').src = currentTicketMovie.poster_url;
            const d = new Date(currentTicketDate + 'T12:00:00').toLocaleDateString('pt-BR');
            document.getElementById('ticket-date').innerText = `Agendado: ${d}`;
            document.getElementById('dynamic-bg').style.backgroundImage = `url('${currentTicketMovie.poster_url}')`;
            
            // WHATSAPP SHARE
            if(btnShareWA) {
                btnShareWA.classList.remove('hidden');
                btnShareWA.onclick = () => {
                    haptic();
                    const msg = `🍿 *Sessão CineCasal!*\n\nSorteei o filme *${currentTicketMovie.title}* para a nossa próxima sessão.\n📅 Data marcada: ${d}\n\nPrepara a pipoca! ❤️`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
                };
            }
        } else {
            document.getElementById('ticket-title').innerText = "Escolha um filme";
            document.getElementById('ticket-poster').src = "assets/img/sem-capa.png";
            document.getElementById('ticket-date').innerText = "A definir";
            document.getElementById('dynamic-bg').style.backgroundImage = `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba')`;
            if(btnShareWA) btnShareWA.classList.add('hidden');
        }
    }
}

// === BUSCA ===
function setupSearchAndActionSheet() {
    const input = document.getElementById('search-movie');
    const flyout = document.getElementById('search-results');
    let timer;

    input.addEventListener('input', async (e) => {
        clearTimeout(timer);
        const q = e.target.value.trim();
        if (q.length < 3) return flyout.classList.add('hidden');

        timer = setTimeout(async () => {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(q)}`);
            const data = await res.json();
            flyout.innerHTML = '';
            if (data.results.length === 0) return flyout.classList.add('hidden');
            flyout.classList.remove('hidden');

            data.results.slice(0, 5).forEach(m => {
                const div = document.createElement('div');
                div.className = 'result-item';
                const imgUrl = m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'assets/img/sem-capa.png';
                div.innerHTML = `<img src="${imgUrl}" class="res-img"><div><h4 style="font-size:14px; margin-bottom:4px;">${m.title}</h4><small style="opacity:0.6;">${m.release_date ? m.release_date.split('-')[0] : ''}</small></div>`;
                div.onclick = () => {
                    haptic();
                    selectedMovie = m;
                    document.getElementById('sheet-title').innerText = m.title;
                    document.getElementById('sheet-desc').innerText = m.release_date ? m.release_date.split('-')[0] : 'Desconhecido';
                    document.getElementById('modal-action').classList.remove('hidden');
                    flyout.classList.add('hidden');
                    input.value = ''; 
                };
                flyout.appendChild(div);
            });
        }, 500);
    });

    document.getElementById('opt-watchlist').onclick = async () => {
        haptic();
        if(!selectedMovie) return;
        const m = await syncMovieWithDB(selectedMovie);
        const { error } = await supabaseClient.from('watchlist').insert({ movie_id: m.id });
        if(error) alert("Já está na sua lista!");
        closeModals(); loadData();
    };

    document.getElementById('opt-history').onclick = async () => {
        haptic();
        if(!selectedMovie) return;
        const m = await syncMovieWithDB(selectedMovie);
        const { data: ex } = await supabaseClient.from('watched').select('id').eq('user_id', currentUser.id).eq('movie_id', m.id).single();
        if(!ex) await supabaseClient.from('watched').insert({ user_id: currentUser.id, movie_id: m.id, rating: null });
        closeModals(); loadData();
    };
}

// === TICKET E AVALIAÇÃO ===
function runTearAnimation(callback) {
    const originalPoster = document.getElementById('ticket-poster');
    const rect = originalPoster.getBoundingClientRect();
    const clone = document.createElement('img');
    clone.src = originalPoster.src;
    clone.style.position = 'fixed';
    clone.style.top = rect.top + 'px';
    clone.style.left = rect.left + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.objectFit = 'cover';
    clone.style.borderRadius = '20px';
    clone.style.zIndex = '999999';
    clone.style.pointerEvents = 'none';
    document.body.appendChild(clone);
    originalPoster.style.opacity = '0'; 
    clone.offsetHeight; 
    clone.classList.add('tear-and-fall');
    setTimeout(() => {
        clone.remove();
        originalPoster.style.opacity = '1';
        originalPoster.src = 'assets/img/sem-capa.png';
        if (callback) callback();
    }, 1200); 
}

function setupTicketActions() {
    document.getElementById('btn-roleta').onclick = () => {
        haptic();
        if (watchlist.length === 0) return alert("A Lista está vazia!");
        const btn = document.getElementById('btn-roleta'); btn.disabled = true;
        let c = 0;
        const t = setInterval(async () => {
            const r = watchlist[Math.floor(Math.random() * watchlist.length)].movies;
            document.getElementById('ticket-poster').src = r.poster_url;
            if (++c > 15) {
                clearInterval(t); btn.disabled = false;
                haptic(); // vibra quando para
                const finalItem = watchlist[Math.floor(Math.random() * watchlist.length)];
                const prev = watchlist.find(w => w.scheduled_date !== null);
                if(prev) await supabaseClient.from('watchlist').update({ scheduled_date: null }).eq('id', prev.id);
                const today = new Date().toISOString().split('T')[0];
                await supabaseClient.from('watchlist').update({ scheduled_date: today }).eq('id', finalItem.id);
                loadData();
            }
        }, 100);
    };

    document.getElementById('btn-agendar').onclick = () => {
        haptic();
        if (!watchlist.length) return alert("A Lista está vazia!");
        const sel = document.getElementById('modal-movie-select');
        sel.innerHTML = watchlist.map(w => `<option value="${w.movies.id}">${w.movies.title}</option>`).join('');
        document.getElementById('modal-schedule').classList.remove('hidden');
    };

    document.getElementById('btn-confirm-schedule').onclick = async () => {
        haptic();
        const id = document.getElementById('modal-movie-select').value;
        const dateStr = document.getElementById('modal-date').value;
        if (!id || !dateStr) return alert("Preencha tudo!");
        const prev = watchlist.find(w => w.scheduled_date !== null);
        if(prev) await supabaseClient.from('watchlist').update({ scheduled_date: null }).eq('id', prev.id);
        const wItem = watchlist.find(w => w.movies.id == id);
        await supabaseClient.from('watchlist').update({ scheduled_date: dateStr }).eq('id', wItem.id);
        closeModals(); loadData();
    };

    document.getElementById('btn-check').onclick = async () => {
        haptic();
        if (!currentTicketMovie) return alert("Sorteie ou agende um filme primeiro!");
        if (!partner) return alert("Parceiro não encontrado!\nPeça para ela fazer o login.");

        runTearAnimation(async () => {
            haptic();
            const { data: meEx } = await supabaseClient.from('watched').select('id').eq('user_id', currentUser.id).eq('movie_id', currentTicketMovie.id).single();
            if (!meEx) await supabaseClient.from('watched').insert({ user_id: currentUser.id, movie_id: currentTicketMovie.id, rating: null });

            const { data: paEx } = await supabaseClient.from('watched').select('id').eq('user_id', partner.id).eq('movie_id', currentTicketMovie.id).single();
            if (!paEx) await supabaseClient.from('watched').insert({ user_id: partner.id, movie_id: currentTicketMovie.id, rating: null });

            await supabaseClient.from('watchlist').delete().eq('movie_id', currentTicketMovie.id);
            currentTicketMovie = null;
            loadData();
        });
    };

    document.getElementById('btn-open-rating').onclick = () => {
        haptic();
        const p = myHistory.find(h => h.id === pendingRatingId);
        if (p) {
            document.getElementById('rating-movie-title').innerText = p.movies.title;
            document.getElementById('modal-rating').classList.remove('hidden');
        }
    };

    document.getElementById('btn-save-rating').onclick = async () => {
        haptic();
        const nota = parseFloat(document.getElementById('input-rating').value);
        if (isNaN(nota) || nota < 1 || nota > 5) return alert("Nota de 1 a 5. Ex: 4.5");
        
        closeModals();
        runTearAnimation(async () => {
            haptic();
            await supabaseClient.from('watched').update({ rating: nota }).eq('id', pendingRatingId);
            document.getElementById('input-rating').value = '';
            pendingRatingId = null;
            loadData();
        });
    };
}

// === DETALHES TMDB ===
async function openMovieDetails(tmdbId) {
    haptic();
    document.getElementById('modal-movie-details').classList.remove('hidden');
    document.getElementById('detail-title').innerText = "Carregando...";
    document.getElementById('detail-poster').src = "assets/img/sem-capa.png";
    document.getElementById('detail-year').innerText = "-";
    document.getElementById('detail-runtime').innerText = "-";
    document.getElementById('detail-genre').innerText = "-";
    document.getElementById('detail-director').innerText = "-";
    document.getElementById('detail-cast').innerText = "-";
    document.getElementById('detail-overview').innerText = "Buscando...";

    try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&language=pt-BR&append_to_response=credits`);
        const movie = await res.json();
        document.getElementById('detail-poster').src = movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'assets/img/sem-capa.png');
        document.getElementById('detail-title').innerText = movie.title;
        document.getElementById('detail-year').innerText = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        document.getElementById('detail-runtime').innerText = movie.runtime ? `${movie.runtime} min` : 'N/A';
        document.getElementById('detail-genre').innerText = movie.genres.map(g => g.name).join(', ') || 'Variado';
        const director = movie.credits.crew.find(c => c.job === 'Director');
        document.getElementById('detail-director').innerText = director ? director.name : 'Desconhecido';
        const cast = movie.credits.cast.slice(0, 4).map(c => c.name).join(', ');
        document.getElementById('detail-cast').innerText = cast ? cast + '...' : 'Desconhecido';
        document.getElementById('detail-overview').innerText = movie.overview || 'Sem sinopse disponível.';
    } catch(e) { document.getElementById('detail-overview').innerText = 'Erro ao carregar detalhes.'; }
}

// === PERFIL ===
async function renderProfile(uid) {
    if (!uid) return;
    const isMe = uid === currentUser.id;
    const prof = allProfiles.find(p => p.id === uid);
    
    document.getElementById('profile-name').innerText = prof?.name || (isMe ? "Eu" : "Parceiro");
    document.getElementById('profile-avatar').src = prof?.avatar_url || 'assets/img/sem-capa.png';
    document.getElementById('profile-bio').innerText = prof?.bio || "Sem biografia.";
    if (isMe) document.getElementById('btn-edit-trigger').classList.remove('hidden');
    else document.getElementById('btn-edit-trigger').classList.add('hidden');

    const hist = isMe ? myHistory : partnerHistory;
    const rated = hist.filter(h => h.rating !== null);

    document.getElementById('stat-vistos').innerText = rated.length;
    document.getElementById('stat-media').innerText = rated.length ? (rated.reduce((a,b)=>a+parseFloat(b.rating),0)/rated.length).toFixed(1) : "0.0";
    if (rated.length) {
        const counts = rated.reduce((acc, h) => { const g = h.movies.genre; if(g && g!=="Variado") acc[g] = (acc[g]||0)+1; return acc; }, {});
        document.getElementById('stat-genre').innerText = Object.keys(counts).length ? Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b) : "Variado";
    } else document.getElementById('stat-genre').innerText = "-";

    const tl = document.getElementById('history-timeline');
    tl.innerHTML = '';
    hist.forEach(h => {
        const div = document.createElement('div');
        div.className = 'h-item glass-panel';
        div.setAttribute('data-bg', h.movies.poster_url);
        div.onclick = () => openMovieDetails(h.movies.tmdb_id);
        const notaText = h.rating ? `⭐ ${h.rating}` : `<span style="color:#ff9f0a">Pendente</span>`;
        div.innerHTML = `<img src="${h.movies.poster_url}" class="h-poster"><div><h4 style="font-size:14px; margin-bottom:5px;">${h.movies.title}</h4><span style="font-size:12px; opacity:0.6;">Nota: ${notaText}</span></div>`;
        tl.appendChild(div);
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if(e.isIntersecting) {
                document.querySelectorAll('.h-item').forEach(x => x.classList.remove('in-focus'));
                e.target.classList.add('in-focus');
                document.getElementById('dynamic-bg').style.backgroundImage = `url('${e.target.getAttribute('data-bg')}')`;
            }
        });
    }, { threshold: 0.7 });
    document.querySelectorAll('.h-item').forEach(i => obs.observe(i));

    const gridAll = document.getElementById('all-watched-grid');
    gridAll.innerHTML = '';
    hist.forEach(h => {
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.onclick = () => openMovieDetails(h.movies.tmdb_id);
        div.innerHTML = `<img src="${h.movies.poster_url}">`;
        gridAll.appendChild(div);
    });

    const listShared = document.getElementById('shared-movies-list');
    listShared.innerHTML = '';
    if (partner) {
        const myIds = myHistory.map(x => x.movie_id);
        const shared = partnerHistory.filter(x => myIds.includes(x.movie_id));
        shared.forEach(s => {
            const m = s.movies;
            const myNote = myHistory.find(x => x.movie_id === m.id)?.rating;
            const paNote = partnerHistory.find(x => x.movie_id === m.id)?.rating;
            const div = document.createElement('div');
            div.className = 'shared-item';
            div.onclick = () => openMovieDetails(m.tmdb_id);
            div.innerHTML = `<img src="${m.poster_url}" class="shared-poster"><div style="flex:1;"><h4>${m.title}</h4><div class="shared-notes"><div><small>Você</small><b>⭐ ${myNote || 'Pendente'}</b></div><div><small>Parceiro</small><b>⭐ ${paNote || 'Pendente'}</b></div></div></div>`;
            listShared.appendChild(div);
        });
    }
}

document.querySelectorAll('.sub-btn').forEach(btn => {
    btn.onclick = () => {
        haptic();
        document.querySelectorAll('.sub-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.prof-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-target')).classList.add('active');
    };
});

// === UTILITÁRIOS E NAVEGAÇÃO ===
async function syncMovieWithDB(m) {
    const { data } = await supabaseClient.from('movies').select('*').eq('tmdb_id', m.id).single();
    if (data) return data;
    const genreMap = { 28:"Ação", 35:"Comédia", 10749:"Romance", 27:"Terror", 18:"Drama", 878:"Ficção", 16:"Animação" };
    const { data: n } = await supabaseClient.from('movies').insert({ tmdb_id: m.id, title: m.title, poster_url: `https://image.tmdb.org/t/p/w500${m.poster_path}`, genre: (m.genre_ids ? genreMap[m.genre_ids[0]] || "Variado" : "Variado") }).select().single();
    return n;
}

function renderWatchlist() {
    const grid = document.getElementById('watchlist-grid');
    grid.innerHTML = '';
    watchlist.forEach(w => {
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.innerHTML = `<img src="${w.movies.poster_url}" onclick="openMovieDetails(${w.movies.tmdb_id})"><button class="btn-delete" onclick="event.stopPropagation(); delWatch(${w.id})">✕</button>`;
        grid.appendChild(div);
    });
}

window.delWatch = async (id) => { haptic(); if(confirm("Remover da Lista?")){ await supabaseClient.from('watchlist').delete().eq('id', id); loadData(); } };

function setupNavigation() {
    document.querySelectorAll('.t-item').forEach(btn => {
        btn.onclick = () => {
            haptic();
            document.querySelectorAll('.t-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(v => v.classList.add('hidden'));
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.remove('hidden');
            if (target === 'network-section') renderProfile(document.getElementById('tab-me').classList.contains('active') ? currentUser.id : partner?.id);
        };
    });
    document.getElementById('tab-me').onclick = (e) => { haptic(); e.target.classList.add('active'); document.getElementById('tab-partner').classList.remove('active'); renderProfile(currentUser.id); };
    document.getElementById('tab-partner').onclick = (e) => { haptic(); e.target.classList.add('active'); document.getElementById('tab-me').classList.remove('active'); renderProfile(partner?.id); };
}

function setupGlobalModals() {
    window.closeModals = () => { haptic(); document.querySelectorAll('.overlay').forEach(o => o.classList.add('hidden')); };
    document.getElementById('logout-btn').onclick = async () => { haptic(); await supabaseClient.auth.signOut(); window.location.href = 'index.html'; };

    document.getElementById('btn-edit-trigger').onclick = () => {
        haptic();
        const me = allProfiles.find(x => x.id === currentUser.id);
        document.getElementById('edit-name').value = me?.name !== "Novo Usuário" ? me?.name : "";
        document.getElementById('edit-avatar').value = me?.avatar_url || "";
        document.getElementById('edit-bio').value = me?.bio || "";
        document.getElementById('modal-edit').classList.remove('hidden');
    };

    document.getElementById('btn-save-profile').onclick = async () => {
        haptic();
        const name = document.getElementById('edit-name').value || "Sem Nome";
        const bio = document.getElementById('edit-bio').value;
        const fileInput = document.getElementById('edit-avatar-file');
        let avatarUrl = document.getElementById('edit-avatar').value;

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileName = `${currentUser.id}-${Math.random()}.${file.name.split('.').pop()}`;
            const { error } = await supabaseClient.storage.from('avatars').upload(fileName, file);
            if (!error) avatarUrl = supabaseClient.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
        }

        await supabaseClient.from('profiles').update({ name, bio, avatar_url: avatarUrl }).eq('id', currentUser.id);
        closeModals(); loadData();
    };
}

init();