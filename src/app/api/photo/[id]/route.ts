import { NextResponse } from "next/server";

/**
 * TourAPI 사진을 **HTTPS 로 중계한다.**
 *
 * 인스타 발행 API 는 이미지를 업로드받지 않는다. 공개 URL 을 주면 메타가 그것을
 * 가져가는데, **TourAPI 원본이 `http://` 라 그대로는 쓸 수 없다.** 이 route 가
 * 그 한 칸을 메운다.
 *
 * **한 픽셀도 바꾸지 않는다.** 서울 관광지 이미지 표본의 82% 가 공공누리 제3유형
 * (출처표시 + 변경금지)이고, 유형을 모르는 경우도 금지로 본다 —
 * `src/domain/spot/image.ts` 의 `canCrop` 이 이미 그렇게 판정한다. 자르기·리사이즈·
 * 재인코딩을 하지 않고 받은 바이트를 그대로 흘려보낸다.
 *
 * **열린 프록시가 되지 않게 URL 을 재구성한다.** 임의 주소를 받아 대신 요청해 주면
 * 내부망을 훑는 발판이 된다. 숫자 id 만 받고 주소는 이 파일이 만든다 — 그래서 이
 * route 가 닿을 수 있는 곳은 관광공사 이미지 서버 하나뿐이다.
 */

/** 원본 호스트. 여기 말고 다른 곳을 부르지 않는다 */
const HOST = "https://tong.visitkorea.or.kr";

/**
 * 이미지 id 로 원본 경로를 만든다.
 *
 * 관광공사 CDN 은 **id 의 끝 두 자리를 디렉터리로** 쓴다 —
 * `3304399` → `/cms/resource/99/3304399_image2_1.jpg` (실측 2026-08-31,
 * `detailImage2` 응답 10건 전부 이 규칙이었다).
 */
function originUrl(id: string): string {
  return `${HOST}/cms/resource/${id.slice(-2)}/${id}_image2_1.jpg`;
}

/**
 * 하루. 원본은 사실상 바뀌지 않고, 메타가 컨테이너를 만들 때 한 번 더 받아 가므로
 * 짧게 잡을 이유가 없다.
 */
const CACHE_SECONDS = 60 * 60 * 24;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 숫자만 통과시킨다. 경로 조작도, 다른 호스트도 들어올 자리가 없다
  if (!/^\d{4,12}$/.test(id)) {
    return NextResponse.json({ error: "bad-id" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(originUrl(id), { next: { revalidate: CACHE_SECONDS } });
  } catch {
    return NextResponse.json({ error: "upstream-unreachable" }, { status: 502 });
  }

  if (!upstream.ok) {
    return NextResponse.json({ error: "upstream-error" }, { status: upstream.status });
  }

  /*
    바이트를 그대로 넘긴다. `Content-Type` 도 원본 것을 쓴다 — 우리가 판단해서
    붙이면 원본이 JPEG 이 아닌 날 틀린 값을 말하게 된다.
  */
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
      // 출처표시는 캡션이 지지만, 파일만 따로 보는 사람에게도 남긴다
      "X-Image-Source": "Korea Tourism Organization (TourAPI)",
    },
  });
}
