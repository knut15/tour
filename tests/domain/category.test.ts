import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  categoryOfContentTypeId,
  contentTypeIdOf,
  isCategory,
  isExcludedClassification,
} from "@/domain/spot/category";

describe("contentTypeIdOf", () => {
  it("국문과 영문의 코드가 다르다", () => {
    // 국문 코드를 영문 서비스에 넣으면 전부 0건이 나온다.
    // .curvez/research/tourapi-english-coverage.md 사실 2
    expect(contentTypeIdOf("attraction", "ko")).toBe(12);
    expect(contentTypeIdOf("attraction", "en")).toBe(76);
    expect(contentTypeIdOf("culture", "ko")).toBe(14);
    expect(contentTypeIdOf("culture", "en")).toBe(78);
    expect(contentTypeIdOf("food", "ko")).toBe(39);
    expect(contentTypeIdOf("food", "en")).toBe(82);
    expect(contentTypeIdOf("festival", "ko")).toBe(15);
    expect(contentTypeIdOf("festival", "en")).toBe(85);
  });

  it("두 로케일의 코드가 겹치지 않는다", () => {
    const ko = CATEGORIES.map((c) => contentTypeIdOf(c, "ko"));
    const en = CATEGORIES.map((c) => contentTypeIdOf(c, "en"));
    expect(ko.some((k) => en.includes(k))).toBe(false);
  });

  it("역매핑이 왕복한다", () => {
    for (const c of CATEGORIES) {
      for (const l of ["ko", "en"] as const) {
        expect(categoryOfContentTypeId(contentTypeIdOf(c, l), l)).toBe(c);
      }
    }
  });

  it("다른 로케일의 코드로는 역매핑되지 않는다", () => {
    expect(categoryOfContentTypeId(76, "ko")).toBeNull();
    expect(categoryOfContentTypeId(12, "en")).toBeNull();
  });

  it("모르는 코드는 null 이다", () => {
    expect(categoryOfContentTypeId(25, "ko")).toBeNull(); // 여행코스는 카테고리에 없다
    expect(categoryOfContentTypeId(77, "en")).toBeNull(); // 교통
    expect(categoryOfContentTypeId(NaN, "en")).toBeNull();
  });
});

describe("isCategory", () => {
  it("허용된 값만 통과시킨다", () => {
    expect(isCategory("attraction")).toBe(true);
    expect(isCategory("course")).toBe(false);
    expect(isCategory("")).toBe(false);
  });
});

describe("isExcludedClassification", () => {
  it("EX050800(기타의료관광)을 배제한다", () => {
    expect(isExcludedClassification("EX050800")).toBe(true);
  });

  it("같은 EX05 안의 온천·찜질방은 배제하지 않는다", () => {
    // EX05 를 통째로 배제하면 외국인에게 핵심 관광 자원인 찜질방·온천이 사라진다.
    // .curvez/research/tourapi-manual-v44.md 사실 8
    expect(isExcludedClassification("EX050100")).toBe(false); // Hot Springs/Sauna/Spa
    expect(isExcludedClassification("EX050200")).toBe(false); // Jjimjilbang
    expect(isExcludedClassification("EX050300")).toBe(false); // 한방체험
  });

  it("정상 관광지 분류는 배제하지 않는다", () => {
    expect(isExcludedClassification("HS010100")).toBe(false);
    expect(isExcludedClassification("NA030200")).toBe(false);
    expect(isExcludedClassification("VE060100")).toBe(false);
  });

  it("분류가 없으면 배제하지 않는다", () => {
    expect(isExcludedClassification(null)).toBe(false);
    expect(isExcludedClassification("")).toBe(false);
  });
});
