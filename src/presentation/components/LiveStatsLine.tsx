"use client";

import { formatLikes, formatViews } from "@/presentation/lib/format-stats";
import { useLiveStats } from "@/presentation/lib/live-stats";

/**
 * 수를 그리는 줄. **서버가 그린 값에서 시작해 눌린 결과를 따라간다.**
 *
 * 좋아요를 누르거나 상세를 열면 서버가 바뀐 총수를 돌려주고, 그것이
 * `live-stats` 를 거쳐 여기 닿는다. 새로고침을 기다리지 않는다.
 *
 * **첫 렌더는 서버가 만든 문자열 그대로다.** 덧씌운 값이 없을 때는 `likesText` ·
 * `viewsText` 를 쓰고, 서버 스냅샷도 비어 있으므로 hydration 이 어긋나지 않는다.
 * 자기 서식(`Intl`)은 수가 실제로 바뀐 뒤에만 쓴다.
 */
export function LiveStatsLine({
  statsKey,
  locale,
  likes,
  views,
  likesText,
  viewsText,
  labelLike,
  labelViews,
  size,
}: {
  statsKey: string | null;
  locale: string;
  /** 서버가 센 값. 덧씌운 값이 없으면 이것이 그대로 남는다 */
  likes: number;
  views: number;
  /** 서버가 만든 서식 문자열. 첫 렌더가 쓴다 */
  likesText: string;
  viewsText: string;
  labelLike: string;
  labelViews: string;
  size: "sm" | "md";
}) {
  const live = useLiveStats(statsKey);

  // 덧씌운 값이 없으면 서버 문자열을 그대로 쓴다. 다시 계산하지 않는다
  const likeChanged = live?.likes !== undefined && live.likes !== likes;
  const viewChanged = live?.views !== undefined && live.views !== views;
  const likeShown = likeChanged ? formatLikes(live.likes as number, locale) : likesText;
  const viewShown = viewChanged ? formatViews(live.views as number, locale) : viewsText;

  /*
    바뀐 수는 아래에서 올라오며 든다. 자리에서 숫자만 갈리면 언제 바뀌었는지 알 수
    없고, 하트의 뜀과 이어지지도 않는다.

    `key` 에 값을 넣어 **수가 바뀔 때마다** 새 요소가 되게 한다. 같은 요소에 클래스만
    다시 붙이면 브라우저가 이미 끝난 애니메이션으로 보고 다시 재생하지 않는다.
  */
  const rise = "inline-block count-rise";

  const text = size === "md" ? "text-[14px]" : "text-[12px]";
  const icon = size === "md" ? "size-4" : "size-3.5";

  return (
    /*
      이 줄이 **있는지 없는지**가 곧 판정이다. 저장소가 없으면 `SpotStats` 가
      아무것도 그리지 않으므로, 이름이 하나도 없는 것과 0 이 찍힌 것을 QA 가 가른다.
    */
    <p data-testid="spot-stats" className={`flex shrink-0 items-center gap-3 text-muted ${text}`}>
      <span className="inline-flex items-center gap-1" aria-label={`${labelLike} ${likeShown}`}>
        <svg viewBox="0 0 24 24" className={icon} aria-hidden="true">
          <path
            d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {likeChanged ? (
          <span key={likeShown} className={rise}>
            {likeShown}
          </span>
        ) : (
          likeShown
        )}
      </span>
      <span className="inline-flex items-center gap-1" aria-label={`${labelViews} ${viewShown}`}>
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
        {viewChanged ? (
          <span key={viewShown} className={rise}>
            {viewShown}
          </span>
        ) : (
          viewShown
        )}
      </span>
    </p>
  );
}
