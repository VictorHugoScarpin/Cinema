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
let radarChartInstance = null; 

let longPressItemToDelete = null; // Guarda ID para deletar segurando

const haptic = () => { if (navigator.vibrate) navigator.vibrate(40); };



// PARALLAX MÁGICO
window.addEventListener('deviceorientation', (e) => {
    const bg = document.getElementById('dynamic-bg');
    if(!bg) return;
    const tiltX = Math.min(Math.max(e.gamma, -30), 30); 
    const tiltY = Math.min(Math.max(e.beta, -30), 30);
    bg.style.transform = `translate(${tiltX * 0.5}px, ${tiltY * 0.5}px) scale(1.15)`;
});

// TOAST NOTIFICATIONS (Substitui Alert)
function showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.innerText = msg;
    container.appendChild(toast);
    haptic();
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// BOTAO LOADING
function setBtnLoading(btnId, isLoading) {
    const btn = document.getElementById(btnId);
    if(isLoading) { btn.classList.add('btn-loading'); btn.disabled = true; }
    else { btn.classList.remove('btn-loading'); btn.disabled = false; }
}

const movieQuotes = [
    '"A força estará com você. Sempre." - Star Wars',
    '"Eu sou o rei do mundo!" - Titanic',
    '"Por que tão sério?" - Batman',
    '"A vida é como uma caixa de chocolates." - Forrest Gump'
];
Chart.defaults.color = 'rgba(255, 255, 255, 0.6)';
Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.scale.ticks.display = false;

async function init() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return window.location.href = 'index.html';
    currentUser = session.user;

    document.getElementById('daily-quote').innerText = movieQuotes[new Date().getDate() % movieQuotes.length];

    setupGlobalModals();
    await loadData();
    setupNavigation();
    setupSwipeGestures();
    setupHeaderBlur();
    setupPullToRefresh();
    setupSearchAndActionSheet();
    setupTicketActions();
    fetchSurpriseSuggestion();
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

    const { data: wData } = await supabaseClient.from('watchlist').select('id, movie_id, scheduled_date, added_by, movies(*)').order('added_at', { ascending: false });
    watchlist = wData || [];

    const scheduledItem = watchlist.find(w => w.scheduled_date !== null);
    if (scheduledItem) { currentTicketMovie = scheduledItem.movies; currentTicketDate = scheduledItem.scheduled_date; } 
    else { currentTicketMovie = null; currentTicketDate = null; }

    const { data: hData } = await supabaseClient.from('watched').select('*, movies(*)').eq('user_id', currentUser.id).order('watched_at', { ascending: false });
    myHistory = hData || [];

    if (partner) {
        const { data: pHist } = await supabaseClient.from('watched').select('*, movies(*)').eq('user_id', partner.id).order('watched_at', { ascending: false });
        partnerHistory = pHist || [];
    }

    updateGlobalUI();
    renderWatchlist();
    if (document.getElementById('network-section').classList.contains('active')) renderProfile(document.getElementById('tab-me').classList.contains('active') ? currentUser.id : partner?.id);
}

function updateGlobalUI() {
    const me = allProfiles.find(p => p.id === currentUser.id);
    const myName = (me && me.name !== "Novo Usuário") ? me.name : "Eu";
    const partnerName = (partner && partner.name !== "Novo Usuário") ? partner.name : "Parceiro";

    const safeSetText = (id, text) => { const el = document.getElementById(id); if(el) el.innerText = text; }
    const safeSetSrc = (id, src) => { const el = document.getElementById(id); if(el) el.src = src; }
    const safeDisplay = (id, show) => { const el = document.getElementById(id); if(el) show ? el.classList.remove('hidden') : el.classList.add('hidden'); }

    safeSetSrc('my-header-avatar', me?.avatar_url || 'assets/img/sem-capa.png');
    safeSetSrc('partner-header-avatar', partner?.avatar_url || 'assets/img/sem-capa.png');
    safeSetText('tab-partner', partnerName);

    let sharedMovies = [];
    if (partner) {
        const myIds = myHistory.map(h => h.movie_id);
        sharedMovies = partnerHistory.filter(h => myIds.includes(h.movie_id));
        safeSetText('home-stat-juntos', sharedMovies.length);
    }

    const sharedMyNotes = myHistory.filter(h => sharedMovies.find(s => s.movie_id === h.movie_id && h.rating !== null));
    const sharedPartnerNotes = partnerHistory.filter(h => sharedMovies.find(s => s.movie_id === h.movie_id && h.rating !== null));

    if (sharedMyNotes.length > 0) {
        const sumMe = sharedMyNotes.reduce((acc, h) => acc + parseFloat(h.rating), 0);
        const sumPartner = sharedPartnerNotes.reduce((acc, h) => acc + parseFloat(h.rating), 0);
        const totalRatings = sharedMyNotes.length + sharedPartnerNotes.length;
        
        safeSetText('home-stat-media', ((sumMe + sumPartner) / totalRatings).toFixed(1));

        const genres = sharedMyNotes.map(h => h.movies.genre).filter(g => g && g !== "Variado");
        safeSetText('home-stat-genre', genres.length ? genres.sort((a,b) => genres.filter(v => v===a).length - genres.filter(v => v===b).length).pop() : "Variado");

        const mediaMe = sumMe / sharedMyNotes.length;
        const mediaPa = sharedPartnerNotes.length > 0 ? (sumPartner / sharedPartnerNotes.length) : mediaMe; 
        
        let critName = "-", critMedia = "-", critImg = "assets/img/sem-capa.png";
        if (mediaMe < mediaPa) { critName = myName; critMedia = mediaMe.toFixed(1); critImg = me?.avatar_url; } 
        else if (mediaPa < mediaMe) { critName = partnerName; critMedia = mediaPa.toFixed(1); critImg = partner?.avatar_url; } 
        else { critName = "Empate"; critMedia = mediaMe.toFixed(1); }
        safeSetText('crit-name', critName); safeSetText('crit-media', `Média: ${critMedia}`); safeSetSrc('crit-avatar', critImg || 'assets/img/sem-capa.png');

        // TRETA (Base 10)
        let maxDiff = -1; let tretaMovie = null; let notasTreta = "";
        sharedMovies.forEach(s => {
            const mN = sharedMyNotes.find(x => x.movie_id === s.movie_id)?.rating;
            const pN = sharedPartnerNotes.find(x => x.movie_id === s.movie_id)?.rating;
            if (mN && pN) {
                const diff = Math.abs(mN - pN);
                if (diff > maxDiff) { 
                    maxDiff = diff; 
                    tretaMovie = s.movies.title; 
                    // Agora ele usa o nome real da pessoa em vez de "Ela"
                    notasTreta = `Você: ⭐${mN} | ${partnerName}: ⭐${pN}`; 
                }
            }
        });

        const boxTreta = document.getElementById('treta-container');
        if (boxTreta) {
            boxTreta.style.background = maxDiff >= 3 ? 'rgba(255, 59, 48, 0.1)' : (maxDiff > 1 ? 'rgba(255, 159, 10, 0.1)' : 'rgba(52, 199, 89, 0.1)');
            boxTreta.style.borderColor = maxDiff >= 3 ? 'rgba(255, 59, 48, 0.3)' : (maxDiff > 1 ? 'rgba(255, 159, 10, 0.3)' : 'rgba(52, 199, 89, 0.3)');
            safeSetText('treta-emoji', maxDiff >= 3 ? '🥊' : (maxDiff > 1 ? '⚠️' : '🕊️'));
            safeSetText('treta-label', maxDiff >= 3 ? 'Guerra Mundial' : (maxDiff > 1 ? 'Divergência' : 'Sintonia'));
            
            if (maxDiff > 1.0) { safeSetText('treta-movie', tretaMovie); safeSetText('treta-notas', notasTreta); } 
            else { safeSetText('treta-movie', "Paz e Amor"); safeSetText('treta-notas', "Sintonia perfeita nas notas!"); }
        }

        // SINCRONIA (Base 10)
        let totalDiff = 0; let countDiff = 0;
        sharedMovies.forEach(s => {
            const mN = sharedMyNotes.find(x => x.movie_id === s.movie_id)?.rating;
            const pN = sharedPartnerNotes.find(x => x.movie_id === s.movie_id)?.rating;
            if(mN && pN) { totalDiff += Math.abs(mN - pN); countDiff++; }
        });
        if(countDiff > 0) {
            const avgDiff = totalDiff / countDiff;
            const syncPerc = Math.max(0, Math.min(100, Math.round(100 - (avgDiff / 9 * 100)))); // Base 9 pq 10-1
            const syncFill = document.getElementById('sync-fill');
            if(syncFill) syncFill.style.width = `${syncPerc}%`;
            let syncMsg = "";
            if(syncPerc > 85) syncMsg = `${syncPerc}% - Almas Gêmeas 💖`;
            else if (syncPerc > 60) syncMsg = `${syncPerc}% - Dão pro gasto 🍿`;
            else syncMsg = `${syncPerc}% - Guerra no Sofá 🥊`;
            safeSetText('sync-text', syncMsg);
        }
    } else {
        safeSetText('home-stat-media', "0.0"); safeSetText('home-stat-genre', "-"); safeSetText('crit-name', "Ainda não");
    }

    const pending = myHistory.find(h => h.rating === null);
    if (pending) {
        safeDisplay('ticket-btns', false); safeDisplay('btn-share-wa', false); safeDisplay('pending-rating-box', true);
        safeSetText('ticket-title', pending.movies.title); safeSetSrc('ticket-poster', pending.movies.poster_url); safeSetText('ticket-date', "Avaliação Pendente");
        pendingRatingId = pending.id; currentTicketMovie = null;
    } else {
        safeDisplay('ticket-btns', true); safeDisplay('pending-rating-box', false); pendingRatingId = null;
        if (currentTicketMovie) {
            safeSetText('ticket-title', currentTicketMovie.title); safeSetSrc('ticket-poster', currentTicketMovie.poster_url);
            safeSetText('ticket-date', `Sessão de Hoje`);
            document.getElementById('dynamic-bg').style.backgroundImage = `url('${currentTicketMovie.poster_url}')`;
            
            // Troca os botões
            safeDisplay('btn-choose-movie', false);
            safeDisplay('btn-concluir-sessao', true);
            safeDisplay('btn-cancel-sessao', true);
            safeDisplay('btn-share-wa', true);
            
            const btnShare = document.getElementById('btn-share-wa');
            if(btnShare) {
                btnShare.onclick = () => { haptic(); window.open(`https://wa.me/?text=${encodeURIComponent(`🍿 *Sessão CineCasal!*\n\nFilme marcado: *${currentTicketMovie.title}*\n\nPrepara a pipoca! ❤️`)}`, '_blank'); };
            }
        } else {
            safeSetText('ticket-title', "Nenhum filme escolhido"); safeSetSrc('ticket-poster', "assets/img/sem-capa.png"); safeSetText('ticket-date', "Toque abaixo para começar");
            document.getElementById('dynamic-bg').style.backgroundImage = `url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba')`;
            
            // Volta para o estado inicial
            safeDisplay('btn-choose-movie', true);
            safeDisplay('btn-concluir-sessao', false);
            safeDisplay('btn-cancel-sessao', false);
            safeDisplay('btn-share-wa', false);
        }
    }
}

// HEADER BLUR E PULL TO REFRESH
function setupHeaderBlur() {
    window.addEventListener('scroll', () => {
        const header = document.getElementById('main-header');
        if(window.scrollY > 20) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    });
}

function setupPullToRefresh() {
    let startY = 0; const ptr = document.getElementById('ptr-indicator');
    document.body.addEventListener('touchstart', e => { if(window.scrollY === 0) startY = e.touches[0].clientY; }, {passive:true});
    document.body.addEventListener('touchmove', e => {
        if(window.scrollY === 0 && startY > 0) {
            const pull = e.touches[0].clientY - startY;
            if(pull > 20 && pull < 100) { ptr.classList.add('active'); ptr.style.transform = `translateY(${pull/2}px)`; }
        }
    }, {passive:true});
    document.body.addEventListener('touchend', async e => {
        if(ptr.classList.contains('active')) {
            haptic(); ptr.classList.add('spinning');
            await loadData(); // Recarrega os dados
            ptr.style.transform = `translateY(-20px)`; ptr.classList.remove('active', 'spinning');
        }
        startY = 0;
    });
}

// === GESTOS DE ABAS E MODAIS ===
function setupSwipeGestures() {
    let startX = 0; let endX = 0; const zone = document.getElementById('swipe-zone');
    const tabs = ['agenda-section', 'watchlist-section', 'network-section'];
    zone.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, {passive: true});
    zone.addEventListener('touchend', e => {
        if(document.querySelector('.overlay:not(.hidden)')) return; 
        endX = e.changedTouches[0].screenX;
        const activeTab = document.querySelector('.t-item.active').getAttribute('data-target');
        let idx = tabs.indexOf(activeTab);
        if (endX < startX - 70 && idx < 2) document.querySelector(`.t-item[data-target="${tabs[idx+1]}"]`).click();
        if (endX > startX + 70 && idx > 0) document.querySelector(`.t-item[data-target="${tabs[idx-1]}"]`).click();
    }, {passive: true});
}

// === GESTOS DE ABAS E MODAIS ===
function setupGlobalModals() {
    // Abrir gaveta (e garantir que ela não venha "caída")
    window.openModal = (id) => {
        haptic();
        const m = document.getElementById(id);
        const sheet = m.querySelector('.swipeable-sheet');
        if (sheet) sheet.style.transform = ''; // Reseta a posição arrastada antes de abrir
        m.classList.remove('hidden');
        setTimeout(() => { if (sheet) sheet.classList.add('open'); }, 10);
    };

    // Fechar todas as gavetas (e limpar o rastro do arraste)
    window.closeModals = () => {
        haptic();
        document.querySelectorAll('.swipeable-sheet').forEach(sheet => {
            sheet.classList.remove('open');
            setTimeout(() => { 
                sheet.parentElement.classList.add('hidden'); 
                sheet.style.transform = ''; // Devolve a gaveta pro topo para o próximo uso
            }, 300);
        });
    };

    // NOVIDADE: Fechar clicando fora da gaveta (no fundo escuro)
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // Verifica se o clique foi EXATAMENTE no fundo preto, e não dentro da gaveta
            if (e.target === overlay) {
                closeModals();
            }
        });
    });

    // Swipe para fechar gavetas (Mobile Drag Corrigido)
    document.querySelectorAll('.drag-handle').forEach(handle => {
        let sy = 0;
        const sheet = handle.parentElement; // Pega a gaveta inteira
        
        handle.addEventListener('touchstart', e => sy = e.touches[0].clientY, {passive:true});
        handle.addEventListener('touchmove', e => {
            const pull = e.touches[0].clientY - sy;
            if(pull > 0) sheet.style.transform = `translateY(${pull}px)`;
        }, {passive:true});
        handle.addEventListener('touchend', e => {
            const pull = e.changedTouches[0].clientY - sy;
            if(pull > 100) {
                closeModals(); // Puxou bastante para baixo, fecha!
            } else {
                sheet.style.transform = ''; // Desistiu de puxar, volta pro lugar
            }
        });
    });

    // Botões do Perfil
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.onclick = async () => { haptic(); await supabaseClient.auth.signOut(); window.location.href = 'index.html'; };

    const btnEdit = document.getElementById('btn-edit-trigger');
    if (btnEdit) {
        btnEdit.onclick = () => {
            const me = allProfiles.find(x => x.id === currentUser.id);
            document.getElementById('edit-name').value = me?.name !== "Novo Usuário" ? me?.name : "";
            document.getElementById('edit-bio').value = me?.bio || "";
            openModal('modal-edit');
        };
    }

    const btnSaveProfile = document.getElementById('btn-save-profile');
    if (btnSaveProfile) {
        btnSaveProfile.onclick = async () => {
            setBtnLoading('btn-save-profile', true);
            const name = document.getElementById('edit-name').value || "Sem Nome";
            const bio = document.getElementById('edit-bio').value;
            const fileInput = document.getElementById('edit-avatar-file');
            let avatarUrl = allProfiles.find(x => x.id === currentUser.id)?.avatar_url;

            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileName = `${currentUser.id}-${Math.random()}.${file.name.split('.').pop()}`;
                const { error } = await supabaseClient.storage.from('avatars').upload(fileName, file);
                if (!error) avatarUrl = supabaseClient.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
            }

            await supabaseClient.from('profiles').update({ name, bio, avatar_url: avatarUrl }).eq('id', currentUser.id);
            setBtnLoading('btn-save-profile', false);
            closeModals(); loadData(); showToast("Perfil atualizado! ✨");
        };
    }
}

// === TICKET E AVALIAÇÃO (NOTA 10) ===
// === ANIMAÇÃO DO INGRESSO RASGANDO (DE VOLTA!) ===
function runTearAnimation(callback) {
    const originalPoster = document.getElementById('ticket-poster');
    if (!originalPoster) { if (callback) callback(); return; }

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
    clone.offsetHeight; // Força renderização
    clone.classList.add('tear-and-fall');
    
    setTimeout(() => {
        clone.remove();
        originalPoster.style.opacity = '1';
        originalPoster.src = 'assets/img/sem-capa.png';
        if (callback) callback();
    }, 1200); 
}

// === AÇÕES DO NOVO INGRESSO ===
function setupTicketActions() {
    
    // Botão Principal: Abre a pergunta "Como vamos escolher?"
    const btnChoose = document.getElementById('btn-choose-movie');
    if (btnChoose) {
        btnChoose.onclick = () => { haptic(); openModal('modal-choose-mode'); };
    }

    // Opção 1: Sortear da Lista (Antiga Roleta)
    const btnModeRoleta = document.getElementById('btn-mode-roleta');
    if (btnModeRoleta) {
        btnModeRoleta.onclick = () => {
            haptic(); closeModals();
            if (watchlist.length === 0) return setTimeout(() => showToast("A Lista está vazia!"), 400);
            
            const finalItem = watchlist[Math.floor(Math.random() * watchlist.length)];
            const m = finalItem.movies;

            // INICIA O MODO WALKOUT
            document.getElementById('modal-walkout').classList.remove('hidden');
            const inner = document.getElementById('walkout-card-inner');
            inner.classList.remove('flip');
            document.getElementById('walkout-glow').style.opacity = '1';
            
            document.getElementById('walkout-genre').classList.add('hidden');
            document.getElementById('walkout-year').classList.add('hidden');
            document.getElementById('walkout-title').classList.add('hidden');
            
            document.getElementById('walkout-genre').innerText = m.genre || "Variado";
            document.getElementById('walkout-year').innerText = "VEM AÍ...";
            document.getElementById('walkout-poster').src = m.poster_url;
            document.getElementById('walkout-title').innerText = m.title;

            // Suspense Fase 1 (Gênero)
            setTimeout(() => { haptic(); document.getElementById('walkout-genre').classList.remove('hidden'); }, 1500);
            // Suspense Fase 2 (Ano/Texto)
            setTimeout(() => { haptic(); document.getElementById('walkout-year').classList.remove('hidden'); }, 3000);
            // Fase 3 (O Flip da Carta!)
            setTimeout(() => { 
                haptic(); navigator.vibrate([100, 50, 100]); // Super vibração
                inner.classList.add('flip'); 
                document.getElementById('walkout-glow').style.background = '#007aff';
                setTimeout(() => document.getElementById('walkout-title').classList.remove('hidden'), 500);
            }, 4500);

            // Salva no banco e fecha
            setTimeout(async () => {
                const prev = watchlist.find(w => w.scheduled_date !== null);
                if(prev) await supabaseClient.from('watchlist').update({ scheduled_date: null }).eq('id', prev.id);
                const today = new Date().toISOString().split('T')[0];
                await supabaseClient.from('watchlist').update({ scheduled_date: today }).eq('id', finalItem.id);
                
                document.getElementById('modal-walkout').classList.add('hidden');
                loadData(); showToast("Filme Escolhido! 🍿");
            }, 8000);
        };
    }

    // Opção 2: Pesquisar Filme Agora
    const btnModeSearch = document.getElementById('btn-mode-search');
    if (btnModeSearch) {
        btnModeSearch.onclick = () => {
            haptic(); closeModals();
            setTimeout(() => { openModal('modal-ticket-search'); document.getElementById('ticket-search-input').focus(); }, 300);
        };
    }

    // Motor de Busca Específico do Ingresso
    const tInput = document.getElementById('ticket-search-input');
    const tFlyout = document.getElementById('ticket-search-results');
    let tTimer;
    if (tInput) {
        tInput.addEventListener('input', async (e) => {
            clearTimeout(tTimer); const q = e.target.value.trim();
            if (q.length < 3) return tFlyout.classList.add('hidden');

            tTimer = setTimeout(async () => {
                const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(q)}`);
                const data = await res.json();
                tFlyout.innerHTML = '';
                if (data.results.length === 0) return tFlyout.classList.add('hidden');
                tFlyout.classList.remove('hidden');

                data.results.slice(0, 5).forEach(m => {
                    const div = document.createElement('div'); div.className = 'result-item';
                    const imgUrl = m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'assets/img/sem-capa.png';
                    div.innerHTML = `<img src="${imgUrl}" class="res-img" style="width:40px;height:60px;"><div><h4 style="font-size:14px; margin-bottom:4px; font-family:var(--font-title);">${m.title}</h4><small style="opacity:0.6;">${m.release_date ? m.release_date.split('-')[0] : ''}</small></div>`;
                    
                    div.onclick = async () => {
                        haptic(); tFlyout.classList.add('hidden'); tInput.value = ''; closeModals();
                        showToast("Preparando sessão...");
                        
                        const movieDB = await syncMovieWithDB(m);
                        
                        // Limpa sessão anterior
                        const prev = watchlist.find(w => w.scheduled_date !== null);
                        if(prev) await supabaseClient.from('watchlist').update({ scheduled_date: null }).eq('id', prev.id);
                        
                        // Joga o filme escolhido pro ingresso
                        let wItem = watchlist.find(w => w.movie_id === movieDB.id);
                        const today = new Date().toISOString().split('T')[0];
                        
                        if (wItem) {
                            await supabaseClient.from('watchlist').update({ scheduled_date: today }).eq('id', wItem.id);
                        } else {
                            await supabaseClient.from('watchlist').insert({ movie_id: movieDB.id, added_by: currentUser.id, scheduled_date: today });
                        }
                        
                        loadData(); showToast("Filme pronto pra sessão! 🎬");
                    };
                    tFlyout.appendChild(div);
                });
            }, 500);
        });
    }

    // Botão de Concluir a Sessão (Antigo Check)
    const btnConcluir = document.getElementById('btn-concluir-sessao');
    if (btnConcluir) {
        btnConcluir.onclick = async () => {
            haptic();
            if (!currentTicketMovie) return showToast("Nenhum filme escolhido!");
            if (!partner) return showToast("Parceiro não encontrado!");

            const processCheck = async () => {
                const { data: meEx } = await supabaseClient.from('watched').select('id').eq('user_id', currentUser.id).eq('movie_id', currentTicketMovie.id).single();
                if (!meEx) await supabaseClient.from('watched').insert({ user_id: currentUser.id, movie_id: currentTicketMovie.id, rating: null });

                const { data: paEx } = await supabaseClient.from('watched').select('id').eq('user_id', partner.id).eq('movie_id', currentTicketMovie.id).single();
                if (!paEx) await supabaseClient.from('watched').insert({ user_id: partner.id, movie_id: currentTicketMovie.id, rating: null });

                await supabaseClient.from('watchlist').delete().eq('movie_id', currentTicketMovie.id);
                currentTicketMovie = null; loadData(); showToast("Foi pro histórico! ⭐");
            };

            runTearAnimation(processCheck);
        };
    }
    
    // Botão de Cancelar a Escolha
    const btnCancel = document.getElementById('btn-cancel-sessao');
    if (btnCancel) {
        btnCancel.onclick = async () => {
            haptic();
            const prev = watchlist.find(w => w.scheduled_date !== null);
            if(prev) {
                await supabaseClient.from('watchlist').update({ scheduled_date: null }).eq('id', prev.id);
                loadData(); showToast("Sessão cancelada.");
            }
        };
    }

    // Lógica das Notas (Intocada)
    const btnOpenRating = document.getElementById('btn-open-rating');
    if (btnOpenRating) {
        btnOpenRating.onclick = () => {
            haptic();
            let p = myHistory.find(h => h.id === pendingRatingId);
            if (!p) p = myHistory.find(h => h.rating === null);
            if (p) { pendingRatingId = p.id; document.getElementById('rating-movie-title').innerText = p.movies.title; openModal('modal-rating'); } 
            else { showToast("Erro: Nenhum filme pendente."); }
        };
    }

    const btnSaveRating = document.getElementById('btn-save-rating');
    if (btnSaveRating) {
        btnSaveRating.onclick = async () => {
            haptic();
            const nota = parseFloat(document.getElementById('input-rating').value);
            if (isNaN(nota) || nota < 1 || nota > 10) return showToast("A nota deve ser de 1 a 10!");
            
            // MAGIA: EXPLOSÃO DE CONFETES SE A NOTA FOR 10
            if (nota === 10) {
                haptic(); navigator.vibrate([100, 50, 200]);
                confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FFA500', '#FFF'] });
            }
            
            const originalText = btnSaveRating.innerText; btnSaveRating.innerText = "Salvando no banco..."; btnSaveRating.disabled = true;
            const { error } = await supabaseClient.from('watched').update({ rating: nota }).eq('id', pendingRatingId);
            btnSaveRating.innerText = originalText; btnSaveRating.disabled = false;

            if (error) return showToast("Erro no banco: A nota foi bloqueada.");
            closeModals(); document.getElementById('input-rating').value = ''; pendingRatingId = null; loadData(); showToast("Nota salva com sucesso! 🏆");
        };
    }
}

// === BUSCA ===
function setupSearchAndActionSheet() {
    const input = document.getElementById('search-movie');
    const flyout = document.getElementById('search-results');
    let timer;

    input.addEventListener('input', async (e) => {
        clearTimeout(timer); const q = e.target.value.trim();
        if (q.length < 3) return flyout.classList.add('hidden');

        timer = setTimeout(async () => {
            const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(q)}`);
            const data = await res.json();
            flyout.innerHTML = '';
            if (data.results.length === 0) return flyout.classList.add('hidden');
            flyout.classList.remove('hidden');

            data.results.slice(0, 5).forEach(m => {
                const div = document.createElement('div'); div.className = 'result-item';
                const imgUrl = m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : 'assets/img/sem-capa.png';
                div.innerHTML = `<img src="${imgUrl}" class="res-img" style="width:40px;height:60px;"><div><h4 style="font-size:14px; margin-bottom:4px;">${m.title}</h4><small style="opacity:0.6;">${m.release_date ? m.release_date.split('-')[0] : ''}</small></div>`;
                div.onclick = () => {
                    haptic(); selectedMovie = m;
                    document.getElementById('sheet-title').innerText = m.title;
                    openModal('modal-action'); flyout.classList.add('hidden'); input.value = ''; 
                };
                flyout.appendChild(div);
            });
        }, 500);
    });

    document.getElementById('opt-watchlist').onclick = async () => {
        if(!selectedMovie) return;
        const m = await syncMovieWithDB(selectedMovie);
        const { error } = await supabaseClient.from('watchlist').insert({ movie_id: m.id, added_by: currentUser.id });
        if(error) showToast("Filme já está na lista!"); else showToast("Adicionado à Lista! 🎥");
        closeModals(); loadData();
    };

    document.getElementById('opt-history').onclick = async () => {
        if(!selectedMovie) return;
        const m = await syncMovieWithDB(selectedMovie);
        const { data: ex } = await supabaseClient.from('watched').select('id').eq('user_id', currentUser.id).eq('movie_id', m.id).single();
        if(!ex) await supabaseClient.from('watched').insert({ user_id: currentUser.id, movie_id: m.id, rating: null });
        closeModals(); loadData(); showToast("Adicionado ao Histórico!");
    };
}

// === DETALHES TMDB E SKELETON ===
async function openMovieDetails(tmdbId) {
    openModal('modal-movie-details');
    // Mostra Skeleton, esconde conteudo real
    document.getElementById('detail-skeleton').classList.remove('hidden');
    document.getElementById('detail-content').classList.add('hidden');

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

        const streamBox = document.getElementById('streaming-box');
        const streamIcons = document.getElementById('streaming-icons');
        streamBox.classList.add('hidden'); streamIcons.innerHTML = '';
        const provRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`);
        const provData = await provRes.json();
        const brProviders = provData.results?.BR?.flatrate;
        if (brProviders && brProviders.length > 0) {
            streamBox.classList.remove('hidden');
            brProviders.forEach(p => { streamIcons.innerHTML += `<img src="https://image.tmdb.org/t/p/w92${p.logo_path}" class="prov-icon">`; });
        }

        // Esconde Skeleton, mostra conteúdo
        setTimeout(() => {
            document.getElementById('detail-skeleton').classList.add('hidden');
            document.getElementById('detail-content').classList.remove('hidden');
        }, 300); // pequeno delay para suavidade
    } catch(e) {}

// CÓDIGO DO CAMALEÃO (EXTRAI A COR DO PÔSTER)
        const imgEl = document.getElementById('detail-poster');
        imgEl.crossOrigin = "Anonymous";
        imgEl.onload = () => {
            try {
                const colorThief = new ColorThief();
                const color = colorThief.getColor(imgEl);
                document.documentElement.style.setProperty('--chameleon-color', `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`);
            } catch(e) { document.documentElement.style.setProperty('--chameleon-color', `#007aff`); }
        };
        imgEl.src = movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'assets/img/sem-capa.png';

        // ONDE ASSISTIR + DEEP LINKS MÁGICOS
        const streamBox = document.getElementById('streaming-box');
        const streamIcons = document.getElementById('streaming-icons');
        streamBox.classList.add('hidden'); streamIcons.innerHTML = '';
        const provRes = await fetch(`https://api.themoviedb.org/3/movie/${tmdbId}/watch/providers?api_key=${TMDB_API_KEY}`);
        const provData = await provRes.json();
        const brProviders = provData.results?.BR?.flatrate;
        
        if (brProviders && brProviders.length > 0) {
            streamBox.classList.remove('hidden');
            brProviders.forEach(p => { 
                // Esquema de Deep Links para abrir direto nos Apps (Netflix, Prime, Disney)
                let link = provData.results.BR.link; // Link padrão do JustWatch
                if(p.provider_id === 8) link = `nflx://`; 
                if(p.provider_id === 119) link = `primevideo://`;
                if(p.provider_id === 337) link = `disneyplus://`;
                
                streamIcons.innerHTML += `<a href="${link}" target="_blank"><img src="https://image.tmdb.org/t/p/w92${p.logo_path}" class="prov-icon"></a>`; 
            });
        }

}

// === BUSCA FILME SURPRESA E BOTÃO ADICIONAR ===
async function fetchSurpriseSuggestion() {
    try {
        const page = Math.floor(Math.random() * 10) + 1;
        const res = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=pt-BR&sort_by=popularity.desc&vote_average.gte=7.5&vote_count.gte=1000&page=${page}`);
        const data = await res.json();
        const blockList = [...myHistory.map(h => h.movies.tmdb_id), ...partnerHistory.map(h => h.movies.tmdb_id), ...watchlist.map(w => w.movies.tmdb_id)];
        const joia = data.results.find(m => !blockList.includes(m.id));
        if(joia) {
            window.surpriseMovieId = joia.id;
            window.surpriseMovieData = joia; // Guarda o objeto do filme na memória
            document.getElementById('sug-title').innerText = joia.title;
            document.getElementById('sug-rating').innerText = joia.vote_average.toFixed(1);
            document.getElementById('sug-poster').src = `https://image.tmdb.org/t/p/w92${joia.poster_path}`;
        } else { 
            document.getElementById('suggestion-box').classList.add('hidden'); 
        }
    } catch(e) {}
}

// Ação do botão ➕ na Surpresa
const btnAddSurprise = document.getElementById('btn-add-surprise');
if (btnAddSurprise) {
    btnAddSurprise.onclick = async (e) => {
        e.stopPropagation(); // Mágica: Impede o clique de "vazar" pro card e abrir os detalhes
        haptic();
        
        if (!window.surpriseMovieData) return;
        
        btnAddSurprise.innerText = "⏳";
        btnAddSurprise.disabled = true;
        
        // Salva o filme no banco de dados
        const m = await syncMovieWithDB(window.surpriseMovieData);
        const { error } = await supabaseClient.from('watchlist').insert({ movie_id: m.id, added_by: currentUser.id });
        
        btnAddSurprise.innerText = "➕";
        btnAddSurprise.disabled = false;

        if (error) {
            showToast("Filme já está na lista!");
        } else {
            showToast("Adicionado à Lista! 🍿");
            loadData(); // Atualiza a aba Lista no fundo
            fetchSurpriseSuggestion(); // Já sorteia uma NOVA surpresa instantaneamente!
        }
    };
}

// === TILT 3D, LONG PRESS, EMPTY STATES ===
function renderWatchlist() {
    const grid = document.getElementById('watchlist-grid');
    grid.innerHTML = '';
    
    // EMPTY STATE
    if(watchlist.length === 0) {
        document.getElementById('watchlist-empty').classList.remove('hidden');
    } else {
        document.getElementById('watchlist-empty').classList.add('hidden');
        watchlist.forEach(w => {
            const div = document.createElement('div');
            div.className = 'movie-card';
            
            const adder = allProfiles.find(p => p.id === w.added_by);
            const avatarImg = adder?.avatar_url ? `<img src="${adder.avatar_url}" class="added-by-badge">` : '';

            div.innerHTML = `${avatarImg}<img src="${w.movies.poster_url}">`;
            
            // Clica para abrir detalhes
            div.onclick = () => openMovieDetails(w.movies.tmdb_id);
            
            // LONG PRESS PARA APAGAR
            let pressTimer;
            div.addEventListener('touchstart', e => {
                pressTimer = setTimeout(() => { haptic(); longPressItemToDelete = w.id; openModal('modal-delete'); }, 800);
            }, {passive:true});
            div.addEventListener('touchend', () => clearTimeout(pressTimer));
            div.addEventListener('touchmove', () => clearTimeout(pressTimer));

            grid.appendChild(div);
        });
        
        // Ativa o Tilt 3D
        VanillaTilt.init(document.querySelectorAll(".movie-card"), { max: 15, speed: 400, glare: true, "max-glare": 0.2 });
    }
}

document.getElementById('btn-confirm-delete').onclick = async () => {
    if(longPressItemToDelete) {
        await supabaseClient.from('watchlist').delete().eq('id', longPressItemToDelete);
        closeModals(); loadData(); showToast("Filme apagado! 🗑️");
        longPressItemToDelete = null;
    }
};

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
    
    const counts = {};
    rated.forEach(h => { const g = h.movies.genre; if(g && g !== "Variado") counts[g] = (counts[g]||0) + 1; });
    if (Object.keys(counts).length) document.getElementById('stat-genre').innerText = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    else document.getElementById('stat-genre').innerText = "-";

    const ctx = document.getElementById('genreRadarChart').getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();
    const labels = Object.keys(counts).slice(0, 5);
    const dataVals = Object.values(counts).slice(0, 5);

    if(labels.length > 2) {
        document.getElementById('genreRadarChart').style.display = 'block';
        radarChartInstance = new Chart(ctx, {
            type: 'radar',
            data: { labels: labels, datasets: [{ data: dataVals, backgroundColor: 'rgba(0, 122, 255, 0.2)', borderColor: 'rgba(0, 122, 255, 1)', pointBackgroundColor: '#fff', borderWidth: 2 }] },
            options: { plugins: { legend: { display: false } }, maintainAspectRatio: false }
        });
    } else document.getElementById('genreRadarChart').style.display = 'none';

    const tl = document.getElementById('history-timeline'); tl.innerHTML = '';
    hist.forEach(h => {
        const div = document.createElement('div'); div.className = 'h-item'; div.setAttribute('data-bg', h.movies.poster_url);
        div.onclick = () => openMovieDetails(h.movies.tmdb_id);
        const notaText = h.rating ? `⭐ ${h.rating}` : `<span style="color:#ff9f0a">Pendente</span>`;
        div.innerHTML = `<img src="${h.movies.poster_url}" class="h-poster"><div><h4 style="font-size:14px; margin-bottom:5px; font-family: var(--font-title);">${h.movies.title}</h4><span style="font-size:12px; opacity:0.6;">Nota: ${notaText}</span></div>`;
        tl.appendChild(div);
    });

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => { if(e.isIntersecting) document.getElementById('dynamic-bg').style.backgroundImage = `url('${e.target.getAttribute('data-bg')}')`; });
    }, { threshold: 0.7 });
    document.querySelectorAll('.h-item').forEach(i => obs.observe(i));

    const gridAll = document.getElementById('all-watched-grid'); gridAll.innerHTML = '';
    hist.forEach(h => {
        const div = document.createElement('div'); div.className = 'movie-card';
        div.onclick = () => openMovieDetails(h.movies.tmdb_id); div.innerHTML = `<img src="${h.movies.poster_url}">`;
        gridAll.appendChild(div);
    });

    // ==========================================
    // INÍCIO DA PARTE 3.2 (HALL DA FAMA E CADEADO)
    // ==========================================
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let bestMovie = null; let bestScore = -1;

    const listShared = document.getElementById('shared-movies-list'); listShared.innerHTML = '';
    let sharedCount = 0;
    
    if (partner) {
        const myIds = myHistory.map(x => x.movie_id);
        const shared = partnerHistory.filter(x => myIds.includes(x.movie_id));
        sharedCount = shared.length;
        const paName = partner.name && partner.name !== "Novo Usuário" ? partner.name : "Parceiro";

        shared.forEach(s => {
            const m = s.movies;
            const myNoteObj = myHistory.find(x => x.movie_id === m.id);
            const paNoteObj = partnerHistory.find(x => x.movie_id === m.id);
            const myNote = myNoteObj?.rating;
            const paNote = paNoteObj?.rating;
            
            // LÓGICA DA AVALIAÇÃO CEGA (ANTI-INFLUÊNCIA)
            let myDisplay = myNote ? `⭐ ${myNote}` : 'Pendente';
            let paDisplay = paNote ? `⭐ ${paNote}` : 'Pendente';

            // Se eu NÃO avaliei, mas ela JÁ avaliou, oculta a nota dela com o cadeado pra mim!
            if (!myNote && paNote) {
                paDisplay = '<span class="blind-lock">🔒 Oculto</span>';
            }

            const div = document.createElement('div'); div.className = 'shared-item'; div.onclick = () => openMovieDetails(m.tmdb_id);
            div.innerHTML = `<img src="${m.poster_url}" class="shared-poster"><div style="flex:1;"><h4 style="font-family: var(--font-title);">${m.title}</h4><div class="shared-notes"><div><small>Você</small><b>${myDisplay}</b></div><div><small>${paName}</small><b>${paDisplay}</b></div></div></div>`;
            listShared.appendChild(div);

            // CÁLCULO DO HALL DA FAMA
            if (myNote && paNote) {
                const watchDate = new Date(myNoteObj.watched_at);
                if (watchDate.getMonth() === currentMonth && watchDate.getFullYear() === currentYear) {
                    const sum = parseFloat(myNote) + parseFloat(paNote);
                    if (sum > bestScore) { bestScore = sum; bestMovie = m; }
                }
            }
        });
    }

    // EXIBE O HALL DA FAMA NO TOPO DA REDE
    const hallEl = document.getElementById('hall-da-fama');
    if (bestMovie) {
        if(hallEl) hallEl.classList.remove('hidden');
        document.getElementById('hall-title').innerText = bestMovie.title;
        document.getElementById('hall-notas').innerText = `Soma das notas: ⭐ ${bestScore.toFixed(1)} / 20`;
        document.getElementById('hall-poster').src = bestMovie.poster_url;
    } else { 
        if(hallEl) hallEl.classList.add('hidden'); 
    }

    // TELA VAZIA SE NÃO TIVER FILMES EM COMUM
    if(sharedCount === 0) document.getElementById('shared-empty').classList.remove('hidden');
    else document.getElementById('shared-empty').classList.add('hidden');
    
    // TILT 3D NAS CAPAS DA GRID
    VanillaTilt.init(document.querySelectorAll(".movie-card"), { max: 15, speed: 400 });
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

async function syncMovieWithDB(m) {
    const { data } = await supabaseClient.from('movies').select('*').eq('tmdb_id', m.id).single();
    if (data) return data;
    const genreMap = { 28:"Ação", 35:"Comédia", 10749:"Romance", 27:"Terror", 18:"Drama", 878:"Ficção", 16:"Animação", 9648:"Mistério" };
    const { data: n } = await supabaseClient.from('movies').insert({ tmdb_id: m.id, title: m.title, poster_url: `https://image.tmdb.org/t/p/w500${m.poster_path}`, genre: (m.genre_ids ? genreMap[m.genre_ids[0]] || "Variado" : "Variado") }).select().single();
    return n;
}

function setupNavigation() {
    document.querySelectorAll('.t-item').forEach(btn => {
        btn.onclick = () => {
            haptic();
            document.querySelectorAll('.t-item').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.view-section').forEach(v => { v.classList.remove('active'); v.classList.add('hidden'); });
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            const targetEl = document.getElementById(target);
            targetEl.classList.add('active'); targetEl.classList.remove('hidden'); 
            if (target === 'network-section') renderProfile(document.getElementById('tab-me').classList.contains('active') ? currentUser.id : partner?.id);
        };
    });
    document.getElementById('tab-me').onclick = (e) => { haptic(); e.target.classList.add('active'); document.getElementById('tab-partner').classList.remove('active'); renderProfile(currentUser.id); };
    document.getElementById('tab-partner').onclick = (e) => { haptic(); e.target.classList.add('active'); document.getElementById('tab-me').classList.remove('active'); renderProfile(partner?.id); };
}

init();
