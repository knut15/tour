import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import type { Locale } from "@/domain/shared/locale";
import { getTodayWeather } from "@/presentation/lib/container";
import { LocaleSwitcher } from "@/presentation/components/LocaleSwitcher";
import { ThemeToggle } from "@/presentation/components/ThemeToggle";
import { WeatherChipSkeleton } from "@/presentation/components/Skeleton";
import { WeatherChip } from "@/presentation/components/WeatherChip";
import type { Dictionary } from "@/presentation/i18n/dictionaries";

/**
 * 마스트헤드 — 왼쪽 하나 + 컨트롤 세 개.
 *
 * **모든 화면이 이것을 쓴다.** 상세 화면이 자기 헤더를 따로 갖고 있던 동안 날씨 칩이
 * 거기서만 빠져 있었다. 왼쪽에 무엇이 서는지만 화면마다 다르므로(브랜드 / 뒤로) 그것만
 * 밖에서 받는다.
 *
 * **서버 컴포넌트다.** 날씨 조회만 `<Suspense>` 안의 별도 async 컴포넌트로 떼어
 * 기상청 응답이 느려도 브랜드·테마·언어는 즉시 뜬다.
 *
 * 스크롤에 고정된다. 필터 바가 바로 밑에 붙는 순간 높이가 줄어든다 —
 * 높이 값과 전환은 `globals.css` 의 `--masthead-h` 가 정본이다.
 *
 * 두꺼운 상단 내비를 만들지 않는다 (GOAL.md §0.5-6). 컨트롤은 셋 다 같은 높이(36px)의
 * 조용한 아웃라인이고, 날씨 칩도 그 규칙을 그대로 따른다.
 */
export function Masthead({
  locale,
  t,
  localeHref,
  localeNote,
  leading,
}: {
  locale: Locale;
  t: Dictionary;
  /** 언어 전환이 갈 곳. 화면마다 다르므로 밖에서 받는다 */
  localeHref: (locale: Locale) => string;
  /** 언어 전환의 결과가 기대와 다를 수 있을 때 알리는 문구 */
  localeNote?: string;
  /** 왼쪽 자리. 생략하면 브랜드가 선다 */
  leading?: ReactNode;
}) {
  return (
    <>
      {/*
        `fixed` 다. `sticky` 로 두면 줄어들 때 흐름 높이까지 함께 줄어서
        아래 내용이 24px 위로 튄다 — 스크롤 위치는 그대로인데 화면이 움직인다.
        흐름 자리는 아래 스페이서가 대신 잡고, 그 높이는 줄어들지 않는다.
      */}
      <header className="masthead-sticky fixed inset-x-0 top-0 z-[var(--layer-bar)] bg-canvas/85 backdrop-blur">
        <div className="mx-auto flex h-full w-full max-w-[1200px] items-center justify-between px-6">
          {leading ?? (
            <Link
              href={`/${locale}`}
              className="text-[13px] uppercase tracking-[0.16em] focus-visible:outline-2 focus-visible:outline-focus"
            >
              {t.brand}
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Suspense fallback={<WeatherChipSkeleton />}>
              <WeatherSlot locale={locale} t={t} />
            </Suspense>
            <ThemeToggle label={t.nav.theme} />
            <LocaleSwitcher
              current={locale}
              hrefFor={localeHref}
              label={t.nav.switchLocale}
              note={localeNote}
            />
          </div>
        </div>
      </header>
      {/* 고정된 헤더가 비운 자리. **줄어들지 않는다** — 줄어들면 내용이 튄다 */}
      <div aria-hidden="true" className="h-[var(--masthead-h-base)] shrink-0" />
    </>
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
