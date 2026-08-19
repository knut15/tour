import Link from "next/link";
import type { SpotView } from "@/application/spot/dto";
import { SaveChip } from "@/presentation/components/SaveChip";

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
  priority = false,
}: {
  spot: SpotView;
  href: string;
  size?: FrameSize;
  matte?: FrameMatte;
  districtName?: string;
  labelSave: string;
  labelSaved: string;
  priority?: boolean;
}) {
  const titleSize =
    size === "lg" ? "text-[24px]" : size === "md" ? "text-[21px]" : "text-[18px]";
  const hasKorean = Boolean(spot.titleKorean && spot.titleKorean !== spot.titlePrimary);

  return (
    // 카드 높이를 채우고 메타를 바닥에 붙인다. 제목이 두 줄로 넘쳐도
    // 한 행의 카드들이 같은 높이를 갖고 주소가 한 줄에 정렬된다
    <article className="group relative flex h-full min-w-0 flex-col">
      <div
        className={
          "relative overflow-hidden rounded-sm bg-surface " + WINDOW_ASPECT[matte]
        }
      >
        {spot.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={spot.imageUrl}
            alt={spot.titlePrimary}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full bg-surface" aria-hidden="true" />
        )}

        <SaveChip
          spotKey={`${spot.locale}:${spot.contentId}`}
          labelSave={labelSave}
          labelSaved={labelSaved}
          title={spot.titlePrimary}
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
      <div className="mt-auto border-t border-line pt-3">
        <p className="truncate text-[12px] text-muted">
          {spot.address ?? <span aria-hidden="true">&nbsp;</span>}
        </p>
      </div>
    </article>
  );
}
