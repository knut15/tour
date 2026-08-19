/**
 * 지역. TourAPI 는 두 단계다 — 시도(`areaCode`)와 시군구(`sigunguCode`).
 *
 * **`sigunguCode` 는 시도 안에서만 고유하다.** 실측한 값이다 (2026-08-19, EngService2):
 *
 * ```
 * 서울(1)  : 1~25
 * 경기(31) : 1~31   ← 서울과 겹친다
 * 제주(39) : 3~4    ← 서울 3(용산구)과 겹친다
 * ```
 *
 * 그래서 지역은 **항상 쌍으로** 다룬다. 시군구 코드 하나만 들고 다니면
 * 종로구인지 경기 광주시인지 가릴 수 없고, 그 혼동은 URL·즐겨찾기·집계
 * 어디서든 조용히 잘못된 곳을 가리킨다.
 *
 * 코드-이름 매핑은 여기 두지 않는다. 이름은 로케일마다 다르고(`23=종로구` /
 * `23=Jongno-gu`) 공급자가 `areaCode2` 로 준다.
 */
export type AreaCode = number;
export type DistrictCode = number;

/**
 * 코드의 **형태만** 검사한다. 유효한 코드의 집합은 공급자가 안다.
 *
 * 지금 시도는 17개(1~8, 31~39)지만 그 목록을 여기 박으면 공급자가 코드를
 * 늘렸을 때 새 지역이 조용히 사라진다 — 아무 에러도 없이 화면에서만 빠진다.
 * 집합 판정은 공급자가 준 목록으로 화면이 한다. 형태가 맞는데 존재하지 않는
 * 코드는 빈 결과가 되고, 그건 이미 있는 빈 상태 화면이 받는다.
 */
export function isAreaCode(code: number): boolean {
  return Number.isInteger(code) && code > 0 && code < 100;
}

/** 시군구 코드. 최대값은 경기도의 31 이다. 상한을 넉넉히 잡는다 */
export function isDistrictCode(code: number): boolean {
  return Number.isInteger(code) && code > 0 && code < 100;
}

/** 시도. 로케일에 맞는 표기를 공급자가 준 그대로 쓴다 */
export type Area = {
  readonly code: AreaCode;
  readonly name: string;
};

/** 시군구. **어느 시도의 것인지는 이 타입이 모른다** — 부르는 쪽이 안다 */
export type District = {
  readonly code: DistrictCode;
  readonly name: string;
};
