import { CATEGORIES, type Category } from "@/domain/spot/category";
import { exploreHref } from "@/presentation/lib/explore-href";
import { CategoryTabs } from "@/presentation/components/CategoryTabs";

/**
 * 카테고리 선택.
 *
 * **큰 색 블록을 쓰지 않는다.** 초안은 화면 상단을 색면 4개로 채웠는데,
 * 그게 화면에서 제일 시끄러운 요소가 되어 정작 사진을 눌렀다.
 * 레퍼런스(`docs/ref/IMG_card-reference.png`)에는 그런 컨트롤이 아예 없다.
 *
 * 활성 항목만 밑줄과 점으로 표시한다. 색은 그 점 하나에만 남는다 —
 * 컨트롤이 콘텐츠보다 커지면 안 된다.
 *
 * 링크로 구현해 서버 필터링·공유 가능한 URL·JS 없는 동작을 모두 얻는다.
 */
export function CategoryPicker({
  locale,
  current,
  areaCode,
  districtCode,
  labels,
  groupLabel,
}: {
  locale: string;
  current: Category;
  areaCode?: number;
  districtCode?: number;
  labels: Record<Category, string>;
  groupLabel: string;
}) {
  /*
    링크를 여기서 만든다. URL 규칙은 서버 쪽 한 곳에 두고
    (`presentation/lib/explore-href.ts`) 클라이언트 컴포넌트는 받은 것을 그리기만 한다.
    카테고리를 바꿔도 지역은 유지한다. 페이지는 1로 돌아간다.
  */
  const tabs = CATEGORIES.map((c) => ({
    key: c,
    label: labels[c],
    href: exploreHref(locale, { category: c, areaCode, districtCode }),
  }));

  /*
    강조색은 넘기지 않는다. 필터 바가 `--tab-accent` 를 갖고 있고 탭은 그것을
    상속받는다 — 색은 탭만의 것이 아니라 바 전체의 성질이다.
  */
  return <CategoryTabs tabs={tabs} current={current} groupLabel={groupLabel} />;
}
