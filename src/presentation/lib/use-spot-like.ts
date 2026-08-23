"use client";

import { useCallback, useState } from "react";
import { statsKeyOf } from "@/domain/spot/spot-stats";
import { publishStats } from "@/presentation/lib/live-stats";
import { usePersonalSet } from "@/presentation/lib/personal-set";
import { visitorId } from "@/presentation/lib/visitor";

/**
 * 좋아요를 서버에 반영한다.
 *
 * **로컬과 서버가 각자 다른 것을 안다.** 로컬(`personal-set`)은 "내가 눌렀는지",
 * 서버는 "몇 명이 눌렀는지" 다. 로컬만 두면 다른 기기에서 누른 것을 모르고,
 * 서버만 두면 누를 때마다 왕복을 기다려야 눌린 표시가 난다.
 *
 * 그래서 **먼저 로컬을 뒤집고 서버에 보낸다.** 눌린 표시는 즉시 나고, 서버가
 * 거절하면 되돌린다 — 실패를 조용히 삼키면 사용자는 눌렸다고 믿는데 수는
 * 오르지 않는다.
 *
 * 셀 수 없는 장소(한글 원명이 없다)는 서버에 보내지 않는다. 로컬 표시만 남는데,
 * 그것이 "내 것" 이라는 뜻은 그대로 지켜진다.
 */
export function useSpotLike({
  spotKey,
  koreanName,
}: {
  /** 로컬 저장소의 키. 로케일별로 다르다 */
  spotKey: string;
  /** 서버 키. 로케일을 넘나든다. 없으면 서버에 보내지 않는다 */
  koreanName: string | null;
}) {
  const local = usePersonalSet("liked", spotKey);
  const [busy, setBusy] = useState(false);

  const toggle = useCallback(() => {
    // 눌린 표시는 왕복을 기다리지 않는다
    local.toggle();

    if (!koreanName || busy) return;
    const visitor = visitorId();
    if (!visitor) return;

    setBusy(true);
    void fetch(`/api/spots/${encodeURIComponent(koreanName)}/like`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ visitorId: visitor }),
    })
      .then(async (res) => {
        // 서버가 받아들이지 않았으면 눌린 표시를 되돌린다
        if (!res.ok) {
          local.toggle();
          return;
        }
        /*
          바뀐 총수를 화면에 알린다. **낙관적으로 +1 하지 않는다** — 다른 기기에서
          이미 눌러 둔 것일 수 있어 화면이 세면 틀린다. 서버가 센 값만 쓴다.
        */
        const body = (await res.json().catch(() => null)) as { likes?: unknown } | null;
        const key = statsKeyOf(koreanName);
        if (key && typeof body?.likes === "number") publishStats(key, { likes: body.likes });
      })
      .catch(() => {
        local.toggle();
      })
      .finally(() => setBusy(false));
  }, [busy, koreanName, local]);

  return { liked: local.has, toggle };
}
