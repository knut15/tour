"use client";

import { useLinkStatus } from "next/link";

/**
 * 더보기 버튼의 글자. **누른 뒤 응답이 올 때까지 대기 상태를 보여준다.**
 *
 * 더보기는 목록을 갈아치우지 않고 아래에 덧붙이므로 스켈레톤이 뜨지 않는다.
 * 그래서 누른 직후 화면에 아무 변화가 없다 — 응답이 1초 걸리면 그 1초 동안
 * 눌린 것인지 알 수 없어 다시 누르게 된다.
 *
 * `useLinkStatus` 는 **`<Link>` 안에서만** 동작한다. 그래서 이것이 버튼이 아니라
 * 버튼 안의 글자다.
 */
export function MoreLabel({ idle, busy }: { idle: string; busy: string }) {
  const { pending } = useLinkStatus();

  return (
    <span className="inline-flex items-center gap-2">
      {pending && (
        <span
          // 세 점이 차례로 밝아진다. 스피너를 쓰지 않는다 — 이 화면에 원형 요소가 없다
          className="inline-flex gap-1"
          aria-hidden="true"
        >
          <Dot delay="0ms" />
          <Dot delay="140ms" />
          <Dot delay="280ms" />
        </span>
      )}
      {pending ? busy : idle}
    </span>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="size-1.5 rounded-full bg-current opacity-30"
      style={{ animation: `spot-dot 1s ${delay} ease-in-out infinite` }}
    />
  );
}
