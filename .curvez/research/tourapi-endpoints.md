# tourapi-endpoints

- **조사 질문:** TourAPI 의 실제 엔드포인트 호스트·경로·오퍼레이션 버전 접미사는 무엇이고, 영문 서비스가 별도로 존재하는가?
- **조사 일자:** 2026-08-19
- **기준 버전:** next@16.3.1, node@24.19.0 — 근거: `package.json`, `node -v`. TourAPI 는 버전 개념 대신 오퍼레이션명 접미사를 쓴다
- **결론 한 줄:** 국문 서비스의 base URL 은 `https://apis.data.go.kr/B551011/KorService2` 이고 오퍼레이션 접미사는 `2` 다(`locationBasedList2`). **영문 서비스의 별도 데이터셋 존재 여부는 확인하지 못했다.** 또 파라미터 목록에 `areaCode` 가 보이지 않고 `lDongRegnCd`(법정동 코드)가 있어, 서울 필터링 방식이 기존 관례와 다를 수 있다.

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | Service URL 은 `https://apis.data.go.kr/B551011/KorService2` 다 | https://www.data.go.kr/en/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 2 | 오퍼레이션명에 버전 접미사 `2` 가 붙는다. 문서 예시 엔드포인트는 `https://apis.data.go.kr/B551011/KorService2/locationBasedList2` 다 | https://www.data.go.kr/en/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 3 | 데이터셋 이름은 `한국관광공사_국문 관광정보 서비스_GW` 이고 데이터셋 ID 는 15101578 이다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 4 | 필수 파라미터에 `serviceKey`(인증키), `MobileOS`, `MobileApp` 이 있다. `MobileOS` 는 `IOS`(iPhone) / `AND`(Android) / `WEB`(Web) / `ETC`(Other) 중 하나다 | https://www.data.go.kr/en/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 5 | `locationBasedList2` 는 `mapX`(WGS84 경도), `mapY`(WGS84 위도), `radius`(미터 단위 반경)를 받는다. **`radius` 최대값은 20000m = 20km** 다 | https://www.data.go.kr/en/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 6 | 선택 파라미터에 `numOfRows`, `pageNo`, `_type`, `arrange`, `contentTypeId`, `modifiedtime`, `lDongRegnCd`, 분류체계 코드가 있다 | https://www.data.go.kr/en/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 7 | REST 방식이며 응답 포맷은 JSON 과 XML 을 지원한다 (`_type` 파라미터로 지정) | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 8 | 제공 데이터는 15종 약 26만 건이며 지역코드정보, 서비스분류코드정보, 법정동코드정보, 분류체계코드정보, 지역기반관광정보, 위치기반관광정보, 키워드검색, 행사정보, 숙박정보 등을 포함한다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | KorService2 |
| 9 | 인증키는 공공데이터포털(data.go.kr)에서 회원가입 후 활용신청으로 발급받는다 | https://www.data.go.kr/data/15101578/openapi.do | A | 2026-08-19 | — |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | **영문 서비스(EngService2 등)의 별도 데이터셋 ID 와 정확한 서비스명** | 검색어를 3회 바꿔도 A 등급 출처에서 영문 서비스 데이터셋 페이지를 찾지 못했다. data.go.kr 영문 페이지가 답한 "available in English" 는 **포털 UI 언어**를 뜻하는 것으로 읽히며 별도 API 서비스의 근거가 아니다 | 국문 서비스가 `KorService2` 라는 것까지만 확인됐다 (사실 1). 서비스명 접두사가 언어를 나타낸다는 규칙 자체는 확인하지 못했다 |
| 2 | **`areaCode` / `sigunguCode` 파라미터가 KorService2 에 존재하는지** | data.go.kr 상세 페이지에서 추출된 파라미터 목록에 `areaCode` 가 없고 `lDongRegnCd`(법정동 시도 코드)가 있다. 전체 파라미터 표를 열지 못해 부재인지 추출 누락인지 판정할 수 없다 | 선택 파라미터에 `lDongRegnCd` 가 있다는 것까지 확인됐다 (사실 6) |
| 3 | `contentTypeId` 의 값 목록 (관광지·문화시설·축제·숙박·쇼핑·음식점 등의 코드) | 상세 페이지의 코드 표를 추출하지 못했다. 활용 매뉴얼(`개방데이터_활용매뉴얼(국문).zip`)에 있을 것으로 보이나 zip 파일이라 열지 못했다 | `contentTypeId` 라는 파라미터가 존재한다는 것까지 확인됐다 (사실 6) |
| 4 | 인증키의 Encoding / Decoding 두 형태 중 어느 것을 `serviceKey` 에 넣어야 하는지 | 상세 페이지에서 해당 안내를 추출하지 못했다 | `serviceKey` 가 필수 파라미터라는 것까지 확인됐다 (사실 4) |
| 5 | 일일 트래픽 제한과 개발계정/운영계정 승인 방식의 차이 | 상세 페이지의 활용신청 섹션을 추출하지 못했다 | 활용신청이 필요하다는 것까지 확인됐다 (사실 9) |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| 서울 지역 필터링을 `areaCode=1` 로 할 것인가 `lDongRegnCd` 로 할 것인가 | 판정 보류 — 확인 불가 2번으로 올렸다. https://www.data.go.kr/en/data/15101578/openapi.do | — | 모순 처리 5번(더 보수적인 쪽)을 적용하면 "확인된 파라미터만 쓴다" 가 되지만, 이 결정은 `.curvez/architecture.md` 와 `GOAL.md` 에 이미 `areaCode = 1` 로 적혀 있어 조용히 뒤집지 않는다. `blocked_on` 으로 올린다 |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|

사실 확인형 조사이므로 비운다.

## 조사 경로

- 단서로 본 C 등급: velog 의 TourAPI 사용기 여러 건(검색 결과 목록에만 등장, 인용하지 않음). 여기서 `apis.data.go.kr/B551011/...` 라는 호스트 패턴을 단서로 얻어 data.go.kr 공식 상세 페이지로 이동했다
- `https://api.visitkorea.or.kr/#/cmsNoticeDetail?no=207` 을 열었으나 JS 렌더링 SPA 라 본문이 추출되지 않았다 (제목만 반환)
- `https://www.data.go.kr/data/15101578/openapi.do`(국문)는 세부 파라미터가 추출되지 않았고, `https://www.data.go.kr/en/data/15101578/openapi.do`(영문)에서 엔드포인트와 파라미터가 추출됐다
- 검색어: `한국관광공사 TourAPI 4.0 EngService areaBasedList2 엔드포인트 apis.data.go.kr` / `apis.data.go.kr B551011 KorService2 EngService2 areaBasedList2 detailCommon2 TourAPI` / `공공데이터포털 한국관광공사 영문 관광정보 서비스 EngService2 활용신청`
- 웹 도구 호출 횟수: 5/30

## 이 프로젝트에 미치는 영향

| 영향 | 어디에 | 무엇이 어긋나는가 |
|---|---|---|
| 지역 필터 | `GOAL.md` §4 데이터 소스, `.curvez/design/index.md` | `서울 areaCode = 1` 로 적혀 있으나 KorService2 의 파라미터 목록에서 `areaCode` 를 확인하지 못했다. `lDongRegnCd` 로 바뀌었다면 서울 25개 구 필터의 코드 체계가 통째로 달라진다 |
| 카테고리 색 매핑 | `.curvez/design/tokens.md` 의 `--color-accent-*` | `contentTypeId` 값(12/14/15/…)을 근거 없이 GOAL 에 적어뒀다. 이 브리프에서 확인하지 못했으므로 실키 발급 후 실제 응답으로 검증해야 한다 |
| 반경 탐색 | `.curvez/design/screens/` 의 지도 화면(미작성) | `radius` 최대 20km 다 (사실 5). 서울 전역이 대략 동서 30km 이므로 한 번의 호출로 서울 전체를 덮을 수 없다 |
| 다국어 | `GOAL.md` §4 "국문/영문이 별도 엔드포인트" | 이 전제를 **확인하지 못했다**. 영문 서비스가 없거나 다른 방식이면 i18n 데이터 계층 설계가 달라진다 |
