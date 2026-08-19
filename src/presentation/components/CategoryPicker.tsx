import Link from "next/link";
import { CATEGORIES, type Category } from "@/domain/spot/category";

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
  districtCode,
  labels,
  groupLabel,
}: {
  locale: string;
  current: Category;
  districtCode?: number;
  labels: Record<Category, string>;
  groupLabel: string;
}) {
  return (
    <nav aria-label={groupLabel}>
      <ul className="flex flex-wrap items-center gap-x-8 border-b border-line sm:gap-x-9">
        {CATEGORIES.map((c) => {
          const active = c === current;
          const params = new URLSearchParams({ category: c });
          if (districtCode) params.set("district", String(districtCode));
          return (
            <li key={c}>
              <Link
                href={`/${locale}/explore?${params.toString()}`}
                aria-current={active ? "page" : undefined}
                className={
                  "inline-block pb-3.5 -mb-px border-b text-[15px] " +
                  "transition-colors duration-200 ease-[var(--ease-signature)] " +
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus " +
                  (active
                    ? "border-ink font-semibold text-ink"
                    : "border-transparent text-muted hover:text-ink")
                }
              >
                {labels[c]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
