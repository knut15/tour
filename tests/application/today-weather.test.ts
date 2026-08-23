import { describe, expect, it } from "vitest";
import type { Coordinate } from "@/domain/spot/coordinate";
import { DEFAULT_WEATHER_POINT } from "@/domain/weather/location";
import type { AirQualityReading, WeatherReading } from "@/domain/weather/weather";
import type {
  AirQualityRepository,
  WeatherRepository,
} from "@/domain/weather/weather-repository";
import { makeGetTodayWeather } from "@/application/weather/get-today-weather";

function reading(over: Partial<WeatherReading> = {}): WeatherReading {
  return {
    temperature: 27.4,
    low: 24,
    high: 30,
    sky: "clear",
    humidity: 64,
    windSpeed: 1.2,
    observedAt: "2026-08-19T19:00:00+09:00",
    ...over,
  };
}

class FakeWeatherRepo implements WeatherRepository {
  lastPoint: Coordinate | null = null;
  constructor(private readonly value: WeatherReading | Error) {}
  async findCurrent(at: Coordinate): Promise<WeatherReading> {
    this.lastPoint = at;
    if (this.value instanceof Error) throw this.value;
    return this.value;
  }
}

class FakeAirRepo implements AirQualityRepository {
  constructor(private readonly value: AirQualityReading | null | Error) {}
  async findNearest(_at: Coordinate): Promise<AirQualityReading | null> {
    void _at;
    if (this.value instanceof Error) throw this.value;
    return this.value;
  }
}

const AIR: AirQualityReading = {
  pm10: 36,
  pm25: 26,
  stationName: "서울",
  observedAt: "2026-08-19T19:00:00+09:00",
};

describe("getTodayWeather", () => {
  it("날씨와 미세먼지를 한 벌로 묶는다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(reading()),
      new FakeAirRepo(AIR),
    );
    const view = await getTodayWeather();

    expect(view.temperature).toBe(27);
    expect(view.feelsLike).toBe(29); // 열지수 28.96 → 29
    expect(view.sky).toBe("clear");
    expect(view.air).toEqual({
      pm10: 36,
      pm25: 26,
      pm10Grade: "moderate",
      pm25Grade: "moderate",
      overall: "moderate",
      stationName: "서울",
      observedAt: "2026-08-19T19:00:00+09:00",
    });
    expect(view.outfit.layer).toBe("sleeveless");
  });

  it("**미세먼지 조회가 던져도 날씨는 나온다** — 칸 하나만 빈다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(reading()),
      new FakeAirRepo(new Error("에어코리아 게이트웨이가 응답하지 않았다")),
    );
    const view = await getTodayWeather();

    expect(view.air).toBeNull();
    expect(view.temperature).toBe(27);
    expect(view.outfit.extras).not.toContain("mask");
  });

  it("미세먼지가 null 이어도 마찬가지다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(reading()),
      new FakeAirRepo(null),
    );
    expect((await getTodayWeather()).air).toBeNull();
  });

  it("날씨 조회가 던지면 전체가 던진다 — 기온이 없으면 띄울 것이 없다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(new Error("기상청 getUltraSrtNcst: 일일 트래픽 한도를 넘었다")),
      new FakeAirRepo(AIR),
    );
    await expect(getTodayWeather()).rejects.toThrow("일일 트래픽 한도");
  });

  it("미세먼지가 나쁘면 마스크가 붙는다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(reading()),
      new FakeAirRepo({ ...AIR, pm10: 90, pm25: 26 }),
    );
    const view = await getTodayWeather();
    expect(view.air?.overall).toBe("bad");
    expect(view.outfit.extras).toContain("mask");
  });

  it("좌표를 주지 않으면 기본 지점을 쓴다", async () => {
    const repo = new FakeWeatherRepo(reading());
    await makeGetTodayWeather(repo, new FakeAirRepo(AIR))();
    expect(repo.lastPoint).toEqual(DEFAULT_WEATHER_POINT);
  });

  it("잘못된 좌표는 기본 지점으로 떨어진다", async () => {
    const repo = new FakeWeatherRepo(reading());
    await makeGetTodayWeather(repo, new FakeAirRepo(AIR))({ lng: 999, lat: 999 });
    expect(repo.lastPoint).toEqual(DEFAULT_WEATHER_POINT);
  });

  it("숫자는 여기서 이미 반올림해 둔다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(reading({ temperature: 12.6, humidity: 64.4, windSpeed: 1.85 })),
      new FakeAirRepo(null),
    );
    const view = await getTodayWeather();
    expect(view.temperature).toBe(13);
    expect(view.humidity).toBe(64);
    expect(view.windSpeed).toBe(1.9);
  });

  it("최저·최고가 없어도 그린다", async () => {
    const getTodayWeather = makeGetTodayWeather(
      new FakeWeatherRepo(reading({ low: null, high: null })),
      new FakeAirRepo(null),
    );
    const view = await getTodayWeather();
    expect(view.low).toBeNull();
    expect(view.high).toBeNull();
    expect(view.outfit.extras).not.toContain("extra-layer");
  });
});
