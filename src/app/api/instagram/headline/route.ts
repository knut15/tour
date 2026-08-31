import { NextResponse } from "next/server";
import { readCronSecret } from "@/infrastructure/config/env";
import { makeIgQueueRepository } from "@/infrastructure/instagram/ig-queue-repository";
import { writeCoverHeadline } from "@/infrastructure/claude/cover-headline";
import { factLine } from "@/application/instagram/draft-copy";
import { getSpotDetail } from "@/presentation/lib/container";

/**
 * 큐에 있는 초안의 커버 제목을 **소개글에서 다시 짓는다.**
 *
 * 초안 생성기가 이미 한 번 짓지만(`/api/instagram/draft`), 나온 두 줄이 마음에 안
 * 들면 다시 뽑을 수단이 있어야 한다 — 커버는 나간 뒤 못 고치므로 **컨펌 전에 몇 번이든
 * 다시 그리는 것**이 이 절차의 값이다.
 *
 * ```
 * /api/instagram/headline?id=16
 * ```
 *
 * `draft` 인 줄만 고친다. `approved` 는 사람이 그 제목으로 컨펌한 것이다.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** 모델이 생각하는 시간이 있어 기본 제한으로는 모자란다 */
export const maxDuration = 120;

export async function GET(request: Request) {
  const secret = readCronSecret();
  if (!secret) return NextResponse.json({ error: "headline-disabled" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "bad-id" }, { status: 400 });
  }

  const queue = makeIgQueueRepository();
  if (!queue) return NextResponse.json({ error: "queue-not-configured" }, { status: 503 });

  const row = await queue.findById(id);
  if (!row) return NextResponse.json({ error: "not-found", id }, { status: 404 });

  const detail = await getSpotDetail({ contentId: row.contentId, locale: "ko" }).catch(() => null);
  if (!detail) {
    return NextResponse.json({ error: "detail-not-found", contentId: row.contentId }, { status: 404 });
  }

  const written = await writeCoverHeadline({
    /* 핀은 `전남 장흥군 · 탐진강` 이라 뒷마디가 장소 이름이다 */
    name: row.pin.split(" · ").at(-1) ?? row.pin,
    chip: row.chip,
    overview: detail.overview,
    facts: factLine(detail, "ko") || null,
  });

  if (!written) {
    /*
      **조용히 예전 제목을 두지 않는다.** 다시 지으라고 부른 것이므로 안 된 사실이
      드러나야 한다 — 커버를 다시 그렸는데 글자가 그대로면 원인을 못 찾는다.
    */
    return NextResponse.json({ error: "headline-failed", id }, { status: 502 });
  }

  const updated = await queue.updateHeadline(id, written);
  if (!updated) {
    return NextResponse.json({ error: "not-draft", id, headline: written }, { status: 409 });
  }

  return NextResponse.json({ ok: true, id, before: row.headline, headline: written });
}
