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
