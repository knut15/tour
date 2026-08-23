import type { SpotStatsRepository } from "@/domain/spot/spot-stats-repository";
import { statsKeyOf, type SpotStatsKey } from "@/domain/spot/spot-stats";

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
