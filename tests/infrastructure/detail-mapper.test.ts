import { describe, expect, it } from "vitest";
import {
  stripHtml,
  toFacts,
  toHomepageUrl,
} from "@/infrastructure/tourapi/tourapi-detail-mapper";

describe("toFacts", () => {
  it("카테고리마다 다른 필드명을 같은 의미로 정규화한다", () => {
    // 실측으로 확인한 필드명이다
    expect(toFacts({ usetime: "09:00-18:00", restdate: "Tue" } as never, "attraction")).toMatchObject({
      openingHours: "09:00-18:00",
      closedDays: "Tue",
    });
    expect(
      toFacts({ usetimeculture: "10:00-17:00", usefee: "Free" } as never, "culture"),
    ).toMatchObject({ openingHours: "10:00-17:00", admission: "Free" });
    expect(toFacts({ opentimefood: "11:00-22:00" } as never, "food")).toMatchObject({
      openingHours: "11:00-22:00",
    });
    // ⚠️ usetimefestival 은 이름과 달리 **이용요금**이다. 영업시간은 playtime 이다
    expect(
      toFacts({ playtime: "18:00-21:00", usetimefestival: "Free" } as never, "festival"),
    ).toMatchObject({ openingHours: "18:00-21:00", admission: "Free" });
  });

  it("usetimefestival 을 영업시간으로 읽지 않는다", () => {
    // 이름에 usetime 이 들어 있어 가장 틀리기 쉬운 자리다. 매뉴얼 원문은 "이용요금" 이다
    const f = toFacts({ usetimefestival: "Free" } as never, "festival");
    expect(f.openingHours).toBeNull();
    expect(f.admission).toBe("Free");
  });

  it("다른 카테고리의 필드명은 읽지 않는다", () => {
    // 음식점 필드를 관광지로 읽으면 값이 조용히 사라진다
    expect(toFacts({ opentimefood: "11:00-22:00" } as never, "attraction").openingHours).toBeNull();
  });

  it("축제 기간을 사람이 읽는 형태로 만든다", () => {
    expect(
      toFacts({ eventstartdate: "20260101", eventenddate: "20261231" } as never, "festival")
        .eventPeriod,
    ).toBe("2026.01.01 – 2026.12.31");
  });

  it("한쪽 날짜만 있어도 버리지 않는다", () => {
    expect(toFacts({ eventstartdate: "20260101" } as never, "festival").eventPeriod).toBe(
      "2026.01.01",
    );
  });

  it("날짜 형식이 깨지면 원문을 그대로 둔다", () => {
    expect(toFacts({ eventstartdate: "상시" } as never, "festival").eventPeriod).toBe("상시");
  });

  it("intro 응답이 없으면 전부 null 이다", () => {
    const f = toFacts(undefined, "attraction");
    expect(Object.values(f).every((v) => v === null)).toBe(true);
  });

  it("빈 문자열은 null 로 떨어뜨린다", () => {
    expect(toFacts({ usetime: "  " } as never, "attraction").openingHours).toBeNull();
  });
});

describe("stripHtml", () => {
  it("br 과 p 를 줄바꿈으로 바꾸고 나머지 태그를 지운다", () => {
    expect(stripHtml("A<br>B<br/>C")).toBe("A\nB\nC");
    expect(stripHtml("<p>A</p><p>B</p>")).toBe("A\nB");
  });

  it("엔티티를 되돌린다", () => {
    expect(stripHtml("A &amp; B &nbsp;C &lt;d&gt;")).toBe("A & B C <d>");
  });

  it("빈 값은 빈 문자열이다", () => {
    expect(stripHtml(null)).toBe("");
    expect(stripHtml(undefined)).toBe("");
  });
});

describe("toHomepageUrl", () => {
  it("평문 URL 에 스킴을 붙인다", () => {
    expect(toHomepageUrl("www.aracruise.co.kr/")).toBe("https://www.aracruise.co.kr/");
  });

  it("a 태그에서 href 를 뽑는다", () => {
    expect(toHomepageUrl('<a href="https://www.royalpalace.go.kr" target="_blank">공식</a>')).toBe(
      "https://www.royalpalace.go.kr/",
    );
  });

  it("javascript 스킴을 링크로 내보내지 않는다", () => {
    // 공급자 문자열을 그대로 href 에 넣으면 주입 통로가 된다
    expect(toHomepageUrl('<a href="javascript:alert(1)">x</a>')).toBeNull();
    expect(toHomepageUrl("javascript:alert(1)")).toBeNull();
  });

  it("호스트로 볼 수 없는 값은 버린다", () => {
    expect(toHomepageUrl("준비중")).toBeNull();
    expect(toHomepageUrl("")).toBeNull();
    expect(toHomepageUrl(null)).toBeNull();
  });
});
