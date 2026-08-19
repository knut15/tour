# component: SpotFrame
platform: nextjs
purpose: 스팟 하나를 **액자**로 감싼다. 이 앱의 시그니처이며, 카탈로그를 벽처럼 보이게 만드는 유일한 장치다. 썸네일+제목+설명의 반복 카드로 만들지 않는다.

**카드는 컨테이너를 갖지 않는다.** 이미지가 곧 카드이고 글자는 바탕 위에 그대로 앉는다.
근거: `docs/ref/IMG_card-reference.png`

### 정보 구조 — 네 층

```
[ 이미지 3:2, radius 10, 저장 칩 우상단 ]
제목                                    자치구 (대문자 자간 0.16em)
한글 원명
──────────────────────────────────────  헤어라인
● 주소
```

각 슬롯이 실제 정보를 진다. 장식으로 넣은 칸이 없다.

**모든 카드에서 같은 값을 가지는 것은 정보가 아니다.** 초안은 헤어라인 아래 우측에
카테고리 라벨을 뒀는데, 탐색은 항상 한 카테고리로 필터되므로 전 카드에 같은 값이 반복됐다.
게다가 색을 입혀 링크처럼 보였다. 카테고리는 작은 점 하나로만 남긴다.

### 색면 카드를 폐기한 이유

한 단계 앞선 초안은 카드 전체를 카테고리 색면으로 만들었다. `GOAL.md` §2.3 의
"색은 면으로 쓴다" 를 만족시키려던 것인데, 화면 전체가 색으로 덮여 **정작 사진이 죽었다.**

**색은 이제 카테고리 컨트롤과 사진에서만 나온다.** 컨트롤이 색을 지고 콘텐츠는 사진이 진다 —
활성 카테고리 타일이 화면의 유일한 색면이므로 "한 화면에 지배적인 액센트 하나"(§2.3)는 그대로 성립한다.

### 창 비율은 원본에 맞춘다

**타일도 3:2 다.** 정사각 타일에 3:2 원본을 넣으면 높이의 25% 가 빈 띠가 되는데,
구현해서 보니 의도된 매트가 아니라 **이미지가 채워지지 않은 사고**로 읽혔다.
비율을 맞추면 이미지가 꽉 차면서도 크롭이 필요 없다 — 크롭 금지 제약과 맞물린다.

### 모서리

바깥 10px / 안쪽 8px. 큰 반경(20px+)은 앱 위젯처럼 보인다. 레퍼런스의 카드는 모서리가 작다.

## props
| 이름 | 타입 | 필수 | 기본값 | 의미 |
|---|---|---|---|---|
| spotId | string | O | — | 스팟 식별자 |
| titleEn | string | O | — | 영문 이름. 캡션 1행 |
| titleKo | string | O | — | 한글 이름. 캡션 2행. **생략 불가** — 현장에서 대조해야 한다 |
| imageUrl | string \| null | O | — | null 이면 카테고리 색 면으로 대체. 회색 플레이스홀더 금지 |
| category | attraction \| culture \| food \| festival | O | — | 매트 하단 띠의 색을 정한다 |
| size | sm \| md \| lg | X | md | 벽의 비대칭을 만드는 축. sm=192, md=280, lg=400 (폭 px) |
| matte | photo \| portrait | X | photo | 액자 **안쪽 영역** 비율. 3:2 는 TourAPI `firstimage` 실측 최빈값이다. `matte=tall` 이면 4:5 — **3:4 는 쓰지 않는다.** 구현해 보니 원본이 3:2 뿐이라 여백이 그림보다 커졌다 |
| matte | even \| tall | X | even | 매트 비율. `tall` 은 위아래 매트를 두껍게 해 **가로 이미지를 세로 액자로** 만든다. 벽의 비대칭은 여기서 나온다 |
| seen | boolean | X | false | true 면 매트가 --color-bg-sunken 으로. 손때 (GOAL §0.5-5) |
| saved | boolean | X | false | true 면 우상단에 SaveChip(saved) 표식 |
| order | number \| null | X | null | DayLane 안에서만 쓴다. 순서 숫자를 매트 좌상단에 표기 |
| onOpen | () => void | O | — | 액자 클릭 |
| copyright | Type1 \| Type3 \| null | X | null | TourAPI `cpyrhtDivCd`. `Type3` 는 변경금지이므로 크롭·필터·오버레이 합성을 하지 않는다. 두 유형 모두 상세 화면에서 출처를 표시한다 |

## states
| state | 트리거 | 시각 변화 |
|---|---|---|
| default | — | 매트 bg=--color-bg-surface. **안쪽 영역의 배경도 매트와 같은 색이다** — `object-fit: contain` 의 레터박스가 어두운 구멍이 아니라 매트로 읽혀야 한다. 구현 중 `--color-bg-sunken` 을 썼더니 액자가 아니라 빈 상자로 보였다. 안쪽 radius=--radius-md + 1px ring, 바깥 radius=--radius-lg, 하단 카테고리 색 띠 |
| seen | seen=true | 매트 bg=--color-bg-sunken. 이미지는 그대로. 흐리게 만들지 않는다 — 본 것이지 죽은 것이 아니다 |
| saved | saved=true | 우상단 SaveChip(saved=true). 매트 하단 띠가 --space-2 로 두꺼워진다 |
| hover | 포인터 진입 | transform: translateY(-2px). 그림자를 추가하지 않는다 — 깊이는 색면 대비로 만든다 (GOAL §2.3) |
| focus-visible | 키보드 포커스 | outline 2 + offset 2, color=--color-focus-ring |
| pressed | :active | transform: scale(0.99) |
| loading | 상위가 Skeleton 으로 치환 | 매트 구조는 유지하고 안쪽만 --color-bg-sunken 면. 비율을 지켜 레이아웃 점프를 막는다 |
| empty | 없음 | 이 컴포넌트는 빈 상태를 갖지 않는다. 데이터가 없으면 상위 Wall 이 렌더하지 않는다 |
| error | imageUrl 로드 실패 | 안쪽을 카테고리 색 면으로 대체하고 캡션은 유지한다. 액자를 지우지 않는다 |

## a11y
- a11y:label — 액자 전체가 링크다. 접근 이름은 `titleEn` + `titleKo` 를 이어 읽는다. 이미지 alt 는 스팟 이름이며 장식이 아니다. SaveChip 은 별도 접근 이름을 갖는다
- a11y:focus — 액자와 내부 SaveChip 은 각각 포커스를 받는다. 포커스 순서는 액자 → SaveChip. 벽의 비대칭 배치에서도 DOM 순서와 시각 순서를 일치시킨다 (CSS order 금지)
- a11y:contrast — 캡션 --color-text-primary on --color-bg-surface = 14.69:1, seen 상태에서 on --color-bg-sunken 도 4.5:1 이상. 카테고리 색 띠는 정보를 단독으로 전달하지 않는다 — 카테고리는 캡션 텍스트로도 표기한다
- a11y:target — 액자 전체가 클릭 영역이며 최소 24x24 px 이상. SaveChip 은 인접 8px 를 확보한다
- a11y:role — link (article 아님). 안의 SaveChip 은 button

## responsive
- nextjs: <768 size 는 sm/md 만 사용. lg 는 md 로 강등한다
- nextjs: >=768 size 3종 전부 사용
- nextjs: 이미지는 `loading="lazy"` + `decoding="async"`. 첫 화면 상단 2개만 eager

## platform-diff
- nextjs: hover / focus-visible 정의. size=lg 허용
- rn: 해당 없음 — stack=nextjs 로 모바일 앱을 만들지 않는다
