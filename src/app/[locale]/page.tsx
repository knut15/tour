import { notFound } from "next/navigation";
import { isLocale } from "@/domain/shared/locale";
import { getDictionary } from "@/presentation/i18n/dictionaries";
import { ButtonLink } from "@/presentation/components/Button";
import { Lede } from "@/presentation/components/Lede";
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
            <ButtonLink href={`/${locale}/explore`} transitionTypes={["to-explore"]}>
              {t.nav.explore}
            </ButtonLink>
          </div>
        </div>

        <NetworkArt className="hidden min-h-0 aspect-square w-full lg:block" />
      </main>
    </>
  );
}
