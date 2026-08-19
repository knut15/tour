import type { Locale } from "@/domain/shared/locale";
import type { Page, PageRequest } from "@/domain/shared/paging";
import type { Category } from "@/domain/spot/category";
import type { Coordinate } from "@/domain/spot/coordinate";
import type { District, DistrictCode } from "@/domain/spot/district";
import type { Spot, SpotId } from "@/domain/spot/spot";
import type { SpotDetail } from "@/domain/spot/spot-detail";

export type ListSpotsQuery = {
  locale: Locale;
  category: Category;
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
  /** 서울 자치구 목록. 이름은 로케일에 따라 다르다 */
  listDistricts(locale: Locale): Promise<District[]>;
}
