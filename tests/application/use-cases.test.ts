import { describe, expect, it } from "vitest";
import type { Locale } from "@/domain/shared/locale";
import type { Page } from "@/domain/shared/paging";
import type { Spot, SpotId } from "@/domain/spot/spot";
import { EMPTY_FACTS } from "@/domain/spot/spot-detail";
import type {
  ListSpotsQuery,
  NearbySpotsQuery,
  SpotRepository,
} from "@/domain/spot/spot-repository";
import { makeFindSpotInLocale } from "@/application/spot/find-spot-in-locale";
import { makeGetSpotDetail } from "@/application/spot/get-spot-detail";
import { makeListAreas, makeListDistricts } from "@/application/spot/list-regions";
import {
  InvalidCoordinateError,
  makeListNearbySpots,
} from "@/application/spot/list-nearby-spots";
import { makeListSpots } from "@/application/spot/list-spots";

function spot(over: Partial<Spot> & { id: SpotId }): Spot {
  return {
    name: { primary: "A", korean: "가" },
    category: "attraction",
    address: null,
    areaCode: 1,
    districtCode: 23,
    coordinate: { lng: 127, lat: 37.5 },
    image: { url: "https://a/1.jpg", thumbnailUrl: null, copyright: "Type3" },
    tel: null,
    classification: "HS010100",
    modifiedAt: null,
    ...over,
  };
}

/** 유스케이스만 검사하기 위한 대역. 도메인 인터페이스만 만족하면 된다. */
class FakeRepo implements SpotRepository {
  lastList: ListSpotsQuery | null = null;
  lastNearby: NearbySpotsQuery | null = null;
  constructor(private readonly items: Spot[]) {}
  private page(items: Spot[]): Page<Spot> {
    return { items, page: 1, size: 9, reportedTotal: 999, hasMore: false };
  }
  async list(q: ListSpotsQuery) {
    this.lastList = q;
    return this.page(this.items);
  }
  async nearby(q: NearbySpotsQuery) {
    this.lastNearby = q;
    return this.page(this.items);
  }
  async findDetail(id: SpotId) {
    const spot = this.items.find(
      (s) => s.id.contentId === id.contentId && s.id.locale === id.locale,
    );
    if (!spot) return null;
    return {
      spot,
      overview: "설명",
      homepage: "https://example.com",
      facts: { ...EMPTY_FACTS, openingHours: "09:00-18:00" },
    };
  }
  lastDistrictsArea: number | null = null;
  lastKoreanName: string | null = null;
  async findByKoreanName(locale: Locale, koreanName: string) {
    this.lastKoreanName = koreanName;
    const hit = this.items.find((s) => s.name.korean === koreanName);
    return hit ? { contentId: hit.id.contentId, locale } : null;
  }
  async listAreas() {
    return [
      { code: 1, name: "Seoul" },
      { code: 31, name: "Gyeonggi-do" },
    ];
  }
  async listDistricts(_locale: Locale, areaCode: number) {
    this.lastDistrictsArea = areaCode;
    return [{ code: 23, name: "Jongno-gu" }];
  }
}

describe("listSpots", () => {
  it("공급자 정렬을 믿지 않고 도메인 판정으로 한 번 더 거른다", async () => {
    // arrange=Q 는 필터가 아니라 정렬이라 뒷페이지에 이미지 없는 항목이 섞인다.
    // .curvez/research/tourapi-manual-v44.md 사실 6
    const repo = new FakeRepo([
      spot({ id: { contentId: "ok", locale: "en" } }),
      spot({ id: { contentId: "noimg", locale: "en" }, image: null }),
      spot({ id: { contentId: "clinic", locale: "en" }, classification: "EX050800" }),
      spot({ id: { contentId: "jjimjilbang", locale: "en" }, classification: "EX050200" }),
    ]);
    const listSpots = makeListSpots(repo);
    const out = await listSpots({ locale: "en", category: "attraction" });
    expect(out.items.map((i) => i.contentId)).toEqual(["ok", "jjimjilbang"]);
  });

  it("기본 페이지 크기가 9다", async () => {
    // 한 벽에 6~9개만 건다 (GOAL.md §0.5-3)
    const repo = new FakeRepo([]);
    await makeListSpots(repo)({ locale: "en", category: "attraction" });
    expect(repo.lastList?.page).toEqual({ page: 1, size: 9 });
  });

  it("자치구를 그대로 전달한다", async () => {
    const repo = new FakeRepo([]);
    await makeListSpots(repo)({ locale: "ko", category: "food", districtCode: 23 });
    expect(repo.lastList?.districtCode).toBe(23);
    expect(repo.lastList?.locale).toBe("ko");
    expect(repo.lastList?.category).toBe("food");
  });

  it("크롭 가능 여부를 뷰에 담는다", async () => {
    const repo = new FakeRepo([
      spot({
        id: { contentId: "t1", locale: "en" },
        image: { url: "u", thumbnailUrl: null, copyright: "Type1" },
      }),
    ]);
    const out = await makeListSpots(repo)({ locale: "en", category: "attraction" });
    expect(out.items[0].imageCroppable).toBe(true);
  });

  it("한글 원명을 뷰에 담는다", async () => {
    const repo = new FakeRepo([
      spot({ id: { contentId: "t", locale: "en" }, name: { primary: "Palace", korean: "경복궁" } }),
    ]);
    const out = await makeListSpots(repo)({ locale: "en", category: "attraction" });
    expect(out.items[0].titlePrimary).toBe("Palace");
    expect(out.items[0].titleKorean).toBe("경복궁");
  });
});

describe("listNearbySpots", () => {
  it("좌표가 유효하지 않으면 던진다", async () => {
    const run = makeListNearbySpots(new FakeRepo([]));
    await expect(run({ locale: "en", lng: 999, lat: 0, radiusMeters: 1000 })).rejects.toBeInstanceOf(
      InvalidCoordinateError,
    );
  });

  it("공급자 반경 상한으로 잘라 넘긴다", async () => {
    const repo = new FakeRepo([]);
    await makeListNearbySpots(repo)({
      locale: "en",
      lng: 126.98,
      lat: 37.57,
      radiusMeters: 99_000,
    });
    expect(repo.lastNearby?.radiusMeters).toBe(20_000);
  });

  it("가까운 순으로 정렬한다", async () => {
    const center = { lng: 126.9784, lat: 37.5666 };
    const repo = new FakeRepo([
      spot({ id: { contentId: "far", locale: "en" }, coordinate: { lng: 127.1, lat: 37.65 } }),
      spot({ id: { contentId: "near", locale: "en" }, coordinate: { lng: 126.979, lat: 37.567 } }),
    ]);
    const out = await makeListNearbySpots(repo)({
      locale: "en",
      lng: center.lng,
      lat: center.lat,
      radiusMeters: 20_000,
    });
    expect(out.items.map((i) => i.contentId)).toEqual(["near", "far"]);
  });
});

describe("getSpotDetail", () => {
  it("벽 판정을 적용하지 않는다", async () => {
    // 직접 링크나 공유로 들어온 스팟은 이미지가 없어도 보여준다
    const repo = new FakeRepo([spot({ id: { contentId: "x", locale: "en" }, image: null })]);
    const out = await makeGetSpotDetail(repo)({ locale: "en", contentId: "x" });
    expect(out?.contentId).toBe("x");
    expect(out?.imageUrl).toBeNull();
  });

  it("값이 없는 사실도 행으로 넘긴다", async () => {
    // 빈 항목을 숨기면 "정보가 없다" 와 "그런 항목이 없다" 가 구분되지 않는다 (GOAL.md §5-3)
    const repo = new FakeRepo([spot({ id: { contentId: "x", locale: "en" } })]);
    const out = await makeGetSpotDetail(repo)({ locale: "en", contentId: "x" });
    expect(out!.facts.map((f) => f.key)).toEqual([
      "openingHours",
      "closedDays",
      "admission",
      "inquiry",
      "parking",
    ]);
    expect(out!.facts.find((f) => f.key === "openingHours")?.value).toBe("09:00-18:00");
    expect(out!.facts.find((f) => f.key === "parking")?.value).toBeNull();
  });

  it("다른 로케일의 id 로는 찾지 못한다", async () => {
    const repo = new FakeRepo([spot({ id: { contentId: "1349267", locale: "en" } })]);
    expect(await makeGetSpotDetail(repo)({ locale: "ko", contentId: "1349267" })).toBeNull();
  });

  it("빈 contentId 는 조회하지 않는다", async () => {
    const repo = new FakeRepo([]);
    expect(await makeGetSpotDetail(repo)({ locale: "en", contentId: "  " })).toBeNull();
  });
});

describe("findSpotInLocale", () => {
  it("한글 원명이 같은 스팟의 ID 를 돌려준다", async () => {
    // 로케일마다 contentid 공간이 분리돼 있어(실측) 두 카탈로그를 잇는 값은
    // 제목에 병기된 한글 원명뿐이다
    const repo = new FakeRepo([
      spot({ id: { contentId: "a", locale: "en" }, name: { primary: "X", korean: "경복궁" } }),
    ]);
    expect(await makeFindSpotInLocale(repo)("en", "경복궁")).toBe("a");
  });

  it("없으면 null 이다 — 비슷한 것을 돌려주지 않는다", async () => {
    // 다른 장소로 보내는 것은 목록으로 보내는 것보다 나쁘다
    const repo = new FakeRepo([
      spot({ id: { contentId: "a", locale: "en" }, name: { primary: "X", korean: "경복궁역점" } }),
    ]);
    expect(await makeFindSpotInLocale(repo)("en", "경복궁")).toBeNull();
  });
});

describe("listAreas", () => {
  it("코드와 이름을 그대로 넘긴다", async () => {
    const out = await makeListAreas(new FakeRepo([]))("en");
    expect(out).toEqual([
      { code: 1, name: "Seoul" },
      { code: 31, name: "Gyeonggi-do" },
    ]);
  });
});

describe("listDistricts", () => {
  it("코드와 이름을 그대로 넘긴다", async () => {
    const out = await makeListDistricts(new FakeRepo([]))("en", 1);
    expect(out).toEqual([{ code: 23, name: "Jongno-gu" }]);
  });

  it("시도를 저장소까지 그대로 전달한다", async () => {
    // 시군구 코드는 시도 안에서만 고유하다. 시도가 유실되면 다른 지역의
    // 같은 번호를 조회하게 되는데, 그 오류는 이름이 그럴듯해서 눈에 안 띈다
    const repo = new FakeRepo([]);
    await makeListDistricts(repo)("en", 31);
    expect(repo.lastDistrictsArea).toBe(31);
  });
});

describe("listSpots — 지역 전달", () => {
  it("시도와 시군구를 저장소 질의로 그대로 넘긴다", async () => {
    const repo = new FakeRepo([]);
    await makeListSpots(repo)({
      locale: "en",
      category: "attraction",
      areaCode: 31,
      districtCode: 5,
    });
    expect(repo.lastList?.areaCode).toBe(31);
    expect(repo.lastList?.districtCode).toBe(5);
  });

  it("지역을 주지 않으면 질의에도 없다 — 그것이 전국이다", async () => {
    const repo = new FakeRepo([]);
    await makeListSpots(repo)({ locale: "en", category: "attraction" });
    expect(repo.lastList?.areaCode).toBeUndefined();
    expect(repo.lastList?.districtCode).toBeUndefined();
  });
});
