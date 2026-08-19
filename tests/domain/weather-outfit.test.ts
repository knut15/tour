import { describe, expect, it } from "vitest";
import { adviseOutfit, type OutfitInput } from "@/domain/weather/outfit";

function input(over: Partial<OutfitInput> = {}): OutfitInput {
  return {
    feelsLike: 20,
    low: null,
    high: null,
    sky: "clear",
    dust: null,
    windSpeed: null,
    ...over,
  };
}

const layerAt = (feelsLike: number) => adviseOutfit(input({ feelsLike })).layer;

describe("adviseOutfit — 기온 8구간", () => {
  it("기상청 「기온별 옷차림」 경계에서 갈린다", () => {
    expect(layerAt(28)).toBe("sleeveless");
    expect(layerAt(27)).toBe("short-sleeve");
    expect(layerAt(23)).toBe("short-sleeve");
    expect(layerAt(22)).toBe("long-sleeve");
    expect(layerAt(20)).toBe("long-sleeve");
    expect(layerAt(19)).toBe("light-knit");
    expect(layerAt(17)).toBe("light-knit");
    expect(layerAt(16)).toBe("jacket");
    expect(layerAt(12)).toBe("jacket");
    expect(layerAt(11)).toBe("trench");
    expect(layerAt(9)).toBe("trench");
    expect(layerAt(8)).toBe("coat");
    expect(layerAt(5)).toBe("coat");
    expect(layerAt(4)).toBe("padding");
    expect(layerAt(-10)).toBe("padding");
  });
});

describe("adviseOutfit — 부가물", () => {
  it("비·눈·소나기면 우산을 챙긴다", () => {
    expect(adviseOutfit(input({ sky: "rain" })).extras).toContain("umbrella");
    expect(adviseOutfit(input({ sky: "snow" })).extras).toContain("umbrella");
    expect(adviseOutfit(input({ sky: "shower" })).extras).toContain("umbrella");
    expect(adviseOutfit(input({ sky: "cloudy" })).extras).not.toContain("umbrella");
  });

  it("미세먼지가 나쁨 이상이면 마스크를 챙긴다", () => {
    expect(adviseOutfit(input({ dust: "moderate" })).extras).not.toContain("mask");
    expect(adviseOutfit(input({ dust: "bad" })).extras).toContain("mask");
    expect(adviseOutfit(input({ dust: "very-bad" })).extras).toContain("mask");
  });

  it("풍속 9m/s 부터 바람막이를 권한다", () => {
    expect(adviseOutfit(input({ windSpeed: 8.9 })).extras).not.toContain("windbreaker");
    expect(adviseOutfit(input({ windSpeed: 9 })).extras).toContain("windbreaker");
    // 풍속을 모르면 권하지 않는다
    expect(adviseOutfit(input({ windSpeed: null })).extras).not.toContain("windbreaker");
  });

  it("일교차 10℃ 부터 겉옷을 하나 더 권한다", () => {
    expect(adviseOutfit(input({ low: 15, high: 24 })).extras).not.toContain("extra-layer");
    expect(adviseOutfit(input({ low: 15, high: 25 })).extras).toContain("extra-layer");
    // 최저·최고 중 하나라도 없으면 판단하지 않는다
    expect(adviseOutfit(input({ low: null, high: 25 })).extras).not.toContain("extra-layer");
  });

  it("부가물은 선언 순서를 유지한다 — 같은 날씨가 화면마다 달라 보이면 안 된다", () => {
    const advice = adviseOutfit(
      input({ feelsLike: 6, sky: "rain", dust: "very-bad", windSpeed: 12, low: 2, high: 14 }),
    );
    expect(advice.layer).toBe("coat");
    expect(advice.extras).toEqual(["umbrella", "mask", "windbreaker", "extra-layer"]);
  });

  it("아무 조건도 안 맞으면 부가물이 비어 있다", () => {
    expect(adviseOutfit(input()).extras).toEqual([]);
  });
});
