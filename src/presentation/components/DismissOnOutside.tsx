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
      for (const d of open()) {
        // 자기 안을 누른 것은 여기서 닫지 않는다. 항목 선택은 click 이 맡는다
        if (target && d.contains(target)) continue;
        d.open = false;
      }
    }

    /**
     * 항목을 고르면 닫는다. **`pointerdown` 이 아니라 `click` 이다.**
     *
     * `pointerdown` 에서 닫으면 `<details>` 의 내용이 그 자리에서 숨겨져 링크가
     * 사라진다. 그러면 `click` 은 링크가 아니라 pointerdown/pointerup 두 대상의
     * **공통 조상**으로 가고, 링크의 기본 동작인 이동이 아예 일어나지 않는다 —
     * 눌러도 아무 일이 없다.
     *
     * `click` 시점에는 대상이 이미 링크로 확정돼 있어, 여기서 숨겨도 이동은 그대로 간다.
     */
    function onClick(e: MouseEvent) {
      const target = e.target as Node | null;
      const el = target instanceof Element ? target : target?.parentElement ?? null;
      const link = el?.closest("a");
      if (!link) return;
      for (const d of open()) {
        if (d.contains(link)) d.open = false;
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
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
