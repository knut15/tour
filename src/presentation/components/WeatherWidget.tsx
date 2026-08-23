import type { TodayWeatherView } from "@/application/weather/dto";
import type { DustGrade } from "@/domain/weather/air-quality";
import { WeatherIcon } from "@/presentation/components/WeatherIcon";

/**
 * 날씨 위젯 패널 — macOS 제어센터의 타일 묶음 구조.
 *
 * **상태를 갖지 않는다.** 여닫기는 `WeatherChip` 이 하고 여기는 그리기만 한다.
 * 시각 문자열은 서버가 이미 포맷해 내려준다 — 클라이언트에서 `toLocaleString` 을
 * 부르면 서버/클라 타임존이 달라 하이드레이션이 어긋난다.
 */

/** 사전 타입. `dictionaries.ts` 는 `server-only` 라 여기서 값으로 가져오지 않는다 */
export type WeatherStrings = (typeof import("@/presentation/i18n/en.json"))["weather"];

/**
 * 등급 색. **색만으로 구분하지 않는다** — 항상 텍스트 라벨과 함께 쓴다.
 * 값의 정본은 `globals.css` 의 `--dust-*` 토큰이고 여기서는 유틸리티 이름만 고른다
 * (컴포넌트 CSS 클래스에 `var()` 를 넣으면 테마 전환에서 계산값이 굳는 이력이 있다).
 */
const DUST_TEXT: Record<DustGrade, string> = {
  good: "text-dust-good",
  moderate: "text-dust-moderate",
  bad: "text-dust-bad",
  "very-bad": "text-dust-very-bad",
};

const DUST_DOT: Record<DustGrade, string> = {
  good: "bg-dust-good",
  moderate: "bg-dust-moderate",
  bad: "bg-dust-bad",
  "very-bad": "bg-dust-very-bad",
};

/**
 * 측정 지역 이름을 화면 언어로 옮긴다.
 *
 * **에어코리아는 지역명을 한국어로만 준다.** 그대로 쓰면 영어 화면에 "서울 station"
 * 처럼 두 언어가 한 줄에 섞인다 — 외국인 여행자가 쓰는 앱에서 가장 티가 나는 결함이다.
 *
 * 사전에 없는 이름은 원문을 그대로 둔다. 공급자가 표기를 바꾸거나 지역이 늘어도
 * 이름 한 줄이 사라지는 것보다 한국어로라도 보이는 편이 낫다.
 */
function regionLabel(korean: string, t: WeatherStrings): string {
  return (t.regions as Record<string, string>)[korean] ?? korean;
}

/** `{time}` 같은 자리표시자를 채운다 */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);
}

const TILE = "rounded-[16px] bg-surface p-3.5";
const TILE_TITLE = "text-[11px] uppercase tracking-[0.14em] text-muted";

export function WeatherWidget({
  weather,
  t,
  lang,
  observedTime,
  panelId,
  labelId,
}: {
  weather: TodayWeatherView;
  t: WeatherStrings;
  lang: string;
  /** 서버에서 `Intl.DateTimeFormat(locale, { timeZone: "Asia/Seoul" })` 로 만든 문자열 */
  observedTime: string;
  panelId: string;
  labelId: string;
}) {
  const { air, outfit } = weather;

  return (
    <div
      id={panelId}
      /*
        `role="dialog"` 를 쓰지 않는다. 이 패널은 `<details>` 안에 있어 열림 상태를
        브라우저가 이미 전하고, dialog 는 모달이라는 뜻이라 초점을 가두는 동작을
        기대하게 만든다. 여기서는 묶음이라는 것만 말하면 된다.
      */
      role="group"
      aria-labelledby={labelId}
      lang={lang}
      className={
        // 겹침은 역할로 고른다. 숫자를 여기서 정하지 않는다 (globals.css 의 --layer-*)
        "absolute right-0 top-[calc(100%+8px)] z-[var(--layer-popover)] " +
        "w-[min(21.25rem,calc(100vw-2rem))] " +
        "rounded-[22px] border border-line bg-canvas/85 p-2 backdrop-blur-xl " +
        "shadow-[0_18px_48px_-16px_rgba(0,0,0,0.28)] " +
        "animate-[weather-panel-in_0.18s_var(--ease-signature)_both] " +
        "origin-top-right"
      }
    >
      <h2 id={labelId} className="sr-only">
        {t.panelLabel}
      </h2>

      <div className="grid grid-cols-2 gap-2">
        <TodayTile weather={weather} t={t} />
        {/*
          마스크는 **미세먼지 때문에** 권하는 것이라 그 값 옆에 둔다. 옷차림 타일에
          두면 왜 마스크가 떴는지가 옆 타일에 있어서, 두 타일을 번갈아 봐야 이유가
          이어진다. 판정은 도메인이 이미 했으므로(`outfit.extras`) 여기서 다시
          등급을 따지지 않는다 — 기준이 두 곳에 생기면 한쪽만 바뀐다.
        */}
        <AirTile air={air} needsMask={outfit.extras.includes("mask")} t={t} />
        <OutfitTile outfit={outfit} t={t} />
      </div>

      <p className="px-2 pt-2.5 pb-1 text-[10px] leading-[14px] text-muted">
        {fill(t.observedNote, { time: observedTime })}
        {air?.stationName
          ? ` · ${fill(t.stationNote, { station: regionLabel(air.stationName, t) })}`
          : ""}
      </p>
    </div>
  );
}

/** 넓은 타일 — 큰 아이콘·큰 기온·하늘 문구, 그 아래 체감/최저최고, 헤어라인 밑에 습도·바람 */
function TodayTile({ weather, t }: { weather: TodayWeatherView; t: WeatherStrings }) {
  const range = [
    weather.low === null ? null : `${t.low} ${weather.low}${t.unitCelsius}`,
    weather.high === null ? null : `${t.high} ${weather.high}${t.unitCelsius}`,
  ].filter((v): v is string => v !== null);

  return (
    <section className={TILE + " col-span-2"}>
      <h3 className={TILE_TITLE}>{t.todayTitle}</h3>

      <div className="mt-2.5 flex items-center gap-3.5">
        <WeatherIcon sky={weather.sky} className="size-11 shrink-0 text-ink" />
        <div className="min-w-0">
          <p className="flex items-baseline gap-2">
            <span className="text-[34px] font-light leading-none tabular-nums text-ink">
              {weather.temperature}
              {t.unitCelsius}
            </span>
            <span className="truncate text-[13px] text-body">{t.sky[weather.sky]}</span>
          </p>
          <p className="mt-2 text-[12px] leading-[16px] text-muted">
            {`${t.feelsLike} ${weather.feelsLike}${t.unitCelsius}`}
            {range.length > 0 ? ` · ${range.join(" / ")}` : ""}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 border-t border-line pt-2.5 text-[12px]">
        <Metric
          label={t.humidity}
          value={weather.humidity === null ? null : `${weather.humidity}${t.unitPercent}`}
          fallback={t.air.noValue}
        />
        <Metric
          label={t.wind}
          value={weather.windSpeed === null ? null : `${weather.windSpeed} ${t.unitWind}`}
          fallback={t.air.noValue}
        />
      </dl>
    </section>
  );
}

function Metric({
  label,
  value,
  fallback,
}: {
  label: string;
  value: string | null;
  fallback: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <dt className="text-muted">{label}</dt>
      <dd className="tabular-nums text-body">{value ?? fallback}</dd>
    </div>
  );
}

/** 미세먼지. **없으면 빈 칸을 남기지 않고 없다고 말한다** (이 저장소의 기존 결정) */
function AirTile({
  air,
  needsMask,
  t,
}: {
  air: TodayWeatherView["air"];
  /** 미세먼지가 나빠 마스크를 권하는 날인가 */
  needsMask: boolean;
  t: WeatherStrings;
}) {
  return (
    <section className={TILE}>
      {/* 제목과 배지가 한 줄에 선다. 배지가 없는 날에도 제목 높이는 그대로다 */}
      <div className="flex items-center justify-between gap-2">
        <h3 className={TILE_TITLE}>{t.air.title}</h3>
        {needsMask && (
          <span className="shrink-0 rounded-full bg-weak-bg px-2 py-0.5 text-[11px] leading-[16px] text-weak-fg">
            {t.outfit.extra.mask}
          </span>
        )}
      </div>

      {air === null ? (
        <p className="mt-2.5 text-[12px] leading-[17px] text-muted">{t.air.unavailable}</p>
      ) : (
        <>
          <div className="mt-2.5 flex flex-col gap-2">
            <DustRow label={t.air.pm10} value={air.pm10} grade={air.pm10Grade} t={t} />
            <DustRow label={t.air.pm25} value={air.pm25} grade={air.pm25Grade} t={t} />
          </div>
          <p className="mt-2 text-right text-[10px] text-muted">{t.unitDust}</p>
        </>
      )}
    </section>
  );
}

function DustRow({
  label,
  value,
  grade,
  t,
}: {
  label: string;
  value: number | null;
  grade: DustGrade | null;
  t: WeatherStrings;
}) {
  return (
    <div>
      <p className="text-[12px] leading-[16px] text-body">{label}</p>
      <p className="mt-0.5 flex items-baseline gap-1.5">
        <span className="text-[15px] leading-none tabular-nums text-ink">
          {value === null ? t.air.noValue : value}
        </span>
        {grade !== null && (
          <span className="flex items-center gap-1">
            <span
              className={"size-1.5 shrink-0 rounded-full " + DUST_DOT[grade]}
              aria-hidden="true"
            />
            <span className={"text-[11px] leading-none " + DUST_TEXT[grade]}>
              {t.air.grade[grade]}
            </span>
          </span>
        )}
      </p>
    </div>
  );
}

/**
 * 옷차림. extras 가 비면 배지 줄 자체를 그리지 않는다.
 *
 * 그런데 배지가 없는 날은 타일 안이 한 줄뿐이라, 옆 공기 타일이 정한 높이만큼
 * 아래가 비어 보인다. **타일 높이는 맞추되 내용을 남은 공간의 가운데에 둔다** —
 * 두 타일의 높이를 따로 놀게 하면 패널에 계단이 생긴다.
 */
function OutfitTile({ outfit, t }: { outfit: TodayWeatherView["outfit"]; t: WeatherStrings }) {
  const wearables = outfit.extras.filter((e) => e !== "mask");

  return (
    <section className={`${TILE} flex flex-col`}>
      <h3 className={TILE_TITLE}>{t.outfit.title}</h3>
      <div className="flex flex-1 flex-col justify-center">
        <p className="mt-2.5 text-[13px] leading-[18px] text-ink">
          {t.outfit.layer[outfit.layer]}
        </p>
        {/* 마스크는 공기 타일이 가져갔다. 같은 배지를 두 곳에 두면 두 가지 일로 읽힌다 */}
        {wearables.length > 0 && (
          <ul className="mt-2.5 flex flex-wrap gap-1">
            {wearables.map((extra) => (
              <li
                key={extra}
                className="rounded-full bg-weak-bg px-2 py-0.5 text-[11px] leading-[16px] text-weak-fg"
              >
                {t.outfit.extra[extra]}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
