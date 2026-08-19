# tourapi-english-coverage

`tourapi-endpoints-v2.md` 의 후속이다. `EngService2` 활용신청이 승인된 뒤 **영문 서비스를 직접 호출**해 확인했다.

- **조사 질문:** EngService2 의 파라미터 체계·데이터 커버리지·이미지 커버리지는 국문과 어떻게 다른가? 로케일 간 스팟을 연결할 수 있는가?
- **조사 일자:** 2026-08-19
- **기준 버전:** EngService2 / KorService2, node@24.19.0
- **결론 한 줄:** **`contentTypeId` 체계가 국문과 완전히 다르고(75/76/78/79/80/82/85), 서울 데이터는 국문의 33% 이며, 관광지 이미지 커버리지는 34% 에 불과하다. 결정적으로 `contentid` 공간이 국문과 분리돼 있어 로케일 전환 시 같은 스팟으로 이어갈 수 없다.**

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | `EngService2` 활용신청이 승인돼 `resultCode: "0000"` 로 응답한다. 전국 `totalCount` 는 15080 이다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 2 | **국문 `contentTypeId`(12/14/15/25/28/32/38/39)는 영문에서 전부 0건이다.** 영문은 75/76/78/79/80/82/85 를 쓴다. 7개 값의 합(216+2599+464+11071+182+307+241)이 전체 15080 과 정확히 일치한다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 3 | 영문 `categoryCode2` 가 반환하는 대분류: `A01=Nature`, `A02=Culture/Art/History`, `A03=Leisure/Sports`, `A04=Shopping`, `A05=Cuisine`, `B01=Transportation`, `B02=Accommodation` | https://apis.data.go.kr/B551011/EngService2/categoryCode2 | A | 2026-08-19 | EngService2 |
| 4 | **`contentTypeId=76` 은 관광지다.** 서울 100건 표본의 `cat1` 분포가 `A02`(Culture/Art/History) 91, `A01`(Nature) 9 이고 항목에 Cheonggyecheon Stream, Cheonggyesan Mountain, Choi Sunu House 가 포함된다. 알파벳 정렬 앞쪽에 의료관광(성형외과·병원) 항목이 다수 섞여 있다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 5 | 나머지 매핑: 75=레포츠(`A03`), 78=문화시설, 79=쇼핑(`A04`), 80=숙박(`B02`), 82=음식점(`A05`), 85=축제공연행사 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 6 | 영문 `areaCode` 는 국문과 같다 — `1=Seoul`. 전국 17개 시도. `sigunguCode` 도 동일하게 1~25 이며 이름만 로마자다(`1=Gangnam-gu` … `25=Jungnang-gu`) | https://apis.data.go.kr/B551011/EngService2/areaCode2 | A | 2026-08-19 | EngService2 |
| 7 | **서울 데이터 커버리지 (국문 → 영문):** 관광지 418→405(97%), 문화시설 217→115(53%), 축제행사 80→34(43%), 레포츠 60→24(40%), 숙박 238→30(13%), 쇼핑 146→40(27%), **음식점 1007→66(7%)**. 합계 2166→714 = **33%** | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 8 | **서울 영문 이미지 커버리지:** 관광지 **405건 전수 스캔에서 137건(34%)**, 문화시설 71%, 축제행사 26%, 레포츠 67%, 숙박 87%, 쇼핑 93%, 음식점 82% | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 9 | **`contentid` 공간이 국문과 영문에서 분리돼 있다.** 영문 아차산(`contentid=1349267`)을 `KorService2/detailCommon2` 로 조회하면 `totalCount=0` 이다. 국문에서 `searchKeyword2` 로 "아차산" 을 찾으면 742972, 2773309 라는 **전혀 다른 ID** 가 나온다 | https://apis.data.go.kr/B551011/KorService2/detailCommon2 | A | 2026-08-19 | KorService2 |
| 10 | **`detailCommon2` 는 `contentId` 만 주면 동작하고, `contentTypeId` 를 함께 주면 응답이 깨진다.** 국문 `contentId=1116925` 단독 호출은 `code=0000 total=1 title=갈산공원`, `contentTypeId=12` 를 추가하면 `code=undefined` | https://apis.data.go.kr/B551011/KorService2/detailCommon2 | A | 2026-08-19 | KorService2 |
| 11 | 영문 응답 필드는 국문과 동일하다: `addr1, addr2, areacode, cat1~cat3, contentid, contenttypeid, createdtime, firstimage, firstimage2, cpyrhtDivCd, mapx, mapy, mlevel, modifiedtime, sigungucode, tel, title, zipcode, lDongRegnCd, lDongSignguCd, lclsSystm1~3` | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 12 | **영문 `title` 은 로마자와 한글을 함께 담는다.** 예: `Cheonggyecheon Stream (청계천)`, `Achasan Mountain (아차산)`. 괄호 안이 한글 원명이다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |
| 13 | `mapx`(경도)·`mapy`(위도)가 응답에 포함된다. 예: `mapx: 127.0236686375, mapy: 37.5053871607` | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | A | 2026-08-19 | EngService2 |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | 국문↔영문 스팟을 잇는 **공식 매핑 수단**이 있는가 (좌표·전화번호·주소 기반 외에) | `contentid` 가 분리돼 있다는 것만 확인했다. 별도 매핑 API 의 존재 여부는 조사하지 않았다 | `contentid` 로는 불가능하다 (사실 9) |
| 2 | `contentTypeId=79`(쇼핑)의 전국 11071 건 대비 서울 40건이라는 극단적 편중의 원인 | 데이터 자체의 문제인지 파라미터 문제인지 판정하지 못했다 | 두 수치 모두 실측됐다 (사실 2·7) |
| 3 | 영문 관광지에 섞인 의료관광 항목을 걸러낼 파라미터가 있는가 | `cat2`/`cat3` 또는 `lclsSystm` 으로 가능해 보이나 코드값을 확인하지 않았다 | `cat1` 이 A01/A02 두 값뿐이라 `cat1` 로는 못 거른다 (사실 4) |
| 4 | 일일 트래픽 제한 | 호출로는 알 수 없다 | — |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| 영문 이미지 결손을 국문 이미지로 메울 수 있는가 | **불가능** — https://apis.data.go.kr/B551011/KorService2/detailCommon2 | "`contentid` 가 공유될 것" 이라는 초기 가정 | 실측으로 반증됐다 (사실 9). `detailCommon2` 호출 자체는 정상 동작함을 별도로 검증해 내 호출 오류가 아님을 확인했다 (사실 10) |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|
| 영문 로케일에서 **이미지 없는 스팟을 목록에서 제외**한다 | https://apis.data.go.kr/B551011/EngService2/areaBasedList2 | 관광지가 405→137건으로 줄어든다 | **`GOAL.md` §0.5-3 "한 화면 6~9개, 편집된 선택" 과 정확히 맞물린다.** 137건이면 9개씩 15화면분이다 |
| 이미지 없는 스팟을 카테고리 색 면으로 표시한다 | — | 관광지의 66% 가 색면이 된다. 벽이 아니라 색종이가 된다 | 액자 디자인의 전제("이미지가 먼저다")가 무너진다 |
| 영문 로케일에서 국문 데이터를 로마자 제목과 함께 병기한다 | https://apis.data.go.kr/B551011/KorService2/areaBasedList2 | 설명·주소가 한글로 남는다. 로마자 변환을 직접 해야 한다 | 음식점(영문 66건)에는 유일한 현실적 대안이다 |

## 조사 경로

- 웹 검색·문서 열람 없이 **API 직접 호출만** 사용했다
- `detailCommon2` 전건 실패를 처음에 "contentid 미공유" 로 결론지으려다, **내 호출이 틀렸을 가능성**을 먼저 검증했다. 국문에 확실히 존재하는 `contentId=1116925` 로 정상 동작을 확인한 뒤에야 사실 9 를 확정했다. 그 과정에서 사실 10(파라미터 조합 함정)을 부수적으로 얻었다
- 검색어: 없음
- 웹 도구 호출 횟수: 0/30 (API 직접 호출 약 60회)

## 이 프로젝트에 미치는 영향

| 영향 | 어디에 | 무엇을 고쳐야 하는가 |
|---|---|---|
| **로케일 전환** | `GOAL.md` §6 완료 기준 "언어 전환 시 현재 페이지가 유지된다" | **상세 화면에서는 성립하지 않는다.** `contentid` 가 분리돼 있어 `/en/spots/1349267` 에 대응하는 `/ko/spots/…` 를 만들 수 없다(사실 9). 목록·지도·홈은 유지 가능하다. 완료 기준을 화면별로 나눠야 한다 |
| **데이터 계층** | `.curvez/architecture.md`, `src/infrastructure/tourapi/` | 국문·영문을 같은 저장소의 번역쌍이 아니라 **완전히 독립된 두 카탈로그**로 다뤄야 한다. `contentTypeId` 매핑 테이블도 로케일별로 따로 둔다 |
| **카테고리 코드** | `GOAL.md` §4, `.curvez/design/index.md` | 국문 12/14/15/39 ↔ 영문 76/78/85/82 로 매핑 테이블이 필요하다(사실 2·5). GOAL 에 국문 코드만 적혀 있다 |
| **이미지 없는 스팟** | `GOAL.md` §8 열린 질문, `.curvez/design/screens/explore.md` | 열린 질문 "영문 데이터가 빈 스팟을 목록에서 뺄지" 의 답은 **뺀다** 다. 편집 원칙과 데이터 현실이 같은 방향을 가리킨다 |
| **축제 카테고리** | `.curvez/design/index.md` 의 카테고리 4개 | 영문 축제는 34건 × 이미지 26% ≈ **9건**이다. 벽 하나를 겨우 채운다. 영문 로케일에서 축제를 1급 카테고리로 둘 수 없다 |
| **음식 카테고리** | `.curvez/design/index.md` | 영문 음식점 66건 × 82% ≈ **54건**. 서울 음식 카테고리로는 얇지만 "편집된 6~9개" 기준으로는 6벽분이라 운영 가능하다. 국문은 1007건이라 로케일 간 체감 차이가 크다 |
| **의료관광 혼입** | `.curvez/design/screens/explore.md` | 영문 관광지 405건에 성형외과·병원이 다수 섞여 있다(사실 4). 여행 앱의 "관광지" 벽에 클리닉이 뜨면 신뢰를 잃는다. 필터 수단을 찾아야 한다(확인 불가 3) |
