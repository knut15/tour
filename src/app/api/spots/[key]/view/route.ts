import { NextResponse } from "next/server";
import { getSpotStats, recordSpotView } from "@/presentation/lib/container";
import { statsKeyOf } from "@/domain/spot/spot-stats";

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
    const name = decodeURIComponent(key);
    await recordSpotView(name, visitorId);

    /*
      기록하고 **바뀐 수를 돌려준다.** 화면이 스스로 +1 하면 틀린다 — 같은 사람의
      같은 날 두 번째 조회는 오르지 않기 때문이다. 세는 쪽만 아는 값이라 여기서 읽는다.

      읽기가 실패해도 기록은 이미 끝났다. 그때는 수 없이 200 을 돌려주고 화면은
      서버가 그린 값에 머문다.
    */
    const statsKey = statsKeyOf(name);
    const row = getSpotStats && statsKey
      ? (await getSpotStats([name]).catch(() => null))?.get(statsKey)
      : undefined;
    return NextResponse.json(row ? { likes: row.likes, views: row.views } : {});
  } catch {
    /*
      조회 기록 실패는 사용자에게 알리지 않는다. 화면에 아무 변화도 없는 일이고,
      알려 봐야 할 수 있는 일이 없다. 좋아요와 다른 점이다.
    */
    return new NextResponse(null, { status: 204 });
  }
}
