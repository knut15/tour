import { NextResponse } from "next/server";
import { readCronSecret, readInstagramConfig } from "@/infrastructure/config/env";
import { InstagramClient, MAX_CAROUSEL_ITEMS } from "@/infrastructure/instagram/instagram-client";
import { exclusionReason, isExcluded } from "@/infrastructure/instagram/excluded-spots";

/**
 * 캐러셀 한 건을 실제로 발행한다.
 *
 * **부르면 게시물이 올라간다. 되돌릴 수 없다.** 그래서 두 겹으로 막는다 —
 * `CRON_SECRET` 이 없으면 route 자체가 503 이고, 있어도 헤더가 맞아야 한다.
 * 값이 없을 때 통과시키는 기본값을 두지 않는다.
 *
 * 이미지는 **공개 URL** 이어야 한다. 사진은 `/api/photo/[id]` 가 HTTPS 로 중계하고,
 * 커버는 지금 `public/ig/` 의 정적 파일이다 — 커버 자동 생성은 다음 증분이다.
 */

/** 이 route 는 외부 API 를 부르므로 Node 런타임에서 돈다 */
export const runtime = "nodejs";
/** 발행은 절대 캐시되면 안 된다 */
export const dynamic = "force-dynamic";
/**
 * 장마다 컨테이너가 준비되기를 기다리므로 기본 제한(10초)으로는 모자란다.
 * 5장이면 대개 20~40초다.
 */
export const maxDuration = 300;

type PublishBody = {
  images?: { url?: unknown; alt?: unknown }[];
  caption?: unknown;
  /**
   * 어느 장소인지. **넘기면 제외 목록과 대조한다.**
   *
   * 없어도 발행되지만 그때는 걸러 낼 방법이 없다. 초안 생성기는 늘 채운다.
   */
  contentId?: unknown;
};

export async function POST(request: Request) {
  const secret = readCronSecret();
  if (!secret) {
    return NextResponse.json({ error: "publish-disabled" }, { status: 503 });
  }
  /*
    Vercel Cron 은 `Authorization: Bearer <CRON_SECRET>` 을 붙인다.
    손으로 부를 때도 같은 헤더를 쓴다 — 경로를 하나로 둔다.
  */
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const config = readInstagramConfig();
  if (!config) {
    return NextResponse.json({ error: "instagram-not-configured" }, { status: 503 });
  }

  let body: PublishBody;
  try {
    body = (await request.json()) as PublishBody;
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }

  /*
    **한 번 내린 장소는 다시 올리지 않는다.** 이유는 `excluded-spots.ts` 에 남아 있다.
  */
  const contentId = typeof body.contentId === "string" ? body.contentId.trim() : "";
  if (isExcluded(contentId)) {
    return NextResponse.json(
      { error: "excluded-spot", contentId, detail: exclusionReason(contentId) },
      { status: 409 },
    );
  }

  const caption = typeof body.caption === "string" ? body.caption.trim() : "";
  const images = (body.images ?? [])
    .map((i) => ({
      url: typeof i?.url === "string" ? i.url.trim() : "",
      alt: typeof i?.alt === "string" ? i.alt.trim() : undefined,
    }))
    .filter((i) => i.url.startsWith("https://"));

  if (images.length < 2 || images.length > MAX_CAROUSEL_ITEMS) {
    return NextResponse.json(
      { error: "bad-images", detail: `2~${MAX_CAROUSEL_ITEMS}장이어야 한다 (받은 값 ${images.length})` },
      { status: 400 },
    );
  }
  if (!caption) {
    return NextResponse.json({ error: "bad-caption" }, { status: 400 });
  }

  const client = new InstagramClient(config);

  /*
    한도를 **부르기 전에** 확인한다. 문서가 앱이 직접 지키라고 요구하고, 넘긴 뒤
    거절당하면 이미 만든 컨테이너가 고아로 남는다(24시간 뒤 만료되긴 한다).
  */
  const quota = await client.quotaUsage();
  if (quota && quota.used >= quota.total) {
    return NextResponse.json({ error: "quota-exceeded", quota }, { status: 429 });
  }

  try {
    const result = await client.publishCarousel(images, caption);
    return NextResponse.json({
      ok: true,
      mediaId: result.mediaId,
      contentId: contentId || null,
      images: images.length,
      quotaBefore: quota,
    });
  } catch (error) {
    /*
      실패를 조용히 넘기지 않는다. 어느 단계에서 깨졌는지가 다음 조치를 정한다 —
      `createImageItem` 이면 이미지 URL 문제이고, `publish` 면 계정·한도 문제다.
    */
    const detail =
      error instanceof Error
        ? { message: error.message, operation: (error as { operation?: string }).operation }
        : { message: String(error) };
    return NextResponse.json({ error: "publish-failed", detail }, { status: 502 });
  }
}
