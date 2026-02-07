**[English](README.md)** | **[한국어](README.ko.md)**

# MailVeil

Cloudflare Email Routing을 위한 가상 이메일 관리 웹 UI.

Cloudflare 대시보드에서 일일이 라우팅 규칙을 만드는 대신, 카테고리별 단어 조합으로 일회용 이메일 주소를 생성하고 포워딩 규칙과 수신 주소를 한곳에서 관리할 수 있는 셀프호스팅 단일 사용자 앱입니다.

## 주요 기능

- **카테고리 기반 이메일 생성** — 7개 테마 카테고리(쇼핑, 소셜, 금융, 게임, 개발, 뉴스레터, 일반)에서 `단어.단어@도메인` 형식의 주소 생성
- **규칙 관리** — 이메일 라우팅 규칙 생성, 활성/비활성 토글, 검색, 삭제
- **수신 주소 관리** — 포워딩 목적지 주소 추가, 인증 확인, 삭제
- **Catch-all 제어** — Catch-all 규칙 동작 설정 (포워딩 또는 드롭)
- **Email Routing 설정** — Cloudflare Email Routing 켜기/끄기
- **PIN 인증** — 데스크톱 키보드 입력 + 모바일 셔플 키패드
- **다크/라이트 모드** — 시스템 연동 테마 + 수동 전환
- **반응형 디자인** — 데스크톱 사이드바 + 모바일 Sheet 드로어 내비게이션
- **클립보드 복사** — 모든 이메일 주소 원클릭 복사
- **JSON 내보내기** — 전체 라우팅 규칙 JSON 다운로드
- **Docker 지원** — 멀티스테이지 Dockerfile, standalone 출력
- **PWA 지원** — 모바일 홈 화면 추가 시 앱처럼 동작

## 사전 준비

- [Node.js](https://nodejs.org/) 20 이상 (24 권장)
- Cloudflare 계정:
  - [Email Routing](https://developers.cloudflare.com/email-routing/)이 활성화된 도메인
  - Email Routing 편집 권한이 있는 [API 토큰](https://dash.cloudflare.com/profile/api-tokens)
  - Zone ID와 Account ID (도메인 개요 페이지에서 확인)

## 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/mailveil.git
cd mailveil
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 편집합니다:

```env
AUTH_PIN=000000                          # 로그인 PIN (자릿수 자유)
JWT_SECRET=your-secret-key-min-32-chars  # JWT 서명 키 (32자 이상)
CF_API_TOKEN=your-cloudflare-api-token   # Cloudflare API 토큰
CF_ZONE_ID=your-zone-id                 # Cloudflare Zone ID
CF_ACCOUNT_ID=your-account-id           # Cloudflare Account ID
NEXT_PUBLIC_EMAIL_DOMAIN=example.com     # 이메일 도메인
```

### 4. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에 접속하여 PIN을 입력하면 됩니다.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

## Docker 배포

### Docker Compose (권장)

```bash
# 먼저 .env 파일을 만들어주세요 (위 3번 참고)
docker compose up -d
```

### Docker 수동 빌드

```bash
docker build -t mailveil .
docker run -d -p 3000:3000 --env-file .env mailveil
```

`http://localhost:3000`에서 접속할 수 있습니다.

## 환경변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `AUTH_PIN` | O | 로그인용 숫자 PIN. 자릿수에 맞춰 UI가 자동으로 구성됩니다. |
| `JWT_SECRET` | O | JWT 서명 키. 32자 이상의 랜덤 문자열을 사용하세요. |
| `CF_API_TOKEN` | O | Cloudflare API 토큰. Email Routing 편집 권한이 필요합니다. |
| `CF_ZONE_ID` | O | Cloudflare Zone ID — 어떤 도메인의 이메일 라우팅 규칙을 관리할지 지정합니다. |
| `CF_ACCOUNT_ID` | O | Cloudflare Account ID — 어떤 계정의 수신 주소를 관리할지 지정합니다. |
| `NEXT_PUBLIC_EMAIL_DOMAIN` | O | 생성할 이메일의 도메인 (예: `example.com`). |

> **왜 Cloudflare 값이 3개나 필요한가요?**
>
> API 토큰은 *인증*(누구인지 증명)만 담당합니다. *어떤* 존이나 계정에 요청할지는 지정하지 않습니다. Cloudflare API는 URL 경로에 Zone ID와 Account ID를 포함해야 합니다:
> - **Zone ID** — 규칙 및 라우팅 조작에 사용: `/zones/{zone_id}/email/routing/rules`
> - **Account ID** — 수신 주소 조작에 사용: `/accounts/{account_id}/email/routing/addresses`
>
> 이 ID 없이는 API 호출이 실패합니다.

### Cloudflare 인증 정보 얻기

세 값 모두 Cloudflare 대시보드에서 확인할 수 있습니다:

1. **API 토큰**
   - [Cloudflare API 토큰](https://dash.cloudflare.com/profile/api-tokens) 페이지로 이동
   - **토큰 생성** > **사용자 정의 토큰** 클릭
   - 아래 표의 권한을 추가하고 저장

2. **Zone ID & Account ID**
   - Cloudflare 대시보드에서 도메인 선택
   - **개요** 페이지 열기
   - 오른쪽 사이드바 **API** 섹션에 두 ID가 모두 표시됩니다

### Cloudflare API 토큰 권한

사용자 정의 토큰을 다음 권한으로 생성하세요:

| 권한 | 접근 수준 |
|---|---|
| Zone > Email Routing Rules | Edit |
| Account > Email Routing Addresses | Edit |

Zone Resources: Include > Specific zone > 사용할 도메인.

## 기술 스택

| 기술 | 용도 |
|---|---|
| [Next.js](https://nextjs.org/) 16 | React 프레임워크 (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | 타입 안전성 |
| [Tailwind CSS](https://tailwindcss.com/) v4 | 스타일링 |
| [shadcn/ui](https://ui.shadcn.com/) | UI 컴포넌트 |
| [jose](https://github.com/panva/jose) | JWT 서명/검증 (Edge 호환) |
| [next-themes](https://github.com/pacocoursey/next-themes) | 다크/라이트 모드 |
| [sonner](https://sonner.emilkowal.dev/) | 토스트 알림 |
| [Lucide React](https://lucide.dev/) | 아이콘 |

## 프로젝트 구조

```
mailveil/
├── middleware.ts                        # JWT 인증 미들웨어 (Edge Runtime)
├── next.config.ts                       # Next.js 설정 (standalone 출력)
├── Dockerfile                           # 멀티스테이지 Docker 빌드
├── docker-compose.yml
├── .env.example
└── src/
    ├── app/
    │   ├── layout.tsx                   # 루트 레이아웃 (ThemeProvider, Toaster)
    │   ├── globals.css                  # Tailwind v4 + shadcn 테마 변수
    │   ├── login/page.tsx               # PIN 로그인 페이지
    │   ├── (dashboard)/
    │   │   ├── layout.tsx               # 사이드바 + 헤더 레이아웃
    │   │   ├── page.tsx                 # 대시보드 (통계, 최근 규칙)
    │   │   ├── rules/page.tsx           # 규칙 목록 (테이블, 검색, 토글)
    │   │   ├── rules/new/page.tsx       # 이메일 생성기 + 규칙 생성
    │   │   ├── destinations/page.tsx    # 수신 주소 관리
    │   │   └── settings/page.tsx        # Email Routing 및 Catch-all 설정
    │   └── api/
    │       ├── auth/                    # login, logout, verify, pin-length
    │       └── cloudflare/              # rules, destinations, catch-all, settings
    ├── components/
    │   ├── ui/                          # shadcn/ui 컴포넌트
    │   ├── layout/                      # Sidebar, Header, MobileNav
    │   ├── login/                       # PinInput, ShuffleKeypad
    │   ├── email-generator/             # CategorySelector, EmailPreview, GeneratorForm
    │   └── theme-provider.tsx
    ├── lib/
    │   ├── auth.ts                      # JWT + PIN 검증 (server-only)
    │   ├── api-auth.ts                  # Route Handler 인증 가드
    │   ├── cloudflare.ts                # Cloudflare API 클라이언트 (server-only)
    │   ├── words.ts                     # 카테고리별 단어 목록 (7개 x 30단어)
    │   ├── generator.ts                 # 이메일 생성 로직
    │   └── utils.ts                     # cn(), formatDate(), copyToClipboard()
    ├── hooks/
    │   └── use-mobile.ts                # 모바일 감지 훅
    └── types/
        ├── cloudflare.ts                # Cloudflare API 응답 타입
        └── index.ts
```

## 보안

- **PIN 인증** — 타이밍 공격 방지를 위한 상수 시간 비교
- **JWT 토큰** — HS256, 24시간 만료, httpOnly 쿠키 저장
- **이중 인증 레이어** — Edge 미들웨어 + Route Handler 가드 (`requireAuth()`)
- **서버 전용 모듈** — Cloudflare API 인증 정보가 클라이언트에 노출되지 않음
- **API 키 비노출** — 모든 Cloudflare API 호출은 서버에서만 처리

## 라이선스

[MIT](LICENSE)
