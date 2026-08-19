import { mockStats } from "@/presentation/lib/mock-stats";

/**
 * 좋아요와 조회 수 한 줄.
 *
 * **카드와 상세가 같은 것을 쓴다.** 두 곳에 따로 그리면 아이콘 크기나 숫자 서식이
 * 조금씩 갈라지고, 같은 스팟인데 다른 수가 보이는 일까지 생긴다.
 *
 * 값은 아직 **목 데이터**다 (`presentation/lib/mock-stats.ts`). 실제 카운트가 생기면
 * `spotKey` 대신 값을 받도록 바꾸면 되고, 고칠 자리는 이 파일 하나다.
 *
 * 서식을 서버에서만 만든다. `Intl` 의 결과는 런타임의 ICU 판에 따라 달라질 수 있어
 * 클라이언트가 다시 계산하면 하이드레이션이 어긋난다. 이 컴포넌트는 서버 전용이다.
 */
export function SpotStats({
  spotKey,
  locale,
  labelLike,
  labelViews,
  size = "sm",
}: {
  spotKey: string;
  locale: string;
  labelLike: string;
  labelViews: string;
  /** sm = 카드 바닥 / md = 상세 화면 */
  size?: "sm" | "md";
}) {
  const stats = mockStats(spotKey);
  const likes = new Intl.NumberFormat(locale).format(stats.likes);
  const views = new Intl.NumberFormat(locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(stats.views);

  const text = size === "md" ? "text-[14px]" : "text-[12px]";
  const icon = size === "md" ? "size-4" : "size-3.5";

  return (
    <p className={`flex shrink-0 items-center gap-3 text-muted ${text}`}>
      <span className="inline-flex items-center gap-1" aria-label={`${labelLike} ${likes}`}>
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <path
            d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {likes}
      </span>
      <span className="inline-flex items-center gap-1" aria-label={`${labelViews} ${views}`}>
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <path
            d="M2.6 12S6 5.9 12 5.9 21.4 12 21.4 12 18 18.1 12 18.1 2.6 12 2.6 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        {views}
      </span>
    </p>
  );
}
