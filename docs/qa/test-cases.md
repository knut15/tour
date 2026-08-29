# QA 테스트 케이스

대상: `tour` (Life is Nearby) — Next.js 16 App Router, 로케일 6종.
작성 기준: 2026-08-29 시점의 `src/` 코드에서 실제로 읽어 확인한 동작만 담았다. 아직 없는 기능(지도, AI 일정 추천, 코스 저장, 로그인 — GOAL.md §3 의 v1 목록 중 3·4번)은 **TC 를 쓰지 않았다.**

## 실행 환경

| 구분 | 값 |
|---|---|
| 기동 | `pnpm dev` (기본 포트 3000) |
| 데이터 | `USE_MOCK_DATA` 가 `"false"` 가 **아니면 전부 mock** (`src/infrastructure/config/env.ts:isMockEnabled`) |
| 실데이터 | `USE_MOCK_DATA=false` + `TOUR_API_KEY` 필요 |
| 반응(좋아요·조회) | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 둘 다 있어야 켜진다. 없으면 기능 자체가 화면에서 사라진다 |
| 기준 브라우저 | Chrome 최신 / iOS Safari. 폭 375px 를 최소 기준으로 본다 |

## 우선순위

- **P0** — 깨지면 배포 불가. 화면이 안 뜨거나 데이터가 틀리거나 키가 샌다
- **P1** — 주요 흐름의 손상. 우회는 되지만 사용자가 알아챈다
- **P2** — 다듬기. 릴리스는 가능하다

## 판정 표기

`통과` / `실패` / `보류(사전조건 없음)` 로 적고, 실패는 재현 절차와 실제 결과를 함께 남긴다.

---

## 1. 라우팅·로케일 (RTE)

근거: `src/proxy.ts`, `src/app/[locale]/layout.tsx`, `src/domain/shared/locale.ts`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-RTE-01 | P0 | — | `Accept-Language` 없이 `/` 요청 | `/en` 으로 307. 기본 로케일은 en |
| TC-RTE-02 | P0 | — | `Accept-Language: ko-KR,ko;q=0.9` 로 `/` 요청 | `/ko` 로 307 |
| TC-RTE-03 | P1 | — | `Accept-Language: zh-TW` / `zh-HK` / `zh-Hant` 각각으로 `/` 요청 | 셋 다 `/zh-Hant` |
| TC-RTE-04 | P1 | — | `Accept-Language: zh-CN` 으로 `/` 요청 | 간체는 미지원이므로 건너뛰고 `/en` |
| TC-RTE-05 | P1 | — | `Accept-Language: de-AT,de;q=0.9` 로 `/explore` 요청 | `/de/explore` 로 307 (하위 태그는 base 로 매칭) |
| TC-RTE-06 | P1 | — | `/fr/explore` 직접 요청 | 리다이렉트 없이 200 |
| TC-RTE-07 | P1 | — | `/es/explore` 요청 | `/en/es/explore` 로 간 뒤 404. 5xx 나 빈 화면이 아니어야 한다 |
| TC-RTE-08 | P0 | — | `/api/spots/x/like` 로 POST | 로케일 리다이렉트(307) 없이 라우트에 닿는다. `matcher` 가 `api` 를 뺀다 |
| TC-RTE-09 | P1 | — | `/ja` 접속 후 HTML 확인 | `<html lang="ja">`. 6개 로케일 각각 `LOCALE_HTML_LANG` 값과 일치 |
| TC-RTE-10 | P1 | — | 홈에서 언어 드롭다운으로 6개 언어를 차례로 전환 | 매번 홈(`/{locale}`)에 머문다. 드롭다운에 English·한국어·日本語·繁體中文·Deutsch·Français 6개 |
| TC-RTE-11 | P0 | 탐색에서 카테고리·시도·시군구·검색어·정렬·더보기를 모두 건 상태 | 언어 전환 | 같은 조건 그대로 다른 언어 목록. `category`·`area`·`district`·`q`·`sort`·`more` 파라미터가 전부 유지 |
| TC-RTE-12 | P1 | — | 6개 로케일에서 홈·탐색을 열어 문구 확인 | 번역 키가 그대로 노출된 자리(`explore.title` 같은 원문 키)나 빈 문자열이 없다 |

## 2. 탐색 화면 — 필터 (EXP)

근거: `src/app/[locale]/explore/page.tsx`, `src/presentation/lib/explore-href.ts`, `explore-paging.ts`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-EXP-01 | P0 | — | `/en/explore` 진입 | 카테고리 기본 `attraction`, 카드 12개(BATCH), 필터 바에 카테고리·거리·지역·정렬·검색이 선다 |
| TC-EXP-02 | P0 | — | 카테고리 탭 4개(Places/Culture/Food/Happening)를 차례로 누른다 | URL `category` 가 바뀌고 목록이 갱신된다. 각 탭에서 결과가 나온다 |
| TC-EXP-03 | P1 | — | 시도(Region)를 고른다 | URL 에 `area` 가 붙고, 그 아래에 시군구(District) 선택이 새로 나타난다 |
| TC-EXP-04 | P0 | 시도+시군구를 고른 상태 | 다른 시도를 고른다 | `district` 파라미터가 **사라진다**. 시군구 코드는 시도 안에서만 고유하므로 남으면 안 된다 |
| TC-EXP-05 | P1 | — | `?district=23` 만 붙여 접속 (`area` 없이) | `district` 는 통째로 무시되고 전국 목록이 나온다 |
| TC-EXP-06 | P1 | — | `?category=zzz` 로 접속 | `attraction` 목록. 에러 화면이 아니다 |
| TC-EXP-07 | P1 | — | `?sort=zzz` 로 접속 | 기본 정렬(조회순)로 그린다 |
| TC-EXP-08 | P1 | — | `?more=99`, `?more=abc`, `?more=-1` 로 각각 접속 | 셋 다 첫 묶음 12개 |
| TC-EXP-09 | P1 | — | `?area=99999` 처럼 존재하지 않는 지역 코드로 접속 | 빈 상태 화면(“Nothing matches that combination.”). 500 이 아니다 |
| TC-EXP-10 | P1 | 시도를 고르지 않은 전국 목록 | 카드 확인 | 카드에 시군구 칩이 붙지 않는다. 주소 줄이 시도를 이미 담고 있다 |
| TC-EXP-11 | P2 | 지역 목록 API 를 실패시킬 수 있는 환경(네트워크 차단 등) | 탐색 진입 | 지역 선택만 사라지고 목록·탭은 정상. 화면 전체가 죽지 않는다 |

## 3. 탐색 화면 — 검색·정렬·더보기 (SRC)

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-SRC-01 | P0 | — | 검색칸에 이름을 넣고 Enter | URL 에 `q` 가 붙고 목록이 좁혀진다. 카테고리·지역은 그대로 유지 |
| TC-SRC-02 | P1 | — | 검색 결과가 없는 말을 넣는다 | “Nothing matches “{입력한 말}”.” 로 **검색어를 되돌려 보여주고**, 버튼은 “Clear search”. 이 버튼은 카테고리·지역을 남기고 `q` 만 지운다 |
| TC-SRC-03 | P1 | — | 검색 없이 결과가 0인 필터 조합을 만든다 | “Nothing matches that combination.” + “Clear the filter”. 이 버튼은 카테고리만 남긴다 |
| TC-SRC-04 | P1 | — | `?q=%20` (공백만) 으로 접속 | 빈 검색이 아니라 일반 목록 |
| TC-SRC-05 | P1 | 검색을 한 상태 | 브라우저 뒤로가기 | 목록이 검색 전으로 돌아가고 **검색칸도 함께 비워진다**. 칸과 목록이 다른 말을 하면 실패 |
| TC-SRC-06 | P2 | 검색 결과 화면 | 연달아 다른 말로 검색 | 입력 칸에서 포커스가 빠지지 않는다 |
| TC-SRC-07 | P1 | — | 정렬을 Most liked 로 바꾼다 | URL `sort=likes`, 목록 상단 순서 변경. **스크롤 위치가 유지된다**(맨 위로 튀지 않는다) |
| TC-SRC-08 | P2 | — | 정렬을 다시 Most viewed 로 | 기본값이므로 URL 에서 `sort` 가 **빠진다** |
| TC-SRC-09 | P0 | — | 더보기를 1회 누른다 | 카드가 24개가 되고 URL `more=1`. **기존 카드는 그대로 남고** 새 12개만 등장 애니메이션. 스켈레톤이 다시 뜨면 실패 |
| TC-SRC-10 | P1 | — | 더보기를 반복해 상한까지 누른다 | `more` 는 최대 15, 최대 192개. 그 이상 눌러도 파라미터가 안 오른다 |
| TC-SRC-11 | P1 | — | 더보기로 늘린 상태에서 카테고리를 바꾼다 | `more` 가 초기화되고 12개부터 다시 시작 |
| TC-SRC-12 | P2 | 느린 네트워크(throttling) | 더보기 클릭 | 라벨이 대기 표시(점 3개)로 바뀐다 |
| TC-SRC-13 | P1 | — | 목록 전체를 훑는다 | **총 건수·페이지 번호가 어디에도 없다** (GOAL.md §0.5-3) |

## 4. 벽·카드 (WALL)

근거: `src/presentation/components/Wall.tsx`, `SpotFrame.tsx`, `src/application/spot/list-spots.ts`, `src/domain/spot/spot.ts`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-WALL-01 | P0 | — | 폭을 375 / 640 / 900 / 1280px 로 바꾼다 | 1 → 2 → 3 → 4열. 4열에서 카드 폭 약 274px, 제목이 3줄로 접히지 않는다 |
| TC-WALL-02 | P0 | — | 목록 전수 확인 | **이미지 없는 스팟이 하나도 없다.** `isDisplayableOnWall` 이 이미지 없는 항목을 거른다 |
| TC-WALL-03 | P1 | 실데이터(`USE_MOCK_DATA=false`), 관광지 탭 | 목록을 훑는다 | 성형외과·피부과 등 의료 항목(`lclsSystm3=EX050800`)이 나오지 않는다. 온천·찜질방은 나와도 된다 |
| TC-WALL-04 | P1 | — | 카드 사진 위에 마우스를 올린다 | 담기·좋아요 버튼이 사진 위에만 뜬다. 제목·주소 위에서는 뜨지 않는다 |
| TC-WALL-05 | P2 | — | 카드 이미지 비율 확인 | 원본 비율 그대로. 잘리거나 좌우에 빈 띠가 생기지 않는다 |
| TC-WALL-06 | P1 | Supabase 미설정 | 카드 하단 확인 | 조회·좋아요 줄이 **아예 그려지지 않는다**. 0 으로 표시되면 실패 |
| TC-WALL-07 | P1 | Supabase 설정 | 카드 하단 확인 | 조회수·좋아요 수가 서버가 그린 값으로 보인다 |
| TC-WALL-08 | P2 | Supabase 설정, 반응이 쌓인 상태 | 탐색 진입 | 반응이 많은 장소가 앞줄로 올라오되, **현재 카테고리에 속한 것만** 올라온다 |

## 5. 상세 화면 (DTL)

근거: `src/app/[locale]/spots/[id]/page.tsx`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-DTL-01 | P0 | — | 카드를 눌러 상세로 들어간다 | 분류·제목·한글명·사진·소개·사실 표가 한 흐름으로 위에서 아래로 놓인다 |
| TC-DTL-02 | P0 | 값이 비어 있는 항목이 있는 스팟 | 사실 표 확인 | 빈 항목도 행이 남고 값 자리에 “Not published” 가 이탤릭 회색으로 온다. 행을 숨기면 실패 (GOAL.md §5-3) |
| TC-DTL-03 | P1 | — | 사실 표의 좌우 단 확인 | 앞 절반이 왼쪽, 뒤 절반이 오른쪽. 지그재그가 아니다 |
| TC-DTL-04 | P1 | 한글명이 영문명과 다른 스팟 | 제목 아래 확인 | 한글 원명이 병기된다 (GOAL.md §5-2). 기울임꼴이 아니다 |
| TC-DTL-05 | P1 | 좌표가 있는 스팟 | “Open in maps” 클릭 | `map.kakao.com/link/map/{한글명},{lat},{lng}` 로 열린다. 한글명이 인코딩돼 있다 |
| TC-DTL-06 | P1 | 좌표가 없는 스팟 | 하단 액션 확인 | 지도 버튼이 없다. 죽은 링크가 남으면 실패 |
| TC-DTL-07 | P1 | 홈페이지 값이 있는 스팟 | “Official site” 클릭 | 공식 사이트가 새 탭으로 열린다 |
| TC-DTL-08 | P0 | — | `/en/spots/99999999` 접속 | “We couldn't find this place.” + 재시도/목록 버튼. 500 이 아니다 |
| TC-DTL-09 | P1 | — | 페이지 전체를 훑는다 | 제공기관 표기가 **하단 한 곳에만** 있다 (GOAL.md §0.5-6) |
| TC-DTL-10 | P2 | 소개가 긴 스팟 | 소개 확인 | 잘리거나 “이어서 읽기” 링크가 없다. 통째로 보인다 |

## 6. 상세에서 언어 전환 (RSV)

근거: `src/app/[locale]/spots/resolve/page.tsx`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-RSV-01 | P0 | 상세 화면 | 언어를 바꾼다 | `/{locale}/spots/resolve?ko={한글명}` 을 거쳐 리다이렉트된다. 중간 화면이 남지 않는다 |
| TC-RSV-02 | P0 | 두 언어 모두에 있는 스팟(예: 경복궁) | ko → en 전환 | 같은 장소의 영문 상세로 간다 |
| TC-RSV-03 | P0 | 반대 언어에 없는 스팟 | 언어 전환 | 목록(`/{locale}/explore`)으로 간다. 404 나 빈 상세가 아니다 |
| TC-RSV-04 | P1 | — | `/en/spots/resolve` 를 `ko` 없이 직접 접속 | 목록으로 리다이렉트 |
| TC-RSV-05 | P2 | — | 언어 드롭다운에 마우스를 올린다 | 목록으로 갈 수 있다는 안내(`detail.localeSwitchNote`)가 뜬다 |
| TC-RSV-06 | P2 | 조회 실패를 만들 수 있는 환경 | 언어 전환 | 에러 화면 없이 목록으로 간다 |

## 7. 반응 API (API)

근거: `src/app/api/spots/[key]/like/route.ts`, `view/route.ts`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-API-01 | P0 | Supabase 설정 | `POST /api/spots/경복궁/like` body `{"visitorId":"uuid"}` (키는 URL 인코딩) | 200 + 바뀐 총수 JSON |
| TC-API-02 | P0 | 위와 같음 | 같은 방문자로 한 번 더 | 좋아요가 해제되고 총수가 1 줄어든다. 화면 상태를 서버가 받지 않는다 |
| TC-API-03 | P0 | — | body 를 `{}` 로 POST | 400 `bad-request` |
| TC-API-04 | P0 | — | body 를 JSON 이 아닌 문자열로 POST | 400 `bad-request` |
| TC-API-05 | P0 | Supabase 미설정 | like / view 각각 POST | 503 `stats-disabled` |
| TC-API-06 | P1 | 저장소 오류를 만들 수 있는 환경 | like POST | 502 `upstream`. 200 으로 삼키면 실패 |
| TC-API-07 | P0 | Supabase 설정 | `POST /api/spots/{키}/view` | 200 + `{likes, views}` |
| TC-API-08 | P0 | 위와 같음 | 같은 방문자 id 로 같은 날 2회 | 두 번째에도 200 이지만 `views` 가 오르지 않는다 |
| TC-API-09 | P1 | 위와 같음 | 다른 방문자 id 로 호출 | `views` 가 오른다 |
| TC-API-10 | P1 | 조회 기록은 되지만 읽기가 실패하는 상황 | view POST | 200 + 빈 JSON 또는 204. 사용자에게 오류가 노출되지 않는다 |
| TC-API-11 | P1 | — | 한글·공백이 든 키를 인코딩해 호출 | 정상 처리. 서버가 `decodeURIComponent` 로 푼다 |
| TC-API-12 | P2 | — | 통계 키가 될 수 없는 값(빈 문자열 등)으로 like | 400 `not-countable` |

## 8. 담기·좋아요·조회 화면 동작 (RCT)

근거: `personal-set.ts`, `use-spot-like.ts`, `live-stats.ts`, `visitor.ts`, `ViewCounter.tsx`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-RCT-01 | P0 | — | 카드에서 담기를 누른다 | 아이콘이 채워지고 `localStorage["seoul-tour:saved"]` 에 키가 들어간다. 새로고침해도 유지 |
| TC-RCT-02 | P1 | — | 상세에서 담기 → 목록으로 돌아온다 | 같은 스팟 카드가 담긴 상태로 보인다 |
| TC-RCT-03 | P1 | 탭 2개에 같은 목록 | 한쪽에서 담기 | 다른 탭에도 즉시 반영된다(`storage` 이벤트) |
| TC-RCT-04 | P0 | Supabase 설정 | 좋아요를 누른다 | 하트가 켜지고 **서버가 돌려준 총수**로 숫자가 갱신된다. 낙관적 +1 로 먼저 오르면 실패 |
| TC-RCT-05 | P0 | 좋아요 API 를 502 로 만들 수 있는 환경 | 좋아요를 누른다 | 하트가 **원래대로 되돌아간다.** 켜진 채 남으면 실패 |
| TC-RCT-06 | P1 | 같은 장소가 목록에 두 번 이상 뜨는 상태 | 한쪽에서 좋아요 | 같은 장소의 다른 카드 숫자도 함께 바뀐다 |
| TC-RCT-07 | P2 | — | 좋아요를 켠다 / 끈다 | 켤 때만 하트 버스트가 재생된다. 해제 때는 없다 |
| TC-RCT-08 | P1 | 저장소를 막은 브라우저(사생활 모드) | 담기·좋아요를 누른다 | 예외로 화면이 죽지 않는다. 방문자 id 가 없어 좋아요 요청은 나가지 않는다 |
| TC-RCT-09 | P0 | Supabase 설정 | 상세를 연다 | `POST /view` 가 **1회만** 나간다. 서버 렌더에서 세지 않는다 |
| TC-RCT-10 | P1 | 위와 같음 | 상세를 새로고침 | 조회수가 오르지 않는다(같은 방문자·같은 날) |
| TC-RCT-11 | P2 | — | 좋아요 직후 바로 숫자를 본다 | 하트 애니메이션(420ms)이 끝난 뒤 숫자가 바뀐다. 애니메이션 중간에 튀지 않는다 |

## 9. 내 위치·거리 (NEAR)

근거: `src/presentation/lib/near-me.ts`, `NearMeToggle.tsx`, `SpotDistance.tsx`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-NEAR-01 | P1 | 위치 권한이 아직 없는 프로필 | 탐색 화면 진입 | 브라우저 위치 권한 창이 **한 번** 뜬다. 카드 수만큼 반복되면 실패 |
| TC-NEAR-02 | P1 | 권한 허용 | 목록 확인 | 카드에 거리 표시, 토글 라벨이 “Showing distance” |
| TC-NEAR-03 | P1 | 권한 거부 | 토글·카드 확인 | 라벨이 “Location access is blocked”, 거리 없음. 로딩 상태에 머물지 않는다 |
| TC-NEAR-04 | P1 | 권한 거부 상태 | 새로고침 | 권한 창이 다시 뜨지 않고 즉시 차단 상태로 표시된다 |
| TC-NEAR-05 | P0 | 권한 허용 상태 | 토글을 끈다 → 새로고침 | `localStorage["seoul-tour:near-me"] = "0"`. 재방문 시 **자동으로 권한을 묻지 않는다** |
| TC-NEAR-06 | P1 | — | 거리 토글을 켜고 끈다 | URL 이 바뀌지 않고 목록도 다시 불러오지 않는다 |
| TC-NEAR-07 | P1 | — | 홈(`/{locale}`) 에 머문다 | 위치 권한을 묻지 않는다. 탐색 화면에서만 묻는다 |
| TC-NEAR-08 | P2 | geolocation 없는 환경 | 탐색 진입 | 토글이 미지원 상태로 표시되고 오류가 나지 않는다 |

## 10. 날씨·미세먼지 (WTH)

근거: `Masthead.tsx`, `WeatherWidget.tsx`, `src/application/weather/get-today-weather.ts`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-WTH-01 | P1 | — | 헤더 확인 | 날씨 칩이 뜬다. 준비 전에는 스켈레톤이고 화면 전체를 막지 않는다 |
| TC-WTH-02 | P1 | — | 칩을 누른다 | 패널이 열리고 기온·체감·최저/최고·습도·바람·미세먼지·옷차림이 보인다 |
| TC-WTH-03 | P0 | 에어코리아만 실패시킬 수 있는 환경 | 패널 확인 | 날씨는 정상, 미세먼지 자리에만 “No air reading right now.” |
| TC-WTH-04 | P1 | — | 미세먼지 등급 확인 | PM10·PM2.5 중 **나쁜 쪽** 등급이 종합값이 되고 등급별 색이 다르다 |
| TC-WTH-05 | P2 | — | 옷차림 문구 확인 | 체감온도 구간에 맞는 문구 하나 + 우산/마스크/바람막이 등 부가 항목 |
| TC-WTH-06 | P2 | — | 하단 주석 확인 | 관측 시각과 측정소 이름이 로케일 문구로 채워진다(`{time}`·`{station}` 이 그대로 남으면 실패) |
| TC-WTH-07 | P1 | 패널이 열린 상태 | 패널 바깥을 클릭 / Esc | 패널이 닫힌다 |
| TC-WTH-08 | P2 | 로케일 ko 외 | 지역명 확인 | `weather.regions` 로 번역된 이름(Seoul 등)으로 보인다 |

## 11. 테마 (THM)

근거: `src/presentation/lib/theme.ts`, `ThemeToggle.tsx`, `layout.tsx`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-THM-01 | P0 | 쿠키 없음 | 테마 버튼을 누른다 | `<html data-theme>` 가 바뀌고 쿠키 `seoul_tour_theme` 가 1년 만료로 저장된다 |
| TC-THM-02 | P0 | 테마를 고른 상태 | 새로고침 | **첫 페인트부터** 고른 테마다. 흰 화면이 번쩍이면 실패 |
| TC-THM-03 | P1 | 쿠키 없음 + OS 다크 | 버튼을 한 번 누른다 | 라이트로 간다(현재 보이는 것의 반대) |
| TC-THM-04 | P1 | — | 라이트·다크 각각에서 배경색을 뽑는다 | `#FFFFFF` 가 쓰이지 않는다 (GOAL.md §6) |
| TC-THM-05 | P2 | 다크 테마 | 전 화면을 훑는다 | 글자·테두리 대비가 유지되고 읽히지 않는 자리가 없다 |

## 12. 화면 상태 유지 (STA)

근거: `ScrollMemory.tsx`, `StickyFilterSync.tsx`, `DismissOnOutside.tsx`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-STA-01 | P0 | 목록을 한참 내린 상태 | 카드 클릭 → 상세 → 뒤로가기 | 보던 스크롤 위치로 돌아온다 |
| TC-STA-02 | P1 | 위와 같음 | 복귀 도중 사용자가 스크롤·키 입력을 한다 | 복원이 중단되고 사용자 조작이 이긴다 |
| TC-STA-03 | P1 | — | 카테고리·지역을 바꾼다 | 목록 맨 위에서 시작한다 |
| TC-STA-04 | P1 | — | 목록을 내린다 | 필터 바가 헤더 아래에 붙고 헤더가 줄어든다. 붙는 순간 내용이 위아래로 튀지 않는다 |
| TC-STA-05 | P1 | 언어 드롭다운이 열린 상태 | 바깥 클릭 / Esc / 항목 클릭 | 각각 닫힌다 |
| TC-STA-06 | P2 | 홈 ↔ 탐색 이동 | 전환 애니메이션 확인 | 헤더는 고정된 채 머리말이 크기만 바뀐다. 화면 전체가 크로스페이드하면 실패 |
| TC-STA-07 | P1 | 탐색 화면 | 필터를 여러 번 바꾼다 | 바뀔 때마다 화면 전체가 페이드하지 않고 목록만 갱신된다 |

## 13. 데이터 소스·환경 (ENV)

근거: `src/infrastructure/config/env.ts`, `src/presentation/lib/container.ts`

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-ENV-01 | P0 | `USE_MOCK_DATA` 미설정 | 탐색 진입 | mock 데이터가 나온다. **미설정은 mock 이다** — `"false"` 일 때만 실데이터 |
| TC-ENV-02 | P0 | `USE_MOCK_DATA=false`, `TOUR_API_KEY` 유효 | 6개 로케일 탐색·상세 | 실데이터가 나오고 언어별 서비스(Kor/Eng/Jpn/Cht/Ger/Fre)가 각각 응답한다 |
| TC-ENV-03 | P1 | `USE_MOCK_DATA=false`, `TOUR_API_KEY` 없음 | 탐색 진입 | “환경 변수 TOUR_API_KEY 가 비어 있다” 로 명시적으로 실패한다. 빈 목록으로 조용히 넘어가면 실패 |
| TC-ENV-04 | P1 | 인코딩된 인증키(%2F 포함)를 넣는다 | 실데이터 조회 | 403 이 나는지 확인. 키는 **디코딩된 값**이어야 한다 |
| TC-ENV-05 | P0 | Supabase 키 미설정 | 전 화면 | 장소는 정상적으로 보이고 반응 UI 만 사라진다. 화면이 죽으면 실패 |
| TC-ENV-06 | P1 | `USE_MOCK_DATA=false`, 날씨 전용 키 미설정 | 날씨 칩 | `TOUR_API_KEY` 로 폴백해 정상 동작 |

## 14. 보안 (SEC)

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-SEC-01 | P0 | `pnpm build` 완료 | `grep -r "$TOUR_API_KEY" .next/static` | 결과 없음. 클라이언트 번들에 인증키가 없다 (GOAL.md §6) |
| TC-SEC-02 | P0 | 실데이터 모드 | 브라우저 Network 탭 확인 | `apis.data.go.kr` 로 나가는 요청이 브라우저에서 하나도 없다. TourAPI 는 서버에서만 부른다 |
| TC-SEC-03 | P0 | — | `grep -r "SERVICE_ROLE" src` | 서버 코드에서도 service role 키를 쓰지 않는다. 공개키만 쓴다 |
| TC-SEC-04 | P1 | — | like/view 에 남의 `visitorId` 를 넣어 호출 | 임의 조작은 가능하지만 총수 외 개인정보가 응답에 없다 (현 설계상 익명 id 임을 확인만 한다) |

## 15. 접근성 (A11Y)

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-A11Y-01 | P1 | — | 키보드만으로 탐색 화면을 조작 | 카테고리·지역·정렬·검색·카드까지 Tab 으로 닿고 Enter 로 동작한다 |
| TC-A11Y-02 | P1 | — | 스크린 리더로 필터 확인 | 선택된 탭·정렬에 `aria-current`, 정렬 묶음에 이름(“Sort”)이 있다 |
| TC-A11Y-03 | P1 | — | 목록의 접근성 이름 확인 | “{카테고리} — {지역}” 형태로 읽힌다. 내부 은유(‘벽’ 등)가 노출되지 않는다 |
| TC-A11Y-04 | P1 | — | 담기·좋아요 버튼 확인 | `aria-pressed` 로 상태를 알리고 라벨에 장소명이 들어간다 |
| TC-A11Y-05 | P2 | — | 포커스 이동 | 포커스 링이 모든 컨트롤에서 보인다 |
| TC-A11Y-06 | P1 | — | 다국어 본문 확인 | 소개·주소 등 본문 블록에 `lang` 속성이 붙는다 |
| TC-A11Y-07 | P2 | — | 날씨 패널 확인 | `role="group"` + 이름이 있고 초점을 가두지 않는다 |

## 16. 반응형·성능 (RSP)

| ID | P | 사전조건 | 절차 | 기대 결과 |
|---|---|---|---|---|
| TC-RSP-01 | P0 | — | 375px 폭에서 홈·탐색·상세를 훑는다 | **가로 스크롤이 없다** (GOAL.md §6) |
| TC-RSP-02 | P1 | 375px | 필터 바 확인 | 검색·정렬이 줄바꿈되어 잘리지 않는다 |
| TC-RSP-03 | P2 | 좁은 화면 | 홈 확인 | 연결망 그림이 숨고 글만 남는다 |
| TC-RSP-04 | P1 | 느린 3G throttling | 탐색 진입 | 머리말·카테고리 탭이 먼저 뜨고 목록만 스켈레톤. 필터는 그동안에도 조작 가능하다 |
| TC-RSP-05 | P2 | — | 상세 진입 | 대표 이미지가 우선 로드된다(`priority`) |

## 17. 정적 검증 (AUTO)

| ID | P | 명령 | 기대 결과 |
|---|---|---|---|
| TC-AUTO-01 | P0 | `pnpm test` | 전 테스트 통과. skip 이 있으면 개수와 이유를 보고에 적는다 |
| TC-AUTO-02 | P0 | `pnpm typecheck` | 에러 0 |
| TC-AUTO-03 | P1 | `pnpm lint` | 에러 0 |
| TC-AUTO-04 | P0 | `pnpm build` | 빌드 성공 (GOAL.md §6) |

기존 자동화 테스트(`tests/`, 20개 파일)가 이미 덮는 영역 — 아래는 수동 TC 를 만들지 않았다.

| 영역 | 파일 |
|---|---|
| 좌표·이미지·분류·스팟명 파싱 | `tests/domain/{coordinate,image,category,spot-name,spot}.test.ts` |
| 통계 키 정규화 | `tests/domain/spot-stats.test.ts` |
| 날씨 하늘상태·체감온도·옷차림·미세먼지 등급 | `tests/domain/{weather-sky,apparent-temperature,weather-outfit,weather-air-quality}.test.ts` |
| TourAPI·기상청·에어코리아 응답 매핑 | `tests/infrastructure/*.test.ts` |
| 탐색 URL 생성·더보기 계산 | `tests/presentation/{explore-href,explore-paging}.test.ts` |
| 유스케이스 조합 | `tests/application/*.test.ts` |

---

## 미작성 영역 (기능 없음)

GOAL.md §3 의 v1 목록 중 아래는 코드에 없어 TC 를 쓰지 않았다. 구현되면 이 문서에 절을 추가한다.

- 지도 기반 주변 탐색 (카카오맵) — `listNearbySpots` 유스케이스는 있으나 이를 쓰는 화면이 없다
- AI 일정 추천 (Claude API 라우트)
- 코스 저장·공유 (`courses`·`course_items` 테이블, `share_slug`)
- 로그인 (Google OAuth / 매직 링크) 및 RLS 검증
