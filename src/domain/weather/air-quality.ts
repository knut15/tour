/**
 * 미세먼지 등급.
 *
 * **에어코리아가 주는 등급값을 그대로 믿지 않는다.** 응답의 `pm10Grade` 는
 * 측정소 점검 중이면 null 로 오고, 예보 등급(`pm10Grade1h`)과 값이 다를 때가 있다.
 * 농도(㎍/㎥)에서 우리가 직접 판정하면 두 화면이 같은 숫자에 같은 색을 쓴다.
 */
export const DUST_GRADES = ["good", "moderate", "bad", "very-bad"] as const;

export type DustGrade = (typeof DUST_GRADES)[number];

/**
 * 환경부 대기환경기준(2018 개정) 4단계 구간. WHO 권고치가 아니다.
 * PM10  : 0~30 좋음 / 31~80 보통 / 81~150 나쁨 / 151~ 매우나쁨
 * PM2.5 : 0~15 좋음 / 16~35 보통 / 36~75 나쁨 / 76~ 매우나쁨
 */
const PM10_BOUNDS = [30, 80, 150] as const;
const PM25_BOUNDS = [15, 35, 75] as const;

function gradeOf(value: number, bounds: readonly [number, number, number]): DustGrade | null {
  if (!Number.isFinite(value) || value < 0) return null;
  if (value <= bounds[0]) return "good";
  if (value <= bounds[1]) return "moderate";
  if (value <= bounds[2]) return "bad";
  return "very-bad";
}

export function pm10GradeOf(value: number | null): DustGrade | null {
  return value === null ? null : gradeOf(value, PM10_BOUNDS);
}

export function pm25GradeOf(value: number | null): DustGrade | null {
  return value === null ? null : gradeOf(value, PM25_BOUNDS);
}

const SEVERITY: Record<DustGrade, number> = {
  good: 0,
  moderate: 1,
  bad: 2,
  "very-bad": 3,
};

/**
 * 둘 중 나쁜 쪽. **한 줄로 요약할 때는 나쁜 쪽이 기준이다** —
 * PM10 이 좋아도 초미세먼지가 나쁘면 마스크를 챙겨야 한다.
 */
export function worseGrade(a: DustGrade | null, b: DustGrade | null): DustGrade | null {
  if (a === null) return b;
  if (b === null) return a;
  return SEVERITY[a] >= SEVERITY[b] ? a : b;
}

/** 마스크를 권할 등급인가 */
export function needsMask(grade: DustGrade | null): boolean {
  return grade === "bad" || grade === "very-bad";
}
