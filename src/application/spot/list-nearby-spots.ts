import { DEFAULT_PAGE } from "@/domain/shared/paging";
import { isExcludedClassification } from "@/domain/spot/category";
import { clampRadius, createCoordinate, distanceMeters } from "@/domain/spot/coordinate";
import { isDisplayableOnWall } from "@/domain/spot/spot";
import type { SpotRepository } from "@/domain/spot/spot-repository";
import type { NearbySpotsInput, SpotListView } from "@/application/spot/dto";
import { toSpotView } from "@/application/spot/to-view";

export class InvalidCoordinateError extends Error {
  constructor() {
    super("좌표가 유효하지 않다");
    this.name = "InvalidCoordinateError";
  }
}

/**
 * 지정 좌표 반경 내 스팟을 가까운 순으로 조회한다.
 *
 * 공급자의 반경 상한은 20km 이며 서울 전역(동서 약 30km)을 한 번에 덮지 못한다.
 * 근거: .curvez/research/tourapi-endpoints.md 사실 5
 */
export function makeListNearbySpots(repo: SpotRepository) {
  return async function listNearbySpots(input: NearbySpotsInput): Promise<SpotListView> {
    const center = createCoordinate(input.lng, input.lat);
    if (!center) throw new InvalidCoordinateError();

    const result = await repo.nearby({
      locale: input.locale,
      center,
      radiusMeters: clampRadius(input.radiusMeters),
      category: input.category,
      page: { page: input.page ?? DEFAULT_PAGE.page, size: input.size ?? DEFAULT_PAGE.size },
    });

    const displayable = result.items
      .filter((s) => isDisplayableOnWall(s, isExcludedClassification))
      .sort((a, b) => {
        if (!a.coordinate) return 1;
        if (!b.coordinate) return -1;
        return distanceMeters(center, a.coordinate) - distanceMeters(center, b.coordinate);
      });

    return {
      items: displayable.map(toSpotView),
      page: result.page,
      size: result.size,
      hasMore: result.hasMore,
    };
  };
}
