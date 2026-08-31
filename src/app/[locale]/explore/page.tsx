import { Suspense, ViewTransition } from "react";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/domain/shared/locale";
import { isCategory, type Category } from "@/domain/spot/category";
import { isAreaCode, isDistrictCode } from "@/domain/spot/region";
import {
  getSpotStats,
  getTopSpotKeys,
  listAreas,
  listDistricts,
  listSpots,
} from "@/presentation/lib/container";
import { exploreHref } from "@/presentation/lib/explore-href";
import { parseStatsSort, statsKeyOf, type StatsSort } from "@/domain/spot/spot-stats";
import {
  MORE_MAX,
  enterFrom,
  parseMore,
  requestSize,
} from "@/presentation/lib/explore-paging";
import { CategoryPicker } from "@/presentation/components/CategoryPicker";
import { Lede, SHARE } from "@/presentation/components/Lede";
import { NetworkArt } from "@/presentation/components/NetworkArt";
import { SortToggle } from "@/presentation/components/SortToggle";
import { SpotSearch } from "@/presentation/components/SpotSearch";
import { RegionPicker } from "@/presentation/components/RegionPicker";
import { MoreLabel } from "@/presentation/components/MoreLabel";
import { NearMeToggle } from "@/presentation/components/NearMeToggle";
import { Wall } from "@/presentation/components/Wall";
import { ButtonLink } from "@/presentation/components/Button";
import { Masthead } from "@/presentation/components/Masthead";
import { ScrollMemory } from "@/presentation/components/ScrollMemory";
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
/**
 * 목록의 맨 앞을 채울 인기 장소 수.
 *
 * **한 줄을 넘기지 않는다.** 4열이므로 그보다 많으면 목록 첫 화면이 통째로 인기
 * 순이 되어, 사용자가 고른 분류·지역보다 인기가 먼저 읽힌다. 넷이면 첫 줄만
 * 바뀌고 그 아래는 공급자 순서 그대로다.
 *
 * 저장소에서 뽑는 수는 이보다 넉넉해야 한다 — 상위 넷이 이 분류에 하나도 없을 수
 * 있고, 그때 아래쪽 순위가 그 자리를 대신한다.
 */
const TOP_PINNED = 24;

export default async function ExplorePage({ params, searchParams }: PageProps<"/[locale]/explore">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;

  const category = parseCategory(sp.category);
  const areaCode = parseAreaCode(sp.area);
  // 시도 없는 시군구는 어느 지역인지 정해지지 않는다. 통째로 버린다
  const districtCode = areaCode ? parseDistrictCode(sp.district) : undefined;
  const more = parseMore(first(sp.more));
  /*
    검색어. 공백만 남으면 없는 것으로 본다 — `?q=%20` 같은 주소로 들어와도
    "빈 검색" 이 아니라 그냥 목록이어야 한다.
  */
  const keyword = first(sp.q)?.trim() || undefined;
  // 모르는 값이면 기본(조회순)이다. 주소를 손으로 고친 사람에게 보여줄 화면은 그것뿐이다
  const sort = parseStatsSort(first(sp.sort));
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
        localeHref={(l) => exploreHref(l, { category, areaCode, districtCode, keyword, sort, more })}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-32">
        {/*
          머리말과 연결망이 나란히 선다. **둘 다 홈에서 이어져 온다** — 이름이 같아서
          오갈 때 사라졌다 나타나지 않고 크기와 자리를 옮긴다.

          오른쪽 열이 홈보다 좁다(0.9fr → 0.55fr). 머리말이 작아지는 만큼 연결망도
          작아져야 두 화면이 같은 지면의 다른 배율로 읽힌다. 종횡비는 정사각으로
          홈과 같게 두므로 줄어들 뿐 찌그러지지 않는다.

          **연결망이 머리말보다 높으면 안 된다.** 그만큼 탭이 아래로 밀려나고,
          탭이 붙는 위치를 재는 `alignToFilters` 의 기준도 함께 내려간다.
        */}
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)]">
          <Lede locale={locale} t={t} size="compact" />
          {/*
            **레이아웃이 아니라 transform 으로 키운다.** 열 폭을 늘리면 연결망이
            머리말(416px)보다 높아지고, 그만큼 탭과 목록이 아래로 밀려 첫 화면에
            보이는 카드가 줄어든다. `scale` 은 자리를 차지하지 않으므로 그림만
            커지고 그 아래는 그대로 있다.

            위아래로 넘치는 부분은 마스크가 이미 흐려 놓은 자리라 잘린 티가 나지
            않는다. 배율은 uniform 이므로 홈과의 전환에서도 찌그러지지 않는다.
          */}
          <ViewTransition name="lede-art" share={SHARE} default="none">
            <NetworkArt className="hidden min-h-0 aspect-square w-full lg:block lg:scale-[1.45]" />
          </ViewTransition>
        </div>

        {/*
          **이 화면에만 있는 것 전부.** 홈에는 대응하는 짝이 없으므로 들어올 때
          enter, 나갈 때 exit 이 재생된다 — 머리말이 줄어들며 자리를 비우는 동안
          그 아래로 필터와 목록이 올라온다.

          `default="none"` 이 필요하다. 이 화면 안에서 필터를 누르는 것도 라우트
          전환이라, 없으면 목록이 갱신될 때마다 이 블록 전체가 크로스페이드한다.
          그건 "조건이 바뀌었다" 가 아니라 "다른 화면으로 갔다" 로 읽힌다.

          감싸는 `<div>` 를 없애지 마라. `ViewTransition` 은 자식 하나에 이름을
          붙이는데, 여기 세 형제(표식·필터·목록)를 그대로 두면 셋이 각자 전환한다.
        */}
        <ViewTransition enter="body-enter" exit="body-exit" default="none">
          <div>
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
              /*
                현재 분류의 색을 **바 전체에** 둔다. 탭의 밑줄·글자와 거리 토글의
                빛이 같은 변수를 상속받아, 한 곳만 고치면 둘이 함께 따라온다.
                탭 안에만 두면 옆에 선 컨트롤은 그 색을 볼 수 없다.
              */
              style={{ "--tab-accent": `var(--cat-${category})` } as React.CSSProperties}
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
                keyword={keyword}
                labels={t.category}
                groupLabel={t.explore.categoryLabel}
              />
              {/*
                지역은 2단이다. 시도를 고르기 전에는 시군구 선택 자체가 없다 —
                시군구 코드는 시도 안에서만 고유해서 시도 없이는 고를 수가 없다.
              */}
              <div className="flex flex-wrap items-start gap-3">
                {/*
                  거리를 켜는 스위치. 목록을 다시 부르지 않는다 — 위치는 브라우저에만
                  있고 거리 계산도 카드가 직접 한다. 그래서 필터와 나란히 서 있어도
                  URL 을 바꾸지 않는 유일한 컨트롤이다.
                */}
                <NearMeToggle
                  labelOn={t.explore.nearMeOn}
                  labelOff={t.explore.nearMeOff}
                  labelAsking={t.explore.nearMeAsking}
                  labelDenied={t.explore.nearMeDenied}
                />
                <Suspense fallback={<RegionPickerSkeleton />}>
                  <Areas locale={locale} category={category} keyword={keyword} current={areaCode} t={t} />
                </Suspense>
                {areaCode && (
                  <Suspense key={areaCode} fallback={<RegionPickerSkeleton />}>
                    <Districts
                      locale={locale}
                      category={category}
                      areaCode={areaCode}
                      keyword={keyword}
                      current={districtCode}
                      t={t}
                    />
                  </Suspense>
                )}

                {/*
                  검색은 **줄의 반대쪽 끝**에 선다. `ms-auto` 가 남은 폭을 앞으로
                  밀어 붙인다 — 지역 선택 옆에 붙여 두면 둘이 한 벌처럼 읽히는데,
                  지역은 목록을 좁히는 조건이고 검색은 찾는 행위라 성격이 다르다.

                  좁은 화면에서는 줄이 바뀌며 폭을 다 쓴다. 그때는 오른쪽에 밀 자리가
                  없고, 칸이 좁으면 검색어가 몇 글자만 보인다.
                */}
                {/*
                  정렬 스위치가 검색 **앞**에 선다. 둘 다 줄의 오른쪽 끝으로 밀리되
                  순서는 "무엇으로 세울까" 다음에 "무엇을 찾을까" 다 — 앞의 것은
                  지금 보이는 목록을 다시 세우고, 뒤의 것은 목록 자체를 갈아치운다.
                */}
                <div className="ms-auto flex min-w-0 flex-wrap items-center justify-end gap-3">
                  <SortToggle
                    locale={locale}
                    category={category}
                    areaCode={areaCode}
                    districtCode={districtCode}
                    keyword={keyword}
                    current={sort}
                    label={t.explore.sortLabel}
                    labels={{ views: t.explore.sortByViews, likes: t.explore.sortByLikes }}
                  />
                  <div className="w-full min-w-0 sm:w-auto sm:min-w-[240px]">
                  <SpotSearch
                    locale={locale}
                    category={category}
                    areaCode={areaCode}
                    districtCode={districtCode}
                    current={keyword}
                    label={t.explore.searchLabel}
                    placeholder={t.explore.searchPlaceholder}
                    action={t.explore.searchAction}
                    clearLabel={t.explore.searchClear}
                  />
                  </div>
                </div>
              </div>
            </div>

            {/*
              key 에 **필터만** 넣는다. 조건이 바뀌면 다른 목록이므로 스켈레톤을 다시 띄운다.

              `more` 는 일부러 뺐다. 넣으면 더보기를 누를 때마다 경계가 새로 만들어져
              보고 있던 카드가 스켈레톤으로 바뀌고 다시 그려진다 — 그건 "추가" 가 아니라
              "교체" 다. 빼면 React 가 key 로 기존 카드를 알아보고 새 카드만 끼워 넣는다.
            */}
            <Suspense
              key={`${locale}:${category}:${areaCode ?? "all"}:${districtCode ?? "all"}:${keyword ?? ""}:${sort}`}
              fallback={<WallSkeleton label={t.state.loading} />}
            >
              <Spots
                locale={locale}
                category={category}
                areaCode={areaCode}
                districtCode={districtCode}
                keyword={keyword}
                sort={sort}
                more={more}
                t={t}
              />
            </Suspense>
          </div>
        </ViewTransition>
      </main>

      {/*
        상세로 들어갔다 돌아오면 보던 자리로 되돌린다. 탭·지역을 바꾸는 것은
        다른 목록이라 맨 위에서 시작하고, 그건 Next 기본 동작에 맡긴다.
      */}
      <ScrollMemory />
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
  keyword,
  current,
  t,
}: {
  locale: Locale;
  category: Category;
  /** 지역을 바꿔도 찾던 말은 그대로 간다 */
  keyword?: string;
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
      testId="area-select"
      // 시도를 바꾸면 시군구는 버린다. 다른 시도에서 같은 번호는 다른 곳이다
      hrefFor={(code) => exploreHref(locale, { category, keyword, areaCode: code })}
    />
  );
}

async function Districts({
  locale,
  category,
  areaCode,
  keyword,
  current,
  t,
}: {
  locale: Locale;
  category: Category;
  areaCode: number;
  /** 지역을 바꿔도 찾던 말은 그대로 간다 */
  keyword?: string;
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
      testId="district-select"
      hrefFor={(code) => exploreHref(locale, { category, keyword, areaCode, districtCode: code })}
    />
  );
}

async function Spots({
  locale,
  category,
  areaCode,
  districtCode,
  keyword,
  sort,
  more,
  t,
}: {
  locale: Locale;
  category: Category;
  areaCode?: number;
  districtCode?: number;
  /** 이름으로 좁힌다. 분류·지역과 함께 걸린다 */
  keyword?: string;
  /** 목록을 무엇으로 세울지 */
  sort: StatsSort;
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
      listSpots({ locale, category, keyword, areaCode, districtCode, page: 1, size }),
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
    /*
      **검색 중이면 다른 말을 한다.** 찾던 말을 그대로 되돌려 줘야 오타인지 정말
      없는 것인지 판단할 수 있고, 되돌아갈 자리도 "필터 지우기" 가 아니라 "검색어
      지우기" 다 — 분류와 지역은 사용자가 방금 고른 것이라 함께 지우면 안 된다.
    */
    if (keyword) {
      return (
        <Panel lang={locale} message={t.state.emptySearch.replace("{q}", keyword)}>
          <ButtonLink
            href={exploreHref(locale, { category, areaCode, districtCode })}
            variant="weak"
          >
            {t.state.emptySearchAction}
          </ButtonLink>
        </Panel>
      );
    }
    return (
      <Panel lang={locale} message={t.state.emptyFilter}>
        <ButtonLink href={exploreHref(locale, { category })} variant="weak">
          {t.state.emptyFilterAction}
        </ButtonLink>
      </Panel>
    );
  }

  /*
    반응은 **한 번에** 읽는다. 카드가 스스로 가져오면 한 화면에 열두 번을 묻는다.
    저장소를 붙이지 않은 환경에서는 비어 있고, 그때 카드는 그 줄을 그리지 않는다.

    실패해도 목록은 그대로 뜬다 — 반응 수는 이 화면의 본론이 아니다.
  */
  const stats = getSpotStats
    ? await getSpotStats(wall.items.map((s) => s.titleKorean)).catch(() => null)
    : null;

  /*
    **반응이 많은 곳을 앞으로 올린다.**

    순위는 **저장소 전체**에서 뽑는다 — 이 화면에 온 열두 개 안에서만 세면 "지금
    보이는 것 중 인기" 가 되고, 그건 목록을 넘길 때마다 다른 답을 낸다. 대신 자리를
    바꾸는 것은 **이미 받아 둔 목록 안에서**다. 전체 1위가 이 분류에 없으면 억지로
    데려오지 않는다 — 먹을 곳 탭에 관광지가 서면 탭이 뜻을 잃고, 데려오려면
    로케일마다 검색이 한 번씩 더 든다(개발계정 한도 일 1,000건).

    실패해도 목록은 그대로 뜬다. 순서가 공급자 순서로 남을 뿐이다.
  */
  const topKeys = getTopSpotKeys ? await getTopSpotKeys(TOP_PINNED, sort).catch(() => []) : [];
  const rank = new Map(topKeys.map((k, i) => [k, i]));
  /*
    `sort` 는 안정 정렬이다(ES2019~). 순위에 없는 것끼리는 원래 순서가 그대로
    남으므로, 앞으로 끌어올린 몇 개를 빼면 목록은 공급자 순서 그대로다.
  */
  const ordered =
    rank.size === 0
      ? wall.items
      : [...wall.items].sort((a, b) => {
          const ra = rank.get(statsKeyOf(a.titleKorean) ?? "") ?? Number.MAX_SAFE_INTEGER;
          const rb = rank.get(statsKeyOf(b.titleKorean) ?? "") ?? Number.MAX_SAFE_INTEGER;
          return ra - rb;
        });

  const districtName = districts.find((r) => r.code === districtCode)?.name;

  // 스크린 리더에도 내부 은유를 흘리지 않는다. 사용자는 장소를 찾는다
  const listLabel = `${t.category[category]} — ${districtName ?? t.explore.allAreas}`;

  return (
    <>
      <Wall
        items={ordered}
        ariaLabel={listLabel}
        hrefOf={(s) => `/${locale}/spots/${s.contentId}`}
        districtNameOf={(s) => districts.find((r) => r.code === s.districtCode)?.name}
        labelSave={t.frame.save}
        labelSaved={t.frame.saved}
        labelLike={t.frame.like}
        labelLiked={t.frame.liked}
        labelViews={t.frame.views}
        statsOf={(spot) => {
          const key = statsKeyOf(spot.titleKorean);
          return key ? stats?.get(key) : undefined;
        }}
        labelDistance={t.frame.distance}
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
            href={exploreHref(locale, { category, areaCode, districtCode, keyword, sort, more: more + 1 })}
            variant="weak"
            testId="load-more"
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
