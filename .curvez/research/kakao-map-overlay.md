# kakao-map-overlay

- **조사 질문:** 카카오맵 JS SDK 로 지도 위에 임의의 HTML(액자 카드)을 얹을 수 있는가? 제약은 무엇인가?
- **조사 일자:** 2026-08-19
- **기준 버전:** 카카오맵 Web API v3 (SDK 자체 버전 표기는 확인하지 못했다). 프로젝트: next@16.3.1, react@19.2.8
- **결론 한 줄:** **얹을 수 있다.** `kakao.maps.CustomOverlay` 가 `setContent`/`getContent`/`setZIndex` 를 공식 메서드로 제공하고, 공식 샘플에 닫기·드래그 가능한 커스텀 오버레이가 있다. 다만 **생성자 옵션의 정확한 타입·기본값과 오버레이 개수 상한, 그리고 지도 타일 라벨의 언어 전환 가능 여부는 확인하지 못했다.**

## 확인된 사실

| # | 주장 | 출처 URL | 등급 | 확인 날짜 | 대상 버전 |
|---|---|---|---|---|---|
| 1 | `CustomOverlay` 클래스가 공식 API 에 존재하며 메서드로 `setMap`/`getMap`, `setPosition`/`getPosition`, `setContent`/`getContent`, `setVisible`/`getVisible`, `setZIndex`/`getZIndex`, `setAltitude`/`getAltitude`, `setRange`/`getRange` 를 제공한다 | https://apis.map.kakao.com/web/documentation/ | A | 2026-08-19 | Kakao 지도 Web API v3 |
| 2 | `setContent`/`getContent` 가 공식 메서드이므로 오버레이의 내용은 **런타임에 교체할 수 있다** | https://apis.map.kakao.com/web/documentation/ | A | 2026-08-19 | Kakao 지도 Web API v3 |
| 3 | `setZIndex`/`getZIndex` 가 있으므로 오버레이 간 쌓임 순서를 제어할 수 있다 | https://apis.map.kakao.com/web/documentation/ | A | 2026-08-19 | Kakao 지도 Web API v3 |
| 4 | 공식 샘플에 `커스텀 오버레이 생성하기1`, `커스텀 오버레이 생성하기2`, `닫기가 가능한 커스텀 오버레이`, `커스텀오버레이를 드래그 하기`, `이미지 마커와 커스텀 오버레이`, `로드뷰에 커스텀오버레이 올리기` 가 있다. 즉 **상호작용 가능한 HTML 오버레이가 공식 지원 범위 안에 있다** | https://apis.map.kakao.com/web/sample/removableCustomOverlay/ | A | 2026-08-19 | Kakao 지도 Web API v3 |
| 5 | 커스텀 오버레이는 지도(Map)뿐 아니라 로드뷰(Roadview) 위에도 올릴 수 있다 | https://apis.map.kakao.com/web/sample/roadviewCustomOverlay/ | A | 2026-08-19 | Kakao 지도 Web API v3 |

## 확인 불가

| # | 확인하려던 것 | 왜 확인 불가인가 | 어디까지 확인됐나 |
|---|---|---|---|
| 1 | `CustomOverlay` 생성자 옵션(`content`, `position`, `map`, `xAnchor`, `yAnchor`, `zIndex`, `clickable`)의 정확한 타입과 기본값 | 공식 문서 페이지가 JS 렌더링 SPA 라 본문 상세부가 `Content truncated` 로 잘린다. 같은 URL 을 2회 다른 프롬프트로 시도했고 샘플 페이지 2곳도 네비게이션만 반환했다 | 메서드 목록까지 확인됐다 (사실 1). 검색 엔진 요약은 `content: Node \| String`, `clickable: Boolean`, `xAnchor`/`yAnchor` 기본 0.5 라고 하나 **A 출처를 직접 열지 못해 인용하지 않는다** |
| 2 | **한 지도에 올릴 수 있는 CustomOverlay 개수 상한과 성능 특성** | 공식 문서에 언급을 찾지 못했다 | 없음. CustomOverlay 는 DOM 요소이므로 마커(캔버스)보다 무거울 것으로 추정되나 **추정이며 근거 없다** |
| 3 | **지도 타일 라벨의 언어를 영어로 전환할 수 있는지** | 이 브리프의 조사 범위에 넣지 않았고 상한 안에서 확인하지 못했다 | 없음 |
| 4 | SDK 로드용 `<script src>` URL 형식(`appkey`, `autoload`, `libraries` 파라미터) | 문서 페이지 본문 추출 실패 | 없음 |
| 5 | React 19 / Next.js 16 의 Strict Mode 이중 렌더에서 SDK 초기화가 중복되는지 | 카카오 공식 문서에 React 관련 언급이 없다 | 없음 |

## 모순과 선택

| 쟁점 | 택한 쪽 (URL) | 버린 쪽 (URL) | 근거 |
|---|---|---|---|
| 검색 엔진이 요약한 생성자 옵션을 사실로 채택할 것인가 | 채택하지 않음 — 확인 불가 1번으로 올렸다. https://apis.map.kakao.com/web/documentation/ | 검색 결과 요약(출처 없음) | 스킬 규정상 A 출처를 직접 열어 확인하지 못한 내용은 `## 확인된 사실` 에 넣지 않는다. 요약 과정에서 조건절이 탈락하는 것이 반복되는 실패 유형이다 |

## 선택지 비교

| 후보 | 근거 URL | 제약 | 프로젝트 버전과의 적합성 |
|---|---|---|---|
| `CustomOverlay` 로 액자 카드를 지도에 얹는다 | https://apis.map.kakao.com/web/documentation/ | 개수 상한·성능 미확인 (확인 불가 2) | 기능상 가능하다. 성능은 실측 필요 |
| `Marker` + 클릭 시 지도 밖 바텀시트 | https://apis.map.kakao.com/web/documentation/ | 액자가 지도 위에 뜨지 않아 시그니처가 약해진다 | 성능이 안전하다. 개수 상한 미확인 상태의 대안 |

## 조사 경로

- 검색으로 공식 샘플 목록과 문서 URL 을 확보한 뒤 `https://apis.map.kakao.com/web/documentation/` 을 2회, 샘플 페이지 2곳을 각 1회 열었다. 문서 페이지에서 메서드 목록만 추출됐고 클래스 상세부는 잘렸다
- C 등급 글은 열지 않았다. 검색 결과 요약에 생성자 옵션이 나왔으나 A 출처 직접 확인에 실패해 인용하지 않았다
- 검색어: `Kakao Maps JavaScript API CustomOverlay HTML content 커스텀 오버레이` / `kakao maps sdk v3 CustomOverlay content Node String 옵션 clickable zIndex`
- 웹 도구 호출 횟수: 5/30

## 이 프로젝트에 미치는 영향

| 영향 | 어디에 | 무엇이 어긋나는가 |
|---|---|---|
| 지도 화면 설계 | `.curvez/design/index.md` 의 미결 질문 1번 | **"지도 위에 액자를 얹을 수 있는가" 는 예로 답했다.** 다만 개수 상한이 미확인이라, 반경 내 스팟이 수십 개일 때 전부 CustomOverlay 로 그릴지 마커+바텀시트로 갈지는 실측 후 정한다 |
| 외국인 타겟 전제 | `GOAL.md` §5-5 "지도는 UI 로 덮는다" | 타일 라벨 언어 전환 가능 여부를 확인하지 못했다(확인 불가 3). 전환이 된다면 §5-5 의 전제 자체가 완화된다. 이 항목은 지도 제공자 선택(카카오 vs 구글)을 되돌릴 수 있는 근거다 |
