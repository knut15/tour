import { describe, expect, it } from "vitest";
import { parseSpotName } from "@/domain/spot/spot";

describe("parseSpotName", () => {
  it("영문 로케일에서 괄호 안의 한글을 원명으로 분리한다", () => {
    // 실제 EngService2 응답 형태
    expect(parseSpotName("Cheonggyecheon Stream (청계천)", "en")).toEqual({
      primary: "Cheonggyecheon Stream",
      korean: "청계천",
    });
    expect(parseSpotName("Achasan Mountain (아차산)", "en")).toEqual({
      primary: "Achasan Mountain",
      korean: "아차산",
    });
  });

  it("한글이 없는 괄호는 원명으로 보지 않는다", () => {
    // "(branch)" 같은 영문 괄호까지 한글명으로 오인하면 화면에 영어가 두 번 나온다
    expect(parseSpotName("Some Cafe (Gangnam Branch)", "en")).toEqual({
      primary: "Some Cafe (Gangnam Branch)",
      korean: null,
    });
  });

  it("괄호가 없으면 한글명은 없다", () => {
    expect(parseSpotName("Seoul Cruise", "en")).toEqual({
      primary: "Seoul Cruise",
      korean: null,
    });
  });

  it("한글이 섞인 실제 응답을 처리한다", () => {
    expect(parseSpotName("1stbutton Rhinoplasty clinic (첫단추의원)", "en")).toEqual({
      primary: "1stbutton Rhinoplasty clinic",
      korean: "첫단추의원",
    });
  });

  it("한국어 로케일에서는 제목이 곧 한글명이다", () => {
    expect(parseSpotName("경복궁", "ko")).toEqual({ primary: "경복궁", korean: "경복궁" });
    expect(parseSpotName("백련사(강북)", "ko")).toEqual({
      primary: "백련사(강북)",
      korean: "백련사(강북)",
    });
  });

  it("앞뒤 공백을 제거한다", () => {
    expect(parseSpotName("  Gyeongbokgung Palace (경복궁)  ", "en").primary).toBe(
      "Gyeongbokgung Palace",
    );
  });

  it("괄호만 있고 앞이 비면 통째로 primary 로 둔다", () => {
    expect(parseSpotName("(청계천)", "en")).toEqual({ primary: "(청계천)", korean: null });
  });
});
