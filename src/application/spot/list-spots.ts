import { DEFAULT_PAGE } from "@/domain/shared/paging";
import { isExcludedClassification } from "@/domain/spot/category";
import { isDisplayableOnWall } from "@/domain/spot/spot";
import type { SpotRepository } from "@/domain/spot/spot-repository";
import type { ListSpotsInput, SpotListView } from "@/application/spot/dto";
import { toSpotView } from "@/application/spot/to-view";

/**
 * 카테고리·지역으로 걸어 둘 스팟을 조회한다.
 *
 * 공급자가 이미지 보유 항목을 앞으로 정렬해 주지만 그것은 **필터가 아니라 정렬**이다.
 * 따라서 도메인 판정으로 한 번 더 거른다 — 공급자 정렬 규칙이 바뀌어도 화면이 깨지지 않는다.
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 6
 */
export function makeListSpots(repo: SpotRepository) {
  return async function listSpots(input: ListSpotsInput): Promise<SpotListView> {
    const size = input.size ?? DEFAULT_PAGE.size;
    const page = input.page ?? DEFAULT_PAGE.page;

    const result = await repo.list({
      locale: input.locale,
      category: input.category,
      keyword: input.keyword,
      areaCode: input.areaCode,
      districtCode: input.districtCode,
      page: { page, size },
    });

    const displayable = result.items.filter((s) =>
      isDisplayableOnWall(s, isExcludedClassification),
    );

    return {
      items: displayable.map(toSpotView),
      page: result.page,
      size: result.size,
      hasMore: result.hasMore,
    };
  };
}
