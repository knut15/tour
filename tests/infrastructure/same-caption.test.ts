import { describe, expect, it } from "vitest";
import { sameCaption } from "@/infrastructure/instagram/instagram-client";

/**
 * 이 비교가 지키는 것은 **같은 글이 두 번 나가지 않는 것**이다.
 *
 * 실측 2026-09-01: `media_publish` 가 403 을 주면서도 게시물은 만들어졌다.
 * 응답을 믿고 재시도해 같은 글이 20건 올라갔고, 인스타 API 에는 삭제가 없어
 * 사람이 앱에서 하나씩 지웠다. 발행 전후로 이 비교가 계정을 대조한다.
 */
describe("sameCaption", () => {
  const caption = "몇 시에 가야 하나 재지 않아도 되는 곳이 있어요.\n\n탐진강\n전남 장흥군";

  it("같은 글이면 같다고 본다", () => {
    expect(sameCaption(caption, caption)).toBe(true);
  });

  it("공백과 개행이 달라져도 같은 글로 본다 — 인스타가 정규화해 돌려준다", () => {
    expect(sameCaption(caption.replace(/\n+/g, " "), caption)).toBe(true);
  });

  it("다른 장소면 다르다고 본다", () => {
    expect(sameCaption(caption, "주차가 안 되는 대신 걸어 들어가는 길이 좋습니다.\n\n놀맨")).toBe(false);
  });

  it("빈 캡션은 어떤 것과도 같지 않다 — 캡션을 못 읽은 것을 일치로 읽으면 발행이 막힌다", () => {
    expect(sameCaption("", caption)).toBe(false);
    expect(sameCaption("", "")).toBe(false);
  });

  it("도입부가 같아도 뒤가 다르면 200자 안에서 갈린다", () => {
    const a = `${"가".repeat(180)}탐진강`;
    const b = `${"가".repeat(180)}놀맨`;
    expect(sameCaption(a, b)).toBe(false);
  });
});
