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

  it("1페이지는 URL 에 쓰지 않는다 — 같은 화면이 두 주소를 갖지 않게", () => {
    expect(exploreHref("en", { category: "attraction", page: 1 })).toBe(
      "/en/explore?category=attraction",
    );
    expect(exploreHref("en", { category: "attraction", page: 2 })).toBe(
      "/en/explore?category=attraction&page=2",
    );
  });

  it("시도만 고른 상태를 그대로 표현한다", () => {
    expect(exploreHref("fr", { category: "festival", areaCode: 39 })).toBe(
      "/fr/explore?category=festival&area=39",
    );
  });
});
