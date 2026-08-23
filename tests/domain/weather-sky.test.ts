import { describe, expect, it } from "vitest";
import { isWet, skyStateOf } from "@/domain/weather/sky";

describe("skyStateOf", () => {
  it("SKY 코드를 하늘 상태로 옮긴다", () => {
    expect(skyStateOf(1, 0)).toBe("clear");
    expect(skyStateOf(3, 0)).toBe("partly-cloudy");
    expect(skyStateOf(4, 0)).toBe("cloudy");
  });

  it("강수형태가 하늘상태를 이긴다 — 비 오는 맑은 하늘은 비다", () => {
    expect(skyStateOf(1, 1)).toBe("rain");
    expect(skyStateOf(1, 2)).toBe("rain-snow");
    expect(skyStateOf(1, 3)).toBe("snow");
    expect(skyStateOf(1, 4)).toBe("shower");
  });

  it("초단기 전용 코드 5·6·7 도 강수로 본다", () => {
    expect(skyStateOf(4, 5)).toBe("rain");
    expect(skyStateOf(4, 6)).toBe("rain-snow");
    expect(skyStateOf(4, 7)).toBe("snow");
  });

  it("PTY 0 은 강수가 아니므로 SKY 로 내려간다", () => {
    expect(skyStateOf(3, 0)).toBe("partly-cloudy");
  });

  it("모르는 코드는 cloudy 로 둔다 — 없는 값을 맑음으로 낙관하지 않는다", () => {
    // SKY 2 는 결번이다
    expect(skyStateOf(2, 0)).toBe("cloudy");
    expect(skyStateOf(9, 9)).toBe("cloudy");
    expect(skyStateOf(null, null)).toBe("cloudy");
    // 모르는 PTY 는 SKY 로 내려간다
    expect(skyStateOf(1, 9)).toBe("clear");
  });
});

describe("isWet", () => {
  it("우산이 필요한 하늘만 참이다", () => {
    expect(isWet("rain")).toBe(true);
    expect(isWet("rain-snow")).toBe(true);
    expect(isWet("snow")).toBe(true);
    expect(isWet("shower")).toBe(true);
    expect(isWet("clear")).toBe(false);
    expect(isWet("partly-cloudy")).toBe(false);
    expect(isWet("cloudy")).toBe(false);
  });
});
