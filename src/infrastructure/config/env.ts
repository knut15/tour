/**
 * 환경 변수를 읽는 **유일한 자리**다 (ARCH-014).
 * 도메인과 application 은 값을 인자로 받는다.
 */

function required(name: string, value: string | undefined): string {
  const v = value?.trim();
  if (!v) throw new Error(`환경 변수 ${name} 가 비어 있다`);
  return v;
}

export type TourApiConfig = {
  /**
   * 반드시 **디코딩된** 인증키다. 인코딩 키(%2F, %3D 포함)를 URLSearchParams 로 넘기면
   * 이중 인코딩이 되어 HTTP 403 이 난다.
   * 근거: .curvez/research/tourapi-endpoints-v2.md 사실 6
   */
  serviceKey: string;
  /** 활용 통계 산출용. 매뉴얼이 필수 기재를 요구한다 */
  appName: string;
};

export function readTourApiConfig(): TourApiConfig {
  return {
    serviceKey: required("TOUR_API_KEY", process.env.TOUR_API_KEY),
    appName: process.env.TOUR_API_APP_NAME?.trim() || "seoul-tour",
  };
}

export type WeatherApiConfig = {
  /** 기상청 단기예보 조회서비스 인증키. 디코딩된 형태다 */
  kmaServiceKey: string;
  /** 에어코리아 대기오염정보 조회서비스 인증키. 디코딩된 형태다 */
  airKoreaServiceKey: string;
};

/**
 * 날씨·미세먼지 인증키.
 *
 * **data.go.kr 인증키는 계정당 하나다.** 서비스마다 활용신청을 따로 하지만 키 자체는
 * 같은 값을 쓴다. 실제로 이 프로젝트의 `TOUR_API_KEY` 값 그대로 기상청 단기예보와
 * 에어코리아 대기오염정보가 정상 응답하는 것을 curl 로 확인했다(2026-08-19).
 *
 * 그래서 전용 변수를 **선택값**으로 둔다. 나중에 계정을 나누거나 키를 갈아 끼울 때만
 * 채우면 되고, 평소에는 `.env.local` 에 줄을 하나 더 두지 않아도 된다.
 */
export function readWeatherConfig(): WeatherApiConfig {
  const fallback = required("TOUR_API_KEY", process.env.TOUR_API_KEY);
  return {
    kmaServiceKey: process.env.KMA_SERVICE_KEY?.trim() || fallback,
    airKoreaServiceKey: process.env.AIRKOREA_SERVICE_KEY?.trim() || fallback,
  };
}

export function isMockEnabled(): boolean {
  return process.env.USE_MOCK_DATA?.trim().toLowerCase() !== "false";
}

export type SupabaseConfig = {
  url: string;
  /** 공개 키. 브라우저 번들에 들어가도 되는 값이다 */
  publishableKey: string;
};

/**
 * Supabase 설정. **없으면 `null` 이다 — 던지지 않는다.**
 *
 * 반응 수는 이 앱의 본론이 아니다. 키를 넣지 않은 개발 환경이나 아직 프로젝트를
 * 만들지 않은 상태에서도 장소는 보여야 한다. 없을 때 무엇을 할지는 부르는 쪽이
 * 정한다 — 지금은 반응 줄을 그리지 않는다.
 */
export function readSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export type InstagramConfig = {
  /** Graph API 호출 대상. **OAuth 가 준 `user_id` 가 아니라 `/me` 가 준 값이다** */
  userId: string;
  /** 장기 토큰. 60일마다 갱신하지 않으면 되살릴 수 없다 */
  accessToken: string;
};

/**
 * 인스타 발행 설정. **없으면 `null` 이다 — 던지지 않는다.**
 *
 * 발행은 cron 이 부르는 곁가지라, 키가 없다고 앱 전체가 뜨지 않으면 안 된다.
 *
 * **`INSTAGRAM_USER_ID` 는 `/me` 가 돌려준 값을 넣는다.** OAuth 토큰 교환이 함께
 * 주는 `user_id` 는 값이 1 다르고(실측 2026-08-31: `...020` vs `...019`),
 * 그것으로 Graph API 를 부르면 `Object with ID ... does not exist` 가 난다.
 */
export function readInstagramConfig(): InstagramConfig | null {
  const userId = process.env.INSTAGRAM_USER_ID?.trim();
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!userId || !accessToken) return null;
  return { userId, accessToken };
}

/**
 * cron·수동 호출을 가르는 열쇠. 없으면 그 경로를 아예 막는다.
 *
 * 발행 route 는 부르면 실제로 게시물이 올라간다. 열려 있으면 남이 우리 계정에
 * 글을 쓸 수 있다는 뜻이라, 값이 없을 때 통과시키는 기본값을 두지 않는다.
 */
export function readCronSecret(): string | null {
  return process.env.CRON_SECRET?.trim() || null;
}
