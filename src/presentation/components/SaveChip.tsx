"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  TDS_BUTTON,
  TDS_BUTTON_PRIMARY,
  TDS_BUTTON_WEAK,
} from "@/presentation/components/tds";

const KEY = "seoul-tour:saved";
const EVENT = "seoul-tour:saved-changed";

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** 스냅샷은 원문 문자열이다. 매번 새 배열을 반환하면 무한 렌더가 된다. */
function getSnapshot(): string {
  try {
    return window.localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** 서버에는 저장소가 없다. 담기지 않은 상태로 렌더하고 hydration 후 실제 값으로 맞춘다. */
function getServerSnapshot(): string {
  return "";
}

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
 * 담기/빼기. **로그인 없이 동작한다** — 계정은 코스를 저장하는 시점에만 요구한다 (GOAL.md §3).
 *
 * `spotKey` 에 로케일을 포함한다. 국문과 영문의 contentid 공간이 분리돼 있어
 * 로케일을 빼면 서로 다른 스팟이 같은 키를 갖는다.
 */
export function SaveChip({
  spotKey,
  labelSave,
  labelSaved,
  title,
  variant = "chip",
}: {
  spotKey: string;
  labelSave: string;
  labelSaved: string;
  title: string;
  /** chip = 액자 모서리의 작은 표식 / inline = 상세 화면 액션 바의 라벨 버튼 */
  variant?: "chip" | "inline";
}) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const saved = useMemo(() => parse(raw).includes(spotKey), [raw, spotKey]);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      // 상위 액자 링크로 전파되면 담기 대신 상세로 이동해 버린다
      e.preventDefault();
      e.stopPropagation();
      const list = parse(getSnapshot()).filter((k) => k !== spotKey);
      if (!saved) list.push(spotKey);
      try {
        window.localStorage.setItem(KEY, JSON.stringify(list));
        window.dispatchEvent(new Event(EVENT));
      } catch {
        // 저장 실패를 조용히 삼키지 않는다. 상태가 되돌아가 사용자가 실패를 본다
        window.dispatchEvent(new Event(EVENT));
      }
    },
    [saved, spotKey],
  );

  const shape =
    variant === "chip"
      ? // 이미지 위에 얹는 글래스 필. z-10 이라야 카드 전체를 덮는 오버레이 링크보다 위에 온다
        "absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full backdrop-blur-md"
      : // 상세 화면의 주 액션은 TDS xlarge 기하를 따른다
        TDS_BUTTON + " gap-2";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      // 아이콘 전용일 때만 라벨이 필요하다. inline 은 텍스트를 갖고 있어 중복 지정하지 않는다
      aria-label={variant === "chip" ? `${saved ? labelSaved : labelSave}: ${title}` : undefined}
      className={
        shape + " " +
        "transition-transform duration-200 ease-[var(--ease-signature)] hover:scale-[1.02] active:scale-[0.96] " +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
        (variant === "inline"
          ? saved
            ? TDS_BUTTON_WEAK
            : TDS_BUTTON_PRIMARY
          : saved
            ? "bg-primary text-on-primary"
            : "bg-canvas/70 text-ink ring-1 ring-inset ring-line/70 hover:bg-canvas/90")
      }
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path
          d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"
          fill={saved ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      {variant === "inline" && <span>{saved ? labelSaved : labelSave}</span>}
    </button>
  );
}
