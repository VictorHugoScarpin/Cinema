// api/tmdb.js
// Vercel Serverless Function — roda no servidor, nunca no navegador.
// A chave do TMDB fica só aqui, lida de uma variável de ambiente.
// O front-end chama /api/tmdb?path=...&outrosParametros=... em vez de
// chamar api.themoviedb.org diretamente com a chave exposta.

export default async function handler(req, res) {
    const TMDB_API_KEY = process.env.TMDB_API_KEY;

    if (!TMDB_API_KEY) {
        return res.status(500).json({ error: 'TMDB_API_KEY não configurada no servidor.' });
    }

    const { path, ...params } = req.query;

    if (!path) {
        return res.status(400).json({ error: 'Parâmetro "path" é obrigatório. Ex: search/movie' });
    }

    // Trava simples pra evitar uso do proxy como proxy genérico pra qualquer host
    const safePath = String(path).replace(/^\/+/, '');

    const url = new URL(`https://api.themoviedb.org/3/${safePath}`);
    url.searchParams.set('api_key', TMDB_API_KEY);

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
    }

    try {
        const tmdbRes = await fetch(url.toString());
        const data = await tmdbRes.json();
        // Cache leve de borda pra aliviar a cota da API em buscas repetidas
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
        return res.status(tmdbRes.status).json(data);
    } catch (err) {
        return res.status(502).json({ error: 'Falha ao consultar o TMDB.' });
    }
}
