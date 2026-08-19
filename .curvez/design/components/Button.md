# component: Button
platform: nextjs
purpose: 단일 행동을 실행한다. 화면 이동 전용이면 Link 를 쓴다. 이 앱에서 버튼은 적고 크다 — chip 나열을 만들지 않는다 (`GOAL.md` §2.1).

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| variant | primary \| secondary \| danger | X | primary | primary=코발트 면, secondary=매트색 면 + 테두리, danger=--color-accent-danger |
| size | md \| lg | X | md | md=높이 44, lg=높이 56. sm 을 두지 않는다 — 작은 버튼은 이 디자인에 없다 |
| loading | boolean | X | false | true 면 라벨 유지 + 스피너, 클릭 무시, 폭 고정 |
| disabled | boolean | X | false | 클릭 무시 + 대비 낮춤 |
| fullWidth | boolean | X | false | 부모 폭 채움 |
| onClick | () => void | O | — | 클릭 핸들러 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | radius=--radius-full, padding=--space-4 --space-8, font=--font-family-display, letter-spacing=--letter-spacing-eyebrow, 대문자 |
| hover | 포인터 진입 | primary: bg=--color-accent-primary-hover. transform: scale(1.02) |
| pressed | :active | transform: scale(0.98) |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--color-focus-ring |
| disabled | disabled=true | bg=--color-accent-primary-disabled, cursor: not-allowed. 대비 3:1 유지 |
| loading | loading=true | 라벨 유지 + 우측 스피너 16. **폭 고정** — 레이아웃 점프 금지 |
| empty | 없음 | 이 컴포넌트는 빈 상태를 갖지 않는다. 라벨 없는 버튼을 만들지 않는다 |
| error | 없음 | 이 컴포넌트는 에러 상태를 갖지 않는다. 에러는 상위 화면이 표시한다 |

**전환은 전부 `--motion-ease` (cubic-bezier(0.16,1,0.3,1)) + `--motion-fast`.** linear·ease-in-out 을 쓰지 않는다.
`transform` 과 `opacity` 만 애니메이션한다.

## a11y
- a11y:label — 텍스트 라벨이 항상 있으므로 `aria-label` 을 중복 지정하지 않는다. 아이콘 전용 버튼이 필요하면 이 컴포넌트가 아니라 SaveChip 계열을 쓴다
- a11y:focus — 포커스 순서는 DOM 순서와 같다. loading 중에도 포커스를 잃지 않는다
- a11y:contrast — primary 는 7.48:1(라이트) / 7.75:1(다크). danger 는 --color-text-on-accent on --color-accent-danger. disabled 는 3:1 이상 (WCAG 1.4.11)
- a11y:target — 최소 44x44 px (md 기준 높이 44). 인접 요소와 8px 이상 띄운다
- a11y:role — button. 화면 이동에 쓰지 않는다 — 이동은 link 다

## responsive
- nextjs: <768 화면 하단 sticky actions 안의 버튼은 fullWidth=true
- nextjs: >=768 내용 폭. sticky 해제

## platform-diff
- nextjs: hover / focus-visible 정의. size 2종
- rn: 해당 없음 — stack=nextjs 로 모바일 앱을 만들지 않는다
