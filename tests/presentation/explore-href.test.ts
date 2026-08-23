import { describe, expect, it } from "vitest";
import { exploreHref } from "@/presentation/lib/explore-href";

describe("exploreHref", () => {
  it("시도 없는 시군구는 버린다", () => {
    // 시군구 코드는 시도 안에서만 고유하다 (domain/spot/region.ts).
    // 혼자 남으면 어느 지역인지 정해지지 않은 채 링크에 실린다
    expect(exploreHref("en", { category: "food", districtCode: 23 })).toBe(
      "/en/explore?category=food",
    );
  });

  it("시도와 함께면 시군구를 싣는다", () => {
    expect(
      exploreHref("ko", { category: "food", areaCode: 1, districtCode: 23 }),
    ).toBe("/ko/explore?category=food&area=1&district=23");
  });

  it("더보기를 누르지 않은 상태는 URL 에 쓰지 않는다 — 같은 화면이 두 주소를 갖지 않게", () => {
    expect(exploreHref("en", { category: "attraction", more: 0 })).toBe(
      "/en/explore?category=attraction",
    );
    expect(exploreHref("en", { category: "attraction", more: 2 })).toBe(
      "/en/explore?category=attraction&more=2",
    );
  });

  it("필터를 바꾸는 링크에는 more 가 실리지 않는다", () => {
    // 다른 조건의 27개를 보다가 카테고리를 바꿨는데 27개가 그대로 오면
    // "더 눌렀던 상태" 가 조건을 넘어 살아남는다
    expect(exploreHref("ko", { category: "culture", areaCode: 1 })).toBe(
      "/ko/explore?category=culture&area=1",
    );
  });

  it("지역과 더보기를 함께 싣는다", () => {
    expect(
      exploreHref("ja", { category: "food", areaCode: 39, districtCode: 4, more: 3 }),
    ).toBe("/ja/explore?category=food&area=39&district=4&more=3");
  });

  it("시도만 고른 상태를 그대로 표현한다", () => {
    expect(exploreHref("fr", { category: "festival", areaCode: 39 })).toBe(
      "/fr/explore?category=festival&area=39",
    );
  });
});
