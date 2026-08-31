import { NextResponse } from "next/server";
import sharp from "sharp";

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
 *
 * `?w=&h=` 를 주면 그 크기의 **액자 안에 원본을 그대로 담아** 돌려준다(레터박스).
 * 캐러셀은 첫 장 비율로 나머지를 자르므로 크기가 섞이면 사진이 잘리는데, 여백을
 * 덧대면 **한 픽셀도 버리지 않고** 크기를 맞출 수 있다. 자르기는 픽셀을 없애지만
 * 패딩은 없애지 않는다 — 변경금지 관점에서 크롭보다 안전한 쪽이다.
 */

/** 원본 호스트. 여기 말고 다른 곳을 부르지 않는다 */
const HOST = "https://tong.visitkorea.or.kr";

/**
 * 레터박스 여백 색.
 *
 * 커버가 4:5 를 사진으로 꽉 채우므로 나머지 장의 여백도 **가장 물러나는 색**이어야
 * 사진에 눈이 간다. 잉크(`#1e1613`)를 쓰다가 검정으로 바꿨다 — 다크모드에서 배경과
 * 붙는 것이 오히려 액자가 사라지는 효과를 낸다.
 */
const PAD_COLOR = "#000000";

/**
 * 이미지 id 로 원본 경로를 만든다.
 *
 * 관광공사 CDN 은 **id 의 끝 두 자리를 디렉터리로** 쓴다 —
 * `3304399` → `/cms/resource/99/3304399_image2_1.jpg` (실측 2026-08-31).
 *
 * **디렉터리와 확장자가 둘 다 갈린다.**
 * - 디렉터리: `resource` 와 `resource_photo` 두 갈래다. 이화벽화마을(1102845)의
 *   이미지 9장이 전부 `resource_photo` 였다(실측 2026-08-31)
 * - 확장자: 서울거리예술축제(706180)의 8장 중 2장이 `.JPG` 였다
 *
 * 네 조합을 차례로 시도한다. **원본 URL 을 그대로 받지 않는 대가**이고,
 * 열린 프록시가 되지 않는 값어치가 그보다 크다.
 */
function originUrls(id: string): string[] {
  const dir = id.slice(-2);
  return ["resource", "resource_photo"].flatMap((root) => {
    const base = `${HOST}/cms/${root}/${dir}/${id}_image2_1`;
    return [`${base}.jpg`, `${base}.JPG`];
  });
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

  let upstream: Response | null = null;
  for (const url of originUrls(id)) {
    try {
      const res = await fetch(url, { next: { revalidate: CACHE_SECONDS } });
      if (res.ok) {
        upstream = res;
        break;
      }
    } catch {
      // 다음 후보를 시도한다. 전부 실패하면 아래에서 502 를 돌려준다
    }
  }

  if (!upstream) {
    return NextResponse.json({ error: "upstream-error" }, { status: 404 });
  }

  /*
    액자 크기를 받았으면 여백을 덧대 맞춘다.

    **크기를 줄이지 않는다.** TourAPI 사진은 가로가 940 으로 같고 세로만 다르므로
    (실측 2026-08-31: 627 / 625 / 705 / 529) 위아래 여백만으로 맞출 수 있다.
    원본보다 액자가 작은 예외에만 비율을 지켜 줄인다.
  */
  const q = new URL(_request.url).searchParams;
  const boxW = Number(q.get("w")) || 0;
  const boxH = Number(q.get("h")) || 0;

  if (boxW > 0 && boxH > 0) {
    try {
      const raw = Buffer.from(await upstream.arrayBuffer());
      const framed = await sharp(raw)
        .resize(boxW, boxH, {
          // `contain` 은 잘라내지 않는다. 남는 자리는 아래 색으로 채운다
          fit: "contain",
          background: PAD_COLOR,
          // 작은 원본을 늘리지 않는다. 흐려진 사진을 만드는 것보다 여백이 낫다
          withoutEnlargement: true,
        })
        .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
        .toBuffer();
      return new NextResponse(new Uint8Array(framed), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": `public, max-age=${CACHE_SECONDS}, immutable`,
          "X-Image-Source": "Korea Tourism Organization (TourAPI)",
        },
      });
    } catch {
      return NextResponse.json({ error: "frame-failed" }, { status: 500 });
    }
  }

  /*
    액자를 안 받았으면 바이트를 그대로 넘긴다. `Content-Type` 도 원본 것을 쓴다 —
    우리가 판단해서 붙이면 원본이 JPEG 이 아닌 날 틀린 값을 말하게 된다.
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
