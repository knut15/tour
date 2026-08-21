/**
 * 토스 디자인 시스템의 기하·색을 유틸리티 조합으로 고정한다.
 *
 * **TDS Mobile 과 toss.im 마케팅 값을 섞지 않는다.** 토스 문서의 명시적 금지 사항이다
 * (16px TDS 반경과 7px 마케팅 반경을 평균내지 마라).
 */

/** TDS Mobile Button — xlarge: 56px / 16px 반경 / 17px 600 */
export const TDS_BUTTON =
  "inline-flex items-center justify-center h-14 px-5 rounded-[16px] " +
  "text-[17px] font-semibold leading-none " +
  "transition-colors duration-200 ease-[var(--ease-signature)] " +
  "active:opacity-[0.92] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export const TDS_BUTTON_PRIMARY = "bg-primary text-on-primary hover:bg-primary-hover";

/** TDS weak — 같은 기하, 약한 색 */
export const TDS_BUTTON_WEAK = "bg-weak-bg text-weak-fg hover:brightness-[0.97]";

/** toss.im 마케팅 CTA — 40px / 7px 반경 / 15px 600. TDS 와 다른 기하다 */
export const TOSS_MARKETING_CTA =
  "inline-flex items-center justify-center h-10 px-4 rounded-[7px] " +
  "text-[15px] font-semibold leading-none bg-weak-bg text-weak-fg " +
  "transition-colors duration-200 ease-[var(--ease-signature)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * 헤더에 나란히 서는 작은 컨트롤 — 테마 토글, 언어 선택.
 *
 * **높이를 이 상수 밖에서 정하지 않는다.** 각자 정하면 어긋난다. 실제로
 * 테마 토글은 `size-9`(36px), 언어 선택은 `py-2`+`leading-24`(42px)로 6px 차이가
 * 났다. 나란히 놓인 것의 높이 차이는 잰 사람만 알아볼 수 있을 뿐,
 * 어긋나 보인다는 인상은 누구에게나 남는다.
 *
 * `leading-none` 이 있어야 글자 있는 것과 아이콘만 있는 것의 높이가 같아진다 —
 * 없으면 `line-height` 가 높이를 밀어 올린다.
 */
export const CONTROL_SM =
  "inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-line " +
  "text-[13px] leading-none text-muted " +
  "transition-colors duration-200 ease-[var(--ease-signature)] hover:text-ink " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * 필터 바에 나란히 서는 컨트롤 — 지역 선택, 내 위치 토글.
 *
 * **헤더의 `CONTROL_SM` 과 다른 값이다.** 헤더는 36px 의 조용한 도구 줄이고,
 * 필터 바는 사용자가 목록을 바꾸려고 직접 겨누는 자리라 더 크다. 둘을 합치면
 * 한쪽이 반드시 어색해진다.
 *
 * **높이를 이 상수 밖에서 정하지 않는다.** 지역 선택이 `px-4 py-2.5 text-[15px]` 를
 * 인라인으로 들고 있던 동안, 옆에 무엇을 세우든 그 값을 눈으로 베껴야 했다.
 * 나란히 선 것의 높이 차이는 잰 사람만 알아보지만 어긋나 보인다는 인상은 남는다.
 */
export const FILTER_CONTROL =
  // 호버에 확대를 넣지 않는다. 필터는 자주 지나가는 자리라 커서가 스칠 때마다
  // 크기가 흔들리고, 스티키 바에 붙은 뒤에는 그 흔들림이 목록 위에서 일어난다
  "flex cursor-pointer list-none items-center gap-2 rounded-btn border border-line " +
  "bg-canvas px-4 py-2.5 text-[15px] text-ink " +
  "transition-colors duration-200 ease-[var(--ease-signature)] hover:border-ink/25 " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * 상세 화면 바닥에 나란히 서는 액션 — 담기, 지도, 공식 사이트.
 *
 * **TDS xlarge(56px / 16px 반경 / 17px)를 쓰지 않는다.** 그 기하는 화면에 하나뿐인
 * 주 액션을 위한 것이고, 여기서는 셋이 한 줄에 선다. 56px 짜리 셋이 나란히 서면
 * 조용한 지면 바닥에 버튼 띠가 생겨 그것부터 눈에 든다.
 *
 * **높이를 이 상수 밖에서 정하지 않는다.** 각자 정하면 어긋난다 — 담기는 `TDS_BUTTON`,
 * 지도는 같은 것에 `flex-1`, 공식 사이트는 `TOSS_MARKETING_CTA`(40px / 7px 반경)를
 * 쓰고 있어서 셋의 높이와 모서리가 전부 달랐다.
 *
 * 반경은 `--round-sm`(4px) 토큰이다. 숫자를 직접 쓰지 않는다.
 * `leading-none` 이 있어야 글자가 높이를 밀어 올리지 않는다.
 */
export const DETAIL_ACTION =
  "inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-sm px-4 " +
  "text-[14px] font-semibold leading-none " +
  "transition-colors duration-200 ease-[var(--ease-signature)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";
