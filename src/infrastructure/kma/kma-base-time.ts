/**
 * 기상청 발표시각(base_date/base_time) 계산과 KST 달력.
 *
 * **미래 회차를 넣으면 API 는 값이 아니라 `resultCode: "03" NO_DATA` 를 준다**
 * (2026-08-19 실호출로 확인: base_date=20260820, base_time=2300 → NO_DATA).
 * 그래서 "지금 조회 가능한 가장 최근 회차"를 정확히 골라야 한다. 발표시각과 실제
 * 제공시각 사이에 지연이 있으므로 정시가 지났다고 바로 조회되지 않는다.
 *
 * 시각은 전부 KST(UTC+9) 다. 한국은 서머타임이 없어 오프셋이 상시 +9h 고정이다.
 * `toLocaleString` 같은 로케일 의존 API 는 런타임의 ICU 데이터에 따라 조용히 UTC 로
 * 떨어질 수 있으므로, epoch 밀리초에 +9h 를 직접 더한 뒤 `getUTC*` 로 읽는다.
 * 이 조합은 서버 타임존과 무관하게 언제나 KST 달력값을 준다.
 */

const KST_OFFSET_MS = 9 * 60 * 60_000;
const MS_PER_MINUTE = 60_000;

export type KmaBase = {
  /** `YYYYMMDD` (KST) */
  baseDate: string;
  /** `HHmm` (KST) */
  baseTime: string;
};

/** KST 달력값을 `getUTC*` 로 읽기 위해 +9h 시프트한 Date. 절대시각으로 쓰면 안 된다. */
function shiftToKst(instant: Date): Date {
  return new Date(instant.getTime() + KST_OFFSET_MS);
}

const pad2 = (value: number): string => (value < 10 ? `0${value}` : String(value));

function formatBaseDate(shifted: Date): string {
  return `${shifted.getUTCFullYear()}${pad2(shifted.getUTCMonth() + 1)}${pad2(shifted.getUTCDate())}`;
}

function formatBaseTime(hour: number, minute: number): string {
  return `${pad2(hour)}${pad2(minute)}`;
}

/**
 * 지금에서 `lagMinutes` 만큼 뒤로 물러난 "유효 시각"을 KST 로 읽는다.
 *
 * 발표시각 + 제공지연 이후에야 자료가 생기므로, 조회 가능한 회차를 고르는 일은
 * "현재 시각을 지연만큼 되돌린 뒤 그 이하의 최신 발표"를 찾는 것과 같다.
 * 되돌리다 자정을 넘으면 날짜도 함께 하루 앞으로 돌아간다.
 */
function effectiveKst(now: Date, lagMinutes: number): Date {
  return shiftToKst(new Date(now.getTime() - lagMinutes * MS_PER_MINUTE));
}

/** 단기예보 발표시각(시). 1일 8회. */
export const VILAGE_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23] as const;

/** 단기예보 제공 지연(분). 발표시각 + 10분 이후부터 조회된다(02:10, 05:10, …). */
const VILAGE_LAG_MINUTES = 10;

/** 초단기실황 제공 지연(분). 매시 정시 생성, hh:40 경 갱신되므로 넉넉히 뒤로 민다. */
const NCST_LAG_MINUTES = 40;

/**
 * 초단기실황(getUltraSrtNcst) 의 조회 가능한 최신 회차.
 *
 * 정시 관측값이지만 hh:00 직후에는 아직 없다. 가이드가 안내하는 매시 40분 갱신에
 * 맞춰 40분을 되돌린 시각의 정시를 쓴다.
 * 예) 19:20 → 1800, 19:41 → 1900, 00:10 → 전날 2300.
 */
export function latestNcstBase(now: Date): KmaBase {
  const effective = effectiveKst(now, NCST_LAG_MINUTES);
  return {
    baseDate: formatBaseDate(effective),
    baseTime: formatBaseTime(effective.getUTCHours(), 0),
  };
}

/**
 * 단기예보(getVilageFcst) 의 조회 가능한 최신 회차.
 *
 * 예) 05:05 → 0500 은 05:10 부터라 아직 없음 → 같은 날 0200
 *     05:10 → 0500
 *     00:30 → 그 날의 첫 회차(0200)조차 없음 → **전날 2300**
 */
export function latestVilageBase(now: Date): KmaBase {
  const effective = effectiveKst(now, VILAGE_LAG_MINUTES);
  const hour = effective.getUTCHours();

  for (let i = VILAGE_BASE_HOURS.length - 1; i >= 0; i -= 1) {
    const baseHour = VILAGE_BASE_HOURS[i];
    if (hour >= baseHour) {
      return { baseDate: formatBaseDate(effective), baseTime: formatBaseTime(baseHour, 0) };
    }
  }

  const previous = new Date(effective.getTime() - 24 * 60 * MS_PER_MINUTE);
  return { baseDate: formatBaseDate(previous), baseTime: formatBaseTime(23, 0) };
}

/** 지금의 KST 날짜 `YYYYMMDD`. "오늘의 최저·최고"를 고를 때 쓴다. */
export function kstDateOf(now: Date): string {
  return formatBaseDate(shiftToKst(now));
}

/**
 * `YYYYMMDD` + `HHmm`(KST) → ISO 8601 문자열. **오프셋 +09:00 을 명시한다.**
 *
 * 오프셋 없는 문자열은 읽는 쪽 타임존에 따라 다른 시각이 된다. 화면이 "몇 시 기준"을
 * 밝히는 값이므로 어긋나면 안 된다. 형식이 맞지 않으면 null.
 */
export function toKstIso(date: string, time: string): string | null {
  if (!/^\d{8}$/.test(date) || !/^\d{4}$/.test(time)) return null;

  const month = Number(date.slice(4, 6));
  const day = Number(date.slice(6, 8));
  const hour = Number(time.slice(0, 2));
  const minute = Number(time.slice(2, 4));
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;

  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:00+09:00`;
}
