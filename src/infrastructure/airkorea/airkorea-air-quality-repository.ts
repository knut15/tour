import type { Coordinate } from "@/domain/spot/coordinate";
import type { AirQualityReading } from "@/domain/weather/weather";
import type { AirQualityRepository } from "@/domain/weather/weather-repository";
import { AirKoreaClient } from "@/infrastructure/airkorea/airkorea-client";
import { toAirQualityReading } from "@/infrastructure/airkorea/airkorea-mapper";
import { sidoNameOf } from "@/infrastructure/airkorea/airkorea-sido";

/**
 * 에어코리아로 미세먼지를 읽는다. **호출은 좌표당 한 번이다.**
 *
 * 시도별 실시간(`getCtprvnRltmMesureDnsty`)을 골랐다. 근접 측정소 경로
 * (`getNearbyMsrstnList` → `getMsrstnAcctoRltmMesureDnsty`)를 쓰지 않은 이유:
 *
 * - 근접 측정소 조회는 **TM 중부원점 좌표**를 받는다. 위경도밖에 없는 이 앱은 투영 변환을
 *   하나 더 들여야 하고, 그러고도 호출이 2회로 는다.
 * - 측정소별 실시간은 불안정했다. 연속 3회 중 1회가 `SERVICETIMEOUT_ERROR` 였다
 *   (2026-08-19 실측). 시도별 조회는 같은 시각에 전부 정상이었다.
 * - 측정소별 실시간은 `ver=1.3` 응답에 `stationName` 을 주지 않는다(1.4 이상에서 추가).
 *   어디서 잰 값인지 밝히기가 더 어려워진다.
 *
 * 대신 시도 하나의 값이므로 "가장 가까운 측정소"가 아니라 **그 시도 도시대기 측정소의
 * 중앙값**을 쓴다(`airkorea-mapper.ts`). `stationName` 에는 시도명을 넣는다 —
 * 값의 해상도가 도시 단위이므로 이름도 도시 단위로 말하는 편이 정직하다.
 */
export class AirKoreaAirQualityRepository implements AirQualityRepository {
  constructor(private readonly client: AirKoreaClient) {}

  async findNearest(at: Coordinate): Promise<AirQualityReading | null> {
    const sidoName = sidoNameOf(at);
    const items = await this.client.getCtprvnRltmMesureDnsty(sidoName);
    return toAirQualityReading(items, sidoName);
  }
}
