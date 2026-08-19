/**
 * 위경도 → 기상청 단기예보 격자(nx, ny).
 *
 * 단기예보 조회 API 는 위경도를 받지 않는다. **격자 좌표만 받는다.** 그래서 좌표를
 * 다루는 도메인과 API 사이에 이 변환이 반드시 하나 필요하다.
 *
 * 알고리즘은 기상청 「단기예보 조회서비스 오픈API 활용가이드」 부록의 격자 변환 C 코드
 * (`map_conv()`)를 옮긴 것이다. 투영법은 표준위도 2개(30°N, 60°N)를 쓰는
 * Lambert Conformal Conic 이고, 아래 파라미터는 가이드에 적힌 고정값이다.
 * **하나라도 바꾸면 전국 격자가 통째로 어긋난다.** 임의로 손대지 않는다.
 *
 * 실측 확인: 서울시청(126.9779, 37.5663) → nx=60, ny=127 로 나오고, 이 격자로
 * `getUltraSrtNcst` 를 호출하면 정상 응답이 온다(2026-08-19 확인).
 */

/** 지구 반경(km). 가이드가 지정한 구형 지구 반경값. */
const RE = 6371.00877;
/** 격자 간격(km). 단기예보 격자는 5km 해상도다. */
const GRID = 5.0;
/** 표준위도 1(도). */
const SLAT1 = 30.0;
/** 표준위도 2(도). */
const SLAT2 = 60.0;
/** 투영 기준점 경도(도). */
const OLON = 126.0;
/** 투영 기준점 위도(도). */
const OLAT = 38.0;
/** 기준점의 격자 X 좌표. 가이드의 210km 를 격자간격으로 나눈 값. */
const XO = 210 / GRID;
/** 기준점의 격자 Y 좌표. 가이드의 675km 를 격자간격으로 나눈 값. */
const YO = 675 / GRID;

/** 격자 X 방향 개수. 유효 nx 는 1..149. */
const NX = 149;
/** 격자 Y 방향 개수. 유효 ny 는 1..253. */
const NY = 253;

const DEGRAD = Math.PI / 180.0;

const re = RE / GRID;
const slat1 = SLAT1 * DEGRAD;
const slat2 = SLAT2 * DEGRAD;
const olon = OLON * DEGRAD;
const olat = OLAT * DEGRAD;

/** 원뿔 상수. 두 표준위도의 축척이 같아지도록 정해지는 값이다. */
const sn =
  Math.log(Math.cos(slat1) / Math.cos(slat2)) /
  Math.log(Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5));

/** 투영 축척 계수. 표준위도 1 에서 축척이 1 이 되도록 맞춘다. */
const sf = (Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) * Math.cos(slat1)) / sn;

/** 기준점 위도에서 원뿔 꼭짓점까지의 극거리. 격자 Y 계산의 원점이다. */
const ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);

/** 기상청 단기예보 격자 좌표. 1-기반 정수다. */
export type GridPoint = {
  /** 1..149 */
  nx: number;
  /** 1..253 */
  ny: number;
};

/**
 * 위경도 → 격자 좌표.
 *
 * 원본 C 코드는 `x = (int)(x1 + 1.5)` 로 격자 번호를 정한다. `+1.5` 는 "0.5 반올림 +
 * 1-기반 보정"이 합쳐진 값이고, `(int)` 캐스팅은 **0 방향 절삭**이라 `Math.floor` 가
 * 아니라 `Math.trunc` 로 옮겨야 음수 입력에서도 원본과 값이 같다.
 * 국내 좌표에서는 어차피 양수라 결과가 같지만, 국외 좌표가 들어왔을 때
 * {@link isInsideGrid} 의 판정까지 원본과 어긋나지 않게 하려는 것이다.
 */
export function toGrid(lng: number, lat: number): GridPoint {
  const ra = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5), sn);

  let theta = lng * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const x1 = ra * Math.sin(theta) + XO;
  const y1 = ro - ra * Math.cos(theta) + YO;

  return { nx: Math.trunc(x1 + 1.5), ny: Math.trunc(y1 + 1.5) };
}

/**
 * 격자 범위 안인가.
 *
 * 기상청은 이 격자 밖을 서비스하지 않는다. 호출 전에 걸러 내면 확실히 실패할 요청에
 * 5초를 쓰지 않는다.
 */
export function isInsideGrid(point: GridPoint): boolean {
  const { nx, ny } = point;
  return Number.isInteger(nx) && Number.isInteger(ny) && nx >= 1 && nx <= NX && ny >= 1 && ny <= NY;
}
