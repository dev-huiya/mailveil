**[English](README.md)** | **[한국어](README.ko.md)**

# MailVeil

Cloudflare Email Routing management UI for creating and managing virtual email addresses with category-based word generation.

Instead of manually creating routing rules through the Cloudflare dashboard, MailVeil provides a clean, responsive web interface to generate disposable email aliases, manage forwarding rules, and control destination addresses — all from a single-user self-hosted app.

## Features

- **Category-based email generation** — Generate `word1.word2@yourdomain.com` addresses from 7 themed categories (Shopping, Social, Finance, Gaming, Dev, Newsletter, General)
- **Rule management** — Create, enable/disable, search, and delete email routing rules
- **Destination management** — Add, verify, and remove forwarding destination addresses
- **Catch-all control** — Configure catch-all rule behavior (forward or drop)
- **Email Routing settings** — Enable/disable Cloudflare Email Routing
- **PIN authentication** — Numeric PIN login with keyboard input (desktop) and shuffle keypad (mobile)
- **Dark/Light mode** — System-aware theme with manual toggle
- **Responsive design** — Desktop sidebar + mobile sheet drawer navigation
- **Clipboard copy** — One-click copy on all email addresses
- **JSON export** — Export all routing rules as JSON
- **Docker ready** — Multi-stage Dockerfile with standalone output

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ (24 recommended)
- A Cloudflare account with:
  - A domain with [Email Routing](https://developers.cloudflare.com/email-routing/) enabled
  - An [API token](https://dash.cloudflare.com/profile/api-tokens) with Email Routing edit permissions
  - Your Zone ID and Account ID (found on the domain overview page)

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/mailveil.git
cd mailveil
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
AUTH_PIN=000000                          # Login PIN (any length)
CF_API_TOKEN=your-cloudflare-api-token   # Cloudflare API token
CF_ZONE_ID=your-zone-id                 # Cloudflare Zone ID
CF_ACCOUNT_ID=your-account-id           # Cloudflare Account ID
NEXT_PUBLIC_EMAIL_DOMAIN=example.com     # Your email domain
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enter your PIN to login.

### 5. Production build

```bash
npm run build
npm start
```

## Docker Deployment

### Docker Compose (recommended)

```bash
# Create .env file first (see step 3 above)
docker compose up -d
```

### Docker manual build

```bash
docker build -t mailveil .
docker run -d -p 3000:3000 --env-file .env mailveil
```

The app will be available at `http://localhost:3000`.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_PIN` | Yes | Numeric PIN for login authentication. Can be any length — the UI adapts automatically. |
| `CF_API_TOKEN` | Yes | Cloudflare API token with Email Routing edit permissions. |
| `CF_ZONE_ID` | Yes | Cloudflare Zone ID — identifies which domain's email routing rules to manage. |
| `CF_ACCOUNT_ID` | Yes | Cloudflare Account ID — identifies which account's destination addresses to manage. |
| `NEXT_PUBLIC_EMAIL_DOMAIN` | Yes | The email domain for generated addresses (e.g., `example.com`). |
| `JWT_SECRET` | No | JWT signing key. **Auto-generated on every startup if not set.** Set this only if you want sessions to survive server restarts. |

> **Why are all three Cloudflare values needed?**
>
> The API token only handles *authentication* (proving who you are). It doesn't specify *which* zone or account to operate on. Cloudflare's API requires the Zone ID and Account ID in the URL path:
> - **Zone ID** — Used for rule and routing operations: `/zones/{zone_id}/email/routing/rules`
> - **Account ID** — Used for destination address operations: `/accounts/{account_id}/email/routing/addresses`
>
> Without these IDs, the API calls will fail.

### Getting Cloudflare Credentials

All three values can be found in the Cloudflare dashboard:

1. **API Token**
   - Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click **Create Token** > **Custom Token**
   - Add the permissions listed below and save

2. **Zone ID & Account ID**
   - Go to your domain in the Cloudflare dashboard
   - Open the **Overview** page
   - Both IDs are in the right sidebar under the **API** section

### Cloudflare API Token Permissions

Create a Custom API Token with the following permissions:

| Permission | Access |
|---|---|
| Zone > Email Routing Rules | Edit |
| Account > Email Routing Addresses | Edit |

Zone Resources: Include > Specific zone > your domain.

## Tech Stack

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org/) 16 | React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Type safety |
| [Tailwind CSS](https://tailwindcss.com/) v4 | Styling |
| [shadcn/ui](https://ui.shadcn.com/) | UI components |
| [jose](https://github.com/panva/jose) | JWT sign/verify (Edge-compatible) |
| [next-themes](https://github.com/pacocoursey/next-themes) | Dark/Light mode |
| [sonner](https://sonner.emilkowal.dev/) | Toast notifications |
| [Lucide React](https://lucide.dev/) | Icons |

## Project Structure

```
mailveil/
├── middleware.ts                        # JWT auth middleware (Edge Runtime)
├── next.config.ts                       # Next.js config (standalone output)
├── Dockerfile                           # Multi-stage Docker build
├── docker-compose.yml
├── .env.example
└── src/
    ├── app/
    │   ├── layout.tsx                   # Root layout (ThemeProvider, Toaster)
    │   ├── globals.css                  # Tailwind v4 + shadcn theme variables
    │   ├── login/page.tsx               # PIN login page
    │   ├── (dashboard)/
    │   │   ├── layout.tsx               # Sidebar + Header layout
    │   │   ├── page.tsx                 # Dashboard (stats, recent rules)
    │   │   ├── rules/page.tsx           # Rules list (table, search, toggle)
    │   │   ├── rules/new/page.tsx       # Email generator + rule creation
    │   │   ├── destinations/page.tsx    # Destination address management
    │   │   └── settings/page.tsx        # Email Routing & Catch-all settings
    │   └── api/
    │       ├── auth/                    # login, logout, verify, pin-length
    │       └── cloudflare/              # rules, destinations, catch-all, settings
    ├── components/
    │   ├── ui/                          # shadcn/ui components
    │   ├── layout/                      # Sidebar, Header, MobileNav
    │   ├── login/                       # PinInput, ShuffleKeypad
    │   ├── email-generator/             # CategorySelector, EmailPreview, GeneratorForm
    │   └── theme-provider.tsx
    ├── lib/
    │   ├── auth.ts                      # JWT + PIN verification (server-only)
    │   ├── api-auth.ts                  # Route handler auth guard
    │   ├── cloudflare.ts                # Cloudflare API client (server-only)
    │   ├── words.ts                     # Category word lists (7 categories x 30 words)
    │   ├── generator.ts                 # Email generation logic
    │   └── utils.ts                     # cn(), formatDate(), copyToClipboard()
    ├── hooks/
    │   └── use-mobile.ts                # Mobile breakpoint detection
    └── types/
        ├── cloudflare.ts                # Cloudflare API response types
        └── index.ts
```

## Security

- **PIN authentication** with constant-time comparison to prevent timing attacks
- **JWT tokens** (HS256, 24h expiry) stored in httpOnly cookies
- **Dual-layer auth**: Edge Middleware + Route Handler guards (`requireAuth()`)
- **Server-only modules**: Cloudflare API credentials never reach the client
- **No API key exposure**: All Cloudflare API calls happen server-side

## License

[MIT](LICENSE)
