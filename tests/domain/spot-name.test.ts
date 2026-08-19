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

describe("parseSpotName — 다국어", () => {
  it("일본어의 전각 괄호를 처리한다", () => {
    // 실제 JpnService2 응답. 반각만 처리하면 한글 원명을 통째로 놓친다
    expect(parseSpotName("スパレイ（스파레이）", "ja")).toEqual({
      primary: "スパレイ",
      korean: "스파레이",
    });
    expect(parseSpotName("仁寺洞広報館（인사동홍보관）", "ja")).toEqual({
      primary: "仁寺洞広報館",
      korean: "인사동홍보관",
    });
  });

  it("안쪽에 다른 괄호가 껴 있어도 끝의 한글 괄호만 원명으로 본다", () => {
    expect(parseSpotName("崔赫(チェヒョク)韓医院 (최혁한의원)", "ja")).toEqual({
      primary: "崔赫(チェヒョク)韓医院",
      korean: "최혁한의원",
    });
  });

  it("중국어 번체", () => {
    expect(parseSpotName("首爾遊覽船(서울크루즈)", "zh-Hant")).toEqual({
      primary: "首爾遊覽船",
      korean: "서울크루즈",
    });
  });

  it("독일어·프랑스어", () => {
    expect(parseSpotName("Straße Seosulla-gil (서순라길)", "de")).toEqual({
      primary: "Straße Seosulla-gil",
      korean: "서순라길",
    });
    expect(parseSpotName("Espace vert de Songhyeon ouvert (열린송현 녹지광장)", "fr")).toEqual({
      primary: "Espace vert de Songhyeon ouvert",
      korean: "열린송현 녹지광장",
    });
  });

  it("번역이 없어 한글만 오는 경우를 버리지 않는다", () => {
    // FreService2 에 실재한다. primary 를 비우면 이름 없는 카드가 된다
    expect(parseSpotName("세종마을 음식문화거리", "fr")).toEqual({
      primary: "세종마을 음식문화거리",
      korean: null,
    });
  });

  it("전각 괄호 안에 한글이 없으면 원명으로 보지 않는다", () => {
    expect(parseSpotName("スパレイ（すぱれい）", "ja")).toEqual({
      primary: "スパレイ（すぱれい）",
      korean: null,
    });
  });
});
