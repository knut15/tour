import type { Category } from "@/domain/spot/category";

export type ExploreFilter = {
  category: Category;
  areaCode?: number;
  districtCode?: number;
  /**
   * 더보기를 **몇 번 눌렀는가**. 0 이면 첫 묶음만 본다.
   *
   * 페이지 번호가 아니다. 목록은 갈아치우지 않고 아래로 늘어나므로
   * 이 값은 "몇 번째 화면" 이 아니라 "몇 묶음까지 쌓였는가" 를 뜻한다.
   */
  more?: number;
};

/**
 * 탐색 화면 URL 을 만드는 **유일한 자리**.
 *
 * 카테고리 탭·시도 선택·시군구 선택·더보기가 각자 `URLSearchParams` 를 조립하면
 * 규칙이 넷으로 갈라진다. 실제로 그중 하나만 `district` 를 빠뜨려도 필터가
 * 조용히 풀리는데, 그건 링크를 눌러 보기 전까지 드러나지 않는다.
 *
 * 지키는 규칙 셋:
 * 1. **시도 없는 시군구는 버린다.** 시군구 코드는 시도 안에서만 고유해서
 *    (`domain/spot/region.ts`) 혼자서는 어느 지역인지 정하지 못한다.
 * 2. **기본값은 URL 에 쓰지 않는다.** 남기면 같은 화면이 두 주소를 갖는다.
 * 3. **필터를 바꾸면 `more` 가 떨어진다.** 부르는 쪽이 넘기지 않으면 그만이다 —
 *    다른 조건의 27개를 보다가 카테고리를 바꿨는데 27개가 그대로 오면
 *    "더 눌렀던 상태" 가 조건을 넘어 살아남는다.
 */
export function exploreHref(locale: string, filter: ExploreFilter): string {
  const p = new URLSearchParams({ category: filter.category });
  if (filter.areaCode) {
    p.set("area", String(filter.areaCode));
    if (filter.districtCode) p.set("district", String(filter.districtCode));
  }
  if (filter.more && filter.more > 0) p.set("more", String(filter.more));
  return `/${locale}/explore?${p.toString()}`;
}
