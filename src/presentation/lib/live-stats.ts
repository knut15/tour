"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * 서버가 그린 수 위에 덧씌우는 **이번 방문 동안의 최신값**.
 *
 * 좋아요와 조회는 서버 렌더 시점에 고정된다. 그래서 눌러도, 상세를 열어도 숫자는
 * 그대로였고 새로고침해야 반영됐다. 사용자에게는 **누른 것이 안 먹은 것처럼** 보인다.
 *
 * **왜 낙관적으로 올리지 않는가.** 화면이 `+1` 하면 틀릴 수 있다 — 조회는 같은 날
 * 두 번째부터 오르지 않고, 좋아요는 다른 기기에서 이미 눌러 둔 것일 수 있다. 그래서
 * 여기 들어오는 값은 전부 **서버가 세고 돌려준 총수**다. 왕복 한 번의 지연이 있지만
 * 틀린 수를 보여 주고 나중에 뒤집는 것보다 낫다.
 *
 * **왜 전역 스토어인가.** 수를 바꾸는 쪽(사진 위의 좋아요 버튼, 상세의 조회 기록)과
 * 그리는 쪽(카드 바닥의 숫자 줄)이 형제 컴포넌트라 상태를 위로 올릴 자리가 없다.
 * 목록에는 같은 장소가 여러 번 설 수도 있고, 그때 열두 개가 함께 따라와야 한다.
 *
 * **저장하지 않는다.** 새로고침하면 서버가 센 값으로 다시 시작한다 — 그것이 언제나
 * 더 정확하다. `personal-set` 이 localStorage 를 쓰는 것과 다른 점이고, 이유는
 * 저쪽이 "내가 눌렀는지"(서버가 모르는 것)를 담고 이쪽은 "몇 명이 눌렀는지"(서버가
 * 정본인 것)를 담기 때문이다.
 */
export type LiveStats = {
  readonly likes?: number;
  readonly views?: number;
};

const overrides = new Map<string, LiveStats>();
const listeners = new Set<() => void>();

/**
 * 서버가 돌려준 총수를 알린다. 같은 키를 보는 모든 화면이 따라온다.
 *
 * 부분만 넘겨도 된다 — 좋아요 응답은 좋아요 수만 알고, 조회 응답은 둘 다 안다.
 * 모르는 쪽은 이전 값을 지키고, 그것도 없으면 서버가 그린 값이 그대로 남는다.
 */
export function publishStats(key: string, next: LiveStats): void {
  const prev = overrides.get(key);
  const merged: LiveStats = {
    likes: next.likes ?? prev?.likes,
    views: next.views ?? prev?.views,
  };
  if (prev?.likes === merged.likes && prev?.views === merged.views) return;
  // 새 객체를 넣는다. 같은 객체를 고치면 스냅샷 비교가 변화를 못 본다
  overrides.set(key, merged);
  for (const l of listeners) l();
}

/**
 * 이 키에 덧씌워진 값. 아직 없으면 `null` — 부르는 쪽이 서버가 그린 값을 쓴다.
 *
 * 스냅샷으로 **저장된 객체 자체**를 돌려준다. 매번 새로 만들면 참조가 달라져
 * 무한 렌더가 된다.
 */
export function useLiveStats(key: string | null): LiveStats | null {
  const subscribe = useCallback((onChange: () => void) => {
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  const read = useCallback(() => (key ? (overrides.get(key) ?? null) : null), [key]);

  /** 서버에는 덧씌울 것이 없다. 서버가 그린 값 그대로 렌더하고 hydration 후 맞춘다 */
  const readServer = useCallback(() => null, []);

  return useSyncExternalStore(subscribe, read, readServer);
}
