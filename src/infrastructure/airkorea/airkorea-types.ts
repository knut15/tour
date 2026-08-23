/**
 * 에어코리아 대기오염정보 조회 서비스(`ArpltnInforInqireSvc`) 응답 타입.
 *
 * 실호출로 확인한 형태(2026-08-19, `getCtprvnRltmMesureDnsty`, `returnType=json`,
 * `sidoName=서울`, `ver=1.3`):
 *
 *   {"response":{"body":{"totalCount":40,"items":[
 *     {"stationName":"강남구","mangName":"도시대기","dataTime":"2026-08-19 19:00",
 *      "pm10Value":"38","pm25Value":"28","pm10Flag":null,"pm25Flag":null, …}],
 *     "pageNo":1,"numOfRows":200},
 *    "header":{"resultMsg":"NORMAL_CODE","resultCode":"00"}}}
 *
 * 주의할 점 셋:
 * 1. 값은 전부 **문자열**이다. 결측은 `"-"` 또는 `""` 로 온다
 *    (세종 응답 실측: `"pm25Value":"-"`, `"pm25Flag":"통신장애"`).
 * 2. 값이 채워져 있어도 `pm10Flag`/`pm25Flag` 가 붙으면 그 값은 믿을 수 없다.
 * 3. `totalCount` 를 믿지 않는다 — 광주·전남은 `items` 에 자료가 있는데도 0 을 준다.
 *    개수는 `items.length` 로 센다.
 *
 * 등급 필드(`pm10Grade` 등)는 타입에 두지 않는다. 등급 판정은 도메인의 몫이고,
 * 타입에 있으면 언젠가 누군가 쓴다.
 */

export type AirkoreaItem = {
  /** 측정소명. 시도별 조회에는 온다(측정소별 조회는 ver 1.4 이상이라야 온다) */
  stationName?: string | null;
  /** 측정망 — 도시대기 / 도로변대기 / 국가배경농도 / 교외대기 / 항만 */
  mangName?: string | null;
  sidoName?: string | null;
  /** `YYYY-MM-DD HH:mm` (KST) */
  dataTime?: string | null;
  /** PM10 1시간 농도 ㎍/㎥ */
  pm10Value?: string | null;
  /** PM2.5 1시간 농도 ㎍/㎥ */
  pm25Value?: string | null;
  /** 값에 붙는 상태 플래그(점검및교정·통신장애 등). null 이 아니면 값을 믿지 않는다 */
  pm10Flag?: string | null;
  pm25Flag?: string | null;
};

export type AirkoreaResponse = {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: {
      items?: AirkoreaItem[] | "";
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

/** items 배열만 꺼낸다. 결과가 없을 때 빈 문자열로 오는 경우를 함께 막는다. */
export function itemsOf(response: AirkoreaResponse): AirkoreaItem[] {
  const items = response.response?.body?.items;
  if (!items || typeof items === "string") return [];
  return Array.isArray(items) ? items : [];
}
