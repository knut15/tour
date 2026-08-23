/**
 * 한 묶음의 크기. 더보기를 누를 때마다 이만큼 늘어난다.
 *
 * **열 수의 배수여야 한다.** 아니면 마지막 줄만 이가 빠진 채 남고, 더보기를 눌러
 * 채워질 때까지 그 자리가 비어 보인다. 벽은 가장 넓을 때 4열이므로(`Wall.tsx`)
 * 12 는 3행을 꽉 채운다 — 2열에서는 6행, 3열에서는 4행으로 역시 떨어진다.
 */
export const BATCH = 12;

/**
 * 더보기 횟수의 상한. 임의값이 아니다 —
 * `(15 + 1) * 12 = 192` 로 TourAPI `numOfRows` 가 받아 주는 200 아래에 든다.
 * 실측 2026-08-19: `numOfRows=200` 까지 200건을 준다.
 *
 * **`BATCH` 를 바꾸면 이 값도 다시 계산한다.** 곱이 200 을 넘으면 마지막 더보기가
 * 조용히 빈 결과를 받는다.
 */
export const MORE_MAX = 15;

/**
 * URL 의 `more` 를 읽는다. **더보기를 몇 번 눌렀는가**이지 페이지 번호가 아니다.
 *
 * 범위 밖이거나 숫자가 아니면 0 이다. 잘못된 값에 에러를 내지 않는 이유는,
 * 링크를 손으로 고친 사람에게 보여줄 화면이 "첫 묶음" 말고는 없기 때문이다.
 */
export function parseMore(raw: string | undefined): number {
  const n = Number((raw ?? "").trim());
  return Number.isInteger(n) && n >= 1 && n <= MORE_MAX ? n : 0;
}

/** `more` 번 누른 뒤 한 번에 받아야 할 항목 수 */
export function requestSize(more: number): number {
  return BATCH * (more + 1);
}

/**
 * 이번에 새로 붙은 카드가 시작하는 인덱스. 그 앞은 이미 화면에 있던 것이다.
 *
 * `undefined` 면 아무것도 등장시키지 않는다 — 첫 화면은 "추가" 가 아니다.
 *
 * `rendered` 로 자르는 이유: 공급자가 준 것 중 걸러진 항목이 있으면 실제 개수가
 * 요청 수보다 적다. 그때 `more * BATCH` 를 그대로 쓰면 경계가 목록 밖을 가리켜
 * **새 카드가 하나도 애니메이션되지 않는다.** 사용자에게는 "더보기를 눌렀는데
 * 아무 반응이 없다" 로 보인다.
 */
export function enterFrom(more: number, rendered: number): number | undefined {
  if (more <= 0) return undefined;
  return Math.min(more * BATCH, rendered);
}
