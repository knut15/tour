"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * 목록으로 들어올 때 **어디에 멈출지**를 정한다. 세 경우가 다르다.
 *
 *   상세에서 돌아옴 → 보던 자리로. 방금 누른 카드가 어디 있었는지를 잃으면
 *                     목록을 처음부터 다시 훑어야 한다
 *   그 밖(탭·지역·첫 진입) → 아무것도 하지 않는다. 다른 목록이니 맨 위에서
 *                     시작하는 편이 맞고, 그건 Next 의 기본 동작이다
 *
 * 둘을 가르는 방법은 **적어 두는 시점**이다. 상세로 나가는 링크를 누를 때만
 * 자리를 적고, 목록이 뜰 때 적힌 것이 있으면 실행한 뒤 지운다.
 *
 * 브라우저의 자동 복원에 맡기지 않는 이유는 목록이 스트리밍되기 때문이다.
 * 복원이 일어나는 시점에 카드가 아직 없어 문서가 짧으면 그 위치가 잘려 나간다.
 */
const PREFIX = "seoul-tour:list-scroll:";




/**
 * 문서가 목표 높이에 이를 때까지 기다릴 시간.
 *
 * 목록은 공급자 응답을 기다렸다 스트리밍되고 사진 높이는 그 뒤에 정해진다.
 * 3초로 뒀더니 시한이 다할 때까지 문서가 뷰포트보다 짧아, 갈 수 있는 데까지
 * 간다는 규칙이 "0 으로 간다" 와 같아졌다. 실측에서 응답이 4초를 넘겼다.
 */
const WAIT_MS = 8000;

/**
 * 목표에 닿을 때까지 기다렸다 옮긴다. **컴포넌트 밖에서 돈다.**
 *
 * effect 안에서 돌리면 주소가 바뀔 때마다 정리 함수가 루프를 끊는다. 그런데
 * 여기서 기다리는 대상이 바로 그 주소 변경의 결과(새 목록)라, 기다리기 시작하자마자
 * 취소되는 일이 실제로 일어났다 — 탭을 눌러도 계속 맨 위에 머물렀다.
 *
 * `measure` 를 매 프레임 다시 부른다. Next 는 주소를 먼저 바꾸고 화면을 나중에
 * 그리므로, 한 번만 재면 아직 없는 요소를 재고 0 을 얻는다.
 *
 * 사용자가 직접 스크롤하면 비킨다. 늦게 도착한 계산 결과가 그것을 덮으면
 * 화면이 저 혼자 움직인 것으로 보인다.
 */
function settleTo(measure: () => number, deadlineMs: number) {
  let done = false;
  const deadline = performance.now() + deadlineMs;

  const stop = () => {
    done = true;
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
    window.removeEventListener("keydown", stop);
  };
  window.addEventListener("wheel", stop, { passive: true, once: true });
  window.addEventListener("touchstart", stop, { passive: true, once: true });
  window.addEventListener("keydown", stop, { once: true });

  const tick = () => {
    if (done) return;
    const target = measure();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // 목표가 0 이면 아직 잴 수 없다는 뜻이다. "맨 위" 와 구분한다
    if (target > 0 && max >= target) {
      window.scrollTo(0, target);
      stop();
      return;
    }
    if (performance.now() >= deadline) {
      if (target > 0) window.scrollTo(0, Math.max(0, Math.min(target, max)));
      stop();
      return;
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}


export function ScrollMemory() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const key = PREFIX + pathname + (search ? `?${search}` : "");

  // 상세로 나갈 때 자리를 적어 둔다
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link) return;

      try {
        /*
          상세로 가는 링크는 지금 자리를 적는다. 카드 하나에 링크가 둘(사진·제목)
          이지만 둘 다 같은 곳을 가리키므로 어느 쪽을 눌러도 같은 값이 적힌다.
        */
        if ((link.getAttribute("href") ?? "").includes("/spots/")) {
          sessionStorage.setItem(key, String(Math.round(window.scrollY)));
        }
      } catch {
        // 사생활 모드 등 저장소를 못 쓰는 환경. 복원이 없을 뿐 목록은 그대로 뜬다
      }
    };

    // 캡처 단계다. 링크가 이동을 시작하기 전에 적어야 한다
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [key]);

  // 적힌 것이 있으면 실행한다
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(key);
      if (saved !== null) sessionStorage.removeItem(key);
    } catch {
      return;
    }
    if (saved === null) return;

    const y = Number(saved);
    if (Number.isFinite(y) && y > 0) settleTo(() => y, WAIT_MS);
  }, [key]);

  return null;
}
