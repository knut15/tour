import type { Category } from "@/domain/spot/category";
import { EMPTY_FACTS, type SpotFacts } from "@/domain/spot/spot-detail";
import type { TourApiItem } from "@/infrastructure/tourapi/tourapi-types";

/**
 * `detailIntro2` 의 필드명은 **카테고리마다 다르다.** 같은 "영업시간" 이
 * `usetime` / `usetimeculture` / `opentimefood` / `usetimefestival` 로 온다.
 * 실측으로 확인한 매핑이다 — 문서에 표가 없어 각 타입을 직접 호출해 필드를 봤다.
 */
type FieldMap = {
  openingHours?: string;
  closedDays?: string;
  inquiry?: string;
  parking?: string;
  admission?: string;
};

const FIELDS: Record<Category, FieldMap> = {
  attraction: {
    openingHours: "usetime",
    closedDays: "restdate",
    inquiry: "infocenter",
    parking: "parking",
  },
  culture: {
    openingHours: "usetimeculture",
    closedDays: "restdateculture",
    inquiry: "infocenterculture",
    parking: "parkingculture",
    admission: "usefee",
  },
  food: {
    openingHours: "opentimefood",
    closedDays: "restdatefood",
    inquiry: "infocenterfood",
    parking: "parkingfood",
  },
  festival: {
    // ⚠️ `usetimefestival` 은 이름과 달리 **이용요금**이다 (매뉴얼: "이용요금").
    // 이름에 usetime 이 들어 있어 영업시간으로 읽기 쉽다. 실제 영업시간은 `playtime`(공연시간)이다.
    openingHours: "playtime",
    admission: "usetimefestival",
    inquiry: "sponsor1tel",
  },
};

type IntroItem = TourApiItem & Record<string, string | undefined>;

function pick(item: IntroItem, key: string | undefined): string | null {
  if (!key) return null;
  const v = item[key];
  const s = typeof v === "string" ? stripHtml(v) : "";
  return s || null;
}

/** `YYYYMMDD` 두 개를 사람이 읽는 기간으로. 값이 깨지면 원문을 그대로 둔다. */
function toPeriod(start: string | undefined, end: string | undefined): string | null {
  const fmt = (v: string | undefined) => {
    const s = v?.trim();
    if (!s || !/^\d{8}$/.test(s)) return s || null;
    return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
  };
  const a = fmt(start);
  const b = fmt(end);
  if (!a && !b) return null;
  if (a && b) return `${a} – ${b}`;
  return a ?? b;
}

export function toFacts(item: TourApiItem | undefined, category: Category): SpotFacts {
  if (!item) return EMPTY_FACTS;
  const i = item as IntroItem;
  const map = FIELDS[category];
  return {
    openingHours: pick(i, map.openingHours),
    closedDays: pick(i, map.closedDays),
    inquiry: pick(i, map.inquiry),
    parking: pick(i, map.parking),
    admission: pick(i, map.admission),
    eventPeriod: toPeriod(i.eventstartdate, i.eventenddate),
    eventPlace: pick(i, "eventplace"),
  };
}

/**
 * `overview` 는 HTML 을 담고 있다 (`<br>`, `<a>` 등).
 * 태그를 지우고 줄바꿈만 남긴다. **HTML 을 그대로 렌더하지 않는다** — 공급자 문자열을
 * dangerouslySetInnerHTML 로 넣으면 주입 통로가 된다.
 */
export function stripHtml(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * `homepage` 는 평문 URL 로 오기도 하고 `<a href="...">` 로 오기도 한다.
 * 프로토콜이 없으면 https 를 붙인다. http/https 가 아니면 버린다 —
 * `javascript:` 같은 스킴이 링크로 나가면 안 된다.
 */
export function toHomepageUrl(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const href = raw.match(/href=["']([^"']+)["']/i)?.[1];
  const candidate = (href ?? stripHtml(raw)).trim().split(/\s+/)[0];
  if (!candidate) return null;
  const withScheme = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
  try {
    const url = new URL(withScheme);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString();
  } catch {
    return null;
  }
}
