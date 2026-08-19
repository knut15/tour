import type { DustGrade } from "@/domain/weather/air-quality";
import { needsMask } from "@/domain/weather/air-quality";
import type { SkyState } from "@/domain/weather/sky";
import { isWet } from "@/domain/weather/sky";

/**
 * 옷차림 조언.
 *
 * **문장을 만들지 않는다. 키만 고른다.** 여섯 언어를 쓰는 앱에서 도메인이 한국어
 * 문장을 들고 있으면 번역이 도메인 수정이 된다. 여기서는 "어느 옷"인지만 정하고
 * 사람이 읽는 말은 i18n 사전이 맡는다.
 */
export const OUTFIT_LAYERS = [
  "sleeveless",
  "short-sleeve",
  "long-sleeve",
  "light-knit",
  "jacket",
  "trench",
  "coat",
  "padding",
] as const;

export type OutfitLayer = (typeof OUTFIT_LAYERS)[number];

/** 옷 위에 더 챙길 것. 옷차림과 달리 **여러 개가 동시에 참일 수 있다** */
export const OUTFIT_EXTRAS = ["umbrella", "mask", "windbreaker", "extra-layer"] as const;

export type OutfitExtra = (typeof OUTFIT_EXTRAS)[number];

export type OutfitAdvice = {
  layer: OutfitLayer;
  /** 선언 순서(`OUTFIT_EXTRAS`)를 유지한다. 화면마다 순서가 달라지면 같은 날씨가 달라 보인다 */
  extras: OutfitExtra[];
};

/**
 * 기상청 「기온별 옷차림」 8구간을 그대로 쓴다.
 *
 * 구간 경계는 기상청 생활기상정보의 값이다(28 / 23 / 20 / 17 / 12 / 9 / 5 / 그 아래).
 * 임의로 옮기지 않는다 — 이 표는 사용자가 다른 날씨 앱에서 이미 본 표다.
 */
const LAYER_FLOOR: readonly (readonly [number, OutfitLayer])[] = [
  [28, "sleeveless"],
  [23, "short-sleeve"],
  [20, "long-sleeve"],
  [17, "light-knit"],
  [12, "jacket"],
  [9, "trench"],
  [5, "coat"],
];

function layerOf(celsius: number): OutfitLayer {
  for (const [floor, layer] of LAYER_FLOOR) {
    if (celsius >= floor) return layer;
  }
  return "padding";
}

/** 겉옷을 하나 더 권할 일교차(℃) */
const SWING_THRESHOLD = 10;

/** 바람막이를 권할 풍속(m/s). 기상청 강풍주의보 기준(14m/s)보다 낮게 잡는다 */
const WINDY_MS = 9;

export type OutfitInput = {
  /** 체감온도가 있으면 체감으로 고른다. 사람은 기온이 아니라 체감으로 옷을 입는다 */
  feelsLike: number;
  /** 하루 최저·최고. 없으면 일교차 판단을 건너뛴다 */
  low: number | null;
  high: number | null;
  sky: SkyState;
  dust: DustGrade | null;
  windSpeed: number | null;
};

/**
 * 오늘 무엇을 입고 무엇을 챙길지 고른다. **순수 함수다** — 시각도 난수도 읽지 않는다.
 *
 * 옷은 하나만 고르고 나머지는 부가물로 뺀다. "자켓 또는 가디건 또는 야상" 처럼
 * 늘어놓으면 정보량은 늘지만 결정은 못 하게 된다.
 */
export function adviseOutfit(input: OutfitInput): OutfitAdvice {
  const extras: OutfitExtra[] = [];

  if (isWet(input.sky)) extras.push("umbrella");
  if (needsMask(input.dust)) extras.push("mask");
  if (input.windSpeed !== null && input.windSpeed >= WINDY_MS) extras.push("windbreaker");
  if (
    input.low !== null &&
    input.high !== null &&
    input.high - input.low >= SWING_THRESHOLD
  ) {
    extras.push("extra-layer");
  }

  return { layer: layerOf(input.feelsLike), extras };
}
