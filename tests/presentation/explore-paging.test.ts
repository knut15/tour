import { describe, expect, it } from "vitest";
import {
  BATCH,
  MORE_MAX,
  enterFrom,
  parseMore,
  requestSize,
} from "@/presentation/lib/explore-paging";

describe("parseMore", () => {
  it("없거나 숫자가 아니면 0 이다", () => {
    expect(parseMore(undefined)).toBe(0);
    expect(parseMore("")).toBe(0);
    expect(parseMore("abc")).toBe(0);
    expect(parseMore("1.5")).toBe(0);
  });

  it("범위 밖은 0 으로 떨어뜨린다", () => {
    // 링크를 손으로 고친 사람에게 보여줄 화면은 첫 묶음 말고 없다
    expect(parseMore("0")).toBe(0);
    expect(parseMore("-3")).toBe(0);
    expect(parseMore(String(MORE_MAX + 1))).toBe(0);
  });

  it("범위 안은 그대로 읽는다", () => {
    expect(parseMore("1")).toBe(1);
    expect(parseMore(String(MORE_MAX))).toBe(MORE_MAX);
  });
});

describe("requestSize", () => {
  it("한 번도 안 눌렀으면 한 묶음이다", () => {
    expect(requestSize(0)).toBe(BATCH);
  });

  it("누른 만큼 늘어난다", () => {
    expect(requestSize(1)).toBe(BATCH * 2);
    expect(requestSize(2)).toBe(BATCH * 3);
  });

  it("상한까지 눌러도 TourAPI numOfRows 상한 200 을 넘지 않는다", () => {
    // 실측 2026-08-19: numOfRows 200 까지 200건을 준다
    expect(requestSize(MORE_MAX)).toBeLessThanOrEqual(200);
  });

  it("한 묶음이 열 수로 나누어떨어진다", () => {
    // 아니면 마지막 줄만 이가 빠진 채 남는다. 벽은 최대 4열이다
    for (const columns of [1, 2, 3, 4]) expect(BATCH % columns).toBe(0);
  });
});

describe("enterFrom", () => {
  it("첫 화면은 아무것도 등장시키지 않는다", () => {
    // 페이지를 여는 것은 "추가" 가 아니다
    expect(enterFrom(0, BATCH)).toBeUndefined();
  });

  it("새로 붙은 묶음의 첫 인덱스를 준다", () => {
    expect(enterFrom(1, BATCH * 2)).toBe(BATCH);
    expect(enterFrom(2, BATCH * 3)).toBe(BATCH * 2);
  });

  it("걸러져서 적게 왔으면 목록 끝으로 자른다", () => {
    // 자르지 않으면 경계가 목록 밖을 가리켜 새 카드가 하나도 애니메이션되지
    // 않는다 — 사용자에게는 "눌렀는데 반응이 없다" 로 보인다
    expect(enterFrom(2, BATCH * 2 - 4)).toBe(BATCH * 2 - 4);
  });
});
