import type { Locale } from "@/domain/shared/locale";
import type { Page, PageRequest } from "@/domain/shared/paging";
import type { Category } from "@/domain/spot/category";
import type { Coordinate } from "@/domain/spot/coordinate";
import type { Area, AreaCode, District, DistrictCode } from "@/domain/spot/region";
import type { Spot, SpotId } from "@/domain/spot/spot";
import type { SpotDetail } from "@/domain/spot/spot-detail";

export type ListSpotsQuery = {
  locale: Locale;
  category: Category;
  /** 시도. 없으면 전국이다 */
  areaCode?: AreaCode;
  /** 시군구. `areaCode` 가 없으면 지역을 식별하지 못하므로 구현이 무시한다 */
  districtCode?: DistrictCode;
  page?: PageRequest;
};

export type NearbySpotsQuery = {
  locale: Locale;
  center: Coordinate;
  /** 미터. 공급자 상한(20km)을 넘으면 구현이 잘라낸다 */
  radiusMeters: number;
  category?: Category;
  page?: PageRequest;
};

/**
 * 스팟 조회의 경계.
 *
 * 도메인은 이 인터페이스만 선언하고 구현을 모른다. TourAPI 구현과 mock 구현이
 * 각각 이것을 만족하므로 `USE_MOCK_DATA` 플래그로 갈아끼울 수 있다.
 */
export interface SpotRepository {
  list(query: ListSpotsQuery): Promise<Page<Spot>>;
  nearby(query: NearbySpotsQuery): Promise<Page<Spot>>;
  /**
   * 상세 조회. 목록보다 많은 사실을 가져오므로 공급자 호출 수가 더 든다.
   * 벽 판정(이미지 필수·의료관광 배제)을 적용하지 않는다 — 직접 링크로 들어온 스팟은 보여준다.
   */
  findDetail(id: SpotId): Promise<SpotDetail | null>;
  /** 시도 목록(17개). 이름은 로케일에 따라 다르다 */
  listAreas(locale: Locale): Promise<Area[]>;
  /** 한 시도의 시군구 목록. **시도 없이는 부를 수 없다** (region.ts) */
  listDistricts(locale: Locale, areaCode: AreaCode): Promise<District[]>;
}
