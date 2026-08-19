import type { Locale } from "@/domain/shared/locale";
import type { SpotRepository } from "@/domain/spot/spot-repository";

/**
 * 다른 언어의 같은 장소를 찾는다.
 *
 * **로케일마다 `contentid` 공간이 분리돼 있다.** 그래서 언어를 바꿀 때 보던 스팟의
 * ID 를 그대로 쓸 수 없고, 두 카탈로그를 잇는 유일한 값인 한글 원명으로 다시 찾는다.
 *
 * 못 찾으면 `null` 이다. 부르는 쪽이 목록으로 보낸다 — **비슷한 장소로 보내지 않는다.**
 */
export function makeFindSpotInLocale(repo: SpotRepository) {
  return async function findSpotInLocale(
    locale: Locale,
    koreanName: string,
  ): Promise<string | null> {
    const id = await repo.findByKoreanName(locale, koreanName);
    return id?.contentId ?? null;
  };
}
