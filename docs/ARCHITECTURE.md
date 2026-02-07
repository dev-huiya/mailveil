# MailVeil 아키텍처

## 개요

MailVeil은 Cloudflare Email Routing 관리 인터페이스를 제공하는 단일 사용자 웹 애플리케이션입니다. 브라우저와 Cloudflare REST API 사이에서 프록시 역할을 하며, API 인증 정보가 클라이언트에 노출되지 않도록 합니다.

```
브라우저 ──► Next.js 미들웨어 (JWT 검증, Edge Runtime)
                    │
                    ▼
            페이지 / API Route Handler
                    │
                    ▼
            lib/cloudflare.ts (server-only, cfFetch)
                    │
                    ▼
            Cloudflare REST API (api.cloudflare.com/client/v4)
```

## 인증 플로우

### 로그인

```
1. 브라우저          GET /api/auth/pin-length
2. 브라우저          ◄── { length: 6 }
3. 브라우저          POST /api/auth/login  { pin: "000000" }
4. 서버              verifyPin(pin) — 상수 시간 비교
5. 서버              createToken() — jose SignJWT, HS256, 24시간 만료
6. 서버              ◄── Set-Cookie: auth-token=<JWT>; HttpOnly; SameSite=Lax
7. 브라우저          / 로 리다이렉트
```

### 요청 인증 (이중 레이어)

**레이어 1 — Edge 미들웨어** (`middleware.ts`):
- 라우트 매처에 일치하는 모든 요청에서 실행
- 공개 경로 스킵: `/login`, `/api/auth/login`, `/api/auth/pin-length`
- `auth-token` 쿠키의 JWT를 `jose.jwtVerify()`로 검증
- 실패 시 `/login`으로 리다이렉트하고 유효하지 않은 쿠키 삭제

**레이어 2 — Route Handler 가드** (`lib/api-auth.ts`):
- 모든 API Route Handler 시작 부분에서 `requireAuth()` 호출
- 토큰이 없거나 유효하지 않으면 `401 Unauthorized` 반환
- 심층 방어(defense-in-depth): 미들웨어 우회 시나리오 대비

### 왜 이중 레이어인가?

미들웨어는 매처 설정 오류나 엣지 케이스를 통해 우회될 가능성이 있습니다. Route Handler 가드는 미들웨어가 건너뛰어지더라도 API 엔드포인트가 보호되도록 보장합니다.

## Cloudflare API 클라이언트

### 설계 (`lib/cloudflare.ts`)

클라이언트 모듈은 `server-only` 패키지를 사용하여 클라이언트 컴포넌트에서 import할 수 없도록 보호합니다. 모든 함수는 제네릭 `cfFetch<T>()` 헬퍼를 사용합니다:

```typescript
async function cfFetch<T>(path: string, options?: RequestInit): Promise<CloudflareResponse<T>>
```

- `https://api.cloudflare.com/client/v4`를 경로 앞에 붙임
- `Authorization: Bearer <token>` 헤더 주입
- 응답을 파싱하고 `success: false`이면 에러 throw
- 완전히 타입이 지정된 `CloudflareResponse<T>` 반환

### 사용하는 API 엔드포인트

| 작업 | 메서드 | Cloudflare 엔드포인트 |
|---|---|---|
| 규칙 목록 | GET | `/zones/{zone_id}/email/routing/rules` |
| 규칙 생성 | POST | `/zones/{zone_id}/email/routing/rules` |
| 규칙 조회 | GET | `/zones/{zone_id}/email/routing/rules/{id}` |
| 규칙 수정 | PUT | `/zones/{zone_id}/email/routing/rules/{id}` |
| 규칙 삭제 | DELETE | `/zones/{zone_id}/email/routing/rules/{id}` |
| Catch-All 조회 | GET | `/zones/{zone_id}/email/routing/rules/catch_all` |
| Catch-All 수정 | PUT | `/zones/{zone_id}/email/routing/rules/catch_all` |
| 수신 주소 목록 | GET | `/accounts/{account_id}/email/routing/addresses` |
| 수신 주소 생성 | POST | `/accounts/{account_id}/email/routing/addresses` |
| 수신 주소 삭제 | DELETE | `/accounts/{account_id}/email/routing/addresses/{id}` |
| 설정 조회 | GET | `/zones/{zone_id}/email/routing` |
| 라우팅 활성화 | POST | `/zones/{zone_id}/email/routing/enable` |
| 라우팅 비활성화 | POST | `/zones/{zone_id}/email/routing/disable` |

## 이메일 생성 시스템

### 카테고리 (`lib/words.ts`)

7개 카테고리, 각 30개의 영단어로 구성:

| 카테고리 | 이모지 | 예시 단어 |
|---|---|---|
| Shopping | 🛒 | cart, deal, shop, store, order, gift, brand... |
| Social | 💬 | chat, feed, post, like, share, group, friend... |
| Finance | 💰 | bank, cash, coin, fund, loan, pay, wallet... |
| Gaming | 🎮 | game, play, quest, hero, level, boss, raid... |
| Dev | 💻 | code, git, bug, api, node, app, deploy... |
| Newsletter | 📰 | news, read, daily, digest, brief, pulse... |
| General | ✨ | star, moon, sun, wind, rain, wave, peak... |

### 생성 로직 (`lib/generator.ts`)

```
generateEmail(categoryId, domain)
  → 카테고리에서 서로 다른 단어 2개를 랜덤 선택
  → "word1.word2@domain" 반환
  → 예시: "cart.deal@example.com"

generateRuleName(categoryName, word1, word2)
  → "CategoryName: word1.word2" 반환
  → 예시: "Shopping: cart.deal"
```

마음에 드는 조합이 나올 때까지 새로고침하거나, 수동 입력 모드로 전환할 수 있습니다.

## 라우팅 아키텍처

### 라우트 그룹

- `(dashboard)/` — 인증된 모든 페이지를 위한 라우트 그룹. 사이드바와 헤더가 포함된 공통 레이아웃 공유.
- `login/` — 대시보드 그룹 밖의 독립 페이지.
- `api/auth/` — 인증 엔드포인트 (Cloudflare API 호출 없음).
- `api/cloudflare/` — Cloudflare API 프록시 엔드포인트 (모두 인증 필요).

### API Route Handler

`api/cloudflare/` 내 모든 핸들러는 동일한 패턴을 따릅니다:

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

동적 라우트 매개변수는 Next.js 16의 비동기 params 패턴을 사용합니다:

```typescript
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...
}
```

## UI 아키텍처

### 레이아웃 구조

```
RootLayout (ThemeProvider, Toaster)
├── LoginPage (독립, 사이드바 없음)
└── DashboardLayout (Sidebar + Header)
    ├── DashboardPage (통계, 최근 규칙)
    ├── RulesPage (테이블/카드 목록)
    ├── NewRulePage (생성기 폼)
    ├── DestinationsPage (테이블/카드 목록)
    └── SettingsPage (토글, catch-all 설정)
```

### 반응형 동작

| 브레이크포인트 | 사이드바 | 내비게이션 |
|---|---|---|
| 데스크톱 (md+) | 고정 256px | 항상 표시 |
| 모바일 (<md) | 숨김 | 햄버거 메뉴로 Sheet 드로어 |

`useIsMobile()` 훅이 768px 기준으로 뷰포트 너비를 감지합니다. 데스크톱에서 테이블로 표시되는 페이지(Rules, Destinations)는 모바일에서 카드 기반 레이아웃으로 전환됩니다.

### 테마 시스템

- `next-themes`의 `attribute="class"`와 `defaultTheme="system"` 사용
- Tailwind CSS v4 `@custom-variant dark (&:is(.dark *))` 다크 모드
- shadcn/ui 테마 변수를 `globals.css`에 정의 (`:root` 라이트, `.dark` 다크)
- Header의 DropdownMenu로 테마 전환 (Light / Dark / System)

### 컴포넌트 라이브러리

shadcn/ui 컴포넌트 (New York 스타일, neutral 베이스 컬러):

Button, Card, Input, Badge, Dialog, Table, Select, Switch, Tabs, Separator, Skeleton, DropdownMenu, Sheet, Sonner (toast), Label

## Docker 빌드

### 멀티스테이지 빌드

```dockerfile
# Stage 1: 의존성 설치
FROM node:24-alpine AS deps
# npm ci --ignore-scripts

# Stage 2: 애플리케이션 빌드
FROM node:24-alpine AS builder
# npm run build (.next/standalone 생성)

# Stage 3: 프로덕션 실행
FROM node:24-alpine AS runner
# standalone 출력물 복사, non-root 사용자로 실행
```

### 출력물

Next.js `output: "standalone"`는 필요한 `node_modules`만 포함한 자체 완결형 `server.js`를 `.next/standalone/`에 생성합니다. 최종 Docker 이미지 구성:

- `/app/server.js` — Node.js 서버
- `/app/.next/static/` — 정적 에셋
- `/app/public/` — 공개 파일

non-root 사용자 `nextjs` (uid 1001)로 3000번 포트에서 실행됩니다.

## 타입 시스템

### Cloudflare API 타입 (`types/cloudflare.ts`)

```typescript
CloudflareResponse<T>    // 래퍼: { success, errors, messages, result: T }
EmailRoutingRule          // 매처, 액션, 활성 상태를 포함한 규칙
RuleMatcher               // { type: "literal", field: "to", value: string }
RuleAction                // { type: "forward" | "drop", value: string[] }
CatchAllRule              // "all" 매처를 사용하는 특수 규칙
Destination               // 인증 상태를 포함한 이메일 주소
EmailRoutingSettings      // 라우팅 활성/비활성 상태
CreateRuleRequest         // 규칙 생성 POST body
UpdateRuleRequest         // 규칙 수정 PUT body
```

## 데이터 흐름 예시

### 규칙 생성

```
1. 사용자가 /rules/new에서 "Shopping" 카테고리 선택
2. generateEmail("shopping", "example.com") → "cart.deal@example.com"
3. 사용자가 "규칙 생성" 클릭
4. POST /api/cloudflare/rules
   Body: {
     name: "Shopping: cart.deal",
     enabled: true,
     matchers: [{ type: "literal", field: "to", value: "cart.deal@example.com" }],
     actions: [{ type: "forward", value: ["user@gmail.com"] }]
   }
5. Route Handler → requireAuth() → createRule(body) → Cloudflare API
6. 성공 → 토스트 알림 → /rules로 이동
```

### 규칙 토글

```
1. 사용자가 Rules 페이지에서 Switch 클릭
2. PUT /api/cloudflare/rules/{id}
   Body: { ...기존규칙, enabled: !현재상태 }
3. Route Handler → requireAuth() → updateRule(id, body) → Cloudflare API
4. 성공 → 낙관적 UI 업데이트 → 토스트 알림
```
