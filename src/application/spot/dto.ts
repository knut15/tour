import type { Locale } from "@/domain/shared/locale";
import type { Category } from "@/domain/spot/category";

/** 유스케이스 입력. presentation 이 요청 컨텍스트를 읽어 값으로 넘긴다. */
export type ListSpotsInput = {
  locale: Locale;
  category: Category;
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

export type DistrictView = {
  code: number;
  name: string;
};
