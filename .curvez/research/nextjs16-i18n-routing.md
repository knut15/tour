# nextjs16-i18n-routing

- **조사 질문:** Next.js 16.3.1 App Router 에서 en/ko 두 로케일의 라우팅·사전 로딩·로케일 감지를 어떤 API 로 구현하는가?
- **조사 일자:** 2026-08-19
- **기준 버전:** next@16.3.1, react@19.2.8, tailwindcss@4.3.3, typescript@5.9.3, node@24.19.0 — 근거: `package.json`, `node_modules/<pkg>/package.json`, `node -v`
- **결론 한 줄:** `app/[lang]/` 서브패스 + `next/root-params` 의 `lang()` 게터 + `proxy.ts` 리디렉트로 구현한다. 단 `root-params` 는 **Server Component 전용**이라 Route Handler·Server Action 에서는 못 쓰고, `middleware` 는 16 에서 `proxy` 로 이름이 바뀌었으며 **edge 런타임을 지원하지 않는다.**

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | i18n 라우팅은 서브패스(`/fr/products`) 또는 도메인으로 하며, `app/` 안의 모든 special file 을 `app/[lang]/` 아래에 중첩해야 라우터가 로케일을 동적으로 처리한다. 루트 레이아웃도 그 안에 둔다 | https://nextjs.org/docs/app/guides/internationalization | A | 2026-08-19 | next@16.3.1 |
| 2 | `next/root-params` 는 루트 레이아웃 **위**의 동적 세그먼트마다 async 게터를 export 한다. `app/[lang]` 이면 `import { lang } from 'next/root-params'`. prop drilling 없이 임의의 Server Component 에서 부른다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 3 | `next/root-params` 는 **v16.3.0 에서 도입**됐다 (해당 문서의 Version History 표) | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.0 |
| 4 | root parameter 게터는 **Server Component 에서만** 쓸 수 있다. Client Component, Server Action, Route Handler, `unstable_cache` 에서는 못 쓴다. Route Handler 지원은 향후 릴리스 예정이라고 명시돼 있다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 5 | root parameter 이름은 유효한 JavaScript 식별자여야 한다. `[post-slug]` 같은 kebab-case 세그먼트는 dev 또는 build 에서 에러가 난다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 6 | `middleware.js` 규약은 **Next.js 16 에서 deprecated 되고 `proxy.js` 로 rename** 됐다. 파일명과 named export 이름이 모두 바뀐다 (`export function proxy`). 기능은 동일하다 | https://nextjs.org/docs/app/api-reference/file-conventions/middleware | A | 2026-08-19 | next@16 |
| 7 | **`proxy` 의 런타임은 `nodejs` 이며 설정할 수 없다. edge 런타임은 `proxy` 에서 지원되지 않는다.** edge 를 계속 쓰려면 `middleware` 를 유지해야 한다 | https://nextjs.org/docs/app/guides/upgrading/version-16 | A | 2026-08-19 | next@16 |
| 8 | `proxy.ts` 는 프로젝트 루트 또는 `src` 안, 즉 `app`/`pages` 와 **같은 레벨**에 둔다 | https://nextjs.org/docs/app/api-reference/file-conventions/proxy | A | 2026-08-19 | next@16.3.1 |
| 9 | 로케일 감지는 들어오는 `Accept-Language` 헤더로 하고, 경로에 로케일이 없으면 `proxy` 에서 `NextResponse.redirect` 한다. 문서 예시는 `@formatjs/intl-localematcher` 와 `negotiator` 를 쓴다 | https://nextjs.org/docs/app/guides/internationalization | A | 2026-08-19 | next@16.3.1 |
| 10 | 사전(dictionary)은 `import()` 로 로케일별 JSON 을 지연 로딩하고 Server Component 에서만 읽는다. 번역 파일 크기가 클라이언트 번들에 영향을 주지 않는다 | https://nextjs.org/docs/app/guides/internationalization | A | 2026-08-19 | next@16.3.1 |
| 11 | `generateStaticParams` 는 **Cache Components 를 쓸 때만 필수**다. 그 경우 root parameter 마다 최소 한 값이 있어야 빌드가 통과한다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 12 | `next/root-params` 를 import 한 파일에는 `import 'server-only'` 가 필요 없다. Client Component 에서 쓰면 빌드 시점에 실패한다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 13 | `next/root-params` export 의 타입은 `next dev`, `next build`, `next typegen` 시점에 생성된다. `PageProps`·`LayoutProps` 와 같은 방식이다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 14 | `'use cache'` 안에서는 root parameter 게터를 부를 수 있고, 실제로 쓴 root parameter 만 캐시 키에 포함된다. 반면 `unstable_cache` 안에서는 런타임 에러가 난다 | https://nextjs.org/docs/app/api-reference/functions/next-root-params | A | 2026-08-19 | next@16.3.1 |
| 15 | `middleware` → `proxy` 마이그레이션 codemod 가 있다: `npx @next/codemod@canary middleware-to-proxy .` | https://nextjs.org/docs/app/api-reference/file-conventions/middleware | A | 2026-08-19 | next@16 |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | 이 프로젝트에서 Cache Components 를 켤 것인지, 그래서 `generateStaticParams` 가 필수가 되는지 | 프로젝트 결정 사항이지 문서로 확인할 대상이 아니다. `next.config.ts` 에 아직 설정이 없다 | Cache Components 를 켜지 않으면 `generateStaticParams` 없이도 root parameter 가 동작한다 (사실 11) |
| 2 | `proxy` 가 nodejs 런타임 고정일 때 Vercel 에서 로케일 리디렉트의 실측 지연이 얼마인지 | 공식 문서에 수치가 없다. 배포 후 실측해야 한다 | edge 런타임 미지원이라는 사실까지만 확인됐다 (사실 7) |
| 3 | Tailwind v4 가 i18n 라우팅과 상호작용하는 지점이 있는지 | Next.js 문서에 언급이 없고, Tailwind v4 공식 문서를 이 브리프의 조사 상한 안에서 열지 않았다 | Tailwind v4.3.3 이 설치돼 있다는 것까지만 확인됐다 |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| 로케일 리디렉트를 `middleware` 로 쓸 것인가 `proxy` 로 쓸 것인가 | `proxy` — https://nextjs.org/docs/app/api-reference/file-conventions/proxy | `middleware` — https://nextjs.org/docs/app/api-reference/file-conventions/middleware | 후자 문서가 스스로 deprecated 를 선언하고 전자를 가리킨다. 모순이 아니라 이행이다. 다만 edge 런타임이 필요하면 `middleware` 를 유지해야 한다는 조건이 붙는다 (사실 7) |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|
| Next.js 내장 (`app/[lang]` + `next/root-params` + `proxy`) | https://nextjs.org/docs/app/guides/internationalization | Route Handler·Server Action 에서 `root-params` 불가 (사실 4). 의존성 추가 없음 | next@16.3.1 에 정확히 맞는다. `root-params` 가 16.3.0 도입이라 이 버전에서만 가능하다 |
| `next-intl` | https://next-intl.dev | 외부 의존성. next@16.3.1 호환 여부를 이 브리프에서 확인하지 않았다 | 확인 불가 — 공식 문서가 Resources 목록에 올려둔 것까지만 확인됐다 |
| `next-international` | https://github.com/QuiiBz/next-international | 외부 의존성. 위와 같음 | 확인 불가 |

**후보 2·3 은 Next.js 공식 문서의 Resources 목록에 있다는 사실만 A 등급으로 확인했고, next@16.3.1 과의 호환은 확인하지 않았다.** 선택하려면 별도 조사가 필요하다.

## 조사 경로

- **로컬 A 출처를 우선했다.** `node_modules/next/dist/docs/` 는 next@16.3.1 과 함께 배포된 공식 문서라 웹사이트보다 **버전이 정확하다**. 웹사이트는 canary 나 다른 마이너를 보여줄 수 있다. 위 표의 URL 은 같은 문서의 정식 주소이며, 실제 확인은 아래 로컬 경로에서 했다:
  - `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/next-root-params.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`
  - `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/middleware.md`
  - `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`
- C 등급 글은 보지 않았다. 로컬 A 출처만으로 결론이 나왔다
- 검색어: 없음 (웹 검색을 쓰지 않았다)
- 웹 도구 호출 횟수: 0/30

## 이 프로젝트에 미치는 영향

브리프의 사실을 이 프로젝트의 확정 문서와 대조한 결과다. **결정이 아니라 이의 제기다.**

| 영향 | 어디에 | 무엇이 어긋나는가 |
|---|---|---|
| 라우트 경로 | `.curvez/design/screens/*.md` 의 `route(nextjs): /[locale]/...` | 세그먼트 이름을 `[locale]` 로 썼는데, 공식 문서 예시는 `[lang]` 이다. 이름 자체는 자유지만 `next/root-params` 의 export 이름이 **폴더명에서 생성**되므로 `[locale]` 이면 `import { locale }` 이 된다. 유효한 JS 식별자이므로 동작한다 (사실 5). 다만 문서 예제와 어긋나므로 하나로 고정해야 한다 |
| 레이어 경계 | `.curvez/architecture.md` `## 폴더 구조` | `proxy.ts` 는 `app` 과 같은 레벨(= `src/proxy.ts`)에 둬야 한다 (사실 8). 이 위치는 현재 아키텍처의 4레이어 어디에도 속하지 않는다. `presentation` 의 진입점으로 규정할지 예외로 둘지 정해야 한다 |
| 유스케이스 호출 | `.curvez/architecture.md` `## 스택 매핑` | Route Handler 와 Server Action 에서 `root-params` 를 쓸 수 없다 (사실 4). 그 두 진입점에서는 로케일을 **URL params 또는 인자로 명시 전달**해야 한다. 아키텍처의 "presentation 에서 읽어 인자로 안쪽에 넘긴다" 원칙과 방향이 같으므로 충돌은 아니지만, 구현 에이전트가 `lang()` 을 Route Handler 에 쓰면 빌드가 깨진다 |
| 성능 전제 | 없음 (신규) | `proxy` 는 nodejs 런타임 고정이라 edge 리디렉트를 쓸 수 없다 (사실 7). 로케일 리디렉트가 모든 최초 요청에 붙으므로 외국인 대상 서비스의 초기 응답 지연에 영향이 있다. 실측 필요 |
