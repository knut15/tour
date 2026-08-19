import type { Category } from "@/domain/spot/category";

export type ExploreFilter = {
  category: Category;
  areaCode?: number;
  districtCode?: number;
  page?: number;
};

/**
 * 탐색 화면 URL 을 만드는 **유일한 자리**.
 *
 * 카테고리 탭·시도 선택·시군구 선택·더 보기가 각자 `URLSearchParams` 를 조립하면
 * 규칙이 넷으로 갈라진다. 실제로 그중 하나만 `district` 를 빠뜨려도 필터가
 * 조용히 풀리는데, 그건 링크를 눌러 보기 전까지 드러나지 않는다.
 *
 * 지키는 규칙 둘:
 * 1. **시도 없는 시군구는 버린다.** 시군구 코드는 시도 안에서만 고유해서
 *    (`domain/spot/region.ts`) 혼자서는 어느 지역인지 정하지 못한다.
 * 2. **1페이지는 쓰지 않는다.** 기본값을 URL 에 남기면 같은 화면이 두 주소를 갖는다.
 */
export function exploreHref(locale: string, filter: ExploreFilter): string {
  const p = new URLSearchParams({ category: filter.category });
  if (filter.areaCode) {
    p.set("area", String(filter.areaCode));
    if (filter.districtCode) p.set("district", String(filter.districtCode));
  }
  if (filter.page && filter.page > 1) p.set("page", String(filter.page));
  return `/${locale}/explore?${p.toString()}`;
}
