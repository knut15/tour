import { NextResponse } from "next/server";
import { readCronSecret, readInstagramConfig } from "@/infrastructure/config/env";

/**
 * 장기 토큰을 갱신한다.
 *
 * **무인 운영이 죽는 1순위 원인이 여기다.** 장기 토큰은 60일이고, 그 안에 갱신하지
 * 않으면 만료되어 **되살릴 수 없다** — 인가부터 손으로 다시 해야 한다. 주 1회
 * 부르면 여유가 충분하다.
 *
 * **갱신한 값을 저장하지는 못한다.** 환경 변수는 배포 시점에 굳으므로 이 route 는
 * 새 토큰을 응답에 담아 돌려줄 뿐이다. 실제로 갈아 끼우는 일은 사람이 하거나,
 * 나중에 토큰을 Supabase 로 옮기면 그때 자동이 된다.
 *
 * 그래서 지금 이 route 의 값어치는 **만료가 다가온 것을 알아채는 것**이다.
 * 조용히 죽는 대신 남은 날짜를 응답으로 남긴다.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 이 아래로 남으면 갈아 끼울 때가 된 것이다 */
const WARN_DAYS = 14;

export async function GET(request: Request) {
  const secret = readCronSecret();
  if (!secret) {
    return NextResponse.json({ error: "refresh-disabled" }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const config = readInstagramConfig();
  if (!config) {
    return NextResponse.json({ error: "instagram-not-configured" }, { status: 503 });
  }

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", config.accessToken);

  const res = await fetch(url);
  const json = (await res.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: { message?: string };
  };

  if (!res.ok || !json.access_token) {
    /*
      **크게 실패한다.** 갱신 실패를 200 으로 덮으면 60일 뒤 발행이 통째로 멈출
      때까지 아무도 모른다.
    */
    return NextResponse.json(
      { error: "refresh-failed", detail: json.error?.message ?? "알 수 없는 실패" },
      { status: 502 },
    );
  }

  const days = Math.round((json.expires_in ?? 0) / 86400);
  return NextResponse.json({
    ok: true,
    expiresInDays: days,
    needsRotation: days < WARN_DAYS,
    /*
      새 토큰의 **앞 12자만** 남긴다. 로그·모니터링에 전문이 남으면 그 자체가
      유출 경로다. 갈아 끼울 때는 이 route 를 직접 불러 전문을 받는다.
      갱신은 기존 토큰의 수명을 늘리는 것이므로, 값을 안 바꿔도 만료일은 밀린다.
    */
    tokenPrefix: json.access_token.slice(0, 12),
  });
}
