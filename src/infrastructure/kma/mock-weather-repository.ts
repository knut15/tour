import type { Coordinate } from "@/domain/spot/coordinate";
import type { WeatherReading } from "@/domain/weather/weather";
import type { WeatherRepository } from "@/domain/weather/weather-repository";

/**
 * 키 없이 화면과 CI 를 돌리기 위한 구현. `USE_MOCK_DATA` 로만 갈린다.
 *
 * **값을 고정한다.** 시각이나 난수로 흔들면 스냅샷과 시각 회귀 테스트가 날마다 다른
 * 결과를 낸다. 대신 그럴듯한 값을 고른다 — 2026-08-19 19시 서울시청 실측
 * (기온 27.4℃, 습도 64%, 풍속 1.2m/s, 하늘 맑음)을 그대로 옮긴 것이다.
 * 최저·최고는 같은 회차의 다음날 예보값(24.0 / 30.0)을 빌렸다.
 */
export class MockWeatherRepository implements WeatherRepository {
  async findCurrent(_at: Coordinate): Promise<WeatherReading> {
    void _at;
    return {
      temperature: 27.4,
      low: 24,
      high: 30,
      sky: "clear",
      humidity: 64,
      windSpeed: 1.2,
      observedAt: "2026-08-19T19:00:00+09:00",
    };
  }
}
