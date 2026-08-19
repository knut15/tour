# component: DayLane
platform: nextjs
purpose: 하루를 **색면 띠** 위에 표현한다. `docs/ref/IMG_3827.PNG` 의 옥상 트랙에서 왔다. **순서가 실제 정보일 때만 쓴다** — 코스의 하루가 그렇다. 순서 없는 탐색 목록에는 쓰지 않는다. 순서 없는 것에 트랙을 씌우면 장식이 된다.

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| dayIndex | number | O | — | 0부터. 라벨 "Day 1" / "1일차" 로 표기 |
| date | string \| null | X | null | ISO date. null 이면 상대 라벨만 표기 |
| items | SpotFrameProps[] | O | — | 이 날의 스팟. 순서가 곧 방문 순서다 |
| reasons | string[] | X | [] | items 와 같은 길이. 각 스팟이 왜 그 자리인지 한 문장. plan 화면에서 필수 |
| editable | boolean | X | false | true 면 끌어 옮기기·빼기 컨트롤 노출 |
| onReorder | (from: number, to: number) => void | X | — | editable=true 일 때 필수 |
| onRemove | (index: number) => void | X | — | editable=true 일 때 필수 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | items.length >= 1 | 트랙 bg=--color-bg-sunken, 레인 색면 = dayIndex 순환(코발트→시안→민트→로즈→머스터드). SpotFrame(size=sm, order=n) 을 가로로 배치 |
| loading | 상위가 지시 | 트랙과 레인 색면은 그리고 위에 SpotFrame(loading) 3개를 얹는다. 트랙이 사라지지 않는다 |
| empty | items.length === 0 | 트랙과 레인 색면은 유지하고 그 위에 빈 문구 + CTA. 하루가 통째로 사라지면 며칠짜리 코스인지 안 보인다 |
| error | 상위가 지시 | 트랙 위에 인라인 오류 + 재시도. 다른 날의 레인은 영향받지 않는다 |
| dragging | editable=true, 항목 잡음 | 잡힌 액자 opacity 0.9 + scale 1.02, 놓일 자리에 --color-bg-sunken 슬롯 표시 |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--color-focus-ring. 포커스된 액자가 뷰포트로 스크롤된다 |

## a11y
- a11y:label — 레인 전체에 `aria-label` 로 "Day 1, 4 places" / "1일차, 장소 4곳". 끌기 손잡이는 "Reorder <스팟 이름>" 라벨을 갖는다
- a11y:focus — 가로 스크롤 안에서 포커스가 이동하면 `scrollIntoView({block:'nearest'})` 로 뷰포트에 들인다. 항목을 빼면 포커스를 같은 레인의 다음 항목으로, 마지막이면 이전 항목으로 옮긴다. body 로 떨어뜨리지 않는다
- a11y:contrast — 레인 색면 위 텍스트는 --color-text-on-warm(로즈·머스터드·민트) 또는 --color-text-on-accent(코발트·시안) 를 쓴다. 5색 전부 4.5:1 이상으로 실측했다 (tokens.md `## 대비 검증`)
- a11y:target — 끌기 손잡이와 빼기 버튼은 24x24 px 이상 + 인접 8px. 모바일에서는 44x44 로 키운다
- a11y:role — ordered list (`ol`). 자식은 `li`. **끌어 옮기기가 마우스 전용이 되면 안 된다** — 위/아래(또는 좌/우) 이동 버튼을 키보드 대체 수단으로 반드시 제공한다

## responsive
- nextjs: <768 가로 스크롤. **세로 목록으로 무너뜨리지 않는다** — 순서가 정보이므로 가로 흐름을 유지한다. 끌어 옮기기는 길게 누르기로 시작
- nextjs: >=768 레인 전체가 뷰포트에 들어오도록 SpotFrame 폭을 축소. 요일 라벨을 좌측 고정
- nextjs: >=1280 최대 폭 1200
- `prefers-reduced-motion: reduce` 면 드래그 애니메이션을 0ms 로 낮춘다

## platform-diff
- nextjs: 포인터 드래그 + 키보드 이동 버튼 둘 다
- rn: 해당 없음 — stack=nextjs 로 모바일 앱을 만들지 않는다
