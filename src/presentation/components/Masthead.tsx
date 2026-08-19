import Link from "next/link";
import { Suspense } from "react";
import type { Locale } from "@/domain/shared/locale";
import { getTodayWeather } from "@/presentation/lib/container";
import { LocaleSwitcher } from "@/presentation/components/LocaleSwitcher";
import { ThemeToggle } from "@/presentation/components/ThemeToggle";
import { WeatherChipSkeleton } from "@/presentation/components/Skeleton";
import { WeatherChip } from "@/presentation/components/WeatherChip";
import type { Dictionary } from "@/presentation/i18n/dictionaries";

/**
 * 마스트헤드 — 브랜드 + 컨트롤 세 개.
 *
 * **서버 컴포넌트다.** 날씨 조회만 `<Suspense>` 안의 별도 async 컴포넌트로 떼어
 * 기상청 응답이 느려도 브랜드·테마·언어는 즉시 뜬다.
 *
 * 두꺼운 상단 내비를 만들지 않는다 (GOAL.md §0.5-6). 컨트롤은 셋 다 같은 높이(36px)의
 * 조용한 아웃라인이고, 날씨 칩도 그 규칙을 그대로 따른다.
 */
export function Masthead({
  locale,
  t,
  localeHref,
}: {
  locale: Locale;
  t: Dictionary;
  /** 언어 전환이 갈 곳. 화면마다 다르므로 밖에서 받는다 */
  localeHref: (locale: Locale) => string;
}) {
  return (
    <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-5">
      <Link
        href={`/${locale}`}
        className="text-[13px] uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-focus"
      >
        {t.brand}
      </Link>
      <div className="flex items-center gap-2">
        <Suspense fallback={<WeatherChipSkeleton />}>
          <WeatherSlot locale={locale} t={t} />
        </Suspense>
        <ThemeToggle label={t.nav.theme} />
        <LocaleSwitcher current={locale} hrefFor={localeHref} label={t.nav.switchLocale} />
      </div>
    </header>
  );
}

/**
 * 날씨 한 벌을 서버에서 받아 칩에 내려준다.
 *
 * **실패하면 칩을 아예 그리지 않는다.** 날씨는 이 화면의 본론이 아니다 — 기상청이
 * 죽었다고 장소 목록까지 못 보게 만들지 않는다.
 *
 * 시각 포맷도 여기서 끝낸다. 클라이언트에서 `toLocaleString` 을 부르면 서버(UTC)와
 * 브라우저(사용자 타임존)가 다른 문자열을 만들어 하이드레이션이 어긋난다.
 */
async function WeatherSlot({ locale, t }: { locale: Locale; t: Dictionary }) {
  let weather;
  try {
    weather = await getTodayWeather();
  } catch {
    return null;
  }

  const observedTime = new Intl.DateTimeFormat(locale, {
    timeZone: "Asia/Seoul",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(weather.observedAt));

  return <WeatherChip weather={weather} t={t.weather} lang={locale} observedTime={observedTime} />;
}
