import { NextResponse } from "next/server";
import { getSpotDetail } from "@/presentation/lib/container";
import { renderInfoJpeg, type InfoRow } from "@/presentation/lib/ig-cover";
import { infoRows } from "@/application/instagram/draft-copy";

/**
 * 캐러셀 마지막 장 — 주소·시간·휴무를 한 판에 세운 정보 카드.
 *
 * ```
 * /api/og/info?contentId=126508&w=940&h=705
 * ```
 *
 * **값을 넘겨받지 않고 `contentId` 로 직접 읽는다.** 캡션과 같은 원천에서 같은
 * 다듬기를 거쳐야 두 곳의 값이 갈리지 않는다 — 손으로 넘기면 언젠가 어긋난다.
 *
 * 커버와 마찬가지로 열쇠를 요구하지 않는다. 공개 데이터를 그린 그림이고,
 * 메타 쪽 크롤러가 열쇠 없이 가져가야 하기도 하다.
 */

export const runtime = "nodejs";

const CACHE_SECONDS = 60 * 60 * 24;

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const contentId = q.get("contentId")?.trim() ?? "";
  const width = Number(q.get("w")) || 940;
  const height = Number(q.get("h")) || 627;

  if (!/^\d{4,12}$/.test(contentId)) {
    return NextResponse.json({ error: "bad-contentId" }, { status: 400 });
  }

  const detail = await getSpotDetail({ contentId, locale: "ko" }).catch(() => null);
  if (!detail) return NextResponse.json({ error: "spot-not-found" }, { status: 404 });

  const rows: InfoRow[] = infoRows(detail);
  if (rows.length === 0) {
    /*
      **빈 판을 그리지 않는다.** 값이 하나도 없으면 이름만 큼직한 카드가 나오는데,
      그것은 정보가 아니라 빈 자리다. 부르는 쪽이 이 장을 빼면 된다.
    */
    return NextResponse.json({ error: "no-facts" }, { status: 404 });
  }

  try {
    const jpeg = await renderInfoJpeg({ title: detail.titlePrimary, rows, width, height });
    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "render-failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
