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
    카테고리마다 배정된 색을 넘긴다 (GOAL.md §2.3 규칙 3). 토큰 이름이 슬러그와
    같으므로 표를 하나 더 두지 않는다 — 카테고리가 늘면 `globals.css` 에
    `--cat-<슬러그>` 만 추가하면 된다.
  */
  return (
    <CategoryTabs
      tabs={tabs}
      current={current}
      groupLabel={groupLabel}
      accent={`var(--cat-${current})`}
    />
  );
}
