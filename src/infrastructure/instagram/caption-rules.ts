/**
 * 캡션 규약. **어기면 발행이 거절된다.**
 *
 * 문서로만 적어 두면 다음 사람이(또는 다음 세션의 내가) 모르고 어긴다. 실제로
 * 세 건을 올리고 나서야 지적받았다 — 그래서 규칙을 검사기로 옮긴다.
 */

/**
 * **앱 조작을 안내하는 문장을 쓰지 않는다.**
 *
 * 피드를 보는 사람은 앱을 아직 모른다. "앱에서 X 를 누르면 Y" 는 그 사람에게
 * 할 일을 지시하는 말이고, 장소 이야기를 하다가 갑자기 광고로 넘어가는 것으로
 * 읽힌다. 앱 이야기는 프로필 소개와 링크가 한다.
 *
 * 브랜드 이름이나 도메인을 적는 것은 막지 않는다 — 막는 것은 **행동 지시**다.
 */
const FORBIDDEN: { pattern: RegExp; why: string }[] = [
  { pattern: /앱에서/, why: "앱 조작 안내 — '앱에서 …' 로 시작하는 문장" },
  { pattern: /앱을\s*(열|켜|받)/, why: "앱 조작 안내 — 앱을 열라는 지시" },
  { pattern: /(누르면|눌러|탭하면|클릭하면|검색하면)/, why: "앱 조작 안내 — 무엇을 누르라는 지시" },
  { pattern: /\bin the app\b/i, why: "앱 조작 안내 — in the app" },
  { pattern: /\b(tap|open the app|click)\b/i, why: "앱 조작 안내 — tap/open/click" },
];

/**
 * **사람이 채울 자리가 남은 채로 나가지 않는다.**
 *
 * `draft-copy.ts` 는 소개 한 문장을 비워 두고 `[여기에 한 문장 …]` 을 넣는다 —
 * 눈에 띄라고 대괄호를 쓴다. 그 표시가 그대로 발행되면 게시물에 대괄호가 박힌 채
 * 남고 **인스타는 캡션을 고칠 수 없다.** 컨펌 절차를 건너뛰는 발행이 생긴 이상
 * 사람의 눈이 아니라 검사기가 막아야 한다.
 */
const UNFILLED = /\[[^\]]{4,}\]/;

export type CaptionProblem = { why: string; found: string };

/** 캡션이 규약을 어겼는지 본다. 빈 배열이면 통과다 */
export function findCaptionProblems(caption: string): CaptionProblem[] {
  const out: CaptionProblem[] = [];
  for (const { pattern, why } of [
    ...FORBIDDEN,
    { pattern: UNFILLED, why: "채우지 않은 자리 — 대괄호 표시가 남아 있다" },
  ]) {
    const m = caption.match(pattern);
    if (m) {
      /*
        어긴 문장을 통째로 돌려준다. 낱말만 알려 주면 어디를 고쳐야 하는지
        캡션을 다시 훑어야 한다.
      */
      const at = m.index ?? 0;
      const start = Math.max(0, caption.lastIndexOf("\n", at) + 1);
      const endMark = caption.indexOf("\n", at);
      const end = endMark === -1 ? caption.length : endMark;
      out.push({ why, found: caption.slice(start, end).trim().slice(0, 120) });
    }
  }
  return out;
}

/** 인스타 캡션 상한 */
export const CAPTION_MAX = 2200;
