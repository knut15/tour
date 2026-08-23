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
 * **원본이 정한다.** 실측(2026-08-20) TourAPI 이미지는 폭이 940px 로 고정이고
 * 높이만 다르다 — 표본 5개에서 626~939, 비율 1.001~1.502 였고 3:2 는 셋뿐이었다.
 * 지금까지는 그것을 3:2 틀에 넣고 `object-contain` 으로 맞췄는데, 그러면 정사각
 * 사진 좌우에 빈 띠가 생긴다. 비율을 놓아 주면 여백도 크롭도 없다.
 *
 * 그래서 grid 가 아니라 **multi-column** 이다. grid 는 행 단위로 높이를 맞추므로
 * 높이가 제각각이면 행마다 빈 칸이 남는다 — 넓은 타일을 섞는 방식으로 시도해 봤고
 * 실제로 오른쪽 아래가 규칙적으로 비었다. column 은 행이 없어서 각 열에 차곡차곡
 * 쌓인다. 핀터레스트가 같은 구조다.
 *
 * **대가: 읽는 순서가 가로가 아니라 세로다.** 1·2·3 이 첫 줄이 아니라 첫 열에
 * 쌓인다. 목록에 순위가 없으므로(편집된 선택이지 정렬 결과가 아니다) 감수한다.
 *
 * **대가 둘: 이미지가 로드되며 열이 다시 쌓인다.** 높이를 미리 모르기 때문이다.
 * TourAPI 가 이미지 크기를 주지 않아서, 없애려면 서버가 이미지 헤더를 읽어
 * 비율을 알아내 캐시해야 한다.
 */
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
  labelDistance,
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
  labelDistance: string;
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
      // `gap-x` 가 곧 `column-gap` 이다. 세로 간격은 아래 항목의 `mb` 가 진다
      /*
        1 → 2 → 3 → 4 로 넓어진다. 3열에서 4열로 한 번에 뛰지 않고 `md` 를 끼운
        이유는, 1024px 에서 바로 4열이 되면 카드 폭이 220px 아래로 떨어져 제목이
        석 줄로 접히기 때문이다. 컨테이너가 1200px 이므로 4열의 카드 폭은
        (1200 − 34 × 3) ÷ 4 = 274px 다.
      */
      className="columns-1 gap-x-[34px] sm:columns-2 md:columns-3 lg:columns-4"
    >
      {items.map((spot, i) => {
        const isNew = enterFrom !== undefined && i >= enterFrom;
        return (
        <li
          key={`${spot.locale}:${spot.contentId}`}
          // min-w-0 이 없으면 flex 아이템이 min-content 아래로 줄지 못한다.
          // truncate 는 white-space: nowrap 이라 긴 주소 한 줄이 곧 min-content 폭이 되고,
          // 그 카드가 자기 열을 밀어내 옆 칸을 덮는다
          className={
            // 카드가 열 경계에서 잘리지 않게 한다. 없으면 사진과 제목이 다른 열에 나뉜다
            "mb-16 break-inside-avoid" + (isNew ? " spot-enter" : "")
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
            matte="natural"
            districtName={districtNameOf(spot)}
            labelSave={labelSave}
            labelSaved={labelSaved}
            labelLike={labelLike}
            labelLiked={labelLiked}
            labelViews={labelViews}
            labelDistance={labelDistance}
            labelNoImage={labelNoImage}
            priority={i < 3}
          />
        </li>
        );
      })}
    </ul>
  );
}
