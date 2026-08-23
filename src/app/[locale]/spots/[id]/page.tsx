import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/domain/shared/locale";
import type { Category } from "@/domain/spot/category";
import type { SpotDetailView } from "@/application/spot/dto";
import { getSpotDetail, getSpotStats } from "@/presentation/lib/container";
import { statsKeyOf } from "@/domain/spot/spot-stats";
import { exploreHref } from "@/presentation/lib/explore-href";
import { NoImage } from "@/presentation/components/NoImage";
import { SaveChip } from "@/presentation/components/SaveChip";
import { SpotStats } from "@/presentation/components/SpotStats";
import { ViewCounter } from "@/presentation/components/ViewCounter";
import { SpotImage } from "@/presentation/components/SpotImage";
import { Masthead } from "@/presentation/components/Masthead";
import {
  DETAIL_ACTION,
  TDS_BUTTON,
  TDS_BUTTON_PRIMARY,
  TDS_BUTTON_WEAK,
} from "@/presentation/components/tds";
import { getDictionary, type Dictionary } from "@/presentation/i18n/dictionaries";

export default async function SpotDetailPage({ params }: PageProps<"/[locale]/spots/[id]">) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  let spot: SpotDetailView | null = null;
  let failed = false;
  try {
    spot = await getSpotDetail({ locale, contentId: id });
  } catch {
    failed = true;
  }

  if (failed || !spot) return <NotFound locale={locale} t={t} failed={failed} />;

  const factRows = [
    { key: "address", value: spot.address },
    ...spot.facts,
  ];

  /*
    두 단에 나눠 담는다. **앞 절반이 왼쪽, 뒤 절반이 오른쪽이다** — 좌우를 번갈아
    담으면(1·3·5 왼쪽, 2·4·6 오른쪽) 읽는 순서가 지그재그가 되어, 주소 다음에
    영업시간을 찾으려면 눈이 단을 건너뛰어야 한다.

    홀수면 왼쪽이 하나 더 갖는다. 첫 항목인 주소가 대개 가장 길어 왼쪽이
    자연스럽게 무거워지고, 거기에 한 줄을 더 얹는 편이 두 단의 높이가 맞는다.
  */
  /* 이 장소의 반응. 저장소가 없거나 셀 수 없으면 없다 — 그때는 줄을 그리지 않는다 */
  const statsKey = statsKeyOf(spot.titleKorean);
  const stats = getSpotStats && statsKey
    ? (await getSpotStats([spot.titleKorean]).catch(() => null))?.get(statsKey)
    : undefined;

  const half = Math.ceil(factRows.length / 2);
  const factColumns = [factRows.slice(0, half), factRows.slice(half)];



  return (
    <>
      <DetailMasthead
        locale={locale}
        t={t}
        koreanName={spot.titleKorean}
        category={spot.category}
      />

      {/*
        ── 한 흐름 ──

        **단을 나누지 않는다.** 분류 · 이름 · 사진 · 소개 · 사실 표가 위에서 아래로
        한 줄기로 이어진다. 좌우로 갈라 놓으면 어느 쪽을 먼저 읽어야 하는지가 매번
        선택이 되고, 스크롤할 때 두 단의 길이가 달라 한쪽만 먼저 끝난다.

        **넘김 장치도 두지 않는다.** 소개를 앞뒤로 잘라 "이어서 읽기" 로 넘기던 것을
        없앴다 — 한 흐름에서는 넘길 곳이 이미 눈앞에 있고, 그때 넘김 링크는 스크롤
        한 번을 링크 한 번으로 바꾸는 것 말고는 하는 일이 없다. 소개도 자르지 않고
        통째로 둔다.

        가운데 맞춤은 **이름까지만**이다. 긴 문장을 가운데 맞추면 줄 시작점이 매 줄
        달라져 눈이 다음 줄 머리를 찾지 못한다. 소개와 표는 왼쪽에 맞추되 지면 가운데
        놓는다.
      */}
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-32 md:pb-16">
        <div className="mx-auto max-w-[860px] py-10 md:py-16">
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted">
              {t.category[spot.category]}
            </p>

            <h1 className="mx-auto mt-6 max-w-[20ch] font-display font-light text-[clamp(2rem,4vw,3rem)] leading-[1.1] text-ink">
              {spot.titlePrimary}
            </h1>

            {spot.titleKorean && spot.titleKorean !== spot.titlePrimary && (
              /*
                레퍼런스가 제목 아래 이탤릭 한 줄을 두는 자리다. **한글에는 이탤릭을
                쓰지 않는다** — 한글 서체에 진짜 이탤릭 자족이 없어 브라우저가 글자를
                기울여 흉내 내고, 그 결과는 획이 뭉개진 글자다. 대신 같은 세리프로
                크기만 낮춰 같은 역할을 준다.
              */
              <p lang="ko" className="mt-4 font-display text-[18px] leading-[1.4] text-body">
                {spot.titleKorean}
              </p>
            )}

            {/*
              이름 바로 아래, 사진 위다. **이름에 딸린 값이라 이름 옆에 둔다** —
              표 아래에 있던 동안에는 사실 표의 마지막 행처럼 보여서, 이 장소의
              공개 정보 중 하나로 읽혔다.

              목록 카드 바닥과 같은 컴포넌트를 쓴다. 가운데 구도이므로 감싸서
              가운데로 민다 — 컴포넌트 자체는 왼쪽 정렬이고 카드에서는 그게 맞다.
            */}
            <div className="mt-5 flex justify-center">
              <SpotStats
                stats={stats}
                statsKey={statsKey}
                locale={spot.locale}
                labelLike={t.frame.like}
                labelViews={t.frame.views}
                size="md"
              />
            </div>
          </div>

          {/* 사진이 이 지면의 주인공이다. 글은 위아래에서 받친다 */}
          <div className="mt-10 overflow-hidden rounded-sm bg-surface md:mt-14">
            {spot.imageUrl ? (
              <SpotImage
                src={spot.imageUrl}
                alt={spot.titlePrimary}
                noImageLabel={t.frame.noImage}
                size="lg"
                fit="natural"
                priority
              />
            ) : (
              // 빈 색면은 "아직 안 떴다" 로 읽힌다. 없다는 것을 글자로 말한다
              <div className="aspect-[3/2]">
                <NoImage label={t.frame.noImage} size="lg" />
              </div>
            )}
          </div>

          {/*
            **글의 폭을 사진에 맞춘다.** 읽기 좋은 한 줄 길이(45~75자)로 따로 묶어
            두었더니 사진보다 좁아져, 같은 지면인데 왼쪽 가장자리만 같고 오른쪽이
            들쭉날쭉했다. 한 흐름으로 읽는 지면에서는 그 어긋남이 더 눈에 띈다.

            대신 지면 자체를 860px 로 좁혀 두었다. 한 줄이 길다고 느껴지면 읽기 폭을
            되살리는 것이 아니라 **이 지면의 `max-w` 를 줄인다** — 그래야 사진과 글이
            같이 좁아진다.
          */}
          {spot.overview && (
            <p
              lang={locale}
              className="mt-12 whitespace-pre-line text-[16px] leading-[1.85] text-ink md:mt-14"
            >
              {spot.overview}
            </p>
          )}

          {/*
            사실 표 — 인쇄물의 판권면(colophon)처럼 짠다.

            **행마다 선을 긋지 않는다.** 항목이 일곱이면 선도 일곱이고, 그 줄무늬가
            표를 지면 위에 붙인 격자로 만든다. 대신 **각 단 위에 선 하나**만 두고
            아래는 여백으로 나눈다 — 항목들이 한 덩어리로 쌓여 위의 글과 같은
            물건으로 읽힌다.

            그러려면 두 단을 CSS 로 흘려보낼 수 없다. 흘리면 어느 항목이 어느 단에
            갈지 브라우저가 정해서 단 위의 선을 어디에 둘지 알 수 없다. 그래서
            항목을 **미리 반으로 나눠** 각 단에 담는다.

            라벨은 값 위에 둔다. 옆에 두면 라벨이 차지한 만큼 값이 밀려 주소처럼
            긴 값이 서너 줄로 접힌다.

            **값을 대문자로 바꾸지 않는다.** 레퍼런스는 전부 대문자지만 그건 영문
            지면이라 가능하다. `uppercase` 는 라틴에만 걸려서, 같은 화면의 한국어·
            일본어 값은 그대로 남는다 — 언어마다 다른 화면이 된다.
          */}
          <div className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2 md:mt-16">
            {factColumns.map((column, i) => (
              <dl key={i} className="border-t border-line pt-5">
                {column.map((row) => (
                  <div key={row.key} className="mb-5 last:mb-0">
                    <dt className="text-[10px] uppercase tracking-[0.18em] text-muted">
                      {t.detail.fact[row.key as keyof Dictionary["detail"]["fact"]] ?? row.key}
                    </dt>
                    {/* 값이 없어도 행을 지우지 않는다. 숨기면 "정보가 없다" 와 "그런 항목이 없다" 가 구분되지 않는다 */}
                    <dd
                      lang={locale}
                      className={
                        "mt-1.5 whitespace-pre-line text-[14px] leading-[21px] " +
                        (row.value ? "text-ink" : "text-muted italic")
                      }
                    >
                      {row.value ?? t.detail.noInfo}
                    </dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>

        </div>
      </main>

      {/* 봤다고 한 번 알린다. 아무것도 그리지 않는다 */}
      <ViewCounter koreanName={spot.titleKorean} />

      <Actions spot={spot} t={t} />

      <footer className="border-t border-line px-6 py-8">
        {/* 이 앱에서 출처를 밝히는 유일한 자리다 (GOAL.md §0.5-6) */}
        <p lang={locale} className="mx-auto max-w-[1200px] text-[13px] text-muted">
          {t.detail.sourceNote}
        </p>
      </footer>
    </>
  );
}

function Actions({ spot, t }: { spot: SpotDetailView; t: Dictionary }) {
  const mapsHref =
    spot.lat !== null && spot.lng !== null
      ? `https://map.kakao.com/link/map/${encodeURIComponent(spot.titleKorean ?? spot.titlePrimary)},${spot.lat},${spot.lng}`
      : null;

  /*
    지면 바닥에 셋이 나란히 선다. **화면에 고정하지 않는다** — 고정 바는 스크롤하는
    내내 화면 아래를 차지해서, 조용한 지면을 만들어 놓고 그 위에 띠를 하나 덧대는
    꼴이 된다. 한 흐름으로 읽는 지면이므로 액션도 그 흐름의 끝에 둔다.

    가운데 맞춤이다. 위의 지면이 가운데 축을 지키므로 액션만 한쪽에 붙으면
    그 줄에서만 축이 어긋난다.

    기하는 `DETAIL_ACTION` 이 정본이다. 셋이 각자 정하면 높이와 모서리가 달라진다.
  */
  return (
    <div className="mx-auto flex w-full max-w-[860px] flex-wrap items-center justify-center gap-3 px-6 pb-4 md:pb-10">
      <SaveChip
        spotKey={`${spot.locale}:${spot.contentId}`}
        labelSave={t.frame.save}
        labelSaved={t.frame.saved}
        title={spot.titlePrimary}
        variant="inline"
      />
      {mapsHref && (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${DETAIL_ACTION} ${TDS_BUTTON_WEAK}`}
        >
          {t.detail.openInMaps}
        </a>
      )}
      {spot.homepage && (
        <a
          href={spot.homepage}
          target="_blank"
          rel="noopener noreferrer"
          className={`${DETAIL_ACTION} border border-line text-ink hover:border-ink/25`}
        >
          {t.detail.official}
          {/* 글자와 같은 줄에 앉게 크기를 맞춘다. 기본값이면 글자보다 커 보인다 */}
          <span aria-hidden="true" className="text-[12px] leading-none">
            ↗
          </span>
        </a>
      )}
    </div>
  );
}

/**
 * 상세 화면의 마스트헤드. 공유 `Masthead` 에 왼쪽만 갈아 끼운다.
 *
 * 자기 헤더를 따로 갖고 있던 동안 **날씨 칩이 이 화면에서만 빠져 있었다.**
 * 화면마다 다른 것은 왼쪽에 무엇이 서는지(브랜드 / 뒤로)와 언어 전환이 갈 곳뿐이다.
 */
function DetailMasthead({
  locale,
  t,
  koreanName,
  category,
}: {
  locale: Locale;
  t: Dictionary;
  /** 언어를 바꿀 때 상대 카탈로그를 찾는 열쇠. 없으면 목록으로 간다 */
  koreanName?: string | null;
  /**
   * 돌아갈 탭. **이 장소가 속한 분류다.**
   *
   * 목록에서 어느 탭을 보고 있었는지를 URL 로 받지 않는다 — 상세 주소에 남의
   * 필터가 붙으면 그 주소를 공유했을 때 받은 사람도 그 필터를 물려받는다.
   * 장소의 분류는 그 자체로 어느 탭에 있었는지를 말해 주므로 그것으로 충분하다.
   *
   * 없으면(찾지 못한 화면) 기본 탭으로 간다.
   */
  category?: Category;
}) {
  return (
    <Masthead
      locale={locale}
      t={t}
      localeNote={t.detail.localeSwitchNote}
      /*
        언어를 바꿔도 **보던 장소를 유지한다.** contentid 공간이 언어마다 분리돼
        있어 ID 를 그대로 쓸 수 없으므로, 두 카탈로그를 잇는 한글 원명을 들려
        `resolve` 로 보내 그 언어의 카탈로그에서 다시 찾게 한다.
        한글 원명이 없거나 상대 카탈로그에 없으면 목록으로 간다 — title 로 알린다.
      */
      localeHref={(l) =>
        koreanName
          ? `/${l}/spots/resolve?ko=${encodeURIComponent(koreanName)}`
          : category
            ? exploreHref(l, { category })
            : `/${l}/explore`
      }
      leading={
        <Link
          href={category ? exploreHref(locale, { category }) : `/${locale}/explore`}
          className="inline-flex items-center gap-2 text-[13px] uppercase tracking-[0.14em] text-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-focus"
        >
          <span aria-hidden="true">←</span>
          {t.detail.back}
        </Link>
      }
    />
  );
}

function NotFound({ locale, t, failed }: { locale: Locale; t: Dictionary; failed: boolean }) {
  return (
    <>
      <DetailMasthead locale={locale} t={t} />
      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
        <p lang={locale} className="max-w-[32ch] text-[16px] text-muted">
          {failed ? t.state.error : t.detail.notFound.title}
        </p>
        <Link
          href={`/${locale}/explore`}
          className={`${TDS_BUTTON} ${TDS_BUTTON_PRIMARY}`}
        >
          {t.detail.notFound.toList}
        </Link>
      </main>
    </>
  );
}
