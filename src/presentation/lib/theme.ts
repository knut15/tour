/**
 * 테마 상수. **서버와 클라이언트가 함께 쓰므로 `"use client"` 모듈에 두지 않는다.**
 *
 * `"use client"` 파일에서 상수를 import 하면 서버 번들에서는 클라이언트 참조 프록시로
 * 바뀌어 값이 `undefined` 가 된다. 실제로 이 프로젝트에서 그 일이 났다 —
 * `cookies().get(THEME_COOKIE)` 가 조용히 undefined 를 반환해 테마가 전혀 적용되지 않았다.
 * 에러가 나지 않고 "그냥 안 되는" 형태라 화면만 보면 원인을 알 수 없다.
 */
export const THEME_COOKIE = "seoul_tour_theme";

export type Theme = "light" | "dark";

export function isTheme(value: string | undefined): value is Theme {
  return value === "light" || value === "dark";
}

/** 1년. 테마 선택은 자주 바뀌지 않는다 */
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
