import type { Locale } from "@/domain/shared/locale";
import type { TourApiConfig } from "@/infrastructure/config/env";
import { normalizeItems, type TourApiItem, type TourApiResponse } from "@/infrastructure/tourapi/tourapi-types";

/**
 * 로케일별 서비스 경로.
 * **국문과 영문은 별개 서비스이고 contentid 공간도 분리돼 있다.**
 * 근거: .curvez/research/tourapi-english-coverage.md 사실 9
 */
const SERVICE: Record<Locale, string> = {
  ko: "KorService2",
  en: "EngService2",
};

const BASE = "https://apis.data.go.kr/B551011";

/**
 * 정렬 구분.
 * `Q` 는 "대표 이미지가 반드시 있는 정렬(수정일순)" 이다. 필터가 아니라 정렬이므로
 * totalCount 는 필터 전 값이 오고 뒷페이지에는 이미지 없는 항목이 나온다.
 * 이 앱은 앞쪽 한두 페이지만 쓰므로 실용적으로 필터처럼 동작한다.
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 5·6
 */
export const ARRANGE_IMAGE_FIRST = "Q";

export class TourApiError extends Error {
  constructor(
    message: string,
    readonly code: string | null,
    readonly operation: string,
  ) {
    super(message);
    this.name = "TourApiError";
  }
}

export type TourApiPage = {
  items: TourApiItem[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
};

/**
 * 개발계정 한도는 **일 1,000건**이다. 카테고리 4개 × 자치구 25개 조합만 훑어도 10% 를 쓴다.
 * 그래서 캐싱이 선택이 아니라 필수다.
 * 근거: .curvez/research/tourapi-manual-v44.md 사실 3
 */
const DEFAULT_REVALIDATE_SECONDS = 60 * 60 * 12;

export class TourApiClient {
  constructor(
    private readonly config: TourApiConfig,
    private readonly revalidateSeconds: number = DEFAULT_REVALIDATE_SECONDS,
  ) {}

  async call(
    locale: Locale,
    operation: string,
    params: Record<string, string | number | undefined>,
  ): Promise<TourApiPage> {
    const url = new URL(`${BASE}/${SERVICE[locale]}/${operation}`);
    // serviceKey 는 디코딩 형태여야 한다. URLSearchParams 가 인코딩을 책임진다.
    url.searchParams.set("serviceKey", this.config.serviceKey);
    url.searchParams.set("MobileOS", "ETC");
    url.searchParams.set("MobileApp", this.config.appName);
    url.searchParams.set("_type", "json");
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === "") continue;
      url.searchParams.set(k, String(v));
    }

    const res = await fetch(url, {
      next: { revalidate: this.revalidateSeconds },
    });

    const text = await res.text();
    let json: TourApiResponse;
    try {
      json = JSON.parse(text) as TourApiResponse;
    } catch {
      // 포털 오류는 XML 로 오는 경우가 있다
      const code = text.match(/<returnReasonCode>(\d+)<\/returnReasonCode>/)?.[1] ?? null;
      const msg = text.match(/<returnAuthMsg>([^<]+)<\/returnAuthMsg>/)?.[1] ?? "응답을 해석하지 못했다";
      throw new TourApiError(msg, code, operation);
    }

    const portalError = json.OpenAPI_ServiceResponse?.cmmMsgHeader;
    if (portalError) {
      throw new TourApiError(
        portalError.returnAuthMsg ?? portalError.errMsg ?? "포털 오류",
        portalError.returnReasonCode ?? null,
        operation,
      );
    }

    const header = json.response?.header;
    if (header?.resultCode && header.resultCode !== "0000") {
      throw new TourApiError(header.resultMsg ?? "제공기관 오류", header.resultCode, operation);
    }

    const body = json.response?.body;
    return {
      items: normalizeItems(body),
      totalCount: body?.totalCount ?? 0,
      pageNo: body?.pageNo ?? 1,
      numOfRows: body?.numOfRows ?? 0,
    };
  }
}
