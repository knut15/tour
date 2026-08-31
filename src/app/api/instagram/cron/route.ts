import { NextResponse } from "next/server";
import sharp from "sharp";
import { readCronSecret, readInstagramConfig } from "@/infrastructure/config/env";
import { InstagramClient, MAX_CAROUSEL_ITEMS } from "@/infrastructure/instagram/instagram-client";
import { exclusionReason, isExcluded } from "@/infrastructure/instagram/excluded-spots";
import { findCaptionProblems } from "@/infrastructure/instagram/caption-rules";
import { makeIgQueueRepository } from "@/infrastructure/instagram/ig-queue-repository";

/**
 * 정해진 시각에 큐의 다음 한 건을 발행한다.
 *
 * **판단이 없다.** 무엇을 어떤 문구로 올릴지는 사람이 미리 큐에 넣어 두었고
 * (`status = 'approved'`), 이 route 는 그것을 그대로 실행한다. 상태 코드가 답할 수
 * 있는 질문에 모델을 쓰지 않는다.
 *
 * 하는 일은 셋뿐이다.
 * 1. 큐에서 나갈 차례인 한 건을 꺼낸다
 * 2. **사진 크기를 재서 가장 세로로 긴 것에 액자를 맞춘다** — 그래야 어느 장도
 *    잘리지 않는다. 캐러셀은 첫 장 비율로 나머지를 자른다
 * 3. 커버(사진 + 글자) 한 장과 원본 사진들을 묶어 발행하고 결과를 큐에 남긴다
 *
 * 일정은 `vercel.json` 이 갖는다. **인스타 API 에 예약 발행이 없어서** 언제 부를지는
 * 부르는 쪽이 정해야 한다.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** 사진을 재고 컨테이너를 기다리므로 기본 제한으로는 모자란다 */
export const maxDuration = 300;

/** 큐가 비었을 때 돌려주는 이유들. 실패와 구분한다 */
type Skipped = { ok: true; skipped: string };

export async function GET(request: Request) {
  const secret = readCronSecret();
  if (!secret) return NextResponse.json({ error: "cron-disabled" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const config = readInstagramConfig();
  if (!config) return NextResponse.json({ error: "instagram-not-configured" }, { status: 503 });

  const queue = makeIgQueueRepository();
  if (!queue) {
    return NextResponse.json<Skipped>({ ok: true, skipped: "queue-not-configured" });
  }

  const row = await queue.takeNext(new Date());
  if (!row) {
    /*
      **큐가 빈 것은 실패가 아니다.** 200 으로 돌려줘야 cron 실패 알림이 울리지
      않는다. 대신 무엇 때문에 아무것도 안 했는지는 남긴다.
    */
    return NextResponse.json<Skipped>({ ok: true, skipped: "queue-empty" });
  }

  const origin = new URL(request.url).origin;

  try {
    if (isExcluded(row.contentId)) {
      throw new Error(`제외된 장소다: ${exclusionReason(row.contentId) ?? row.contentId}`);
    }
    const problems = findCaptionProblems(row.caption);
    if (problems.length > 0) {
      throw new Error(`캡션 규약 위반: ${problems.map((p) => p.why).join(", ")}`);
    }

    /*
      **액자 크기를 사진에서 정한다.** 같은 장소 안에서도 크기가 다르다 —
      실측 2026-08-31, 서울거리예술축제 8장이 940×627 / 940×625 / 940×529 로 갈렸다.
      가장 세로로 긴 것에 맞추면 어느 장도 잘리지 않고, 짧은 장은 여백이 붙는다.
    */
    const sizes = await Promise.all(
      row.photoIds.map(async (id) => {
        const res = await fetch(`${origin}/api/photo/${id}`);
        if (!res.ok) throw new Error(`사진 ${id} 을 받지 못했다: HTTP ${res.status}`);
        const meta = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
        if (!meta.width || !meta.height) throw new Error(`사진 ${id} 의 크기를 읽지 못했다`);
        return { id, width: meta.width, height: meta.height };
      }),
    );

    const boxWidth = Math.max(...sizes.map((s) => s.width));
    const boxHeight = Math.max(...sizes.map((s) => s.height));

    const cover = new URL(`${origin}/api/og`);
    cover.searchParams.set("chip", row.chip);
    cover.searchParams.set("headline", row.headline);
    cover.searchParams.set("pin", row.pin);
    cover.searchParams.set("category", row.category);
    cover.searchParams.set("photo", row.photoIds[0]);
    cover.searchParams.set("w", String(boxWidth));
    cover.searchParams.set("h", String(boxHeight));

    const images = [
      { url: cover.toString(), alt: `${row.chip} — ${row.headline.replace(/\n/g, " ")}. ${row.pin}` },
      /*
        글자를 얹은 첫 장 바로 뒤에 **손대지 않은 같은 사진**이 온다.
        공공누리 제3유형(변경금지)을 감안한 구성이다.
      */
      ...row.photoIds.map((id) => ({
        url: `${origin}/api/photo/${id}?w=${boxWidth}&h=${boxHeight}`,
        alt: `${row.pin} — ${row.chip}`,
      })),
    ].slice(0, MAX_CAROUSEL_ITEMS);

    const client = new InstagramClient(config);
    const quota = await client.quotaUsage();
    if (quota && quota.used >= quota.total) {
      /*
        한도는 실패가 아니라 **미룸**이다. 큐를 건드리지 않고 그대로 두면 다음
        cron 이 같은 줄을 다시 집는다.
      */
      return NextResponse.json<Skipped>({ ok: true, skipped: "quota-exceeded" });
    }

    const result = await client.publishCarousel(images, row.caption);
    await queue.markPublished(row.id, result.mediaId);

    return NextResponse.json({
      ok: true,
      queueId: row.id,
      contentId: row.contentId,
      mediaId: result.mediaId,
      images: images.length,
      box: `${boxWidth}x${boxHeight}`,
    });
  } catch (error) {
    /*
      **크게 실패한다.** 실패를 200 으로 덮으면 다음 주에도 아무것도 안 올라간
      것을 아무도 모른다. 큐에도 이유를 남기고, 자동으로 다시 시도하지 않는다 —
      같은 이유로 계속 실패하거나 최악의 경우 두 번 올라간다.
    */
    const reason = error instanceof Error ? error.message : String(error);
    await queue.markFailed(row.id, reason);
    return NextResponse.json(
      { error: "cron-publish-failed", queueId: row.id, contentId: row.contentId, detail: reason },
      { status: 500 },
    );
  }
}
