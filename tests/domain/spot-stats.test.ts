import { describe, expect, it } from "vitest";
import { statsKeyOf } from "@/domain/spot/spot-stats";

describe("statsKeyOf", () => {
  it("한글 원명이 그대로 키가 된다", () => {
    expect(statsKeyOf("초안산")).toBe("초안산");
  });

  it("앞뒤 공백과 이중 공백을 다듬는다", () => {
    // 공급자 응답에 섞여 오는 값이다. 다듬지 않으면 같은 장소가 여러 행이 된다
    expect(statsKeyOf("  예천 출렁다리마을 ")).toBe("예천 출렁다리마을");
    expect(statsKeyOf("예천  출렁다리마을")).toBe("예천 출렁다리마을");
    expect(statsKeyOf("예천\n출렁다리마을")).toBe("예천 출렁다리마을");
  });

  it("셀 수 없으면 null 이다", () => {
    // 한글 원명이 없으면 로케일 간 키를 만들 수 없다. 0 이 아니라 없음이다
    expect(statsKeyOf(null)).toBeNull();
    expect(statsKeyOf(undefined)).toBeNull();
    expect(statsKeyOf("")).toBeNull();
    expect(statsKeyOf("   ")).toBeNull();
  });
});
