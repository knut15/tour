# screen: spot-detail
platform: nextjs
route(nextjs): /[locale]/spots/[id]
route(rn): 해당 없음 — stack=nextjs, 모바일 앱 미지원
goal: 한 스팟을 판단하는 데 필요한 것을 전부 주고, 담게 만든다
entry: home/explore/plan/course-detail 의 액자 클릭 / 공유 링크 / 검색 유입
exit: 담기 → 머문다, 뒤로 → 직전 화면, 지도에서 보기 → 외부 지도 앱

## layout
- region: masthead
  - role: 뒤로가기와 로케일 전환
- region: hero
  - role: 스팟 사진 하나를 크게. 이 화면에서 가장 먼저 보이는 것은 사진이다
  - tokens: radius=--radius-lg, bg=--color-bg-sunken
  - note: 사진이 없으면 카테고리 색 면으로 대체한다. 회색 플레이스홀더를 쓰지 않는다
- region: identity
  - role: 이름을 영문과 한글로 **함께** 보여준다. 택시 기사에게 보여주고 표지판과 대조해야 한다 (GOAL §5-2)
  - tokens: font=--font-family-display (영문), font=--font-family-body (한글)
  - note: 한글명은 보조가 아니라 동급이다. 크기를 줄이더라도 흐리게 만들지 않는다
- region: facts
  - role: 판단에 필요한 사실. 주소·영업시간·휴무일·문의·공식 링크
  - note: 값이 없는 항목은 **숨기지 않고** "정보 없음" 으로 표시하고 공식 링크를 준다 (GOAL §5-3)
- region: description
  - role: 스팟 설명. 한글 블록은 word-break:keep-all, line-height=--line-height-ko
- region: actions
  - sticky: true
  - role: 담기와 지도에서 보기. 화면 하단에 고정한다
  - component: SaveChip, Button(variant=secondary)
- region: source
  - role: 제공기관 표기. **이 앱에서 출처를 밝히는 유일한 자리다** (GOAL §0.5-6)
  - tokens: font-size=--font-size-caption, color=--color-text-muted

## states
- state:default — hero 사진 1장 이상, identity 영문+한글 둘 다, facts 최소 주소 1건
- state:loading — hero 를 --color-bg-sunken 면으로, identity/facts/description 을 Skeleton 으로 치환. masthead·actions 는 유지하되 actions 는 disabled. 200ms 미만이면 표시하지 않는다
- state:empty — 단건 조회라 빈 상태가 없다. 존재하지 않는 id 는 state:error 로 간다. 단 facts 의 개별 항목이 비는 것은 빈 상태가 아니라 default 안에서 "정보 없음" 으로 처리한다
- **로케일 전환은 목록으로 보낸다.** `contentid` 공간이 국문·영문으로 분리돼 있어 대응하는
  반대 로케일 URL 을 만들 수 없다. 링크에 `title` 로 그 사실을 알린다 (GOAL.md §6)
- state:error — 화면 전체를 ErrorPanel 로 치환. (en) "We couldn't find this place." / (ko) "이 장소를 찾지 못했습니다." 버튼 2개: "다시 시도" 와 "탐색으로 돌아가기". masthead 는 유지한다

## responsive
- nextjs: <768 단일 열. hero 16:9 풀블리드, actions 하단 sticky
- nextjs: >=768 2열(7:5). 좌측 hero+description, 우측 identity+facts+actions 고정. actions sticky 해제
- nextjs: >=1280 최대 폭 1200

## a11y
- focus-order: masthead.back → hero → identity → facts → description → actions.save → actions.map → source
- **DOM 순서를 `hero → identity → facts → description` 으로 고정한다.** 초안은 좌(hero+description) /
  우(identity+facts) 로 나눴는데, 좁은 화면에서 단일 열로 무너지면 **이름을 읽기 전에 설명을 읽게 된다.**
  구현 중 실제로 그렇게 나왔다. 데스크톱 2열은 CSS `order` 가 아니라 명시적 grid 좌표
  (`col-start` / `row-start`)로 만든다 — `order` 는 키보드 순서를 시각 순서와 어긋나게 한다
- landmark: hero~source = main, masthead = banner
- announce: 담기 성공 시 live region 으로 "담았습니다" / "Saved"
- a11y:label — hero 이미지에 스팟 이름을 alt 로 넣는다. 장식 이미지가 아니다
- a11y:contrast — source 의 --color-text-muted on --color-bg-canvas 를 4.5:1 이상으로 유지한다
