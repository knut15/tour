import Link from "next/link";
import type { SpotView } from "@/application/spot/dto";
import { NoImage } from "@/presentation/components/NoImage";
import { CardActions } from "@/presentation/components/CardActions";
import { SpotImage } from "@/presentation/components/SpotImage";
import { SpotDistance } from "@/presentation/components/SpotDistance";
import { SpotStats } from "@/presentation/components/SpotStats";

export type FrameSize = "sm" | "md" | "lg";
export type FrameMatte = "photo" | "portrait" | "natural";

/**
 * 창의 비율.
 *
 * 레퍼런스(Direction A)는 4:5 세로였지만 원본이 3:2 뿐이라 세로로 쓰려면 잘라야 한다.
 * TourAPI 이미지의 82% 가 `cpyrhtDivCd=Type3`(변경금지)라 **크롭하지 않고 3:2 를 쓴다.**
 * A 의 성격은 세리프·헤어라인·여백이 지므로 비율 하나로 무너지지 않는다.
 * 바꾸려면 이 표와 `object-contain` 을 함께 고친다.
 */
const WINDOW_ASPECT: Record<FrameMatte, string> = {
  photo: "aspect-[3/2]",
  portrait: "aspect-[4/5]",
  /*
    비율을 강제하지 않는다. **원본이 그대로 높이를 정한다.**

    실측(2026-08-20) TourAPI 이미지는 폭이 940px 로 고정이고 높이만 다르다 —
    표본 5개에서 626~939, 비율 1.001~1.502 였고 3:2 는 셋뿐이었다. 그것을 3:2 틀에
    `object-contain` 으로 넣으면 정사각 사진은 좌우에 빈 띠가 생긴다. 크롭이
    금지된 상태에서 비율을 통일하려면 그 여백을 감수하는 수밖에 없는데,
    비율을 놓아 주면 여백도 크롭도 없다.
  */
  natural: "",
};

/**
 * 스팟 하나를 카드로 제시한다 (Direction A).
 *
 * **카드는 컨테이너를 갖지 않는다.** 사진이 곧 카드이고 글자는 바탕 위에 앉는다.
 * 정보 구조는 네 층 — 제목+자치구 / 한글 원명 / 헤어라인 / 주소.
 * 각 슬롯이 실제 정보를 진다. 모든 카드에서 같은 값을 갖는 것은 넣지 않는다.
 */
export function SpotFrame({
  spot,
  href,
  size = "md",
  matte = "photo",
  districtName,
  labelSave,
  labelSaved,
  labelLike,
  labelLiked,
  labelViews,
  stats,
  labelDistance,
  labelNoImage,
  priority = false,
}: {
  spot: SpotView;
  href: string;
  size?: FrameSize;
  matte?: FrameMatte;
  districtName?: string;
  labelSave: string;
  labelSaved: string;
  labelLike: string;
  labelLiked: string;
  labelViews: string;
  /** 이 장소의 반응. 셀 수 없거나 저장소가 없으면 없다 */
  stats?: { likes: number; views: number };
  /** 거리의 스크린 리더 설명. "내 위치에서" */
  labelDistance: string;
  labelNoImage: string;
  priority?: boolean;
}) {
  const titleSize =
    size === "lg" ? "text-[24px]" : size === "md" ? "text-[21px]" : "text-[18px]";
  const hasKorean = Boolean(spot.titleKorean && spot.titleKorean !== spot.titlePrimary);


  return (
    // 카드 높이를 채우고 메타를 바닥에 붙인다. 제목이 두 줄로 넘쳐도
    // 한 행의 카드들이 같은 높이를 갖고 주소가 한 줄에 정렬된다.
    //
    // `w-full` 이 빠지면 안 된다. 이 요소는 `<li className="flex">` 의 플렉스
    // 아이템이라 기본 폭이 max-content 다. 지금까지는 `<img>` 의 고유 폭이 열을
    // 채워 줘서 가려져 있었는데, 사진이 없는 카드는 채울 것이 글자뿐이라
    // 그 카드만 열보다 좁아진다.
    <article className="relative flex h-full w-full min-w-0 flex-col">
      {/*
        호버 대상은 **사진뿐이다.** 카드 전체로 잡으면 제목이나 주소 위를 지나갈 때도
        버튼이 떠올라, 읽으려던 글자를 가린다.
      */}
      <div
        className={
          "card-thumb relative overflow-hidden rounded-sm bg-surface " +
          WINDOW_ASPECT[matte] +
          // 비율이 없으면 로드 전 높이가 0 이라 카드가 한 줄로 납작해진다
          (matte === "natural" ? " min-h-[120px]" : "")
        }
      >
        {spot.imageUrl ? (
          // URL 이 있어도 안 뜰 수 있다. 실패 처리는 클라이언트에서만 되므로 갈라 둔다
          <SpotImage
            src={spot.imageUrl}
            alt={spot.titlePrimary}
            noImageLabel={labelNoImage}
            fit={matte === "natural" ? "natural" : "contain"}
            priority={priority}
          />
        ) : (
          <NoImage label={labelNoImage} />
        )}

        {/*
          사진을 덮는 링크. **사진 안에 있어야 한다** —
          카드 전체를 덮는 제목 링크(`::after`)를 쓰면 커서가 사진 위에 있어도
          실제로 hover 되는 요소는 `.card-thumb` 바깥이라 액션이 떠오르지 않는다.

          제목 링크가 이미 접근 가능한 이름을 주므로 이 링크는 보조기술과 탭 순서에서
          뺀다. 같은 곳으로 가는 링크가 둘로 읽히면 목록을 두 배로 훑게 된다.

          겹침 값은 액션과 같다. DOM 에서 먼저 오므로 버튼이 위에 온다.
        */}
        <Link
          href={href}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 z-[var(--layer-card-overlay)]"
        />

        {/* 평소엔 없다. 사진에 올리거나 포커스가 들어오면 가운데 떠오른다 */}
        <CardActions
          spotKey={`${spot.locale}:${spot.contentId}`}
          koreanName={spot.titleKorean}
          title={spot.titlePrimary}
          labelSave={labelSave}
          labelSaved={labelSaved}
          labelLike={labelLike}
          labelLiked={labelLiked}
        />
      </div>

      {/* 제목과 자치구가 같은 기준선에 놓인다 */}
      <div className="flex min-w-0 items-baseline justify-between gap-3 pt-[18px]">
        <h3 className={"min-w-0 font-display font-normal leading-[1.2] text-ink " + titleSize}>
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
          >
            {spot.titlePrimary}
          </Link>
        </h3>
        {districtName && (
          <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-muted">
            {districtName}
          </span>
        )}
      </div>

      {/*
        한글 원명. 현장에서 보여줘야 하므로 보조가 아니라 본문이다.

        **값이 없어도 줄을 지우지 않는다.** 지우면 그 카드만 아래 요소가 위로 올라와
        한 행의 단이 어긋난다. 원명이 없거나(파싱 실패·번역 부재) 번역명과 같은 경우(ko)에도
        같은 높이를 차지한다. 빈 줄은 스크린 리더가 읽지 않도록 감춘다.
      */}
      {hasKorean ? (
        /*
          제목보다 작고 진하다. 크기로 위계를 주되 색은 낮추지 않는다 —
          현장에서 보여 줄 이름이라 흐리면 그 자리에서 못 읽는다.
          서체가 이미 다르므로(제목은 세리프) 같은 먹색이어도 둘이 섞이지 않는다.
        */
        <p lang="ko" className="mt-1.5 text-[13px] leading-[19px] text-ink">
          {spot.titleKorean}
        </p>
      ) : (
        // 값이 없어도 같은 높이를 차지한다. 위 줄과 숫자가 어긋나면 단이 틀어진다
        <p className="mt-1.5 h-[19px]" aria-hidden="true" />
      )}

      {/*
        위아래를 가르는 줄. **실선이 아니라 점선이다.**

        전면 헤어라인은 카드마다 그어져 목록에 가로줄이 규칙적으로 쌓이고, 사진이
        주인공인 벽에서 그 줄들이 격자처럼 먼저 읽힌다. 점선은 같은 자리에서 같은
        일을 하면서 시선을 덜 붙든다.

        `py-3` 이 위아래에 같은 여백을 준다 — 줄이 한글 원명과 주소 줄의 **가운데**에
        서야 한다. 아래쪽에만 여백을 두면 줄이 위 텍스트에 붙어 그 줄의 밑줄처럼 보인다.

        `mt-auto` 가 여기 있다. 바닥에 붙는 기준이 이 줄이어야 제목 줄 수가 달라도
        카드마다 아래 줄이 한 선에 정렬된다.
      */}
      <div aria-hidden="true" className="mt-auto py-3">
        <div className="border-t border-dotted border-line" />
      </div>

      {/* 바닥 줄 — 왼쪽에 주소, 오른쪽에 좋아요·조회 */}
      <div className="flex items-center gap-3">
        {/*
          거리가 주소보다 앞에 선다. 어디인지보다 **얼마나 먼지**가 먼저 걸러 내는
          조건이라서다. 위치를 켜지 않았으면 아무것도 그리지 않고, 그때는 주소가
          `flex-1` 로 남은 폭을 그대로 쓴다.
        */}
        <SpotDistance
          lng={spot.lng}
          lat={spot.lat}
          locale={spot.locale}
          label={labelDistance}
        />
        <p className="min-w-0 flex-1 truncate text-[12px] text-muted">
          {spot.address ?? <span aria-hidden="true">&nbsp;</span>}
        </p>
        <SpotStats
          stats={stats}
          locale={spot.locale}
          labelLike={labelLike}
          labelViews={labelViews}
        />
      </div>
    </article>
  );
}
