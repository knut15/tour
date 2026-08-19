import Link from "next/link";
import { LOCALES, LOCALE_LABEL, type Locale } from "@/domain/shared/locale";
import { CONTROL_SM } from "@/presentation/components/tds";

/**
 * 언어 전환.
 *
 * 언어 이름은 **자기 언어로** 적는다(endonym). 찾는 사람은 그 언어를 읽는 사람이고,
 * 현재 화면의 언어를 못 읽어서 바꾸려는 것이기 때문이다.
 *
 * `<details>` 라 JS 없이 동작한다. 6개를 상시 나열하면 마스트헤드가 무거워진다.
 *
 * **상세 화면에서는 목록으로 보낸다** — 언어마다 contentid 공간이 분리돼 있어
 * 같은 장소로 이어갈 수 없다.
 */
export function LocaleSwitcher({
  current,
  hrefFor,
  label,
  note,
}: {
  current: Locale;
  hrefFor: (locale: Locale) => string;
  label: string;
  note?: string;
}) {
  return (
    <details className="relative" data-dismissable>
      <summary
        className={`${CONTROL_SM} cursor-pointer list-none px-3`}
        aria-label={label}
      >
        {LOCALE_LABEL[current]}
        <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      </summary>
      <div className="dropdown-panel absolute right-0 z-[var(--layer-popover)] mt-2 w-44 rounded-md border border-line bg-canvas p-1.5 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.18)]">
        {LOCALES.map((l) => (
          <Link
            key={l}
            href={hrefFor(l)}
            hrefLang={l}
            title={l !== current ? note : undefined}
            aria-current={l === current ? "true" : undefined}
            className={
              "block rounded-sm px-3 py-2 text-[14px] hover:bg-surface " +
              "focus-visible:outline-2 focus-visible:outline-focus " +
              (l === current ? "bg-surface text-ink" : "text-muted")
            }
          >
            {LOCALE_LABEL[l]}
          </Link>
        ))}
      </div>
    </details>
  );
}
