"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "seoul-tour:theme";
const EVENT = "seoul-tour:theme-changed";

type Theme = "light" | "dark";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): string {
  return document.documentElement.dataset.theme ?? "";
}

/** 서버에는 선택값이 없다. 빈 값으로 렌더하고 hydration 후 실제 값으로 맞춘다. */
function getServerSnapshot(): string {
  return "";
}

/**
 * 라이트/다크 전환.
 *
 * **이 앱의 정체성은 크림 페이퍼다.** OS 가 다크로 설정된 사용자는 그 디자인을
 * 볼 방법이 없었다 — 전환 수단이 없으면 사실상 없는 디자인이다.
 * 선택하지 않으면 OS 설정을 따른다(`prefers-color-scheme`).
 */
export function ThemeToggle({ label }: { label: string }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const now: Theme =
      current === "light"
        ? "dark"
        : current === "dark"
          ? "light"
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "light"
            : "dark";
    document.documentElement.dataset.theme = now;
    try {
      window.localStorage.setItem(KEY, now);
    } catch {
      // 저장 실패해도 이번 세션의 전환은 유지된다
    }
    window.dispatchEvent(new Event(EVENT));
  }, [current]);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition-transform duration-200 ease-[var(--ease-signature)] hover:scale-[1.04] hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        {/* 반달 — 어느 쪽으로 가는지가 아니라 "빛을 바꾼다" 는 뜻만 전한다 */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" />
      </svg>
    </button>
  );
}

/**
 * 저장된 선택을 첫 페인트 전에 적용한다. 이 스크립트가 없으면
 * OS 가 다크인 사용자에게 다크가 잠깐 번쩍인 뒤 라이트로 바뀐다.
 */
export const THEME_INIT_SCRIPT = `try{var t=localStorage.getItem(${JSON.stringify(KEY)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t}}catch(e){}`;
