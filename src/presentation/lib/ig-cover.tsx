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

/** 레터박스 여백 색. 브랜드 잉크다 — `/api/photo` 와 같은 값을 쓴다 */
const PAD_COLOR = "#1e1613";

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

/** 커버에 얹을 칩 한 개 */
export type CoverChip = { icon: string; text: string };

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
  /**
   * 바탕에 깔 사진의 원본 URL. 주면 색면 대신 **사진 위에 글자를 얹는다.**
   *
   * 크기는 사진에서 읽으므로 `width`·`height` 를 따로 넘길 필요가 없다 —
   * 같은 장소 안에서도 사진마다 크기가 달라(실측 2026-08-31) 손으로 맞추면 틀린다.
   *
   * **공공누리 제3유형은 변경금지다.** 글자를 얹은 이 한 장은 개변물이므로,
   * 캐러셀 다음 장에 **손대지 않은 같은 사진**을 함께 싣는 것을 전제로 쓴다.
   */
  photoUrl?: string;
  /**
   * 사실 칩. 운영시간·휴무·주차처럼 **가기 전에 알아야 하는 것**만 올린다.
   * 다섯 개를 넘으면 두 줄이 되고 사진을 너무 가린다.
   */
  chips?: CoverChip[];
  /** 하단 왼쪽 — 라벨과 큰 값. 요금처럼 한눈에 보여야 하는 값이다 */
  highlight?: { label: string; value: string } | null;
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
  /*
    사진을 깔 때는 크기를 사진에서 읽는다. 넘겨받은 값을 믿으면 어긋난 순간
    합성이 밀리거나 캐러셀에서 다른 장이 잘린다.
  */
  let photo: Buffer | null = null;
  let photoSize: { width: number; height: number } | null = null;
  if (input.photoUrl) {
    const res = await fetch(input.photoUrl);
    if (!res.ok) throw new Error(`사진을 받지 못했다: HTTP ${res.status}`);
    photo = Buffer.from(await res.arrayBuffer());

    /*
      액자 크기를 함께 받았으면 커버도 같은 액자에 담는다. **커버만 원본 크기로
      두면 캐러셀 첫 장이 되어 나머지가 그 비율로 잘린다** — 레터박스를 쓰는
      의미가 사라진다.
    */
    if (input.width && input.height) {
      photo = await sharp(photo)
        .resize(input.width, input.height, {
          fit: "contain",
          background: PAD_COLOR,
          withoutEnlargement: true,
        })
        .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
        .toBuffer();
    }

    const meta = await sharp(photo).metadata();
    if (!meta.width || !meta.height) throw new Error("사진 크기를 읽지 못했다");
    photoSize = { width: meta.width, height: meta.height };
  }

  const width = photoSize?.width ?? input.width ?? COVER_WIDTH;
  const height = photoSize?.height ?? input.height ?? COVER_HEIGHT;
  const tone = input.tone ?? (input.category ? TONE_OF[input.category] : "navy");
  const c = PALETTE[tone];
  const font = await loadFont();
  const rows = lines(input.headline);
  const box = safeBox(width, height);
  // 세 줄이면 시작 크기를 낮춘 뒤, 거기서 다시 안전영역에 맞춰 줄인다
  const size = fitFontSize(rows, box.usable, rows.length >= 3 ? 46 : 54);
  /* 칩과 하단 줄은 헤드라인에 비례한다 — 한 값이 판 전체의 크기를 정한다 */
  const chipSize = Math.max(18, Math.round(size * 0.42));
  const chips = (input.chips ?? []).slice(0, 5);

  const png = await new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          /*
            사진 위에서는 바탕을 칠하지 않는다. 대신 아래쪽에 어두운 그라디언트를
            깔아 글자가 사진 위에서도 읽히게 한다 — 사진 픽셀을 가리는 최소한이다.
          */
          background: photo
            ? "linear-gradient(to bottom, rgba(0,0,0,0) 38%, rgba(0,0,0,0.72) 100%)"
            : c.bg,
          color: photo ? "#ffffff" : c.fg,
          fontFamily: "NotoKR",
          position: "relative",
          paddingLeft: box.left,
          paddingRight: width - box.left - box.usable,
          paddingBottom: 68,
        }}
      >
        {!photo && <Rings color={c.ring} width={width} height={height} />}
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
        {/*
          **줄마다 첫 낱말을 강조한다.** 레퍼런스는 굵기로 가르지만 폰트 서브셋이
          한 굵기(700)뿐이라 — 두 굵기를 실으면 `ImageResponse` 500KB 예산을 넘는다 —
          밝기로 가른다. 사진 위 그라디언트에서는 이 대비로 충분하다.
        */}
        {rows.map((line, i) => {
          const [head, ...rest] = line.split(" ");
          return (
            <div
              key={i}
              style={{ display: "flex", fontSize: size, letterSpacing: -2.4, lineHeight: 1.2 }}
            >
              <div style={{ display: "flex" }}>{head}</div>
              {rest.length > 0 && (
                <div style={{ display: "flex", opacity: 0.78, marginLeft: size * 0.22 }}>
                  {rest.join(" ")}
                </div>
              )}
            </div>
          );
        })}

        {chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 }}>
            {chips.map((chip) => (
              <div
                key={chip.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: chipSize,
                  padding: `${Math.round(chipSize * 0.42)}px ${Math.round(chipSize * 0.72)}px`,
                  borderRadius: 999,
                  background: photo ? "rgba(0,0,0,0.42)" : c.chipBg,
                  color: photo ? "#ffffff" : c.chipFg,
                  border: photo ? "1px solid rgba(255,255,255,0.28)" : "none",
                }}
              >
                {chip.icon ? <div style={{ display: "flex" }}>{chip.icon}</div> : null}
                <div style={{ display: "flex" }}>{chip.text}</div>
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 26,
            width: box.usable,
          }}
        >
          {input.highlight ? (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: chipSize, opacity: 0.72 }}>
                {`| ${input.highlight.label}`}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: Math.round(size * 0.66),
                  letterSpacing: -1.4,
                  marginTop: 4,
                }}
              >
                {input.highlight.value}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }} />
          )}
          <div
            style={{
              display: "flex",
              fontSize: chipSize,
              padding: `${Math.round(chipSize * 0.5)}px ${Math.round(chipSize * 0.95)}px`,
              borderRadius: 999,
              background: c.chipBg,
              color: c.chipFg,
            }}
          >
            {input.pin}
          </div>
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
  */
  const layer = Buffer.from(png);
  const out = photo ? sharp(photo).composite([{ input: layer, top: 0, left: 0 }]) : sharp(layer);
  return out.jpeg({ quality: 92, chromaSubsampling: "4:4:4" }).toBuffer();
}

/* ── 정보 카드 ──────────────────────────────────────────────── */

export type InfoRow = { label: string; value: string };

export type InfoInput = {
  title: string;
  rows: InfoRow[];
  /** 커버·사진과 같은 크기여야 한다. 다르면 캐러셀에서 잘린다 */
  width: number;
  height: number;
};

/**
 * 캐러셀 마지막 장. **주소·시간·휴무를 한 판에 세운다.**
 *
 * 캡션에도 같은 값이 들어가지만, 캡션은 접혀 있고 사진을 넘기는 사람은 캡션을
 * 안 볼 수 있다. 저장해 두고 나중에 볼 때 **그림 하나로 끝나는 것**이 낫다.
 *
 * 커버와 같은 폰트·안전영역을 쓴다 — 프로필 그리드가 4:5 로 자르므로 글자가 그
 * 밖에 있으면 썸네일에서 사라진다.
 */
export async function renderInfoJpeg(input: InfoInput): Promise<Buffer> {
  const { width, height } = input;
  const font = await loadFont();
  const box = safeBox(width, height);
  const c = PALETTE.cream;

  /*
    줄 수에 따라 글자를 줄인다. 다섯 줄이 넘으면 고정 크기로는 판을 넘긴다 —
    커버가 겪은 것과 같은 문제라 같은 방식으로 푼다.
  */
  const rows = input.rows.slice(0, 6);
  const size = rows.length >= 5 ? 22 : 25;
  const labelWidth = Math.round(box.usable * 0.26);

  const png = await new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: c.bg,
          color: c.fg,
          fontFamily: "NotoKR",
          position: "relative",
          paddingLeft: box.left,
          paddingRight: width - box.left - box.usable,
        }}
      >
        <Rings color={c.ring} width={width} height={height} />
        <div
          style={{
            display: "flex",
            fontSize: Math.round(size * 1.75),
            letterSpacing: -1.8,
            marginBottom: 30,
          }}
        >
          {input.title}
        </div>
        {rows.map((row) => (
          <div key={row.label} style={{ display: "flex", marginBottom: 14, fontSize: size }}>
            <div style={{ display: "flex", width: labelWidth, color: "#547080", flexShrink: 0 }}>
              {row.label}
            </div>
            <div style={{ display: "flex", flex: 1 }}>{row.value}</div>
          </div>
        ))}
      </div>
    ),
    { width, height, fonts: [{ name: "NotoKR", data: font, weight: 700, style: "normal" }] },
  ).arrayBuffer();

  return sharp(Buffer.from(png))
    .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
    .toBuffer();
}
