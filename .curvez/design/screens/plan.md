# screen: plan
platform: nextjs
route(nextjs): /[locale]/plan
route(rn): 해당 없음 — stack=nextjs, 모바일 앱 미지원
goal: 기간과 관심사를 받아 하루 단위 코스를 만들고, 각 스팟이 왜 그 자리에 있는지 보여준다
entry: home 의 plan-invite / explore 의 코스 짜기 / 직접 진입
exit: 코스 저장 → course-detail, 액자 클릭 → spot-detail

## layout
- region: masthead
  - role: 뒤로가기와 로케일 전환
- region: prompt
  - role: 입력. 기간과 관심사 두 가지만 묻는다. 폼처럼 보이지 않게 문장 안에 컨트롤을 넣는다
  - copy(en): "I have [3] days in Seoul, and I'm into [food, art]."
  - copy(ko): "서울에 [3]일 있고, [음식, 예술]에 끌립니다."
  - tokens: font=--font-family-display, size=--font-size-heading
  - note: 라벨-입력칸이 세로로 쌓인 일반 폼을 만들지 않는다. 문장이 곧 폼이다
- region: result
  - role: 생성된 코스. 하루가 레인 하나다
  - region: day-lane
    - role: 하루. 순서가 실제 정보이므로 여기서만 Lane 을 쓴다
    - component: DayLane (반복, day 수만큼)
    - priority: 1
    - region: lane-frame
      - role: 레인 위에 얹힌 스팟. 순서를 갖는다
      - component: SpotFrame(size=sm)
    - region: reason
      - role: 이 스팟이 왜 이 순서인지 한 문장. 거리·영업시간 근거를 노출한다 (GOAL §5-6)
      - tokens: font-size=--font-size-caption, color=--color-text-muted
      - note: 근거 없는 추천은 신뢰를 잃는다. 이 영역을 비우지 않는다
- region: actions
  - sticky: true
  - role: 코스 저장. 저장을 누르는 시점에만 로그인을 요구한다 (GOAL §3)
  - component: Button(variant=primary)

## states
- state:default — prompt 에 값이 채워져 있고 result 에 day-lane 이 1개 이상. 각 lane-frame 에 reason 이 붙어 있다
- state:loading — LLM 호출 중이다. result 를 day-lane 골격 Skeleton 으로 치환하고 prompt 는 조작 가능 상태로 유지한다. 응답이 길어질 수 있으므로 200ms 규칙의 예외다 — 즉시 표시한다. 진행 문구(en) "Planning your days…" / (ko) "일정을 짜는 중입니다…"
- state:empty — 아직 생성을 누르지 않은 최초 진입이다. result 자리에 빈 레인 하나를 흐리게 그려두고 (en) "Tell me how long you're staying." / (ko) "며칠 머무는지 알려주세요." + prompt 로 포커스를 보내는 버튼 1개. 생성 결과가 0건인 경우는 state:error 로 간다
- state:error — 두 갈래를 같은 패널로 처리한다. (1) LLM 실패, (2) 후보 스팟 부족. 문구(en) "We couldn't build a plan." / (ko) "일정을 만들지 못했습니다." 재시도 버튼 1개 + "조건 바꾸기" 버튼 1개. prompt 입력값은 유지한다

## responsive
- nextjs: <768 DayLane 은 가로 스크롤. 레인 하나가 뷰포트 폭을 넘어간다. 세로 목록으로 무너뜨리지 않는다 — 순서가 정보이므로 가로 흐름을 유지한다
- nextjs: >=768 DayLane 전체가 한 화면에 들어오도록 SpotFrame(size=sm) 폭을 줄인다
- nextjs: >=1280 최대 폭 1200. 레인 좌측에 요일 라벨 고정

## a11y
- focus-order: masthead.back → prompt.duration → prompt.interests → prompt.submit → result.day[0].frame[0..n] → result.day[1]… → actions.save
- landmark: prompt+result = main, masthead = banner
- announce: 생성 완료 시 live region 으로 "<n>일 일정이 만들어졌습니다"
- a11y:role — DayLane 은 list, lane-frame 은 listitem. 순서가 있으므로 ordered list 로 표기한다
- a11y:focus — 가로 스크롤 레인에서 키보드 포커스가 이동하면 해당 액자가 뷰포트 안으로 스크롤된다
