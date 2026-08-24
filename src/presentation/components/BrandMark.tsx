/**
 * 브랜드 로고 — 접힌 지도와 이름.
 *
 * 봉우리 둘이 앞뒤로 겹치고, 앞봉우리에 골이 하나 파여 있다. **그 한 줄이 이 심볼의
 * 이름을 만든다** — 없으면 그냥 산이고, 있으면 접힌 종이가 된다. 지도이면서 풍경인
 * 이중성이 거기서 나온다.
 *
 * **접힌 자국은 획이 아니라 틈이다.** `currentColor` 로 그으면 산 위에 줄을 얹은 것이
 * 되고, 바탕색으로 그어야 면이 갈라진 것이 된다. 그래서 이 한 줄만 배경 토큰
 * (`--paper-canvas`)을 받는다 — 심볼에서 색이 매이는 유일한 자리이고, 다른 바탕에
 * 놓을 때는 `foldColor` 로 그 색을 넘겨야 한다.
 *
 * **노랑은 뒤에 있고 일부만 보인다.** 뒷봉우리 전체가 노랗지만 앞봉우리가 왼쪽을
 * 가려, 실제로 보이는 것은 오른쪽 삼각 일부다. 면적이 작아야 강조가 강조로 남는다.
 *
 * **앞산이 가파르고 뒷산이 완만하다** — 밑각 66° 대 63°. 처음엔 둘 다 60° 였는데,
 * 정삼각형에 가까우면 안정적이지만 둔해 보이고 원근도 생기지 않는다. 실제 풍경에서
 * 가까운 산이 가파르게, 먼 산이 눕게 보이는 것과 같다. 높이는 29 대 19 로
 * **1.5 : 1** — 같으면 대칭이 되어 산이 아니라 무늬로 읽힌다.
 *
 * **노랑은 더 줄였다.** 앞산을 오른쪽으로 2 밀고 뒷산을 좁혀, 보이는 노란 사면이
 * 16 에서 13 단위로 내려갔다. 강조는 면적이 작을수록 강조로 남는다.
 *
 * **접힌 자국은 수직이 아니라 살짝 기운다.** 정점(18)에서 밑변 15 로 3 단위 눕는데,
 * 그만큼 왼쪽 면이 좁아지고 오른쪽이 넓어져 산이 오른쪽을 향한 것으로 읽힌다 —
 * 노란 봉우리가 있는 쪽이라 시선이 그리로 흐른다. 수직이면 면이 반듯이 갈려
 * 종이를 접었다기보다 잘라 붙인 것처럼 보인다.
 *
 * 이름은 MARU — **산마루**의 마루다. 심볼이 산이고 이름이 그 꼭대기를 뜻하니 둘이
 * 같은 것을 가리킨다. 대청마루라는 두 번째 뜻(사람이 모여 앉는 자리)도 이 앱의
 * 모토와 겹친다.
 *
 * **이름은 그림이 아니라 글자다.** SVG 경로로 그려 봤지만, 그러면 자간·굵기를 손볼
 * 때마다 좌표를 다시 계산해야 하고 화면의 다른 글자들과 결이 갈린다. 본문
 * 폰트(`--font-sans`, Pretendard)를 그대로 쓰면 로고가 앱의 활자 안에 있게 된다.
 */

/**
 * 그림이 실제로 차지하는 상자. **좌표계 전체가 아니다.**
 *
 * 그림은 x 3~45, y 7~36 을 쓴다. 좌표계(48×48)를 그대로 viewBox 로 삼으면 빈칸까지
 * 높이로 세어져, `h-36px` 로 놓아도 실제 그림이 그만큼 작아진다. 사방 3 단위 여백만
 * 남기고 조인다.
 */
const BOX = "0 4 48 35";

/**
 * 접힌 자국의 두께. 심볼에서 유일하게 굵기를 갖는 요소다.
 *
 * 헤더 크기(36px)에서 화면상 1.5px 이 된다. 2.4 에서 내렸다 — 굵으면 갈라짐이
 * 아니라 흰 획을 그어 놓은 것으로 보인다. 다만 1px 아래로는 못 내려간다.
 * 그 밑에서는 회색으로 번져 면이 갈라진 것이 아니라 더러워진 것이 된다.
 */
const FOLD = 2;

/** 브랜드에서 유일하게 정해진 색 */
const STAR = "#F8C126";

/** 앞뒤 봉우리와 골. 로고와 파비콘이 같은 것을 쓴다 */
function Peaks({ foldColor, foldWidth }: { foldColor: string; foldWidth: number }) {
  return (
    <>
      {/* 뒷봉우리. 앞봉우리가 왼쪽을 가리므로 오른쪽 사면만 남는다 */}
      <path d="M25 36 35 17l9 19z" fill={STAR} />
      {/* 앞봉우리 */}
      <path d="M5 36 18 7l13 29z" fill="currentColor" />
      {/* 접힌 자국 — 바탕색을 받아 면을 가른다 */}
      <path d="M18 7 15 36" stroke={foldColor} strokeWidth={foldWidth} strokeLinecap="round" />
    </>
  );
}

export function BrandMark({
  className = "",
  foldColor = "var(--paper-canvas)",
}: {
  className?: string;
  /**
   * 접힌 자국의 색. **로고가 놓인 바탕색이어야 한다.**
   * 기본값은 앱의 지면색이고, 다른 바탕 위에 놓을 때만 넘긴다.
   */
  foldColor?: string;
}) {
  return (
    /*
      **크기는 글자 크기로 정한다.** 쓰는 쪽이 `text-[36px]` 을 주면 심볼이 `1em`,
      이름이 `0.56em`, 사이가 `0.36em` 으로 전부 따라온다.

      높이(`h-*`)로 정하면 안 된다 — `em` 은 폰트 크기를 기준으로 삼으므로, 컨테이너
      높이만 키우면 심볼은 커지는데 이름과 간격은 부모 폰트(대개 16px)에 묶인 채
      남는다. 로고를 키울수록 글자가 상대적으로 작아지는 것이다.
    */
    <span className={"inline-flex items-center gap-[0.36em] leading-none " + className}>
      <svg viewBox={BOX} className="h-[1em] w-auto" fill="none" aria-hidden="true">
        <Peaks foldColor={foldColor} foldWidth={FOLD} />
      </svg>
      {/*
        이름. **소문자로 쓴다.** 대문자 MARU 는 또렷하지만 각이 서서, 산 두 개의
        각과 겹치면 화면 왼쪽 위가 온통 삼각형이 된다. 소문자는 둥근 획(a·u)이
        섞여 심볼의 각을 눌러 주고, 여행 앱의 말투에도 더 가깝다.

        대문자보다 자간을 덜 벌리고(0.26em → 0.12em) 크기는 키웠다(0.56em → 0.68em).
        소문자는 x-height 가 낮아 같은 값이면 작아 보이고, 낱자에 이미 높낮이가
        있어 자간까지 벌리면 흩어진다.
      */}
      <span className="text-[0.68em] font-semibold leading-none tracking-[0.12em]">
        maru
      </span>
    </span>
  );
}

/**
 * 이름 없이 심볼만. 좁은 자리에 쓴다.
 *
 * 작은 칸에서는 골을 굵혀야 한다 — 갈라짐이 안 보이면 이 형태는 그냥 삼각형 둘이다.
 */
export function BrandSymbol({
  className = "",
  foldColor = "var(--paper-canvas)",
  foldWidth = FOLD,
}: {
  className?: string;
  foldColor?: string;
  foldWidth?: number;
}) {
  return (
    <svg
      viewBox={BOX}
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <Peaks foldColor={foldColor} foldWidth={foldWidth} />
    </svg>
  );
}
