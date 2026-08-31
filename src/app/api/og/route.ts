import { NextResponse } from "next/server";
import { CATEGORIES, type Category } from "@/domain/spot/category";
import { renderCoverJpeg, type CoverTone } from "@/presentation/lib/ig-cover";
import { getSpotDetail } from "@/presentation/lib/container";
import { coverChips, coverHighlight } from "@/application/instagram/draft-copy";

/**
 * 인스타 커버를 그려 JPEG 으로 돌려준다.
 *
 * 발행 API 는 이미지를 업로드받지 않고 **공개 URL 을 직접 가져간다.** 그래서 이
 * route 가 곧 메타에게 넘길 주소다 — 파일을 어디에도 저장하지 않는다.
 *
 * ```
 * /api/og?chip=가볼 곳&headline=지도 안 켜도\n안 헤매는 골목&pin=서울 종로구&category=attraction
 * ```
 *
 * **공개해도 되는 route 다.** 우리 브랜드로 그린 그림을 돌려줄 뿐 계정에 아무것도
 * 쓰지 않는다. 발행 route(`/api/instagram/publish`)와 달리 열쇠를 요구하지 않는
 * 이유가 이것이다 — 메타 쪽 크롤러가 열쇠 없이 가져가야 하기도 하다.
 */

export const runtime = "nodejs";

/** 하루. 같은 문구면 같은 그림이라 매번 다시 그릴 이유가 없다 */
const CACHE_SECONDS = 60 * 60 * 24;

/** 한 줄이 길면 satori 가 넘치게 그린다. 자르는 대신 거절해 조용한 깨짐을 막는다 */
const MAX_LINE = 16;

function isCategory(v: string | null): v is Category {
  return !!v && (CATEGORIES as readonly string[]).includes(v);
}

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams;
  const chip = q.get("chip")?.trim() ?? "";
  const headline = q.get("headline")?.trim() ?? "";
  const pin = q.get("pin")?.trim() ?? "";
  const categoryRaw = q.get("category");
  const tone = (q.get("tone") ?? undefined) as CoverTone | undefined;
  /*
    **사진 크기를 받는다.** TourAPI 사진은 장소마다 크기가 다르다 — 실측 2026-08-31:
    북촌 940×627, 경포호수광장 940×705. 커버가 사진과 다르면 캐러셀에서 사진이
    잘리고, 공공누리 제3유형은 변경금지라 그것이 위반이다.
  */
  const width = Number(q.get("w")) || undefined;
  const height = Number(q.get("h")) || undefined;
  /*
    `photo` 는 바탕에 깔 사진의 id 다. 주면 색면 대신 사진 위에 글자를 얹고,
    크기도 사진에서 읽는다 — `w`·`h` 를 넘길 필요가 없다.

    **열린 프록시가 되지 않게 여기서도 숫자 id 만 받는다.** URL 을 그대로 받으면
    임의 주소를 대신 내려받는 발판이 된다.
  */
  const photoId = q.get("photo")?.trim();
  if (photoId && !/^\d{4,12}$/.test(photoId)) {
    return NextResponse.json({ error: "bad-photo-id" }, { status: 400 });
  }
  const photoUrl = photoId ? new URL(`/api/photo/${photoId}`, request.url).toString() : undefined;

  /*
    **사실은 `contentId` 로 직접 읽는다.** 칩에 넣을 값을 손으로 넘기면 캡션·정보
    카드와 갈린다 — 세 곳이 같은 원천에서 같은 다듬기를 거쳐야 한다.
    없으면 칩 없이 그린다.
  */
  const contentId = q.get("contentId")?.trim();
  const detail =
    contentId && /^\d{4,12}$/.test(contentId)
      ? await getSpotDetail({ contentId, locale: "ko" }).catch(() => null)
      : null;

  if (!chip || !headline || !pin) {
    return NextResponse.json({ error: "chip·headline·pin 이 모두 필요하다" }, { status: 400 });
  }

  const rows = headline.split("\n").map((l) => l.trim()).filter(Boolean);
  const tooLong = rows.find((l) => [...l].length > MAX_LINE);
  if (tooLong) {
    return NextResponse.json(
      { error: "line-too-long", detail: `한 줄은 ${MAX_LINE}자까지다: "${tooLong}"` },
      { status: 400 },
    );
  }

  try {
    const jpeg = await renderCoverJpeg({
      chip,
      headline,
      pin,
      tone,
      category: isCategory(categoryRaw) ? categoryRaw : undefined,
      width,
      height,
      photoUrl,
      chips: detail ? coverChips(detail) : undefined,
      highlight: detail ? coverHighlight(detail) : null,
    });

    return new NextResponse(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
      },
    });
  } catch (error) {
    /*
      **조용히 빈 그림을 돌려주지 않는다.** 폰트를 못 읽었거나 satori 가 거절하면
      그 사실이 드러나야 한다 — 커버가 깨진 채 발행되는 것이 최악이다.
    */
    return NextResponse.json(
      { error: "render-failed", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
