"use client";

import { useEffect } from "react";

/**
 * 열린 드롭다운을 **바깥을 누르거나 Esc 를 누르면 닫는다.**
 *
 * `<details>` 는 이 동작을 갖고 있지 않다. 한 번 열면 다시 summary 를 눌러야만
 * 닫히는데, 그건 이 컨트롤이 드롭다운처럼 생겼기 때문에 아무도 기대하지 않는
 * 동작이다. 열어 둔 채 다른 곳을 누르면 목록이 화면에 그대로 남아 뒤를 가린다.
 *
 * 안에서 **항목을 고른 경우에도 닫는다.** 고르면 목록이 다시 조회되는데,
 * 드롭다운이 덮고 있으면 바뀐 결과가 보이지 않는다.
 *
 * **대상은 `data-dismissable` 이 붙은 `<details>` 뿐이다.** 문서의 모든
 * `<details>` 를 건드리면 나중에 누가 본문 접기용으로 쓴 것까지 멋대로 닫힌다.
 *
 * JS 가 없으면 이 동작만 빠지고 `<details>` 자체는 그대로 열리고 닫힌다.
 * 라우트 전체에 한 번만 얹는다 — 드롭다운마다 리스너를 달면 화면에 있는
 * 개수만큼 document 리스너가 생긴다.
 */
export function DismissOnOutside() {
  useEffect(() => {
    const open = () =>
      document.querySelectorAll<HTMLDetailsElement>("details[data-dismissable][open]");

    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node | null;
      const el = target instanceof Element ? target : target?.parentElement ?? null;
      const link = el?.closest("a");

      for (const d of open()) {
        if (target && d.contains(target)) {
          /*
            안쪽을 눌렀다. 링크를 눌렀으면 **고른 것**이므로 닫는다 —
            고르면 목록이 다시 조회되는데 드롭다운이 덮고 있으면
            바뀐 결과가 보이지 않는다.

            링크가 아닌 안쪽 클릭(summary 토글, 여백)은 그대로 둔다.
          */
          if (link && d.contains(link)) d.open = false;
          continue;
        }
        d.open = false;
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      for (const d of open()) {
        d.open = false;
        // 포커스를 열었던 자리로 돌려준다. 안 그러면 body 로 떨어져
        // 키보드 사용자가 방금 있던 위치를 잃는다
        d.querySelector("summary")?.focus();
      }
    }

    // capture 로 받는다. 안쪽에서 stopPropagation 하는 요소가 생겨도 닫힘이 죽지 않는다
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
