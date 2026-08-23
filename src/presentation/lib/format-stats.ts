/**
 * 반응 수의 서식. **서버와 클라이언트가 같은 함수를 쓴다.**
 *
 * 두 곳에 따로 쓰면 같은 수가 다르게 보인다. 특히 조회는 compact 표기라 `1.2천` 과
 * `1.2K` 처럼 갈라지기 쉽다.
 *
 * 다만 **첫 렌더의 문자열은 서버가 만든 것을 그대로 쓴다.** `Intl` 의 결과는 런타임의
 * ICU 판에 따라 달라질 수 있어, 클라이언트가 hydration 시점에 다시 계산하면 그 차이가
 * 곧바로 불일치가 된다. 이 함수는 **수가 실제로 바뀐 뒤**에만 클라이언트에서 불린다.
 */
export function formatLikes(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/** 조회는 크게 자란다. 네 자리부터는 자릿수보다 규모가 읽혀야 한다 */
export function formatViews(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}
