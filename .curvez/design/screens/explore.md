# screen: explore
platform: nextjs
route(nextjs): /[locale]/explore
route(rn): 해당 없음 — stack=nextjs, 모바일 앱 미지원
goal: 카테고리와 서울 구를 바꿔가며 목록을 훑고 마음에 드는 것을 담는다
entry: home 의 카테고리 선택 / 직접 진입 / 검색 유입
exit: 액자 클릭 → spot-detail, 코스 짜기 → plan

## layout
- region: masthead
  - role: 앱 이름과 로케일 전환. home 과 동일
  - tokens: bg=--color-bg-canvas
- region: filter
  - role: 카테고리 4개 + 서울 구 선택. 화면을 가득 채운 chip 나열을 만들지 않는다
  - region: category-picker
    - role: 카테고리 4개를 색면으로. 선택된 것이 화면의 지배 액센트가 된다
    - tokens: font=--font-family-display, letter-spacing=--letter-spacing-eyebrow
  - region: district-picker
    - role: 서울 구. 25개를 전부 나열하지 않고 단일 선택 컨트롤 하나로 접는다
    - component: Button(variant=secondary)
    - note: 열면 시트로 뜬다. 상시 노출하지 않는다
- region: wall
  - role: 필터 결과를 액자로 건다. 한 번에 6~9개
  - component: Wall(count=9)
  - priority: 1
- region: more
  - role: 다음 묶음을 부른다. **페이지 번호와 총 건수를 표시하지 않는다** (GOAL §0.5-3)
  - component: Button(variant=secondary)
  - copy(en): "Show another wall"
  - copy(ko): "다른 목록 보기"
  - note: **같은 카테고리의 다음 묶음**을 부른다. `?page=` 로 넘기되 화면에는 페이지 번호를 쓰지 않는다.
    URL 에 page 가 남는 것은 공유·뒤로가기를 위해서다
- region: footer
  - role: 출처 표기. home 과 동일

## states
- state:default — 필터 조건에 맞는 액자 6~9개. 담은 것은 SaveChip(saved=true), 본 것은 매트 색 변화
- state:loading — wall 만 Skeleton 액자로 치환. filter 는 조작 가능한 상태로 유지한다. 필터를 바꿀 때마다 전체 화면을 비우지 않는다. 200ms 미만이면 표시하지 않는다
- state:empty — 두 갈래로 나눈다. (1) 필터 결과 0건: (en) "Nothing matches that combination." / (ko) "그 조합에는 아무것도 없습니다." + "필터 지우기" 버튼. (2) 영문 데이터가 비어 한 건도 못 채운 경우: (en) "This area has no English listings yet." + "한국어로 보기" 버튼
- state:error — wall 만 ErrorPanel 로 치환. (en) "We couldn't load this wall." / (ko) "이 목록을 불러오지 못했습니다." 재시도 버튼 1개. filter 선택값은 유지한다

## responsive
- nextjs: <768 Wall 단일 열 비대칭 유지. filter 는 상단 고정 1줄, district-picker 는 시트로 열린다
- nextjs: 768~1279 Wall 2열 비대칭
- nextjs: >=1280 Wall 3열 비대칭, 최대 폭 1200

## a11y
- focus-order: masthead.locale → category-picker[0..3] → district-picker → wall.frame[0..n] → more → footer
- landmark: filter+wall+more = main, masthead = banner, footer = contentinfo
- announce: 필터 변경 시 live region 으로 "<카테고리>, <구> 목록으로 바뀌었습니다". 건수를 읽지 않는다
- a11y:role — category-picker 는 **`nav` + 링크**로 구현했다. 스펙 초안은 radiogroup 이었으나,
  서버에서 필터링하므로 각 조합이 공유 가능한 URL 을 갖고 JS 없이 동작하는 링크가 맞다.
  radio 는 폼 제출을 전제하는 역할이라 이 구조와 어긋난다. 활성 항목은 `aria-current="page"` 로 표시한다.
  district-picker 는 `<details>` 기반 disclosure 다 — 25개를 상시 나열하지 않으면서 JS 없이 동작한다
