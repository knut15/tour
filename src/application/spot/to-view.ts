import { canCrop } from "@/domain/spot/image";
import type { Spot } from "@/domain/spot/spot";
import type { SpotView } from "@/application/spot/dto";

/** 도메인 엔티티를 화면 표현으로 옮긴다. 규칙을 여기 두지 않는다. */
export function toSpotView(spot: Spot): SpotView {
  return {
    contentId: spot.id.contentId,
    locale: spot.id.locale,
    titlePrimary: spot.name.primary,
    titleKorean: spot.name.korean,
    category: spot.category,
    address: spot.address,
    districtCode: spot.districtCode,
    lng: spot.coordinate?.lng ?? null,
    lat: spot.coordinate?.lat ?? null,
    imageUrl: spot.image?.url ?? null,
    thumbnailUrl: spot.image?.thumbnailUrl ?? null,
    imageCroppable: spot.image ? canCrop(spot.image) : false,
    tel: spot.tel,
  };
}
