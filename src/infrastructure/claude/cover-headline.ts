import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/**
 * 상세 설명을 커버 헤드라인 두 줄로 줄인다.
 *
 * **여기가 이 저장소에서 모델을 부르는 유일한 곳이다.** 초안의 나머지 —
 * 분류·사실 줄·해시태그 — 는 전부 규칙이 정한다(`draft-copy.ts`). 상태 코드가
 * 답할 수 있는 질문에 모델을 쓰지 않는다. 다만 **다섯 문단짜리 설명에서 무엇이
 * 이 장소의 한 가지인지 고르는 일**은 규칙으로 안 된다. 그것만 맡긴다.
 *
 * **기존 고정 문구를 대체한다.** `draftHeadline(trait)` 은 성격별 여덟 문구뿐이라
 * 같은 성격이면 다른 장소가 같은 제목을 단다 — 실측 2026-08-31: 큐에 있던 5건 중
 * 3건이 `닫는 시간이 / 따로 없는 곳`, 2건이 `가기 전에 / 요일부터 확인` 이었다.
 * 그리드에서 같은 글자가 나란히 걸리면 계정이 자동 생성물로 읽힌다.
 *
 * **실패하면 `null` 이다.** 부르는 쪽이 고정 문구로 떨어진다 — 모델이 안 되는 날에
 * 초안 생성 전체가 멈출 이유가 없다.
 */

/** 한 줄 상한. 커버는 두 줄이고 넘치면 `fitFontSize` 가 글자를 줄여 제목이 작아진다 */
const MAX_CHARS = 8;

/**
 * 문체의 기준. **새로 쓰지 않고 이미 쓰던 여덟 문구를 그대로 보여 준다** —
 * 계정이 이미 낸 목소리가 곧 사양이다.
 */
const VOICE = [
  "닫는 시간이 / 따로 없는 곳",
  "비 와도 하루가 / 안 망하는 곳",
  "무료인데 / 이 정도면 반칙",
  "해 지고 나서 / 더 좋아지는 곳",
  "가기 전에 / 요일부터 확인",
  "차 두고 / 걸어가야 하는 곳",
  "이번에 놓치면 / 내년까지 기다림",
  "오늘 하루를 / 여기서 씁니다",
].join("\n");

const SYSTEM = `너는 한국 여행 인스타 계정의 카피라이터다. 장소 소개글을 읽고 커버 이미지에 얹을 헤드라인 두 줄을 쓴다.

## 형식
- 정확히 두 줄. 줄 사이는 줄바꿈 하나.
- **각 줄 8자 이하.** 공백도 한 자로 센다. 이것을 넘기면 쓸 수 없다.
- 각 줄에 공백을 하나 이상 넣는다. 첫 낱말이 밝게, 나머지가 흐리게 그려지므로 붙여 쓰면 강조가 죽는다.
- 마침표·느낌표·물음표·따옴표·이모지를 쓰지 않는다.

## 내용
- 장소 이름을 넣지 않는다. 이름은 커버 아래쪽과 캡션이 이미 말한다.
- 소개글의 첫 문장을 옮기지 않는다. 대개 "OO은 1392년 …" 같은 사전 설명이라 이 계정의 말투가 아니다.
- **가서 무엇을 하게 되는지, 또는 왜 여기여야 하는지**를 고른다. 연혁·면적·행정 정보는 버린다.
- 소개글에 없는 사실을 지어내지 않는다. 소개글이 빈약하면 사실 항목에서 고른다.
- 두 줄이 한 문장으로 이어져 읽히게 쓴다.

## 이 계정이 쓰던 문장
${VOICE}

## 답
헤드라인 두 줄만 쓴다. 설명·따옴표·머리말을 붙이지 않는다.`;

export type HeadlineSource = {
  name: string;
  /** 앱이 쓰는 분류 이름 그대로 — `가볼 곳`·`먹을 곳`·`문화`·`지금 열리는` */
  chip: string;
  overview: string | null;
  /** 운영시간·휴무·요금 같은 사실 줄. 소개글이 빈약할 때 여기서 고른다 */
  facts: string | null;
};

/**
 * 모델이 준 답을 이 커버에 실을 수 있는 형태인지 **코드가 판정한다.**
 * 길이는 모델에게 물어볼 것이 아니라 세면 되는 값이다.
 */
export function accept(raw: string): string | null {
  const rows = raw
    .split("\n")
    .map((line) => line.trim().replace(/^["'`]|["'`]$/g, ""))
    .filter(Boolean);

  if (rows.length !== 2) return null;
  if (rows.some((line) => [...line].length > MAX_CHARS)) return null;
  if (rows.some((line) => /[.!?…"'“”‘’]/.test(line))) return null;
  return rows.join("\n");
}

export async function writeCoverHeadline(source: HeadlineSource): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY?.trim();
  if (!key) return null;

  const body = [
    `장소: ${source.name}`,
    `분류: ${source.chip}`,
    source.facts ? `사실: ${source.facts}` : null,
    "",
    "소개글:",
    (source.overview ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || "(없음)",
  ]
    .filter((line) => line !== null)
    .join("\n");

  try {
    const client = new Anthropic({ apiKey: key });
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      system: SYSTEM,
      messages: [{ role: "user", content: body }],
    });

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    const ok = accept(text);
    /*
      **떨어진 이유를 남긴다.** 조용히 `null` 만 돌려주면 제목이 왜 예전 문구인지
      알 길이 없다 — 모델이 안 된 것과 형식을 어긴 것은 대응이 다르다.
    */
    if (!ok) console.error(`[cover-headline] 형식에 안 맞아 버렸다: ${JSON.stringify(text)}`);
    return ok;
  } catch (error) {
    /*
      **고정 문구로 떨어지되 이유는 남긴다.** 여기서 던지면 초안 cron 이 통째로
      실패한다 — 제목 하나 때문에 그 주에 아무것도 안 올라가는 것이 더 나쁘다.
    */
    console.error("[cover-headline] 모델 호출 실패:", error instanceof Error ? error.message : error);
    return null;
  }
}
