/**
 * **다시 올리지 않을 장소.**
 *
 * 한 번 내린 게시물이 자동 발행으로 되돌아오는 일을 막는다. 초안 생성기가 소재를
 * 고를 때와 발행 route 가 부를 때 양쪽에서 본다 — 한 곳만 보면 다른 경로로 새어
 * 나간다.
 *
 * **키는 `contentid` 다.** 로케일마다 `contentid` 공간이 분리돼 있으므로 국문 기준
 * 값을 적는다. 다국어 계정을 팔 때는 `findByKoreanName` 으로 이어 붙인다.
 *
 * 지울 때는 **이유와 날짜를 함께 지운다.** 이유가 남아 있지 않으면 왜 뺐는지 몰라
 * 누군가 되살린다.
 */
export const EXCLUDED_CONTENT_IDS: ReadonlyMap<string, { reason: string; since: string }> = new Map([
  [
    "3454461",
    {
      reason: "경포호수광장 — 발행 후 사용자가 직접 내렸다. 다시 올리지 않는다",
      since: "2026-08-31",
    },
  ],
]);

export function isExcluded(contentId: string | undefined | null): boolean {
  return !!contentId && EXCLUDED_CONTENT_IDS.has(contentId.trim());
}

export function exclusionReason(contentId: string): string | undefined {
  return EXCLUDED_CONTENT_IDS.get(contentId.trim())?.reason;
}
