import { describe, expect, it } from "vitest";
import { toSpot } from "@/infrastructure/tourapi/tourapi-mapper";
import type { TourApiItem } from "@/infrastructure/tourapi/tourapi-types";

/** 실제 EngService2 응답에서 관찰한 형태 */
const REAL_EN: TourApiItem = {
  contentid: "3365278",
  contenttypeid: "76",
  title: "1stbutton Rhinoplasty clinic (첫단추의원)",
  addr1: "(12th Floor, Cheongho Building), 483 Gangnam-daero, Seocho-gu, Seoul",
  addr2: "",
  areacode: "1",
  sigungucode: "15",
  mapx: "127.0236686375",
  mapy: "37.5053871607",
  firstimage: "",
  firstimage2: "",
  cpyrhtDivCd: "",
  tel: "",
  modifiedtime: "20251023143000",
  lclsSystm1: "EX",
  lclsSystm2: "EX05",
  lclsSystm3: "EX050800",
};

describe("toSpot", () => {
  it("실제 응답을 도메인 엔티티로 옮긴다", () => {
    const spot = toSpot(REAL_EN, "en");
    expect(spot).not.toBeNull();
    expect(spot!.id).toEqual({ contentId: "3365278", locale: "en" });
    expect(spot!.name.primary).toBe("1stbutton Rhinoplasty clinic");
    expect(spot!.name.korean).toBe("첫단추의원");
    expect(spot!.category).toBe("attraction");
    expect(spot!.districtCode).toBe(15);
    expect(spot!.coordinate).toEqual({ lng: 127.0236686375, lat: 37.5053871607 });
    expect(spot!.image).toBeNull();
    expect(spot!.classification).toBe("EX050800");
    expect(spot!.tel).toBeNull();
  });

  it("contentid 나 title 이 없으면 버린다", () => {
    expect(toSpot({ ...REAL_EN, contentid: "" }, "en")).toBeNull();
    expect(toSpot({ ...REAL_EN, title: "" }, "en")).toBeNull();
  });

  it("모르는 contentTypeId 는 fallback 으로 살린다", () => {
    // detailCommon2 는 contenttypeid 를 빼고 줄 수 있다
    expect(toSpot({ ...REAL_EN, contenttypeid: "" }, "en")).toBeNull();
    expect(toSpot({ ...REAL_EN, contenttypeid: "" }, "en", "culture")?.category).toBe("culture");
  });

  it("서울 밖 sigungucode 는 null 로 둔다", () => {
    expect(toSpot({ ...REAL_EN, sigungucode: "99" }, "en")?.districtCode).toBeNull();
    expect(toSpot({ ...REAL_EN, sigungucode: "" }, "en")?.districtCode).toBeNull();
  });

  it("좌표가 깨지면 null 로 둔다", () => {
    expect(toSpot({ ...REAL_EN, mapx: "", mapy: "" }, "en")?.coordinate).toBeNull();
  });

  it("이미지와 저작권을 함께 옮긴다", () => {
    const spot = toSpot(
      { ...REAL_EN, firstimage: "https://a/1.jpg", firstimage2: "https://a/2.jpg", cpyrhtDivCd: "Type3" },
      "en",
    );
    expect(spot!.image).toEqual({
      url: "https://a/1.jpg",
      thumbnailUrl: "https://a/2.jpg",
      copyright: "Type3",
    });
  });

  it("주소는 addr1 과 addr2 를 합친다", () => {
    expect(toSpot({ ...REAL_EN, addr1: "A", addr2: "B" }, "en")?.address).toBe("A B");
    expect(toSpot({ ...REAL_EN, addr1: "", addr2: "" }, "en")?.address).toBeNull();
  });
});
