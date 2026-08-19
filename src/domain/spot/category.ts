import type { Locale } from "@/domain/shared/locale";

/**
 * 앱이 노출하는 카테고리. 4개로 확정했다.
 * 여행코스는 다국어 서비스가 없고 서울 0건이라 제외했다.
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 1, tourapi-endpoints-v2.md 사실 8
 */
export const CATEGORIES = ["attraction", "culture", "food", "festival"] as const;
export type Category = (typeof CATEGORIES)[number];

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/**
 * 로케일별 TourAPI contentTypeId.
 *
 * **국문과 영문의 코드 체계가 다르다.** 국문 코드를 영문 서비스에 넣으면 전부 0건이 나온다.
 * 근거: .curvez/research/tourapi-english-coverage.md 사실 2,
 *       신분류체계정보 관광타입정보 연계 정의서.xlsx 의 관광타입 매핑표
 */
const MULTILINGUAL: Record<Category, number> = {
  attraction: 76,
  culture: 78,
  food: 82,
  festival: 85,
};

const CONTENT_TYPE_ID: Record<Locale, Record<Category, number>> = {
  // 국문만 다른 체계를 쓴다. 국문 코드를 다국어 서비스에 넣으면 전부 0건이 나온다
  ko: { attraction: 12, culture: 14, food: 39, festival: 15 },
  // 다국어는 코드가 공통이다 (매뉴얼: "관광정보 (다국어 공통)"). 실측으로도 확인했다
  en: MULTILINGUAL,
  ja: MULTILINGUAL,
  "zh-Hant": MULTILINGUAL,
  de: MULTILINGUAL,
  fr: MULTILINGUAL,
};

export function contentTypeIdOf(category: Category, locale: Locale): number {
  return CONTENT_TYPE_ID[locale][category];
}

export function categoryOfContentTypeId(id: number, locale: Locale): Category | null {
  const table = CONTENT_TYPE_ID[locale];
  for (const c of CATEGORIES) {
    if (table[c] === id) return c;
  }
  return null;
}

/**
 * 신분류체계 소분류 중 관광지 벽에서 배제할 코드.
 *
 * `EX050800 = Other Medical Tourism` 이다. 서울 관광지 405건 중 205건(51%)이 여기 속하며
 * 성형외과·피부과·안과가 그대로 들어온다. 여행 앱의 관광지 목록에 클리닉이 뜨면 신뢰를 잃는다.
 *
 * **EX05 를 통째로 배제하지 않는다.** 같은 중분류에 EX050100(온천/사우나/스파)과
 * EX050200(찜질방)이 있고, 이것들은 외국인 여행자에게 오히려 핵심 관광 자원이다.
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 7·8, 신분류체계 xlsx 의 EX05 소분류
 */
export const EXCLUDED_LCLS_SYSTM3 = ["EX050800"] as const;

export function isExcludedClassification(lclsSystm3: string | null): boolean {
  if (!lclsSystm3) return false;
  return (EXCLUDED_LCLS_SYSTM3 as readonly string[]).includes(lclsSystm3);
}
