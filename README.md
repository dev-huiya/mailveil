**[English](README.md)** | **[한국어](README.ko.md)**

<div align="center">

# MailVeil

**Self-hosted virtual email management UI for Cloudflare Email Routing**

Generate disposable `word.word@yourdomain.com` aliases, manage forwarding rules,
and control destination addresses — without ever touching the Cloudflare dashboard.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed?logo=docker&logoColor=white)](#quick-start)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Features

| | Feature | Description |
|---|---|---|
| **Alias Generator** | Category-based email creation | Pick from 8 themed categories and get `word.word@domain` aliases instantly |
| **Rules** | Full CRUD + toggle | Create, search, rename, enable/disable, export (JSON), and delete routing rules |
| **Forwarding** | Destination management | Add, verify, set default, and remove forwarding inboxes |
| **Catch-All** | Wildcard control | Forward or drop emails sent to unregistered addresses |
| **Settings** | Routing toggle | Enable/disable Cloudflare Email Routing for your domain |
| **Auth** | PIN login | Desktop keyboard input + mobile shuffle keypad for anti-shoulder-surfing |
| **i18n** | Multi-language | English & Korean with browser-detected auto-selection |
| **Theme** | Dark / Light / System | Smooth toggle, persisted across sessions |
| **PWA** | Installable web app | Add to home screen for a native-like experience |
| **Responsive** | Mobile-first | Desktop sidebar + mobile sheet drawer navigation |

### Categories

> `word.word@yourdomain.com` — two random words from the selected category.

| | Category | Example |
|---|---|---|
| :lock: | Privacy | `cloak.phantom@` |
| :shopping_cart: | Shopping | `cart.deal@` |
| :speech_balloon: | Social | `chat.tribe@` |
| :moneybag: | Finance | `vault.ledger@` |
| :video_game: | Gaming | `quest.arena@` |
| :computer: | Dev | `git.deploy@` |
| :newspaper: | Newsletter | `digest.pulse@` |
| :sparkles: | General | `ember.jade@` |

---

## Quick Start

### Prerequisites

- A Cloudflare account with [Email Routing](https://developers.cloudflare.com/email-routing/) enabled on your domain
- An [API token](#cloudflare-api-token-permissions) with Email Routing edit permissions
- Your **Zone ID** and **Account ID** ([where to find them](#getting-cloudflare-credentials))
- [Docker](https://www.docker.com/) (recommended) **or** [Node.js](https://nodejs.org/) 20+

### 1. Clone & configure

```bash
git clone https://github.com/your-username/mailveil.git
cd mailveil
cp .env.example .env
```

Edit `.env`:

```env
AUTH_PIN=000000                          # Login PIN (any length)
CF_API_TOKEN=your-cloudflare-api-token   # Cloudflare API token
CF_ZONE_ID=your-zone-id                 # Cloudflare Zone ID
CF_ACCOUNT_ID=your-account-id           # Cloudflare Account ID
NEXT_PUBLIC_EMAIL_DOMAIN=example.com     # Your email domain
```

### 2. Run with Docker (recommended)

```bash
docker compose up -d
```

Open **http://localhost:3000** and enter your PIN.

That's it. The image builds automatically on first run.

<details>
<summary>Docker without Compose</summary>

```bash
docker build -t mailveil .
docker run -d -p 3000:3000 --env-file .env mailveil
```

</details>

<details>
<summary>Run without Docker (Node.js)</summary>

```bash
pnpm install
pnpm build
pnpm start
```

Requires Node.js 20+ (24 recommended).

</details>

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_PIN` | Yes | Numeric PIN for login. Any length — the UI adapts automatically. |
| `CF_API_TOKEN` | Yes | Cloudflare API token with Email Routing edit permissions. |
| `CF_ZONE_ID` | Yes | Cloudflare Zone ID — which domain's routing rules to manage. |
| `CF_ACCOUNT_ID` | Yes | Cloudflare Account ID — which account's destination addresses to manage. |
| `NEXT_PUBLIC_EMAIL_DOMAIN` | Yes | The email domain for generated aliases (e.g., `example.com`). |
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
