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

  /** 이미 큐에 있거나 이미 나간 장소인가 */
  async hasSpot(contentId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("ig_queue")
      .select("id")
      .eq("content_id", contentId)
      .limit(1);
    if (error) throw new Error(`큐를 조회하지 못했다: ${error.message}`);
    return (data?.length ?? 0) > 0;
  }

  /**
   * 초안을 넣는다. **`draft` 로만 들어간다** — 사람이 보고 `approved` 로 올려야
   * 발행 cron 이 집는다. 생성기가 바로 나가는 글을 만들지 않는다.
   */
  async insertDraft(draft: {
    contentId: string;
    chip: string;
    headline: string;
    pin: string;
    category: string;
    photoIds: string[];
    caption: string;
  }): Promise<number> {
    const { data, error } = await this.client
      .from("ig_queue")
      .insert({
        content_id: draft.contentId,
        chip: draft.chip,
        headline: draft.headline,
        pin: draft.pin,
        category: draft.category,
        photo_ids: draft.photoIds,
        caption: draft.caption,
        status: "draft",
      })
      .select("id")
      .single();
    if (error) throw new Error(`초안을 넣지 못했다: ${error.message}`);
    return (data as { id: number }).id;
  }

  /**
   * 큐에 이미 쓰인 제목들.
   *
   * **같은 제목이 되풀이되는 것이 이 계정의 실제 문제였다** — 실측 2026-08-31:
   * 발행된 5건 중 3건이 `닫는 시간이 / 따로 없는 곳`, 2건이 `가기 전에 / 요일부터
   * 확인` 이었다. 성격별 고정 문구가 여덟 개뿐이라 지역이 달라도 성격이 같으면
   * 같은 글자가 걸린다. 겹치는지는 **세면 알 수 있는 값**이라 코드가 답한다.
   */
  async usedHeadlines(): Promise<string[]> {
    const { data, error } = await this.client.from("ig_queue").select("headline");
    if (error) throw new Error(`제목 목록을 읽지 못했다: ${error.message}`);
    return (data as { headline: string }[] | null)?.map((r) => r.headline) ?? [];
  }

  /** 컨펌 절차가 한 줄을 집어 다시 그릴 때 쓴다 */
  async findById(id: number): Promise<QueueRow | null> {
    const { data, error } = await this.client
      .from("ig_queue")
      .select("id, content_id, chip, headline, pin, category, photo_ids, caption")
      .eq("id", id)
      .limit(1);
    if (error) throw new Error(`큐 #${id} 를 읽지 못했다: ${error.message}`);
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

  /**
   * 제목만 갈아 끼운다.
   *
   * **`draft` 만 고친다.** 이미 `approved` 인 줄은 사람이 그 제목으로 컨펌한 것이고,
   * `published` 는 나간 것이다 — 뒤에서 글자를 바꾸면 컨펌이 무의미해진다.
   */
  async updateHeadline(id: number, headline: string): Promise<boolean> {
    const { data, error } = await this.client
      .from("ig_queue")
      .update({ headline })
      .eq("id", id)
      .eq("status", "draft")
      .select("id");
    if (error) throw new Error(`제목을 바꾸지 못했다: ${error.message}`);
    return (data?.length ?? 0) > 0;
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
