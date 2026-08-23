import type { Locale } from "@/domain/shared/locale";
import { DEFAULT_PAGE, type Page } from "@/domain/shared/paging";
import { contentTypeIdOf } from "@/domain/spot/category";
import type { Area, AreaCode, District } from "@/domain/spot/region";
import { parseSpotName, type Spot, type SpotId } from "@/domain/spot/spot";
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

/**
 * 한글명 검색에서 훑을 후보 수.
 *
 * 정확 일치가 상위에 오지 않는 경우가 있어 1건만 보면 놓친다. 반대로 너무 늘리면
 * 이름이 우연히 겹치는 다른 장소까지 후보가 된다 — 정확 일치 판정이 있어 위험은
 * 낮지만 응답만 무거워진다.
 */
const SEARCH_CANDIDATES = 20;

export class TourApiSpotRepository implements SpotRepository {
  constructor(private readonly client: TourApiClient) {}

  async list(query: ListSpotsQuery): Promise<Page<Spot>> {
    const { page, size } = query.page ?? DEFAULT_PAGE;
    const keyword = query.keyword?.trim();

    /*
      **검색어가 있으면 다른 엔드포인트다.** `areaBasedList2` 에는 키워드 파라미터가
      없어 여기서 갈라진다. 나머지 조건(분류·지역·정렬·쪽)은 이름이 같고 뜻도 같아
      그대로 넘긴다 — 검색이 필터를 대신하지 않는다.

      실측 2026-08-23: 국문 관광지에서 "박물관" 은 22건, `areaCode=1` 을 함께 주면
      2건이다. 두 조건이 곱해진다.
    */
    const result = await this.client.call(
      query.locale,
      keyword ? "searchKeyword2" : "areaBasedList2",
      {
      numOfRows: size,
      pageNo: page,
      arrange: ARRANGE_IMAGE_FIRST,
      keyword,
      contentTypeId: contentTypeIdOf(query.category, query.locale),
      // areaCode 는 매뉴얼 v4.4 에 문서화돼 있지 않지만 실측상 동작한다.
      // 폐기되면 lDongRegnCd 로 갈아탄다. 그 변경은 이 파일 안에서 끝난다.
      // 근거: .curvez/research/tourapi-manual-v44.md 사실 14
      //
      // **둘 다 생략하면 전국이다.** 실측 2026-08-19: 관광지(76) 전국 2,599건,
      // areaCode=1 로 좁히면 405건.
      areaCode: query.areaCode,
      // 시도 없는 시군구 코드는 어느 지역인지 정해지지 않는다. 함께 없을 때만 보낸다
      sigunguCode: query.areaCode ? query.districtCode : undefined,
      },
    );

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

  /**
   * 한글 원명으로 그 로케일의 카탈로그를 뒤진다.
   *
   * `searchKeyword2` 는 한글 키워드를 영문·일문 서비스에서도 받는다 —
   * 제목에 한글 원명이 괄호로 병기돼 있기 때문이다
   * (`Gyeongbokgung Palace (경복궁)`). 실측 2026-08-19.
   *
   * **상위 1건을 믿지 않는다.** 일문 서비스에서 `경복궁` 을 찾으면 상위 셋이
   * 전부 "경복궁역점" 면세점이었다. 이름이 정확히 같은 것만 고른다.
   */
  async findByKoreanName(locale: Locale, koreanName: string): Promise<SpotId | null> {
    const wanted = koreanName.trim();
    if (!wanted) return null;

    let result;
    try {
      result = await this.client.call(locale, "searchKeyword2", {
        numOfRows: SEARCH_CANDIDATES,
        pageNo: 1,
        keyword: wanted,
      });
    } catch {
      // 못 찾은 것과 같이 다룬다. 부르는 쪽이 목록으로 보낸다
      return null;
    }

    for (const item of result.items) {
      const title = item.title?.trim();
      const contentId = item.contentid?.trim();
      if (!title || !contentId) continue;
      if (parseSpotName(title, locale).korean === wanted) {
        return { contentId, locale };
      }
    }
    return null;
  }

  /** `areaCode` 를 빼면 시도 목록이 온다. 실측 17건 */
  async listAreas(locale: Locale): Promise<Area[]> {
    return this.regions(locale, undefined, 30);
  }

  /** 시군구 최대 개수는 경기도의 31개다. 상한을 넉넉히 잡는다 */
  async listDistricts(locale: Locale, areaCode: AreaCode): Promise<District[]> {
    return this.regions(locale, areaCode, 60);
  }

  private async regions(
    locale: Locale,
    areaCode: AreaCode | undefined,
    numOfRows: number,
  ): Promise<Area[]> {
    const result = await this.client.call(locale, "areaCode2", {
      numOfRows,
      pageNo: 1,
      areaCode,
    });
    return result.items
      .map((i) => ({ code: toNumber(i.code), name: i.name?.trim() ?? "" }))
      .filter((r) => Number.isInteger(r.code) && r.name.length > 0);
  }
}
