# supabase-auth-flow

- **조사 질문:** Supabase Auth 를 Next.js 16 App Router 에 붙일 때, "저장 시점에만 로그인" 을 인앱 모달로 완결할 수 있는가?
- **조사 일자:** 2026-08-19
- **기준 버전:** next@16.3.1, react@19.2.8, node@24.19.0 — 근거: `package.json`, `node -v`. Supabase 패키지는 미설치 상태라 프로젝트 버전 없음
- **결론 한 줄:** **인앱 모달만으로는 완결할 수 없다.** `signInWithOAuth` 는 세션을 반환하지 않고 `{ provider, url }` 만 반환하므로 그 URL 로 브라우저 컨텍스트를 이동해야 한다. 다만 `skipBrowserRedirect: true` 로 URL 을 받아 **팝업 창**에서 처리하면 현재 페이지(코스를 구성하던 상태)를 잃지 않는다. 이것이 이 프로젝트 요구에 맞는 형태다.

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | `SignInWithOAuthCredentials.options` 는 `redirectTo?: string`, `scopes?: string`, `queryParams?: { [key: string]: string }`, `skipBrowserRedirect?: boolean` 네 가지다 | https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts | A | 2026-08-19 | auth-js master |
| 2 | `skipBrowserRedirect` 의 주석 원문: "If set to true does not immediately redirect the current browser context to visit the OAuth authorization page for the provider." | https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts | A | 2026-08-19 | auth-js master |
| 3 | **`OAuthResponse` 의 성공 시 `data` 는 `{ provider, url }` 뿐이다. 세션(access token)이 직접 반환되지 않는다** | https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts | A | 2026-08-19 | auth-js master |
| 4 | Next.js 서버사이드 인증에는 `@supabase/supabase-js` 와 `@supabase/ssr` 두 패키지가 필요하다 | https://supabase.com/docs/guides/auth/server-side/nextjs | A | 2026-08-19 | 문서 확인 시점 |
| 5 | 프록시(구 middleware)가 필요하다. 서버 컴포넌트는 쿠키를 직접 쓸 수 없으므로 프록시가 만료된 인증 토큰을 갱신하고 저장한다 | https://supabase.com/docs/guides/auth/server-side/nextjs | A | 2026-08-19 | 문서 확인 시점 |
| 6 | 브라우저용과 서버용 두 개의 Supabase 클라이언트가 필요하다 | https://supabase.com/docs/guides/auth/server-side/nextjs | A | 2026-08-19 | 문서 확인 시점 |
| 7 | 인증 쿠키의 기본 이름은 `sb-<project_ref>-auth-token` 이다 | https://supabase.com/docs/guides/auth/server-side/nextjs | A | 2026-08-19 | 문서 확인 시점 |
| 8 | **서버 코드에서 `getSession()` 을 신뢰하지 말고 `getClaims()` 로 페이지와 사용자 데이터를 보호해야 한다** | https://supabase.com/docs/guides/auth/server-side/nextjs | A | 2026-08-19 | 문서 확인 시점 |
| 9 | **`anon` 키는 publishable 키로, `service_role` 키는 secret 키로 대체된다.** 형식은 각각 `sb_publishable_xxx`, `sb_secret_xxx` 다 | https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys | A | 2026-08-19 | 문서 확인 시점 |
| 10 | **레거시 `anon`·`service_role` 키는 2026년 말에 deprecated 된다** | https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys | A | 2026-08-19 | 문서 확인 시점 |
| 11 | publishable 키는 `anon` 키와 동일한 낮은 권한을 가지므로 RLS 정책 동작이 같다. 클라이언트 초기화 코드는 키 문자열만 바꾸면 된다 | https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys | A | 2026-08-19 | 문서 확인 시점 |
| 12 | Next.js 용 환경변수 이름은 `NEXT_PUBLIC_SUPABASE_URL` 과 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 다 | https://supabase.com/docs/guides/auth/server-side/nextjs | A | 2026-08-19 | 문서 확인 시점 |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | PKCE 코드 교환용 callback Route Handler 의 정확한 경로와 코드 | 문서 페이지에서 해당 섹션이 추출되지 않았다 | 프록시가 토큰 갱신을 담당한다는 것까지 확인됐다 (사실 5) |
| 2 | **`@supabase/ssr` 문서의 middleware 예제가 Next.js 16 의 `proxy.ts` 규약과 호환되는지** | Supabase 문서는 `middleware` 를 전제로 쓰여 있고, Next.js 16 은 이를 deprecated 시켰다(별도 브리프 `nextjs16-i18n-routing` 사실 6). 두 문서를 잇는 A 출처를 찾지 못했다 | 양쪽 사실은 각각 확인됐다. 조합의 동작은 미확인 |
| 3 | 매직 링크(`signInWithOtp`)로 팝업 없이 모달 안에서 완결할 수 있는지 | 조사 상한 안에서 `signInWithOtp` 의 타입 정의를 열지 않았다 | OAuth 경로가 팝업 또는 리디렉트를 요구한다는 것까지 확인됐다 (사실 3) |
| 4 | 팝업 차단기에 걸렸을 때의 공식 권장 대응 | 문서에 언급을 찾지 못했다 | `skipBrowserRedirect` 로 URL 을 받는다는 것까지 확인됐다 (사실 2) |
| 5 | 로케일별 리디렉트 URL(`/en/...`, `/ko/...`)을 Supabase 대시보드에 몇 개까지 등록할 수 있는지 | 문서를 열지 않았다 | 없음 |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| `signInWithOAuth` 가 세션을 직접 주는가 | 주지 않는다 — https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts | 검색 결과의 GitHub Discussions 답변들(B 등급) | 모순 처리 2번: 문서와 소스가 다르면 **소스 코드**가 이긴다. `OAuthResponse` 타입이 `{ provider, url }` 로 못박혀 있다 |
| 환경변수 이름을 `ANON_KEY` 로 둘 것인가 `PUBLISHABLE_KEY` 로 둘 것인가 | `PUBLISHABLE_KEY` — https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys | `ANON_KEY` (레거시) | 모순 처리 4번(최신) + 사실 10(2026년 말 deprecated). 오늘이 2026-08-19 이므로 남은 기간이 4개월 남짓이다 |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|
| 팝업 OAuth (`skipBrowserRedirect: true` + `window.open`) | https://raw.githubusercontent.com/supabase/auth-js/master/src/lib/types.ts | 팝업 차단기 대응 미확인(확인 불가 4). 팝업 결과 처리와 창 닫기를 직접 구현해야 한다 | **현재 페이지를 잃지 않는다.** "저장 시점에만 로그인" 요구에 가장 가깝다 |
| 전체 페이지 리디렉트 OAuth (`redirectTo` 지정) | https://supabase.com/docs/guides/auth/server-side/nextjs | 코스를 구성하던 화면 상태가 사라진다. 복구하려면 상태를 URL 이나 스토리지에 먼저 저장해야 한다 | 구현이 단순하다. 상태 유실이 UX 비용 |
| 매직 링크 (`signInWithOtp`) | — | 확인 불가 3 | 미확인. 이메일 앱으로 이탈이 발생하므로 여행 중 사용에는 불리해 보이나 **근거 없는 추정이다** |

## 조사 경로

- 검색 → Supabase 공식 문서 → **타입 정의 소스 코드**로 내려갔다. 문서 페이지(`/docs/reference/javascript/auth-signinwithoauth`)는 JS 렌더링이라 옵션 표가 추출되지 않아, `supabase/auth-js` 저장소의 `src/lib/types.ts` 를 직접 열어 확정했다
- GitHub Discussions(#4487, #21684)는 검색 결과 목록에서만 봤고 B 등급이라 인용하지 않았다
- 검색어: `Supabase Auth signInWithOAuth skipBrowserRedirect popup modal Next.js server-side` / `Supabase publishable key anon key rename NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 2026`
- 웹 도구 호출 횟수: 5/30

## 이 프로젝트에 미치는 영향

| 영향 | 어디에 | 무엇이 어긋나는가 |
|---|---|---|
| **환경변수 이름** | `.env.example`, `.env.local` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` 로 써뒀다. 레거시 이름이고 2026년 말 deprecated 다(사실 9·10). `PUBLISHABLE` / `SECRET` 으로 바꿔야 한다 |
| 로그인 UX | `.curvez/design/index.md` 미결 질문 3번 | **모달 단독으로는 불가**하다는 답이 나왔다. 팝업 방식으로 설계하면 현재 페이지를 유지할 수 있다 |
| 레이어 경계 | `.curvez/architecture.md` | 프록시가 토큰 갱신을 담당하므로 `src/proxy.ts` 가 Supabase 인프라 코드를 import 하게 된다. 그 파일은 현재 4레이어 어디에도 속하지 않는다. ARCH-011(presentation → infrastructure 금지)과 충돌할 소지가 있다 |
| 권한 검사 | `.curvez/architecture.md` `## 권고` | "Supabase RLS 는 애플리케이션 권한 검사를 대체하지 않는다" 라고 써뒀는데, 사실 8 이 이를 뒷받침한다 — 서버에서 `getSession()` 을 신뢰하면 안 되고 `getClaims()` 를 써야 한다 |
| 프록시 규약 충돌 | `.curvez/architecture.md`, 구현 | Supabase 문서의 middleware 예제와 Next.js 16 의 `proxy` 규약이 그대로 호환되는지 미확인이다(확인 불가 2). 로케일 리디렉트와 Supabase 토큰 갱신이 **같은 `proxy.ts` 한 파일**에 들어가야 한다는 점도 설계에 반영해야 한다 |
