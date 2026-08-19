/**
 * 지원 로케일.
 *
 * 영어가 1급 시민이므로 기본값은 en 이다 (GOAL.md §5-1).
 * TourAPI 는 언어마다 **별도 서비스**이고 각각 활용신청이 필요하다.
 *
 * `zh-Hans`(중국어 간체)는 서비스(`ChsService2`)가 존재하지만 이 키에 등록돼 있지 않다.
 * data.go.kr 에서 활용신청하면 이 배열에 한 줄 추가하는 것으로 켜진다.
 */
export const LOCALES = ["en", "ko", "ja", "zh-Hant", "de", "fr"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** 언어 전환 UI 에 쓰는 자기 이름(endonym). 자기 언어로 적는 것이 관례다. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  "zh-Hant": "繁體中文",
  de: "Deutsch",
  fr: "Français",
};

/** `<html lang>` 값. BCP-47 을 그대로 쓴다 */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  ko: "ko",
  ja: "ja",
  "zh-Hant": "zh-Hant",
  de: "de",
  fr: "fr",
};
