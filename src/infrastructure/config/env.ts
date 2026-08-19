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
