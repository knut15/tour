import type { TodayWeatherView } from "@/application/weather/dto";
import { CONTROL_SM } from "@/presentation/components/tds";
import { WeatherIcon } from "@/presentation/components/WeatherIcon";
import { WeatherWidget, type WeatherStrings } from "@/presentation/components/WeatherWidget";

/**
 * 헤더의 날씨 칩.
 *
 * **접힌 상태는 아이콘과 기온뿐이다.** 여기에 "서울" 이나 "미세먼지 보통" 을 얹는 순간
 * 마스트헤드가 공공 포털의 크롬이 된다 (GOAL.md §0.5-6). 칩이 시선을 끌면 실패다.
 *
 * **여닫기를 직접 만들지 않는다.** `<details data-dismissable>` 로 두면 라우트에 한 번
 * 얹힌 `DismissOnOutside` 가 바깥 클릭·Esc·포커스 복귀를 처리한다. 여기서 리스너를
 * 달면 언어 선택과 같은 일을 하는 코드가 화면에 둘이 되고, document 리스너도 둘이 된다.
 *
 * 그 덕에 이 컴포넌트는 **클라이언트 컴포넌트가 아니다.** 상태가 없으므로 서버가
 * 그린 HTML 그대로 열리고 닫힌다 — JS 가 늦게 와도 칩은 이미 동작한다.
 */

/** 페이지에 칩은 하나뿐이라 id 를 고정한다 */
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
  return (
    <details className="relative" data-dismissable>
      {/*
        높이는 CONTROL_SM 이 정한다. 옆의 테마 토글·언어 선택과 같은 36px 이어야 한다.
        `list-none` 은 `<summary>` 기본 삼각형을 지운다 — 칩에는 그 표식이 없다.
      */}
      <summary className={`${CONTROL_SM} cursor-pointer list-none px-2.5`}>
        <WeatherIcon sky={weather.sky} className="size-[18px] shrink-0" />
        <span className="tabular-nums">
          {weather.temperature}
          {t.unitCelsius}
        </span>
        {/* 아이콘만으로는 하늘 상태가 읽히지 않는다. 이름은 스크린 리더에만 덧댄다 */}
        <span className="sr-only">{t.sky[weather.sky]}</span>
      </summary>

      <WeatherWidget
        weather={weather}
        t={t}
        lang={lang}
        observedTime={observedTime}
        panelId={PANEL_ID}
        labelId={LABEL_ID}
      />
    </details>
  );
}
