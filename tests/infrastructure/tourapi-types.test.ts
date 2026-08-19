import { describe, expect, it } from "vitest";
import { normalizeItems } from "@/infrastructure/tourapi/tourapi-types";

describe("normalizeItems", () => {
  it("결과가 0건이면 items 가 빈 문자열로 온다", () => {
    // TourAPI 의 실제 동작이다. 배열로 가정하면 런타임에 터진다
    expect(normalizeItems({ items: "" })).toEqual([]);
  });

  it("1건이면 객체로 온다", () => {
    expect(normalizeItems({ items: { item: { contentid: "1" } } })).toEqual([{ contentid: "1" }]);
  });

  it("여러 건이면 배열로 온다", () => {
    expect(normalizeItems({ items: { item: [{ contentid: "1" }, { contentid: "2" }] } })).toHaveLength(2);
  });

  it("body 나 items 자체가 없어도 빈 배열이다", () => {
    expect(normalizeItems(undefined)).toEqual([]);
    expect(normalizeItems({})).toEqual([]);
    expect(normalizeItems({ items: { item: undefined } })).toEqual([]);
  });
});

describe("toNumber", () => {
  it("빈 문자열을 0 으로 바꾸지 않는다", async () => {
    const { toNumber } = await import("@/infrastructure/tourapi/tourapi-types");
    // Number("") === 0 이라 그대로 쓰면 좌표 없는 스팟이 기니만에 찍힌다
    expect(toNumber("")).toBeNaN();
    expect(toNumber("   ")).toBeNaN();
    expect(toNumber(undefined)).toBeNaN();
    expect(toNumber(null)).toBeNaN();
    expect(toNumber("23")).toBe(23);
    expect(toNumber(" 37.5 ")).toBe(37.5);
  });
});
