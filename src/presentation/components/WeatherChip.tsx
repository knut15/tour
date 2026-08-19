"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TodayWeatherView } from "@/application/weather/dto";
import { WeatherIcon } from "@/presentation/components/WeatherIcon";
import { WeatherWidget, type WeatherStrings } from "@/presentation/components/WeatherWidget";

/**
 * 헤더의 날씨 칩.
 *
 * **접힌 상태는 아이콘과 기온뿐이다.** 여기에 "서울" 이나 "미세먼지 보통" 을 얹는 순간
 * 마스트헤드가 공공 포털의 크롬이 된다 (GOAL.md §0.5-6). 칩이 시선을 끌면 실패다.
 * 그래서 높이·테두리·색을 `ThemeToggle`·`LocaleSwitcher` 와 같은 값으로 맞춘다.
 *
 * **데이터는 서버가 props 로 내려준다.** 이 컴포넌트는 여닫기만 안다.
 */

/** 페이지에 칩은 하나뿐이라 id 를 고정한다. `useId` 의 생성 id 를 aria 로 흘리지 않는다 */
const PANEL_ID = "weather-panel";
const LABEL_ID = "weather-panel-title";

export function WeatherChip({
  weather,
  t,
  lang,
  observedTime,
}: {
  weather: TodayWeatherView;
  t: WeatherStrings;
  lang: string;
  /** 서버에서 서울 기준으로 포맷한 관측 시각 */
  observedTime: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      // Escape 는 포커스를 칩으로 되돌린다. 열었던 자리로 돌아가지 않으면 탭 순서를 잃는다
      if (event.key === "Escape") close(true);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;
      if (target instanceof Node && rootRef.current?.contains(target)) return;
      close(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        className={
          "flex h-9 items-center gap-1.5 rounded-md border border-line px-2.5 " +
          "text-muted transition-colors duration-200 ease-[var(--ease-signature)] " +
          "hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 " +
          "focus-visible:outline-focus " +
          (open ? "text-ink" : "")
        }
      >
        <WeatherIcon sky={weather.sky} className="size-[18px] shrink-0" />
        <span className="text-[13px] leading-none tabular-nums">
          {weather.temperature}
          {t.unitCelsius}
        </span>
        {/* 아이콘만으로는 하늘 상태가 읽히지 않는다. 이름과 동작을 스크린 리더에만 덧댄다 */}
        <span className="sr-only">
          {t.sky[weather.sky]} — {open ? t.closeLabel : t.openLabel}
        </span>
      </button>

      {open && (
        <WeatherWidget
          weather={weather}
          t={t}
          lang={lang}
          observedTime={observedTime}
          panelId={PANEL_ID}
          labelId={LABEL_ID}
        />
      )}
    </div>
  );
}
