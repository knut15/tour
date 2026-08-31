import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * 발행 큐 저장소.
 *
 * **service role 키로 붙는다.** `ig_queue` 는 정책을 하나도 두지 않아 공개 키로는
 * 아무 줄도 보이지 않는다 — 큐에는 아직 안 나간 글이 들어 있고 그것이 브라우저에
 * 보일 이유가 없다.
 */

export type QueueRow = {
  id: number;
  contentId: string;
  chip: string;
  headline: string;
  pin: string;
  category: string;
  photoIds: string[];
  caption: string;
};

type Raw = {
  id: number;
  content_id: string;
  chip: string;
  headline: string;
  pin: string;
  category: string;
  photo_ids: string[];
  caption: string;
};

export class IgQueueRepository {
  private readonly client: SupabaseClient;

  constructor(url: string, secretKey: string) {
    this.client = createClient(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  /**
   * 지금 나갈 수 있는 것 중 가장 오래된 하나.
   *
   * **한 번에 하나만 꺼낸다.** 밀린 것을 몰아서 올리면 계정이 한 시각에 여러 건을
   * 쏟아낸다. 밀렸으면 다음 cron 이 이어 받으면 된다.
   */
  async takeNext(now: Date): Promise<QueueRow | null> {
    const { data, error } = await this.client
      .from("ig_queue")
      .select("id, content_id, chip, headline, pin, category, photo_ids, caption")
      .eq("status", "approved")
      .or(`scheduled_for.is.null,scheduled_for.lte.${now.toISOString()}`)
      .order("scheduled_for", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: true })
      .limit(1);

    if (error) throw new Error(`큐를 읽지 못했다: ${error.message}`);
    const row = (data as Raw[] | null)?.[0];
    if (!row) return null;

    return {
      id: row.id,
      contentId: row.content_id,
      chip: row.chip,
      headline: row.headline,
      pin: row.pin,
      category: row.category,
      photoIds: row.photo_ids,
      caption: row.caption,
    };
  }

  async markPublished(id: number, mediaId: string): Promise<void> {
    const { error } = await this.client
      .from("ig_queue")
      .update({ status: "published", media_id: mediaId, published_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw new Error(`발행 기록을 남기지 못했다: ${error.message}`);
  }

  /**
   * 실패를 남긴다. **`draft` 로 되돌리지 않는다** — 자동으로 다시 시도하면
   * 같은 이유로 계속 실패하거나, 최악의 경우 두 번 올라간다. 사람이 보고 정한다.
   */
  async markFailed(id: number, reason: string): Promise<void> {
    await this.client
      .from("ig_queue")
      .update({ status: "failed", last_error: reason.slice(0, 500) })
      .eq("id", id);
  }
}

/** 설정이 없으면 `null`. cron 이 그것을 보고 조용히 넘어간다 */
export function makeIgQueueRepository(): IgQueueRepository | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) return null;
  return new IgQueueRepository(url, secret);
}
