import { describe, expect, it } from "vitest";
import { kstDateOf, latestNcstBase, latestVilageBase, toKstIso } from "@/infrastructure/kma/kma-base-time";
import { toWeatherReading } from "@/infrastructure/kma/kma-mapper";
import { itemsOf, toNumber, type KmaFcstItem, type KmaNcstItem, type KmaResponse } from "@/infrastructure/kma/kma-types";

/**
 * 2026-08-19 19:00 서울시청 격자(nx=60, ny=127) 의 `getUltraSrtNcst` 실제 응답이다.
 * 필드 이름·값 형식을 원문 그대로 옮겼다.
 */
const REAL_NCST: KmaNcstItem[] = [
  { baseDate: "20260819", baseTime: "1900", category: "PTY", obsrValue: "0" },
  { baseDate: "20260819", baseTime: "1900", category: "REH", obsrValue: "64" },
  { baseDate: "20260819", baseTime: "1900", category: "RN1", obsrValue: "0" },
  { baseDate: "20260819", baseTime: "1900", category: "T1H", obsrValue: "27.4" },
  { baseDate: "20260819", baseTime: "1900", category: "UUU", obsrValue: "1.2" },
  { baseDate: "20260819", baseTime: "1900", category: "VEC", obsrValue: "265" },
  { baseDate: "20260819", baseTime: "1900", category: "VVV", obsrValue: "0.1" },
  { baseDate: "20260819", baseTime: "1900", category: "WSD", obsrValue: "1.2" },
];

/**
 * 같은 시각 `getVilageFcst`(base 20260819 1700) 응답의 일부다.
 * **오늘의 TMN·TMX 가 없다** — 06시·15시가 이미 지나 20일치부터 온다. 실제 그대로다.
 */
const REAL_FCST: KmaFcstItem[] = [
  { category: "TMP", fcstDate: "20260819", fcstTime: "1800", fcstValue: "29" },
  { category: "SKY", fcstDate: "20260819", fcstTime: "1800", fcstValue: "1" },
  { category: "PTY", fcstDate: "20260819", fcstTime: "1800", fcstValue: "0" },
  { category: "TMP", fcstDate: "20260819", fcstTime: "1900", fcstValue: "28" },
  { category: "SKY", fcstDate: "20260819", fcstTime: "1900", fcstValue: "1" },
  { category: "PTY", fcstDate: "20260819", fcstTime: "1900", fcstValue: "0" },
  { category: "SKY", fcstDate: "20260819", fcstTime: "2000", fcstValue: "3" },
  { category: "PTY", fcstDate: "20260819", fcstTime: "2000", fcstValue: "0" },
  { category: "TMN", fcstDate: "20260820", fcstTime: "0600", fcstValue: "24.0" },
  { category: "TMX", fcstDate: "20260820", fcstTime: "1500", fcstValue: "30.0" },
];

/** 2026-08-19 19:56 KST */
const NOW = new Date("2026-08-19T19:56:00+09:00");

describe("toWeatherReading", () => {
  it("실제 응답 두 벌을 관측값 하나로 옮긴다", () => {
    const reading = toWeatherReading({ ncst: REAL_NCST, fcst: REAL_FCST, now: NOW });
    expect(reading).not.toBeNull();
    expect(reading!.temperature).toBe(27.4);
    expect(reading!.humidity).toBe(64);
    expect(reading!.windSpeed).toBe(1.2);
    expect(reading!.sky).toBe("clear");
    expect(reading!.observedAt).toBe("2026-08-19T19:00:00+09:00");
  });

  it("오늘의 TMN·TMX 가 응답에 없으면 null 이다 — 내일 값을 오늘로 쓰지 않는다", () => {
    const reading = toWeatherReading({ ncst: REAL_NCST, fcst: REAL_FCST, now: NOW });
    expect(reading!.low).toBeNull();
    expect(reading!.high).toBeNull();
  });

  it("오늘 날짜의 TMN·TMX 만 집는다", () => {
    const fcst: KmaFcstItem[] = [
      ...REAL_FCST,
      { category: "TMN", fcstDate: "20260819", fcstTime: "0600", fcstValue: "23.0" },
      { category: "TMX", fcstDate: "20260819", fcstTime: "1500", fcstValue: "31.0" },
    ];
    const reading = toWeatherReading({ ncst: REAL_NCST, fcst, now: NOW });
    expect(reading!.low).toBe(23);
    expect(reading!.high).toBe(31);
  });

  it("하늘상태는 현재 정시 이후의 가장 이른 예보 슬롯에서 온다", () => {
    // 19:56 → 1900 슬롯(SKY 1). 20:10 이면 2000 슬롯(SKY 3)이다.
    const later = toWeatherReading({
      ncst: REAL_NCST,
      fcst: REAL_FCST,
      now: new Date("2026-08-19T20:10:00+09:00"),
    });
    expect(later!.sky).toBe("partly-cloudy");
  });

  it("23시 회차처럼 모든 예보가 내일이면 가장 이른 슬롯으로 떨어진다", () => {
    const fcst: KmaFcstItem[] = [
      { category: "SKY", fcstDate: "20260820", fcstTime: "0100", fcstValue: "4" },
      { category: "SKY", fcstDate: "20260820", fcstTime: "0000", fcstValue: "3" },
    ];
    const reading = toWeatherReading({
      ncst: REAL_NCST,
      fcst,
      now: new Date("2026-08-19T23:30:00+09:00"),
    });
    expect(reading!.sky).toBe("partly-cloudy");
  });

  it("실황의 강수형태가 예보 하늘상태를 이긴다", () => {
    const ncst = REAL_NCST.map((i) =>
      i.category === "PTY" ? { ...i, obsrValue: "1" } : i,
    );
    const reading = toWeatherReading({ ncst, fcst: REAL_FCST, now: NOW });
    expect(reading!.sky).toBe("rain");
  });

  it("실황에 PTY 가 없으면 같은 슬롯의 예보 PTY 로 내려간다", () => {
    const ncst = REAL_NCST.filter((i) => i.category !== "PTY");
    const fcst = REAL_FCST.map((i) =>
      i.category === "PTY" && i.fcstTime === "1900" ? { ...i, fcstValue: "3" } : i,
    );
    const reading = toWeatherReading({ ncst, fcst, now: NOW });
    expect(reading!.sky).toBe("snow");
  });

  it("빠진 카테고리는 null 로 둔다 — 0 으로 채우지 않는다", () => {
    const ncst = REAL_NCST.filter((i) => i.category !== "REH" && i.category !== "WSD");
    const reading = toWeatherReading({ ncst, fcst: REAL_FCST, now: NOW });
    expect(reading!.humidity).toBeNull();
    expect(reading!.windSpeed).toBeNull();
    expect(reading!.temperature).toBe(27.4);
  });

  it("기온이 없으면 화면이 성립하지 않으므로 null 을 낸다", () => {
    const ncst = REAL_NCST.filter((i) => i.category !== "T1H");
    expect(toWeatherReading({ ncst, fcst: REAL_FCST, now: NOW })).toBeNull();
    expect(toWeatherReading({ ncst: [], fcst: [], now: NOW })).toBeNull();
  });

  it("예보가 통째로 비어도 실황만으로 값을 낸다", () => {
    const reading = toWeatherReading({ ncst: REAL_NCST, fcst: [], now: NOW });
    expect(reading!.temperature).toBe(27.4);
    // SKY 도 PTY 도 모르면 cloudy 가 아니라, 실황 PTY 0 → SKY 없음 → cloudy
    expect(reading!.sky).toBe("cloudy");
    expect(reading!.low).toBeNull();
  });
});

describe("toNumber", () => {
  it("문자열 숫자를 판다", () => {
    expect(toNumber("27.4")).toBe(27.4);
    expect(toNumber("0")).toBe(0);
    expect(toNumber("-0.1")).toBe(-0.1);
  });

  it("결측 표기는 null 이다", () => {
    expect(toNumber("-")).toBeNull();
    expect(toNumber("")).toBeNull();
    expect(toNumber(undefined)).toBeNull();
    expect(toNumber("강수없음")).toBeNull();
  });

  it("±900 이상은 기상청의 Missing 마스킹이다", () => {
    expect(toNumber("900")).toBeNull();
    expect(toNumber("-999")).toBeNull();
    expect(toNumber("899")).toBe(899);
  });
});

describe("itemsOf", () => {
  it("정상 봉투에서 item 배열을 꺼낸다", () => {
    const json: KmaResponse<KmaNcstItem> = {
      response: { header: { resultCode: "00" }, body: { items: { item: REAL_NCST } } },
    };
    expect(itemsOf(json)).toHaveLength(8);
  });

  it("NO_DATA 처럼 body 가 없거나 items 가 빈 문자열이면 빈 배열이다", () => {
    expect(itemsOf({ response: { header: { resultCode: "03" } } })).toEqual([]);
    expect(itemsOf({ response: { body: { items: "" } } })).toEqual([]);
    expect(itemsOf({})).toEqual([]);
  });
});

describe("발표시각 계산", () => {
  it("초단기실황은 매시 40분 갱신을 기다린다", () => {
    expect(latestNcstBase(new Date("2026-08-19T19:56:00+09:00"))).toEqual({
      baseDate: "20260819",
      baseTime: "1900",
    });
    expect(latestNcstBase(new Date("2026-08-19T19:20:00+09:00"))).toEqual({
      baseDate: "20260819",
      baseTime: "1800",
    });
  });

  it("초단기실황은 자정 직후 전날로 넘어간다", () => {
    expect(latestNcstBase(new Date("2026-08-20T00:10:00+09:00"))).toEqual({
      baseDate: "20260819",
      baseTime: "2300",
    });
  });

  it("단기예보는 발표시각 + 10분 이후의 최신 회차를 고른다", () => {
    expect(latestVilageBase(new Date("2026-08-19T19:56:00+09:00"))).toEqual({
      baseDate: "20260819",
      baseTime: "1700",
    });
    expect(latestVilageBase(new Date("2026-08-19T05:05:00+09:00"))).toEqual({
      baseDate: "20260819",
      baseTime: "0200",
    });
    expect(latestVilageBase(new Date("2026-08-19T05:10:00+09:00"))).toEqual({
      baseDate: "20260819",
      baseTime: "0500",
    });
  });

  it("02시 이전에는 전날 2300 회차를 쓴다", () => {
    expect(latestVilageBase(new Date("2026-08-19T00:30:00+09:00"))).toEqual({
      baseDate: "20260818",
      baseTime: "2300",
    });
    expect(latestVilageBase(new Date("2026-08-19T02:05:00+09:00"))).toEqual({
      baseDate: "20260818",
      baseTime: "2300",
    });
  });

  it("서버 타임존과 무관하게 KST 달력을 쓴다", () => {
    // UTC 로는 8월 19일 15시지만 KST 로는 20일 0시다
    expect(kstDateOf(new Date("2026-08-19T15:00:00Z"))).toBe("20260820");
  });

  it("ISO 문자열에 +09:00 오프셋을 명시한다", () => {
    expect(toKstIso("20260819", "1900")).toBe("2026-08-19T19:00:00+09:00");
    expect(toKstIso("20260819", "19")).toBeNull();
    expect(toKstIso("", "")).toBeNull();
    expect(toKstIso("20261319", "1900")).toBeNull();
  });
});
