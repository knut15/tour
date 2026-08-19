import type { Coordinate } from "@/domain/spot/coordinate";
import type { WeatherReading } from "@/domain/weather/weather";
import type { WeatherRepository } from "@/domain/weather/weather-repository";
import { latestNcstBase, latestVilageBase } from "@/infrastructure/kma/kma-base-time";
import { KmaClient, KmaError } from "@/infrastructure/kma/kma-client";
import { isInsideGrid, toGrid } from "@/infrastructure/kma/kma-grid";
import { toWeatherReading } from "@/infrastructure/kma/kma-mapper";

/**
 * 단기예보 응답 행 수.
 *
 * 응답은 카테고리 × 예보시각으로 곱해져 한 회차가 1,000행을 넘는다(실측 totalCount 1052).
 * 우리가 읽는 것은 **오늘치**뿐이다. 02시 회차가 가장 긴데 그때도 오늘분은 21시간 ×
 * 12카테고리 ≈ 252행이라 500행이면 오늘이 통째로 들어온다. 페이지를 더 넘기지 않는다.
 */
const FCST_ROWS = 500;

/** 초단기실황은 한 회차가 8행(T1H·RN1·UUU·VVV·REH·PTY·VEC·WSD)이다. */
const NCST_ROWS = 10;

/**
 * 기상청 단기예보 API 로 날씨를 읽는다.
 *
 * **호출은 좌표당 두 번이다.**
 *   1. 초단기실황 — 지금 기온·습도·풍속·강수형태
 *   2. 단기예보   — 하늘상태와 오늘 최저·최고
 * 실황에는 하늘상태(SKY)가 없고 예보에는 지금 관측값이 없다. 어느 하나로는 화면이
 * 채워지지 않아서 둘을 부른다. 그 이상은 부르지 않는다 — 개발계정 한도가 있다.
 *
 * 두 호출은 서로를 기다리지 않는다.
 */
export class KmaWeatherRepository implements WeatherRepository {
  constructor(private readonly client: KmaClient) {}

  async findCurrent(at: Coordinate): Promise<WeatherReading> {
    const grid = toGrid(at.lng, at.lat);
    if (!isInsideGrid(grid)) {
      // 격자 밖은 기상청이 서비스하지 않는다. 확실히 실패할 요청에 타임아웃을 쓰지 않는다.
      throw new KmaError(
        `기상청 격자 밖 좌표다 (lng=${at.lng}, lat=${at.lat})`,
        null,
        "toGrid",
      );
    }

    const now = new Date();
    const ncstBase = latestNcstBase(now);
    const fcstBase = latestVilageBase(now);

    const [ncst, fcst] = await Promise.all([
      this.client.getUltraSrtNcst({
        numOfRows: NCST_ROWS,
        pageNo: 1,
        base_date: ncstBase.baseDate,
        base_time: ncstBase.baseTime,
        nx: grid.nx,
        ny: grid.ny,
      }),
      this.client.getVilageFcst({
        numOfRows: FCST_ROWS,
        pageNo: 1,
        base_date: fcstBase.baseDate,
        base_time: fcstBase.baseTime,
        nx: grid.nx,
        ny: grid.ny,
      }),
    ]);

    const reading = toWeatherReading({ ncst, fcst, now });
    if (reading === null) {
      throw new KmaError(
        `기상청 응답에 기온(T1H)이 없다 (nx=${grid.nx}, ny=${grid.ny}, base=${ncstBase.baseDate} ${ncstBase.baseTime})`,
        null,
        "getUltraSrtNcst",
      );
    }
    return reading;
  }
}
