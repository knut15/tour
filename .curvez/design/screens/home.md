# screen: home
platform: nextjs
route(nextjs): /[locale]
route(rn): 해당 없음 — stack=nextjs, 모바일 앱 미지원
goal: 서울을 편집된 벽으로 처음 보여주고, 방문자가 최소 하나를 담게 만든다
entry: 직접 진입 / 검색 유입 / 로고 클릭
exit: 액자 클릭 → spot-detail, 카테고리 → explore, 코스 짜기 → plan

## layout
- region: masthead
  - fixed: false
  - role: 앱 이름과 로케일 전환만. 두꺼운 내비게이션을 두지 않는다 (GOAL §0.5-6 크롬 제거)
  - tokens: bg=--color-bg-canvas, padding=--space-4
  - note: sticky 로 만들지 않는다. 스크롤하면 벽만 남는다
- region: opening
  - role: 이 앱이 무엇인지 한 문장. 주어는 "당신"이다 (GOAL §0.5-4)
  - tokens: font=--font-family-display, size=--font-size-display, weight=--font-weight-display
  - copy(en): "Your Seoul, framed."
  - copy(ko): "당신의 서울을, 액자에 담아"
  - note: 부제는 한 줄만. 총 건수·제공기관을 여기에 쓰지 않는다
- region: wall-featured
  - role: 오늘 걸어둔 벽. 스팟 6~9개를 비대칭으로 건다
  - component: Wall(count=7)
  - priority: 1
  - tokens: gap=--space-6, padding-y=--space-12
- region: wall-category
  - role: 카테고리를 고르면 같은 자리의 벽이 갈린다. 화면 이동이 아니다
  - component: Wall(count=6)
  - priority: 2
  - region: category-picker
    - role: 카테고리 4개. chip 나열이 아니라 큰 선택지 4개다
    - tokens: font=--font-family-display, letter-spacing=--letter-spacing-eyebrow
    - note: 각 항목은 자기 카테고리 색을 면으로 갖는다
- region: plan-invite
  - role: 코스 짜기로 넘기는 단 하나의 유도. 배너가 아니라 큰 여백 위의 문장 하나 + 버튼
  - component: Button(variant=primary)
  - tokens: padding-y=--space-20
- region: footer
  - role: 출처 표기와 로케일 전환. 제공기관 표기는 여기에만 둔다 (GOAL §0.5)
  - tokens: bg=--color-bg-sunken, font-size=--font-size-caption

## states
- state:default — wall-featured 에 7개, wall-category 에 6개. 담은 스팟이 있으면 해당 액자에 SaveChip(saved=true) 표식이 붙는다. 본 스팟은 매트가 --color-bg-sunken 으로 바뀐다 (GOAL §0.5-5 손때)
- state:loading — wall 영역만 Skeleton 액자로 치환한다. masthead·opening 은 유지한다. 액자 비율을 그대로 둬 레이아웃 점프를 만들지 않는다. 200ms 미만이면 표시하지 않는다
- state:empty — TourAPI 가 0건을 반환한 경우다. 문구(en) "Nothing on the wall right now." / (ko) "지금은 벽이 비어 있습니다." 아래에 "다시 불러오기" 버튼 1개. 카테고리 필터가 걸린 wall-category 에서는 문구를 "이 카테고리에는 아직 걸어둔 것이 없습니다" 로 나눈다
- state:error — wall 영역만 ErrorPanel 로 치환한다. 문구(en) "We couldn't load the wall." / (ko) "벽을 불러오지 못했습니다." 재시도 버튼 1개. masthead·opening·footer 는 유지한다. 일부만 실패하면 성공한 액자는 그대로 두고 실패한 슬롯만 치환한다

## responsive
- nextjs: <768 Wall 은 단일 열로 무너지되 액자 크기 차이는 유지한다 (큰 액자 100%, 작은 액자 72%, 좌우 교차 정렬). 균일 스택으로 만들지 않는다
- nextjs: 768~1279 Wall 2열 비대칭
- nextjs: >=1280 Wall 3열 비대칭, 최대 폭 1200
- rn: 해당 없음

## a11y
- focus-order: masthead.locale → opening → wall-featured.frame[0..n] → category-picker[0..3] → wall-category.frame[0..n] → plan-invite.cta → footer
- landmark: opening+wall-featured+wall-category+plan-invite = main, masthead = banner, footer = contentinfo
- announce: 카테고리 전환 시 live region 으로 "<카테고리> 벽으로 바뀌었습니다"
- a11y:contrast — 모든 액자 캡션은 --color-text-primary on --color-bg-surface (14.69:1)
- 비대칭 배치는 시각적 순서와 DOM 순서를 일치시킨다. CSS order 로 순서를 바꾸지 않는다
