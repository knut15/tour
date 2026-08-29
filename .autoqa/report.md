# QA 실행 리포트 — tour (Life is Nearby)

- 시작: 2026-08-29T10:58:16.191Z
- 종료: 2026-08-29T11:04:20.867Z
- 대상: http://localhost:3000

## 판정

**배포 불가 — P0 1건 실패.**

## 요약

| 상태 | 건수 |
|---|---|
| 통과 | 85 |
| 실패 | 3 |
| 판정 불가 | 51 |
| 합계 | 139 |

자동 판정률: 63% (88/139)

## 실패

### TC-SRC-03 (P1) — 탐색 화면 — 검색·정렬·더보기

- 절차: 검색 없이 결과가 0인 필터 조합을 만든다
- 기대: “Nothing matches that combination.” + “Clear the filter”. 이 버튼은 카테고리만 남긴다
- 판정: 페이지 평가 결과가 참이어야 하는데 false 다 _(rule)_
- 최종 URL: http://localhost:3000/en/explore?category=festival&area=39

```
27°
Overcast
English

FOR A GOOD TRIP

May the Korea you meet today stay with you.

Make it a good day

Places
Culture
Food
Happening
Location access is blocked
REGION
Jeju-do
DISTRICT
All districts
Most viewed
Most liked
Find a place
Search
Downtown Night Tour: The Season for Jeju Island Nights
SEOGWIPO-SI

원도심 야간여행 ‘섬夜시즌’ 운영

Events

120-12 Chilsimni-ro, Seogwipo-si, Jeju-do

0
0

Place data from the Korea Tourism Organization.
```

### TC-RSV-02 (P0) — 상세에서 언어 전환

- 절차: ko → en 전환
- 기대: 같은 장소의 영문 상세로 간다
- 판정: 페이지 평가 결과가 참이어야 하는데 false 다 _(rule)_
- 최종 URL: http://localhost:3000/en/explore

```
27°
Overcast
English

FOR A GOOD TRIP

May the Korea you meet today stay with you.

Make it a good day

Places
Culture
Food
Happening
Location access is blocked
REGION
Anywhere in Korea
Most viewed
Most liked
Find a place
Search
Paldalmun Gate

팔달문

Gates

780, Jeongjo-ro, Paldal-gu, Suwon-si, Gyeonggi-do

0
1

Geoje Gyedo Fishing Village

거제 계도어촌체험마을

Fishing Experience Sites

837 Gajo-ro, Sadeung-myeon, Geoje-si, Gyeongsangnam-do

0
0

Yeonmisan Nature Art Park

연미산자연미술공원

Themed Parks

98 Yeonmisangogae-gil, Useong-myeon, Gongju-si, Chungcheongnam-do

0
0

Head House of Pansagongpa Branch of Pyeongsan Sin Clan

청송 평산신씨 판사공파 종택과 분가 고택

Traditional Houses

16, Jungdeul 2-gil, Cheongsong-gun, Gyeongsangbuk-do

0
0

Flower Guest Project

꽃객프로젝트

Industrial Tourism

307 Bokbunja-ro, Buan-myeon, Gochang-gun, Jeonbuk-do

0
0

Palmido Cruise

팔미도유람선

Cruise

36 Yeonanbudu-ro, Jemulpo-gu, Incheon

0
0

Bongsudae Beach

봉수대해변

Beaches

Oho-ri, Goseong-gun, Gangwon-do

0
0

Resort Spavalley

리조트 스파밸리

Water Parks

891 Gachang-ro, Gachang-myeon, Dalseong-gun, Daegu

0
0

Gimje Geumsansa Temple

금산사(김제)

Buddhism

1 Moak 15-gil, Geumsan-myeon, Gimje-si, Jeonbuk-do

0
0

Moaksan Provincial Park

모악산 도립공원

Provincial Parks

Moak 15-gil, Geumsan-myeon, Gimje-si, Jeonbuk-do

0
0

Byeokgolje Reservoir Site

김제 벽골제

Historic Sites

442 Byeokgolje-ro, Buryang-myeon, Gimje-si, Jeonbuk-do

0
0

Mudeungsan National Park (Gwangju)

무등산국립공원(광주)

National Parks

Geumgok-dong, Buk-gu, Jeonnam-Gwangj
```

### TC-RCT-02 (P1) — 담기·좋아요·조회 화면 동작

- 절차: 상세에서 담기 → 목록으로 돌아온다
- 기대: 같은 스팟 카드가 담긴 상태로 보인다
- 판정: 페이지 평가 결과가 참이어야 하는데 false 다 _(rule)_
- 최종 URL: http://localhost:3000/en/explore

```
27°
Overcast
English

FOR A GOOD TRIP

May the Korea you meet today stay with you.

Make it a good day

Places
Culture
Food
Happening
Location access is blocked
REGION
Anywhere in Korea
Most viewed
Most liked
Find a place
Search
Paldalmun Gate

팔달문

Gates

780, Jeongjo-ro, Paldal-gu, Suwon-si, Gyeonggi-do

0
1

Geoje Gyedo Fishing Village

거제 계도어촌체험마을

Fishing Experience Sites

837 Gajo-ro, Sadeung-myeon, Geoje-si, Gyeongsangnam-do

0
0

Yeonmisan Nature Art Park

연미산자연미술공원

Themed Parks

98 Yeonmisangogae-gil, Useong-myeon, Gongju-si, Chungcheongnam-do

0
0

Head House of Pansagongpa Branch of Pyeongsan Sin Clan

청송 평산신씨 판사공파 종택과 분가 고택

Traditional Houses

16, Jungdeul 2-gil, Cheongsong-gun, Gyeongsangbuk-do

0
0

Flower Guest Project

꽃객프로젝트

Industrial Tourism

307 Bokbunja-ro, Buan-myeon, Gochang-gun, Jeonbuk-do

0
0

Palmido Cruise

팔미도유람선

Cruise

36 Yeonanbudu-ro, Jemulpo-gu, Incheon

0
0

Bongsudae Beach

봉수대해변

Beaches

Oho-ri, Goseong-gun, Gangwon-do

0
0

Resort Spavalley

리조트 스파밸리

Water Parks

891 Gachang-ro, Gachang-myeon, Dalseong-gun, Daegu

0
0

Gimje Geumsansa Temple

금산사(김제)

Buddhism

1 Moak 15-gil, Geumsan-myeon, Gimje-si, Jeonbuk-do

0
0

Moaksan Provincial Park

모악산 도립공원

Provincial Parks

Moak 15-gil, Geumsan-myeon, Gimje-si, Jeonbuk-do

0
0

Byeokgolje Reservoir Site

김제 벽골제

Historic Sites

442 Byeokgolje-ro, Buryang-myeon, Gimje-si, Jeonbuk-do

0
0

Mudeungsan National Park (Gwangju)

무등산국립공원(광주)

National Parks

Geumgok-dong, Buk-gu, Jeonnam-Gwangj
```

## 사람이 볼 것 — 자동화하지 않기로 정한 것

각각 왜 자동화하지 않는지 이유가 붙어 있다. QA 가 손으로 확인한다.

| ID | P | 절 | 이유 |
|---|---|---|---|
| TC-EXP-11 | P2 | 탐색 화면 — 필터 | 지역 목록 API 만 실패시킬 주입 지점이 앱에 없다 |
| TC-SRC-10 | P1 | 탐색 화면 — 검색·정렬·더보기 | mock 은 더보기 1회면 소진돼 15회 상한까지 누를 카드가 없다 — 상한 계산은 tests/presentation/explore-paging.test.ts 가 덮는다 |
| TC-SRC-12 | P2 | 탐색 화면 — 검색·정렬·더보기 | 네트워크 throttling 이 전제라 타이밍에 걸린다 |
| TC-WALL-02 | P0 | 목록·카드 | 화면으로는 URL 이 없었던 것과 로드 실패를 가릴 수 없다 — tests/domain/spot.test.ts 가 덮는다 |
| TC-WALL-02b | P1 | 목록·카드 | 이미지 CDN 이 막힌 환경이 전제다 |
| TC-WALL-05 | P2 | 목록·카드 | 카드 이미지가 외부 CDN(tong.visitkorea.or.kr) 이라 검증 환경에서 11장 중 10장이 로드에 실패한다 — 비율을 잴 대상이 없다 |
| TC-WALL-06 | P1 | 목록·카드 | Supabase 키를 뺀 환경이 전제다 — 러너가 앱 환경을 바꿀 수 없다 |
| TC-WALL-08 | P2 | 목록·카드 | 반응이 쌓인 실데이터가 전제이고, 순위를 만들려면 저장소에 쓰기를 남겨야 한다 |
| TC-DTL-06 | P1 | 상세 화면 | mock 의 모든 스팟에 좌표가 있어 좌표 없는 스팟을 만들 수 없다 |
| TC-RSV-06 | P2 | 상세에서 언어 전환 | resolve 조회만 실패시킬 주입 지점이 앱에 없다 |
| TC-API-01 | P0 | 반응 API | 성공 경로가 실제 저장소에 좋아요를 남긴다 — §8 의 "서버에 남는가" 규칙에 따라 자동화하지 않는다 |
| TC-API-02 | P0 | 반응 API | 토글이 저장소의 좋아요 상태를 뒤집는다 — QA 실행 횟수가 지표에 섞인다 |
| TC-API-05 | P0 | 반응 API | 이 검증 환경에는 Supabase 키가 있어 503 경로 자체가 나오지 않는다 |
| TC-API-06 | P1 | 반응 API | 저장소를 실패시킬 주입 지점이 앱에 없다 |
| TC-API-07 | P0 | 반응 API | 성공 경로가 실제 저장소에 조회를 남긴다 — §8 규칙 |
| TC-API-08 | P0 | 반응 API | 같은 이유로 저장소에 쓰기가 남고, 판정에 날짜·방문자 상태가 얽힌다 |
| TC-API-09 | P1 | 반응 API | 회차마다 조회수가 실제로 올라 지표를 QA 실행 횟수로 만든다 |
| TC-API-10 | P1 | 반응 API | 기록은 되고 읽기만 실패하는 상황을 만들 수 없다 |
| TC-API-11 | P1 | 반응 API | 디코딩이 통했음을 보려면 200 경로까지 가야 하고 그 경로가 저장소에 쓴다 |
| TC-RCT-03 | P1 | 담기·좋아요·조회 화면 동작 | 러너가 탭을 두 개 열 수 없어 storage 이벤트를 관측할 수 없다 |
| TC-RCT-04 | P0 | 담기·좋아요·조회 화면 동작 | 실행할 때마다 실제 저장소의 좋아요 수가 오른다 — 검증이 자기가 재는 지표를 바꾼다 |
| TC-RCT-05 | P0 | 담기·좋아요·조회 화면 동작 | 좋아요 API 를 502 로 만들 수 있는 환경이 필요하다 |
| TC-RCT-06 | P1 | 담기·좋아요·조회 화면 동작 | 좋아요가 서버에 쓰기를 남기고, 같은 장소가 두 번 뜨는 목록도 mock 에 없다 |
| TC-RCT-07 | P2 | 담기·좋아요·조회 화면 동작 | 하트 버스트는 시각 판정이고 좋아요가 서버에 쓰기를 남긴다 |
| TC-RCT-08 | P1 | 담기·좋아요·조회 화면 동작 | localStorage 를 막은 브라우저를 러너가 만들 수 없다 |
| TC-RCT-09 | P0 | 담기·좋아요·조회 화면 동작 | dev 모드 React StrictMode 가 effect 를 두 번 돌려 상세 1회 열람당 POST /view 가 2건 나간다(실측) — 1회 여부는 prod 빌드에서만 가릴 수 있다 |
| TC-RCT-10 | P1 | 담기·좋아요·조회 화면 동작 | 새로고침 전후의 조회수를 한 번의 판정식으로 비교할 수 없고, 실행마다 저장소에 쓰기가 남는다 |
| TC-RCT-11 | P2 | 담기·좋아요·조회 화면 동작 | 420ms 애니메이션과 숫자 갱신의 선후는 타이밍 판정이라 flaky 해진다 |
| TC-NEAR-01 | P1 | 내 위치·거리 | 권한 창이 몇 번 떴는지는 페이지 밖의 사실이라 러너가 관측할 수 없다 |
| TC-NEAR-02 | P1 | 내 위치·거리 | 헤드리스 브라우저에 geolocation 권한을 부여할 설정이 러너에 없다 |
| TC-NEAR-05 | P0 | 내 위치·거리 | 끄려면 먼저 켜야 하고, 켜는 데 권한 허용이 전제다 |
| TC-NEAR-06 | P1 | 내 위치·거리 | 권한이 거부된 이 환경에서는 토글이 disabled 라 켜고 끌 수 없다 |
| TC-NEAR-08 | P2 | 내 위치·거리 | navigator.geolocation 을 없앤 브라우저를 러너가 만들 수 없다 |
| TC-WTH-03 | P0 | 날씨·미세먼지 | 에어코리아만 죽은 환경이 필요하다 — 앱에 주입 지점이 없다 |
| TC-WTH-04 | P1 | 날씨·미세먼지 | mock 은 PM10·PM2.5 가 둘 다 moderate 라 나쁜 쪽 선택과 등급별 색 차이를 화면에서 가를 수 없다 — 등급 계산은 tests/domain/weather-air-quality.test.ts 가 덮는다 |
| TC-THM-03 | P1 | 테마 | OS 다크(prefers-color-scheme) 프로파일을 러너가 지정할 수 없다 |
| TC-THM-05 | P2 | 테마 | 다크 테마 대비는 시각 판정이다 |
| TC-STA-02 | P1 | 화면 상태 유지 | 복원 도중 사용자 조작이라 타이밍에 걸린다 — 자동화하면 flaky 해진다 |
| TC-STA-06 | P2 | 화면 상태 유지 | 전환 애니메이션은 시각 판정이다 |
| TC-STA-07 | P1 | 화면 상태 유지 | 페이드 여부는 시각 판정이다 |
| TC-ENV-01 | P0 | 데이터 소스·환경 | 러너가 앱을 USE_MOCK_DATA 미설정으로 띄울 수 없다 — .autoqa.json 이 항상 true 를 주입한다 |
| TC-ENV-02 | P0 | 데이터 소스·환경 | 실데이터 모드로 띄워야 하고 공급자에 실제 요청이 나간다 |
| TC-ENV-03 | P1 | 데이터 소스·환경 | TOUR_API_KEY 를 비운 채 실데이터로 띄워야 한다 |
| TC-ENV-04 | P1 | 데이터 소스·환경 | 인코딩 키로 공급자에 실제 요청을 보내야 403 을 볼 수 있다 |
| TC-ENV-05 | P0 | 데이터 소스·환경 | Supabase 키를 뺀 환경이 전제다 — 이 검증 환경에는 키가 있다 |
| TC-ENV-06 | P1 | 데이터 소스·환경 | 실데이터 모드에서 날씨 전용 키만 비운 환경이 전제다 |
| TC-SEC-02 | P0 | 보안 | 브라우저 Network 탭을 사람이 봐야 한다 |
| TC-SEC-04 | P1 | 보안 | 응답 본문을 보려면 200 경로까지 가야 하고 그 경로가 저장소에 쓰기를 남긴다 |
| TC-A11Y-05 | P2 | 접근성 | 포커스 링이 보이는지는 시각 판정이다 |
| TC-RSP-04 | P1 | 반응형·성능 | 느린 3G throttling 이 전제라 타이밍에 걸린다 |
| TC-RSP-05 | P2 | 반응형·성능 | 외부 CDN 이미지가 로드되지 않아 상세 대표 이미지가 DOM 에 남지 않는다 — priority 를 확인할 대상이 없다 |

## 실행 방식별

| 모드 | 통과 | 실패 | 판정 불가 |
|---|---|---|---|
| command | 10 | 0 | 0 |
| http | 13 | 0 | 0 |
| browser | 62 | 3 | 0 |
| manual | 0 | 0 | 51 |
