import { NextResponse } from "next/server";
import { recordSpotView } from "@/presentation/lib/container";

/**
 * 조회를 기록한다. 같은 방문자의 같은 날 조회는 저장소가 한 번만 센다.
 *
 * **서버 렌더에서 세지 않는다.** 그 자리에는 방문자를 가릴 값이 없어 새로고침마다
 * 오르고, 그러면 수가 사람이 아니라 새로고침을 센다. 방문자 id 를 아는 쪽은
 * 브라우저뿐이므로 화면이 떠 있을 때 한 번 부른다.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ key: string }> },
) {
  if (!recordSpotView) {
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
    await recordSpotView(decodeURIComponent(key), visitorId);
    return new NextResponse(null, { status: 204 });
  } catch {
    /*
      조회 기록 실패는 사용자에게 알리지 않는다. 화면에 아무 변화도 없는 일이고,
      알려 봐야 할 수 있는 일이 없다. 좋아요와 다른 점이다.
    */
    return new NextResponse(null, { status: 204 });
  }
}
