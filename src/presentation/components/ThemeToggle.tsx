"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  THEME_COOKIE,
  THEME_COOKIE_MAX_AGE,
  type Theme,
} from "@/presentation/lib/theme";
import { CONTROL_SM } from "@/presentation/components/tds";

const EVENT = "seoul-tour:theme-changed";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** 현재 상태는 서버가 `<html data-theme>` 로 심어준 값이다 */
function getSnapshot(): string {
  return document.documentElement.dataset.theme ?? "";
}

function getServerSnapshot(): string {
  return "";
}

/**
 * 라이트/다크 전환.
 *
 * **선택값은 쿠키에 넣고 서버가 읽어 `<html data-theme>` 로 렌더한다.**
 * localStorage + 인라인 스크립트로 하면 React 트리 안에 `<script>` 가 들어가고,
 * React 가 "스크립트는 클라이언트 렌더에서 실행되지 않는다" 로 경고한다.
 * `next/script` 로 감싸도 같은 경고가 난다 — 결국 트리 안의 script 이기 때문이다.
 *
 * 쿠키 방식은 스크립트도, 깜빡임도, 하이드레이션 불일치도 없다.
 * 대가는 `cookies()` 가 라우트를 동적 렌더링으로 만든다는 것이다.
 *
 * 선택하지 않으면 쿠키가 없고 `prefers-color-scheme` 이 적용된다.
 */
export function ThemeToggle({ label }: { label: string }) {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme =
      current === "light"
        ? "dark"
        : current === "dark"
          ? "light"
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "light"
            : "dark";

    // 화면은 즉시 바꾸고, 쿠키는 다음 요청부터 서버가 읽는다
    document.documentElement.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax`;
    window.dispatchEvent(new Event(EVENT));
  }, [current]);

  return (
    <button
      type="button"
      // 바뀐 결과는 `<html data-theme>` 이 갖는다. 이 이름은 누를 자리만 가리킨다
      data-testid="theme-toggle"
      onClick={toggle}
      aria-label={label}
      // 높이는 CONTROL_SM 이 정한다. 옆의 언어 선택과 같은 높이여야 한다
      className={`${CONTROL_SM} w-9`}
    >
      <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
        {/* 반달 — 어느 쪽으로 가는지가 아니라 "빛을 바꾼다" 는 뜻만 전한다 */}
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" />
      </svg>
    </button>
  );
}
