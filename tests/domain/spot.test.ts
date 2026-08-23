import { describe, expect, it } from "vitest";
import { isExcludedClassification } from "@/domain/spot/category";
import { isDisplayableOnWall, spotIdKey, type Spot } from "@/domain/spot/spot";

function makeSpot(over: Partial<Spot> = {}): Spot {
  return {
    id: { contentId: "1", locale: "en" },
    name: { primary: "A", korean: "가" },
    category: "attraction",
    address: null,
    areaCode: 1,
    districtCode: 23,
    coordinate: { lng: 127, lat: 37 },
    image: { url: "https://a/1.jpg", thumbnailUrl: null, copyright: "Type3" },
    tel: null,
    classification: "HS010100",
    kind: null,
    modifiedAt: null,
    ...over,
  };
}

describe("isDisplayableOnWall", () => {
  it("이미지가 있고 배제 분류가 아니면 건다", () => {
    expect(isDisplayableOnWall(makeSpot(), isExcludedClassification)).toBe(true);
  });

  it("이미지가 없으면 걸지 않는다", () => {
    // 영문 관광지의 66% 가 이미지가 없다. 그대로 두면 벽이 색면으로 뒤덮인다
    expect(isDisplayableOnWall(makeSpot({ image: null }), isExcludedClassification)).toBe(false);
  });

  it("의료관광은 이미지가 있어도 걸지 않는다", () => {
    expect(
      isDisplayableOnWall(makeSpot({ classification: "EX050800" }), isExcludedClassification),
    ).toBe(false);
  });

  it("찜질방·온천은 건다", () => {
    expect(
      isDisplayableOnWall(makeSpot({ classification: "EX050200" }), isExcludedClassification),
    ).toBe(true);
    expect(
      isDisplayableOnWall(makeSpot({ classification: "EX050100" }), isExcludedClassification),
    ).toBe(true);
  });

  it("분류를 모르면 이미지 여부로만 판정한다", () => {
    expect(isDisplayableOnWall(makeSpot({ classification: null }), isExcludedClassification)).toBe(
      true,
    );
  });
});

describe("spotIdKey", () => {
  it("로케일이 다르면 다른 키다", () => {
    // 국문과 영문의 contentid 공간이 분리돼 있다.
    // 로케일을 키에서 빼면 다른 로케일 ID 로 조회하는 버그가 조용히 생긴다
    expect(spotIdKey({ contentId: "1349267", locale: "en" })).toBe("en:1349267");
    expect(spotIdKey({ contentId: "1349267", locale: "ko" })).toBe("ko:1349267");
    expect(spotIdKey({ contentId: "1", locale: "en" })).not.toBe(
      spotIdKey({ contentId: "1", locale: "ko" }),
    );
  });
});
