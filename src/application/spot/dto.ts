import type { Locale } from "@/domain/shared/locale";
import type { Category } from "@/domain/spot/category";

/** 유스케이스 입력. presentation 이 요청 컨텍스트를 읽어 값으로 넘긴다. */
export type ListSpotsInput = {
  locale: Locale;
  category: Category;
  /** 시도. 없으면 전국 */
  areaCode?: number;
  /** 시군구. `areaCode` 와 짝이어야 의미가 있다 */
  districtCode?: number;
  page?: number;
  size?: number;
};

export type NearbySpotsInput = {
  locale: Locale;
  lng: number;
  lat: number;
  radiusMeters: number;
  category?: Category;
  page?: number;
  size?: number;
};

export type SpotDetailInput = {
  locale: Locale;
  contentId: string;
};

/** 화면이 쓰는 표현. 도메인 엔티티를 그대로 넘기지 않는다. */
export type SpotView = {
  contentId: string;
  locale: Locale;
  titlePrimary: string;
  /** 한글 원명. 영문 로케일에서도 노출한다 (GOAL.md §5-2) */
  titleKorean: string | null;
  category: Category;
  address: string | null;
  areaCode: number | null;
  districtCode: number | null;
  lng: number | null;
  lat: number | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  /** false 면 크롭 금지. 화면은 object-fit: contain 으로 그린다 */
  imageCroppable: boolean;
  tel: string | null;
};

/** 상세 화면이 줄 세울 사실 한 줄. 값이 없어도 행을 지우지 않는다 (GOAL.md §5-3). */
export type FactRow = {
  key: string;
  value: string | null;
};

export type SpotDetailView = SpotView & {
  overview: string | null;
  homepage: string | null;
  facts: FactRow[];
};

export type SpotListView = {
  items: SpotView[];
  page: number;
  size: number;
  hasMore: boolean;
};

/** 시도·시군구 공통. 코드와 이름 한 쌍이면 화면에 그리기 충분하다 */
export type RegionView = {
  code: number;
  name: string;
};
