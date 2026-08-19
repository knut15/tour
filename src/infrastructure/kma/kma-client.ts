import type { WeatherApiConfig } from "@/infrastructure/config/env";
import { itemsOf, type KmaFcstItem, type KmaNcstItem, type KmaResponse } from "@/infrastructure/kma/kma-types";

/**
 * 기상청 단기예보 조회서비스 호출.
 *
 * base URL 은 실호출로 확인한 것이다(2026-08-19, HTTPS 로 정상 응답).
 * 가이드는 http 로 적지만 https 로도 같은 응답이 오므로 https 를 쓴다.
 */
const BASE = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";

/** 정상 응답 코드. TourAPI 의 `"0000"` 과 다르다 — 실호출로 확인한 값은 `"00"` 이다. */
const RESULT_OK = "00";

/**
 * 실황은 매시 갱신이므로 10분 캐시가 적절하다. 그보다 짧게 잡으면 개발계정
 * 일일 한도만 쓰고 화면은 같은 숫자를 그린다.
 */
const REVALIDATE_SECONDS = 600;

/**
 * 5초. 공공데이터포털 게이트웨이는 붐빌 때 응답을 끝내지 않고 붙잡고 있는다.
 * 날씨 위젯 하나 때문에 페이지 전체가 멈추면 안 된다.
 */
const TIMEOUT_MS = 5000;

export class KmaError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
    readonly operation: string,
  ) {
    super(message);
    this.name = "KmaError";
  }
}

/**
 * 사람이 읽을 수 있는 코드 설명.
 *
 * 원문 `errMsg` 는 `SERVICE_KEY_IS_NOT_REGISTERED_ERROR` 처럼 대문자 상수라 로그에서
 * 원인을 짚기 어렵다. 실제로 받아 본 코드에만 설명을 붙이고, 모르는 코드는 원문을 그대로 남긴다.
 */
const REASON: Record<string, string> = {
  "03": "해당 발표시각에 자료가 없다 (NO_DATA)",
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

type Params = Record<string, string | number>;

export class KmaClient {
  constructor(
    private readonly config: WeatherApiConfig,
    private readonly revalidateSeconds: number = REVALIDATE_SECONDS,
  ) {}

  /** 초단기실황 — 지금 기온(T1H)·습도(REH)·풍속(WSD)·강수형태(PTY). */
  async getUltraSrtNcst(params: Params): Promise<KmaNcstItem[]> {
    return this.call<KmaNcstItem>("getUltraSrtNcst", params);
  }

  /** 단기예보 — 하늘상태(SKY)와 오늘 최저(TMN)·최고(TMX). */
  async getVilageFcst(params: Params): Promise<KmaFcstItem[]> {
    return this.call<KmaFcstItem>("getVilageFcst", params);
  }

  private async call<T>(operation: string, params: Params): Promise<T[]> {
    const url = new URL(`${BASE}/${operation}`);
    // 디코딩된 인증키를 넣고 인코딩은 URLSearchParams 에 맡긴다.
    // 인코딩 키를 그대로 넣으면 이중 인코딩으로 인증이 깨진다.
    url.searchParams.set("serviceKey", this.config.kmaServiceKey);
    url.searchParams.set("dataType", "JSON");
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    let text: string;
    try {
      const res = await fetch(url, {
        next: { revalidate: this.revalidateSeconds },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      text = await res.text();
    } catch (cause) {
      const reason = cause instanceof Error && cause.name === "TimeoutError" ? `${TIMEOUT_MS}ms 안에 응답하지 않았다` : "네트워크 호출이 실패했다";
      throw new KmaError(`기상청 ${operation}: ${reason}`, null, operation);
    }

    let json: KmaResponse<T>;
    try {
      json = JSON.parse(text) as KmaResponse<T>;
    } catch {
      // 게이트웨이 오류는 JSON 을 요청해도 XML 로 오는 경우가 있다
      const code = text.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1] ?? null;
      const msg = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)?.[1] ?? "응답을 해석하지 못했다";
      throw new KmaError(`기상청 ${operation}: ${describe(code, msg)}`, code, operation);
    }

    const portal = json.OpenAPI_ServiceResponse?.cmmMsgHeader;
    if (portal) {
      const code = portal.returnReasonCode ?? null;
      const msg = portal.errMsg ?? portal.returnAuthMsg ?? "포털 오류";
      throw new KmaError(`기상청 ${operation}: ${describe(code, msg)}`, code, operation);
    }

    const header = json.response?.header;
    const resultCode = header?.resultCode ?? null;
    if (resultCode !== RESULT_OK) {
      const msg = header?.resultMsg ?? "제공기관 오류";
      throw new KmaError(`기상청 ${operation}: ${describe(resultCode, msg)}`, resultCode, operation);
    }

    return itemsOf(json);
  }
}
