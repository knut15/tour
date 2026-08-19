import Link from "next/link";
import type { Category } from "@/domain/spot/category";
import type { DistrictView } from "@/application/spot/dto";

/**
 * 서울 자치구. **25개를 상시 나열하지 않는다** — 화면을 가득 채운 chip 나열은
 * 공공 포털의 시각 언어다 (GOAL.md §0.5-6). 접힌 컨트롤 하나로 두고 펼칠 때만 보인다.
 * `<details>` 라 JS 없이 동작한다.
 */
export function DistrictPicker({
  locale,
  category,
  districts,
  current,
  label,
  allLabel,
}: {
  locale: string;
  category: Category;
  districts: DistrictView[];
  current?: number;
  label: string;
  allLabel: string;
}) {
  const currentName = districts.find((d) => d.code === current)?.name ?? allLabel;
  const hrefFor = (code?: number) => {
    const p = new URLSearchParams({ category });
    if (code) p.set("district", String(code));
    return `/${locale}/explore?${p.toString()}`;
  };

  return (
    <details className="group relative">
      <summary
        className={
          "flex cursor-pointer list-none items-center gap-2 rounded-btn border border-line " +
          "bg-canvas px-4 py-2.5 text-[15px] text-ink " +
          "transition-transform duration-200 ease-[var(--ease-signature)] hover:scale-[1.01] " +
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        }
      >
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
          "absolute z-10 mt-2 grid max-h-[60vh] w-[min(28rem,90vw)] grid-cols-2 gap-1 " +
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
        {districts.map((d) => (
          <Link
            key={d.code}
            href={hrefFor(d.code)}
            aria-current={d.code === current ? "true" : undefined}
            className={
              "rounded-md px-3 py-2 text-[14px] hover:bg-surface " +
              "focus-visible:outline-2 focus-visible:outline-focus " +
              (d.code === current ? "bg-weak-bg text-weak-fg" : "text-muted")
            }
          >
            {d.name}
          </Link>
        ))}
      </div>
    </details>
  );
}
