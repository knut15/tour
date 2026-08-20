import Link from "next/link";
import type { RegionView } from "@/application/spot/dto";
import { FILTER_CONTROL } from "@/presentation/components/tds";

/**
 * 지역 선택 하나. 시도에도 시군구에도 같은 것을 쓴다.
 *
 * **후보를 상시 나열하지 않는다** — 화면을 가득 채운 chip 나열은 공공 포털의
 * 시각 언어다 (GOAL.md §0.5-6). 접힌 컨트롤 하나로 두고 펼칠 때만 보인다.
 * `<details>` 라 JS 없이 동작한다.
 *
 * 링크 만들기는 부르는 쪽이 한다. 시도를 고르면 시군구가 떨어져야 하고
 * 시군구를 고르면 시도가 유지돼야 하는데, 그 규칙은 화면이 알지 이 컴포넌트가
 * 알 일이 아니다.
 */
export function RegionPicker({
  items,
  current,
  label,
  allLabel,
  hrefFor,
}: {
  items: RegionView[];
  current?: number;
  label: string;
  allLabel: string;
  hrefFor: (code?: number) => string;
}) {
  const currentName = items.find((r) => r.code === current)?.name ?? allLabel;

  return (
    <details className="group relative" data-dismissable>
      {/* 기하는 `FILTER_CONTROL` 이 정본이다. 옆에 서는 컨트롤과 높이를 나눠 쓴다 */}
      <summary className={FILTER_CONTROL}>
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">
          {label}
        </span>
        <span>{currentName}</span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-muted" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </summary>
      <div
        className={
          "dropdown-panel absolute z-[var(--layer-popover)] mt-2 grid max-h-[60vh] w-[min(28rem,90vw)] grid-cols-2 gap-1 " +
          "overflow-y-auto rounded-btn border border-line bg-canvas p-2 " +
          "shadow-[0_12px_32px_-12px_rgba(26,28,30,0.18)] sm:grid-cols-3"
        }
      >
        <Link
          href={hrefFor()}
          className="rounded-md px-3 py-2 text-[14px] text-ink hover:bg-surface focus-visible:outline-2 focus-visible:outline-focus"
        >
          {allLabel}
        </Link>
        {items.map((r) => (
          <Link
            key={r.code}
            href={hrefFor(r.code)}
            aria-current={r.code === current ? "true" : undefined}
            className={
              "rounded-md px-3 py-2 text-[14px] hover:bg-surface " +
              "focus-visible:outline-2 focus-visible:outline-focus " +
              (r.code === current ? "bg-weak-bg text-weak-fg" : "text-muted")
            }
          >
            {r.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
