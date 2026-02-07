# MailVeil Architecture

## Overview

MailVeil is a single-user web application that provides a management interface for Cloudflare Email Routing. It acts as a proxy between the browser and the Cloudflare REST API, ensuring that API credentials are never exposed to the client.

```
Browser ──► Next.js Middleware (JWT verification, Edge Runtime)
                    │
                    ▼
            Pages / API Route Handlers
                    │
                    ▼
            lib/cloudflare.ts (server-only, cfFetch)
                    │
                    ▼
            Cloudflare REST API (api.cloudflare.com/client/v4)
```

## Authentication Flow

### Login

```
1. Browser          GET /api/auth/pin-length
2. Browser          ◄── { length: 6 }
3. Browser          POST /api/auth/login  { pin: "000000" }
4. Server           verifyPin(pin) — constant-time comparison
5. Server           createToken() — jose SignJWT, HS256, 24h expiry
6. Server           ◄── Set-Cookie: auth-token=<JWT>; HttpOnly; SameSite=Lax
7. Browser          redirect to /
```

### Request Authentication (dual-layer)

**Layer 1 — Edge Middleware** (`middleware.ts`):
- Runs on every request matching the route matcher
- Skips public paths: `/login`, `/api/auth/login`, `/api/auth/pin-length`
- Verifies JWT from `auth-token` cookie using `jose.jwtVerify()`
- Redirects to `/login` on failure and deletes the invalid cookie

**Layer 2 — Route Handler Guard** (`lib/api-auth.ts`):
- `requireAuth()` is called at the start of every API route handler
- Returns `401 Unauthorized` if the token is missing or invalid
- Defense-in-depth: protects against middleware bypass scenarios

### Why Two Layers?

Middleware can potentially be bypassed through misconfigured matchers or edge cases. The route handler guard ensures that even if middleware is skipped, the API endpoints remain protected.

## Cloudflare API Client

### Design (`lib/cloudflare.ts`)

The client module uses the `server-only` package to ensure it cannot be imported from client components. All functions use a generic `cfFetch<T>()` helper:

```typescript
async function cfFetch<T>(path: string, options?: RequestInit): Promise<CloudflareResponse<T>>
```

- Prepends `https://api.cloudflare.com/client/v4` to the path
- Injects `Authorization: Bearer <token>` header
- Parses response and throws on `success: false`
- Returns fully typed `CloudflareResponse<T>`

### API Endpoints Used

| Operation | Method | Cloudflare Endpoint |
|---|---|---|
| List Rules | GET | `/zones/{zone_id}/email/routing/rules` |
| Create Rule | POST | `/zones/{zone_id}/email/routing/rules` |
| Get Rule | GET | `/zones/{zone_id}/email/routing/rules/{id}` |
| Update Rule | PUT | `/zones/{zone_id}/email/routing/rules/{id}` |
| Delete Rule | DELETE | `/zones/{zone_id}/email/routing/rules/{id}` |
| Get Catch-All | GET | `/zones/{zone_id}/email/routing/rules/catch_all` |
| Update Catch-All | PUT | `/zones/{zone_id}/email/routing/rules/catch_all` |
| List Destinations | GET | `/accounts/{account_id}/email/routing/addresses` |
| Create Destination | POST | `/accounts/{account_id}/email/routing/addresses` |
| Delete Destination | DELETE | `/accounts/{account_id}/email/routing/addresses/{id}` |
| Get Settings | GET | `/zones/{zone_id}/email/routing` |
| Enable Routing | POST | `/zones/{zone_id}/email/routing/enable` |
| Disable Routing | POST | `/zones/{zone_id}/email/routing/disable` |

## Email Generation System

### Categories (`lib/words.ts`)

7 categories, each with 30 curated English words:

| Category | Emoji | Example Words |
|---|---|---|
| Shopping | 🛒 | cart, deal, shop, store, order, gift, brand... |
| Social | 💬 | chat, feed, post, like, share, group, friend... |
| Finance | 💰 | bank, cash, coin, fund, loan, pay, wallet... |
| Gaming | 🎮 | game, play, quest, hero, level, boss, raid... |
| Dev | 💻 | code, git, bug, api, node, app, deploy... |
| Newsletter | 📰 | news, read, daily, digest, brief, pulse... |
| General | ✨ | star, moon, sun, wind, rain, wave, peak... |

### Generation Logic (`lib/generator.ts`)

```
generateEmail(categoryId, domain)
  → Pick 2 random distinct words from the category
  → Return "word1.word2@domain"
  → Example: "cart.deal@example.com"

generateRuleName(categoryName, word1, word2)
  → Return "CategoryName: word1.word2"
  → Example: "Shopping: cart.deal"
```

Users can regenerate until they find a combination they like, or switch to manual input mode.

## Routing Architecture

### Route Groups

- `(dashboard)/` — Route group for all authenticated pages. Shares a common layout with sidebar and header.
- `login/` — Standalone page outside the dashboard group.
- `api/auth/` — Authentication endpoints (no Cloudflare API interaction).
- `api/cloudflare/` — Proxy endpoints to Cloudflare API (all require auth).

### API Route Handlers

All handlers in `api/cloudflare/` follow the same pattern:

```typescript
export async function GET() {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await cloudflareFunction();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
```

Dynamic route parameters use the Next.js 16 async params pattern:

```typescript
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## UI Architecture

### Layout Structure

```
RootLayout (ThemeProvider, Toaster)
├── LoginPage (standalone, no sidebar)
└── DashboardLayout (Sidebar + Header)
    ├── DashboardPage (stats, recent rules)
    ├── RulesPage (table/card list)
    ├── NewRulePage (generator form)
    ├── DestinationsPage (table/card list)
    └── SettingsPage (toggles, catch-all config)
```

### Responsive Behavior

| Breakpoint | Sidebar | Navigation |
|---|---|---|
| Desktop (md+) | Fixed 256px sidebar | Always visible |
| Mobile (<md) | Hidden | Sheet drawer via hamburger menu |

The `useIsMobile()` hook detects viewport width against a 768px breakpoint. Pages that show tables on desktop switch to card-based layouts on mobile (Rules, Destinations).

### Theme System

- `next-themes` with `attribute="class"` and `defaultTheme="system"`
- Tailwind CSS v4 `@custom-variant dark (&:is(.dark *))` for dark mode
- shadcn/ui theme variables defined in `globals.css` (`:root` for light, `.dark` for dark)
- Toggle in Header via DropdownMenu (Light / Dark / System)

### Component Library

shadcn/ui components (New York style, neutral base color):

Button, Card, Input, Badge, Dialog, Table, Select, Switch, Tabs, Separator, Skeleton, DropdownMenu, Sheet, Sonner (toast), Label

## Docker Build

### Multi-stage Build

```dockerfile
# Stage 1: Install dependencies
FROM node:24-alpine AS deps
# npm ci --ignore-scripts

# Stage 2: Build application
FROM node:24-alpine AS builder
# npm run build (produces .next/standalone)

# Stage 3: Production runner
FROM node:24-alpine AS runner
# Copy standalone output, run as non-root user
```

### Output

Next.js `output: "standalone"` generates a self-contained `server.js` at `.next/standalone/` that includes only the necessary `node_modules`. The final Docker image contains:

- `/app/server.js` — Node.js server
- `/app/.next/static/` — Static assets
- `/app/public/` — Public files

Runs as non-root user `nextjs` (uid 1001) on port 3000.

## Type System

### Cloudflare API Types (`types/cloudflare.ts`)

```typescript
CloudflareResponse<T>    // Wrapper: { success, errors, messages, result: T }
EmailRoutingRule          // Rule with matchers, actions, enabled state
RuleMatcher               // { type: "literal", field: "to", value: string }
RuleAction                // { type: "forward" | "drop", value: string[] }
CatchAllRule              // Special rule with "all" matcher
Destination               // Email address with verification status
EmailRoutingSettings      // Routing enabled/disabled status
CreateRuleRequest         // POST body for rule creation
UpdateRuleRequest         // PUT body for rule update
```

## Data Flow Examples

### Creating a Rule

```
1. User selects category "Shopping" on /rules/new
2. generateEmail("shopping", "example.com") → "cart.deal@example.com"
3. User clicks "Create Rule"
4. POST /api/cloudflare/rules
   Body: {
     name: "Shopping: cart.deal",
     enabled: true,
     matchers: [{ type: "literal", field: "to", value: "cart.deal@example.com" }],
     actions: [{ type: "forward", value: ["user@gmail.com"] }]
   }
5. Route handler → requireAuth() → createRule(body) → Cloudflare API
6. Success → toast notification → redirect to /rules
```

### Toggling a Rule

```
1. User clicks Switch on Rules page
2. PUT /api/cloudflare/rules/{id}
   Body: { ...existingRule, enabled: !currentState }
3. Route handler → requireAuth() → updateRule(id, body) → Cloudflare API
4. Success → optimistic UI update → toast notification
```
