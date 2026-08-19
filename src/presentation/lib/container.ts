import type { SpotRepository } from "@/domain/spot/spot-repository";
import { makeGetSpotDetail } from "@/application/spot/get-spot-detail";
import { makeListDistricts } from "@/application/spot/list-districts";
import { makeListNearbySpots } from "@/application/spot/list-nearby-spots";
import { makeListSpots } from "@/application/spot/list-spots";
import { readTourApiConfig, isMockEnabled } from "@/infrastructure/config/env";
import { MockSpotRepository } from "@/infrastructure/tourapi/mock-spot-repository";
import { TourApiClient } from "@/infrastructure/tourapi/tourapi-client";
import { TourApiSpotRepository } from "@/infrastructure/tourapi/tourapi-spot-repository";

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
export const listDistricts = makeListDistricts(spotRepository);
