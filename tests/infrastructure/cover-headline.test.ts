import { describe, expect, it } from "vitest";
import { accept } from "@/infrastructure/claude/cover-headline";

/**
 * 이 검사가 지키는 것은 **커버의 위계**다.
 *
 * 헤드라인은 액자 높이의 8.6% 로 그려지고 폭이 모자라면 `fitFontSize` 가 글자를
 * 줄인다. 한 줄이 8자를 넘으면 제목이 조용히 작아져 커버가 제 구실을 못 한다 —
 * 그래서 길이는 모델에게 부탁할 것이 아니라 **코드가 세고 거절해야** 한다.
 */
describe("accept", () => {
  it("두 줄이고 각 줄 8자 이하면 받는다", () => {
    expect(accept("닫는 시간이\n따로 없는 곳")).toBe("닫는 시간이\n따로 없는 곳");
  });

  it("한 줄이라도 8자를 넘으면 버린다 — 넘치면 제목이 작아진다", () => {
    expect(accept("닫는 시간이\n따로 없는 조용한 곳")).toBeNull();
  });

  it("두 줄이 아니면 버린다 — 커버는 두 줄로 짜여 있다", () => {
    expect(accept("한 줄뿐")).toBeNull();
    expect(accept("한 줄\n두 줄\n세 줄")).toBeNull();
  });

  it("문장부호를 붙이면 버린다 — 이 계정은 제목에 마침표를 찍지 않는다", () => {
    expect(accept("닫는 시간이\n따로 없다.")).toBeNull();
    expect(accept('"닫는 시간이"\n따로 없는 곳')).toBe("닫는 시간이\n따로 없는 곳");
  });

  it("모델이 붙인 빈 줄과 앞뒤 공백은 답으로 치지 않는다", () => {
    expect(accept("\n  닫는 시간이  \n\n따로 없는 곳\n")).toBe("닫는 시간이\n따로 없는 곳");
  });
});
