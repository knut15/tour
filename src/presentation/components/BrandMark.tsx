/**
 * lifeisnearby 브랜드 로고.
 *
 * PNG 두 장을 CSS 변수로 갈아 끼우던 방식을 **인라인 SVG** 로 바꿨다. 잉크로 그리는
 * 부분을 `currentColor` 로 두면 테마 세 갈래가 저절로 따라오므로 라이트/다크 사본을
 * 둘 다 내려받을 이유가 없다. 액센트만 고정색이다 — 테마를 따라 바뀌면 다른 로고가 된다.
 *
 * 시안 두 안을 모두 둔다. **머리말에 서는 것은 `BrandMark` 하나**이고, 어느 안을
 * 쓸지는 그 함수 한 줄이 정한다.
 *
 * - `PaperPlane` (시안 01) — 원·궤적·비행기. 작은 글자가 없어 40px 에서도 읽힌다
 * - `PassportStamp` (시안 04) — 모노그램 `LIN` + 아래 아치. 아치는 3em 이상에서만 켠다
 *
 * 좌표·굵기·자간은 시안 파일의 값을 그대로 옮겼다.
 */

/** 시안 01 의 코랄. 비행기와 궤적 시작점이 함께 쓴다 */
const CORAL = "#FF7A66";
/** 시안 04 의 주황 */
const ACCENT = "#E86A3A";

/**
 * 04 아래쪽 아치 경로의 id.
 *
 * 한 화면에 스탬프가 둘 이상 서면 겹친다. 겹쳐도 두 경로가 같은 도형이라 화면은
 * 맞게 나오지만, 여러 번 세울 일이 생기면 `useId` 를 쓰는 클라이언트 컴포넌트로 바꾼다.
 */
const ARC_ID = "lin-stamp-arc";

/** 로고 서체. layout 에서 심는 `--font-stamp` 가 없으면 시스템 산세리프로 떨어진다 */
const STAMP_FONT = "var(--font-stamp), system-ui, sans-serif";

/**
 * 시안 01 — 종이비행기와 궤적.
 *
 * 테두리와 궤적은 같은 점선 어법이고, **색을 지니는 것은 비행기와 궤적의 시작점뿐**이다.
 * 출발한 자리만 남기고 지나온 길은 물러나게 한 것이 이 안의 논지다.
 */
function PaperPlane({ className }: { className: string }) {
  return (
    /*
      **시안 파일의 뷰박스를 그대로 쓰지 않는다.** 시안은 160 박스에 원이 132 라
      사방 14 단위가 빈다. 머리말에서 로고 높이가 60px 남짓이면 그 여백이 그림을
      13% 깎아 먹는다. 원의 실제 경계인 `10 10 140 140` 으로 조인다.
    */
    <svg viewBox="10 10 140 140" fill="none" aria-hidden className={className}>
      {/*
        굵기는 시안 값의 약 2.6 배다. 60px 로 서면 1 단위가 0.43px 이라 시안의
        `stroke-width 1` 은 서브픽셀로 흐려진다. 점선 간격도 `1 4` 로는 점이
        0.43px 이라 사라져서 `2.5 5` 로 벌렸다.
      */}
      <circle
        cx="80"
        cy="80"
        r="66"
        stroke={ACCENT}
        strokeOpacity="0.65"
        strokeWidth="2.6"
        strokeDasharray="2.5 5"
      />
      <path
        d="M28 108 C 50 72, 96 60, 128 52"
        stroke="currentColor"
        strokeOpacity="0.45"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="1 7"
      />
      <circle cx="28" cy="108" r="4.5" fill={CORAL} />
      {/* 비행기를 제 중심에서 1.3 배로 키운다. 마크의 초점이 여기다 */}
      <g transform="translate(96 40) rotate(18) translate(20 22) scale(1.3) translate(-20 -22)">
        <path d="M2 22 L38 4 L26 40 L20 26 L2 22 Z" fill={CORAL} />
        <path
          d="M20 26 L38 4"
          stroke="currentColor"
          strokeOpacity="0.32"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

/**
 * 이름. 머리말에서 심볼만 서면 앱 이름이 화면 어디에도 없다.
 *
 * `L`·`i`·`N` 만 액센트다 — **Life is Nearby** 세 단어의 머리글자이고, 시안 04 의
 * 모노그램 `LIN` 과 같은 논지다. 지금 머리말에 서는 것은 `DeilinoLockup` 쪽이다.
 */
function Wordmark() {
  return (
    <span
      className="text-[0.66em] leading-none font-semibold tracking-[-0.01em] whitespace-nowrap"
      style={{ fontFamily: STAMP_FONT }}
    >
      <span style={{ color: ACCENT }}>L</span>ife{" "}
      <span style={{ color: ACCENT }}>i</span>s{" "}
      <span style={{ color: ACCENT }}>N</span>earby
    </span>
  );
}

/* ── deilino 심볼 (`~/Downloads/files/deilino-symbol.svg`) ─────────────── */

/**
 * deilino 심볼 — 동심원 셋.
 *
 * 반지름·중심·투명도는 원본 파일 그대로다. **획 굵기만 약 2.4 배로 올렸다** —
 * 머리말에서 마크가 60px 로 서면 256 뷰박스의 1 단위가 0.23px 이라 원본의
 * `stroke-width 2.5` 는 0.58px, 즉 서브픽셀로 사라진다. 원본 그대로 두면 안쪽
 * 점 하나만 남는다.
 *
 * 색은 `--brand-coral` 이 정하고 그 값이 원본의 `#D85A30` 이다.
 */
function DeilinoSymbol({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" aria-hidden className={className}>
      <circle
        cx="128"
        cy="128"
        r="102"
        stroke="var(--brand-coral)"
        strokeWidth="7"
        opacity="0.28"
      />
      <circle
        cx="128"
        cy="128"
        r="58"
        stroke="var(--brand-coral)"
        strokeWidth="9.5"
        opacity="0.55"
      />
      <circle cx="128" cy="128" r="18" fill="var(--brand-coral)" />
    </svg>
  );
}

/**
 * deilino 락업 — 심볼 + 소문자 워드마크.
 *
 * 글자 쪽 처리(볼드·자간 -0.06em·코랄 마침표)는 Skyway 시안에서 이어받았다.
 * 심볼은 **타일에 넣지 않는다** — 받은 파일이 배경 없는 `deilino-symbol.svg` 이고,
 * 타일 변형은 `deilino-app-icon.svg` 로 따로 있다.
 *
 * 심볼 높이는 워드마크 글자 크기(0.75em)의 **1.6 배**다. 원형 마크는 글자보다
 * 커야 균형이 잡히지만, 2 배를 넘기면 이름이 마크에 딸린 설명처럼 보인다.
 * 심볼이 작아진 만큼 획을 7 / 9.5 로 다시 올렸다 — 40px 로 서면 1 단위가 0.16px 이다.
 */
function DeilinoLockup({ className }: { className: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.3em] ${className}`}>
      <DeilinoSymbol className="size-[1.2em] shrink-0" />
      <span
        /*
          **좁은 화면에서는 심볼만 남긴다.** 머리말에 컨트롤이 셋(날씨·테마·언어)
          서 있어서 이름까지 두면 좁은 폭에서 서로 밀어낸다.
        */
        className="hidden text-[0.75em] leading-none font-bold tracking-[-0.06em] whitespace-nowrap sm:inline"
        style={{ fontFamily: "var(--font-brand)", color: "var(--brand-word)" }}
      >
        headland<span style={{ color: "var(--brand-coral)" }}>.</span>travel
      </span>
    </span>
  );
}

/** 시안 04 — 여권 스탬프. `arc` 가 아래쪽 `SINCE 2026 · TRAVEL` 을 켠다 */
function PassportStamp({ className, arc }: { className: string; arc: boolean }) {
  return (
    <svg viewBox="0 0 160 160" fill="none" aria-hidden className={className}>
      {arc && (
        <defs>
          {/* sweep-flag 0 이라 글자가 뒤집히지 않고 아래쪽에서 똑바로 선다 */}
          <path id={ARC_ID} d="M 30 80 A 50 50 0 0 0 130 80" />
        </defs>
      )}

      <circle cx="80" cy="80" r="60" stroke={ACCENT} strokeWidth="1.4" />
      <circle
        cx="80"
        cy="80"
        r="54"
        stroke={ACCENT}
        strokeWidth="1"
        strokeOpacity="0.4"
        strokeDasharray="1 4"
      />

      {/* 나침반 바늘 — 글자 뒤에 깔리는 워터마크 */}
      <g opacity="0.15">
        <path d="M80 30 L92 80 L80 130 L68 80 Z" fill="currentColor" />
        <path d="M80 30 L92 80 L80 80 Z" fill={ACCENT} />
        <circle cx="80" cy="80" r="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
      </g>

      {/*
        모노그램. 시안은 `#4A443D` 였지만 여기서는 `currentColor` 에 불투명도를 걸어
        같은 밝기를 만든다 — 다크에서 진회색을 그대로 쓰면 글자가 사라진다.
      */}
      <text
        x="80"
        y="90"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.82"
        fontFamily={STAMP_FONT}
        fontSize="30"
        fontWeight="600"
        letterSpacing="1"
      >
        LIN
      </text>

      {/*
        자간 4·8px 이면 글자 폭이 174 단위라 반원(157)을 넘어 양끝이 잘린다.
        134 단위가 되도록 8px·2.5 로 낮춘 값이다.
      */}
      {arc && (
        <text
          fill={ACCENT}
          fontFamily={STAMP_FONT}
          fontSize="8"
          fontWeight="600"
          letterSpacing="2.5"
        >
          <textPath href={`#${ARC_ID}`} startOffset="50%" textAnchor="middle">
            SINCE 2026 · TRAVEL
          </textPath>
        </text>
      )}
    </svg>
  );
}

/**
 * 머리말에 서는 로고. **여기 한 줄이 어느 시안을 쓸지 정한다.**
 *
 * 04 로 되돌리려면 `<PassportStamp arc={false} … />` 로 바꾼다. 04 는 머리말 크기
 * (40px 안팎)에서 아치의 8/160 이 2px 남짓이라 열아홉 자가 얼룩이 되므로 `arc` 를
 * 켜지 않는다.
 */
export function BrandMark({ className = "" }: { className?: string }) {
  return <DeilinoLockup className={className} />;
}

/**
 * 앞선 시안들. 머리말에서 물러났지만 지우지 않는다 — 되돌릴 때 `BrandMark` 한 줄만
 * 바꾸면 되도록 남겨 둔다.
 */
export function PaperPlaneLockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.42em] ${className}`}>
      <PaperPlane className="h-[2.4em] w-auto shrink-0" />
      <Wordmark />
    </span>
  );
}

/** 큰 자리용. 아치까지 갖춘 온전한 스탬프다 */
export function BrandSymbol({ className = "" }: { className?: string }) {
  return <PassportStamp arc className={className} />;
}
