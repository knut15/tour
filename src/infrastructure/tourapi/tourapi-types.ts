/** TourAPI 응답의 원형. 도메인 타입으로 옮기기 전의 모습이다. */

export type TourApiItem = {
  contentid?: string;
  contenttypeid?: string;
  title?: string;
  addr1?: string;
  addr2?: string;
  areacode?: string;
  sigungucode?: string;
  mapx?: string;
  mapy?: string;
  firstimage?: string;
  firstimage2?: string;
  cpyrhtDivCd?: string;
  tel?: string;
  modifiedtime?: string;
  lclsSystm1?: string;
  lclsSystm2?: string;
  lclsSystm3?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  /** detailCommon2 응답 */
  overview?: string;
  homepage?: string;
  telname?: string;
  usetime?: string;
  restdate?: string;
  infocenter?: string;
  /** areaCode2 응답 */
  code?: string;
  name?: string;
};

export type TourApiBody = {
  items?: { item?: TourApiItem | TourApiItem[] } | "";
  numOfRows?: number;
  pageNo?: number;
  totalCount?: number;
};

export type TourApiResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: TourApiBody;
  };
  /** 포털 수준 오류는 이 형태로 온다 */
  OpenAPI_ServiceResponse?: {
    cmmMsgHeader?: {
      errMsg?: string;
      returnAuthMsg?: string;
      returnReasonCode?: string;
    };
  };
};

/**
 * `items` 는 결과가 0건이면 빈 문자열이고, 1건이면 객체, 여러 건이면 배열이다.
 * 세 형태를 배열로 통일한다.
 */
export function normalizeItems(body: TourApiBody | undefined): TourApiItem[] {
  const items = body?.items;
  if (!items || typeof items === "string") return [];
  const item = items.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

/**
 * 빈 문자열을 숫자로 바꾸지 않는다.
 *
 * `Number("")` 는 `NaN` 이 아니라 `0` 이다. 그래서 좌표가 없는 스팟이 위도·경도 0(기니만)에
 * 찍히고, 코드가 없는 자치구가 code=0 으로 통과한다. `Number.isInteger(0)` 이 true 라
 * 뒤따르는 검사도 통과시켜 버린다. 이 함정은 테스트로 잡혔다.
 */
export function toNumber(value: string | undefined | null): number {
  const v = value?.trim();
  if (!v) return Number.NaN;
  return Number(v);
}
