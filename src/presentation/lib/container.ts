import type { SpotRepository } from "@/domain/spot/spot-repository";
import type { SpotStatsRepository } from "@/domain/spot/spot-stats-repository";
import type {
  AirQualityRepository,
  WeatherRepository,
} from "@/domain/weather/weather-repository";
import { makeFindSpotInLocale } from "@/application/spot/find-spot-in-locale";
import { makeGetSpotDetail } from "@/application/spot/get-spot-detail";
import { makeGetSpotStats, makeGetTopSpotKeys } from "@/application/spot/get-spot-stats";
import { makeRecordSpotView, makeToggleSpotLike } from "@/application/spot/react-to-spot";
import { makeListAreas, makeListDistricts } from "@/application/spot/list-regions";
import { makeListNearbySpots } from "@/application/spot/list-nearby-spots";
import { makeListSpots } from "@/application/spot/list-spots";
import { makeGetTodayWeather } from "@/application/weather/get-today-weather";
import {
  isMockEnabled,
  readSupabaseConfig,
  readTourApiConfig,
  readWeatherConfig,
} from "@/infrastructure/config/env";
import { AirKoreaAirQualityRepository } from "@/infrastructure/airkorea/airkorea-air-quality-repository";
import { AirKoreaClient } from "@/infrastructure/airkorea/airkorea-client";
import { MockAirQualityRepository } from "@/infrastructure/airkorea/mock-air-quality-repository";
import { KmaClient } from "@/infrastructure/kma/kma-client";
import { KmaWeatherRepository } from "@/infrastructure/kma/kma-weather-repository";
import { MockWeatherRepository } from "@/infrastructure/kma/mock-weather-repository";
import { MockSpotRepository } from "@/infrastructure/tourapi/mock-spot-repository";
import { TourApiClient } from "@/infrastructure/tourapi/tourapi-client";
import { TourApiSpotRepository } from "@/infrastructure/tourapi/tourapi-spot-repository";
import { SupabaseSpotStatsRepository } from "@/infrastructure/supabase/supabase-spot-stats-repository";

/**
 * 컴포지션 루트. **ARCH-011 의 유일한 예외 지점이다.**
 *
 * 여기서만 `infrastructure` 의 구현체를 import 해 `application` 유스케이스에 주입한다.
 * 이 파일에 조건 분기·데이터 변환·비즈니스 규칙을 두지 않는다 (mock 전환 분기 하나가 전부다).
 *
 * 만료 조건: 의존성 주입 라이브러리를 도입하거나 컴포지션 루트를 application 진입점으로
 * 옮겨 presentation 이 구현체를 몰라도 되게 정리되면 이 예외를 폐기한다.
 * 근거: .curvez/architecture.md ## 예외
 */
function createSpotRepository(): SpotRepository {
  if (isMockEnabled()) return new MockSpotRepository();
  return new TourApiSpotRepository(new TourApiClient(readTourApiConfig()));
}

const spotRepository = createSpotRepository();

export const listSpots = makeListSpots(spotRepository);
export const listNearbySpots = makeListNearbySpots(spotRepository);
export const getSpotDetail = makeGetSpotDetail(spotRepository);
export const findSpotInLocale = makeFindSpotInLocale(spotRepository);
export const listAreas = makeListAreas(spotRepository);
export const listDistricts = makeListDistricts(spotRepository);

/**
 * 날씨 조회도 같은 방식으로 조립한다.
 *
 * 기상청과 에어코리아는 **별개 공급자**라 저장소를 따로 만든다. 미세먼지가 죽어도
 * 날씨는 나와야 하고, 그 판단은 `makeGetTodayWeather` 안에 이미 있다.
 */
function createWeatherRepository(): WeatherRepository {
  if (isMockEnabled()) return new MockWeatherRepository();
  return new KmaWeatherRepository(new KmaClient(readWeatherConfig()));
}

function createAirQualityRepository(): AirQualityRepository {
  if (isMockEnabled()) return new MockAirQualityRepository();
  return new AirKoreaAirQualityRepository(new AirKoreaClient(readWeatherConfig()));
}

const weatherRepository = createWeatherRepository();
const airQualityRepository = createAirQualityRepository();

export const getTodayWeather = makeGetTodayWeather(weatherRepository, airQualityRepository);

/**
 * 반응 저장소. **키가 없으면 `null` 이다.**
 *
 * 좋아요·조회는 이 앱의 본론이 아니다. Supabase 를 아직 붙이지 않은 환경에서도
 * 장소는 보여야 하므로, 없을 때 던지지 않고 없다고 알린다. 화면은 그때 반응 줄을
 * 그리지 않는다 — 0 을 보여 주면 "아무도 안 눌렀다" 와 "셀 수 없다" 가 구분되지
 * 않는다.
 */
function createSpotStatsRepository(): SpotStatsRepository | null {
  const config = readSupabaseConfig();
  return config ? new SupabaseSpotStatsRepository(config) : null;
}

const spotStatsRepository = createSpotStatsRepository();

/** 반응을 셀 수 있는 환경인가. 화면이 줄을 그릴지 정할 때 본다 */
export const statsEnabled = spotStatsRepository !== null;

export const getSpotStats = spotStatsRepository
  ? makeGetSpotStats(spotStatsRepository)
  : null;
/** 반응이 가장 많은 장소의 키. 벽의 맨 앞을 채운다 */
export const getTopSpotKeys = spotStatsRepository
  ? makeGetTopSpotKeys(spotStatsRepository)
  : null;
export const toggleSpotLike = spotStatsRepository
  ? makeToggleSpotLike(spotStatsRepository)
  : null;
export const recordSpotView = spotStatsRepository
  ? makeRecordSpotView(spotStatsRepository)
  : null;
