import { Suspense } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/domain/shared/locale";
import { isCategory, type Category } from "@/domain/spot/category";
import { isAreaCode, isDistrictCode } from "@/domain/spot/region";
import { listAreas, listDistricts, listSpots } from "@/presentation/lib/container";
import { exploreHref } from "@/presentation/lib/explore-href";
import {
  MORE_MAX,
  enterFrom,
  parseMore,
  requestSize,
} from "@/presentation/lib/explore-paging";
import { CategoryPicker } from "@/presentation/components/CategoryPicker";
import { RegionPicker } from "@/presentation/components/RegionPicker";
import { MoreLabel } from "@/presentation/components/MoreLabel";
import { Wall } from "@/presentation/components/Wall";
import { ButtonLink } from "@/presentation/components/Button";
import { Masthead } from "@/presentation/components/Masthead";
import { StickyFilterSync } from "@/presentation/components/StickyFilterSync";
import { STICKY_SENTINEL } from "@/presentation/lib/sticky";
import { RegionPickerSkeleton, WallSkeleton } from "@/presentation/components/Skeleton";
import { getDictionary, type Dictionary } from "@/presentation/i18n/dictionaries";

function first(raw: string | string[] | undefined): string | undefined {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v?.trim() || undefined;
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
  const more = parseMore(first(sp.more));
  const t = await getDictionary(locale);

  return (
    <>
      {/*
        언어를 바꿔도 **보고 있던 조건을 유지한다.** 지역 코드는 로케일 간 동일하고
        (실측 2026-08-19: 1/31/39 가 모든 서비스에서 같은 지역) 카테고리 슬러그도
        로케일과 무관하므로 그대로 넘긴다. 사용자는 다른 목록이 아니라 같은 목록의
        다른 언어를 보려는 것이다.
      */}
      <Masthead
        locale={locale}
        t={t}
        localeHref={(l) => exploreHref(l, { category, areaCode, districtCode, more })}
      />

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

        {/*
          이 표식이 헤더 밑으로 사라지면 필터가 붙은 것이다. `StickyFilterSync` 가
          그 순간에만 깨어나 헤더를 줄인다 — 스크롤 이벤트를 듣지 않는다.
        */}
        <div aria-hidden="true" className="h-px" {...{ [STICKY_SENTINEL]: "" }} />

        {/*
          필터 바. 헤더 바로 밑에 붙는다.

          `-mx-6 px-6` 으로 바탕을 컨테이너 폭까지 넓힌다. 목록도 같은 컨테이너
          안에 있으므로 그 바깥으로 카드가 비쳐 나올 자리는 없다.
        */}
        <div
          className={
            // 바탕·블러·그림자는 `globals.css` 의 `.filter-sticky::before` 가 그린다.
            // 화면 폭 전체를 덮어야 하는데 이 요소는 컨테이너 폭까지만이라서다.
            "filter-sticky sticky z-[var(--layer-sticky-filter)] " +
            "-mx-6 mb-14 flex flex-col gap-4 px-6 py-4"
          }
        >
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
          key 에 **필터만** 넣는다. 조건이 바뀌면 다른 목록이므로 스켈레톤을 다시 띄운다.

          `more` 는 일부러 뺐다. 넣으면 더보기를 누를 때마다 경계가 새로 만들어져
          보고 있던 카드가 스켈레톤으로 바뀌고 다시 그려진다 — 그건 "추가" 가 아니라
          "교체" 다. 빼면 React 가 key 로 기존 카드를 알아보고 새 카드만 끼워 넣는다.
        */}
        <Suspense
          key={`${locale}:${category}:${areaCode ?? "all"}:${districtCode ?? "all"}`}
          fallback={<WallSkeleton label={t.state.loading} />}
        >
          <Spots
            locale={locale}
            category={category}
            areaCode={areaCode}
            districtCode={districtCode}
            more={more}
            t={t}
          />
        </Suspense>
      </main>

      <StickyFilterSync />

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
  more,
  t,
}: {
  locale: Locale;
  category: Category;
  areaCode?: number;
  districtCode?: number;
  /** 더보기를 누른 횟수. 0 이면 첫 묶음만 */
  more: number;
  t: Dictionary;
}) {
  /*
    누적분을 **한 번의 요청**으로 받는다.

    페이지를 1..N 까지 나눠 부르면 더보기 N 번에 요청이 N 번 든다. TourAPI 는
    `numOfRows` 를 200 까지 받아 주므로(실측 2026-08-19) 한 번에 다 받는 편이
    요청 수도 적고 항목 순서도 흔들리지 않는다 — 나눠 부르면 그사이 공급자
    정렬이 바뀌어 같은 스팟이 두 묶음에 겹쳐 들어올 수 있다.
  */
  const size = requestSize(more);
  let wall;
  let districts;
  try {
    [wall, districts] = await Promise.all([
      listSpots({ locale, category, areaCode, districtCode, page: 1, size }),
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
        labelLike={t.frame.like}
        labelLiked={t.frame.liked}
        labelViews={t.frame.views}
        labelNoImage={t.frame.noImage}
        enterFrom={enterFrom(more, wall.items.length)}
      />
      {wall.hasMore && more < MORE_MAX && (
        <div className="pt-24 text-center">
          {/*
            다음 묶음을 부른다. **페이지 번호와 총 건수를 화면에 쓰지 않는다** —
            "3,412건 중 1–20" 이라는 문구 하나가 기관 느낌의 핵심이다 (GOAL.md §0.5-3).
          */}
          <ButtonLink
            href={exploreHref(locale, { category, areaCode, districtCode, more: more + 1 })}
            variant="weak"
            // 스크롤 위치를 지킨다. 목록이 아래로 늘어나는데 맨 위로 올라가면
            // 방금 보던 카드를 다시 찾아 내려와야 한다
            scroll={false}
          >
            <MoreLabel idle={t.explore.showAnother} busy={t.state.loading} />
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
