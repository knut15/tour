import type { AirQualityReading } from "@/domain/weather/weather";
import type { AirkoreaItem } from "@/infrastructure/airkorea/airkorea-types";

/**
 * 시도별 실시간 측정값 목록 → 도메인 관측값 하나.
 *
 * **응답에는 측정소 좌표가 없다.** 서울만 해도 40곳이 오는데 어느 곳이 사용자와 가까운지
 * 판단할 근거가 응답 안에 없다. 그래서 하나를 임의로 집지 않고 **중앙값**을 쓴다.
 *
 * 중앙값을 고른 이유:
 * - 평균은 고장난 측정소 하나에 끌려간다. 중앙값은 안 끌려간다.
 * - 첫 항목을 집으면 응답 순서(서울은 강남구가 먼저 온다)가 곧 도시 대표값이 된다.
 *
 * `도시대기` 측정망만 센다. 도로변·항만·국가배경농도는 특정 배출원을 보려고 놓은
 * 측정소라, 도시 하나를 한 숫자로 말할 때 섞으면 대표성이 흐려진다. 서울 응답 40곳
 * 가운데 도시대기는 25곳이다(2026-08-19 실측).
 */

const URBAN_NETWORK = "도시대기";

/**
 * 값 하나를 숫자로.
 *
 * `"-"`·빈 문자열·null 은 결측이다. **플래그가 붙은 값도 결측으로 본다** — 응답은
 * 값을 채워 두고 `pm25Flag: "통신장애"` 로 "이 숫자는 못 믿는다"를 따로 말한다.
 */
function measured(value: string | null | undefined, flag: string | null | undefined): number | null {
  if (flag !== null && flag !== undefined && flag.trim() !== "") return null;
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "-") return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

/** 정수로 반올림한 중앙값. 값이 하나도 없으면 null. */
function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  return Math.round(value);
}

/**
 * `"2026-08-19 19:00"`(KST) → ISO 8601. **오프셋 +09:00 을 붙인다.**
 *
 * 오프셋 없는 문자열은 읽는 쪽 타임존에 따라 다른 시각이 된다. 형식이 어긋나면 null.
 */
export function toKstIso(dataTime: string | null | undefined): string | null {
  if (!dataTime) return null;
  const match = dataTime.trim().match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  // 에어코리아는 자정을 "24:00" 으로 적는 경우가 있다. ISO 에는 24시가 없으므로 버린다.
  if (Number(hour) > 23 || Number(minute) > 59) return null;
  return `${year}-${month}-${day}T${hour}:${minute}:00+09:00`;
}

/**
 * 측정값 목록을 관측값 하나로 접는다.
 *
 * @param items    시도별 실시간 응답의 item 목록
 * @param label    `stationName` 에 적을 이름. 값이 시도 전체의 중앙값이므로 시도명을 넣는다
 * @returns PM10·PM2.5 가 모두 결측이면 null — 보여줄 숫자가 없으면 칸을 비운다
 */
export function toAirQualityReading(items: AirkoreaItem[], label: string): AirQualityReading | null {
  const urban = items.filter((i) => i.mangName === URBAN_NETWORK);
  // 측정망 이름이 통째로 빠진 응답이면 전체를 쓴다. 거르다 아무것도 안 남는 편보다 낫다.
  const source = urban.length > 0 ? urban : items;

  const pm10Values: number[] = [];
  const pm25Values: number[] = [];
  for (const item of source) {
    const pm10 = measured(item.pm10Value, item.pm10Flag);
    if (pm10 !== null) pm10Values.push(pm10);
    const pm25 = measured(item.pm25Value, item.pm25Flag);
    if (pm25 !== null) pm25Values.push(pm25);
  }

  const pm10 = median(pm10Values);
  const pm25 = median(pm25Values);
  if (pm10 === null && pm25 === null) return null;

  // 같은 회차의 측정값이므로 dataTime 은 대체로 같다. 어긋나면 가장 최근 것을 쓴다.
  const latest = source
    .map((i) => toKstIso(i.dataTime))
    .filter((v): v is string => v !== null)
    .sort()
    .at(-1);

  return {
    pm10,
    pm25,
    stationName: label,
    observedAt: latest ?? new Date().toISOString(),
  };
}
