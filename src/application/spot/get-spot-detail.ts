import { isLocale } from "@/domain/shared/locale";
import { factOrder, hasEventFacts } from "@/domain/spot/spot-detail";
import type { SpotRepository } from "@/domain/spot/spot-repository";
import type { FactRow, SpotDetailInput, SpotDetailView } from "@/application/spot/dto";
import { toSpotView } from "@/application/spot/to-view";

/**
 * 스팟 하나를 조회한다.
 *
 * **벽 판정(이미지 필수·의료관광 배제)을 적용하지 않는다.** 직접 링크나 공유로 들어온
 * 스팟은 보여준다. 그 판정은 목록에 걸 것을 고르는 규칙이지 존재 여부의 규칙이 아니다.
 */
export function makeGetSpotDetail(repo: SpotRepository) {
  return async function getSpotDetail(input: SpotDetailInput): Promise<SpotDetailView | null> {
    if (!isLocale(input.locale)) return null;
    const contentId = input.contentId.trim();
    if (!contentId) return null;

    const detail = await repo.findDetail({ contentId, locale: input.locale });
    if (!detail) return null;

    // 값이 없는 행도 그대로 넘긴다. 화면이 "정보 없음" 으로 표시하고 공식 링크를 준다
    const facts: FactRow[] = factOrder(hasEventFacts(detail.facts)).map((key) => ({
      key,
      value: detail.facts[key],
    }));

    return {
      ...toSpotView(detail.spot),
      overview: detail.overview,
      homepage: detail.homepage,
      facts,
    };
  };
}
