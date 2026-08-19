import { notFound } from "next/navigation";
import { isLocale } from "@/domain/shared/locale";
import { getDictionary } from "@/presentation/i18n/dictionaries";
import { ButtonLink } from "@/presentation/components/Button";
import { Masthead } from "@/presentation/components/Masthead";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = await getDictionary(locale);

  return (
    <>
      <Masthead locale={locale} t={t} localeHref={(l) => `/${l}`} />

      <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col justify-center px-6 py-20">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t.explore.eyebrow}</p>
        <h1
          lang={locale}
          className={
            "mt-5 font-display font-light text-[clamp(3rem,9vw,5rem)] leading-[1.02] text-ink " +
            (locale === "ko" ? "max-w-[11ch]" : "max-w-[14ch]")
          }
        >
          {t.explore.title}
        </h1>
        <p lang={locale} className="mt-5 max-w-[42ch] text-[16px] leading-[24px] text-body">
          {t.explore.subtitle}
        </p>
        <div className="mt-12">
          <ButtonLink href={`/${locale}/explore`}>{t.nav.explore}</ButtonLink>
        </div>
      </main>
    </>
  );
}
