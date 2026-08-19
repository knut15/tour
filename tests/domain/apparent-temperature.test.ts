import { describe, expect, it } from "vitest";
import { apparentTemperature } from "@/domain/weather/weather";

describe("apparentTemperature — 여름(열지수) 구간", () => {
  it("27℃ 이상이고 습도가 있으면 열지수를 쓴다", () => {
    // 2026-08-19 19시 서울 실측(27.4℃ / 64%)
    expect(apparentTemperature(27.4, 64, 1.2)).toBeCloseTo(28.963, 3);
    expect(apparentTemperature(30, 70, null)).toBeCloseTo(35.038, 3);
  });

  it("습해질수록 더 덥게 느낀다", () => {
    expect(apparentTemperature(30, 80, null)).toBeGreaterThan(
      apparentTemperature(30, 40, null),
    );
  });

  it("27℃ 이상이어도 습도를 모르면 기온 그대로다", () => {
    expect(apparentTemperature(30, null, 2)).toBe(30);
  });

  it("26.9℃ 는 여름식 구간이 아니다 — 경계에서 식이 바뀐다", () => {
    expect(apparentTemperature(26.9, 90, null)).toBe(26.9);
  });
});

describe("apparentTemperature — 겨울(체감온도) 구간", () => {
  it("10℃ 이하이고 바람이 1.3m/s 이상이면 체감온도식을 쓴다", () => {
    expect(apparentTemperature(0, null, 5)).toBeCloseTo(-4.935, 3);
    expect(apparentTemperature(10, null, 1.3)).toBeCloseTo(9.856, 3);
    expect(apparentTemperature(-5, 40, 10)).toBeCloseTo(-13.678, 3);
  });

  it("바람이 셀수록 더 춥게 느낀다", () => {
    expect(apparentTemperature(0, null, 10)).toBeLessThan(apparentTemperature(0, null, 2));
  });

  it("바람이 1.3m/s 미만이거나 없으면 기온 그대로다", () => {
    expect(apparentTemperature(0, null, 1.2)).toBe(0);
    expect(apparentTemperature(0, 50, null)).toBe(0);
  });
});

describe("apparentTemperature — 두 식 사이", () => {
  it("10℃ 초과 27℃ 미만은 기온을 그대로 쓴다", () => {
    // 겨울식에 여름 기온을 넣으면 40℃ 가 넘는 값이 나온다. 구간 밖에서는 쓰지 않는다.
    expect(apparentTemperature(15, 50, 3)).toBe(15);
    expect(apparentTemperature(26, 90, 8)).toBe(26);
    expect(apparentTemperature(10.1, 90, 8)).toBe(10.1);
  });
});
