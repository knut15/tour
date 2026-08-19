import type { WeatherApiConfig } from "@/infrastructure/config/env";
import { itemsOf, type AirkoreaItem, type AirkoreaResponse } from "@/infrastructure/airkorea/airkorea-types";

/**
 * 에어코리아 대기오염정보 조회 서비스 호출.
 *
 * 서비스 경로는 **`ArpltnInforInqireSvc`** 다. `ArpltnInqireSvc` 는 흔한 오타이고
 * 그 경로로는 폐기 안내가 온다. 실호출로 확인한 정상 경로만 상수로 둔다(2026-08-19).
 */
const BASE = "https://apis.data.go.kr/B552584/ArpltnInforInqireSvc";

/** 정상 응답 코드. `resultMsg` 는 기상청과 달리 `NORMAL_CODE` 다. */
const RESULT_OK = "00";

/**
 * `ver=1.3`. PM2.5(1.0) 와 1시간 등급(1.3)이 들어오는 버전이다.
 * 등급은 도메인이 판정하지만, 1.3 미만을 쓰면 응답 스키마가 달라지므로 버전을 고정한다.
 */
const VER = "1.3";

/**
 * 측정값은 매시 1회 갱신된다(정시 자료가 15분쯤 뒤에 붙는다).
 * 15분 캐시면 갱신 주기를 놓치지 않으면서 호출 수를 시간당 4회로 묶는다.
 */
const REVALIDATE_SECONDS = 900;

const TIMEOUT_MS = 5000;

/**
 * 게이트웨이가 간헐적으로 504 를 준다. 같은 요청을 연속 3회 보냈을 때 1회가
 * `SERVICETIMEOUT_ERROR` 였다(2026-08-19 실측). 미세먼지 실패는 화면을 죽이지 않지만
 * 칸이 자주 비면 그것대로 고장으로 보인다. 그래서 **한 번만** 다시 시도한다.
 */
const RETRY_REASON_CODES = new Set(["05"]);

export class AirKoreaError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
    readonly operation: string,
  ) {
    super(message);
    this.name = "AirKoreaError";
  }
}

const REASON: Record<string, string> = {
  "05": "공공데이터포털 게이트웨이가 응답하지 않았다",
  "10": "요청 파라미터가 잘못됐다",
  "20": "서비스 접근이 거부됐다 — 활용신청이 승인됐는지 확인한다",
  "22": "일일 트래픽 한도를 넘었다",
  "30": "등록되지 않은 서비스키다",
  "31": "인증키 사용기간이 만료됐다",
};

function describe(code: string | null, fallback: string): string {
  const known = code ? REASON[code] : undefined;
  return known ? `${known} (${code} ${fallback})` : fallback;
}

export class AirKoreaClient {
  constructor(
    private readonly config: WeatherApiConfig,
    private readonly revalidateSeconds: number = REVALIDATE_SECONDS,
  ) {}

  /**
   * 시도별 실시간 측정정보. 그 시도의 모든 측정소 값이 한 번에 온다.
   *
   * @param sidoName `서울`·`경기` 같은 축약형. 17개 전부 실호출로 응답을 확인했다.
   */
  async getCtprvnRltmMesureDnsty(sidoName: string): Promise<AirkoreaItem[]> {
    const operation = "getCtprvnRltmMesureDnsty";
    try {
      return await this.call(operation, sidoName);
    } catch (error) {
      if (error instanceof AirKoreaError && error.code !== null && RETRY_REASON_CODES.has(error.code)) {
        return this.call(operation, sidoName);
      }
      throw error;
    }
  }

  private async call(operation: string, sidoName: string): Promise<AirkoreaItem[]> {
    const url = new URL(`${BASE}/${operation}`);
    // 디코딩된 인증키를 넣고 인코딩은 URLSearchParams 에 맡긴다. 시도명(한글)도 함께 인코딩된다.
    url.searchParams.set("serviceKey", this.config.airKoreaServiceKey);
    url.searchParams.set("returnType", "json");
    url.searchParams.set("numOfRows", "200");
    url.searchParams.set("pageNo", "1");
    url.searchParams.set("sidoName", sidoName);
    url.searchParams.set("ver", VER);

    let text: string;
    try {
      const res = await fetch(url, {
        next: { revalidate: this.revalidateSeconds },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      text = await res.text();
    } catch (cause) {
      const reason =
        cause instanceof Error && cause.name === "TimeoutError"
          ? `${TIMEOUT_MS}ms 안에 응답하지 않았다`
          : "네트워크 호출이 실패했다";
      throw new AirKoreaError(`에어코리아 ${operation}: ${reason}`, null, operation);
    }

    let json: AirkoreaResponse;
    try {
      json = JSON.parse(text) as AirkoreaResponse;
    } catch {
      const code = text.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1] ?? null;
      const msg = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)?.[1] ?? "응답을 해석하지 못했다";
      throw new AirKoreaError(`에어코리아 ${operation}: ${describe(code, msg)}`, code, operation);
    }

    const portal = json.OpenAPI_ServiceResponse?.cmmMsgHeader;
    if (portal) {
      const code = portal.returnReasonCode ?? null;
      const msg = portal.errMsg ?? portal.returnAuthMsg ?? "포털 오류";
      throw new AirKoreaError(`에어코리아 ${operation}: ${describe(code, msg)}`, code, operation);
    }

    const header = json.response?.header;
    const resultCode = header?.resultCode ?? null;
    if (resultCode !== RESULT_OK) {
      const msg = header?.resultMsg ?? "제공기관 오류";
      throw new AirKoreaError(`에어코리아 ${operation}: ${describe(resultCode, msg)}`, resultCode, operation);
    }

    return itemsOf(json);
  }
}
