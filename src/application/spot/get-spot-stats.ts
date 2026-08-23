import type { SpotStatsRepository } from "@/domain/spot/spot-stats-repository";
import { statsKeyOf, type SpotStatsKey, type StatsSort } from "@/domain/spot/spot-stats";

/** 화면이 쓰는 표현. 없는 장소는 아예 항목이 없다 */
export type SpotStatsView = {
  likes: number;
  views: number;
  liked: boolean;
};

/**
 * 여러 장소의 반응을 **한 번에** 가져온다.
 *
 * 목록 한 화면에 열두 장이 서므로 카드마다 부르면 열두 번이 된다. 부르는 쪽이
 * 한글 원명 목록을 넘기고, 셀 수 없는 것(원명이 없는 장소)은 여기서 걸러진다.
 *
 * `visitorId` 가 없으면 "내가 눌렀는지" 는 전부 거짓이다. 서버 렌더에는 그 값이
 * 없을 수 있고, 그때도 총수는 보여 줘야 한다.
 */
export function makeGetSpotStats(repo: SpotStatsRepository) {
  return async function getSpotStats(
    koreanNames: readonly (string | null | undefined)[],
    visitorId?: string,
  ): Promise<Map<SpotStatsKey, SpotStatsView>> {
    const keys = [...new Set(koreanNames.map(statsKeyOf).filter((k): k is SpotStatsKey => k !== null))];
    const out = new Map<SpotStatsKey, SpotStatsView>();
    if (keys.length === 0) return out;

    const [counts, liked] = await Promise.all([
      repo.findMany(keys),
      visitorId ? repo.findLikedBy(visitorId, keys) : Promise.resolve(new Set<SpotStatsKey>()),
    ]);

    for (const key of keys) {
      const row = counts.get(key);
      /*
        아직 아무도 누르지 않은 장소는 저장소에 행이 없다. 그것을 0 으로 채워
        돌려준다 — 여기서는 "셀 수 있는데 아직 0" 이 맞다. 셀 수 없는 경우는
        위에서 이미 걸러졌다.
      */
      out.set(key, {
        likes: row?.likes ?? 0,
        views: row?.views ?? 0,
        liked: liked.has(key),
      });
    }
    return out;
  };
}

/**
 * 반응이 가장 많은 장소의 키. **많은 순서 그대로다.**
 *
 * 이 목록을 어디에 쓸지는 화면이 정한다 — 지금은 벽의 맨 앞을 채우는 데 쓴다.
 * 여기서 스팟을 가져오지 않고 키만 돌려주는 이유는, 그 키로 다시 공급자를 부르면
 * 로케일마다 검색이 한 번씩 더 들기 때문이다(개발계정 한도는 일 1,000건이다).
 * **이미 받아 둔 목록 안에서 자리를 바꾸는 것**이라 추가 호출이 없다.
 */
export function makeGetTopSpotKeys(repo: SpotStatsRepository) {
  return async function getTopSpotKeys(
    limit: number,
    sort: StatsSort,
  ): Promise<SpotStatsKey[]> {
    return repo.findTopKeys(limit, sort);
  };
}
