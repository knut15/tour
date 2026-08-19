import { distanceMeters, type Coordinate } from "@/domain/spot/coordinate";

/**
 * 좌표 → 에어코리아 `sidoName`.
 *
 * **에어코리아 실시간 조회는 좌표를 받지 않는다.** 시도 이름 아니면 측정소 이름만 받는다.
 * 도메인 계약은 `Coordinate` 를 받기로 했으므로, 좌표를 시도명으로 바꾸는 일은
 * 여기(인프라) 안에서 끝낸다.
 *
 * 아래 대표점은 각 시도의 시청·도청 소재지 근방을 잡은 **근사값**이다. 행정경계를
 * 정확히 나누지 않으므로 경계 부근 좌표는 옆 시도로 붙을 수 있다. 그래도 쓰는 이유는
 * 두 가지다. 첫째, 이 앱의 조회 지점은 서울(`DEFAULT_WEATHER_POINT`)이라 실제로
 * 경계에 걸릴 일이 없다. 둘째, 미세먼지 농도는 시·군 하나를 건너뛴다고 크게 달라지지
 * 않는다 — 잘못 붙어도 값의 성격은 유지된다.
 *
 * 시도명 17개는 전부 실호출로 응답을 확인했다(2026-08-19). `강원특별자치도` 같은
 * 정식 명칭이 아니라 `강원` 이 맞는 값이다.
 */
const SIDO_POINTS: readonly (readonly [string, Coordinate])[] = [
  ["서울", { lng: 126.978, lat: 37.566 }],
  ["부산", { lng: 129.075, lat: 35.18 }],
  ["대구", { lng: 128.601, lat: 35.871 }],
  ["인천", { lng: 126.705, lat: 37.456 }],
  ["광주", { lng: 126.852, lat: 35.16 }],
  ["대전", { lng: 127.385, lat: 36.35 }],
  ["울산", { lng: 129.311, lat: 35.539 }],
  ["세종", { lng: 127.289, lat: 36.48 }],
  ["경기", { lng: 127.01, lat: 37.263 }],
  ["강원", { lng: 127.729, lat: 37.881 }],
  ["충북", { lng: 127.489, lat: 36.636 }],
  ["충남", { lng: 126.661, lat: 36.601 }],
  ["전북", { lng: 127.109, lat: 35.82 }],
  ["전남", { lng: 126.463, lat: 34.99 }],
  ["경북", { lng: 128.729, lat: 36.568 }],
  ["경남", { lng: 128.682, lat: 35.228 }],
  ["제주", { lng: 126.531, lat: 33.499 }],
];

/** 대표점이 가장 가까운 시도. 국외 좌표라도 가장 가까운 이름 하나로 떨어진다. */
export function sidoNameOf(at: Coordinate): string {
  let best = SIDO_POINTS[0];
  let bestDistance = distanceMeters(at, best[1]);
  for (const candidate of SIDO_POINTS.slice(1)) {
    const distance = distanceMeters(at, candidate[1]);
    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best[0];
}
