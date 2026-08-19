# component: Wall
platform: nextjs
purpose: SpotFrame 을 **비대칭으로 거는 배치 컨테이너**. 균일 격자를 만들지 않는 것이 이 컴포넌트의 존재 이유다. 균일한 격자는 기계가 출력한 것처럼 보이고, 불균일한 배치는 사람이 건 것처럼 보인다.

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| items | SpotFrameProps[] | O | — | 6~9개. 10개 이상 넘기면 앞에서 9개만 렌더한다 |
| ~~pattern~~ | — | — | — | **폐기.** 구현 결과 패턴 3종을 돌릴 만큼 항목이 다양하지 않았다. 단일 9슬롯 패턴을 쓴다 |
| accent | attraction \| culture \| food \| festival | X | attraction | 이 벽의 지배 액센트. 한 화면에 하나뿐이다 (GOAL §2.3) |
| onOpenItem | (spotId: string) => void | O | — | 액자 클릭 위임 |

**배치: 인스타그램 피드형 균일 그리드다.** 모바일 2열, 데스크톱 3열, 정사각 타일, 좁은 간격.

### 비대칭 배치를 폐기한 이유

초안은 크기가 다른 액자를 비대칭으로 거는 방식이었다. 구현하고 화면을 보니
**레퍼런스에서 멀어지는 해석**이었다 — `docs/ref/IMG_3824.PNG` 는 인스타그램 프로필 그리드이고,
정사각 타일이 좁은 간격으로 이어진다. 불균일한 배치가 아니다.

카탈로그를 "내 것" 처럼 보이게 하는 것은 **배치의 불균일이 아니라 타일 하나하나가 액자라는 사실**이다.
그 정체성은 `SpotFrame` 의 색 매트가 진다. `Wall` 은 그것을 규칙적으로 걸기만 한다.

3:2 원본이 정사각 창에 담기면 위아래 여백이 곧 매트가 되어 크롭 금지 제약과도 맞물린다.

### 캡션은 매트 밖에 둔다

인스타 그리드에는 캡션이 없지만 이건 여행 앱이다. 이름이 없으면 쓸 수 없고,
특히 한글 원명은 현장에서 보여줘야 한다. 매트 안이 아니라 **타일 아래**에 작게 둔다 —
매트 안에 넣으면 액자에 글씨를 인쇄한 꼴이 된다.

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | items.length >= 1 | pattern 대로 배치. gap=--space-6 |
| loading | 상위가 지시 | items 자리에 SpotFrame(loading) 을 패턴 그대로 배치. **개수와 크기를 유지한다** — 레이아웃 점프 금지 |
| empty | items.length === 0 | 컨테이너를 접지 않고 최소 높이를 유지한 채 상위가 준 빈 문구를 중앙에 놓는다. 벽이 사라지면 화면 구조가 무너진다 |
| error | 상위가 지시 | 컨테이너 자리에 ErrorPanel. 부분 실패면 성공한 액자는 남기고 실패 슬롯만 --color-bg-sunken 면으로 |
| hover | — | Wall 자체는 hover 를 갖지 않는다. 개별 SpotFrame 이 처리한다 |

## a11y
- a11y:label — Wall 은 `aria-label` 로 이 벽이 무엇인지 알린다. 예: "Featured places in Seoul" / "종로구의 음식점". 건수를 읽지 않는다 (GOAL §0.5-3)
- a11y:focus — DOM 순서 = 시각 순서. 비대칭 배치를 CSS `order` 나 `grid-auto-flow: dense` 로 만들지 않는다. 두 방식 모두 키보드 순서를 시각 순서와 어긋나게 만든다. 명시적 `grid-column` / `grid-row` 로만 배치한다
- a11y:contrast — Wall 자체는 색을 갖지 않는다. 배경은 --color-bg-canvas 를 상속한다. 해당 없음
- a11y:target — Wall 자체는 클릭 대상이 아니다. 해당 없음. 자식 SpotFrame 이 타깃 크기를 보장한다
- a11y:role — list. 자식 SpotFrame 은 listitem 으로 감싼다. 단 순서 없는 목록이므로 ordered 로 만들지 않는다

## responsive
- nextjs: <768 단일 열. **크기 차이는 유지한다** — lg=100%, md=86%, sm=72% 폭으로 좌우 교차 정렬. 균일 스택으로 무너뜨리면 이 컴포넌트의 목적이 사라진다
- nextjs: 768~1279 2열 비대칭. 패턴을 2열용으로 재계산한다
- nextjs: >=1280 3열 비대칭, 컨테이너 최대 폭 1200

## platform-diff
- nextjs: CSS Grid 명시 배치. pattern 3종
- rn: 해당 없음 — stack=nextjs 로 모바일 앱을 만들지 않는다
