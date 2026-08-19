import Link from "next/link";
import type { SpotView } from "@/application/spot/dto";
import { NoImage } from "@/presentation/components/NoImage";
import { CardActions } from "@/presentation/components/CardActions";
import { SpotImage } from "@/presentation/components/SpotImage";
import { mockStats } from "@/presentation/lib/mock-stats";

export type FrameSize = "sm" | "md" | "lg";
export type FrameMatte = "photo" | "portrait";

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
  labelNoImage: string;
  priority?: boolean;
}) {
  const titleSize =
    size === "lg" ? "text-[24px]" : size === "md" ? "text-[21px]" : "text-[18px]";
  const hasKorean = Boolean(spot.titleKorean && spot.titleKorean !== spot.titlePrimary);

  /*
    **목 데이터다** (`presentation/lib/mock-stats.ts`). 실제 출처가 아직 없다.
    서버에서만 서식을 만든다 — `Intl` 의 결과는 런타임의 ICU 판에 따라 달라질 수 있어
    클라이언트가 다시 계산하면 하이드레이션이 어긋난다. 이 컴포넌트는 서버 전용이라
    그 계산이 한 번만 돈다.
  */
  const stats = mockStats(`${spot.locale}:${spot.contentId}`);
  const likes = new Intl.NumberFormat(spot.locale).format(stats.likes);
  const views = new Intl.NumberFormat(spot.locale, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(stats.views);

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
          "card-thumb relative overflow-hidden rounded-sm bg-surface " + WINDOW_ASPECT[matte]
        }
      >
        {spot.imageUrl ? (
          // URL 이 있어도 안 뜰 수 있다. 실패 처리는 클라이언트에서만 되므로 갈라 둔다
          <SpotImage
            src={spot.imageUrl}
            alt={spot.titlePrimary}
            noImageLabel={labelNoImage}
            priority={priority}
          />
        ) : (
          <NoImage label={labelNoImage} />
        )}

        {/* 평소엔 없다. 카드에 올리거나 포커스가 들어오면 사진 가운데 떠오른다 */}
        <CardActions
          spotKey={`${spot.locale}:${spot.contentId}`}
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
        <p lang="ko" className="mt-1.5 text-[14px] leading-[21px] text-body">
          {spot.titleKorean}
        </p>
      ) : (
        <p className="mt-1.5 h-[21px]" aria-hidden="true" />
      )}

      {/* mt-auto 로 바닥에 붙인다 — 제목 줄 수가 달라도 주소가 한 줄에 정렬된다 */}
      {/* 바닥 줄 — 왼쪽에 주소, 오른쪽에 좋아요·조회 */}
      <div className="mt-auto flex items-center gap-3 border-t border-line pt-3">
        <p className="min-w-0 flex-1 truncate text-[12px] text-muted">
          {spot.address ?? <span aria-hidden="true">&nbsp;</span>}
        </p>
        <p className="flex shrink-0 items-center gap-3 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1" aria-label={`${labelLike} ${likes}`}>
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
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
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
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
      </div>
    </article>
  );
}
