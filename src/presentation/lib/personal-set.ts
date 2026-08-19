"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * 브라우저에만 사는 "내가 표시한 것들" 집합.
 *
 * 담기와 좋아요가 같은 구조라 한 곳에 둔다. **로그인 없이 동작한다** —
 * 계정은 코스를 저장하는 시점에만 요구한다 (GOAL.md §3).
 *
 * 저장 키를 바꾸지 마라. 사용자가 이미 담아 둔 것이 통째로 사라진다.
 */
export type PersonalSetName = "saved" | "liked";

const KEY: Record<PersonalSetName, string> = {
  // 앱 이름이 "당신의 한국" 으로 바뀐 뒤에도 이 문자열은 그대로다 — 기존 저장분이 걸려 있다
  saved: "seoul-tour:saved",
  liked: "seoul-tour:liked",
};

const EVENT: Record<PersonalSetName, string> = {
  saved: "seoul-tour:saved-changed",
  liked: "seoul-tour:liked-changed",
};

function parse(raw: string): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}

/**
 * 집합에 이 항목이 들었는지와, 넣고 빼는 함수.
 *
 * 스냅샷으로 **원문 문자열**을 돌려준다. 매번 새 배열을 만들면 참조가 달라져
 * 무한 렌더가 된다.
 */
export function usePersonalSet(name: PersonalSetName, itemKey: string) {
  const storageKey = KEY[name];
  const eventName = EVENT[name];

  const read = useCallback((): string => {
    try {
      return window.localStorage.getItem(storageKey) ?? "";
    } catch {
      return "";
    }
  }, [storageKey]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener(eventName, onChange);
      // 다른 탭에서 바뀐 것도 따라온다
      window.addEventListener("storage", onChange);
      return () => {
        window.removeEventListener(eventName, onChange);
        window.removeEventListener("storage", onChange);
      };
    },
    [eventName],
  );

  /** 서버에는 저장소가 없다. 표시되지 않은 상태로 렌더하고 hydration 후 맞춘다 */
  const readServer = useCallback(() => "", []);

  const raw = useSyncExternalStore(subscribe, read, readServer);
  const has = useMemo(() => parse(raw).includes(itemKey), [raw, itemKey]);

  const toggle = useCallback(() => {
    const next = parse(read()).filter((k) => k !== itemKey);
    if (!has) next.push(itemKey);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // 저장 실패를 조용히 삼키지 않는다. 상태가 되돌아가 사용자가 실패를 본다
    }
    window.dispatchEvent(new Event(eventName));
  }, [eventName, has, itemKey, read, storageKey]);

  return { has, toggle };
}
