import type { Locale } from "@/domain/shared/locale";
import { categoryOfContentTypeId, type Category } from "@/domain/spot/category";
import { createCoordinate } from "@/domain/spot/coordinate";
import { isSeoulDistrictCode } from "@/domain/spot/district";
import { createSpotImage } from "@/domain/spot/image";
import { parseSpotName, type Spot } from "@/domain/spot/spot";
import { toNumber, type TourApiItem } from "@/infrastructure/tourapi/tourapi-types";

/**
 * TourAPI 응답 항목을 도메인 엔티티로 옮긴다.
 * **공급자 타입을 도메인이 그대로 쓰지 않는다** (.curvez/architecture.md ## 권고).
 */
export function toSpot(item: TourApiItem, locale: Locale, fallback?: Category): Spot | null {
  const contentId = item.contentid?.trim();
  const title = item.title?.trim();
  if (!contentId || !title) return null;

  const typeId = toNumber(item.contenttypeid);
  const category = categoryOfContentTypeId(typeId, locale) ?? fallback ?? null;
  if (!category) return null;

  const lng = toNumber(item.mapx);
  const lat = toNumber(item.mapy);
  const districtCode = toNumber(item.sigungucode);

  return {
    id: { contentId, locale },
    name: parseSpotName(title, locale),
    category,
    address: [item.addr1?.trim(), item.addr2?.trim()].filter(Boolean).join(" ") || null,
    districtCode: isSeoulDistrictCode(districtCode) ? districtCode : null,
    coordinate: createCoordinate(lng, lat),
    image: createSpotImage(item.firstimage, item.firstimage2, item.cpyrhtDivCd),
    tel: item.tel?.trim() || null,
    classification: item.lclsSystm3?.trim() || null,
    modifiedAt: item.modifiedtime?.trim() || null,
  };
}
