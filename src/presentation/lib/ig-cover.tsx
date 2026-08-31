import "server-only";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { Category } from "@/domain/spot/category";

/**
 * 인스타 커버 한 장을 JPEG 으로 그린다.
 *
 * **두 단계를 거친다.** `next/og` 의 `ImageResponse` 는 문서에 "convert HTML and
 * CSS into PNG" 라고 적혀 있어 **PNG 만 나오는데, 인스타는 JPEG 만 받는다.**
 * 그래서 sharp 로 한 번 더 바꾼다.
 *
 * **폰트를 파일로 넘긴다.** 서버리스에는 한글 폰트가 없다고 봐야 한다 — 시스템
 * 폰트에 기대면 네모(tofu)로 나온다. Noto Sans KR Bold 를 현대 한글 상용 2350자 +
 * 라틴으로 잘라 413KB 로 만들어 저장소에 두고, 그 바이트를 직접 넘긴다.
 * (원본 6MB → 서브셋 413KB. `ImageResponse` 예산이 500KB 다)
 *
 * 크기는 **940×627**. TourAPI 사진이 전부 이 크기이고, 캐러셀은 첫 장 비율로
 * 나머지를 자르므로 커버가 사진과 정확히 같아야 사진이 안 잘린다.
 */

/** 사진과 같은 크기. 여기가 갈리면 캐러셀에서 사진이 잘린다 */
export const COVER_WIDTH = 940;
export const COVER_HEIGHT = 627;

/**
 * 프로필 그리드는 **가운데 정사각으로 자른다**(940 → 가운데 627). 글자가 그 밖에
 * 있으면 썸네일에서 사라진다.
 *
 * 실측 2026-08-31: 내용을 `x=190` 에 두었더니 크롭 경계까지 34px 밖에 안 남아
 * 잘린 것처럼 보였다. 정사각 안쪽으로 60px 을 더 들여 안전영역을 잡는다.
 */
const SQUARE_LEFT = (COVER_WIDTH - COVER_HEIGHT) / 2; // 156.5
export const SAFE_LEFT = Math.round(SQUARE_LEFT + 60); // 216
export const SAFE_WIDTH = COVER_HEIGHT - 120; // 507

/**
 * 바탕 사다리. **액센트가 하나뿐이라 색상이 아니라 명도가 분류를 진다.**
 * 값은 `.curvez` 가 아니라 피드 규약과 앱의 `--brand-*` 토큰에서 왔다.
 */
const PALETTE = {
  navy: { bg: "#123d5a", fg: "#faece7", chipBg: "#faece7", chipFg: "#123d5a", ring: "#faece7" },
  cream: { bg: "#faece7", fg: "#123d5a", chipBg: "#123d5a", chipFg: "#faece7", ring: "#d85a30" },
  deep: { bg: "#f0ddd4", fg: "#7a2f14", chipBg: "#d85a30", chipFg: "#ffffff", ring: "#d85a30" },
  accent: { bg: "#d85a30", fg: "#ffffff", chipBg: "#ffffff", chipFg: "#d85a30", ring: "#ffffff" },
  ink: { bg: "#1e1613", fg: "#faece7", chipBg: "#d85a30", chipFg: "#ffffff", ring: "#d85a30" },
} as const;

export type CoverTone = keyof typeof PALETTE;

/**
 * 카테고리마다 어느 바탕에 서는지. **같은 카테고리는 늘 같은 바탕**이라
 * 그리드를 멀리서 봐도 종류가 읽힌다.
 */
const TONE_OF: Record<Category, CoverTone> = {
  attraction: "navy",
  culture: "cream",
  food: "accent",
  festival: "deep",
};

export type CoverInput = {
  /** 칩 문구. **앱의 카테고리 이름 그대로** 쓴다 — 새 단어를 만들지 않는다 */
  chip: string;
  /** 두 줄 기본, 최대 세 줄. 마침표를 찍지 않는다 */
  headline: string;
  /** 시·도 + 시·군·구 까지만. 앱의 지역 필터와 같은 단위다 */
  pin: string;
  /** 바탕. 생략하면 카테고리가 정한다 */
  tone?: CoverTone;
  category?: Category;
};

let cachedFont: ArrayBuffer | null = null;

async function loadFont(): Promise<ArrayBuffer> {
  if (cachedFont) return cachedFont;
  const buf = await readFile(join(process.cwd(), "assets/fonts/NotoSansKR-Bold-subset.ttf"));
  cachedFont = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  return cachedFont;
}

/**
 * 로고의 동심원. 칸마다 반복되며 계정을 한 덩어리로 묶는 장치다.
 *
 * **화면 전체를 덮는 층 하나에 담는다.** 절대배치 요소를 본문 흐름에 그냥 두면
 * satori 가 flex 자식으로 함께 계산해 자리가 밀린다(실측 2026-08-31: 오른쪽 위로
 * 보낸 원이 아래로 내려가 잘렸다). 층을 따로 깔면 본문과 서로 간섭하지 않는다.
 *
 * 원의 중심은 `(742, 188)` 이다 — 안전영역 오른쪽 밖이라 썸네일에서 일부가
 * 잘리는데, 장식이므로 의도한 것이다.
 */
function Rings({ color }: { color: string }) {
  const ring = (size: number, width: number, opacity: number) => ({
    display: "flex" as const,
    position: "absolute" as const,
    width: size,
    height: size,
    top: 188 - size / 2,
    left: 742 - size / 2,
    borderRadius: size,
    border: `${width}px solid ${color}`,
    opacity,
  });
  return (
    <div
      style={{
        display: "flex",
        position: "absolute",
        top: 0,
        left: 0,
        width: COVER_WIDTH,
        height: COVER_HEIGHT,
      }}
    >
      <div style={ring(300, 4, 0.28)} />
      <div style={ring(170, 6, 0.55)} />
      <div style={{ ...ring(52, 0, 0.9), background: color, border: "none" }} />
    </div>
  );
}

/** 헤드라인을 줄로 나눈다. 줄바꿈은 부르는 쪽이 `\n` 으로 정한다 */
function lines(headline: string): string[] {
  return headline.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 3);
}

export async function renderCoverJpeg(input: CoverInput): Promise<Buffer> {
  const tone = input.tone ?? (input.category ? TONE_OF[input.category] : "navy");
  const c = PALETTE[tone];
  const font = await loadFont();
  const rows = lines(input.headline);
  // 세 줄이면 글자를 줄여야 안전영역 안에 선다
  const size = rows.length >= 3 ? 46 : 54;

  const png = await new ImageResponse(
    (
      <div
        style={{
          width: COVER_WIDTH,
          height: COVER_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: c.bg,
          color: c.fg,
          fontFamily: "NotoKR",
          position: "relative",
          paddingLeft: SAFE_LEFT,
          paddingBottom: 68,
        }}
      >
        <Rings color={c.ring} />
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            background: c.chipBg,
            color: c.chipFg,
            fontSize: 24,
            letterSpacing: 2.2,
            padding: "8px 14px",
            borderRadius: 4,
            marginBottom: 26,
          }}
        >
          {input.chip}
        </div>
        {rows.map((line, i) => (
          <div
            key={i}
            style={{ display: "flex", fontSize: size, letterSpacing: -2.4, lineHeight: 1.2 }}
          >
            {line}
          </div>
        ))}
        <div style={{ display: "flex", fontSize: 26, opacity: 0.72, marginTop: 14 }}>
          {input.pin}
        </div>
      </div>
    ),
    {
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      fonts: [{ name: "NotoKR", data: font, weight: 700, style: "normal" }],
    },
  ).arrayBuffer();

  /*
    **JPEG 으로 바꾸는 것이 선택이 아니다.** 인스타 발행 API 는 JPEG 만 받는다.
    품질 92 는 앞서 손으로 만든 커버와 같은 값이다.
  */
  return sharp(Buffer.from(png)).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer();
}
