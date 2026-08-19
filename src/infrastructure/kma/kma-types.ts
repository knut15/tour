/**
 * 기상청 단기예보 조회서비스 응답 타입.
 *
 * **봉투가 두 가지다.** 실호출로 확인한 형태(2026-08-19):
 *
 * 정상·제공기관 오류 — `response.header.resultCode`
 *   {"response":{"header":{"resultCode":"00","resultMsg":"NORMAL_SERVICE"}, "body":{...}}}
 *   {"response":{"header":{"resultCode":"03","resultMsg":"NO_DATA"}}}   ← body 자체가 없다
 *
 * 포털(게이트웨이) 오류 — `OpenAPI_ServiceResponse.cmmMsgHeader`
 *   {"OpenAPI_ServiceResponse":{"cmmMsgHeader":{"errMsg":"SERVICE_KEY_IS_NOT_REGISTERED_ERROR",
 *    "returnAuthMsg":"등록되지 않은 서비스키","returnReasonCode":"30"}}}
 *
 * 성공 코드가 TourAPI 의 `"0000"` 이 아니라 **`"00"`** 이다. 두 서비스의 클라이언트를
 * 합치지 않은 이유가 이것이다.
 *
 * 숫자처럼 보이는 값도 문자열로 온다(`"27.4"`, `"64"`). 그대로 받아 매퍼에서 판다.
 */

/** 초단기실황(getUltraSrtNcst) 의 item. 관측값 필드는 `obsrValue` 하나다. */
export type KmaNcstItem = {
  baseDate?: string;
  baseTime?: string;
  category?: string;
  obsrValue?: string;
};

/** 단기예보(getVilageFcst) 의 item. 예보시각과 예보값이 따로 있다. */
export type KmaFcstItem = {
  baseDate?: string;
  baseTime?: string;
  category?: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
};

export type KmaItem = KmaNcstItem | KmaFcstItem;

export type KmaResponse<T> = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    /** NO_DATA 일 때는 body 가 통째로 없다 */
    body?: {
      items?: { item?: T[] } | "";
      totalCount?: number;
    };
  };
  OpenAPI_ServiceResponse?: {
    cmmMsgHeader?: {
      errMsg?: string;
      returnAuthMsg?: string;
      returnReasonCode?: string;
    };
  };
};

/**
 * item 배열만 꺼낸다.
 *
 * `items` 는 결과가 없을 때 빈 문자열 `""` 로 오는 경우가 있다(공공데이터포털의 흔한
 * XML→JSON 변환 산물). 배열이 아닌 값을 그대로 순회하면 런타임에서 터지므로 여기서 막는다.
 */
export function itemsOf<T>(response: KmaResponse<T>): T[] {
  const items = response.response?.body?.items;
  if (!items || typeof items === "string") return [];
  return Array.isArray(items.item) ? items.item : [];
}

/**
 * 기상청이 결측을 표시하는 방식 — 가이드: "+900 이상, -900 이하는 Missing".
 * 관측장비가 없는 해상 격자에서 이 값이 온다. 0 으로 채우면 "바람 없음"과 구분이 사라진다.
 */
const MISSING_ABS = 900;

/** 문자열 값을 숫자로. 비숫자·결측 마스킹이면 null. */
export function toNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  if (parsed >= MISSING_ABS || parsed <= -MISSING_ABS) return null;
  return parsed;
}
