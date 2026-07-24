<div align="center">

# CineCasal

**A private cinema companion app for couples**

[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Deployment on Vercel](#deployment-on-vercel)
- [Database Schema](#database-schema)
- [Roadmap](#roadmap)
- [License](#license)

---

## Overview

CineCasal is a private cinema application designed for two users. It provides session scheduling, a shared watchlist, rating and review capabilities, compatibility statistics, and a swipe-based discovery mode for finding movies to watch together. The application is delivered as a lightweight PWA, with no advertising and no third-party account requirements.

This is a personal project rather than a public product: a custom-built, private cinema experience designed for a single couple's use.

---

## Features

### Sessions and Scheduling

| Feature | Description |
|---|---|
| Session Ticket | Stylized cinema ticket display for the next scheduled session, including poster artwork |
| Movie Selection | Manual selection, TMDB search, or random draw from the watchlist |
| Quick Invite | WhatsApp invitation generated automatically once a movie is selected |
| Where to Watch | Deep links to installed streaming apps (Netflix, Prime Video, Disney+) |
| Trailer Preview | Official trailer embedded in the movie details modal |

### Discover Together (Swipe Mode)

| Feature | Description |
|---|---|
| Independent Browsing | Each user can like or pass on movies at their own pace |
| Match Detection | A shared like triggers a match, automatically added to the watchlist |
| Asynchronous Matching | Matches are detected in real time via Supabase Realtime, even if both users are not browsing simultaneously |

### Couple Statistics

| Feature | Description |
|---|---|
| Compatibility Score | Percentage-based rating alignment between both users |
| Critic Badge | Comparison of the couple's average rating against TMDB's average for the same titles |
| Rating Evolution | Line chart tracking each user's rating history over time |
| Disagreement Archive | Historical ranking of the largest rating disagreements |
| Monthly Summary | Total watched, average rating, genre of the month, and highest mutually-rated movie |
| Movie of the Month | Highlight for the title with the highest combined rating in a given month |

### Real-Time Features

| Feature | Description |
|---|---|
| Partner Presence | Online indicator for the partner in the application header |
| Live Notifications | Alerts when the partner adds a movie or rates a session, without requiring a page refresh |

### Additional Details

- Ratings can be edited for up to 5 days after watching a session.
- A subtle reminder appears on the home screen when no session has been scheduled recently.
- A "Surprise Me" suggestion is weighted toward the couple's best-rated genres.
- Installable PWA with a dark theme and no tracking.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, and vanilla JavaScript, bundled with Vite |
| Data & Auth | Supabase (Postgres, Auth, Realtime) |
| Movie Catalog | TMDB API |
| Deployment | Vercel (static build with a serverless function) |
| Charts | Chart.js |

---

## Project Structure

```
cinecasal/
├── api/
│   └── tmdb.js            # Serverless proxy — the TMDB key never reaches the browser
├── public/
│   └── assets/img/        # Static assets (icons, placeholders)
├── src/
│   ├── css/                # style.css (login) and dashboard.css
│   └── js/
│       ├── icons.js         # SVG icon library
│       ├── supabase.js      # Supabase client (reads credentials from .env)
│       ├── auth.js          # Login and session handling
│       └── dashboard.js     # Core application logic
├── index.html               # Login screen
├── dashboard.html            # Main application
├── manifest.json              # PWA configuration
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## Running Locally

**Prerequisites:** Node.js 18+, a Supabase account, and a TMDB API key.

```bash
npm install
cp .env.example .env   # fill in your credentials
npm run dev
```

---

## Environment Variables

| Variable | Used In | Exposed to Browser |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase client | Yes (by design — protected by RLS) |
| `VITE_SUPABASE_ANON_KEY` | Supabase client | Yes (by design — protected by RLS) |
| `TMDB_API_KEY` | `api/tmdb.js` (serverless) | No — server-side only |

---

## Deployment on Vercel

1. Push the repository to GitHub (`.env` is already listed in `.gitignore` and is never committed).
2. Import the project at vercel.com/new.
3. Register the three environment variables listed above under Settings → Environment Variables (or during import).
4. Deploy. Vercel builds the project with Vite and automatically publishes `api/tmdb.js` as a serverless function.

No GitHub Actions or GitHub Secrets configuration is required — the build process runs entirely on Vercel's side.

---

## Database Schema

Summarized schema (Postgres via Supabase):

| Table | Description |
|---|---|
| `profiles` | Name, bio, and avatar for each user |
| `movies` | Local cache of movies previously fetched from TMDB |
| `watchlist` | Queue of movies to watch, with an optional scheduled date |
| `watched` | History of watched sessions, including rating, review, and date |
| `tinder_matches` | Likes and passes recorded in the Discover Together mode |

All tables use Row Level Security, ensuring each couple can only access their own data.

A rating precision fix is available at `supabase/fix_rating_precision.sql`.

---

## Roadmap

- [ ] Push notifications (PWA) when the partner interacts with the app
- [ ] Couple badges and achievements
- [ ] Invitation flow for other couples to use the app without direct Supabase configuration

---

## License

Distributed under the GPLv3 license. See `LICENSE` for details.

---

<div align="center">

*Developed by Victor Hugo Scarpin Xavier.*

</div>


<div align="center">

# CineCasal

**Um aplicativo particular de cinema para casais**

[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TMDB](https://img.shields.io/badge/TMDB-API-01B4E4?logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![Chart.js](https://img.shields.io/badge/Gr%C3%A1ficos-Chart.js-FF6384?logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)

</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Rodando Localmente](#rodando-localmente)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy na Vercel](#deploy-na-vercel)
- [Esquema do Banco de Dados](#esquema-do-banco-de-dados)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## Visão Geral

O CineCasal é um aplicativo de cinema privado projetado para dois usuários. Ele oferece agendamento de sessões, watchlist compartilhada, avaliações e reviews, estatísticas de compatibilidade e um modo de descoberta por deslizamento (swipe) para encontrar filmes para assistir juntos. A aplicação é entregue como um PWA leve, sem publicidade e sem exigência de contas de terceiros.

Trata-se de um projeto pessoal, não de um produto público: uma experiência de cinema privado, feita sob medida para um casal específico.

---

## Funcionalidades

### Sessões e Agenda

| Funcionalidade | Descrição |
|---|---|
| Ticket de Sessão | Ticket de cinema estilizado exibindo o filme da próxima sessão, incluindo o pôster |
| Seleção de Filme | Seleção manual, pesquisa no TMDB, ou sorteio a partir da watchlist |
| Convite Rápido | Convite via WhatsApp gerado automaticamente após a escolha do filme |
| Onde Assistir | Deep links para apps de streaming instalados (Netflix, Prime Video, Disney+) |
| Trailer | Trailer oficial embutido no modal de detalhes do filme |

### Descubra Juntos (Modo Swipe)

| Funcionalidade | Descrição |
|---|---|
| Navegação Independente | Cada usuário pode curtir ou recusar filmes em seu próprio ritmo |
| Detecção de Match | Uma curtida mútua gera um match, adicionado automaticamente à watchlist |
| Match Assíncrono | Os matches são detectados em tempo real via Supabase Realtime, mesmo que os dois usuários não estejam navegando simultaneamente |

### Estatísticas do Casal

| Funcionalidade | Descrição |
|---|---|
| Sincronia de Casal | Percentual de afinidade de nota entre os dois usuários |
| Selo de Exigência | Comparação da média de notas do casal com a média do TMDB para os mesmos filmes |
| Evolução das Notas | Gráfico de linha com o histórico de avaliações de cada usuário ao longo do tempo |
| Arquivo de Tretas | Ranking histórico das maiores discordâncias de nota |
| Resumo do Mês | Total assistido, nota média, gênero do mês e filme com maior nota em comum |
| Filme do Mês | Destaque para o título com maior soma de notas no período |

### Recursos em Tempo Real

| Funcionalidade | Descrição |
|---|---|
| Presença do Parceiro | Indicador de status online do parceiro no cabeçalho da aplicação |
| Notificações ao Vivo | Aviso quando o parceiro adiciona um filme ou avalia uma sessão, sem necessidade de atualizar a página |

### Outros Detalhes

- As notas podem ser editadas em até 5 dias após a sessão assistida.
- Um aviso discreto é exibido na Home quando faz tempo sem uma sessão agendada.
- A sugestão "Surpresa" é ponderada de acordo com os gêneros mais bem avaliados pelo casal.
- PWA instalável, com tema escuro e sem rastreamento.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | HTML, CSS e JavaScript puro, empacotados com Vite |
| Dados e Autenticação | Supabase (Postgres, Auth, Realtime) |
| Catálogo de Filmes | TMDB API |
| Deploy | Vercel (build estático com função serverless) |
| Gráficos | Chart.js |

---

## Estrutura do Projeto

```
cinecasal/
├── api/
│   └── tmdb.js            # Proxy serverless — a chave do TMDB nunca chega ao navegador
├── public/
│   └── assets/img/        # Imagens estáticas (ícones, placeholders)
├── src/
│   ├── css/                # style.css (login) e dashboard.css
│   └── js/
│       ├── icons.js         # Biblioteca de ícones SVG
│       ├── supabase.js      # Cliente Supabase (lê credenciais do .env)
│       ├── auth.js          # Login e gerenciamento de sessão
│       └── dashboard.js     # Lógica principal da aplicação
├── index.html               # Tela de login
├── dashboard.html            # Aplicação principal
├── manifest.json              # Configuração PWA
├── vite.config.js
├── vercel.json
└── .env.example
```

---

## Rodando Localmente

**Pré-requisitos:** Node.js 18+, uma conta no Supabase e uma chave de API do TMDB.

```bash
npm install
cp .env.example .env   # preencha com suas credenciais
npm run dev
```

---

## Variáveis de Ambiente

| Variável | Utilizada em | Exposta ao Navegador |
|---|---|---|
| `VITE_SUPABASE_URL` | Cliente Supabase | Sim (por design — protegida por RLS) |
| `VITE_SUPABASE_ANON_KEY` | Cliente Supabase | Sim (por design — protegida por RLS) |
| `TMDB_API_KEY` | `api/tmdb.js` (serverless) | Não — utilizada somente no servidor |

---

## Deploy na Vercel

1. Suba o repositório no GitHub (`.env` já está listado no `.gitignore` e nunca é commitado).
2. Importe o projeto em vercel.com/new.
3. Cadastre as três variáveis de ambiente acima em Settings → Environment Variables (ou durante a importação).
4. Realize o deploy. A Vercel realiza o build com Vite e publica `api/tmdb.js` automaticamente como função serverless.

Não é necessário configurar GitHub Actions ou GitHub Secrets — o processo de build ocorre inteiramente do lado da Vercel.

---

## Esquema do Banco de Dados

Esquema resumido (Postgres via Supabase):

| Tabela | Descrição |
|---|---|
| `profiles` | Nome, bio e avatar de cada usuário |
| `movies` | Cache local dos filmes já buscados no TMDB |
| `watchlist` | Fila de filmes a assistir, com data agendada opcional |
| `watched` | Histórico de sessões assistidas, incluindo nota, review e data |
| `tinder_matches` | Curtidas e recusas registradas no modo Descubra Juntos |

Todas as tabelas utilizam Row Level Security, garantindo que cada casal tenha acesso apenas aos próprios dados.

Uma correção de precisão de nota está disponível em `supabase/fix_rating_precision.sql`.

---

## Roadmap

- [ ] Notificações push (PWA) quando o parceiro interage com o aplicativo
- [ ] Badges e conquistas do casal
- [ ] Fluxo de convite para outros casais utilizarem o aplicativo sem configuração direta do Supabase

---

## Licença

Distribuído sob a licença GPLv3. Veja `LICENSE` para mais detalhes.

---

<div align="center">

*Desenvolvido por Victor Hugo Scarpin Xavier.*

</div>
