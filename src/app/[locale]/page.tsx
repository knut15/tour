import { ViewTransition } from "react";
import { notFound } from "next/navigation";
import { isLocale } from "@/domain/shared/locale";
import { getDictionary } from "@/presentation/i18n/dictionaries";
import { BrandCtaLink } from "@/presentation/components/Button";
import { Lede, SHARE } from "@/presentation/components/Lede";
import { Masthead } from "@/presentation/components/Masthead";
import { NetworkArt } from "@/presentation/components/NetworkArt";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  return (
    <>
      <Masthead locale={locale} t={t} localeHref={(l) => `/${l}`} />

      {/*
        글이 왼쪽, 연결망이 오른쪽. **좁은 화면에서는 글만 남는다** — 세로로 쌓으면
        그림이 버튼 아래로 밀려나 스크롤해야 보이는 장식이 되고, 그럴 바에는 없는
        편이 낫다. 그림은 제목 옆에 있을 때만 제목을 거든다.

        오른쪽 열이 `min-h-0` 을 갖는다. 그리드 아이템의 기본 최소 높이는 콘텐츠
        크기라, 이것이 없으면 SVG 가 열을 세로로 밀어 올린다.
      */}
      <main className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-12 px-6 py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div>
          {/*
            탐색 화면과 **같은 물체다.** 문구도 이름(`lede`)도 거기서 같은 것을 쓴다 —
            그래서 오갈 때 사라졌다 나타나지 않고 크기와 자리를 옮긴다.
          */}
          <Lede locale={locale} t={t} size="hero" />
          <div className="mt-12">
            {/* 내려가는 방향. 머리말이 이 크기에서 탐색 화면 크기로 줄어든다 */}
            <BrandCtaLink href={`/${locale}/explore`} transitionTypes={["to-explore"]}>
              {t.nav.explore}
            </BrandCtaLink>
          </div>
        </div>

        {/*
          **탐색 화면과 같은 물체다.** 거기서도 머리말 옆에 서 있고, 이름이 같아서
          오갈 때 사라졌다 나타나지 않고 크기와 자리를 옮긴다 — 머리말이 그러는 것과
          같은 규칙(`SHARE`)을 쓴다.

          두 화면 모두 정사각이다. **종횡비가 갈리면 스냅샷이 찌그러진다** —
          `object-fit: fill` 로 늘어나기 때문이고, 머리말 제목이 `ch` 로 폭을 맞춰
          둔 것과 같은 이유다. 폭만 다르면 높이는 따라 비례해 uniform scale 이 된다.
        */}
        <ViewTransition name="lede-art" share={SHARE} default="none">
          <NetworkArt className="hidden min-h-0 aspect-square w-full lg:block" />
        </ViewTransition>
      </main>
    </>
  );
}
