# tourapi-endpoints-v2

`tourapi-endpoints.md` 의 후속이다. 실키가 발급돼 **실제 호출로 확인**했으므로 v1 의 `확인 불가` 5건 중 4건이 해소됐다.
v1 을 고치지 않고 새로 쓴다.

- **조사 질문:** TourAPI 의 엔드포인트·인증키 형태·영문 서비스·서울 지역 코드·데이터 규모를 실제 호출로 확정한다
- **조사 일자:** 2026-08-19
- **기준 버전:** KorService2 / EngService2, node@24.19.0. 인증키는 `.env.local` 의 `TOUR_API_KEY`
- **결론 한 줄:** 국문은 `KorService2`, **영문은 `EngService2` 로 존재하나 이 키에 활용신청이 안 돼 있다.** `areaCode=1`(서울)·`sigunguCode=1~25`(25개 구)가 유효하다. **인증키는 디코딩 형태로 저장하고 `URLSearchParams` 로 넘겨야 한다** — 인코딩 키를 `URLSearchParams` 에 넣으면 이중 인코딩으로 403 이 난다.

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | `KorService2/areaBasedList2` 호출이 `resultCode: "0000"`, `resultMsg: "OK"` 로 성공한다. 응답에 `addr1`, `areacode`, `cat1~cat3`, `contentid`, `contenttypeid`, `firstimage`, `firstimage2`, `createdtime` 필드가 있다 | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | A | 2026-08-19 | KorService2 |
| 2 | **`areaCode=1` 이 서울이다.** 응답 항목의 `areacode` 가 `"1"` 이고 `addr1` 이 `서울특별시 …` 로 시작한다 | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | A | 2026-08-19 | KorService2 |
| 3 | **`sigunguCode` 파라미터가 유효하며 서울은 1~25 다.** `areaCode2` 오퍼레이션으로 조회한 결과: 1=강남구, 2=강동구, 3=강북구, 4=강서구, 5=관악구, 6=광진구, 7=구로구, 8=금천구, 9=노원구, 10=도봉구, 11=동대문구, 12=동작구, 13=마포구, 14=서대문구, 15=서초구, 16=성동구, 17=성북구, 18=송파구, 19=양천구, 20=영등포구, 21=용산구, 22=은평구, 23=종로구, 24=중구, 25=중랑구 (총 25개) | https://apis.data.go.kr/B551011/KorService2/areaCode2 | A | 2026-08-19 | KorService2 |
| 4 | **영문 서비스는 `EngService2` 로 존재한다.** 호출 시 HTTP 403 과 `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` / `등록되지 않은 서비스키` / `returnReasonCode: "30"` 이 반환된다 — 서비스는 있으나 이 키가 등록되지 않았다는 뜻이다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 5 | **`EngService1` 과 `EngService` 는 존재하지 않는다.** HTTP 400 과 `NO_OPENAPI_SERVICE_ERROR` / `해당 오픈API 서비스가 없거나 폐기됨` / `returnReasonCode: "12"` 가 반환된다. 코드 30 과 12 는 서로 다른 의미이며 이 차이가 서비스 존재 여부의 판정 근거다 | https://apis.data.go.kr/B551011/EngService1/areaBasedList2 | A | 2026-08-19 | — |
| 6 | **인증키를 `URLSearchParams` 로 넘길 때는 디코딩 형태여야 한다.** 실측 결과: 인코딩키+문자열결합 = OK, 디코딩키+문자열결합 = OK, 디코딩키+`URLSearchParams` = OK, **인코딩키+`URLSearchParams` = HTTP 403** (이중 인코딩) | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | A | 2026-08-19 | KorService2 |
| 7 | 서울(`areaCode=1`)의 `contentTypeId` 별 `totalCount`: 12 관광지=418, 14 문화시설=217, 15 축제공연행사=80, 25 여행코스=**0**, 28 레포츠=60, 32 숙박=238, 38 쇼핑=146, 39 음식점=1007 | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | A | 2026-08-19 | KorService2 |
| 8 | **`contentTypeId=25`(여행코스)는 서울에 0건이다.** 이 타입을 화면에 노출하면 항상 빈 상태가 된다 | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | A | 2026-08-19 | KorService2 |
| 9 | 관광지(`contentTypeId=12`) 40건 표본에서 `firstimage` 가 있는 항목이 **40/40** 이다 | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | A | 2026-08-19 | KorService2 |
| 10 | **`firstimage` 15장을 실제로 내려받아 측정한 결과 전부 가로다.** 종횡비: 1.5×10, 1.78×2, 1.46, 1.45, 1.33. 세로(<0.9) 0장, 정사각 근처 0장. **최빈값은 1.5 (3:2)** | http://tong.visitkorea.or.kr/cms/resource/ | A | 2026-08-19 | KorService2 |
| 11 | `areaCode2` 오퍼레이션이 지역·시군구 코드 목록 조회에 쓰인다. `areaCode=1` 을 주면 그 하위 시군구가 나온다 | https://apis.data.go.kr/B551011/KorService2/areaCode2 | A | 2026-08-19 | KorService2 |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | 일일 트래픽 제한과 개발계정/운영계정 승인 방식의 차이 | 호출로는 알 수 없고 data.go.kr 마이페이지에서만 보인다 | 현재 키로 국문 서비스 호출이 성공한다는 것까지 확인됐다 (사실 1) |
| 2 | `EngService2` 의 응답 필드가 `KorService2` 와 동일한 스키마인지 | 활용신청이 안 돼 있어 호출할 수 없다 (사실 4) | 서비스가 존재한다는 것까지 확인됐다 |
| 3 | 영문 데이터의 커버리지 — 국문 418건 중 영문으로 몇 건이 제공되는지 | 위와 같은 이유 | 국문 건수만 확인됐다 (사실 7) |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| v1 이 `areaCode` 부재를 의심했다 | `areaCode` 는 **존재하고 유효하다** — https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | v1 의 확인 불가 2번 (data.go.kr 상세 페이지 파라미터 목록에 `areaCode` 미표시) | 모순 처리 2번: 문서와 실제 동작이 다르면 **실제 동작**이 이긴다. 상세 페이지의 파라미터 추출이 불완전했던 것으로 판단한다. `lDongRegnCd` 도 함께 존재할 수 있으나 확인하지 않았다 |
| 인증키를 어느 형태로 저장할 것인가 | **디코딩 형태 + `URLSearchParams`** — https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | 인코딩 형태 + 문자열 결합 (동작은 하지만 `URLSearchParams` 로 바꾸는 순간 조용히 깨진다) | 모순 처리 5번(보수적인 쪽). 문자열 결합은 다른 파라미터의 이스케이프도 직접 해야 해서 더 위험하다 |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|

사실 확인형 조사이므로 비운다.

## 조사 경로

- v1 의 `확인 불가` 5건 중 1·2·3·4 를 실키 호출로 해소했다. 5(트래픽 제한)는 남았다
- 웹 검색·문서 열람 없이 **API 직접 호출만** 사용했다. A 등급 중에서도 가장 강한 근거다
- 검색어: 없음
- 웹 도구 호출 횟수: 0/30 (WebSearch·WebFetch 미사용, API 직접 호출 약 20회)

## 이 프로젝트에 미치는 영향

| 영향 | 어디에 | 무엇을 고쳐야 하는가 |
|---|---|---|
| **액자 종횡비** | `.curvez/design/components/SpotFrame.md` 의 `ratio` 기본값 `3:4` | 원본 이미지가 전부 가로이고 최빈값이 3:2 다(사실 10). 세로 액자에 가로 이미지를 넣으면 심하게 크롭된다. **기본값을 `3:2` 로 바꾸고, 세로 액자는 매트가 위아래를 채우는 방식으로만 허용한다** — 실제 액자 제작에서 매트가 비율 차이를 흡수하는 방식과 같고 `docs/ref/IMG_3824.PNG` 의 포스터 액자가 정확히 그 모습이다 |
| **Wall 패턴** | `.curvez/design/components/Wall.md` 의 pattern a/b/c | 미결 질문 4번(종횡비 분포 미상)이 해소됐다. 비대칭을 **세로/가로 혼합이 아니라 폭(size)과 매트 두께**로 만들어야 한다 |
| 카테고리 구성 | `.curvez/design/index.md`, `GOAL.md` §4 | `contentTypeId=25`(여행코스)는 서울 0건이다(사실 8). 카테고리에서 제외한다. 확정된 4개 카테고리(관광지·문화시설·음식점·축제)는 각각 418·217·1007·80건으로 전부 충분하다 |
| 구 필터 | `.curvez/design/screens/explore.md` 의 district-picker | `sigunguCode` 1~25 가 확정됐다(사실 3). 코드-이름 매핑을 하드코딩하지 말고 `areaCode2` 로 조회해 캐싱한다 |
| **키 취급** | `.env.local`, `src/infrastructure/tourapi/` (미구현) | **디코딩 형태로 저장한다.** 현재 `.env.local` 에 인코딩 형태가 들어 있어 `URLSearchParams` 를 쓰는 순간 403 이 난다(사실 6) |
| 영문 데이터 | `GOAL.md` §4, 데이터 계층 | `EngService2` 활용신청이 **사용자 액션**으로 필요하다(사실 4). 그전까지 영문 로케일은 mock 으로만 개발 가능하다 |
| 한 화면 6~9개 | `.curvez/design/index.md` §편집 | 음식점 1007건, 관광지 418건이다. 편집된 6~9개를 무엇으로 고를지(정렬 기준)가 정해져 있지 않다. `arrange` 파라미터가 있으나 값을 확인하지 않았다 |
