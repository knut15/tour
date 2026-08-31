# tourapi-manual-v44

공식 매뉴얼 `한국관광공사_개방데이터_활용매뉴얼(영문)_v4.4.docx` 를 사용자가 제공해 확인했다.
**A 등급 1차 출처**이며 앞선 브리프들의 `확인 불가` 상당수를 해소한다.

- **조사 질문:** 영문 서비스의 공식 명세(오퍼레이션·파라미터·코드표·제약)는 무엇이고, 이미지 결손과 의료관광 혼입을 API 수준에서 다룰 수 있는가?
- **조사 일자:** 2026-08-19
- **기준 버전:** EngService2 (서비스 버전 4.0, 시작일 2022-08-02), 매뉴얼 v4.4
- **결론 한 줄:** **의료관광은 `lclsSystm2=EX05`(Wellness Tourism)로 정확히 분류돼 있어 배제 가능하다.** `arrange=O/Q/R` 은 필터가 아니라 **이미지 보유 항목을 앞으로 보내는 정렬**이라 앞에서부터 가져오면 이미지 있는 것만 얻는다. 다만 **이미지의 77%가 `cpyrhtDivCd=Type3`(변경금지)** 라 크롭이 제약된다.

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | 공식 ContentTypeId 코드표: 관광지 76, 문화시설 78, 행사/공연/축제 85, 레포츠 75, 숙박 80, 쇼핑 79, 음식점 82, 교통 77(다국어만 서비스). **여행코스는 "국문만 서비스"** 로 명시 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 2 | 오퍼레이션 12종: `areaBasedList2`, `locationBasedList2`, `searchKeyword2`, `searchFestival2`, `searchStay2`, `detailCommon2`, `detailIntro2`, `detailInfo2`, `detailImage2`, `areaBasedSyncList2`, `ldongCode2`, `lclsSystmCode2` | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 3 | **개발계정은 일 1,000건의 트래픽을 제공한다.** 자동승인이며 활용신청 후 약 10분 이후 사용 가능하다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 4 | `serviceKey` 항목 설명이 **"인증키 (URL-Encode)"** 다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 5 | **`arrange` 값: A=제목순, C=수정일순, D=생성일순 / O=제목순, Q=수정일순, R=생성일순 — 뒤 3개는 "대표 이미지가 반드시 있는 정렬"** | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 6 | **`arrange=Q` 는 필터가 아니라 정렬이다(실측).** 서울 관광지(76) `arrange=Q` 의 `totalCount` 는 405 로 필터 전 값이고, 페이지별 이미지 보유는 p1 100/100, p2 37/100, p3~p5 0/100 이다. 합계 137/405 로 전수 스캔 값과 일치한다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 7 | **의료관광 항목은 `lclsSystm1=EX`, `lclsSystm2=EX05`, `lclsSystm3=EX050800` 으로 분류된다(실측).** 성형외과·피부과·안과 5건이 전부 동일했다. `cat1/cat2/cat3` 는 `A02/A0202/A02020500` 이다 | https://apis.data.go.kr/B551011/EngService2/searchKeyword2 | A | 2026-08-19 | EngService2 |
| 8 | **`EX05` 의 이름은 `Wellness Tourism` 이다.** EX 대분류의 중분류: EX01 Traditional Experiences, EX02 Craft Experiences, EX03 Farming, EX04 Temple Stay Experiences, **EX05 Wellness Tourism**, EX06 Industrial Tourism, EX07 Other Experiences | https://apis.data.go.kr/B551011/EngService2/lclsSystmCode2 | A | 2026-08-19 | EngService2 |
| 9 | 정상 관광지의 분류는 다르다(실측): 덕수궁 대한문 `HS/HS01/HS010300`, 경희궁 `HS/HS01/HS010100`, 창덕궁 다래나무 `NA/NA03/NA030200`, 세라믹 팔레스 홀 `VE/VE06/VE060100` | https://apis.data.go.kr/B551011/EngService2/searchKeyword2 | A | 2026-08-19 | EngService2 |
| 10 | `lclsSystmCode2` 대분류 9종: `AC` Accommodation, `EV` Festivals/Performances/Events, `EX` Experiential Tourism, `FD` Food, `HS` Historical Tourism, `LS` Leisure Sports, `NA` Nature Tourism, `SH` Shopping, `VE` Cultural Tourism | https://apis.data.go.kr/B551011/EngService2/lclsSystmCode2 | A | 2026-08-19 | EngService2 |
| 11 | **`cpyrhtDivCd`(저작권 유형): `Type1`=제1유형(출처표시-권장), `Type3`=제3유형(제1유형+변경금지)** | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 12 | **서울 관광지 이미지 보유 100건 표본의 저작권 분포는 `Type3` 77건, `Type1` 23건이다(실측).** 즉 **77% 가 변경금지**다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 13 | `firstimage` 는 **약 500×333**, `firstimage2`(썸네일)는 **약 150×100** 이다. 둘 다 3:2 이며 내가 실측한 최빈값 1.5 와 일치한다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 14 | 지역 파라미터는 `lDongRegnCd`(법정동 시도)·`lDongSignguCd`(법정동 시군구)로 문서화돼 있고, 예제에서 서울은 `lDongRegnCd=11` 이다. **매뉴얼 v4.4 의 파라미터 표에 `areaCode`/`sigunguCode` 는 없다** — 그러나 실측상 동작한다(`tourapi-endpoints-v2.md` 사실 2·3) | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 15 | 데이터 갱신주기는 일 1회다. 문의처는 `tourapi@knto.or.kr` / 070-4287-3219 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |
| 16 | 에러코드 표: 30=`SERVICE_KEY_IS_NOT_REGISTERED_ERROR`(등록되지 않은 서비스키), 12=`NO_OPENAPI_SERVICE_ERROR`(해당 오픈API서비스가 없거나 폐기됨), 22=요청제한횟수 초과, 31=활용기간 만료, 03=`NODATA_ERROR`. 앞선 브리프의 30/12 해석이 공식 표와 일치한다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | 매뉴얼 v4.4 |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | `EX05`(Wellness Tourism)를 제외하면 서울 관광지가 몇 건 남는지 | `lclsSystm2` 제외 조건을 API 파라미터로 줄 수 없다(포함 필터만 있다). 클라이언트에서 걸러야 하므로 전수 조회 후 계산이 필요하다 | 파라미터로 `lclsSystm2=EX05` **포함** 조회는 가능하다 (사실 7·8) |
| 2 | `Type3`(변경금지) 이미지에 매트를 두르는 것이 "변경" 에 해당하는지 | 법적 해석이 필요하다. 매뉴얼에 이미지 가공 범위에 대한 설명이 없다 | 77% 가 Type3 라는 것까지 확인됐다 (사실 12) |
| 3 | 운영계정 승인 조건과 트래픽 한도 | 매뉴얼은 개발계정만 명시한다 (사실 3) | 개발계정 일 1,000건까지 확인됐다 |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| `arrange=O/Q/R` 이 필터인가 정렬인가 | **정렬** — https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | 매뉴얼 문구 "대표 이미지가 반드시 있는 정렬" 을 필터로 읽는 해석 | 모순 처리 2번: 문서와 실제 동작이 다르면 실제 동작이 이긴다. `totalCount` 가 405 로 동일하고 3페이지부터 이미지 0건이 나온다(사실 6). 다만 결과가 앞에 몰리므로 **실용적으로는 필터처럼 쓸 수 있다** |
| 지역 필터를 `areaCode` 로 쓸 것인가 `lDongRegnCd` 로 쓸 것인가 | **`areaCode`** — https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | `lDongRegnCd` (매뉴얼 v4.4 의 문서화된 파라미터) | 실측으로 `areaCode=1`·`sigunguCode=1~25` 가 동작하고 `areaCode2` 로 코드 목록도 얻는다. `lDongRegnCd` 는 코드 체계가 달라(서울=11) 추가 매핑이 필요하다. **단 매뉴얼에 없는 파라미터에 의존하므로 폐기 위험이 있다** — `decisions` 에 되돌릴 위치를 남긴다 |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|
| `arrange=Q` 로 이미지 있는 항목을 앞에서 가져온다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | 필터가 아니라 정렬이라 `totalCount` 를 페이지네이션 근거로 쓸 수 없다 | **한 화면 6~9개만 쓰는 이 앱에 최적이다.** 1페이지만 가져와도 전부 이미지 있는 항목이다 |
| 전수 조회 후 클라이언트에서 이미지 없는 항목 제거 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | 405건을 5회 호출해야 한다. 일 1,000건 한도에서 카테고리 4개 × 25개 구면 금방 소진된다 | 캐싱과 함께라면 가능하나 호출 비용이 크다 |

## 조사 경로

- 사용자가 공식 매뉴얼 docx 를 제공했다. `word/document.xml` 을 파싱해 표 구조를 보존한 텍스트로 변환했다 (754줄)
- 매뉴얼에서 얻은 단서(`arrange` 의 O/Q/R, `lclsSystm`, `cpyrhtDivCd`)를 **전부 실제 호출로 재검증**했다. 그 과정에서 매뉴얼 문구와 실제 동작의 차이(사실 6)를 발견했다
- 검색어: 없음
- 웹 도구 호출 횟수: 0/30 (로컬 파일 + API 직접 호출)

## 이 프로젝트에 미치는 영향

| 영향 | 어디에 | 무엇을 고쳐야 하는가 |
|---|---|---|
| **의료관광 혼입** | `.curvez/design/index.md` 미결 질문 | **해소됐다.** `lclsSystm2 === "EX05"` 인 항목을 관광지 목록에서 제외한다. 클라이언트 필터가 필요하다(확인 불가 1) |
| **이미지 결손** | `.curvez/design/index.md`, `explore.md` | **`arrange=Q` 로 해결된다.** 앱이 한 화면에 6~9개만 쓰므로 1페이지 조회로 충분하고 그 결과는 전부 이미지 보유다. "클라이언트에서 걸러낸다" 는 앞선 결정보다 낫다 |
| **이미지 크롭** | `.curvez/design/components/SpotFrame.md` | **77% 가 `Type3`(변경금지)다.** 액자에 맞추려고 이미지를 크롭하면 저작권 조건을 위반할 소지가 있다. 매트로 감싸는 방식(이미 채택)이 크롭 없이 비율을 흡수하므로 **크롭 금지를 명시**해야 한다. 출처 표시는 `Type1`·`Type3` 모두 권장/요구된다 |
| **호출 예산** | `src/infrastructure/tourapi/` (미구현) | **개발계정 일 1,000건**이다. 카테고리 4개 × 구 25개 = 100 조합만 훑어도 10%를 쓴다. 서버 캐싱이 선택이 아니라 필수다 |
| **여행코스** | `GOAL.md` §4 | "국문만 서비스" 로 공식 명시됐다(사실 1). 앞선 실측(서울 0건)과 일치한다 |
| **지역 파라미터** | `src/infrastructure/tourapi/` (미구현) | `areaCode` 는 매뉴얼 v4.4 에 문서화돼 있지 않다(사실 14). 동작하지만 폐기 위험이 있으므로 어댑터 한 곳에 격리해 `lDongRegnCd` 로 갈아탈 수 있게 만든다 |
