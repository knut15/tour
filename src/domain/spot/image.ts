/**
 * TourAPI 이미지의 저작권 유형.
 * - Type1: 제1유형(출처표시 권장)
 * - Type3: 제3유형(제1유형 + **변경금지**)
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 11
 */
export type CopyrightType = "Type1" | "Type3";

export type SpotImage = {
  /** 원본. 약 500x333 (3:2) */
  readonly url: string;
  /** 썸네일. 약 150x100 (3:2) */
  readonly thumbnailUrl: string | null;
  readonly copyright: CopyrightType | null;
};

/**
 * 이 이미지를 잘라내도 되는가.
 *
 * `Type3` 은 변경금지다. 서울 관광지의 이미지 표본에서 **82%가 Type3** 였으므로
 * 사실상 전부 크롭 금지로 다뤄야 한다. 저작권 유형을 모르는 경우(null)도 금지로 본다 —
 * 모르는 것을 허용으로 해석하면 위반이 조용히 배포된다.
 *
 * 화면은 `object-fit: contain` 으로 전체를 보이고 남는 공간은 액자 매트가 채운다.
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 12, .curvez/design/components/SpotFrame.md
 */
export function canCrop(image: SpotImage): boolean {
  return image.copyright === "Type1";
}

export function createSpotImage(
  url: string | null | undefined,
  thumbnailUrl: string | null | undefined,
  copyright: string | null | undefined,
): SpotImage | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  const type: CopyrightType | null =
    copyright === "Type1" || copyright === "Type3" ? copyright : null;
  return {
    url: trimmed,
    thumbnailUrl: thumbnailUrl?.trim() || null,
    copyright: type,
  };
}
