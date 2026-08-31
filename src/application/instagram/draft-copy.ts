import type { Category } from "@/domain/spot/category";
import type { SpotDetailView } from "@/application/spot/dto";

/**
 * 초안 문구를 **사실에서 고른다.**
 *
 * 헤드라인과 캡션 첫 줄은 판단이 필요한 자리지만, 그 판단의 근거는 전부 데이터에
 * 있다 — 24시 개방인지, 실내인지, 무료인지. 그래서 **사실에서 성격을 판정하고
 * 그 성격에 미리 붙여 둔 문안을 고른다.** 모델을 부르지 않는다.
 *
 * 나온 것은 어디까지나 **초안**이다. 사람이 큐에서 보고 고친 뒤 `approved` 로
 * 올린다 — 그 단계가 있기 때문에 여기서 완벽할 필요가 없다.
 */

/** 사실에서 읽어 낸 성격. 앞에 있을수록 먼저 잡는다 */
export type Trait =
  | "always-open"
  | "indoor"
  | "free"
  | "evening"
  | "closed-weekly"
  | "no-parking"
  | "festival-short"
  | "plain";

type Copy = {
  /** 두 줄. 각 줄은 짧게 — 커버 안전영역이 좁다 */
  headline: string;
  /** 캡션 첫 줄. 상황을 먼저 말하고 장소 이름을 앞세우지 않는다 */
  hook: string;
  hookEn: string;
};

/**
 * 성격마다 하나씩. **여러 개를 두고 돌리지 않는다** — 초안은 사람이 고치므로
 * 다양성보다 예측 가능성이 낫다. 문안을 늘리고 싶으면 여기만 고친다.
 */
const COPY: Record<Trait, Copy> = {
  "always-open": {
    headline: "닫는 시간이\n따로 없는 곳",
    hook: "몇 시에 가야 하나 재지 않아도 되는 곳이 있어요.",
    hookEn: "Some places do not make you check the clock.",
  },
  indoor: {
    headline: "비 와도 하루가\n안 망하는 곳",
    hook: "날씨가 도와주지 않는 날에도 계획이 살아남는 곳입니다.",
    hookEn: "A plan that survives the weather.",
  },
  free: {
    headline: "무료인데\n이 정도면 반칙",
    hook: "돈을 안 받는데 이 정도면 좀 반칙이에요.",
    hookEn: "It costs nothing, which feels a little unfair.",
  },
  evening: {
    headline: "해 지고 나서\n더 좋아지는 곳",
    hook: "낮보다 저녁이 좋은 곳이 있습니다.",
    hookEn: "Some places are better after sunset.",
  },
  "closed-weekly": {
    headline: "가기 전에\n요일부터 확인",
    hook: "쉬는 날이 정해져 있는 곳입니다. 헛걸음하기 쉬워요.",
    hookEn: "This one has a fixed closing day. Easy to get wrong.",
  },
  "no-parking": {
    headline: "차 두고\n걸어가야 하는 곳",
    hook: "주차가 안 되는 대신 걸어 들어가는 길이 좋습니다.",
    hookEn: "No parking — but the walk in is the good part.",
  },
  "festival-short": {
    headline: "이번에 놓치면\n내년까지 기다림",
    hook: "며칠만 열리고 사라집니다.",
    hookEn: "Only a few days, then it is gone.",
  },
  plain: {
    headline: "오늘 하루를\n여기서 씁니다",
    hook: "오늘 뭐 할지 정하지 못했다면 여기가 있습니다.",
    hookEn: "If today is still undecided, here is one option.",
  },
};

const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울", 부산광역시: "부산", 대구광역시: "대구", 인천광역시: "인천",
  광주광역시: "광주", 대전광역시: "대전", 울산광역시: "울산", 세종특별자치시: "세종",
  경기도: "경기", 강원특별자치도: "강원", 강원도: "강원", 충청북도: "충북",
  충청남도: "충남", 전라북도: "전북", 전북특별자치도: "전북", 전라남도: "전남",
  경상북도: "경북", 경상남도: "경남", 제주특별자치도: "제주",
};

/**
 * 광주광역시의 자치구 다섯. **합쳐진 시·도 이름을 가르는 유일한 단서다.**
 *
 * TourAPI 가 광주와 전남을 `전남광주통합특별시` 하나로 준다 — 실측 2026-08-31:
 * 함평군(전남)과 충장로(광주 동구)의 주소가 같은 접두어로 시작한다. `areacode` 는
 * 비어 오는 항목이 있어 기댈 수 없으므로 시·군·구 이름으로 가른다.
 */
const GWANGJU_GU = new Set(["동구", "서구", "남구", "북구", "광산구"]);

const MERGED_JN_GJ = "전남광주통합특별시";

/** 주소에서 시·도 통칭을 읽는다. 못 알아보면 원문 첫 마디를 그대로 쓴다 */
export function regionOf(address: string | null): string {
  if (!address) return "";
  const [sido, sigungu = ""] = address.split(/\s+/);
  if (sido === MERGED_JN_GJ) return GWANGJU_GU.has(sigungu) ? "광주" : "전남";
  return SIDO_SHORT[sido] ?? sido;
}

/**
 * 주소의 시·도를 통칭으로 줄인다.
 *
 * 핀만 고치고 본문 주소를 두면 한 캡션 안에서 "서울 종로구" 와 "서울특별시 종로구"
 * 가 함께 보인다. 같은 곳을 두 이름으로 부르는 셈이다.
 */
export function shortenAddress(address: string | null): string {
  if (!address) return "";
  const short = regionOf(address);
  const rest = address.split(/\s+/).slice(1).join(" ");
  return [short, rest].filter(Boolean).join(" ");
}

/** 값이 "가능/불가능" 처럼 짧은 판정어인지 본다 */
function says(value: string | null, ...words: string[]): boolean {
  if (!value) return false;
  return words.some((w) => value.includes(w));
}

/**
 * 사실 한 줄을 키로 찾는다.
 *
 * `SpotDetailView.facts` 는 **값이 없어도 행을 지우지 않는** 배열이다
 * (GOAL.md §5-3) — "정보 없음" 과 "그런 항목 없음" 을 구분하기 위해서다.
 * 그래서 없는 키가 아니라 `value === null` 을 봐야 한다.
 */
function fact(detail: SpotDetailView, key: string): string | null {
  return detail.facts.find((f) => f.key === key)?.value ?? null;
}

/**
 * 사실에서 성격을 읽는다. **첫 번째로 맞는 것 하나만 쓴다** — 여러 성격을 겹쳐
 * 말하면 문장이 길어지고 무엇이 특징인지 흐려진다.
 */
export function deriveTrait(detail: SpotDetailView, category: Category): Trait {
  const hours = fact(detail, "openingHours");
  const closed = fact(detail, "closedDays");
  const admission = fact(detail, "admission");
  const parking = fact(detail, "parking");
  const text = `${detail.overview ?? ""} ${hours ?? ""}`;

  if (category === "festival") return "festival-short";
  if (says(hours, "24시", "24시간", "상시") || says(closed, "24시", "상시")) return "always-open";
  if (says(text, "실내")) return "indoor";
  if (says(admission, "무료")) return "free";
  if (says(hours, "21:00", "22:00", "23:00", "야간")) return "evening";
  if (/매주\s*[월화수목금토일]요일/.test(closed ?? "")) return "closed-weekly";
  if (says(parking, "불가")) return "no-parking";
  return "plain";
}

/** 커버 헤드라인. 두 줄이고 마침표를 찍지 않는다 */
export function draftHeadline(trait: Trait): string {
  return COPY[trait].headline;
}

/** 값이 있는 사실만 `라벨 값` 으로 줄 세운다 */
/**
 * 언어마다 다른 것은 **표 하나뿐이다.**
 *
 * 앞서 영문 사실 줄을 국문 함수로 만들었더니 꼬리표와 라벨이 한글로 새어 나왔고
 * (실측 2026-08-31: `주차 Available`), 그렇다고 함수를 두 벌 두면 한쪽만 고쳐지는
 * 날이 온다. **코드는 한 벌, 낱말만 갈라 둔다.**
 *
 * 예외 규정이 시작되는 자리도 언어마다 다르다 — 국문은 `※`, 영문은 괄호다
 * (`Tuesdays (If Tuesday falls on a public holiday, …)`).
 */
type FactStyle = {
  cutAt: RegExp;
  seasonal: string;
  closed: (value: string) => string;
  parking: (value: string) => string;
};

const STYLE: Record<"ko" | "en", FactStyle> = {
  ko: {
    cutAt: /※|\(/,
    seasonal: "(계절별 상이)",
    closed: (v) => `${v} 휴무`,
    parking: (v) => `주차 ${v}`,
  },
  en: {
    cutAt: /\(/,
    seasonal: "(varies by season)",
    closed: (v) => `Closed ${v}`,
    parking: (v) => `Parking ${v.toLowerCase()}`,
  },
};

/**
 * 공급자 원문을 캡션에 실을 한 조각으로 줄인다.
 *
 * **원문을 그대로 쏟지 않는다.** 경복궁의 운영시간은 계절별 세 구간에 휴무 예외
 * 규정까지 붙어 200자가 넘는다(실측 2026-08-31) — 캡션에 실을 문장이 아니다.
 * 괄호 주석과 `※` 이후를 걷어내고 길이를 자른다.
 */
function tidy(value: string | null, style: FactStyle, limit = 40): string | null {
  if (!value) return null;
  const plain = value
    .replace(/<[^>]*>/g, " ")
    .split(style.cutAt)[0]
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return null;
  return plain.length > limit ? `${plain.slice(0, limit).trim()}…` : plain;
}

/**
 * 운영시간. **계절별로 여러 구간이면 첫 구간만 쓰고 그렇다고 밝힌다.**
 * 전부 실으면 한 줄이 캡션을 삼킨다.
 */
function hoursLine(raw: string | null, style: FactStyle): string | null {
  if (!raw) return null;
  const ranges = raw.match(/\d{1,2}:\d{2}\s*[~-]\s*\d{1,2}:\d{2}/g) ?? [];
  const uniq = [...new Set(ranges.map((r) => r.replace(/\s/g, "")))];
  if (uniq.length === 0) return tidy(raw, style, 30);
  return uniq.length === 1 ? uniq[0] : `${uniq[0]} ${style.seasonal}`;
}

export /**
 * 요금 줄. **여러 등급 중 첫 항목만 쓴다.**
 *
 * 원문이 대괄호 라벨과 하이픈 목록으로 온다 — 실측 2026-08-31, 예아리박물관:
 * `[개인]- 일반 5,000원- 청소년 4,000원- 어린이 3,000원`. 그대로 자르면
 * `[개인]- 일반 5,000원- 청소년…` 이 되어 읽히지 않는다.
 *
 * 라벨을 걷어내고 첫 항목만 남긴다. 등급별 요금 전체는 캡션이 아니라 공식 사이트가
 * 할 일이다.
 */
function admissionLine(raw: string | null): string | null {
  if (!raw) return null;
  const plain = raw.replace(/<[^>]*>/g, " ").replace(/\[[^\]]*\]/g, " ").replace(/\s+/g, " ").trim();
  if (!plain) return null;
  const first = plain.split(/\s*[-–·]\s*/).map((x) => x.trim()).filter(Boolean)[0] ?? plain;
  return first.length > 22 ? `${first.slice(0, 22).trim()}…` : first;
}

/**
 * 휴무 줄. **"연중무휴" 에 "휴무" 를 붙이지 않는다.**
 *
 * 라벨을 기계적으로 붙이면 "연중무휴 휴무" 가 된다 — 쉬는 날이 없다는 값에
 * 쉰다는 말을 덧댄 셈이다(실측 2026-08-31, 이화벽화마을).
 */
function closedLine(value: string, style: FactStyle): string {
  const noClosing = /연중무휴|무휴|없음|open all year|no closing/i.test(value);
  return noClosing ? value : style.closed(value);
}

export function factLine(detail: SpotDetailView, lang: "ko" | "en" = "ko"): string {
  const style = STYLE[lang];
  /*
    주차는 판정어 한 마디면 된다. 괄호는 `cutAt` 이 이미 버린다 —
    "가능 (승용차 240대 / 버스 50대)" 를 자르지 않고 12자로 줄이면
    "가능 (승용차 240대…" 가 되어 안 자른 것만 못하다.
  */
  const parking = tidy(fact(detail, "parking"), style, 14);
  const closed = tidy(fact(detail, "closedDays"), style, 24);
  return [
    tidy(fact(detail, "eventPeriod"), style, 30),
    hoursLine(fact(detail, "openingHours"), style),
    closed ? closedLine(closed, style) : null,
    admissionLine(fact(detail, "admission")),
    parking ? style.parking(parking) : null,
    tidy(fact(detail, "inquiry"), style, 30),
  ]
    .filter((v): v is string => !!v)
    .join(" · ");
}

/**
 * 사람이 채울 자리 표시.
 *
 * **`overview` 를 요약해 넣지 않는다.** 첫 문장은 대개 사전 설명이라
 * ("경복궁은 1392년 조선 건국 후 …") 이 계정이 쓰는 결과 다르다. 그럴듯한 문장이
 * 채워져 있으면 사람이 그냥 넘길 위험이 있어, **비어 있다는 것을 눈에 띄게** 둔다.
 *
 * 발행 전에 이 표시가 남아 있으면 `caption-rules` 가 아니라 사람이 본다 —
 * 큐를 훑을 때 무엇을 해야 하는지가 이 한 줄로 드러난다.
 */
export const TODO_MARK = "[여기에 한 문장 — 이 장소를 왜 가는지]";

/**
 * 영문 문단의 빈 자리. 국문 표시가 영어 문단에 섞이지 않게 따로 둔다.
 *
 * **소개용과 사실용을 가른다.** 같은 문구를 두 자리에 쓰면 치환할 때 첫 것만
 * 바뀌고 하나가 남는다 — 실측 2026-08-31, 이화벽화마을 초안에서 실제로 났다.
 */
export const EN_TODO_MARK = "[one line here — why go]";
export const EN_FACTS_MARK = "[hours, fees and closing days here]";

/**
 * 캡션 초안. **앱 조작을 안내하는 문장을 넣지 않는다** —
 * `caption-rules.ts` 가 발행 직전에 다시 검사한다.
 */
export function draftCaption(
  detail: SpotDetailView,
  trait: Trait,
  tags: string[],
  /**
   * 영문 서비스에서 받은 표기와 사실.
   *
   * **사실은 있을 때만 싣는다.** 영문 카탈로그에 모든 장소가 있는 것은 아니고
   * (실측 2026-08-31: 경복궁은 있고 경포호수광장은 없다), 사실 필드가 비어 있는
   * 항목도 있다. 없으면 이름과 주소만 남기고 나머지는 사람이 채운다.
   */
  english?: { name?: string | null; address?: string | null; facts?: string | null } | null,
): string {
  const c = COPY[trait];
  const name = detail.titlePrimary;
  const address = shortenAddress(detail.address);
  const facts = factLine(detail);

  const ko = [
    c.hook,
    "",
    TODO_MARK,
    "",
    name,
    [address, facts].filter(Boolean).join(" · "),
  ]
    .join("\n")
    .trim();

  /*
    **영문이 없으면 영문 블록을 아예 두지 않는다.**

    이름과 주소만 남기고 나머지에 표시를 넣어 두면, 채우지 않은 채로 나갈 위험이
    있고 채운다 해도 사람이 매번 같은 일을 한다. 영문 카탈로그에 없는 장소는
    한글로만 내는 편이 낫다 — 반쪽짜리 영문보다 없는 편이 정직하다.

    분류가 달라 걸러진 경우도 여기로 온다(이름만 같은 다른 장소).
  */
  const en = english?.name
    ? [
        c.hookEn,
        "",
        EN_TODO_MARK,
        "",
        english.name,
        [english.address || address, english.facts].filter(Boolean).join(" · "),
        /* 사실이 없으면 그 자리를 사람이 채우도록 표시를 남긴다 */
        english.facts ? null : EN_FACTS_MARK,
      ]
        .filter((line) => line !== null)
        .join("\n")
        .trim()
    : null;

  /* 출처 표기도 영문 블록 유무에 맞춘다 */
  const credit = en
    ? "사진 · 한국관광공사 / Photo · Korea Tourism Organization"
    : "사진 · 한국관광공사";

  return [
    ko,
    ...(en ? ["", "⸻", "", en] : []),
    "",
    credit,
    "",
    tags.map((t) => `#${t}`).join(" "),
  ].join("\n");
}

/**
 * 정보 카드에 세울 줄.
 *
 * **캡션의 사실 줄과 같은 다듬기를 쓴다.** 두 곳이 다른 값을 말하면 어느 쪽이
 * 맞는지 알 수 없다 — 캐러셀 마지막 장과 캡션이 서로 어긋나는 것이 가장 나쁘다.
 *
 * 값이 없는 항목은 **뺀다.** 화면(GOAL.md §5-3)은 "정보 없음" 과 "그런 항목 없음"
 * 을 구분하려고 빈 행을 남기지만, 여기는 판이 좁아 빈 줄이 자리를 먹는다.
 */
export function infoRows(detail: SpotDetailView): { label: string; value: string }[] {
  const style = STYLE.ko;
  const address = shortenAddress(detail.address);
  const parking = tidy(fact(detail, "parking"), style, 14);

  return [
    { label: "주소", value: address },
    { label: "기간", value: tidy(fact(detail, "eventPeriod"), style, 26) ?? "" },
    { label: "관람시간", value: hoursLine(fact(detail, "openingHours"), style) ?? "" },
    { label: "휴무일", value: tidy(fact(detail, "closedDays"), style, 24) ?? "" },
    { label: "이용요금", value: admissionLine(fact(detail, "admission")) ?? "" },
    { label: "주차", value: parking ?? "" },
    { label: "문의", value: tidy(fact(detail, "inquiry"), style, 28) ?? "" },
  ].filter((row) => row.value.length > 0);
}

/**
 * 커버에 얹을 칩.
 *
 * **가기 전에 알아야 하는 것만 고른다** — 시간·휴무·주차·기간. 소개나 분류처럼
 * 캡션이 이미 말하는 것은 넣지 않는다. 칩이 많아지면 사진을 가린다.
 *
 * 이모지는 그림이 아니라 **눈이 줄을 찾는 표시**다. 없어도 뜻이 통하도록 글자를
 * 함께 둔다 — `ImageResponse` 가 이모지를 외부에서 받아 오므로 실패할 수 있다.
 */
export function coverChips(detail: SpotDetailView): { icon: string; text: string }[] {
  const style = STYLE.ko;
  const hours = hoursLine(fact(detail, "openingHours"), style);
  const closed = tidy(fact(detail, "closedDays"), style, 14);
  const parking = tidy(fact(detail, "parking"), style, 8);
  const period = tidy(fact(detail, "eventPeriod"), style, 22);

  return [
    period ? { icon: "📅", text: period } : null,
    hours ? { icon: "🕘", text: hours.replace(" (계절별 상이)", "") } : null,
    closed ? { icon: "🚫", text: closedLine(closed, style) } : null,
    parking ? { icon: "🅿️", text: `주차 ${parking}` } : null,
  ].filter((c): c is { icon: string; text: string } => c !== null);
}

/**
 * 하단 왼쪽의 큰 값. **요금이 있으면 요금이다** — 갈지 말지를 가르는 값이라
 * 한눈에 보여야 한다. 없으면 표시하지 않는다.
 */
export function coverHighlight(
  detail: SpotDetailView,
): { label: string; value: string } | null {
  const admission = admissionLine(fact(detail, "admission"));
  if (!admission) return null;
  return { label: "이용요금", value: admission };
}

/**
 * 이미 끝난 행사인가.
 *
 * **축제 목록은 날짜로 걸러지지 않는다.** `areaBasedList2` 는 지난 축제도 그대로
 * 준다 — 실측 2026-08-31: 함평나비대축제(507598)가 4월 24일~5월 5일인데 8월
 * 목록에 올라왔다. 그것을 "지금 열리는" 으로 올리면 거짓말이 된다.
 *
 * 기간 문자열의 **마지막 날짜**를 읽어 오늘과 견준다. 못 읽으면 `false` 다 —
 * 형식이 바뀌었을 때 멀쩡한 축제를 조용히 버리는 것보다, 사람이 큐에서 보는 편이 낫다.
 */
export function hasEnded(detail: SpotDetailView, today = new Date()): boolean {
  const period = fact(detail, "eventPeriod");
  if (!period) return false;

  const dates = period.match(/(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/g);
  if (!dates || dates.length === 0) return false;

  const last = dates[dates.length - 1].split(/[.\-/]/).map(Number);
  const end = Date.UTC(last[0], last[1] - 1, last[2]);
  const now = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return end < now;
}
