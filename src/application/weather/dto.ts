import type { DustGrade } from "@/domain/weather/air-quality";
import type { SkyState } from "@/domain/weather/sky";
import type { OutfitAdvice } from "@/domain/weather/outfit";

export type TodayWeatherInput = {
  /** 없으면 `DEFAULT_WEATHER_POINT` 를 쓴다 */
  lng?: number;
  lat?: number;
};

export type AirQualityView = {
  /** ㎍/㎥ */
  pm10: number | null;
  pm25: number | null;
  pm10Grade: DustGrade | null;
  pm25Grade: DustGrade | null;
  /** 둘 중 나쁜 쪽. 칩 한 줄에 등급 하나만 쓸 때의 값 */
  overall: DustGrade | null;
  stationName: string | null;
  observedAt: string;
};

/**
 * 화면이 쓰는 오늘 날씨.
 *
 * **숫자는 여기서 이미 반올림해 둔다.** 컴포넌트마다 `Math.round` 를 부르면
 * 칩의 27℃ 와 위젯의 26.5℃ 가 어긋나는 날이 온다.
 */
export type TodayWeatherView = {
  sky: SkyState;
  /** 섭씨 정수 */
  temperature: number;
  feelsLike: number;
  low: number | null;
  high: number | null;
  /** % */
  humidity: number | null;
  /** m/s, 소수 첫째 자리 */
  windSpeed: number | null;
  observedAt: string;
  /** 미세먼지 조회가 실패하면 null 이다. 날씨는 그대로 그린다 */
  air: AirQualityView | null;
  outfit: OutfitAdvice;
};
