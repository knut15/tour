import type { Locale } from "@/domain/shared/locale";
import type { SpotRepository } from "@/domain/spot/spot-repository";
import type { DistrictView } from "@/application/spot/dto";

/**
 * 서울 자치구 목록.
 * 코드-이름 매핑을 하드코딩하지 않고 공급자에게 묻는다. 이름이 로케일마다 다르기 때문이다.
 * 근거: .curvez/design/index.md
 */
export function makeListDistricts(repo: SpotRepository) {
  return async function listDistricts(locale: Locale): Promise<DistrictView[]> {
    const districts = await repo.listDistricts(locale);
    return districts.map((d) => ({ code: d.code, name: d.name }));
  };
}
