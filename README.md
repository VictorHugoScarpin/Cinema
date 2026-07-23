# CineCasal

## O que mudou nessa reformulação (fase 1)

1. **Chaves seguras**
   - A chave do TMDB saiu do JS do navegador. Agora vive só no servidor, dentro de `api/tmdb.js` (Vercel Serverless Function), lida de `process.env.TMDB_API_KEY`. O front-end chama `/api/tmdb?path=...` em vez de `api.themoviedb.org` direto.
   - A URL e a anon key do Supabase saíram do código e agora vêm de `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, configuradas em `.env` (local) e nas Environment Variables da Vercel (produção).
   - **Importante:** como essas chaves já estavam no código enviado, o ideal é gerar uma chave nova do TMDB (https://www.themoviedb.org/settings/api) e revisar as políticas de RLS do Supabase, já que a antiga já esteve exposta.

2. **Estrutura organizada**, pronta pra rodar com Vite e deployar direto na Vercel:
   ```
   cinecasal/
     api/tmdb.js          # proxy seguro do TMDB
     src/css/             # style.css (login) e dashboard.css
     src/js/              # supabase.js, auth.js, dashboard.js
     index.html            # login
     dashboard.html
     vite.config.js
     vercel.json
     .env.example
   ```

3. **Toque visual inicial**: adicionei um token de cor dourada (`--accent`) usado nas abas ativas, pra puxar mais pra "cinema premium" e menos genérico. O visual mais profundo (layout, cards, animações) fica pra próxima etapa — prefiro fazer isso conversando com vocês sobre referências, do que redesenhar tudo de uma vez e arriscar quebrar coisa que já funciona bem (as gestures de swipe, o parallax, o chart, etc. Vi que tem bastante coisa boa ali).

## Rodando localmente

```bash
npm install
cp .env.example .env   # preencha com suas chaves reais
npm run dev
```

## Deploy na Vercel

1. Suba esse repositório no GitHub (sem o `.env`, ele já está no `.gitignore`).
2. Importe o repo na Vercel (vercel.com/new).
3. Em **Project Settings > Environment Variables**, cadastre:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `TMDB_API_KEY`
4. Deploy. A Vercel builda com Vite e sobe `api/tmdb.js` como function automaticamente.

Repare que **isso não usa GitHub Secrets** — como o deploy é feito pela integração Vercel↔GitHub, as variáveis ficam no painel da Vercel, não no repositório. GitHub Secrets só entrariam em cena se vocês usassem GitHub Actions pra buildar/deployar manualmente, o que não é necessário aqui.

## Assets

As pastas `assets/img/` (ícones, `sem-capa.png` etc.) não vieram nos arquivos que você me mandou — copie a pasta `assets/` original pra raiz do projeto antes de rodar.

## Próximos passos sugeridos

- Redesenho visual mais a fundo (cores, cards, tipografia) — me manda referências ou posso propor 2-3 direções.
- Novas funcionalidades (o schema já tem `tinder_matches` pronto no banco — dá pra construir uma tela de "curtir/recusar" filmes estilo Tinder, se ainda não existe no app).
- Revisão das políticas de RLS no Supabase pra garantir que cada perfil só edita os próprios dados.
