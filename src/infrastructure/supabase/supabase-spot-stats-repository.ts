import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { SpotStatsRepository } from "@/domain/spot/spot-stats-repository";
import type { SpotStats, SpotStatsKey, StatsSort } from "@/domain/spot/spot-stats";
import type { SupabaseConfig } from "@/infrastructure/config/env";

/**
 * Supabase 에 쌓는 반응.
 *
 * **세는 일은 전부 서버 함수(`toggle_spot_like` · `record_spot_view`)가 한다.**
 * 여기서 읽고 더해서 쓰면 두 사람이 같은 순간에 누를 때 하나가 사라진다.
 * 이 클래스는 그 함수를 부르고 결과를 도메인 모양으로 옮길 뿐이다.
 *
 * **읽기는 실패해도 던지지 않는다.** 반응 수는 이 앱의 본론이 아니다 — 저장소가
 * 답을 못 했다고 장소 목록까지 못 보게 만들지 않는다. 빈 결과를 돌려주면
 * 화면이 그 줄을 그리지 않는다. 쓰기는 던진다. 누른 것이 반영되지 않았다면
 * 부르는 쪽이 그 사실을 알아야 한다.
 */
export class SupabaseSpotStatsRepository implements SpotStatsRepository {
  private readonly client: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.publishableKey, {
      // 서버에서만 쓴다. 세션을 붙들 이유가 없다
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  async findMany(keys: readonly SpotStatsKey[]): Promise<Map<SpotStatsKey, SpotStats>> {
    const out = new Map<SpotStatsKey, SpotStats>();
    if (keys.length === 0) return out;

    const { data, error } = await this.client
      .from("spot_stats")
      .select("key, like_count, view_count")
      .in("key", [...keys]);

    if (error || !data) return out;

    for (const row of data) {
      out.set(row.key, { key: row.key, likes: row.like_count, views: row.view_count });
    }
    return out;
  }

  async findTopKeys(limit: number, sort: StatsSort): Promise<SpotStatsKey[]> {
    if (limit <= 0) return [];

    /*
      **정렬을 두 번 건다.** 고른 것이 먼저이고 같으면 나머지로 가른다.
      가중합(`like_count * n + view_count`)으로 한 줄에 세우려면 계산 컬럼이
      필요해 마이그레이션을 다시 돌려야 하고, 그 가중치는 어디서 왔는지 설명할 수
      없는 숫자가 된다.
    */
    const first = sort === "likes" ? "like_count" : "view_count";
    const second = sort === "likes" ? "view_count" : "like_count";

    const { data, error } = await this.client
      .from("spot_stats")
      .select("key")
      .order(first, { ascending: false })
      .order(second, { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((row) => row.key as SpotStatsKey);
  }

  async findLikedBy(
    visitorId: string,
    keys: readonly SpotStatsKey[],
  ): Promise<Set<SpotStatsKey>> {
    const out = new Set<SpotStatsKey>();
    if (keys.length === 0 || !visitorId) return out;

    const { data, error } = await this.client
      .from("spot_like")
      .select("key")
      .eq("visitor_id", visitorId)
      .in("key", [...keys]);

    if (error || !data) return out;

    for (const row of data) out.add(row.key);
    return out;
  }

  async toggleLike(
    key: SpotStatsKey,
    visitorId: string,
  ): Promise<{ likes: number; liked: boolean }> {
    const { data, error } = await this.client
      .rpc("toggle_spot_like", { p_key: key, p_visitor: visitorId })
      .single<{ like_count: number; liked: boolean }>();

    if (error || !data) {
      throw new Error(`좋아요를 반영하지 못했다: ${error?.message ?? "빈 응답"}`);
    }
    return { likes: data.like_count, liked: data.liked };
  }

  async recordView(key: SpotStatsKey, visitorId: string): Promise<void> {
    const { error } = await this.client.rpc("record_spot_view", {
      p_key: key,
      p_visitor: visitorId,
    });
    if (error) throw new Error(`조회를 기록하지 못했다: ${error.message}`);
  }
}
