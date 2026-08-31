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
 * **크기는 함께 실을 사진에 맞춘다.** 캐러셀은 첫 장 비율로 나머지를 자르므로
 * 커버가 사진과 다르면 사진이 잘린다.
 */

/**
 * 기본 크기. **장소마다 다르므로 부르는 쪽이 사진 크기를 넘겨야 한다.**
 *
 * 처음에는 TourAPI 사진이 전부 940×627(3:2)인 줄 알았는데 아니었다 —
 * 실측 2026-08-31: 북촌한옥마을 940×627(1.499), 경포호수광장 **940×705**(1.333).
 * 캐러셀은 첫 장 비율로 나머지를 자르므로, 커버가 사진과 다르면 **사진이 잘린다.**
 * 공공누리 제3유형은 변경금지라 그것이 곧 위반이다.
 */
export const COVER_WIDTH = 940;
export const COVER_HEIGHT = 627;

/**
 * 프로필 그리드가 자르는 비율. **정사각이 아니라 4:5 세로다.**
 *
 * 처음에는 가운데 정사각으로 자른다고 보고 안전영역을 잡았는데 틀렸다 —
 * 실측 2026-08-31: 940×705 커버에서 정사각 기준 안전영역은 `x=178` 인데 4:5 크롭은
 * `x=188` 부터라 10px 이 밖으로 나가 글자가 잘렸다. 940×627 도 3px 모자랐다.
 */
const GRID_RATIO = 4 / 5;

/** 크롭 경계에서 안쪽으로 더 들이는 여백 */
const SAFE_PAD = 60;

/** 그리드에서 살아남는 가로 구간 */
function safeBox(width: number, height: number): { left: number; usable: number } {
  const cropWidth = Math.min(width, height * GRID_RATIO);
  return {
    left: Math.round((width - cropWidth) / 2 + SAFE_PAD),
    usable: Math.round(cropWidth - SAFE_PAD * 2),
  };
}

export function safeLeft(width: number, height: number): number {
  return safeBox(width, height).left;
}

/**
 * 안전영역 안에 들어가는 가장 큰 글자 크기를 찾는다.
 *
 * **고정 크기로 두면 문구가 길어질 때 조용히 잘린다.** 한글은 글자당 폭이 크기의
 * 약 0.98배, 공백과 라틴은 그보다 좁다. 그 어림으로 재서 넘치면 한 단계씩 줄인다.
 */
function fitFontSize(rows: string[], usable: number, max: number, min = 30): number {
  const widthAt = (line: string, size: number) =>
    [...line].reduce((sum, ch) => {
      if (ch === " ") return sum + size * 0.3;
      // 한글·한자·가나는 전각으로 본다
      return sum + size * (/[\u1100-\u11FF\u3040-\u30FF\u3400-\u9FFF\uAC00-\uD7AF]/.test(ch) ? 0.98 : 0.55);
    }, 0);

  for (let size = max; size > min; size -= 2) {
    if (rows.every((line) => widthAt(line, size) <= usable)) return size;
  }
  return min;
}

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
  /** **함께 실을 사진과 같은 크기.** 생략하면 940×627 이다 */
  width?: number;
  height?: number;
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
 * 중심은 오른쪽에서 198px, 위에서 높이의 30% 자리다 — 안전영역 밖이라 썸네일에서
 * 일부가 잘리는데, 장식이므로 의도한 것이다.
 */
function Rings({ color, width, height }: { color: string; width: number; height: number }) {
  const cx = width - 198;
  const cy = Math.round(height * 0.3);
  const ring = (size: number, width: number, opacity: number) => ({
    display: "flex" as const,
    position: "absolute" as const,
    width: size,
    height: size,
    top: cy - size / 2,
    left: cx - size / 2,
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
        width,
        height,
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
  const width = input.width ?? COVER_WIDTH;
  const height = input.height ?? COVER_HEIGHT;
  const tone = input.tone ?? (input.category ? TONE_OF[input.category] : "navy");
  const c = PALETTE[tone];
  const font = await loadFont();
  const rows = lines(input.headline);
  const box = safeBox(width, height);
  // 세 줄이면 시작 크기를 낮춘 뒤, 거기서 다시 안전영역에 맞춰 줄인다
  const size = fitFontSize(rows, box.usable, rows.length >= 3 ? 46 : 54);

  const png = await new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: c.bg,
          color: c.fg,
          fontFamily: "NotoKR",
          position: "relative",
          paddingLeft: box.left,
          paddingRight: width - box.left - box.usable,
          paddingBottom: 68,
        }}
      >
        <Rings color={c.ring} width={width} height={height} />
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            background: c.chipBg,
            color: c.chipFg,
            fontSize: Math.min(24, Math.round(size * 0.44)),
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
        <div
          style={{
            display: "flex",
            fontSize: fitFontSize([input.pin], box.usable, 26, 16),
            opacity: 0.72,
            marginTop: 14,
          }}
        >
          {input.pin}
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [{ name: "NotoKR", data: font, weight: 700, style: "normal" }],
    },
  ).arrayBuffer();

  /*
    **JPEG 으로 바꾸는 것이 선택이 아니다.** 인스타 발행 API 는 JPEG 만 받는다.
    품질 92 는 앞서 손으로 만든 커버와 같은 값이다.
  */
  return sharp(Buffer.from(png)).jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer();
}
