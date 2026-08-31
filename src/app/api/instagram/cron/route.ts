import { NextResponse } from "next/server";
import sharp from "sharp";
import { readCronSecret, readInstagramConfig } from "@/infrastructure/config/env";
import {
  InstagramClient,
  InstagramError,
  MAX_CAROUSEL_ITEMS,
} from "@/infrastructure/instagram/instagram-client";
import { exclusionReason, isExcluded } from "@/infrastructure/instagram/excluded-spots";
import { findCaptionProblems } from "@/infrastructure/instagram/caption-rules";
import { makeIgQueueRepository } from "@/infrastructure/instagram/ig-queue-repository";
import { hasEnded } from "@/application/instagram/draft-copy";
import { getSpotDetail } from "@/presentation/lib/container";

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

/**
 * 인스타가 받는 가장 세로로 긴 비율. 4:5 다.
 *
 * **이 값과 아래 액자 계산은 `scripts/ig-cover.mjs` 에도 있다.** 그쪽이 발행 전
 * 컨펌용 커버를 그리므로, 갈리면 사람이 본 그림과 나가는 그림이 달라진다.
 */
const PORTRAIT_RATIO = 4 / 5;

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
      **발행 직전에 한 번 더 본다.** 초안이 큐에 머무는 동안 축제가 끝날 수 있다 —
      초안 생성 때 걸렀다고 발행 시점에도 유효하다는 보장이 없다.
    */
    const detail = await getSpotDetail({ contentId: row.contentId, locale: "ko" }).catch(() => null);
    if (detail && hasEnded(detail)) {
      throw new Error("이미 끝난 행사다. 큐에서 빼거나 기간을 확인하라");
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

    /*
      **액자를 4:5 세로로 고정한다.**

      인스타가 받는 가장 세로로 긴 비율이라 피드에서 차지하는 높이가 가로(1.5)의
      1.87배다 — 스크롤을 세우는 힘이 거기서 나온다.

      커버는 잘라서 채우고(`/api/og`), 나머지 사진은 여백을 덧대 자르지 않는다
      (`/api/photo`). 캐러셀은 첫 장 비율로 나머지를 자르므로 **모두 같은 액자**여야
      한다.
    */
    const boxWidth = Math.max(...sizes.map((s) => s.width));
    const boxHeight = Math.round(boxWidth / PORTRAIT_RATIO);

    const cover = new URL(`${origin}/api/og`);
    cover.searchParams.set("chip", row.chip);
    cover.searchParams.set("headline", row.headline);
    cover.searchParams.set("pin", row.pin);
    cover.searchParams.set("category", row.category);
    cover.searchParams.set("photo", row.photoIds[0]);
    /* 칩·요금은 커버가 `contentId` 로 직접 읽는다 — 캡션·정보카드와 같은 원천 */
    cover.searchParams.set("contentId", row.contentId);
    cover.searchParams.set("w", String(boxWidth));
    cover.searchParams.set("h", String(boxHeight));

    /*
      **마지막 장은 정보 카드다.** 캡션에도 같은 값이 있지만 캡션은 접혀 있고,
      사진만 넘겨 보는 사람은 열지 않는다. 저장해 두고 나중에 볼 때 그림 하나로
      끝나는 편이 낫다. 사실이 하나도 없는 장소면 404 가 오므로 그때는 뺀다.
    */
    const info = new URL(`${origin}/api/og/info`);
    info.searchParams.set("contentId", row.contentId);
    info.searchParams.set("w", String(boxWidth));
    info.searchParams.set("h", String(boxHeight));
    const hasInfo = await fetch(info, { method: "HEAD" })
      .then((r) => r.ok)
      .catch(() => false);

    /*
      **사진을 먼저 자르고 정보 카드를 붙인다.**

      다 이어 붙인 뒤 자르면 사진이 많을 때 마지막 장인 정보 카드가 밀려난다 —
      조용히 사라지므로 알아채기 어렵다. 커버와 정보 카드 자리를 먼저 빼 두고
      남는 만큼만 사진을 싣는다.
    */
    const photoSlots = MAX_CAROUSEL_ITEMS - 1 - (hasInfo ? 1 : 0);
    const images = [
      { url: cover.toString(), alt: `${row.chip} — ${row.headline.replace(/\n/g, " ")}. ${row.pin}` },
      /*
        글자를 얹은 첫 장 바로 뒤에 **손대지 않은 같은 사진**이 온다.
        공공누리 제3유형(변경금지)을 감안한 구성이다.
      */
      ...row.photoIds.slice(0, photoSlots).map((id) => ({
        url: `${origin}/api/photo/${id}?w=${boxWidth}&h=${boxHeight}`,
        alt: `${row.pin} — ${row.chip}`,
      })),
      ...(hasInfo ? [{ url: info.toString(), alt: `${row.pin} 정보 — 주소·시간·휴무` }] : []),
    ];

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
    /*
      **어느 단계에서 깨졌는지 남긴다.** `InstagramError` 는 operation 을 들고 있는데
      메시지만 남기면 큐의 last_error 를 봐도 컨테이너 생성인지 발행인지 알 수 없다 —
      실측 2026-09-01: 원인을 찾으려고 발행 흐름을 손으로 재현해야 했다.
    */
    const reason =
      error instanceof InstagramError
        ? `[${error.operation}] ${error.message}`
        : error instanceof Error
          ? error.message
          : String(error);
    await queue.markFailed(row.id, reason);
    return NextResponse.json(
      { error: "cron-publish-failed", queueId: row.id, contentId: row.contentId, detail: reason },
      { status: 500 },
    );
  }
}
