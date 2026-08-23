import { describe, expect, it } from "vitest";
import { needsMask, pm10GradeOf, pm25GradeOf, worseGrade } from "@/domain/weather/air-quality";

describe("pm10GradeOf", () => {
  it("환경부 기준 4구간의 경계값에서 정확히 갈린다", () => {
    expect(pm10GradeOf(0)).toBe("good");
    expect(pm10GradeOf(30)).toBe("good");
    expect(pm10GradeOf(31)).toBe("moderate");
    expect(pm10GradeOf(80)).toBe("moderate");
    expect(pm10GradeOf(81)).toBe("bad");
    expect(pm10GradeOf(150)).toBe("bad");
    expect(pm10GradeOf(151)).toBe("very-bad");
  });

  it("값이 없거나 음수면 등급도 없다", () => {
    expect(pm10GradeOf(null)).toBeNull();
    expect(pm10GradeOf(-1)).toBeNull();
    expect(pm10GradeOf(Number.NaN)).toBeNull();
  });
});

describe("pm25GradeOf", () => {
  it("PM2.5 는 더 낮은 경계를 쓴다", () => {
    expect(pm25GradeOf(15)).toBe("good");
    expect(pm25GradeOf(16)).toBe("moderate");
    expect(pm25GradeOf(35)).toBe("moderate");
    expect(pm25GradeOf(36)).toBe("bad");
    expect(pm25GradeOf(75)).toBe("bad");
    expect(pm25GradeOf(76)).toBe("very-bad");
  });

  it("같은 농도라도 PM10 과 등급이 다르다", () => {
    expect(pm10GradeOf(40)).toBe("moderate");
    expect(pm25GradeOf(40)).toBe("bad");
  });
});

describe("worseGrade", () => {
  it("나쁜 쪽을 고른다", () => {
    expect(worseGrade("good", "moderate")).toBe("moderate");
    expect(worseGrade("bad", "moderate")).toBe("bad");
    expect(worseGrade("very-bad", "good")).toBe("very-bad");
    expect(worseGrade("bad", "bad")).toBe("bad");
  });

  it("한쪽이 null 이면 나머지를 그대로 쓴다", () => {
    expect(worseGrade(null, "bad")).toBe("bad");
    expect(worseGrade("good", null)).toBe("good");
  });

  it("둘 다 null 이면 null 이다", () => {
    expect(worseGrade(null, null)).toBeNull();
  });
});

describe("needsMask", () => {
  it("나쁨부터 마스크를 권한다", () => {
    expect(needsMask("good")).toBe(false);
    expect(needsMask("moderate")).toBe(false);
    expect(needsMask("bad")).toBe(true);
    expect(needsMask("very-bad")).toBe(true);
    expect(needsMask(null)).toBe(false);
  });
});
