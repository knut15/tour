import { describe, expect, it } from "vitest";
import { isInsideGrid, toGrid } from "@/infrastructure/kma/kma-grid";

/**
 * 서울시청의 (60, 127) 은 기상청 격자표의 서울 종로 값이다.
 * 세 격자 전부 `getUltraSrtNcst` 를 실제로 호출해 `NORMAL_SERVICE` 와 관측값이
 * 돌아오는 것을 확인했다(2026-08-19: 서울 27.4℃ / 부산 28℃ / 제주 28.8℃).
 */
describe("toGrid", () => {
  it("서울시청 → nx=60, ny=127", () => {
    expect(toGrid(126.9779, 37.5663)).toEqual({ nx: 60, ny: 127 });
  });

  it("부산시청 → nx=98, ny=76", () => {
    expect(toGrid(129.0756, 35.1796)).toEqual({ nx: 98, ny: 76 });
  });

  it("제주시청 → nx=53, ny=38", () => {
    expect(toGrid(126.5312, 33.4996)).toEqual({ nx: 53, ny: 38 });
  });

  it("항상 정수 격자를 낸다", () => {
    const grid = toGrid(127.0246, 37.5326);
    expect(Number.isInteger(grid.nx)).toBe(true);
    expect(Number.isInteger(grid.ny)).toBe(true);
  });

  it("5km 격자이므로 아주 가까운 두 점은 같은 격자로 떨어진다", () => {
    // 서울시청과 덕수궁(약 200m)
    expect(toGrid(126.9751, 37.5658)).toEqual(toGrid(126.9779, 37.5663));
  });
});

describe("isInsideGrid", () => {
  it("국내 좌표는 격자 안이다", () => {
    expect(isInsideGrid(toGrid(126.9779, 37.5663))).toBe(true);
    expect(isInsideGrid(toGrid(126.5312, 33.4996))).toBe(true);
  });

  it("기상청이 서비스하지 않는 좌표는 격자 밖이다", () => {
    // 도쿄 · 뉴욕
    expect(isInsideGrid(toGrid(139.6917, 35.6895))).toBe(false);
    expect(isInsideGrid(toGrid(-74.006, 40.7128))).toBe(false);
  });

  it("경계값을 지킨다", () => {
    expect(isInsideGrid({ nx: 1, ny: 1 })).toBe(true);
    expect(isInsideGrid({ nx: 149, ny: 253 })).toBe(true);
    expect(isInsideGrid({ nx: 0, ny: 1 })).toBe(false);
    expect(isInsideGrid({ nx: 150, ny: 1 })).toBe(false);
    expect(isInsideGrid({ nx: 1, ny: 254 })).toBe(false);
    expect(isInsideGrid({ nx: 1.5, ny: 1 })).toBe(false);
  });
});
