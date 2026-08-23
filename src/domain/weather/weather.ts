import type { SkyState } from "@/domain/weather/sky";

/**
 * 지금 날씨 관측값. **공급자 응답이 아니라 도메인이 쓰는 형태다.**
 *
 * 값이 비어 있을 수 있는 필드를 `null` 로 명시한다 — 기상청은 관측소 점검이나
 * 발표시각 경계에서 일부 카테고리를 빼고 준다. 없는 값을 0 으로 채우면
 * "바람 없음"과 "모름"이 같은 화면이 된다.
 */
export type WeatherReading = {
  /** 섭씨. 이 값만은 없으면 화면이 성립하지 않는다 */
  temperature: number;
  /** 하루 최저·최고. 단기예보에서 온다 */
  low: number | null;
  high: number | null;
  sky: SkyState;
  /** % */
  humidity: number | null;
  /** m/s */
  windSpeed: number | null;
  /** 관측 시각(ISO 8601). 화면이 "몇 시 기준"인지 밝히는 데 쓴다 */
  observedAt: string;
};

/** 미세먼지 관측값. 농도만 담는다 — 등급 판정은 `air-quality.ts` 가 한다 */
export type AirQualityReading = {
  /** ㎍/㎥ */
  pm10: number | null;
  pm25: number | null;
  /** 측정소 이름. 어디서 잰 값인지 밝히지 않으면 숫자를 믿을 근거가 없다 */
  stationName: string | null;
  observedAt: string;
};

/**
 * 체감온도.
 *
 * 여름(≥27℃, 습도 있음)은 열지수, 겨울(≤10℃ 이고 바람 ≥1.3m/s)은 기상청 체감온도식,
 * 그 사이는 기온을 그대로 쓴다. **두 식은 각자의 적용 구간 밖에서 발산한다** —
 * 겨울식에 30℃ 를 넣으면 40℃ 가 넘는 값이 나온다. 구간 밖에서는 쓰지 않는다.
 *
 * 근거: 기상청 체감온도(2001년 개정 JAG/TI 식), 미국 NWS 열지수(Rothfusz 회귀식)
 */
export function apparentTemperature(
  celsius: number,
  humidityPercent: number | null,
  windSpeedMs: number | null,
): number {
  if (celsius >= 27 && humidityPercent !== null) {
    return heatIndex(celsius, humidityPercent);
  }
  if (celsius <= 10 && windSpeedMs !== null && windSpeedMs >= 1.3) {
    return windChill(celsius, windSpeedMs);
  }
  return celsius;
}

function windChill(celsius: number, windSpeedMs: number): number {
  // 식은 km/h 를 받는다
  const v = (windSpeedMs * 3.6) ** 0.16;
  return 13.12 + 0.6215 * celsius - 11.37 * v + 0.3965 * celsius * v;
}

function heatIndex(celsius: number, humidityPercent: number): number {
  const t = (celsius * 9) / 5 + 32; // 회귀식은 화씨로 유도됐다
  const r = humidityPercent;
  const f =
    -42.379 +
    2.04901523 * t +
    10.14333127 * r -
    0.22475541 * t * r -
    0.00683783 * t * t -
    0.05481717 * r * r +
    0.00122874 * t * t * r +
    0.00085282 * t * r * r -
    0.00000199 * t * t * r * r;
  return ((f - 32) * 5) / 9;
}
