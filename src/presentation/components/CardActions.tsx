"use client";

import type { ReactNode } from "react";
import { usePersonalSet } from "@/presentation/lib/personal-set";
import { useSpotLike } from "@/presentation/lib/use-spot-like";

/**
 * 사진 위에 얹히는 액션 둘 — 담기와 좋아요.
 *
 * **평소에는 보이지 않는다.** 카드에 마우스를 올리거나 키보드 포커스가 들어오면
 * 사진 가운데에 떠오른다. 아홉 장의 사진 위에 항상 아이콘이 떠 있으면 그게 먼저
 * 눈에 들어와 정작 사진을 누른다 (GOAL.md §0.5-6).
 *
 * **글자를 쓰지 않는다.** 사진 위의 글자는 사진마다 다른 배경에 놓여 읽히기도 하고
 * 안 읽히기도 한다. 뜻은 `aria-label` 이 진다.
 *
 * 포인터가 없는 기기(터치)에서는 호버가 없으므로 항상 보인다 —
 * `globals.css` 의 `@media (hover: none)` 이 그것을 맡는다.
 */
export function CardActions({
  spotKey,
  koreanName,
  title,
  labelSave,
  labelSaved,
  labelLike,
  labelLiked,
}: {
  spotKey: string;
  /** 서버에 셀 때 쓰는 키. 로케일을 넘나든다. 없으면 로컬 표시만 남는다 */
  koreanName: string | null;
  title: string;
  labelSave: string;
  labelSaved: string;
  labelLike: string;
  labelLiked: string;
}) {
  const saved = usePersonalSet("saved", spotKey);
  const liked = useSpotLike({ spotKey, koreanName });

  return (
    <div className="card-actions absolute inset-0 z-[var(--layer-card-overlay)] grid place-items-center">
      <div className="flex items-center gap-2">
        <ActionButton
          pressed={saved.has}
          onToggle={saved.toggle}
          tone="save"
          label={`${saved.has ? labelSaved : labelSave}: ${title}`}
        >
          {/* 책갈피. 담긴 상태에서는 안이 찬다 */}
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
            <path
              d="M6.5 3.75h11a.75.75 0 0 1 .75.75v15.2a.5.5 0 0 1-.78.42L12 16.2l-5.47 3.92a.5.5 0 0 1-.78-.42V4.5a.75.75 0 0 1 .75-.75Z"
              fill={saved.has ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </ActionButton>

        <ActionButton
          pressed={liked.liked}
          onToggle={liked.toggle}
          tone="like"
          label={`${liked.liked ? labelLiked : labelLike}: ${title}`}
        >
          <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden="true">
            <path
              d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z"
              fill={liked.liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </ActionButton>
      </div>
    </div>
  );
}

/** 눌린 상태의 색. 값은 `globals.css` 의 `--action-*` 이 정본이다 */
const TONE: Record<"save" | "like", string> = {
  save: "text-save",
  like: "text-like",
};

function ActionButton({
  pressed,
  onToggle,
  tone,
  label,
  children,
}: {
  pressed: boolean;
  onToggle: () => void;
  tone: "save" | "like";
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      onClick={(e) => {
        // 카드 전체를 덮는 링크로 전파되면 표시 대신 상세로 이동해 버린다
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={
        "grid size-11 place-items-center rounded-full backdrop-blur-md " +
        "transition-[transform,background-color,color] duration-200 ease-[var(--ease-signature)] " +
        "hover:scale-[1.06] active:scale-[0.94] " +
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus " +
        // 눌리면 아이콘이 색으로 찬다. 배경은 그대로 둔다 — 색면이 커지면
        // 사진 위에서 그것부터 보인다
        (pressed ? "bg-canvas " + TONE[tone] : "bg-canvas/85 text-body hover:text-ink")
      }
    >
      {children}
    </button>
  );
}
