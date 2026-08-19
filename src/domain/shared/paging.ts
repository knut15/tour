/** 목록 조회의 페이지 요청. 이 앱은 한 벽에 6~9개만 쓰므로 기본값이 작다 (GOAL.md §0.5-3). */
export type PageRequest = {
  page: number;
  size: number;
};

export const DEFAULT_PAGE: PageRequest = { page: 1, size: 9 };

export type Page<T> = {
  items: T[];
  page: number;
  size: number;
  /**
   * 공급자가 보고한 전체 건수.
   * 주의: TourAPI 는 이미지 필수 정렬(arrange=Q)에서도 필터 전 값을 준다.
   * 따라서 이 값으로 "다음 페이지가 있다" 를 판정하면 안 된다. hasMore 를 쓴다.
   */
  reportedTotal: number;
  hasMore: boolean;
};
