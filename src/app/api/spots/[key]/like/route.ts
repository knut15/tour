import { NextResponse } from "next/server";
import { toggleSpotLike } from "@/presentation/lib/container";

/**
 * 좋아요를 켜거나 끈다.
 *
 * **누른 상태를 받지 않는다.** 저장소가 스스로 판단해 바뀐 결과를 돌려준다 —
 * 화면이 아는 상태와 저장소가 어긋날 수 있고(다른 기기에서 눌렀다면), 그때
 * 화면 말을 믿으면 수가 틀어진다.
 *
 * 키는 한글 원명이라 경로에 그대로 담기지 않는다. 인코딩된 채로 오는 것을 푼다.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  if (!toggleSpotLike) {
    return NextResponse.json({ error: "stats-disabled" }, { status: 503 });
  }

  const { key } = await params;
  let visitorId: string;
  try {
    const body = (await request.json()) as { visitorId?: unknown };
    visitorId = typeof body.visitorId === "string" ? body.visitorId : "";
  } catch {
    return NextResponse.json({ error: "bad-request" }, { status: 400 });
  }
  if (!visitorId) return NextResponse.json({ error: "bad-request" }, { status: 400 });

  try {
    const result = await toggleSpotLike(decodeURIComponent(key), visitorId);
    if (!result) return NextResponse.json({ error: "not-countable" }, { status: 400 });
    return NextResponse.json(result);
  } catch {
    // 실패를 조용히 삼키지 않는다. 화면이 눌린 상태를 되돌려 사용자가 실패를 본다
    return NextResponse.json({ error: "upstream" }, { status: 502 });
  }
}
