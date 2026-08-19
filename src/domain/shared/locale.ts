/** 지원 로케일. 영어가 1급 시민이므로 기본값은 en 이다 (GOAL.md §5-1). */
export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
