export type NoImageSize = "sm" | "lg";

/**
 * 사진이 없는 자리를 **비워 두지 않고 말한다.**
 *
 * 전에는 `bg-surface` 색면만 깔았다. 색면은 "사진이 아직 안 떴다" 와
 * "사진이 없다" 를 구분해 주지 않아서, 기다리면 뜨는 줄 알고 기다리게 된다.
 * 깨진 이미지 아이콘은 더 나쁘다 — 앱이 고장 난 것처럼 읽힌다.
 *
 * 아이콘은 헤어라인 한 겹이다. 액자 안의 아이콘이 액자보다 무거우면 안 된다.
 */
export function NoImage({
  label,
  size = "sm",
}: {
  /** 사전에서 온 문구. 컴포넌트가 문자열을 갖지 않는다 */
  label: string;
  size?: NoImageSize;
}) {
  const icon = size === "lg" ? 44 : 28;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 bg-surface px-4 text-muted">
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* 액자 */}
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        {/*
          해와 능선 — 이게 있어야 '사진 자리' 로 읽힌다.
          능선은 하나만 둔다. 28px 에서 획이 다섯이면 뭉쳐서 얼룩으로 보인다.
        */}
        <circle cx="8.25" cy="9.75" r="1.15" />
        <path d="M4.75 17 L10 12 L16.5 17.5" />
        {/* 없음. 액자 모서리에서 모서리로 긋는다 */}
        <path d="M4.5 19.5 L19.5 4.5" />
      </svg>

      {/* aria-hidden 을 붙이지 않는다. 사진이 없다는 사실도 정보다 */}
      <span
        className={
          "text-center uppercase tracking-[0.16em] " +
          (size === "lg" ? "text-[11px]" : "text-[10px]")
        }
      >
        {label}
      </span>
    </div>
  );
}
