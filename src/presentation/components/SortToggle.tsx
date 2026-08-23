import Link from "next/link";
import type { Category } from "@/domain/spot/category";
import { STATS_SORTS, type StatsSort } from "@/domain/spot/spot-stats";
import { exploreHref } from "@/presentation/lib/explore-href";

/**
 * 벽을 무엇으로 세울지 고르는 스위치 — 조회순과 좋아요순.
 *
 * **링크 두 개다.** 상태를 브라우저에 두면 새로고침이나 공유에서 사라지고, 옆의
 * 다른 컨트롤들은 전부 주소에 사는데 이것만 아니면 뒤로가기가 어긋난다.
 * 누르면 URL 이 바뀌고 서버가 그 순서로 다시 세운다.
 *
 * **한 몸으로 보인다.** 두 칸이 테두리 하나를 나눠 갖고, 고른 쪽만 바탕이 찬다 —
 * 버튼 두 개를 따로 두면 지역 선택·검색과 나란히 컨트롤이 넷으로 늘어난 것처럼
 * 보이고, 둘이 서로 배타적이라는 것도 읽히지 않는다.
 */
export function SortToggle({
  locale,
  category,
  areaCode,
  districtCode,
  keyword,
  current,
  label,
  labels,
}: {
  locale: string;
  category: Category;
  areaCode?: number;
  districtCode?: number;
  keyword?: string;
  current: StatsSort;
  label: string;
  labels: Record<StatsSort, string>;
}) {
  return (
    /*
      `role="group"` 에 이름을 준다. 스크린 리더가 "조회순 / 좋아요순" 만 읽으면
      그것이 무엇의 선택지인지 알 수 없다.
    */
    <div
      role="group"
      aria-label={label}
      className="flex shrink-0 items-center rounded-btn border border-line bg-canvas p-1"
    >
      {STATS_SORTS.map((sort) => {
        const active = sort === current;
        return (
          <Link
            key={sort}
            href={exploreHref(locale, { category, areaCode, districtCode, keyword, sort })}
            /*
              고른 쪽을 `aria-current` 로 알린다. 색만으로는 보이지 않는 사람에게
              어느 쪽이 켜져 있는지 전해지지 않는다.

              `scroll={false}` — 정렬을 바꾸는 것은 같은 목록을 다시 세우는 일이라
              보던 자리에 머무는 편이 맞다. 맨 위로 튀면 방금 보던 카드를 잃는다.
            */
            aria-current={active ? "true" : undefined}
            scroll={false}
            className={
              "flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-[13px] " +
              "transition-colors duration-200 ease-[var(--ease-signature)] " +
              (active
                ? // 고른 쪽은 분류의 색을 쓴다. 필터 바가 `--tab-accent` 를 갖고 있다
                  "bg-[var(--tab-accent)]/10 text-[var(--tab-accent)]"
                : "text-muted hover:text-ink")
            }
          >
            {/* 아이콘은 카드 바닥의 것과 같다. 같은 수를 가리키므로 같은 그림이어야 한다 */}
            {sort === "views" ? (
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M2.6 12S6 5.9 12 5.9 21.4 12 21.4 12 18 18.1 12 18.1 2.6 12 2.6 12Z" />
                <circle cx="12" cy="12" r="2.6" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 shrink-0"
                fill={active ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z" />
              </svg>
            )}
            {labels[sort]}
          </Link>
        );
      })}
    </div>
  );
}
