import { describe, expect, it } from "vitest";
import { canCrop, createSpotImage } from "@/domain/spot/image";

describe("canCrop", () => {
  it("Type3 은 변경금지이므로 크롭할 수 없다", () => {
    // 서울 관광지 이미지 표본의 82% 가 Type3 다.
    // .curvez/research/tourapi-manual-v44.md 사실 12
    expect(canCrop({ url: "u", thumbnailUrl: null, copyright: "Type3" })).toBe(false);
  });

  it("Type1 은 크롭할 수 있다", () => {
    expect(canCrop({ url: "u", thumbnailUrl: null, copyright: "Type1" })).toBe(true);
  });

  it("저작권 유형을 모르면 크롭하지 않는다", () => {
    // 모르는 것을 허용으로 해석하면 위반이 조용히 배포된다
    expect(canCrop({ url: "u", thumbnailUrl: null, copyright: null })).toBe(false);
  });
});

describe("createSpotImage", () => {
  it("URL 이 없으면 이미지가 없다", () => {
    expect(createSpotImage("", "", "Type1")).toBeNull();
    expect(createSpotImage(null, null, null)).toBeNull();
    expect(createSpotImage("   ", "", "Type1")).toBeNull();
  });

  it("썸네일이 비면 null 로 둔다", () => {
    const img = createSpotImage("https://a/1.jpg", "", "Type3");
    expect(img).toEqual({ url: "https://a/1.jpg", thumbnailUrl: null, copyright: "Type3" });
  });

  it("모르는 저작권 문자열은 null 로 떨어뜨린다", () => {
    expect(createSpotImage("https://a/1.jpg", null, "Type9")?.copyright).toBeNull();
    expect(createSpotImage("https://a/1.jpg", null, "")?.copyright).toBeNull();
  });
});
