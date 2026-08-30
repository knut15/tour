/**
 * 한 장소에 쌓인 반응.
 *
 * **키는 한글 원명이다.** TourAPI 는 로케일마다 `contentid` 공간이 분리돼 있어
 * (실측 2026-08-19: 국문 `2031668`("초안산")을 영문 서비스에 물으면 빈 결과),
 * `contentid` 로 세면 같은 장소가 언어 수만큼 갈라진다. 영어로 누른 좋아요가
 * 한국어 화면에서 0 이 되는 것이다. 두 카탈로그를 잇는 값은 한글 원명뿐이라
 * `spots/resolve` 도 그것으로 언어를 넘나든다.
 *
 * 따라서 **한글 원명이 없는 장소는 반응을 가질 수 없다.** 셀 자리가 없으므로
 * 화면도 그 줄을 그리지 않는다. 없는 것을 0 으로 보여 주면 "아무도 안 눌렀다" 와
 * "셀 수 없다" 가 구분되지 않는다.
 */
export type SpotStatsKey = string;

export type SpotStats = {
  readonly key: SpotStatsKey;
  readonly likes: number;
  readonly views: number;
};

/**
 * 장소에서 셀 수 있는 키를 뽑는다. 없으면 `null` 이다.
 *
 * 공백만 다른 값이 서로 다른 행이 되지 않게 다듬는다 — 공급자 응답에는 앞뒤
 * 공백과 이중 공백이 섞여 온다.
 */
export function statsKeyOf(koreanName: string | null | undefined): SpotStatsKey | null {
  const trimmed = koreanName?.replace(/\s+/g, " ").trim();
  return trimmed ? trimmed : null;
}

/** 이 방문자가 이 장소에 이미 눌렀는가까지 담은 표현 */
export type SpotStatsWithMine = SpotStats & {
  readonly liked: boolean;
};

/**
 * 목록을 세우는 기준.
 *
 * **기본은 조회다.** 좋아요는 누른 사람만 남기지만 조회는 들른 모두가 남긴다 —
 * 아직 반응이 적은 초기에는 좋아요가 대부분 0 이라 순위가 서지 않는다.
 * 무엇으로 셀지는 보는 사람이 고를 수 있게 하되, 아무것도 고르지 않았을 때
 * 더 많은 장소를 줄 세우는 쪽을 기본으로 둔다.
 */
export const STATS_SORTS = ["views", "likes"] as const;
export type StatsSort = (typeof STATS_SORTS)[number];

export const DEFAULT_STATS_SORT: StatsSort = "views";

export function isStatsSort(value: string | undefined): value is StatsSort {
  return (STATS_SORTS as readonly string[]).includes(value ?? "");
}

/** URL 의 `sort` 를 읽는다. 모르는 값이면 기본이다 */
export function parseStatsSort(raw: string | undefined): StatsSort {
  const v = raw?.trim();
  return isStatsSort(v) ? v : DEFAULT_STATS_SORT;
}
