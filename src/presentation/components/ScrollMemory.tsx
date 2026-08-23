"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * 목록에서 상세로 들어갔다 돌아오면 **보던 자리로 되돌린다.**
 *
 * 탭이나 지역을 바꾸는 것은 다른 목록으로 가는 것이라 맨 위에서 시작하는 편이
 * 맞다. 그건 Next 의 기본 동작이므로 건드리지 않는다. 여기서 되살리는 것은
 * **같은 목록으로 돌아오는 경우 하나**다 — 방금 누른 카드가 어디 있었는지를
 * 잃으면 목록을 처음부터 다시 훑어야 한다.
 *
 * 둘을 가르는 방법은 **적어 두는 시점**이다. 상세로 나가는 링크를 누를 때만
 * 자리를 적고, 목록이 뜰 때 적힌 것이 있으면 그리로 간 뒤 지운다. 탭 전환은
 * 아무것도 적지 않으므로 복원할 것도 없다.
 *
 * 브라우저의 자동 복원에 맡기지 않는 이유는 목록이 스트리밍되기 때문이다.
 * 복원이 일어나는 시점에 카드가 아직 없어 문서가 짧으면 그 위치가 잘려 나간다.
 */
const PREFIX = "seoul-tour:list-scroll:";

/** 문서가 목표 높이에 이를 때까지 기다릴 시간. 사진이 뒤늦게 뜨며 높이가 자란다 */
const WAIT_MS = 3000;

export function ScrollMemory() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const key = PREFIX + pathname + (search ? `?${search}` : "");

  // 상세로 나갈 때 자리를 적어 둔다
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;
      /*
        상세로 가는 링크만 본다. 카드 하나에 링크가 둘(사진·제목)이지만 둘 다
        같은 곳을 가리키므로 어느 쪽을 눌러도 같은 값이 적힌다.
      */
      if (!(link.getAttribute("href") ?? "").includes("/spots/")) return;
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {
        // 사생활 모드 등 저장소를 못 쓰는 환경. 복원이 없을 뿐 목록은 그대로 뜬다
      }
    };

    // 캡처 단계다. 링크가 이동을 시작하기 전에 적어야 한다
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [key]);

  // 돌아왔으면 그 자리로
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(key);
      if (saved !== null) sessionStorage.removeItem(key);
    } catch {
      return;
    }
    if (saved === null) return;

    const target = Number(saved);
    if (!Number.isFinite(target) || target <= 0) return;

    /*
      **문서가 그 자리를 담을 만큼 길어질 때까지 기다린다.** 목록은 스트리밍으로
      오고 사진 높이는 로드된 뒤에야 정해지므로, 지금 당장 옮기면 브라우저가
      문서 끝으로 잘라 버린다.

      기다리다 시간이 다하면 갈 수 있는 만큼만 간다. 아무 데도 안 가는 것보다는
      목록 끝이라도 보여 주는 편이 "방금 보던 근처" 에 가깝다.
    */
    let cancelled = false;
    const deadline = performance.now() + WAIT_MS;

    const tick = () => {
      if (cancelled) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max >= target) {
        window.scrollTo(0, target);
        return;
      }
      if (performance.now() >= deadline) {
        window.scrollTo(0, Math.max(0, max));
        return;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      cancelled = true;
    };
  }, [key]);

  return null;
}
