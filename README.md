# 🎬 CineCasal

**O app de cinema particular de um casal.** Agenda de sessões, watchlist compartilhada, avaliações, estatísticas de sincronia e um modo "curtir/recusar" pra descobrir filmes juntos — tudo num PWA leve, sem anúncio, sem conta de terceiro, só vocês dois.

> Projeto pessoal. Não é um produto público — é a versão de cinema privado de um casal, feita sob medida.

---

## ✨ Funcionalidades

### Sessão & agenda
- Ticket de cinema estilizado com o filme da próxima sessão (poster, costura pontilhada, tudo)
- Escolher filme manualmente, pesquisar no TMDB, ou sortear da watchlist
- Convite rápido por WhatsApp quando o filme é escolhido
- Onde Assistir com deep link direto pro app (Netflix, Prime Video, Disney+) quando instalado
- Trailer oficial embutido no modal de detalhes do filme

### Descubra Juntos (modo Tinder de filmes)
- Curtam filmes cada um no seu tempo, entrando e saindo quando quiser
- Quando os dois curtem o mesmo filme, é **match** — cai direto na watchlist, com confete
- Detecção de match funciona mesmo se vocês não estiverem no modo ao mesmo tempo (tempo real via Supabase Realtime)

### Estatísticas do casal
- **Sincronia de Casal**: % de afinidade de nota entre os dois
- **Selo de exigência**: compara a média de nota de vocês com a média do TMDB pros mesmos filmes
- **Evolução das Notas**: gráfico de linha com o histórico de avaliação de cada um ao longo do tempo
- **Arquivo de Tretas**: ranking histórico das maiores discordâncias de nota
- **Resumo do Mês**: total assistido, nota média, gênero do mês, filme nota mais alta em comum
- **Filme do Mês**: destaque pro filme com maior soma de notas do mês

### Tempo real
- Indicador de "parceiro online" no header
- Aviso quando o parceiro adiciona um filme ou avalia uma sessão, sem precisar dar refresh

### Outros detalhes
- Editar nota até 5 dias após assistir
- Aviso sutil na Home quando faz tempo sem sessão marcada
- Sugestão "Surpresa" ponderada pelo gênero que o casal mais bem avalia
- PWA instalável, tema escuro, sem rastreamento

---

## 🛠 Stack

| Camada | Tecnologia |
|---|---|
| Front-end | HTML + CSS + JavaScript puro (sem framework), bundlado com [Vite](https://vitejs.dev) |
| Dados & Auth | [Supabase](https://supabase.com) (Postgres + Auth + Realtime) |
| Catálogo de filmes | [TMDB API](https://www.themoviedb.org/documentation/api) |
| Deploy | [Vercel](https://vercel.com) (build estático + Serverless Function) |
| Gráficos | [Chart.js](https://www.chartjs.org) |

---

## 📁 Estrutura do projeto

```
cinecasal/
├── api/
│   └── tmdb.js            # Proxy serverless — a chave do TMDB nunca chega no navegador
├── public/
│   └── assets/img/        # Imagens estáticas (ícones, placeholders)
├── src/
│   ├── css/                # style.css (login) e dashboard.css
│   └── js/
│       ├── icons.js         # Biblioteca de ícones SVG do app
│       ├── supabase.js      # Cliente Supabase (lê credenciais do .env)
│       ├── auth.js          # Login / sessão
│       └── dashboard.js     # Toda a lógica do app
├── index.html               # Tela de login
├── dashboard.html            # App principal
├── manifest.json              # Configuração PWA
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## 🚀 Rodando localmente

Pré-requisitos: Node.js 18+, uma conta no [Supabase](https://supabase.com) e uma chave de API do [TMDB](https://www.themoviedb.org/settings/api).

```bash
npm install
cp .env.example .env   # preencha com suas chaves
npm run dev
```

## 🔐 Variáveis de ambiente

| Variável | Onde é usada | Visível no navegador? |
|---|---|---|
| `VITE_SUPABASE_URL` | Cliente Supabase | Sim (por design — protegido por RLS) |
| `VITE_SUPABASE_ANON_KEY` | Cliente Supabase | Sim (por design — protegido por RLS) |
| `TMDB_API_KEY` | `api/tmdb.js` (serverless) | **Não** — fica só no servidor |

## ☁️ Deploy na Vercel

1. Suba o repositório no GitHub (o `.env` já está no `.gitignore` — nunca é commitado).
2. Importe o projeto em [vercel.com/new](https://vercel.com/new).
3. Em **Settings → Environment Variables** (ou já na tela de import), cadastre as três variáveis acima.
4. Deploy. A Vercel builda com Vite e publica `api/tmdb.js` como Serverless Function automaticamente.

Não é necessário configurar GitHub Actions nem GitHub Secrets — a build acontece inteiramente do lado da Vercel.

---

## 🗄 Banco de dados

Schema resumido (Postgres via Supabase):

- `profiles` — nome, bio e avatar de cada pessoa
- `movies` — cache local dos filmes já buscados no TMDB
- `watchlist` — fila de filmes pra assistir, com data agendada opcional
- `watched` — histórico de sessões assistidas, nota, review e data
- `tinder_matches` — curtidas/recusas do modo Descubra Juntos

Todas as tabelas usam Row Level Security — cada casal só enxerga os próprios dados.

Correção de precisão da nota disponível em [`supabase/fix_rating_precision.sql`](./supabase/fix_rating_precision.sql).

---

## 🧭 Roadmap

- [ ] Notificações push (PWA) quando o parceiro interage com algo
- [ ] Badges/conquistas de casal
- [ ] Fluxo de convite pra outro casal usar o app sem precisar mexer direto no Supabase

---

## 📄 Licença

Distribuído sob a licença **GPLv3** — veja [`LICENSE`](./LICENSE).

---

Feito com carinho (e algumas tretas de nota) por Victor Hugo Scarpin Xavier.
