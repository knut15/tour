import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/domain/shared/locale";
import type { SpotDetailView } from "@/application/spot/dto";
import { getSpotDetail } from "@/presentation/lib/container";
import { NoImage } from "@/presentation/components/NoImage";
import { SaveChip } from "@/presentation/components/SaveChip";
import { SpotImage } from "@/presentation/components/SpotImage";
import { Masthead } from "@/presentation/components/Masthead";
import {
  TDS_BUTTON,
  TDS_BUTTON_PRIMARY,
  TDS_BUTTON_WEAK,
  TOSS_MARKETING_CTA,
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

  return (
    <>
      <DetailMasthead locale={locale} t={t} koreanName={spot.titleKorean} />

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 pb-32 md:pb-16">
        {/*
          DOM 순서는 hero → identity → facts → description 이다.
          좁은 화면에서 단일 열로 무너질 때 **이름을 읽기 전에 설명을 읽는 일이 없어야** 한다.
          데스크톱의 2열 배치는 CSS `order` 가 아니라 명시적 grid 좌표로 만든다.
        */}
        <div className="md:grid md:grid-cols-12 md:gap-x-10">
          <div className="md:col-span-7 md:col-start-1 md:row-start-1">
            <div className="relative -mx-6 md:mx-0">
              {/* 상세도 같은 색 매트를 쓴다. 목록에서 본 액자가 그대로 커진 것으로 읽혀야 한다 */}
              <div className="overflow-hidden md:rounded-md">
                <div className="aspect-[3/2] w-full overflow-hidden bg-surface md:rounded-md">
                  {spot.imageUrl ? (
                    <SpotImage
                      src={spot.imageUrl}
                      alt={spot.titlePrimary}
                      noImageLabel={t.frame.noImage}
                      size="lg"
                      priority
                    />
                  ) : (
                    // 빈 색면은 "아직 안 떴다" 로 읽힌다. 없다는 것을 글자로 말한다
                    <NoImage label={t.frame.noImage} size="lg" />
                  )}
                </div>
              </div>

            </div>
          </div>

          <header className="pt-10 md:col-span-5 md:col-start-8 md:row-start-1 md:pt-0">
            <h1 className="font-display font-light text-[clamp(2rem,5vw,3rem)] leading-[1.08] text-ink">
              {spot.titlePrimary}
            </h1>
            {spot.titleKorean && spot.titleKorean !== spot.titlePrimary && (
              // 한글명은 보조가 아니라 동급이다. 크기를 줄이되 흐리게 만들지 않는다
              <p lang="ko" className="mt-2 text-[17px] text-ink">
                {spot.titleKorean}
              </p>
            )}
          </header>

          <section className="md:col-span-5 md:col-start-8 md:row-start-2">
            <dl className="mt-8 divide-y divide-line border-y border-line md:mt-6">
              {factRows.map((row) => (
                <div key={row.key} className="grid grid-cols-[7rem_1fr] gap-4 py-4">
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">
                    {t.detail.fact[row.key as keyof Dictionary["detail"]["fact"]] ?? row.key}
                  </dt>
                  {/* 값이 없어도 행을 지우지 않는다. 숨기면 "정보가 없다" 와 "그런 항목이 없다" 가 구분되지 않는다 */}
                  <dd
                    lang={locale}
                    className={
                      "whitespace-pre-line text-[15px] leading-[22px] " +
                      (row.value ? "text-body" : "text-muted italic")
                    }
                  >
                    {row.value ?? t.detail.noInfo}
                  </dd>
                </div>
              ))}
            </dl>

            {spot.homepage && (
              <a
                href={spot.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className={TOSS_MARKETING_CTA + " mt-6"}
              >
                {t.detail.official}
                <span aria-hidden="true">↗</span>
              </a>
            )}
          </section>

          {spot.overview && (
            <section className="pt-10 md:col-span-7 md:col-start-1 md:row-start-2 md:pt-6">
              <p
                lang={locale}
                className="max-w-[62ch] whitespace-pre-line text-[16px] leading-[1.7] text-ink"
              >
                {spot.overview}
              </p>
            </section>
          )}
        </div>
      </main>

      <Actions spot={spot} t={t} />

      <footer className="border-t border-line px-6 py-8 pb-28 md:pb-8">
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

  return (
    <div className="fixed inset-x-0 bottom-0 z-[var(--layer-bar)] border-t border-line bg-canvas/95 px-6 py-4 backdrop-blur md:static md:border-0 md:bg-transparent md:px-6 md:pb-10 md:backdrop-blur-none">
      <div className="mx-auto flex max-w-[1200px] items-center gap-3">
        <div className="relative">
          <SaveChip
            spotKey={`${spot.locale}:${spot.contentId}`}
            labelSave={t.frame.save}
            labelSaved={t.frame.saved}
            title={spot.titlePrimary}
            variant="inline"
          />
        </div>
        {mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className={`${TDS_BUTTON} ${TDS_BUTTON_WEAK} flex-1 md:flex-none`}
          >
            {t.detail.openInMaps}
          </a>
        )}
      </div>
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
}: {
  locale: Locale;
  t: Dictionary;
  /** 언어를 바꿀 때 상대 카탈로그를 찾는 열쇠. 없으면 목록으로 간다 */
  koreanName?: string | null;
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
          : `/${l}/explore`
      }
      leading={
        <Link
          href={`/${locale}/explore`}
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
