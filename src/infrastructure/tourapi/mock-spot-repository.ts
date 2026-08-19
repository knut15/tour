import type { Locale } from "@/domain/shared/locale";
import { DEFAULT_PAGE, type Page } from "@/domain/shared/paging";
import { contentTypeIdOf } from "@/domain/spot/category";
import { distanceMeters } from "@/domain/spot/coordinate";
import type { Area, AreaCode, District } from "@/domain/spot/region";
import type { Spot, SpotId } from "@/domain/spot/spot";
import { EMPTY_FACTS, type SpotDetail } from "@/domain/spot/spot-detail";
import type {
  ListSpotsQuery,
  NearbySpotsQuery,
  SpotRepository,
} from "@/domain/spot/spot-repository";
import { toSpot } from "@/infrastructure/tourapi/tourapi-mapper";
import {
  MOCK_AREAS_EN,
  MOCK_AREAS_KO,
  MOCK_DISTRICTS_EN,
  MOCK_DISTRICTS_KO,
  MOCK_EN,
  MOCK_KO,
} from "@/infrastructure/tourapi/mock-data";
import { toNumber, type TourApiItem } from "@/infrastructure/tourapi/tourapi-types";

/**
 * 키 없이 화면을 만들기 위한 구현.
 * **실데이터 구현과 같은 인터페이스를 만족한다.** `USE_MOCK_DATA` 플래그만 끄면 교체된다.
 */
export class MockSpotRepository implements SpotRepository {
  private raw(locale: Locale): TourApiItem[] {
    return locale === "ko" ? MOCK_KO : MOCK_EN;
  }

  private spots(locale: Locale): Spot[] {
    return this.raw(locale)
      .map((i) => toSpot(i, locale))
      .filter((s): s is Spot => s !== null);
  }

  private paginate<T>(items: T[], page: number, size: number): Page<T> {
    const start = (page - 1) * size;
    const slice = items.slice(start, start + size);
    return {
      items: slice,
      page,
      size,
      reportedTotal: items.length,
      hasMore: start + size < items.length,
    };
  }

  async list(query: ListSpotsQuery): Promise<Page<Spot>> {
    const { page, size } = query.page ?? DEFAULT_PAGE;
    const wanted = contentTypeIdOf(query.category, query.locale);
    const filtered = this.spots(query.locale).filter((s) => {
      const raw = this.raw(query.locale).find((r) => r.contentid === s.id.contentId);
      if (toNumber(raw?.contenttypeid) !== wanted) return false;
      if (query.areaCode && s.areaCode !== query.areaCode) return false;
      // 시도 없이 온 시군구 코드는 실제 구현과 마찬가지로 무시한다
      if (query.areaCode && query.districtCode && s.districtCode !== query.districtCode) {
        return false;
      }
      return true;
    });
    // 실제 API 의 arrange=Q 를 흉내낸다 — 이미지 있는 것이 앞으로 온다
    filtered.sort((a, b) => Number(Boolean(b.image)) - Number(Boolean(a.image)));
    return this.paginate(filtered, page, size);
  }

  async nearby(query: NearbySpotsQuery): Promise<Page<Spot>> {
    const { page, size } = query.page ?? DEFAULT_PAGE;
    const wanted = query.category
      ? contentTypeIdOf(query.category, query.locale)
      : null;
    const filtered = this.spots(query.locale)
      .filter((s) => {
        if (!s.coordinate) return false;
        if (distanceMeters(query.center, s.coordinate) > query.radiusMeters) return false;
        if (wanted === null) return true;
        const raw = this.raw(query.locale).find((r) => r.contentid === s.id.contentId);
        return toNumber(raw?.contenttypeid) === wanted;
      })
      .sort((a, b) => {
        if (!a.coordinate || !b.coordinate) return 0;
        return (
          distanceMeters(query.center, a.coordinate) -
          distanceMeters(query.center, b.coordinate)
        );
      });
    return this.paginate(filtered, page, size);
  }

  async findDetail(id: SpotId): Promise<SpotDetail | null> {
    const spot = this.spots(id.locale).find((s) => s.id.contentId === id.contentId);
    if (!spot) return null;
    const raw = this.raw(id.locale).find((r) => r.contentid === id.contentId);
    return {
      spot,
      overview: raw?.overview ?? null,
      homepage: raw?.homepage ?? null,
      facts: {
        ...EMPTY_FACTS,
        openingHours: raw?.usetime ?? null,
        closedDays: raw?.restdate ?? null,
        inquiry: raw?.infocenter ?? null,
      },
    };
  }

  async listAreas(locale: Locale): Promise<Area[]> {
    const raw = locale === "ko" ? MOCK_AREAS_KO : MOCK_AREAS_EN;
    return raw.map((a) => ({ code: toNumber(a.code), name: a.name ?? "" }));
  }

  async listDistricts(locale: Locale, areaCode: AreaCode): Promise<District[]> {
    // 목이 시군구를 가진 시도는 서울뿐이다
    if (areaCode !== 1) return [];
    const raw = locale === "ko" ? MOCK_DISTRICTS_KO : MOCK_DISTRICTS_EN;
    return raw.map((d) => ({ code: toNumber(d.code), name: d.name ?? "" }));
  }
}
