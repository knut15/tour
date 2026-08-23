"use client";

import { usePersonalSet } from "@/presentation/lib/personal-set";
import {
  DETAIL_ACTION,
  TDS_BUTTON_PRIMARY,
  TDS_BUTTON_WEAK,
} from "@/presentation/components/tds";

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
  const { has: saved, toggle } = usePersonalSet("saved", spotKey);

  const onClick = (e: React.MouseEvent) => {
    // 상위 액자 링크로 전파되면 담기 대신 상세로 이동해 버린다
    e.preventDefault();
    e.stopPropagation();
    toggle();
  };

  const shape =
    variant === "chip"
      ? // 이미지 위에 얹는 글래스 필. 카드 전체를 덮는 오버레이 링크보다 위에 와야 한다.
        // 값은 globals.css 의 겹침 순서에서 고른다 — 직접 숫자를 쓰지 않는다
        "absolute right-3 top-3 z-[var(--layer-card-overlay)] grid h-9 w-9 place-items-center rounded-full backdrop-blur-md"
      : // 상세 화면 바닥에 나란히 서는 액션. 기하는 `DETAIL_ACTION` 이 정본이다
        DETAIL_ACTION;

  return (
    <button
      type="button"
      onClick={onClick}
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
      <svg
        viewBox="0 0 24 24"
        // 14px 글자 옆에 선다. 16px 짜리를 그대로 두면 아이콘이 글자보다 커 보인다
        className={(variant === "inline" ? "h-[15px] w-[15px]" : "h-4 w-4") + " shrink-0"}
        aria-hidden="true"
      >
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
