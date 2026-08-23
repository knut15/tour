import type { Coordinate } from "@/domain/spot/coordinate";
import type { AirQualityReading, WeatherReading } from "@/domain/weather/weather";

/**
 * 날씨 조회의 경계.
 *
 * 기상청 구현과 mock 구현이 각각 이것을 만족한다. 도메인은 격자 좌표도, 발표시각도,
 * 인증키도 모른다 — 전부 구현의 사정이다.
 */
export interface WeatherRepository {
  /** 지금 이 좌표의 날씨. 실패하면 던진다 — 화면이 성립하지 않으므로 삼키지 않는다 */
  findCurrent(at: Coordinate): Promise<WeatherReading>;
}

/**
 * 미세먼지 조회의 경계.
 *
 * **실패가 화면을 죽이지 않는다.** 유스케이스가 이 실패만 삼키고 나머지를 그린다
 * (`get-today-weather.ts`). 그래서 날씨와 별개의 인터페이스로 둔다.
 */
export interface AirQualityRepository {
  findNearest(at: Coordinate): Promise<AirQualityReading | null>;
}
