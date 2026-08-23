export type NoImageSize = "sm" | "lg";

/**
 * 사진이 없는 자리를 **비워 두지 않고 말한다.**
 *
 * 전에는 `bg-surface` 색면만 깔았다. 색면은 "사진이 아직 안 떴다" 와
 * "사진이 없다" 를 구분해 주지 않아서, 기다리면 뜨는 줄 알고 기다리게 된다.
 * 깨진 이미지 아이콘은 더 나쁘다 — 앱이 고장 난 것처럼 읽힌다.
 *
 * 아이콘은 lucide 의 `image-off` 를 그대로 쓴다(24 그리드, 원본 path).
 * 손으로 그린 것을 두면 앱의 다른 아이콘들과 그리드·모서리 반경이 미묘하게
 * 어긋나고, 그 어긋남은 나란히 놓였을 때만 보인다.
 * 획 두께만 원본(2)에서 1.25 로 낮췄다 — 이 자리는 사진의 대역이지 버튼이 아니라,
 * 원본 두께로는 액자 안에서 아이콘이 액자보다 무거워진다.
 *
 * **작은 자리는 높이를 고정한다.** 벽은 masonry 라 카드 높이를 사진이 정하는데,
 * 사진이 없으면 정할 것이 없어 이 블록이 곧 카드 높이가 된다. 비워 두면 글자
 * 높이만큼만 남아 그 카드만 납작해진다. 180px 은 옆 카드들 사이에서 한 장의
 * 자리로 읽히는 최소 높이다.
 * 상세 화면(`lg`)은 지면이 이미 크기를 정하므로 부모를 채운다.
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
    <div
      className={
        "flex w-full flex-col items-center justify-center gap-2.5 bg-surface px-4 text-center text-muted " +
        (size === "lg" ? "h-full" : "h-[180px]")
      }
    >
      {/* lucide `image-off` — 원본 path 를 고치지 않는다 */}
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
        <line x1="2" x2="22" y1="2" y2="22" />
        <path d="M10.41 10.41a2 2 0 1 1-2.83-2.83" />
        <line x1="13.5" x2="6" y1="13.5" y2="21" />
        <line x1="18" x2="21" y1="12" y2="15" />
        <path d="M3.59 3.59A1.99 1.99 0 0 0 3 5v14a2 2 0 0 0 2 2h14c.55 0 1.052-.22 1.41-.59" />
        <path d="M21 15V5a2 2 0 0 0-2-2H9" />
      </svg>

      {/* aria-hidden 을 붙이지 않는다. 사진이 없다는 사실도 정보다 */}
      <span
        className={
          "uppercase tracking-[0.16em] " + (size === "lg" ? "text-[11px]" : "text-[10px]")
        }
      >
        {label}
      </span>
    </div>
  );
}
