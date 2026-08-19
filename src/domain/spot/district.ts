/**
 * 서울 자치구. TourAPI 의 areaCode=1 아래 sigunguCode 1~25 에 대응한다.
 *
 * **코드-이름 매핑을 여기 하드코딩하지 않는다.** 이름은 로케일마다 다르고
 * (`23=종로구` / `23=Jongno-gu`) 공급자가 areaCode2 오퍼레이션으로 제공한다.
 * 도메인은 코드의 유효 범위만 안다.
 * 근거: .curvez/research/tourapi-endpoints-v2.md 사실 3
 */
export type DistrictCode = number;

export const SEOUL_AREA_CODE = 1;
export const SEOUL_DISTRICT_MIN = 1;
export const SEOUL_DISTRICT_MAX = 25;

export function isSeoulDistrictCode(code: number): boolean {
  return Number.isInteger(code) && code >= SEOUL_DISTRICT_MIN && code <= SEOUL_DISTRICT_MAX;
}

export type District = {
  readonly code: DistrictCode;
  /** 로케일에 맞는 표기. 공급자가 준 값을 그대로 쓴다. */
  readonly name: string;
};
