import { ViewTransition } from "react";
import type { Locale } from "@/domain/shared/locale";
import type { Dictionary } from "@/presentation/i18n/dictionaries";

/**
 * 머리말 — 눈썹줄·제목·부제.
 *
 * **홈과 탐색 화면이 같은 세 문장을 쓴다.** 다른 것은 크기와 위쪽 여백뿐이다.
 * 두 화면이 각자 마크업을 들고 있으면 한쪽만 고쳐져 문구가 갈라진다 —
 * 실제로 두 곳에 같은 `t.explore.*` 가 복사돼 있었다.
 *
 * `<ViewTransition name="lede-*">` 가 두 화면의 이것을 **같은 물체**로 선언한다.
 * 브라우저가 옛 위치·크기의 스냅샷에서 새 위치·크기로 보간하므로, 홈에서 탐색으로
 * 갈 때는 줄어들며 위로 올라가고 돌아올 때는 커지며 가운데로 내려온다.
 * **좌표를 손으로 계산하지 않는다** — 크기 차이는 아래 표가 이미 갖고 있고,
 * 위치 차이는 각 화면의 레이아웃이 이미 갖고 있다.
 *
 * `share` 가 **방향마다 다른 클래스**를 준다. 기본 morph 는 옛 스냅샷과 새 스냅샷을
 * 겹쳐 크로스페이드하는데, 두 스냅샷의 글자 크기가 다르므로 그동안 글자가 두 겹으로
 * 어긋나 보인다 — 하나가 커지는 것이 아니라 둘이 섞이는 것으로 읽힌다.
 * 그래서 CSS 가 **큰 쪽 스냅샷 하나만 남기고** 그것을 실제로 줄이거나 늘인다.
 * 어느 쪽이 큰 쪽인지는 방향이 정하므로(`to-explore` 면 옛것, `to-home` 이면 새것)
 * 클래스를 나눈다. 방향을 싣는 곳은 `Button.tsx` 와 `Masthead.tsx` 의 링크다.
 *
 * `default` 는 방향이 없는 이동 — 브라우저 뒤로가기·앞으로가기다. 그때는 새 스냅샷을
 * 남긴다. 뒤로가기가 실제로 쓰이는 경우는 탐색에서 홈으로 나가는 쪽이고, 거기서
 * 새 스냅샷이 곧 큰 쪽이다.
 *
 * `default="none"` 이 함께 필요하다. 없으면 탐색 화면에서 필터를 누르는 것처럼
 * **머리말과 무관한 전환에서도** 이 블록이 매번 전환에 참여한다.
 */
const LEDE = {
  /** 홈. 화면 가운데 서고 가장 크다 */
  hero: {
    frame: "",
    title: "text-[clamp(3rem,9vw,5rem)]",
  },
  /** 탐색. 목록에 자리를 내주고 작아진다 */
  compact: {
    frame: "pt-12 pb-14 md:pt-16",
    title: "text-[clamp(2.75rem,7vw,4.25rem)]",
  },
} as const;

/**
 * 제목이 줄바꿈하는 폭. **두 화면이 같은 값을 쓴다.**
 *
 * 여기가 갈리면 전환이 깨진다. 스냅샷은 group 크기에 맞춰 `object-fit: fill` 로
 * 늘어나므로, 두 화면에서 블록의 **종횡비가 다르면 글자가 가로세로로 찌그러진다.**
 * 실제로 라틴이 14ch / 13ch 로 갈려 있었고, 그래서 제목이 스케일되는 것이 아니라
 * 일그러지며 바뀌는 것으로 보였다.
 *
 * `ch` 는 폰트 크기에 비례하는 단위다. 같은 `ch` 를 두면 폭이 글자 크기를 따라
 * 저절로 비례하고, 줄바꿈 위치도 두 화면에서 같아진다 — 줄 수가 같고 `leading` 도
 * 배수(1.02)라 높이까지 비례한다. 그 결과가 **정확한 uniform scale** 이다.
 *
 * 한글은 글자당 폭이 라틴의 약 2배라 같은 값을 쓰면 줄이 일찍 끊긴다.
 *
 * **두 화면 모두에서 이 값이 실제로 걸려야 한다.** 열 폭보다 크게 잡으면 열이 먼저
 * 걸려 `max-w` 가 무력해지는데, 홈과 탐색은 열 폭이 다르다(실측 2026-08-24:
 * 홈 581px · 탐색 1152px). 그러면 한쪽은 `ch`(폰트 비례)로, 다른 쪽은 px(고정)로
 * 폭이 정해져 **종횡비가 어긋나고 스냅샷이 찌그러진다.** 실제로 18ch 일 때 홈은
 * 581px·80px, 탐색은 693px·68px 로 폭 비율(0.84)과 폰트 비율(1.18)이 서로 반대였다.
 *
 * 12ch 는 좁은 쪽(홈, 폰트 80px 에 열 581px ≈ 12.8ch)보다 작아 양쪽 다 이 값이
 * 걸린다. 그러면 두 화면의 폭이 폰트 크기에 함께 비례해 **uniform scale** 이 된다.
 *
 * **형광펜이 한 줄에 떨어지는 값이기도 하다.** 실측 2026-08-24 — 11.5ch 에서는
 * 강조 구간이 두 줄로 쪼개져 색면이 큰 덩어리가 됐다. 12ch(544px)는 제목이 세 줄이고
 * 형광펜은 마지막 한 줄에 담긴다. 13ch 이상은 열 폭이 먼저 걸려 위의 비례가 깨진다.
 *
 * 강조 구간 자체도 줄바꿈을 막아 두었다(`.lede-mark` 의 `text-wrap: nowrap`) —
 * 폭이 바뀌어도 형광펜은 통째로 다음 줄로 내려갈 뿐 가운데서 잘리지 않는다.
 *
 * 문구를 고치면 이 값도 함께 본다. 폭은 글자 수가 아니라 **그 문장이 어디서
 * 끊기는가**와 **두 화면에서 같은 자리에서 끊기는가**로 정해져 있다.
 */
const TITLE_WIDTH = { ko: "max-w-[12ch]", latin: "max-w-[12ch]" } as const;

/**
 * 방향별로 어느 스냅샷을 남길지. 세 요소가 **같은 표를 쓴다** — 눈썹줄만 다른
 * 규칙으로 움직이면 한 덩어리가 아니라 세 조각이 따로 노는 것으로 보인다.
 */
export const SHARE = {
  /** 홈 → 탐색. 큰 쪽은 **옛** 스냅샷이므로 그것을 남겨 줄인다 */
  "to-explore": "morph-down",
  /** 탐색 → 홈. 큰 쪽은 **새** 스냅샷이므로 그것을 남겨 늘인다 */
  "to-home": "morph-up",
  /** 방향 없는 이동(브라우저 뒤로·앞으로)도 새 스냅샷을 남긴다 */
  default: "morph-up",
} as const;

/**
 * 제목의 한 구간에 형광펜을 긋는다.
 *
 * **사전이 마크업을 갖지 않는다.** 번역 문자열에 `<mark>` 를 넣으면 번역하는 사람이
 * 태그를 지우거나 옮기게 되고, 그 실수는 화면에서만 드러난다. 대신 그을 구간을
 * 별도 키(`titleAccent`)로 두고 여기서 찾아 감싼다 — 번역은 문장 두 개를 옮기면
 * 되고, 둘이 어긋나면(구간이 제목에 없으면) 형광펜만 빠진 채 문장은 온전히 나온다.
 *
 * 첫 번째로 나오는 자리 하나만 긋는다. 같은 말이 두 번 나오는 문장에서 둘 다
 * 칠해지면 강조가 아니라 얼룩이 된다.
 */
function withAccent(title: string, accent: string | undefined) {
  if (!accent) return title;
  const at = title.indexOf(accent);
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <mark className="lede-mark">{accent}</mark>
      {title.slice(at + accent.length)}
    </>
  );
}

export type LedeSize = keyof typeof LEDE;

export function Lede({
  locale,
  t,
  size,
}: {
  locale: Locale;
  t: Dictionary;
  size: LedeSize;
}) {
  const v = LEDE[size];

  return (
    /*
      **세 줄을 각각 짝지운다.** 한 덩어리에 이름 하나를 주면 블록 전체가 한 장의
      스냅샷이 되는데, 눈썹줄·부제는 두 화면에서 크기가 그대로이고 제목만 작아지므로
      덩어리의 종횡비가 달라진다. 그 상태로 늘이면 글자가 찌그러진다.

      따로 짝지으면 눈썹줄과 부제는 **크기 변화 없이 자리만 옮기고**(왜곡이 있을 수
      없다), 제목만 스케일된다. 그 제목도 `TITLE_WIDTH` 로 종횡비를 맞춰 뒀다.
    */
    <header className={v.frame}>
      <ViewTransition name="lede-eyebrow" share={SHARE} default="none">
        <p className="text-[13px] uppercase tracking-[0.18em] text-muted">{t.explore.eyebrow}</p>
      </ViewTransition>
      <ViewTransition name="lede-title" share={SHARE} default="none">
        <h1
          lang={locale}
          className={
            // Direction A: 세리프 헤드라인. 가볍게, 크게, 자간은 건드리지 않는다
            "mt-5 font-display font-light leading-[1.02] text-ink " +
            v.title +
            " " +
            (locale === "ko" ? TITLE_WIDTH.ko : TITLE_WIDTH.latin)
          }
        >
          {withAccent(t.explore.title, t.explore.titleAccent)}
        </h1>
      </ViewTransition>
      <ViewTransition name="lede-subtitle" share={SHARE} default="none">
        <p lang={locale} className="mt-5 max-w-[42ch] text-[16px] leading-[24px] text-body">
          {t.explore.subtitle}
        </p>
      </ViewTransition>
    </header>
  );
}
