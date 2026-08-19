import "server-only";
import type { Locale } from "@/domain/shared/locale";

/**
 * 사전은 서버에서만 읽는다. 번역 파일 크기가 클라이언트 번들에 영향을 주지 않는다.
 * 문장의 주어를 "서울의 X" 가 아니라 "당신의 X" 로 쓴다 (GOAL.md §0.5-4).
 */
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import("@/presentation/i18n/en.json").then((m) => m.default),
  ko: () => import("@/presentation/i18n/ko.json").then((m) => m.default),
  ja: () => import("@/presentation/i18n/ja.json").then((m) => m.default),
  "zh-Hant": () => import("@/presentation/i18n/zh-Hant.json").then((m) => m.default),
  de: () => import("@/presentation/i18n/de.json").then((m) => m.default),
  fr: () => import("@/presentation/i18n/fr.json").then((m) => m.default),
};

export type Dictionary = typeof import("@/presentation/i18n/en.json");

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
