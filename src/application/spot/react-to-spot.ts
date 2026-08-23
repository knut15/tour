import type { SpotStatsRepository } from "@/domain/spot/spot-stats-repository";
import { statsKeyOf } from "@/domain/spot/spot-stats";

/**
 * 좋아요를 켜거나 끈다.
 *
 * **눌린 상태를 받지 않는다.** 화면이 아는 상태와 저장소의 상태가 어긋날 수 있고
 * (다른 기기에서 눌렀다면), 그때 화면 말을 믿으면 수가 틀어진다. 저장소가
 * 스스로 판단해 바뀐 결과를 돌려준다.
 */
export function makeToggleSpotLike(repo: SpotStatsRepository) {
  return async function toggleSpotLike(
    koreanName: string | null | undefined,
    visitorId: string,
  ): Promise<{ likes: number; liked: boolean } | null> {
    const key = statsKeyOf(koreanName);
    if (!key || !visitorId) return null;
    return repo.toggleLike(key, visitorId);
  };
}

/** 조회를 기록한다. 같은 방문자의 같은 날 조회는 저장소가 한 번만 센다 */
export function makeRecordSpotView(repo: SpotStatsRepository) {
  return async function recordSpotView(
    koreanName: string | null | undefined,
    visitorId: string,
  ): Promise<void> {
    const key = statsKeyOf(koreanName);
    if (!key || !visitorId) return;
    await repo.recordView(key, visitorId);
  };
}
