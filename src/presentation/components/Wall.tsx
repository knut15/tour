import type { SpotView } from "@/application/spot/dto";
import { SpotFrame } from "@/presentation/components/SpotFrame";

/**
 * **크기가 다른 액자가 걸린 벽** (GOAL.md §0.5-2).
 *
 * "균일 그리드를 쓰지 않는다. 균일한 격자는 기계가 만든 것처럼 보이고, 불균일한
 * 배치는 사람이 건 것처럼 보인다" 는 문서의 원칙을 그대로 구현한 것이다.
 * 앞선 구현은 균일 3열이었고 근거도 적혀 있었다(레퍼런스가 인스타 프로필
 * 그리드다). **둘 중 어느 쪽이 나은지는 눈으로 봐야 정해진다** — 이 커밋만
 * 되돌리면 균일 그리드로 돌아간다.
 *
 * ## 크기를 어떻게 다르게 하는가
 *
 * **폭만 다르게 한다. 비율은 건드리지 않는다.** TourAPI 이미지의 82% 가
 * `cpyrhtDivCd=Type3`(변경금지)라 크롭할 수 없어서, 3:2 를 유지한 채 폭을 키우면
 * 높이도 따라 커진다. 그것이 곧 "크기가 다른 액자" 다.
 *
 * `grid-auto-flow: dense` 가 필요하다. 넓은 타일이 남은 한 칸에 들어가지 못하면
 * 그 칸이 빈 채로 남는데, `dense` 는 뒤의 좁은 타일을 끌어와 메운다. 없으면
 * 벽에 구멍이 뚫린 것처럼 보인다.
 */
/**
 * 넓게 걸 자리. **다섯 개마다 하나다.**
 *
 * 규칙적인 간격이지만 열 수(2열·3열)와 서로소라 실제 배치는 줄마다 달라진다 —
 * 3열에서는 넓은 타일이 왼쪽·가운데·오른쪽을 돌아가며 차지한다. 무작위로 고르면
 * 같은 목록을 다시 열 때마다 배치가 바뀌어 "내가 건 벽" 이 아니라 화면이 흔들리는
 * 것으로 읽힌다.
 *
 * 첫 타일을 넓게 두는 것은 의도다. 화면 맨 위가 가장 큰 액자다.
 */
function isWide(index: number): boolean {
  return index % 5 === 0;
}

export function Wall({
  items,
  ariaLabel,
  hrefOf,
  districtNameOf,
  labelSave,
  labelSaved,
  labelLike,
  labelLiked,
  labelViews,
  labelNoImage,
  enterFrom,
}: {
  items: SpotView[];
  ariaLabel: string;
  hrefOf: (spot: SpotView) => string;
  districtNameOf: (spot: SpotView) => string | undefined;
  labelSave: string;
  labelSaved: string;
  labelLike: string;
  labelLiked: string;
  labelViews: string;
  labelNoImage: string;
  /**
   * 이 인덱스부터가 이번에 새로 붙은 카드다. 그 앞은 이미 화면에 있던 것이라
   * 다시 등장시키지 않는다. 생략하면 아무것도 애니메이션하지 않는다.
   */
  enterFrom?: number;
}) {
  return (
    <ul
      aria-label={ariaLabel}
      // 간격은 좁다. 피드는 타일이 이어져 보여야 한다
      // 카드에 컨테이너가 없으므로 간격이 곧 구분선이다. 좁으면 카드끼리 붙어 읽힌다
      className={
        "grid grid-cols-1 gap-x-[34px] gap-y-16 sm:grid-cols-2 lg:grid-cols-3 " +
        "[grid-auto-flow:dense] items-start"
      }
    >
      {items.map((spot, i) => {
        const isNew = enterFrom !== undefined && i >= enterFrom;
        const wide = isWide(i);
        return (
        <li
          key={`${spot.locale}:${spot.contentId}`}
          // min-w-0 이 없으면 flex 아이템이 min-content 아래로 줄지 못한다.
          // truncate 는 white-space: nowrap 이라 긴 주소 한 줄이 곧 min-content 폭이 되고,
          // 그 카드가 자기 열을 밀어내 옆 칸을 덮는다
          className={
            "flex min-w-0" +
            // 열이 하나뿐인 폭에서는 넓힐 자리가 없다. 2열부터 켠다
            (wide ? " sm:col-span-2" : "") +
            (isNew ? " spot-enter" : "")
          }
          style={
            isNew
              ? ({ "--enter-index": i - enterFrom } as React.CSSProperties)
              : undefined
          }
        >
          <SpotFrame
            spot={spot}
            href={hrefOf(spot)}
            size="md"
            matte="photo"
            districtName={districtNameOf(spot)}
            labelSave={labelSave}
            labelSaved={labelSaved}
            labelLike={labelLike}
            labelLiked={labelLiked}
            labelViews={labelViews}
            labelNoImage={labelNoImage}
            priority={i < 3}
          />
        </li>
        );
      })}
    </ul>
  );
}
