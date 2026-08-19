import { skyStateOf } from "@/domain/weather/sky";
import type { WeatherReading } from "@/domain/weather/weather";
import { kstDateOf, toKstIso } from "@/infrastructure/kma/kma-base-time";
import { toNumber, type KmaFcstItem, type KmaNcstItem } from "@/infrastructure/kma/kma-types";

/**
 * 기상청 응답 두 벌을 `WeatherReading` 하나로 옮긴다.
 *
 * **응답은 "카테고리별 한 줄"의 평평한 배열이다.** 기온과 습도가 같은 객체에 들어 있지
 * 않고 `category: "T1H"`, `category: "REH"` 로 줄이 나뉘어 온다. 그래서 매핑의 대부분은
 * "필요한 카테고리를 골라내는 일"이다.
 *
 * 없는 카테고리는 null 로 둔다. 기상청은 격자·발표시각에 따라 일부 항목을 빼고 준다.
 */

/** 실황 items → 카테고리별 값. 같은 카테고리가 여러 줄이면 마지막 값을 쓴다. */
function ncstValues(items: KmaNcstItem[]): Map<string, string> {
  const values = new Map<string, string>();
  for (const item of items) {
    if (!item.category || item.obsrValue === undefined) continue;
    values.set(item.category, item.obsrValue);
  }
  return values;
}

/** `YYYYMMDD` + `HHmm` 을 사전순 비교 가능한 하나의 키로. 둘 다 고정 자릿수라 문자열 비교로 충분하다. */
function slotKey(date: string, time: string): string {
  return `${date}${time}`;
}

/**
 * 지금 시각(KST)의 정시 슬롯 키.
 *
 * 예보는 정시 단위로만 온다. 19:56 은 19:00 슬롯에 속하므로 분은 버린다.
 */
function currentSlotKey(now: Date): string {
  const shifted = new Date(now.getTime() + 9 * 60 * 60_000);
  const hour = shifted.getUTCHours();
  return `${kstDateOf(now)}${hour < 10 ? "0" : ""}${hour}00`;
}

/**
 * "지금"에 해당하는 예보 슬롯을 고른다 — 현재 정시 이후의 가장 이른 슬롯.
 *
 * **첫 항목을 그냥 쓰면 안 된다.** 23시 회차의 예보는 다음 날 00시부터 시작하고,
 * 02시 회차는 03시부터 시작한다. 배열 순서에 기대지 않고 시각으로 고른다.
 * 현재 이후 슬롯이 하나도 없으면(있어서는 안 되지만) 가장 이른 슬롯으로 떨어진다.
 */
function pickCurrentSlot(items: KmaFcstItem[], now: Date): string | null {
  const keys = items
    .filter((i) => i.fcstDate && i.fcstTime)
    .map((i) => slotKey(i.fcstDate as string, i.fcstTime as string))
    .sort();
  if (keys.length === 0) return null;

  const nowKey = currentSlotKey(now);
  return keys.find((key) => key >= nowKey) ?? keys[0];
}

function fcstValue(items: KmaFcstItem[], category: string, slot: string): string | undefined {
  return items.find(
    (i) =>
      i.category === category &&
      i.fcstDate &&
      i.fcstTime &&
      slotKey(i.fcstDate, i.fcstTime) === slot,
  )?.fcstValue;
}

/**
 * 오늘의 최저·최고.
 *
 * **날짜를 반드시 확인한다.** 단기예보는 +3일치를 함께 주므로 필터 없이 첫 TMN 을 집으면
 * 내일 최저기온을 오늘 값으로 그리게 된다.
 *
 * 오늘의 TMN(06시)·TMX(15시)는 그 시각이 지난 회차부터 응답에서 빠진다. 실제로
 * 2026-08-19 17시 회차에는 오늘치가 없고 20일 것부터 왔다. 그때는 null 이다 —
 * 지난 값을 예보인 척 채우지 않는다.
 */
function todayExtreme(items: KmaFcstItem[], category: string, today: string): number | null {
  const found = items.find((i) => i.category === category && i.fcstDate === today);
  return toNumber(found?.fcstValue);
}

export type KmaReadingInput = {
  ncst: KmaNcstItem[];
  fcst: KmaFcstItem[];
  now: Date;
};

/**
 * 두 응답을 합쳐 도메인 관측값으로.
 *
 * 기온·습도·풍속·강수형태는 **실황**에서 온다. 예보값보다 실황이 지금을 잘 말한다.
 * 하늘상태(SKY)는 실황에 없으므로 예보에서만 온다.
 * 기온이 없으면 화면이 성립하지 않으므로 null 을 반환한다 — 0℃ 로 채우지 않는다.
 */
export function toWeatherReading(input: KmaReadingInput): WeatherReading | null {
  const { ncst, fcst, now } = input;
  const values = ncstValues(ncst);

  const temperature = toNumber(values.get("T1H"));
  if (temperature === null) return null;

  const slot = pickCurrentSlot(fcst, now);
  const skyCode = slot === null ? null : toNumber(fcstValue(fcst, "SKY", slot));
  // 강수형태는 실황이 우선이다. 실황에 없을 때만 같은 슬롯의 예보값으로 내려간다.
  const ncstPty = toNumber(values.get("PTY"));
  const precipitationCode =
    ncstPty !== null ? ncstPty : slot === null ? null : toNumber(fcstValue(fcst, "PTY", slot));

  const today = kstDateOf(now);
  const observedItem = ncst.find((i) => i.baseDate && i.baseTime);
  const observedAt =
    (observedItem?.baseDate && observedItem.baseTime
      ? toKstIso(observedItem.baseDate, observedItem.baseTime)
      : null) ?? new Date(now).toISOString();

  return {
    temperature,
    low: todayExtreme(fcst, "TMN", today),
    high: todayExtreme(fcst, "TMX", today),
    sky: skyStateOf(skyCode, precipitationCode),
    humidity: toNumber(values.get("REH")),
    windSpeed: toNumber(values.get("WSD")),
    observedAt,
  };
}
