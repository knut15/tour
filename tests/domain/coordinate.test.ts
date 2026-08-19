import { describe, expect, it } from "vitest";
import {
  MAX_RADIUS_M,
  clampRadius,
  createCoordinate,
  distanceMeters,
} from "@/domain/spot/coordinate";

describe("createCoordinate", () => {
  it("유효 범위를 벗어나면 null 이다", () => {
    expect(createCoordinate(181, 0)).toBeNull();
    expect(createCoordinate(0, 91)).toBeNull();
    expect(createCoordinate(NaN, 37)).toBeNull();
    expect(createCoordinate(127, Infinity)).toBeNull();
  });

  it("TourAPI 의 mapx=경도, mapy=위도 순서를 지킨다", () => {
    // 서울시청 근처. 경도 127 대, 위도 37 대다. 뒤집히면 바다 한가운데가 된다
    const c = createCoordinate(126.9784, 37.5666);
    expect(c).toEqual({ lng: 126.9784, lat: 37.5666 });
  });
});

describe("distanceMeters", () => {
  it("같은 점이면 0 이다", () => {
    const p = { lng: 127, lat: 37 };
    expect(distanceMeters(p, p)).toBeCloseTo(0, 5);
  });

  it("서울시청↔경복궁 거리가 대략 1.2km 다", () => {
    const cityHall = { lng: 126.9784, lat: 37.5666 };
    const palace = { lng: 126.977, lat: 37.5761 };
    const d = distanceMeters(cityHall, palace);
    expect(d).toBeGreaterThan(900);
    expect(d).toBeLessThan(1400);
  });

  it("대칭이다", () => {
    const a = { lng: 126.9, lat: 37.5 };
    const b = { lng: 127.1, lat: 37.6 };
    expect(distanceMeters(a, b)).toBeCloseTo(distanceMeters(b, a), 6);
  });
});

describe("clampRadius", () => {
  it("공급자 상한 20km 를 넘지 않는다", () => {
    // .curvez/research/tourapi-endpoints.md 사실 5
    expect(clampRadius(50_000)).toBe(MAX_RADIUS_M);
    expect(MAX_RADIUS_M).toBe(20_000);
  });

  it("잘못된 값은 기본값으로 떨어진다", () => {
    expect(clampRadius(0)).toBe(1000);
    expect(clampRadius(-5)).toBe(1000);
    expect(clampRadius(NaN)).toBe(1000);
  });

  it("정상 값은 정수로 내린다", () => {
    expect(clampRadius(1500.7)).toBe(1500);
  });
});
