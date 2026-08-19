import type { SpotView } from "@/application/spot/dto";
import { SpotFrame } from "@/presentation/components/SpotFrame";

/**
 * 인스타그램 피드형 **균일 그리드**.
 *
 * 레퍼런스(`docs/ref/IMG_3824.PNG`)가 실제로 인스타 프로필 그리드다 — 정사각 타일이
 * 좁은 간격으로 이어지고, 각 타일 안에 액자에 담긴 그림이 찍혀 있다. 카탈로그를
 * "내 벽" 처럼 보이게 하는 것은 배치의 불균일이 아니라 **타일 하나하나가 액자라는 사실**이다.
 *
 * 초안은 비대칭 배치로 풀었는데, 그건 레퍼런스에서 멀어지는 해석이었다.
 * 3:2 원본이 정사각 창에 담기면 위아래 여백이 곧 매트가 되어 크롭 금지 제약과도 맞물린다.
 */
export function Wall({
  items,
  ariaLabel,
  hrefOf,
  districtNameOf,
  labelSave,
  labelSaved,
  labelNoImage,
  enterFrom,
}: {
  items: SpotView[];
  ariaLabel: string;
  hrefOf: (spot: SpotView) => string;
  districtNameOf: (spot: SpotView) => string | undefined;
  labelSave: string;
  labelSaved: string;
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
      className="grid grid-cols-1 gap-x-[34px] gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((spot, i) => {
        const isNew = enterFrom !== undefined && i >= enterFrom;
        return (
        <li
          key={`${spot.locale}:${spot.contentId}`}
          // min-w-0 이 없으면 flex 아이템이 min-content 아래로 줄지 못한다.
          // truncate 는 white-space: nowrap 이라 긴 주소 한 줄이 곧 min-content 폭이 되고,
          // 그 카드가 자기 열을 밀어내 옆 칸을 덮는다
          className={"flex min-w-0" + (isNew ? " spot-enter" : "")}
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
            labelNoImage={labelNoImage}
            priority={i < 3}
          />
        </li>
        );
      })}
    </ul>
  );
}
