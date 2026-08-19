import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/domain/shared/locale";
import { isCategory, type Category } from "@/domain/spot/category";
import { isAreaCode, isDistrictCode } from "@/domain/spot/region";
import { listAreas, listDistricts, listSpots } from "@/presentation/lib/container";
import { exploreHref } from "@/presentation/lib/explore-href";
import { CategoryPicker } from "@/presentation/components/CategoryPicker";
import { RegionPicker } from "@/presentation/components/RegionPicker";
import { Wall } from "@/presentation/components/Wall";
import { ButtonLink } from "@/presentation/components/Button";
import { Masthead } from "@/presentation/components/Masthead";
import { RegionPickerSkeleton, WallSkeleton } from "@/presentation/components/Skeleton";
import { getDictionary, type Dictionary } from "@/presentation/i18n/dictionaries";

function first(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.trim() || undefined;
}

function parsePage(raw: string | string[] | undefined): number {
  const n = Number(first(raw) ?? "");
  return Number.isInteger(n) && n >= 1 && n <= 20 ? n : 1;
}

function parseCategory(raw: string | string[] | undefined): Category {
  const v = first(raw);
  return v && isCategory(v) ? v : "attraction";
}

/**
 * 지역 코드는 **형태만** 검사한다. 존재하지 않는 코드는 빈 결과가 되고
 * 빈 상태 화면이 받는다. 유효한 코드 집합을 화면이 들고 있으면 공급자가
 * 지역을 늘렸을 때 새 지역이 조용히 사라진다 (`domain/spot/region.ts`).
 */
function parseAreaCode(raw: string | string[] | undefined): number | undefined {
  const n = Number(first(raw) ?? "");
  return isAreaCode(n) ? n : undefined;
}

function parseDistrictCode(raw: string | string[] | undefined): number | undefined {
  const n = Number(first(raw) ?? "");
  return isDistrictCode(n) ? n : undefined;
}

/**
 * 탐색 화면.
 *
 * **머리말과 카테고리 선택은 데이터를 기다리지 않는다.** 목록과 지역 목록만
 * Suspense 안에 두어 각자 준비되는 대로 스트리밍한다. 사양이 요구하는
 * "필터는 조작 가능한 상태로 유지" 를 이 구조가 만족한다.
 */
export default async function ExplorePage({ params, searchParams }: PageProps<"/[locale]/explore">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;

  const category = parseCategory(sp.category);
  const areaCode = parseAreaCode(sp.area);
  // 시도 없는 시군구는 어느 지역인지 정해지지 않는다. 통째로 버린다
  const districtCode = areaCode ? parseDistrictCode(sp.district) : undefined;
  const page = parsePage(sp.page);
  const t = await getDictionary(locale);

  return (
    <>
      <Masthead locale={locale} t={t} localeHref={(l) => `/${l}/explore`} />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-32">
        <header className="pt-12 pb-14 md:pt-16">
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
            areaCode={areaCode}
            districtCode={districtCode}
            labels={t.category}
            groupLabel={t.explore.categoryLabel}
          />
          {/*
            지역은 2단이다. 시도를 고르기 전에는 시군구 선택 자체가 없다 —
            시군구 코드는 시도 안에서만 고유해서 시도 없이는 고를 수가 없다.
          */}
          <div className="flex flex-wrap items-start gap-3">
            <Suspense fallback={<RegionPickerSkeleton />}>
              <Areas locale={locale} category={category} current={areaCode} t={t} />
            </Suspense>
            {areaCode && (
              <Suspense key={areaCode} fallback={<RegionPickerSkeleton />}>
                <Districts
                  locale={locale}
                  category={category}
                  areaCode={areaCode}
                  current={districtCode}
                  t={t}
                />
              </Suspense>
            )}
          </div>
        </div>

        {/*
          key 에 필터를 넣어 조건이 바뀌면 스켈레톤이 다시 보이게 한다.
          없으면 이전 목록이 남은 채 멈춰 있어 반응이 없는 것처럼 보인다.
        */}
        <Suspense
          key={`${locale}:${category}:${areaCode ?? "all"}:${districtCode ?? "all"}:${page}`}
          fallback={<WallSkeleton label={t.state.loading} />}
        >
          <Spots
            locale={locale}
            category={category}
            areaCode={areaCode}
            districtCode={districtCode}
            page={page}
            t={t}
          />
        </Suspense>
      </main>

      <footer className="border-t border-line px-6 py-8">
        <p lang={locale} className="mx-auto max-w-[1200px] text-[13px] text-muted">
          {t.explore.sourceNote}
        </p>
      </footer>
    </>
  );
}

async function Areas({
  locale,
  category,
  current,
  t,
}: {
  locale: Locale;
  category: Category;
  current?: number;
  t: Dictionary;
}) {
  let areas;
  try {
    areas = await listAreas(locale);
  } catch {
    // 지역 목록이 실패해도 화면 전체를 죽이지 않는다. 필터만 빠진다
    return null;
  }
  return (
    <RegionPicker
      items={areas}
      current={current}
      label={t.explore.areaLabel}
      allLabel={t.explore.allAreas}
      // 시도를 바꾸면 시군구는 버린다. 다른 시도에서 같은 번호는 다른 곳이다
      hrefFor={(code) => exploreHref(locale, { category, areaCode: code })}
    />
  );
}

async function Districts({
  locale,
  category,
  areaCode,
  current,
  t,
}: {
  locale: Locale;
  category: Category;
  areaCode: number;
  current?: number;
  t: Dictionary;
}) {
  let districts;
  try {
    districts = await listDistricts(locale, areaCode);
  } catch {
    return null;
  }
  if (districts.length === 0) return null;
  return (
    <RegionPicker
      items={districts}
      current={current}
      label={t.explore.districtLabel}
      allLabel={t.explore.allDistricts}
      hrefFor={(code) => exploreHref(locale, { category, areaCode, districtCode: code })}
    />
  );
}

async function Spots({
  locale,
  category,
  areaCode,
  districtCode,
  page,
  t,
}: {
  locale: Locale;
  category: Category;
  areaCode?: number;
  districtCode?: number;
  page: number;
  t: Dictionary;
}) {
  let wall;
  let districts;
  try {
    [wall, districts] = await Promise.all([
      listSpots({ locale, category, areaCode, districtCode, page }),
      /*
        카드에 붙일 시군구 이름의 출처. **시도를 골랐을 때만 받는다.**

        전국 목록에는 붙일 이름이 없다. `areaBasedList2` 의 `areacode` ·
        `sigungucode` 는 항목 고유 데이터가 아니라 **질의 파라미터를 되돌려주는
        값**이라, 지역을 지정하지 않으면 빈 문자열로 온다 (실측 2026-08-19).
        항상 채워지는 것은 법정동 코드(`lDongRegnCd`)뿐인데 그건 TourAPI 의
        지역 코드와 체계가 달라 따로 매핑이 필요하고, 실제로 여수(전남, 46)가
        `12` 로 오는 등 값이 어긋난 항목이 있다.

        전국에서는 주소 줄이 이미 시도를 담고 있으므로("…, Nonsan-si,
        Chungcheongnam-do") 칩 없이 두는 편이 중복도 없고 틀리지도 않는다.
      */
      areaCode ? listDistricts(locale, areaCode).catch(() => []) : Promise.resolve([]),
    ]);
  } catch {
    return (
      <Panel lang={locale} message={t.state.error}>
        <ButtonLink href={exploreHref(locale, { category })} variant="weak">
          {t.state.errorAction}
        </ButtonLink>
      </Panel>
    );
  }

  if (wall.items.length === 0) {
    return (
      <Panel lang={locale} message={t.state.emptyFilter}>
        <ButtonLink href={exploreHref(locale, { category })} variant="weak">
          {t.state.emptyFilterAction}
        </ButtonLink>
      </Panel>
    );
  }

  const districtName = districts.find((r) => r.code === districtCode)?.name;
  // 스크린 리더에도 내부 은유를 흘리지 않는다. 사용자는 장소를 찾는다
  const listLabel = `${t.category[category]} — ${districtName ?? t.explore.allAreas}`;

  return (
    <>
      <Wall
        items={wall.items}
        ariaLabel={listLabel}
        hrefOf={(s) => `/${locale}/spots/${s.contentId}`}
        districtNameOf={(s) => districts.find((r) => r.code === s.districtCode)?.name}
        labelSave={t.frame.save}
        labelSaved={t.frame.saved}
        labelNoImage={t.frame.noImage}
      />
      {wall.hasMore && (
        <div className="pt-24 text-center">
          {/*
            다음 묶음을 부른다. **페이지 번호와 총 건수를 화면에 쓰지 않는다** —
            "3,412건 중 1–20" 이라는 문구 하나가 기관 느낌의 핵심이다 (GOAL.md §0.5-3).
          */}
          <ButtonLink
            href={exploreHref(locale, { category, areaCode, districtCode, page: page + 1 })}
            variant="weak"
          >
            {t.explore.showAnother}
          </ButtonLink>
        </div>
      )}
    </>
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
