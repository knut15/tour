import { formatLikes, formatViews } from "@/presentation/lib/format-stats";
import { LiveStatsLine } from "@/presentation/components/LiveStatsLine";

/**
 * 좋아요와 조회 수 한 줄.
 *
 * **카드와 상세가 같은 것을 쓴다.** 두 곳에 따로 그리면 아이콘 크기나 숫자 서식이
 * 조금씩 갈라지고, 같은 스팟인데 다른 수가 보이는 일까지 생긴다.
 *
 * **값을 만들지 않고 받는다.** 목록 한 화면에 열두 장이 서는데 카드가 스스로
 * 자기 수를 가져오면 열두 번을 묻게 된다. 부르는 쪽이 한 번에 읽어 내려준다.
 *
 * 셀 수 없는 장소(한글 원명이 없어 로케일 간 키를 만들 수 없다)나 저장소를 아직
 * 붙이지 않은 환경에서는 **줄을 그리지 않는다.** 0 을 보여 주면 "아무도 안
 * 눌렀다" 와 "셀 수 없다" 가 구분되지 않는다.
 *
 * **첫 서식은 여기서만 만든다.** `Intl` 의 결과는 런타임의 ICU 판에 따라 달라질 수
 * 있어 클라이언트가 hydration 시점에 다시 계산하면 어긋난다. 그래서 서버가 만든
 * 문자열을 내려보내고, 수가 실제로 바뀐 뒤에만 클라이언트가 자기 서식을 쓴다.
 */
export function SpotStats({
  stats,
  statsKey,
  locale,
  labelLike,
  labelViews,
  size = "sm",
}: {
  /** 셀 수 없거나 저장소가 없으면 `undefined`. 그때는 아무것도 그리지 않는다 */
  stats?: { likes: number; views: number };
  /**
   * 이 장소의 서버 키(한글 원명). 이것으로 눌린 결과를 받아 수를 따라 올린다.
   * 없으면 서버가 그린 값에서 멈춘다 — 애초에 셀 수 없는 장소다.
   */
  statsKey?: string | null;
  locale: string;
  labelLike: string;
  labelViews: string;
  /** sm = 카드 바닥 / md = 상세 화면 */
  size?: "sm" | "md";
}) {
  if (!stats) return null;

  return (
    <LiveStatsLine
      statsKey={statsKey ?? null}
      locale={locale}
      likes={stats.likes}
      views={stats.views}
      likesText={formatLikes(stats.likes, locale)}
      viewsText={formatViews(stats.views, locale)}
      labelLike={labelLike}
      labelViews={labelViews}
      size={size}
    />
  );
}
