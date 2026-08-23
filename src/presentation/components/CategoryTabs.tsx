"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";

export type Tab = {
  key: string;
  label: string;
  href: string;
};

/**
 * 탭 목록과 **미끄러지는 밑줄** 하나.
 *
 * 밑줄을 탭마다 하나씩 두면 이동이 아니라 교체가 되어 깜빡인다. 줄은 하나만 두고
 * 그것의 위치와 폭을 옮긴다.
 *
 * **JS 가 없어도 현재 위치는 보인다.** 서버가 활성 탭에 정적 밑줄을 그려 두고,
 * 이 컴포넌트가 붙어 실제로 위치를 잰 뒤에야 그것을 끄고 미끄러지는 줄로 넘긴다
 * (`data-slider="on"`). 순서가 반대면 하이드레이션 전에 밑줄이 사라진다.
 *
 * 상태를 두지 않고 ref 로 직접 스타일을 쓴다. 위치는 렌더 결과가 아니라 렌더된
 * 뒤에야 알 수 있는 값이라, state 로 만들면 매 전환마다 렌더가 한 번 더 돈다.
 *
 * 강조색(`--tab-accent`)은 **상속으로** 받는다. 이 컴포넌트가 그 값을 정하면
 * 옆에 선 다른 컨트롤이 같은 색을 쓸 수 없다 — 색은 바 전체의 성질이다.
 */
/**
 * 필터 줄이 헤더 바로 밑에 붙는 스크롤 위치로 **지금 당장** 옮긴다.
 *
 * 이동한 **뒤**에 맞추려 하면 안 된다. 새 목록이 도착하기 전에는 문서가 짧아
 * 그 자리가 잘리고, 도착을 기다렸다 옮기면 화면이 한 박자 늦게 저 혼자 움직인다.
 * 떠나기 전 지금 화면에서 옮겨 두면 링크는 그 자리에서 출발한다 — `scroll={false}`
 * 가 도착 후 되감는 것을 막아 준다.
 *
 * 표식(`data-sticky-sentinel`)이 필터 줄 바로 위에 놓여 있어 그 문서상 위치가
 * 곧 경계다. 헤더는 줄어들 수 있으므로 **줄어들지 않는 기준값**을 쓴다 —
 * 줄어든 높이로 계산하면 도착 직후 헤더가 펴지며 그만큼 어긋난다.
 *
 * 부드럽게 굴리지 않는다. 이동과 겹치면 목적지에 닿기 전에 화면이 갈린다.
 */
function alignToFilters() {
  const sentinel = document.querySelector("[data-sticky-sentinel]");
  if (!sentinel) return;
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--masthead-h-base");
  const headerHeight = Number.parseFloat(raw) || 0;
  const y = sentinel.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({ top: Math.max(0, y), behavior: "instant" });
}

export function CategoryTabs({
  tabs,
  current,
  groupLabel,
}: {
  tabs: Tab[];
  current: string;
  groupLabel: string;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const settled = useRef(false);

  useLayoutEffect(() => {
    const list = listRef.current;
    const bar = barRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !bar || !active) return;

    const move = () => {
      const l = list.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      bar.style.transform = `translateX(${a.left - l.left}px)`;
      bar.style.width = `${a.width}px`;
    };

    if (!settled.current) {
      /*
        첫 배치는 애니메이션하지 않는다. 안 그러면 화면이 뜰 때마다 줄이 왼쪽 끝에서
        현재 탭까지 달려온다 — 아무도 탭을 누르지 않았는데.
      */
      bar.style.transition = "none";
      move();
      void bar.offsetWidth; // 위 값을 확정시킨 뒤 전환을 되살린다
      bar.style.transition = "";
      list.dataset.slider = "on";
      settled.current = true;
      return;
    }
    move();
  }, [current]);

  // 폰트가 늦게 뜨거나 창이 바뀌면 탭 폭이 달라진다. 줄도 따라가야 한다
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const observer = new ResizeObserver(() => {
      const bar = barRef.current;
      const active = list.querySelector<HTMLElement>('[aria-current="page"]');
      if (!bar || !active) return;
      const l = list.getBoundingClientRect();
      const a = active.getBoundingClientRect();
      bar.style.transform = `translateX(${a.left - l.left}px)`;
      bar.style.width = `${a.width}px`;
    });
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label={groupLabel}>
      <ul
        ref={listRef}
        className="tab-list relative flex flex-wrap items-center gap-x-8 border-b border-line sm:gap-x-9"
      >
        {tabs.map((tab) => {
          const active = tab.key === current;
          return (
            <li key={tab.key}>
              <Link
                href={tab.href}
                /*
                  다른 목록으로 가는 것이라 머리말까지 되감을 필요는 없지만,
                  맨 위로 보내면 그 머리말을 다시 지나쳐야 목록에 닿는다.
                  이 줄이 헤더에 붙은 자리에서 새 목록이 시작한다.
                */
                scroll={false}
                onClick={alignToFilters}
                aria-current={active ? "page" : undefined}
                className={
                  "tab-link inline-block pb-3.5 -mb-px border-b text-[15px] " +
                  "transition-colors duration-200 ease-[var(--ease-signature)] " +
                  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus " +
                  (active
                    ? "border-[var(--tab-accent,var(--ink-primary))] font-semibold " +
                      "text-[var(--tab-accent,var(--ink-primary))]"
                    : "border-transparent text-muted hover:text-ink")
                }
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
        <span ref={barRef} className="tab-indicator" aria-hidden="true" />
      </ul>
    </nav>
  );
}
