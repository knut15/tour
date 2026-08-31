import { NextResponse } from "next/server";
import { CATEGORIES, type Category } from "@/domain/spot/category";
import { readCronSecret, readTourApiConfig } from "@/infrastructure/config/env";
import { getSpotDetail, getTopSpotKeys, listSpots } from "@/presentation/lib/container";
import { TourApiClient } from "@/infrastructure/tourapi/tourapi-client";
import { fetchSpotPhotoIds } from "@/infrastructure/tourapi/tourapi-photo-ids";
import { isExcluded } from "@/infrastructure/instagram/excluded-spots";
import { makeIgQueueRepository } from "@/infrastructure/instagram/ig-queue-repository";
import { deriveTrait, draftCaption, draftHeadline } from "@/application/instagram/draft-copy";

/**
 * 다음에 올릴 후보를 골라 **초안으로** 큐에 넣는다.
 *
 * **발행하지 않는다.** 나온 것은 `status = 'draft'` 이고, 사람이 보고 고친 뒤
 * `approved` 로 올려야 발행 cron 이 집는다. 생성기와 발행기를 나눈 이유는 나간 뒤
 * 캡션도 사진도 고칠 수 없기 때문이다(실측 2026-08-31).
 *
 * 소재를 고르는 순서:
 * 1. **이번 주 많이 본 곳** — 앱 사용자가 고른 것을 옮긴다. 우리가 고르는 것이 아니다
 * 2. 그것이 없거나 이미 큐에 있으면 카테고리 목록에서 채운다
 *
 * 문구는 사실에서 고른다 — `draft-copy.ts` 를 보라. 모델을 부르지 않는다.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/** 캐러셀 상한(10)에서 커버 한 장을 뺀 수 */
const MAX_PHOTOS = 9;

function isCategory(v: string | null): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v);
}

/** 지역 이름을 핀 문구로. 주소 앞 두 마디면 시·도 + 시·군·구다 */
function pinOf(address: string | null, name: string): string {
  const head = (address ?? "").split(/\s+/).slice(0, 2).join(" ").trim();
  return head ? `${head} · ${name}` : name;
}

/** 해시태그. 장소 이름과 지역에서 만든다 — 새 낱말을 지어내지 않는다 */
function tagsOf(name: string, address: string | null, category: Category): string[] {
  const region = (address ?? "").split(/\s+/)[1]?.replace(/[^가-힣]/g, "") ?? "";
  const base = name.replace(/[^가-힣A-Za-z0-9]/g, "");
  const byCategory: Record<Category, string> = {
    attraction: "가볼곳",
    culture: "문화",
    food: "먹을곳",
    festival: "축제",
  };
  return [base, region && `${region}여행`, byCategory[category], "VisitKorea", "headlandtravel"]
    .filter((t): t is string => !!t)
    .slice(0, 8);
}

export async function GET(request: Request) {
  const secret = readCronSecret();
  if (!secret) return NextResponse.json({ error: "draft-disabled" }, { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const queue = makeIgQueueRepository();
  if (!queue) return NextResponse.json({ ok: true, skipped: "queue-not-configured" });

  const q = new URL(request.url).searchParams;
  const category: Category = isCategory(q.get("category")) ? (q.get("category") as Category) : "attraction";

  /*
    **후보를 고른다.** 이번 주 많이 본 곳이 먼저다 — 앱 사용자가 고른 것을 옮기는
    것이 이 계정의 논지이고, 우리가 고르면 그 논지가 사라진다.
  */
  const candidates: { contentId: string; name: string }[] = [];

  if (getTopSpotKeys) {
    const topKeys = await getTopSpotKeys(20, "views").catch(() => []);
    for (const key of topKeys) {
      const page = await listSpots({ locale: "ko", category, keyword: key }).catch(() => null);
      const hit = page?.items.find((s) => s.titlePrimary === key || s.titleKorean === key);
      if (hit) candidates.push({ contentId: hit.contentId, name: hit.titlePrimary });
    }
  }

  if (candidates.length === 0) {
    const page = await listSpots({ locale: "ko", category, page: 1, size: 20 });
    candidates.push(...page.items.map((s) => ({ contentId: s.contentId, name: s.titlePrimary })));
  }

  const client = new TourApiClient(readTourApiConfig());

  for (const candidate of candidates) {
    if (isExcluded(candidate.contentId)) continue;
    if (await queue.hasSpot(candidate.contentId)) continue;

    const detail = await getSpotDetail({ contentId: candidate.contentId, locale: "ko" }).catch(
      () => null,
    );
    if (!detail) continue;

    const photoIds = await fetchSpotPhotoIds(client, candidate.contentId, MAX_PHOTOS).catch(
      () => [],
    );
    /*
      **사진이 두 장 미만이면 건너뛴다.** 캐러셀은 커버까지 두 장이 최소이고,
      한 장짜리 장소는 보여 줄 것이 부족해 글이 얇아진다.
    */
    if (photoIds.length < 2) continue;

    const trait = deriveTrait(detail, category);
    const name = detail.titlePrimary;
    const chip = { attraction: "가볼 곳", culture: "문화", food: "먹을 곳", festival: "지금 열리는" }[
      category
    ];

    const id = await queue.insertDraft({
      contentId: candidate.contentId,
      chip,
      headline: draftHeadline(trait),
      pin: pinOf(detail.address, name),
      category,
      photoIds,
      caption: draftCaption(detail, trait, tagsOf(name, detail.address, category)),
    });

    return NextResponse.json({
      ok: true,
      queueId: id,
      contentId: candidate.contentId,
      name,
      trait,
      photos: photoIds.length,
      note: "status=draft — 사람이 보고 approved 로 올려야 발행된다",
    });
  }

  /*
    후보를 다 훑었는데 넣을 것이 없는 것은 실패가 아니다. 이미 큐에 다 있거나
    사진이 모자란 것뿐이다.
  */
  return NextResponse.json({ ok: true, skipped: "no-new-candidate", tried: candidates.length });
}
