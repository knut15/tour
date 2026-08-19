import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/domain/shared/locale";
import { isCategory, type Category } from "@/domain/spot/category";
import { isSeoulDistrictCode } from "@/domain/spot/district";
import type { DistrictView, SpotListView } from "@/application/spot/dto";
import { listDistricts, listSpots } from "@/presentation/lib/container";
import { CategoryPicker } from "@/presentation/components/CategoryPicker";
import { DistrictPicker } from "@/presentation/components/DistrictPicker";
import { Wall } from "@/presentation/components/Wall";
import { ButtonLink } from "@/presentation/components/Button";
import { ThemeToggle } from "@/presentation/components/ThemeToggle";
import { getDictionary, type Dictionary } from "@/presentation/i18n/dictionaries";

function parseCategory(raw: string | string[] | undefined): Category {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v && isCategory(v) ? v : "attraction";
}

function parsePage(raw: string | string[] | undefined): number {
  const v = Array.isArray(raw) ? raw[0] : raw;
  const n = Number((v ?? "").trim());
  return Number.isInteger(n) && n >= 1 && n <= 20 ? n : 1;
}

function parseDistrict(raw: string | string[] | undefined): number | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return undefined;
  const n = Number(v.trim());
  return isSeoulDistrictCode(n) ? n : undefined;
}

export default async function ExplorePage({ params, searchParams }: PageProps<"/[locale]/explore">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;

  const category = parseCategory(sp.category);
  const districtCode = parseDistrict(sp.district);
  const page = parsePage(sp.page);
  const t = await getDictionary(locale);

  // 실패해도 화면 전체를 죽이지 않는다. 벽만 오류 패널로 바꾼다 (.curvez/design/screens/explore.md)
  let wall: SpotListView | null = null;
  let districts: DistrictView[] = [];
  let failed = false;
  try {
    [wall, districts] = await Promise.all([
      listSpots({ locale, category, districtCode, page }),
      listDistricts(locale),
    ]);
  } catch {
    failed = true;
  }

  const districtName = districts.find((d) => d.code === districtCode)?.name;
  // 스크린 리더에도 내부 은유를 흘리지 않는다. 사용자는 "벽" 이 아니라 장소를 찾는다
  const listLabel = districtName
    ? `${t.category[category]} — ${districtName}`
    : `${t.category[category]} — ${t.explore.allDistricts}`;

  return (
    <>
      <Masthead locale={locale} t={t} />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-32">
        <header className="pt-12 pb-14 md:pt-16">
          {/* 에이브로우는 규칙선과 함께 둔다. 구조 장치가 내용을 encode 하게 한다 */}
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
            {t.explore.eyebrow}
          </p>
          <h1
            lang={locale}
            className={
              // Direction A: 세리프 헤드라인. 가볍게, 크게, 자간은 건드리지 않는다
              "mt-5 font-display font-light " +
              "text-[clamp(2.75rem,7vw,4.25rem)] leading-[1.02] " +
              // 한글은 글자당 폭이 라틴의 약 2배라 같은 ch 값을 쓰면 줄이 일찍 끊긴다
              (locale === "ko" ? "max-w-[11ch]" : "max-w-[13ch]")
            }
          >
            {t.explore.title}
          </h1>
          <p lang={locale} className="mt-5 max-w-[42ch] text-[16px] leading-[24px] text-body">
            {t.explore.subtitle}
          </p>
        </header>

        <div className="flex flex-col gap-6 pb-14">
          <CategoryPicker
            locale={locale}
            current={category}
            districtCode={districtCode}
            labels={t.category}
            groupLabel={t.explore.categoryLabel}
          />
          <DistrictPicker
            locale={locale}
            category={category}
            districts={districts}
            current={districtCode}
            label={t.explore.districtLabel}
            allLabel={t.explore.allDistricts}
          />
        </div>

        {failed ? (
          <Panel lang={locale} message={t.state.error}>
            <ButtonLink href={`/${locale}/explore?category=${category}`} variant="weak">
              {t.state.errorAction}
            </ButtonLink>
          </Panel>
        ) : wall && wall.items.length > 0 ? (
          <>
            <Wall
              items={wall.items}
              ariaLabel={listLabel}
              hrefOf={(s) => `/${locale}/spots/${s.contentId}`}
              districtNameOf={(s) =>
                districts.find((d) => d.code === s.districtCode)?.name
              }
              labelSave={t.frame.save}
              labelSaved={t.frame.saved}
            />
            {wall.hasMore && (
              <div className="pt-24 text-center">
                {/*
                  다음 묶음을 부른다. **페이지 번호와 총 건수를 화면에 쓰지 않는다** —
                  "3,412건 중 1–20" 이라는 문구 하나가 기관 느낌의 핵심이다 (GOAL.md §0.5-3).
                  URL 에는 page 가 남지만 화면에는 "더 보기" 만 보인다.
                */}
                <ButtonLink href={nextWallHref(locale, category, districtCode, page)} variant="weak">
                  {t.explore.showAnother}
                </ButtonLink>
              </div>
            )}
          </>
        ) : (
          <Panel lang={locale} message={t.state.emptyFilter}>
            <ButtonLink href={`/${locale}/explore?category=${category}`} variant="weak">
              {t.state.emptyFilterAction}
            </ButtonLink>
          </Panel>
        )}
      </main>

      <footer className="border-t border-line px-6 py-8">
        <p lang={locale} className="mx-auto max-w-[1200px] text-[13px] text-muted">
          {t.explore.sourceNote}
        </p>
      </footer>
    </>
  );
}

function nextWallHref(
  locale: Locale,
  category: Category,
  districtCode: number | undefined,
  page: number,
): string {
  const p = new URLSearchParams({ category, page: String(page + 1) });
  if (districtCode) p.set("district", String(districtCode));
  return `/${locale}/explore?${p.toString()}`;
}

function Masthead({ locale, t }: { locale: Locale; t: Dictionary }) {
  const other = locale === "en" ? "ko" : "en";
  return (
    <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-5">
      <Link
        href={`/${locale}`}
        className="text-[13px] uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-focus"
      >
        {t.brand}
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle label={t.nav.theme} />
        <Link
          href={`/${other}/explore`}
          className="rounded-full border border-line px-4 py-2 text-[13px] text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          {t.nav.switchLocale}
        </Link>
      </div>
    </header>
  );
}

function Panel({
  lang,
  message,
  children,
}: {
  lang: string;
  message: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6 rounded-md bg-surface px-6 text-center">
      <p lang={lang} className="max-w-[32ch] text-[16px] text-muted">
        {message}
      </p>
      {children}
    </div>
  );
}
