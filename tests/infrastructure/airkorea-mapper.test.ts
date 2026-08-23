import { describe, expect, it } from "vitest";
import { toAirQualityReading, toKstIso } from "@/infrastructure/airkorea/airkorea-mapper";
import { sidoNameOf } from "@/infrastructure/airkorea/airkorea-sido";
import { itemsOf, type AirkoreaItem } from "@/infrastructure/airkorea/airkorea-types";
import { DEFAULT_WEATHER_POINT } from "@/domain/weather/location";

/**
 * 2026-08-19 19시 `getCtprvnRltmMesureDnsty`(sidoName=서울, ver=1.3) 실제 응답에서
 * 다섯 측정소를 그대로 옮긴 것이다. 도로변대기 두 곳이 섞여 있는 것도 실제와 같다.
 */
const REAL_SEOUL: AirkoreaItem[] = [
  {
    stationName: "강남구",
    mangName: "도시대기",
    dataTime: "2026-08-19 19:00",
    pm10Value: "38",
    pm25Value: "28",
    pm10Flag: null,
    pm25Flag: null,
  },
  {
    stationName: "서초구",
    mangName: "도시대기",
    dataTime: "2026-08-19 19:00",
    pm10Value: "41",
    pm25Value: "28",
    pm10Flag: null,
    pm25Flag: null,
  },
  {
    stationName: "중구",
    mangName: "도시대기",
    dataTime: "2026-08-19 19:00",
    pm10Value: "33",
    pm25Value: "27",
    pm10Flag: null,
    pm25Flag: null,
  },
  {
    stationName: "도산대로",
    mangName: "도로변대기",
    dataTime: "2026-08-19 19:00",
    pm10Value: "38",
    pm25Value: "20",
    pm10Flag: null,
    pm25Flag: null,
  },
  {
    stationName: "강남대로",
    mangName: "도로변대기",
    dataTime: "2026-08-19 19:00",
    pm10Value: "31",
    pm25Value: "25",
    pm10Flag: null,
    pm25Flag: null,
  },
];

describe("toAirQualityReading", () => {
  it("도시대기 측정소만 세어 중앙값을 낸다", () => {
    const reading = toAirQualityReading(REAL_SEOUL, "서울");
    // 도시대기 PM10 33·38·41 → 38, PM2.5 27·28·28 → 28
    expect(reading).toEqual({
      pm10: 38,
      pm25: 28,
      stationName: "서울",
      observedAt: "2026-08-19T19:00:00+09:00",
    });
  });

  it("짝수 개면 가운데 둘의 평균을 반올림한다", () => {
    const items = REAL_SEOUL.filter((i) => i.mangName === "도시대기").slice(0, 2);
    // PM10 38·41 → 39.5 → 40
    expect(toAirQualityReading(items, "서울")?.pm10).toBe(40);
  });

  it("고장난 측정소 하나에 끌려가지 않는다", () => {
    const items: AirkoreaItem[] = [
      ...REAL_SEOUL,
      {
        stationName: "이상치",
        mangName: "도시대기",
        dataTime: "2026-08-19 19:00",
        pm10Value: "600",
        pm25Value: "600",
      },
    ];
    // 평균이면 132 가 되지만 중앙값은 38·41 사이에 머문다
    expect(toAirQualityReading(items, "서울")?.pm10).toBe(40);
  });

  it('`"-"` 와 빈 값은 결측이다', () => {
    // 세종 응답 실측: pm25Value "-" + pm25Flag "통신장애"
    const items: AirkoreaItem[] = [
      {
        stationName: "아름동",
        mangName: "도시대기",
        dataTime: "2026-08-19 19:00",
        pm10Value: "6",
        pm25Value: "-",
        pm10Flag: null,
        pm25Flag: "통신장애",
      },
      {
        stationName: "신흥동",
        mangName: "도시대기",
        dataTime: "2026-08-19 19:00",
        pm10Value: "",
        pm25Value: "12",
      },
    ];
    const reading = toAirQualityReading(items, "세종");
    expect(reading?.pm10).toBe(6);
    expect(reading?.pm25).toBe(12);
  });

  it("플래그가 붙은 값은 숫자가 들어 있어도 믿지 않는다", () => {
    const items: AirkoreaItem[] = [
      {
        stationName: "점검중",
        mangName: "도시대기",
        dataTime: "2026-08-19 19:00",
        pm10Value: "13",
        pm25Value: "9",
        pm10Flag: "점검및교정",
        pm25Flag: "점검및교정",
      },
    ];
    expect(toAirQualityReading(items, "서울")).toBeNull();
  });

  it("둘 다 결측이면 null 이다 — 보여줄 숫자가 없으면 칸을 비운다", () => {
    expect(toAirQualityReading([], "서울")).toBeNull();
  });

  it("한쪽만 결측이면 나머지는 살린다", () => {
    const items: AirkoreaItem[] = [
      {
        stationName: "강남구",
        mangName: "도시대기",
        dataTime: "2026-08-19 19:00",
        pm10Value: "38",
        pm25Value: "-",
      },
    ];
    const reading = toAirQualityReading(items, "서울");
    expect(reading?.pm10).toBe(38);
    expect(reading?.pm25).toBeNull();
  });

  it("측정망 이름이 통째로 없으면 전체를 쓴다", () => {
    const items = REAL_SEOUL.map((item) => ({ ...item, mangName: undefined }));
    // 5곳 PM10 31·33·38·38·41 → 38
    expect(toAirQualityReading(items, "서울")?.pm10).toBe(38);
  });

  it("측정시각이 어긋나면 가장 최근 것을 쓴다", () => {
    const items: AirkoreaItem[] = [
      { ...REAL_SEOUL[0], dataTime: "2026-08-19 18:00" },
      { ...REAL_SEOUL[1], dataTime: "2026-08-19 19:00" },
    ];
    expect(toAirQualityReading(items, "서울")?.observedAt).toBe("2026-08-19T19:00:00+09:00");
  });
});

describe("toKstIso", () => {
  it("에어코리아 dataTime 을 오프셋 붙은 ISO 로 바꾼다", () => {
    expect(toKstIso("2026-08-19 19:00")).toBe("2026-08-19T19:00:00+09:00");
  });

  it("형식이 어긋나면 null 이다", () => {
    expect(toKstIso("2026-08-19T19:00")).toBeNull();
    expect(toKstIso("2026-08-19 24:00")).toBeNull();
    expect(toKstIso("")).toBeNull();
    expect(toKstIso(null)).toBeNull();
  });
});

describe("sidoNameOf", () => {
  it("기본 조회 지점(서울시청)은 서울로 떨어진다", () => {
    expect(sidoNameOf(DEFAULT_WEATHER_POINT)).toBe("서울");
  });

  it("다른 시도도 각자의 이름으로 떨어진다", () => {
    expect(sidoNameOf({ lng: 129.0756, lat: 35.1796 })).toBe("부산");
    expect(sidoNameOf({ lng: 126.5312, lat: 33.4996 })).toBe("제주");
    expect(sidoNameOf({ lng: 128.6014, lat: 35.8714 })).toBe("대구");
  });
});

describe("itemsOf", () => {
  it("items 가 빈 문자열이거나 없으면 빈 배열이다", () => {
    expect(itemsOf({ response: { body: { items: "" } } })).toEqual([]);
    expect(itemsOf({ response: { header: { resultCode: "00" } } })).toEqual([]);
    expect(itemsOf({})).toEqual([]);
  });

  it("정상 봉투에서 배열을 꺼낸다", () => {
    expect(itemsOf({ response: { body: { items: REAL_SEOUL, totalCount: 0 } } })).toHaveLength(5);
  });
});
