import { NextResponse } from "next/server";
import { CATEGORIES, type Category } from "@/domain/spot/category";
import { readCronSecret, readTourApiConfig } from "@/infrastructure/config/env";
import {
  findSpotInLocale,
  getSpotDetail,
  getTopSpotKeys,
  listSpots,
} from "@/presentation/lib/container";
import { TourApiClient } from "@/infrastructure/tourapi/tourapi-client";
import { fetchSpotPhotoIds } from "@/infrastructure/tourapi/tourapi-photo-ids";
import { isExcluded } from "@/infrastructure/instagram/excluded-spots";
import { makeIgQueueRepository } from "@/infrastructure/instagram/ig-queue-repository";
import {
  deriveTrait,
  draftCaption,
  draftHeadline,
  factLine,
  regionOf,
} from "@/application/instagram/draft-copy";

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

/** 캐러셀 상한(10)에서 커버와 정보 카드를 뺀 수 */
const MAX_PHOTOS = 8;

/**
 * 한 분류에서 몇 페이지까지 훑을지. 한 장이 20곳이니 100곳이다.
 * 그 안에 새 후보가 없으면 그 분류는 당분간 채울 것이 없다고 본다.
 */
const MAX_PAGES = 5;

function isCategory(v: string | null): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v);
}

/** 지역 이름을 핀 문구로. 주소 앞 두 마디면 시·도 + 시·군·구다 */
function pinOf(address: string | null, name: string): string {
  const sigungu = (address ?? "").split(/\s+/)[1] ?? "";
  const head = [regionOf(address), sigungu].filter(Boolean).join(" ");
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

  /*
    **카테고리를 날마다 돌린다.**

    고정해 두면 한 분류만 쌓여 피드가 한쪽으로 기운다. UTC 일수로 나누면
    부르는 쪽이 아무것도 안 해도 네 분류를 고르게 돈다 — 무작위가 아니라서
    "오늘은 무엇이 나올 차례인가" 를 미리 알 수 있고, 같은 날 두 번 불러도
    같은 분류가 나온다.

    `?category=` 를 주면 그것이 이긴다. 손으로 특정 분류를 채울 때 쓴다.
  */
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  const category: Category = isCategory(q.get("category"))
    ? (q.get("category") as Category)
    : CATEGORIES[dayIndex % CATEGORIES.length];

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

  /*
    **한 페이지가 소진되면 다음 페이지로 간다.**

    이미 큐에 있는 장소는 건너뛰므로 한 분류에서 스무 곳을 채우고 나면 1페이지에는
    남는 것이 없다. 그때 멈추면 그 분류는 영영 더 나오지 않는다.

    한 번에 다 받지 않고 필요할 때만 다음 장을 받는다 — TourAPI 개발계정 한도가
    일 1,000건이라 안 쓸 페이지를 미리 받을 이유가 없다.
  */
  if (candidates.length === 0) {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const list = await listSpots({ locale: "ko", category, page, size: 20 });
      const fresh: { contentId: string; name: string }[] = [];
      for (const item of list.items) {
        if (isExcluded(item.contentId)) continue;
        if (await queue.hasSpot(item.contentId)) continue;
        fresh.push({ contentId: item.contentId, name: item.titlePrimary });
      }
      if (fresh.length > 0) {
        candidates.push(...fresh);
        break;
      }
      if (!list.hasMore) break;
    }
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

    /*
      **영문 카탈로그를 한 번 더 받는다.** 국문 이름·주소를 영어 문단에 그대로 두면
      영어권 독자가 읽을 수 없다. 로케일마다 contentid 공간이 분리돼 있어 한글
      원명으로 다시 물어야 하고, 못 찾으면 국문 것을 그대로 쓴다.

      **영문 사실은 있을 때만 싣는다.** 영문 카탈로그에 모든 장소가 있는 것은
      아니다 — 실측 2026-08-31: 경복궁은 있고(contenttypeid 76) 경포호수광장은 없다.
      없으면 이름·주소만 남기고 그 자리를 사람이 채운다.
    */
    const englishDetail = await findSpotInLocale("en", name)
      .then((id) => (id ? getSpotDetail({ contentId: id, locale: "en" }) : null))
      .catch(() => null);
    const english = englishDetail
      ? {
          name: englishDetail.titlePrimary,
          address: englishDetail.address,
          facts: factLine(englishDetail, "en") || null,
        }
      : null;
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
      caption: draftCaption(detail, trait, tagsOf(name, detail.address, category), english),
    });

    return NextResponse.json({
      ok: true,
      queueId: id,
      contentId: candidate.contentId,
      name,
      category,
      trait,
      englishName: english?.name ?? null,
      englishFacts: english?.facts ?? null,
      photos: photoIds.length,
      note: "status=draft — 사람이 보고 approved 로 올려야 발행된다",
    });
  }

  /*
    후보를 다 훑었는데 넣을 것이 없는 것은 실패가 아니다. 이미 큐에 다 있거나
    사진이 모자란 것뿐이다.
  */
  return NextResponse.json({
    ok: true,
    skipped: "no-new-candidate",
    category,
    tried: candidates.length,
  });
}
