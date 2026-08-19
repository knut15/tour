import type { Spot } from "@/domain/spot/spot";

/**
 * 판단에 필요한 사실들. **공급자 필드명이 아니라 의미로 정규화한다.**
 * TourAPI 는 같은 뜻을 카테고리마다 다른 이름으로 준다
 * (`usetime` / `usetimeculture` / `opentimefood` / `usetimefestival`).
 * 그 사정은 infrastructure 가 흡수하고 도메인은 이 형태만 안다.
 */
export type SpotFacts = {
  readonly openingHours: string | null;
  readonly closedDays: string | null;
  readonly inquiry: string | null;
  readonly parking: string | null;
  readonly admission: string | null;
  /** 축제 전용. 시작~종료 */
  readonly eventPeriod: string | null;
  readonly eventPlace: string | null;
};

export const EMPTY_FACTS: SpotFacts = {
  openingHours: null,
  closedDays: null,
  inquiry: null,
  parking: null,
  admission: null,
  eventPeriod: null,
  eventPlace: null,
};

export type SpotDetail = {
  readonly spot: Spot;
  readonly overview: string | null;
  /** 공식 사이트. 값이 없는 사실을 메울 유일한 출구다 (GOAL.md §5-3) */
  readonly homepage: string | null;
  readonly facts: SpotFacts;
};

/**
 * 화면에 줄 세울 사실 목록. **값이 없는 항목을 빼지 않는다.**
 *
 * 빈 항목을 숨기면 "정보가 없다" 와 "그런 항목이 없다" 가 구분되지 않는다.
 * 여행자는 영업시간이 안 보이면 항상 여는 곳인지 데이터가 없는 것인지 알 수 없다.
 * 근거: GOAL.md §5-3, .curvez/design/screens/spot-detail.md
 */
export type FactKey = keyof SpotFacts;

export function factOrder(hasEvent: boolean): FactKey[] {
  const base: FactKey[] = ["openingHours", "closedDays", "admission", "inquiry", "parking"];
  return hasEvent ? ["eventPeriod", "eventPlace", ...base] : base;
}

/** 축제처럼 기간이 있는 스팟인가. 없으면 축제 전용 항목을 줄 세우지 않는다. */
export function hasEventFacts(facts: SpotFacts): boolean {
  return Boolean(facts.eventPeriod || facts.eventPlace);
}
