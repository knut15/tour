# 아키텍처 — DDD (nextjs, App Router)

`.curvez/profile.json` 의 `stack: "nextjs"`, `paths.web: "."` 를 전제로 확정했다.
`paths.web` 이 `.` 이므로 아래 모든 검사 경로의 `src/` 는 저장소 루트 바로 아래를 가리킨다.
`tsconfig.json` 의 `paths` 가 `@/*` → `./src/*` 이므로 레이어 간 import 는 `@/domain/...` 형태다.

## 레이어 정의

| 레이어 | 책임 | 여기 들어가는 것 | 여기 들어가면 안 되는 것 |
|---|---|---|---|
| `domain` | 비즈니스 규칙 그 자체. 가장 오래 산다 | 엔티티(`Spot`, `Course`, `CourseItem`, `Profile`), 값 객체(`Category`, `District`, `Coordinate`, `Locale`), 불변식 검사(코스 하루 스팟 수 상한, 동선 유효성), 순수 계산(두 좌표 거리, 영업시간 판정), 리포지터리·게이트웨이 **인터페이스 선언** | 프레임워크 import, I/O, DB·HTTP 클라이언트, `process.env` 읽기, 시각·난수 직접 호출, 로깅 SDK, `'use client'`. 필요한 값은 전부 **인자로 받는다** |
| `application` | 유스케이스. 도메인 객체를 조립해 하나의 작업을 만든다. **트랜잭션 경계가 여기다** | 유스케이스 함수(`탐색 스팟 조회`, `주변 스팟 조회`, `일정 추천 생성`, `코스 저장`, `코스 공유 링크 발급`), 입력·출력 DTO, 권한 검사 조합, 도메인 인터페이스에 대한 의존 선언 | 구체 구현체 import, SQL, HTTP 호출, 컴포넌트, 라우트 객체, `Request`/`Response` 타입, `'use client'` |
| `infrastructure` | 도메인이 선언한 인터페이스의 **구현**. 바깥 세계와 붙는 유일한 곳 | TourAPI 클라이언트와 응답 매퍼, Supabase 클라이언트와 리포지터리 구현, Claude API 래퍼, mock 데이터 어댑터, 환경 변수 로딩 | 비즈니스 규칙, 화면 컴포넌트, 라우팅 결정 |
| `presentation` | 화면과 진입점. **`src/app/` 과 `src/presentation/` 두 디렉터리에 걸쳐 있다** | `src/app/`: App Router 라우트·레이아웃·페이지·Route Handler (얇게 유지한다). `src/presentation/`: 화면 컴포넌트, 폼, 상태 훅, 뷰 모델 변환, i18n 메시지, 카카오맵 컴포넌트, 컴포지션 루트 | 비즈니스 규칙, DB·외부 API 직접 접근, 도메인 불변식 재구현 |

**의존 역전이 이 구조의 핵심이다.** `domain` 이 `interface SpotRepository` 를 선언하고
`infrastructure` 의 TourAPI 구현과 mock 구현이 각각 그것을 만족한다. `domain` 은 구현체의 존재를 모른다.
`USE_MOCK_DATA` 플래그로 구현체를 갈아끼울 수 있는 이유가 이 방향이다.

## 의존 방향

```
presentation ──→ application ──→ domain
(src/app/ +                        ↑
 src/presentation/)                │
infrastructure ────────────────────┘
```

- `presentation` 은 `application` 과 `domain` 의 타입을 쓸 수 있다
- `application` 은 `domain` 만 쓸 수 있다
- `infrastructure` 는 `domain` 이 선언한 인터페이스를 구현하므로 `domain` 을 향한다
- `domain` 은 **어느 레이어도 import 하지 않는다.** 자기 자신 안에서만 참조한다

**역방향은 전부 금지다.** 아래 화살표는 하나도 존재하면 안 된다.

- `domain` → `application` · `infrastructure` · `presentation` (ARCH-003, ARCH-004, ARCH-016)
- `application` → `infrastructure` · `presentation` (ARCH-009, ARCH-010, ARCH-017)
- `infrastructure` → `presentation` (ARCH-008, ARCH-018)
- `presentation` → `infrastructure` (ARCH-011, ARCH-015 / 예외 1곳)

`infrastructure` 와 `presentation` 은 **형제**다. 서로를 부르지 않고 둘 다 안쪽만 본다.
둘을 잇는 배선은 `## 예외` 에 적힌 컴포지션 루트 한 곳에서만 한다.

## 금지 import

**이 표는 규칙의 선언이고, 집행은 lint 가 한다.** 세 번째 열이 `grep -E` 에 그대로 들어가는 값이다.
패턴 안의 `|` 는 `\|` 로 이스케이프돼 있으므로 검사 스크립트는 파싱 후 이스케이프를 **되돌린 뒤** 실행한다.

**검사 경로는 한 칸에 하나만 적는다.** 둘 이상 적으면 단어 분리가 일어나지 않아 위반 0건으로 위장된다.
그래서 같은 규칙이 경로별로 나뉘어 있다 (ARCH-011/015, ARCH-004/016 등).

| 규칙 ID | 검사 경로 | 금지 패턴 (ERE) | 이유 |
|---|---|---|---|
| ARCH-001 | src/domain/ | from ['\"](next\|next/.*\|react\|react-dom\|react/.*) | 도메인은 프레임워크 교체에서 분리돼야 한다 |
| ARCH-002 | src/domain/ | from ['\"](react-native\|react-native/.*\|expo\|expo-.*\|expo/.*\|@react-navigation/.*) | 지금은 웹 전용이지만 도메인이 RN 을 참조하는 순간 모바일 확장이 막힌다 |
| ARCH-003 | src/domain/ | from ['\"][^'\"]*infrastructure/ | 의존은 안쪽으로만 흐른다. 바깥을 부르면 레이어가 이름만 남는다 |
| ARCH-004 | src/domain/ | from ['\"][^'\"]*presentation/ | 화면을 아는 도메인은 화면이 바뀔 때마다 함께 바뀐다 |
| ARCH-005 | src/domain/ | from ['\"](node:)?(fs\|fs/promises\|path\|os\|http\|https\|net\|dns\|child_process\|worker_threads)['\"] | 런타임과 파일 시스템에 묶인 도메인은 테스트가 어렵다 |
| ARCH-006 | src/domain/ | from ['\"](@prisma/client\|prisma\|drizzle-orm.*\|typeorm\|mongoose\|mongodb\|pg\|mysql2\|redis\|ioredis\|@supabase/.*\|firebase\|firebase/.*\|@aws-sdk/.*\|@anthropic-ai/.*\|axios\|ky\|got\|node-fetch\|@tanstack/react-query\|swr) | Supabase·Claude SDK·HTTP 클라이언트는 인프라의 관심사다. 도메인은 인터페이스만 선언한다 |
| ARCH-007 | src/domain/ | (^\|[^a-zA-Z0-9_.])fetch\( | 도메인이 직접 네트워크를 부르면 단위 테스트가 통합 테스트가 된다 |
| ARCH-008 | src/infrastructure/ | from ['\"][^'\"]*presentation/ | 인프라가 화면을 알면 의존이 바깥에서 바깥으로 흐른다 |
| ARCH-009 | src/application/ | from ['\"][^'\"]*infrastructure/ | ARCH-003 과 같은 규칙을 application 에 적용한다 |
| ARCH-010 | src/application/ | from ['\"][^'\"]*presentation/ | ARCH-004 와 같은 규칙을 application 에 적용한다 |
| ARCH-011 | src/presentation/ | from ['\"][^'\"]*infrastructure/ | 화면이 Supabase·TourAPI 어댑터를 직접 부르면 유스케이스가 사라지고 같은 조회가 페이지마다 흩어진다. 예외 1곳은 `## 예외` 참조 |
| ARCH-012 | src/domain/ | ^['\"]use client['\"] | `'use client'` 가 붙은 도메인 파일은 자리를 잘못 잡은 것이다 |
| ARCH-013 | src/application/ | ^['\"]use client['\"] | 유스케이스가 클라이언트 번들로 넘어가면 서버 전용 의존이 함께 끌려간다 |
| ARCH-014 | src/domain/ | process\.env\. | 환경 변수는 infrastructure/config 에서만 읽는다. 도메인은 값을 인자로 받는다 |
| ARCH-015 | src/app/ | from ['\"][^'\"]*infrastructure/ | ARCH-011 과 같은 규칙을 라우트 루트에 적용한다. **"서버 컴포넌트니까 괜찮겠지" 가 이 스택에서 가장 흔한 경계 붕괴 경로다** |
| ARCH-016 | src/domain/ | from ['\"]@/app/ | 라우트 루트도 presentation 이다. ARCH-004 가 경로 이름으로는 못 잡는 구멍을 막는다 |
| ARCH-017 | src/application/ | from ['\"]@/app/ | ARCH-010 이 못 잡는 같은 구멍을 막는다 |
| ARCH-018 | src/infrastructure/ | from ['\"]@/app/ | ARCH-008 이 못 잡는 같은 구멍을 막는다 |

ARCH-001~007 이 **도메인의 프레임워크 독립**을 세 축으로 검사한다 — 프레임워크(001·002),
레이어 방향(003·004·016), I/O(005·006·007). 셋 중 하나라도 빠지면 나머지가 통과해도 독립이 아니다.

**lint 를 넣었으면 위반을 일부러 만들어 에러가 나는지 확인한다.** 설정 오류로 규칙이 로드되지 않아도
lint 는 조용히 통과한다. 설정 전문은 `presets/architecture/references/eslint-layer-rules.md` 를 따른다.

## 폴더 구조

`paths.web` 이 `.` 이므로 저장소 루트 바로 아래 `src/` 다.

**`src/app/` 의 위치는 협상 대상이 아니다.** Next.js 는 App Router 를 루트 `app/` 또는 `src/app/`
**둘 중 하나에서만** 인식한다 (`node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/src-folder.md`
에서 확인). `next.config` 의 `appDir` 는 App Router 를 **켜는** legacy 플래그이지 경로 설정이 아니다
(같은 docs 의 `05-config/01-next-config-js/appDir.md`). 따라서 라우트를 `src/presentation/app/` 으로
옮길 수 없고, `src/app/` 자체를 `presentation` 레이어의 일부로 취급한다.

```
src/
├── app/                           # App Router 라우트 루트. presentation 레이어다
│   ├── [locale]/                        # 얇게 유지한다 — application 유스케이스를 부르는 것만
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── explore/
│   │   ├── spots/[id]/
│   │   ├── map/
│   │   ├── plan/
│   │   ├── courses/
│   │   └── share/[slug]/
│   └── api/                             # Route Handler
├── domain/                        # 프레임워크 0개. import 하는 것이 거의 없다
│   ├── spot/
│   │   ├── spot.ts                      # 엔티티와 불변식
│   │   ├── category.ts                  # 값 객체 (contentTypeId 매핑)
│   │   ├── district.ts                  # 값 객체 (서울 구)
│   │   └── spot-repository.ts           # 인터페이스 선언만. 구현 없음
│   ├── course/
│   │   ├── course.ts
│   │   ├── course-item.ts
│   │   └── course-repository.ts
│   ├── itinerary/
│   │   ├── itinerary-planner.ts         # 인터페이스 선언 (LLM 은 여기 없다)
│   │   └── routing.ts                   # 순수 계산: 거리, 동선 정렬
│   └── shared/                    # 순수 유틸. 프레임워크가 필요하면 여기가 아니다
├── application/                   # 유스케이스. 트랜잭션 경계
│   ├── spot/
│   │   ├── list-spots.ts
│   │   ├── list-nearby-spots.ts
│   │   └── get-spot-detail.ts
│   ├── course/
│   │   ├── save-course.ts
│   │   └── issue-share-link.ts
│   ├── itinerary/
│   │   └── generate-itinerary.ts
│   └── dto.ts
├── infrastructure/                # 도메인 인터페이스의 구현
│   ├── tourapi/
│   │   ├── tourapi-client.ts
│   │   ├── tourapi-spot-repository.ts
│   │   └── mock-spot-repository.ts      # USE_MOCK_DATA 로 갈아끼운다
│   ├── supabase/
│   │   ├── supabase-client.ts
│   │   └── supabase-course-repository.ts
│   ├── anthropic/
│   │   └── claude-itinerary-planner.ts
│   └── config/                    # 환경 변수는 여기서만 읽는다
└── presentation/                  # 화면 구성 요소. src/app/ 이 여기서 가져다 쓴다
    ├── components/
    ├── hooks/
    ├── i18n/
    └── lib/                       # 프레임워크가 필요한 유틸
        └── container.ts           # 컴포지션 루트. ARCH-011·015 유일 예외
```

**`src/app/` 은 얇게 유지한다.** `page.tsx` 가 하는 일은 `application` 유스케이스를 부르고 그 결과를
`src/presentation/components/` 의 컴포넌트에 넘기는 것뿐이다. 화면 로직이 `src/app/` 에 쌓이면
레이어는 남지만 경계는 사라진다. 이 규칙은 정규식으로 검사할 수 없어 `## 권고` 에도 다시 적었다.

**공유 코드는 최상위 `shared/` 를 두지 않는다.** 순수 유틸은 `src/domain/shared/`, 프레임워크가
필요한 유틸은 `src/presentation/lib/` 다. 둘 사이의 선은 "프레임워크를 쓰느냐" 하나로 판정된다.

## 스택 매핑

| 레이어 | `nextjs` (이 프로젝트) |
|---|---|
| `domain` | `src/domain/` — 순수 TS. 런타임 없이 테스트한다 |
| `application` | `src/application/` — Server Action 과 Route Handler 가 호출하는 유스케이스 |
| `infrastructure` | `src/infrastructure/` — TourAPI `fetch` 래퍼, Supabase 클라이언트, Claude API 래퍼 |
| `presentation` | `src/app/` (라우트 루트, Next.js 가 위치를 강제한다) + `src/presentation/` (컴포넌트·훅·i18n) |

`react-native` 와 `monorepo` 는 이 프로젝트에 해당하지 않는다. 모바일을 추가하면 `stack` 이
`monorepo` 로 바뀌고 `domain` 이 `paths.domain` 패키지로 빠진다 — 그때 이 문서를 다시 확정한다.

### RSC 경계는 레이어 경계가 아니다

App Router 는 `presentation` **안쪽의 구분**이다. 레이어를 가르지 않는다.

- `src/app/` 의 라우트·레이아웃·`page.tsx` 는 전부 `presentation` 이다. 서버 컴포넌트든 클라이언트 컴포넌트든 같다
- **서버 컴포넌트라고 해서 `infrastructure` 를 직접 불러도 되는 것이 아니다.** 서버에서 돈다는 사실과
  어느 레이어에 속하는가는 무관하다. ARCH-011 과 ARCH-015 가 이것을 막는다
- Route Handler(`route.ts`)와 Server Action 은 `presentation` 의 진입점이다. 그 안에서 하는 일은
  `application` 의 유스케이스를 **부르는 것뿐**이어야 한다
- `next/headers`·`cookies()`·Supabase 세션은 `presentation` 에서 읽어 **인자로** 안쪽에 넘긴다.
  `application` 이 요청 컨텍스트를 직접 읽으면 배치 작업이나 스크립트에서 그 유스케이스를 부를 수 없다
- `'use client'` 는 `presentation` 파일에만 붙는다 (ARCH-012, ARCH-013)
- `TOUR_API_KEY` 등 비밀값은 `src/infrastructure/config/` 에서만 읽는다. `NEXT_PUBLIC_` 접두사가
  붙은 값은 빌드 시점에 클라이언트 번들로 인라인되므로 비밀값에 붙이지 않는다

## 예외

| 대상 | 허용 범위 | 만료 조건 |
|---|---|---|
| `src/presentation/lib/container.ts` | ARCH-011 만 면제한다. `infrastructure` 의 구현체를 import 해 `application` 유스케이스에 주입하는 배선만 허용한다. 이 파일에 조건 분기·데이터 변환·비즈니스 규칙을 두지 않는다 | 의존성 주입 라이브러리를 도입하거나, 컴포지션 루트를 `application` 진입점으로 옮겨 `presentation` 이 구현체를 몰라도 되게 정리되면 폐기한다 |

이 한 곳 외에 미리 열어둔 예외는 없다. **ARCH-015 에는 예외가 없다** — 컴포지션 루트는
`src/presentation/lib/` 에 있고 `src/app/` 에는 두지 않는다. 규칙을 못 지키는 지점이 실제로 생기면
그때 **만료 조건과 함께** 이 표에 추가한다. 만료 조건이 없는 예외는 부채가 아니라 새 기본값이 된다.

## 권고

정규식으로 검사할 수 없어 규칙이 아닌 것들이다. 리뷰에서 사람이 본다.

- `src/app/` 의 파일은 얇게 유지한다. 유스케이스 호출과 컴포넌트 조립만 한다
- 도메인은 시각과 난수를 직접 부르지 않는다. `now: Date` 를 인자로 받는다
- TourAPI 응답 타입을 도메인 엔티티로 그대로 쓰지 않는다. `infrastructure` 의 매퍼가 변환한다
- 영문·한글 병기는 도메인 엔티티가 두 값을 함께 갖는 형태로 표현한다. 화면에서 조합하지 않는다
- Supabase RLS 는 애플리케이션 권한 검사를 대체하지 않는다. 둘 다 둔다

## 결정 로그

| 무엇을 | 왜 | 되돌릴 위치 |
|---|---|---|
| DDD 프리셋을 쓴다 | curvez 기본값이고 사용자가 다른 구조를 요청하지 않았다 | `.curvez/architecture.md:레이어 정의` |
| `application` 레이어를 둔다 | 수치 판정선(라우트 12 미만 **그리고** 엔티티 8 미만)으로는 빼는 쪽이다 — 라우트 실측 10~11개, 엔티티 4~5개. 그러나 "합치지 말아야 할 신호" 중 **같은 조회 조합이 화면 여럿에서 반복**이 이미 성립한다(탐색·지도·AI추천이 같은 스팟 조회를 다르게 조합). `generate-itinerary` 가 Route Handler 와 Server Action 양쪽에서 불린다. 라우트가 11/12로 경계선이고 지역 확장이 GOAL 에 예정돼 있다 | `.curvez/architecture.md:레이어 정의` |
| 레이어 이름을 프리셋 기본값으로 둔다 | 인터뷰 1번 답. DDD 문헌과 용어가 일치해 검색 시 설명이 바로 나온다 | `.curvez/architecture.md:레이어 정의` |
| 최상위 `shared/` 를 두지 않는다 | 인터뷰 2번 답. `shared/` 는 모든 레이어에서 불리므로 프레임워크 코드가 한 줄만 들어와도 도메인 독립이 깨진다 | `.curvez/architecture.md:폴더 구조` |
| ARCH-011 을 추가한다 (`presentation` → `infrastructure` 금지) | 인터뷰 3번 답. Next.js 에서 "서버 컴포넌트니까 괜찮겠지"가 가장 흔한 붕괴 경로다 | `.curvez/architecture.md:금지 import` |
| 컴포지션 루트 1곳을 예외로 연다 | 인터뷰 3번 답. ARCH-011 을 켜면 의존성 조립 지점이 반드시 걸린다. 만료 조건을 함께 적었다 | `.curvez/architecture.md:예외` |
| 그 밖의 예외는 열지 않는다 | 인터뷰 4번 답. 미리 열어둔 예외는 쓰이지 않아도 "여긴 안 지켜도 된다"는 선례로 남는다 | `.curvez/architecture.md:예외` |
| ARCH-012·013·014 를 추가한다 | 프리셋의 `## 스택 매핑` 과 `## 레이어 정의` 가 서술로만 갖고 있던 규칙(`'use client'` 위치, 도메인의 환경 변수 읽기 금지)을 검사 가능한 형태로 승격했다 | `.curvez/architecture.md:금지 import` |
| 바운디드 컨텍스트를 나누지 않는다 | 판정선은 컨텍스트 3개 이상 **그리고** 모듈당 소스 30개 이상이다. 현재 `spot`·`course`·`itinerary` 3개지만 소스 파일이 0개다 | `.curvez/architecture.md:폴더 구조` |
| `curvez-requirements` 핸드오프 없이 확정했다 | 에이전트 정의는 이 핸드오프를 필수 입력으로 요구한다. 실제로는 없고, 대신 `GOAL.md` 가 v1 범위·기능 4개·제외 목록·완료 기준을 확정하고 있어 그것을 근거로 삼았다. 요구사항이 이 문서와 어긋나면 아키텍처를 구부리지 말고 `curvez-requirements` 로 되돌린다 | `.curvez/architecture.md:결정 로그` |
| **"라우트 루트를 `src/presentation/app/` 으로 둔다" 를 폐기하고 `src/app/` 유지로 교체한다** | 앞선 결정은 **사실 확인 없이 쓴 오류**였다. Next.js 는 App Router 를 루트 `app/` 또는 `src/app/` 둘에서만 인식하고(`node_modules/next/dist/docs/.../src-folder.md`), `appDir` 는 경로 설정이 아니라 App Router 를 켜는 legacy 플래그다(`.../next-config-js/appDir.md`). `src/presentation/app/` 에 두면 라우트가 인식되지 않는다 | `.curvez/architecture.md:폴더 구조` |
| `src/app/` 을 `presentation` 레이어의 일부로 취급하고 ARCH-015·016·017·018 을 추가한다 | 위 교체의 결과다. 라우트 루트를 옮길 수 없으므로 경로 이름(`presentation/`)에 기대던 ARCH-004·008·010·011 이 `src/app/` 을 못 덮는 구멍이 생긴다. `@/app/` 패턴과 `src/app/` 검사 경로로 그 구멍을 막았다. 검사 경로를 한 칸에 둘 이상 적으면 단어 분리가 안 돼 위반 0건으로 위장되므로 규칙을 경로별로 나눴다 | `.curvez/architecture.md:금지 import` |
