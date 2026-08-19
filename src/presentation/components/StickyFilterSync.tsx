"use client";

import { useEffect } from "react";
import { STICKY_SENTINEL } from "@/presentation/lib/sticky";

/**
 * 필터 바가 헤더 밑에 **붙었는지**를 `<html data-condensed>` 로 알린다.
 * 그 신호로 헤더가 줄어든다 (`globals.css` 의 `--masthead-h`).
 *
 * **스크롤 이벤트를 듣지 않는다.** 스크롤 리스너는 프레임마다 깨어나 위치를 재는데,
 * 여기서 알아야 할 것은 "붙었나 안 붙었나" 두 값뿐이다. 표식 하나를
 * `IntersectionObserver` 로 보면 바뀌는 순간에만 깨어난다.
 *
 * 관찰 여백을 헤더의 **줄어든 높이**로 잡는다. 늘어난 높이로 잡으면 헤더가 줄어드는
 * 순간 표식이 다시 보여 원상복귀하고, 그 둘이 서로를 부르며 깜빡인다.
 */
export function StickyFilterSync() {
  useEffect(() => {
    const sentinel = document.querySelector(`[${STICKY_SENTINEL}]`);
    if (!sentinel) return;

    const root = document.documentElement;
    const condensed = getComputedStyle(root).getPropertyValue("--masthead-h-condensed");
    const top = Number.parseInt(condensed, 10) || 52;

    const observer = new IntersectionObserver(
      ([entry]) => {
        root.dataset.condensed = String(!entry.isIntersecting);
      },
      { rootMargin: `-${top}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      // 다른 화면에는 필터 바가 없다. 줄어든 채로 넘어가지 않게 되돌린다
      delete root.dataset.condensed;
    };
  }, []);

  return null;
}
