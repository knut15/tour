/** WGS84 좌표. TourAPI 의 mapx=경도, mapy=위도에 대응한다. */
export type Coordinate = {
  readonly lng: number;
  readonly lat: number;
};

export function createCoordinate(lng: number, lat: number): Coordinate | null {
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  if (lng < -180 || lng > 180) return null;
  if (lat < -90 || lat > 90) return null;
  return { lng, lat };
}

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * 두 좌표 사이의 거리(미터). haversine 공식.
 * 도메인의 순수 계산이므로 외부 의존이 없다.
 */
export function distanceMeters(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(s)));
}

/**
 * TourAPI locationBasedList2 의 radius 상한.
 * 공식 문서 확인값: 최대 20000m.
 * 근거: .curvez/research/tourapi-endpoints.md 사실 5
 */
export const MAX_RADIUS_M = 20_000;

export function clampRadius(meters: number): number {
  if (!Number.isFinite(meters) || meters <= 0) return 1_000;
  return Math.min(Math.floor(meters), MAX_RADIUS_M);
}
