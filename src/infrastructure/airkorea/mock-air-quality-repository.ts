import type { Coordinate } from "@/domain/spot/coordinate";
import type { AirQualityReading } from "@/domain/weather/weather";
import type { AirQualityRepository } from "@/domain/weather/weather-repository";

/**
 * 키 없이 화면과 CI 를 돌리기 위한 구현.
 *
 * 값은 고정이다. 2026-08-19 19시 서울 도시대기 25곳의 실측 중앙값
 * (PM10 36 / PM2.5 26 ㎍/㎥)을 옮겼다. 도메인 등급으로는 둘 다 `moderate` 라
 * 마스크 권고가 붙지 않는 평범한 날이 된다 — 기본 화면이 경고로 시작하지 않는다.
 */
export class MockAirQualityRepository implements AirQualityRepository {
  async findNearest(_at: Coordinate): Promise<AirQualityReading | null> {
    void _at;
    return {
      pm10: 36,
      pm25: 26,
      stationName: "서울",
      observedAt: "2026-08-19T19:00:00+09:00",
    };
  }
}
