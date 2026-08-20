"use client";

import { createCoordinate, distanceMeters } from "@/domain/spot/coordinate";
import { useNearMe } from "@/presentation/lib/near-me";

/**
 * 내 위치에서 이 장소까지. **직선거리다.**
 *
 * 길찾기 API 없이 좌표 둘로 낼 수 있는 값은 이것뿐이다 (`domain/spot/coordinate.ts`).
 * 실제 도보·대중교통 거리는 이보다 길다. 그래서 `약`(`~`) 을 붙여 어림값임을
 * 드러낸다 — 정확한 수처럼 보이면 "800m 니까 걸어가자" 는 판단을 잘못 부른다.
 *
 * 위치가 없거나(꺼짐·거부) 이 장소에 좌표가 없으면 **아무것도 그리지 않는다.**
 * 자리를 비워 두지 않는 이유는 주소 줄이 `flex-1` 로 남은 폭을 마저 쓰기 때문이다 —
 * 빈 칸을 남기면 주소만 짧아지고 격자는 그대로다.
 */
export function SpotDistance({
  lng,
  lat,
  locale,
  label,
}: {
  lng: number | null;
  lat: number | null;
  locale: string;
  /** 스크린 리더용. "내 위치에서" 같은 문구 */
  label: string;
}) {
  const { position } = useNearMe();

  if (!position || lng === null || lat === null) return null;
  const target = createCoordinate(lng, lat);
  if (!target) return null;

  const meters = distanceMeters(position, target);

  return (
    <span
      className="shrink-0 text-[12px] tabular-nums text-muted"
      aria-label={`${label} ${format(locale, meters)}`}
    >
      ~{format(locale, meters)}
    </span>
  );
}

/**
 * 1km 미만은 미터, 그 위는 킬로미터.
 *
 * 미터는 **10 단위로 뭉갠다.** 직선거리라 한 자리까지 맞을 리가 없는데
 * `327 m` 라고 쓰면 그만큼 정확한 값처럼 읽힌다.
 *
 * 단위 표기는 `Intl` 에 맡긴다. 로케일마다 붙는 자리와 띄어쓰기가 다르고
 * (`320 m` / `320m`), 그것을 손으로 분기하면 언어가 늘 때마다 또 는다.
 */
function format(locale: string, meters: number): string {
  if (meters < 1000) {
    return new Intl.NumberFormat(locale, {
      style: "unit",
      unit: "meter",
      maximumFractionDigits: 0,
    }).format(Math.round(meters / 10) * 10);
  }
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: "kilometer",
    maximumFractionDigits: 1,
  }).format(meters / 1000);
}
