**[English](README.md)** | **[한국어](README.ko.md)**

<div align="center">

# MailVeil

**Self-hosted virtual email management UI for Cloudflare Email Routing**

Generate disposable `word.word@yourdomain.com` aliases, manage forwarding rules,
and control destination addresses — without ever touching the Cloudflare dashboard.

[![GitHub](https://img.shields.io/badge/GitHub-repo-181717?logo=github&logoColor=white)](https://github.com/dev-huiya/mailveil)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/docker/pulls/huiya/mailveil?logo=docker&logoColor=white)](https://hub.docker.com/r/huiya/mailveil)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---


## About

MailVeil does not provide an email service.  
Instead, it is a web UI designed to make managing **your existing domain and Cloudflare Email Routing** more convenient.  

Cloudflare Email Routing is powerful, but it's cumbersome to create and manage disposable addresses.  
MailVeil was created to reduce this inconvenience.

You can quickly and easily generate disposable addresses through automatic recommendations.  
Simply choose one from the recommended addresses.

Email does not pass through MailVeil.  
We do not store, read, or relay it.  
All email is delivered directly via Cloudflare.

🔗 **Live Demo:** https://mailveil-demo.huiya.me  
(PIN: `123456`, read-only / stored data is temporary)

## What MailVeil Is (and Is Not)
- ✅ It is a tool for **users who directly own a domain**.
- ✅ It assumes you are using Cloudflare Email Routing.
- ❌ It does not provide its own email servers or relay services.
- ❌ It does not store or process email content.
MailVeil is not email infrastructure; it is an **interface for managing email routing**.

## Features

- **Random Alias generator** — 8 theme categories → Automatically recommends disposable addresses like `word.word@example.com` instantly
- **Rule management** — Create, search, rename, toggle, export (JSON), delete
- **Forwarding inboxes** — Add, verify, set default, remove destination addresses
- **Catch-all & routing** — Forward/drop unregistered addresses, enable/disable Email Routing
- **PIN auth** — Keyboard input (desktop) + shuffle keypad (mobile)
- **Dark/Light/System theme** · **English/Korean i18n** · **PWA** · **Responsive**

### Categories

| | Category | Example |
|---|---|---|
| :lock: | Privacy | `cloak.phantom@example.com` |
| :shopping_cart: | Shopping | `cart.deal@example.com` |
| :speech_balloon: | Social | `chat.tribe@example.com` |
| :moneybag: | Finance | `vault.ledger@example.com` |
| :video_game: | Gaming | `quest.arena@example.com` |
| :computer: | Dev | `git.deploy@example.com` |
| :newspaper: | Newsletter | `digest.pulse@example.com` |
| :sparkles: | General | `ember.jade@example.com` |

---

## Quick Start

### Prerequisites

- A Cloudflare account with [Email Routing](https://developers.cloudflare.com/email-routing/) enabled on your domain
- An [API token](#cloudflare-api-token-permissions) with Email Routing edit permissions
- Your **Zone ID** and **Account ID** ([where to find them](#getting-cloudflare-credentials))
- [Docker](https://www.docker.com/) (recommended) — no build required

Create a `.env` file:

```env
AUTH_PIN=000000                          # Login PIN (any length)
CF_API_TOKEN=your-cloudflare-api-token   # Cloudflare API token
CF_ZONE_ID=your-zone-id                 # Cloudflare Zone ID
CF_ACCOUNT_ID=your-account-id           # Cloudflare Account ID
EMAIL_DOMAIN=example.com                # Email domain
```

Run:

```bash
docker run -d -p 3000:3000 --env-file .env --restart unless-stopped huiya/mailveil
```

Open **http://localhost:3000** and enter your PIN. That's it.

<details>
<summary>Using Docker Compose</summary>

```yaml
# docker-compose.yml
services:
  mailveil:
    image: huiya/mailveil:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

```bash
docker compose up -d
```

</details>

<details>
<summary>Build from source (Node.js 20+)</summary>

```bash
git clone https://github.com/huiya/mailveil.git
cd mailveil
cp .env.example .env
# edit .env (see above)

pnpm install
pnpm build
pnpm start
```

</details>

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_PIN` | Yes | Numeric PIN for login. Any length — the UI adapts automatically. |
| `CF_API_TOKEN` | Yes | Cloudflare API token with Email Routing edit permissions. |
| `CF_ZONE_ID` | Yes | Cloudflare Zone ID — which domain's routing rules to manage. |
| `CF_ACCOUNT_ID` | Yes | Cloudflare Account ID — which account's destination addresses to manage. |
| `EMAIL_DOMAIN` | Yes | The email domain for generated aliases (e.g., `example.com`). |
| `JWT_SECRET` | No | JWT signing key. **Auto-generated on startup if not set.** Set this to persist login sessions across container restarts. |

<details>
<summary><b>Why are three Cloudflare values needed?</b></summary>

The API token only handles *authentication* (proving who you are). It doesn't specify *which* zone or account to target. Cloudflare's REST API requires IDs in the URL path:

- **Zone ID** — Rule & routing operations: `/zones/{zone_id}/email/routing/rules`
- **Account ID** — Destination address operations: `/accounts/{account_id}/email/routing/addresses`

Without these IDs, API calls will fail.

</details>

---

## Cloudflare Setup

### Getting Cloudflare Credentials

All three values are in the Cloudflare dashboard:

1. **API Token** — [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   → **Create Token** → **Custom Token** → add the permissions below

2. **Zone ID & Account ID** — select your domain → **Overview** page → right sidebar **API** section

### Cloudflare API Token Permissions

| Permission | Access |
|---|---|
| Zone > Email Routing Rules | Edit |
| Account > Email Routing Addresses | Edit |

Zone Resources: **Include** → **Specific zone** → *your domain*.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org/) 16 | React framework (App Router, standalone output) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components (Radix primitives) |
| [jose](https://github.com/panva/jose) | JWT sign/verify (Edge-compatible) |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/Light mode |
| [sonner](https://sonner.emilkowal.dev/) | Toast notifications |
| [Lucide React](https://lucide.dev/) | Icons |

## Project Structure

```
mailveil/
├── middleware.ts                        # JWT auth middleware (Edge Runtime)
├── next.config.ts                       # Next.js config (standalone, security headers)
├── Dockerfile                           # Multi-stage Docker build (Node 24 Alpine)
├── docker-compose.yml
├── .env.example
└── src/
    ├── app/
    │   ├── layout.tsx                   # Root layout (ThemeProvider, Toaster, PWA)
    │   ├── globals.css                  # Tailwind v4 + shadcn theme + safe-area
    │   ├── login/page.tsx               # PIN login (keyboard + shuffle keypad)
    │   ├── (dashboard)/
    │   │   ├── layout.tsx               # Sidebar + Header (responsive)
    │   │   ├── page.tsx                 # Dashboard (stats → filtered rules)
    │   │   ├── rules/page.tsx           # Rules list (table, search, filter, toggle)
    │   │   ├── rules/new/page.tsx       # Alias generator + rule creation
    │   │   ├── destinations/page.tsx    # Forwarding inbox management
    │   │   └── settings/page.tsx        # Email Routing & Catch-all
    │   └── api/
    │       ├── auth/                    # login, logout, verify, pin-length
    │       └── cloudflare/              # rules, destinations, catch-all, settings
    ├── components/
    │   ├── ui/                          # shadcn/ui primitives
    │   ├── layout/                      # Sidebar, Header, MobileNav
    │   ├── login/                       # PinInput, ShuffleKeypad
    │   └── email-generator/             # CategorySelector, EmailPreview, GeneratorForm
    ├── lib/
    │   ├── auth.ts                      # JWT + PIN (server-only, jose)
    │   ├── api-auth.ts                  # Route handler auth guard
    │   ├── cloudflare.ts                # CF API client (server-only)
    │   ├── rate-limit.ts                # Login rate limiter (in-memory)
    │   ├── validation.ts                # Input validation (email, ID, rule)
    │   ├── words.ts                     # 8 categories × 50+ words each
    │   ├── generator.ts                 # Alias generation logic
    │   ├── i18n/                        # Translations (en, ko)
    │   └── utils.ts                     # cn(), formatDate(), copyToClipboard()
    ├── hooks/                           # use-rules, use-i18n, use-mobile
    └── types/                           # Cloudflare API response types
```

## Security

| Layer | Detail |
|---|---|
| **Rate limiting** | Login: 5 attempts / IP / 15 min (HTTP 429) |
| **PIN auth** | Constant-time comparison (timing-attack safe) |
| **JWT** | HS256, 24 h expiry, `httpOnly` + `SameSite=Strict` cookie |
| **Dual-layer auth** | Edge Middleware + Route Handler guard (`requireAuth()`) |
| **Security headers** | CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **Input validation** | Email format, rule structure, ID format on all API routes |
| **Error sanitization** | CF API errors server-side only; generic messages to client |
| **Server-only modules** | API credentials never reach the browser |
| **Non-root Docker** | Runs as UID 1001 (`nextjs` user) |

## License

[MIT](LICENSE)
