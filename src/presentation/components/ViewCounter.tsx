"use client";

import { useEffect } from "react";
import { visitorId } from "@/presentation/lib/visitor";

/**
 * 이 장소를 봤다고 한 번 알린다.
 *
 * **서버 렌더에서 세지 않는다.** 그 자리에는 방문자를 가릴 값이 없어 새로고침마다
 * 오르고, 그러면 수가 사람이 아니라 새로고침을 센다. 방문자 id 를 아는 쪽은
 * 브라우저뿐이라 화면이 떠 있을 때 부른다. 같은 사람의 같은 날 조회를 한 번으로
 * 묶는 것은 서버가 맡는다 (`record_spot_view`).
 *
 * 아무것도 그리지 않는다. 실패해도 알리지 않는다 — 화면에 변화가 없는 일이고
 * 알려 봐야 사용자가 할 수 있는 일이 없다.
 */
export function ViewCounter({ koreanName }: { koreanName: string | null }) {
  useEffect(() => {
    if (!koreanName) return;
    const visitor = visitorId();
    if (!visitor) return;

    /*
      떠나도 끝까지 보낸다. 상세를 열자마자 뒤로 가면 보통의 요청은 취소되는데,
      그것도 본 것은 본 것이다. `keepalive` 가 그 요청을 살려 둔다.
    */
    void fetch(`/api/spots/${encodeURIComponent(koreanName)}/view`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId: visitor }),
      keepalive: true,
    }).catch(() => {});
  }, [koreanName]);

  return null;
}
