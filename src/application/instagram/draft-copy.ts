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
  if (says(hours, "24시", "24시간") || says(closed, "24시")) return "always-open";
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
 * 공급자 원문을 캡션에 실을 한 조각으로 줄인다.
 *
 * **원문을 그대로 쏟지 않는다.** 경복궁의 운영시간은 계절별 세 구간에 휴무 예외
 * 규정까지 붙어 200자가 넘는다(실측 2026-08-31) — 캡션에 실을 문장이 아니다.
 * 괄호 주석과 `※` 이후를 걷어내고 길이를 자른다.
 */
function tidy(value: string | null, limit = 40): string | null {
  if (!value) return null;
  const plain = value
    .replace(/<[^>]*>/g, " ")
    .split("※")[0]
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return null;
  return plain.length > limit ? `${plain.slice(0, limit).trim()}…` : plain;
}

/**
 * 운영시간. **계절별로 여러 구간이면 첫 구간만 쓰고 그렇다고 밝힌다.**
 * 전부 실으면 한 줄이 캡션을 삼킨다.
 */
function hoursLine(raw: string | null): string | null {
  if (!raw) return null;
  const ranges = raw.match(/\d{1,2}:\d{2}\s*[~-]\s*\d{1,2}:\d{2}/g) ?? [];
  const uniq = [...new Set(ranges.map((r) => r.replace(/\s/g, "")))];
  if (uniq.length === 0) return tidy(raw, 30);
  return uniq.length === 1 ? uniq[0] : `${uniq[0]} (계절별 상이)`;
}

function factLine(detail: SpotDetailView): string {
  /*
    주차는 판정어 한 마디면 된다. **괄호 안 대수까지 실으면 잘려서 더 나빠진다** —
    "가능 (승용차 240대 / 버스 50대)" 를 12자로 자르면 "가능 (승용차 240대…" 가 된다.
  */
  const parking = tidy(fact(detail, "parking")?.split("(")[0] ?? null, 12);
  const closed = tidy(fact(detail, "closedDays"), 20);
  return [
    tidy(fact(detail, "eventPeriod"), 30),
    hoursLine(fact(detail, "openingHours")),
    closed ? `${closed} 휴무` : null,
    tidy(fact(detail, "admission"), 20),
    parking ? `주차 ${parking}` : null,
    tidy(fact(detail, "inquiry"), 30),
  ]
    .filter((v): v is string => !!v)
    .join(" · ");
}

/** overview 첫 문장. 소개문은 길어서 통째로 실으면 캡션이 사실보다 홍보로 읽힌다 */
function firstSentence(overview: string | null): string {
  if (!overview) return "";
  const plain = overview.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const end = plain.search(/[.。]\s|다\.\s/);
  return (end > 0 ? plain.slice(0, end + 1) : plain).slice(0, 160).trim();
}

/**
 * 캡션 초안. **앱 조작을 안내하는 문장을 넣지 않는다** —
 * `caption-rules.ts` 가 발행 직전에 다시 검사한다.
 */
export function draftCaption(
  detail: SpotDetailView,
  trait: Trait,
  tags: string[],
  /** 영문 서비스의 공식 표기. 없으면 국문 이름을 그대로 둔다 */
  englishName?: string | null,
): string {
  const c = COPY[trait];
  const name = detail.titlePrimary;
  const address = detail.address ?? "";
  const facts = factLine(detail);
  const intro = firstSentence(detail.overview);

  const ko = [
    c.hook,
    "",
    `${name}${intro ? ` — ${intro}` : "."}`,
    "",
    [address, facts].filter(Boolean).join(" · "),
  ]
    .join("\n")
    .trim();

  const en = [
    c.hookEn,
    "",
    /*
      영문 소개는 **번역하지 않는다.** 국문 overview 를 기계로 옮기면 사실이
      틀어질 수 있고, 이 계정은 사실로 신뢰를 사는 곳이다. 대신 사람이 큐에서
      채우도록 자리와 사실만 남긴다.
    */
    englishName || name,
    [address, facts].filter(Boolean).join(" · "),
  ]
    .join("\n")
    .trim();

  return [
    ko,
    "",
    "⸻",
    "",
    en,
    "",
    "사진 · 한국관광공사 / Photo · Korea Tourism Organization",
    "",
    tags.map((t) => `#${t}`).join(" "),
  ].join("\n");
}
