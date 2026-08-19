# component: SaveChip
platform: nextjs
purpose: 스팟을 담고 뺀다. **로그인 없이 동작한다** — 계정은 코스를 저장하는 시점에만 요구한다 (`GOAL.md` §3). 담은 것이 화면에 흔적으로 남는 것이 모토의 핵심이다 (§0.5-5 손때).

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| spotId | string | O | — | 스팟 식별자 |
| saved | boolean | O | — | 현재 담긴 상태 |
| variant | chip \| button \| remove | X | chip | chip=액자 우상단 작은 표식, button=상세 화면 하단 큰 버튼, remove=코스에서 빼기 |
| onToggle | (next: boolean) => void | O | — | 담기/빼기 |
| pending | boolean | X | false | 저장 왕복 중. 낙관적 갱신을 쓰므로 보통 false |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | saved=false | chip: 매트색 원형 + 외곽선 없는 아이콘. button: variant=secondary 스타일 |
| saved | saved=true | chip: bg=--color-accent-primary, 아이콘 --color-text-on-accent. button: 라벨이 "담김"/"Saved" 로, bg=--color-accent-primary |
| hover | 포인터 진입 | transform: scale(1.04). saved 상태에서는 bg=--color-accent-primary-hover |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--color-focus-ring |
| pressed | :active | transform: scale(0.96) |
| loading | pending=true | 아이콘 자리에 스피너 16. **폭을 고정해 레이아웃 점프를 막는다.** 낙관적 갱신이 기본이라 이 상태는 재시도 중에만 보인다 |
| empty | 없음 | 이 컴포넌트는 빈 상태를 갖지 않는다. 항상 두 값(담김/안 담김) 중 하나다 |
| error | 저장 실패 | 상태를 이전 값으로 되돌리고 인라인 토스트 1개. 조용히 삼키지 않는다. chip 이 잠깐 --color-accent-danger 로 깜빡인다 |
| disabled | variant=remove 이고 코스에 1개만 남음 | 3:1 이상 대비를 유지한 흐린 상태. 툴팁으로 사유를 알린다 |

## a11y
- a11y:label — 아이콘 전용(variant=chip)이면 `aria-label` 필수. saved=false 는 "Save <스팟 이름>" / "<스팟 이름> 담기", saved=true 는 "Remove <스팟 이름>" / "<스팟 이름> 빼기". **상태가 라벨에 드러나야 한다.** variant=button 은 텍스트 라벨이 있으므로 aria-label 을 중복 지정하지 않는다
- a11y:focus — SpotFrame 안에 있을 때 액자 링크 다음에 포커스를 받는다. 토글 후에도 포커스를 잃지 않는다. 클릭이 상위 액자 링크로 전파되지 않게 막는다
- a11y:contrast — saved 상태 --color-text-on-accent on --color-accent-primary = 7.48:1(라이트) / 7.75:1(다크). disabled 는 3:1 이상 (WCAG 1.4.11)
- a11y:target — 24x24 px 이상 + 인접 8px. variant=chip 이 액자 모서리에 붙으므로 액자 링크와 겹치지 않게 8px 를 띄운다. 모바일은 44x44
- a11y:role — button. `aria-pressed` 로 saved 를 노출한다. 링크로 만들지 않는다

## responsive
- nextjs: <768 variant=chip 타깃을 44x44 로 키운다. variant=button 은 폭 100%
- nextjs: >=768 chip 32x32, button 은 내용 폭

## platform-diff
- nextjs: hover / focus-visible / aria-pressed 정의
- rn: 해당 없음 — stack=nextjs 로 모바일 앱을 만들지 않는다
