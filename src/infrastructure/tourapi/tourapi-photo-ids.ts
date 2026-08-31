import "server-only";

import type { TourApiClient } from "@/infrastructure/tourapi/tourapi-client";

/**
 * 한 장소의 사진 id 를 모은다.
 *
 * 화면은 대표 사진 한 장이면 되지만 **인스타 캐러셀은 여러 장을 요구한다.**
 * `SpotRepository` 는 화면이 쓰는 계약이라 그 인터페이스를 넓히지 않고 여기 둔다 —
 * 발행에만 쓰는 조회다.
 *
 * **id 만 돌려준다.** 주소는 `/api/photo/[id]` 가 만든다. 원본 URL 을 그대로
 * 넘기면 그것을 받아 쓰는 쪽이 열린 프록시가 된다.
 */

type ImageItem = { originimgurl?: string };

/** `.../cms/resource/04/3304404_image2_1.jpg` 에서 `3304404` 를 뽑는다 */
function idFromUrl(url: string): string | null {
  return url.match(/\/(\d{4,12})_image2_1\.(?:jpg|JPG|jpeg|png)$/)?.[1] ?? null;
}

export async function fetchSpotPhotoIds(
  client: TourApiClient,
  contentId: string,
  limit = 9,
): Promise<string[]> {
  const page = await client.call("ko", "detailImage2", {
    contentId,
    imageYN: "Y",
    numOfRows: 20,
    pageNo: 1,
  });

  const ids = (page.items as ImageItem[])
    .map((item) => (item.originimgurl ? idFromUrl(item.originimgurl) : null))
    .filter((id): id is string => id !== null);

  // 중복을 걷어낸다. 같은 사진이 두 번 실리면 캐러셀이 지루해진다
  return [...new Set(ids)].slice(0, limit);
}
