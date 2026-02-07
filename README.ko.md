**[English](README.md)** | **[한국어](README.ko.md)**

<div align="center">

# MailVeil

**Cloudflare Email Routing을 위한 셀프호스팅 가상 이메일 관리 UI**

Cloudflare 대시보드 없이 `단어.단어@도메인` 형식의 일회용 이메일 주소를 생성하고,
포워딩 규칙과 수신 주소를 한곳에서 관리하세요.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/docker/pulls/huiya/mailveil?logo=docker&logoColor=white)](https://hub.docker.com/r/huiya/mailveil)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 주요 기능

| | 기능 | 설명 |
|---|---|---|
| **주소 생성** | 카테고리 기반 이메일 생성 | 8개 테마 카테고리에서 `단어.단어@도메인` 주소를 즉시 생성 |
| **규칙 관리** | CRUD + 토글 | 라우팅 규칙 생성, 검색, 이름 변경, 활성/비활성, JSON 내보내기, 삭제 |
| **전달 주소** | 수신 주소 관리 | 포워딩 대상 추가, 인증, 기본 설정, 삭제 |
| **Catch-All** | 와일드카드 제어 | 미등록 주소 수신 메일 전달 또는 삭제 |
| **설정** | 라우팅 토글 | 도메인의 Email Routing 켜기/끄기 |
| **인증** | PIN 로그인 | 데스크톱 키보드 입력 + 모바일 셔플 키패드 (숄더 서핑 방지) |
| **다국어** | 한국어/영어 | 브라우저 언어 자동 감지 + 수동 전환 |
| **테마** | 다크 / 라이트 / 시스템 | 세션 간 유지되는 테마 전환 |
| **PWA** | 설치형 웹 앱 | 홈 화면에 추가하면 네이티브 앱처럼 동작 |
| **반응형** | 모바일 퍼스트 | 데스크톱 사이드바 + 모바일 Sheet 드로어 |

### 카테고리

> `단어.단어@도메인` — 선택한 카테고리에서 두 단어를 랜덤 조합합니다.

| | 카테고리 | 예시 |
|---|---|---|
| :lock: | 프라이버시 | `cloak.phantom@` |
| :shopping_cart: | 쇼핑 | `cart.deal@` |
| :speech_balloon: | 소셜 | `chat.tribe@` |
| :moneybag: | 금융 | `vault.ledger@` |
| :video_game: | 게임 | `quest.arena@` |
| :computer: | 개발 | `git.deploy@` |
| :newspaper: | 뉴스레터 | `digest.pulse@` |
| :sparkles: | 일반 | `ember.jade@` |

---

## 빠른 시작

### 사전 준비

- [Email Routing](https://developers.cloudflare.com/email-routing/)이 활성화된 Cloudflare 도메인
- Email Routing 편집 권한이 있는 [API 토큰](#cloudflare-api-토큰-권한)
- **Zone ID**와 **Account ID** ([확인 방법](#cloudflare-인증-정보-얻기))
- [Docker](https://www.docker.com/) (권장) — 빌드 필요 없음

`.env` 파일 생성:

```env
AUTH_PIN=000000                          # 로그인 PIN (자릿수 자유)
CF_API_TOKEN=your-cloudflare-api-token   # Cloudflare API 토큰
CF_ZONE_ID=your-zone-id                 # Cloudflare Zone ID
CF_ACCOUNT_ID=your-account-id           # Cloudflare Account ID
NEXT_PUBLIC_EMAIL_DOMAIN=example.com     # 이메일 도메인
```

`docker-compose.yml` 파일 생성:

```yaml
services:
  mailveil:
    image: huiya/mailveil:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    restart: unless-stopped
```

실행:

```bash
docker compose up -d
```

**http://localhost:3000** 에 접속하여 PIN을 입력하면 됩니다.

<details>
<summary>Docker Compose 없이 실행</summary>

```bash
docker run -d -p 3000:3000 --env-file .env huiya/mailveil:latest
```

</details>

<details>
<summary>소스에서 직접 빌드 (Node.js 20+)</summary>

```bash
git clone https://github.com/huiya/mailveil.git
cd mailveil
cp .env.example .env
# .env 편집 (위 참고)

pnpm install
pnpm build
pnpm start
```

</details>

---

## 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `AUTH_PIN` | O | 로그인용 숫자 PIN. 자릿수에 맞춰 UI가 자동 구성됩니다. |
| `CF_API_TOKEN` | O | Cloudflare API 토큰. Email Routing 편집 권한 필요. |
| `CF_ZONE_ID` | O | Cloudflare Zone ID — 어떤 도메인의 라우팅 규칙을 관리할지 지정. |
| `CF_ACCOUNT_ID` | O | Cloudflare Account ID — 어떤 계정의 수신 주소를 관리할지 지정. |
| `NEXT_PUBLIC_EMAIL_DOMAIN` | O | 생성할 이메일의 도메인 (예: `example.com`). |
| `JWT_SECRET` | X | JWT 서명 키. **미설정 시 서버 시작 때 자동 생성.** 컨테이너 재시작 후에도 로그인 세션을 유지하려면 설정하세요. |

<details>
<summary><b>왜 Cloudflare 값이 3개나 필요한가요?</b></summary>

API 토큰은 *인증*(누구인지 증명)만 담당합니다. *어떤* 존이나 계정에 요청할지는 지정하지 않습니다. Cloudflare API는 URL 경로에 ID를 포함해야 합니다:

- **Zone ID** — 규칙 및 라우팅 조작: `/zones/{zone_id}/email/routing/rules`
- **Account ID** — 수신 주소 조작: `/accounts/{account_id}/email/routing/addresses`

이 ID 없이는 API 호출이 실패합니다.

</details>

---

## Cloudflare 설정

### Cloudflare 인증 정보 얻기

세 값 모두 Cloudflare 대시보드에서 확인할 수 있습니다:

1. **API 토큰** — [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)
   → **토큰 생성** → **사용자 정의 토큰** → 아래 권한 추가

2. **Zone ID & Account ID** — 도메인 선택 → **개요** 페이지 → 오른쪽 사이드바 **API** 섹션

### Cloudflare API 토큰 권한

| 권한 | 접근 수준 |
|---|---|
| Zone > Email Routing Rules | Edit |
| Account > Email Routing Addresses | Edit |

Zone Resources: **Include** → **Specific zone** → *사용할 도메인*.

---

## 기술 스택

| 기술 | 용도 |
|---|---|
| [Next.js](https://nextjs.org/) 16 | React 프레임워크 (App Router, standalone 출력) |
| [TypeScript](https://www.typescriptlang.org/) | 타입 안전성 |
| [Tailwind CSS](https://tailwindcss.com/) v4 | 유틸리티 퍼스트 스타일링 |
| [shadcn/ui](https://ui.shadcn.com/) | UI 컴포넌트 (Radix 기반) |
| [jose](https://github.com/panva/jose) | JWT 서명/검증 (Edge 호환) |
| [next-themes](https://github.com/pacocoursey/next-themes) | 다크/라이트 모드 |
| [sonner](https://sonner.emilkowal.dev/) | 토스트 알림 |
| [Lucide React](https://lucide.dev/) | 아이콘 |

## 프로젝트 구조

```
mailveil/
├── middleware.ts                        # JWT 인증 미들웨어 (Edge Runtime)
├── next.config.ts                       # Next.js 설정 (standalone, 보안 헤더)
├── Dockerfile                           # 멀티스테이지 Docker 빌드 (Node 24 Alpine)
├── docker-compose.yml
├── .env.example
└── src/
    ├── app/
    │   ├── layout.tsx                   # 루트 레이아웃 (ThemeProvider, Toaster, PWA)
    │   ├── globals.css                  # Tailwind v4 + shadcn 테마 + safe-area
    │   ├── login/page.tsx               # PIN 로그인 (키보드 + 셔플 키패드)
    │   ├── (dashboard)/
    │   │   ├── layout.tsx               # 사이드바 + 헤더 (반응형)
    │   │   ├── page.tsx                 # 대시보드 (통계 → 필터 목록 연결)
    │   │   ├── rules/page.tsx           # 규칙 목록 (테이블, 검색, 필터, 토글)
    │   │   ├── rules/new/page.tsx       # 이메일 생성기 + 규칙 생성
    │   │   ├── destinations/page.tsx    # 전달 주소 관리
    │   │   └── settings/page.tsx        # Email Routing 및 Catch-all 설정
    │   └── api/
    │       ├── auth/                    # login, logout, verify, pin-length
    │       └── cloudflare/              # rules, destinations, catch-all, settings
    ├── components/
    │   ├── ui/                          # shadcn/ui 기본 컴포넌트
    │   ├── layout/                      # Sidebar, Header, MobileNav
    │   ├── login/                       # PinInput, ShuffleKeypad
    │   └── email-generator/             # CategorySelector, EmailPreview, GeneratorForm
    ├── lib/
    │   ├── auth.ts                      # JWT + PIN (server-only, jose)
    │   ├── api-auth.ts                  # Route Handler 인증 가드
    │   ├── cloudflare.ts                # CF API 클라이언트 (server-only)
    │   ├── rate-limit.ts                # 로그인 레이트 리밋 (인메모리)
    │   ├── validation.ts                # 입력 검증 (이메일, ID, 규칙)
    │   ├── words.ts                     # 8개 카테고리 × 50+ 단어
    │   ├── generator.ts                 # 주소 생성 로직
    │   ├── i18n/                        # 다국어 번역 (en, ko)
    │   └── utils.ts                     # cn(), formatDate(), copyToClipboard()
    ├── hooks/                           # use-rules, use-i18n, use-mobile
    └── types/                           # Cloudflare API 응답 타입
```

## 보안

| 계층 | 상세 |
|---|---|
| **레이트 리밋** | 로그인: IP당 15분에 5회 제한 (HTTP 429) |
| **PIN 인증** | 상수 시간 비교 (타이밍 공격 방지) |
| **JWT** | HS256, 24시간 만료, `httpOnly` + `SameSite=Strict` 쿠키 |
| **이중 인증 레이어** | Edge 미들웨어 + Route Handler 가드 (`requireAuth()`) |
| **보안 헤더** | CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` |
| **입력 검증** | 이메일 형식, 규칙 구조, ID 형식 — 모든 API 라우트 |
| **에러 정보 차단** | CF API 에러는 서버 로그만, 클라이언트에는 일반 메시지 |
| **서버 전용 모듈** | API 인증 정보가 브라우저에 노출되지 않음 |
| **Non-root Docker** | UID 1001 (`nextjs` 사용자)로 실행 |

## 라이선스

[MIT](LICENSE)
