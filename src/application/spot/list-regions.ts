import type { Locale } from "@/domain/shared/locale";
import type { SpotRepository } from "@/domain/spot/spot-repository";
import type { RegionView } from "@/application/spot/dto";

/**
 * 시도 목록(17개).
 * 코드-이름 매핑을 하드코딩하지 않고 공급자에게 묻는다. 이름이 로케일마다 다르기 때문이다.
 */
export function makeListAreas(repo: SpotRepository) {
  return async function listAreas(locale: Locale): Promise<RegionView[]> {
    const areas = await repo.listAreas(locale);
    return areas.map((a) => ({ code: a.code, name: a.name }));
  };
}

/**
 * 한 시도의 시군구 목록.
 *
 * **시도를 반드시 받는다.** 시군구 코드는 시도 안에서만 고유해서, 시도 없이
 * 부르면 어느 지역의 목록인지 정할 수 없다 (`domain/spot/region.ts`).
 */
export function makeListDistricts(repo: SpotRepository) {
  return async function listDistricts(
    locale: Locale,
    areaCode: number,
  ): Promise<RegionView[]> {
    const districts = await repo.listDistricts(locale, areaCode);
    return districts.map((d) => ({ code: d.code, name: d.name }));
  };
}
