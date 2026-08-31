import { describe, expect, it } from "vitest";
import { findCaptionProblems } from "@/infrastructure/instagram/caption-rules";
import { TODO_MARK, EN_TODO_MARK } from "@/application/instagram/draft-copy";

/**
 * 이 검사가 지키는 것은 **고칠 수 없는 것을 내보내지 않는 것**이다.
 *
 * 인스타는 발행된 게시물의 캡션을 바꿀 수 없다. 컨펌 절차를 건너뛰는 발행이
 * 생긴 이상, 사람이 채우기로 한 자리가 남았는지는 사람의 눈이 아니라 여기가 본다.
 */
describe("findCaptionProblems", () => {
  it("채우지 않은 자리가 남으면 막는다 — 나가면 되돌릴 수 없다", () => {
    const problems = findCaptionProblems(`좋은 곳이 있어요.\n\n${TODO_MARK}\n\n탐진강`);
    expect(problems.map((p) => p.why)).toContain("채우지 않은 자리 — 대괄호 표시가 남아 있다");
  });

  it("영문 블록의 빈자리도 같은 규칙으로 막는다", () => {
    expect(findCaptionProblems(`Some places.\n\n${EN_TODO_MARK}\n\nMokpo`)).not.toHaveLength(0);
  });

  it("다 채운 캡션은 통과한다", () => {
    expect(
      findCaptionProblems("굽이마다 정자가 서 있어요.\n\n탐진강\n전남 장흥군 · 상시 개방"),
    ).toEqual([]);
  });

  it("앱 조작 안내는 그대로 막는다 — 기존 규칙이 살아 있어야 한다", () => {
    expect(findCaptionProblems("앱에서 저장을 누르면 됩니다")).not.toHaveLength(0);
  });
});
