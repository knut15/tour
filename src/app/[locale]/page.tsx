import { notFound } from "next/navigation";
import { isLocale } from "@/domain/shared/locale";
import { getDictionary } from "@/presentation/i18n/dictionaries";
import { ButtonLink } from "@/presentation/components/Button";
import { Lede } from "@/presentation/components/Lede";
import { Masthead } from "@/presentation/components/Masthead";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  return (
    <>
      <Masthead locale={locale} t={t} localeHref={(l) => `/${l}`} />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-6 py-20">
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
      </main>
    </>
  );
}
