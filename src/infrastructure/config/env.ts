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

export function isMockEnabled(): boolean {
  return process.env.USE_MOCK_DATA?.trim().toLowerCase() !== "false";
}
