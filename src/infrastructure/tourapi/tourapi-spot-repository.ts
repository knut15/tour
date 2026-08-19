import type { Locale } from "@/domain/shared/locale";
import { DEFAULT_PAGE, type Page } from "@/domain/shared/paging";
import { contentTypeIdOf } from "@/domain/spot/category";
import { SEOUL_AREA_CODE, type District } from "@/domain/spot/district";
import type { Spot, SpotId } from "@/domain/spot/spot";
import { EMPTY_FACTS, type SpotDetail } from "@/domain/spot/spot-detail";
import type {
  ListSpotsQuery,
  NearbySpotsQuery,
  SpotRepository,
} from "@/domain/spot/spot-repository";
import {
  ARRANGE_IMAGE_FIRST,
  TourApiClient,
  TourApiError,
} from "@/infrastructure/tourapi/tourapi-client";
import { toSpot } from "@/infrastructure/tourapi/tourapi-mapper";
import { toNumber } from "@/infrastructure/tourapi/tourapi-types";
import {
  stripHtml,
  toFacts,
  toHomepageUrl,
} from "@/infrastructure/tourapi/tourapi-detail-mapper";

export class TourApiSpotRepository implements SpotRepository {
  constructor(private readonly client: TourApiClient) {}

  async list(query: ListSpotsQuery): Promise<Page<Spot>> {
    const { page, size } = query.page ?? DEFAULT_PAGE;
    const result = await this.client.call(query.locale, "areaBasedList2", {
      numOfRows: size,
      pageNo: page,
      arrange: ARRANGE_IMAGE_FIRST,
      contentTypeId: contentTypeIdOf(query.category, query.locale),
      // areaCode 는 매뉴얼 v4.4 에 문서화돼 있지 않지만 실측상 동작한다.
      // 폐기되면 lDongRegnCd(서울=11)로 갈아탄다. 그 변경은 이 파일 안에서 끝난다.
      // 근거: .curvez/research/tourapi-manual-v44.md 사실 14
      areaCode: SEOUL_AREA_CODE,
      sigunguCode: query.districtCode,
    });

    const items = result.items
      .map((i) => toSpot(i, query.locale, query.category))
      .filter((s): s is Spot => s !== null);

    return {
      items,
      page,
      size,
      reportedTotal: result.totalCount,
      hasMore: result.items.length >= size,
    };
  }

  async nearby(query: NearbySpotsQuery): Promise<Page<Spot>> {
    const { page, size } = query.page ?? DEFAULT_PAGE;
    const result = await this.client.call(query.locale, "locationBasedList2", {
      numOfRows: size,
      pageNo: page,
      arrange: ARRANGE_IMAGE_FIRST,
      mapX: query.center.lng,
      mapY: query.center.lat,
      radius: query.radiusMeters,
      contentTypeId: query.category
        ? contentTypeIdOf(query.category, query.locale)
        : undefined,
    });

    const items = result.items
      .map((i) => toSpot(i, query.locale, query.category))
      .filter((s): s is Spot => s !== null);

    return {
      items,
      page,
      size,
      reportedTotal: result.totalCount,
      hasMore: result.items.length >= size,
    };
  }

  async findDetail(id: SpotId): Promise<SpotDetail | null> {
    let common;
    try {
      // detailCommon2 에 contentTypeId 를 함께 주면 응답이 깨진다. contentId 만 넘긴다.
      // 근거: .curvez/research/tourapi-english-coverage.md 사실 10
      common = await this.client.call(id.locale, "detailCommon2", {
        contentId: id.contentId,
        numOfRows: 1,
        pageNo: 1,
      });
    } catch (e) {
      if (e instanceof TourApiError && e.code === "03") return null; // 데이터 없음은 실패가 아니다
      throw e;
    }

    const raw = common.items[0];
    if (!raw) return null;
    const spot = toSpot(raw, id.locale);
    if (!spot) return null;

    // detailIntro2 는 반대로 contentTypeId 가 **필수**다. 두 오퍼레이션의 규칙이 정반대다.
    let intro;
    try {
      intro = await this.client.call(id.locale, "detailIntro2", {
        contentId: id.contentId,
        contentTypeId: contentTypeIdOf(spot.category, id.locale),
        numOfRows: 1,
        pageNo: 1,
      });
    } catch {
      // 사실 조회가 실패해도 스팟 자체는 보여준다. 화면이 "정보 없음" 으로 표시한다
      intro = null;
    }

    return {
      spot,
      overview: stripHtml(raw.overview as string | undefined) || null,
      homepage: toHomepageUrl(raw.homepage as string | undefined),
      facts: intro ? toFacts(intro.items[0], spot.category) : EMPTY_FACTS,
    };
  }

  async listDistricts(locale: Locale): Promise<District[]> {
    const result = await this.client.call(locale, "areaCode2", {
      numOfRows: 30,
      pageNo: 1,
      areaCode: SEOUL_AREA_CODE,
    });
    return result.items
      .map((i) => ({ code: toNumber(i.code), name: i.name?.trim() ?? "" }))
      .filter((d) => Number.isInteger(d.code) && d.name.length > 0);
  }
}
