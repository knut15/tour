/**
 * 하늘 상태. **화면이 아이콘 하나를 고르기 위한 최소 어휘다.**
 *
 * 기상청은 하늘상태(SKY)와 강수형태(PTY)를 **따로** 준다. 둘을 그대로 화면에 넘기면
 * 아이콘 선택 규칙이 컴포넌트마다 흩어지므로, 여기서 한 값으로 합친다.
 * 값의 개수를 늘리지 않는다 — 아이콘을 그릴 수 있는 만큼만 구분한다.
 */
export const SKY_STATES = [
  "clear",
  "partly-cloudy",
  "cloudy",
  "rain",
  "rain-snow",
  "snow",
  "shower",
] as const;

export type SkyState = (typeof SKY_STATES)[number];

export function isSkyState(value: string): value is SkyState {
  return (SKY_STATES as readonly string[]).includes(value);
}

/**
 * 기상청 SKY 코드 — 1 맑음 / 3 구름많음 / 4 흐림. 2 는 결번이다.
 * 근거: 기상청 「단기예보 조회서비스 오픈API 활용가이드」 코드값 정의
 */
const SKY_CODE: Record<number, SkyState> = {
  1: "clear",
  3: "partly-cloudy",
  4: "cloudy",
};

/**
 * 기상청 PTY 코드 — 0 없음 / 1 비 / 2 비·눈 / 3 눈 / 4 소나기.
 * 초단기실황·초단기예보는 여기에 5 빗방울 / 6 빗방울눈날림 / 7 눈날림을 더 쓴다.
 */
const PTY_CODE: Record<number, SkyState> = {
  1: "rain",
  2: "rain-snow",
  3: "snow",
  4: "shower",
  5: "rain",
  6: "rain-snow",
  7: "snow",
};

/**
 * 두 코드를 하나의 하늘 상태로 합친다.
 *
 * **강수가 있으면 강수가 이긴다.** 비 오는 흐린 하늘에 구름 아이콘을 띄우면
 * 우산을 안 챙긴다 — 이 화면에서 가장 비싼 오답이다.
 *
 * PTY 가 0 이거나 알 수 없는 코드면 SKY 로 내려간다. SKY 마저 모르면 `cloudy` 로
 * 둔다 — 없는 값을 맑음으로 낙관하지 않는다.
 */
export function skyStateOf(skyCode: number | null, precipitationCode: number | null): SkyState {
  if (precipitationCode !== null) {
    const byPrecipitation = PTY_CODE[precipitationCode];
    if (byPrecipitation) return byPrecipitation;
  }
  if (skyCode !== null) {
    const bySky = SKY_CODE[skyCode];
    if (bySky) return bySky;
  }
  return "cloudy";
}

/** 우산이 필요한 하늘인가. 옷차림 조언과 아이콘이 함께 쓴다 */
export function isWet(sky: SkyState): boolean {
  return sky === "rain" || sky === "rain-snow" || sky === "snow" || sky === "shower";
}
