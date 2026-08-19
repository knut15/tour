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
