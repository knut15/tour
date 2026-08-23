import { createCoordinate } from "@/domain/spot/coordinate";
import { pm10GradeOf, pm25GradeOf, worseGrade } from "@/domain/weather/air-quality";
import { DEFAULT_WEATHER_POINT } from "@/domain/weather/location";
import { adviseOutfit } from "@/domain/weather/outfit";
import { apparentTemperature } from "@/domain/weather/weather";
import type {
  AirQualityRepository,
  WeatherRepository,
} from "@/domain/weather/weather-repository";
import type { TodayWeatherInput, TodayWeatherView } from "@/application/weather/dto";

/** 소수 첫째 자리까지. 풍속 1.85 를 1.9 로 */
function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

/**
 * 오늘 날씨 한 벌을 만든다 — 기온·하늘·미세먼지·옷차림.
 *
 * **미세먼지 실패는 삼키고 날씨 실패는 던진다.** 미세먼지는 없어도 화면이
 * 성립하지만(칸 하나가 빈다), 기온이 없으면 띄울 것이 없다.
 *
 * 두 조회는 서로를 기다리지 않는다. 공급자가 다르고 응답 시간도 다르다.
 */
export function makeGetTodayWeather(weather: WeatherRepository, air: AirQualityRepository) {
  return async function getTodayWeather(
    input: TodayWeatherInput = {},
  ): Promise<TodayWeatherView> {
    const point =
      input.lng !== undefined && input.lat !== undefined
        ? (createCoordinate(input.lng, input.lat) ?? DEFAULT_WEATHER_POINT)
        : DEFAULT_WEATHER_POINT;

    const [reading, airReading] = await Promise.all([
      weather.findCurrent(point),
      air.findNearest(point).catch(() => null),
    ]);

    const pm10Grade = pm10GradeOf(airReading?.pm10 ?? null);
    const pm25Grade = pm25GradeOf(airReading?.pm25 ?? null);
    const overall = worseGrade(pm10Grade, pm25Grade);

    const feelsLike = apparentTemperature(
      reading.temperature,
      reading.humidity,
      reading.windSpeed,
    );

    return {
      sky: reading.sky,
      temperature: Math.round(reading.temperature),
      feelsLike: Math.round(feelsLike),
      low: reading.low === null ? null : Math.round(reading.low),
      high: reading.high === null ? null : Math.round(reading.high),
      humidity: reading.humidity === null ? null : Math.round(reading.humidity),
      windSpeed: reading.windSpeed === null ? null : round1(reading.windSpeed),
      observedAt: reading.observedAt,
      air: airReading
        ? {
            pm10: airReading.pm10,
            pm25: airReading.pm25,
            pm10Grade,
            pm25Grade,
            overall,
            stationName: airReading.stationName,
            observedAt: airReading.observedAt,
          }
        : null,
      /*
        옷은 **체감온도**로 고른다. 일교차는 반올림 전 값으로 재도 결과가 같으므로
        화면에 보이는 값과 같은 정수를 쓴다 — 사용자가 "12도 차이인데 왜 안 뜨지"
        하고 셈을 맞춰볼 수 있어야 한다.
      */
      outfit: adviseOutfit({
        feelsLike: Math.round(feelsLike),
        low: reading.low === null ? null : Math.round(reading.low),
        high: reading.high === null ? null : Math.round(reading.high),
        sky: reading.sky,
        dust: overall,
        windSpeed: reading.windSpeed,
      }),
    };
  };
}
