/**
 * 필터 바 바로 위에 두는 표식의 속성 이름.
 *
 * **`"use client"` 모듈에 두지 않는다.** 클라이언트 모듈의 상수를 서버 컴포넌트가
 * import 하면 서버 번들에서 클라이언트 참조 프록시로 바뀌어 값이 `undefined` 가
 * 된다. 그러면 속성이 아예 렌더되지 않고, 관찰자는 찾을 표식이 없어 조용히
 * 아무 일도 하지 않는다 — 에러도 경고도 없다.
 * 같은 이유로 `presentation/lib/theme.ts` 가 따로 있다.
 */
export const STICKY_SENTINEL = "data-sticky-sentinel";
