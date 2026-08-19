# screen: course-detail
platform: nextjs
route(nextjs): /[locale]/courses/[id]
route(rn): 해당 없음 — stack=nextjs, 모바일 앱 미지원
goal: 내가 만든 코스를 보고 일자·순서를 고치고 공유한다
entry: plan 의 저장 / 내 코스 목록 / 공유 링크
exit: 액자 클릭 → spot-detail, 공유 → 링크 복사, 삭제 → 내 코스 목록

## layout
- region: masthead
  - role: 뒤로가기와 로케일 전환
- region: identity
  - role: 코스 이름과 기간. 이름은 편집 가능하다. 제목처럼 보이되 클릭하면 입력이 된다
  - tokens: font=--font-family-display, size=--font-size-heading
- region: days
  - role: 하루씩 레인으로. 순서가 실제 정보다
  - region: day-lane
    - role: 하루. 스팟을 끌어 순서를 바꾸고 다른 날로 옮긴다
    - component: DayLane(editable=true) (반복)
    - priority: 1
    - region: lane-frame
      - role: 레인 위 스팟. 끌기 손잡이와 빼기 컨트롤을 갖는다
      - component: SpotFrame(size=sm), SaveChip(variant=remove)
- region: actions
  - sticky: true
  - role: 공유와 삭제. 삭제는 파괴적이므로 확인을 받는다
  - component: Button(variant=secondary), Button(variant=danger)
- region: source
  - role: 제공기관 표기
  - tokens: font-size=--font-size-caption, color=--color-text-muted

## states
- state:default — day-lane 1개 이상, 각 레인에 스팟 1개 이상. 편집 컨트롤 활성
- state:loading — days 를 레인 골격 Skeleton 으로 치환. identity·masthead 유지, actions disabled. 200ms 미만이면 표시하지 않는다
- state:empty — 코스는 있는데 스팟이 0개다. 저장 직후 전부 뺀 경우에 생긴다. 빈 레인 하나를 그리고 (en) "This day is empty. Add a place." / (ko) "이 날은 비어 있습니다. 장소를 담아보세요." + "탐색으로 가기" 버튼 1개
- state:error — 두 갈래. (1) 코스를 못 불러옴: 화면 전체 ErrorPanel, (en) "We couldn't open this course." / (ko) "이 코스를 열지 못했습니다." (2) 편집 저장 실패: 화면은 유지하고 상단에 인라인 알림 + 재시도. 편집 내용을 되돌리지 않는다

## responsive
- nextjs: <768 DayLane 가로 스크롤. 끌어 옮기기는 길게 누르기로 시작한다
- nextjs: >=768 레인 전체가 한 화면에. 날짜 라벨 좌측 고정
- nextjs: >=1280 최대 폭 1200

## a11y
- focus-order: masthead.back → identity → days.day[0].frame[0..n] → days.day[1]… → actions.share → actions.delete → source
- landmark: identity+days = main, masthead = banner
- announce: 순서 변경 시 live region 으로 "<스팟 이름>이 <n>번째로 이동했습니다"
- a11y:role — DayLane 은 ordered list. 끌어 옮기기는 마우스 전용이 되면 안 되므로 키보드 대체 수단(위/아래 이동 버튼)을 반드시 제공한다
- a11y:focus — 스팟을 빼면 포커스를 같은 레인의 다음 항목으로 옮긴다. body 로 떨어뜨리지 않는다
