import type { SkyState } from "@/domain/weather/sky";

/**
 * 하늘 상태 아이콘.
 *
 * **아이콘 라이브러리를 쓰지 않는다.** 이 프로젝트는 의존성을 늘리지 않기로 했고,
 * 필요한 모양은 7개뿐이다. `ThemeToggle` 의 SVG 가 기준이다 — 24 viewBox,
 * strokeWidth 1.6, `currentColor`. 색은 부모의 `text-*` 가 정한다.
 *
 * 구성 규칙 하나: **강수가 있으면 구름은 위로 올라가고 아래 3.5px 를 물방울에 내준다.**
 * 구름 크기를 상태마다 다르게 하면 칩에서 아이콘이 커졌다 작아졌다 해 보인다.
 */

/** 구름 윤곽 한 벌. 좌하단에서 시작해 반시계로 한 바퀴 돈다(모든 arc sweep=0) */
const CLOUD = "M7 16h9.5a3.4 3.4 0 0 0 .3-6.79A5 5 0 0 0 7.2 8.9 3.55 3.55 0 0 0 7 16Z";

/**
 * 눈송이 하나. 중심 (cx, cy), 반지름 1.7 의 6방향 별.
 *
 * 반지름을 1.3 으로 잡았더니 stroke 1.6 이 서로 먹어 56px 에서도 점 두 개로 뭉쳤다.
 * 1.7 부터 별 모양이 살아난다 — 브라우저에서 두 값을 나란히 그려 고른 값이다.
 */
function flake(cx: number, cy: number): string {
  const r = 1.7;
  const dx = 1.47; // r * cos30
  const dy = 0.85; // r * sin30
  return (
    `M${cx} ${cy - r}v${r * 2}` +
    `M${cx - dx} ${cy - dy}l${dx * 2} ${dy * 2}` +
    `M${cx - dx} ${cy + dy}l${dx * 2} ${-dy * 2}`
  );
}

/** 상태별 도형. 공통 stroke 속성은 `<svg>` 가 물려준다 */
function shapes(sky: SkyState) {
  switch (sky) {
    case "clear":
      return (
        <>
          <circle cx="12" cy="12" r="4.2" />
          {/* 8방위 광선. 안쪽 6.0, 바깥 8.4 */}
          <path d="M18 12h2.4M12 18v2.4M6 12H3.6M12 6V3.6" />
          <path d="M16.24 16.24l1.7 1.7M7.76 16.24l-1.7 1.7M7.76 7.76l-1.7-1.7M16.24 7.76l1.7-1.7" />
        </>
      );

    case "partly-cloudy":
      return (
        <>
          {/* 해는 왼쪽 위에서 구름 뒤로 걸친다 */}
          <circle cx="8" cy="7.6" r="2.8" />
          <path d="M3.7 7.6H2M8 3.3V1.6M4.96 4.56L3.76 3.36M4.96 10.64l-1.2 1.2" />
          <g transform="translate(3.6 4.8) scale(0.72)">
            <path d={CLOUD} />
          </g>
        </>
      );

    case "cloudy":
      return (
        <>
          {/*
            뒤쪽 구름 한 겹. 앞 구름을 오른쪽 아래로 밀고 왼쪽 위에 능선만 남긴다 —
            앞 구름 윤곽 위에 얹으면 혹처럼 보이고, 두 겹 다 그리면 18px 에서 뭉갠다
          */}
          <path d="M4.8 10.4a4 4 0 0 1 7.6-2" />
          <g transform="translate(1 2.6) scale(0.94)">
            <path d={CLOUD} />
          </g>
        </>
      );

    case "rain":
      return (
        <>
          <path d={CLOUD} />
          <path d="M9.3 18.2l-.8 2.4M12.4 18.2l-.8 2.4M15.5 18.2l-.8 2.4" />
        </>
      );

    case "rain-snow":
      return (
        <>
          <path d={CLOUD} />
          <path d="M10.2 18.2l-.9 2.6" />
          <path d={flake(14.6, 20.2)} />
        </>
      );

    case "snow":
      return (
        <>
          <path d={CLOUD} />
          <path d={flake(9.5, 20.2)} />
          <path d={flake(14.5, 20.2)} />
        </>
      );

    case "shower":
      // 소나기는 **해가 남아 있는 비**다. 비와 획 길이로만 구분하면 16px 에서 같아 보인다
      return (
        <>
          <circle cx="7.2" cy="6.9" r="2.4" />
          <path d="M3.5 6.9H2.1M7.2 3.2V1.8M4.5 4.2L3.5 3.2" />
          <g transform="translate(3.9 4.4) scale(0.7)">
            <path d={CLOUD} />
          </g>
          <path d="M10.8 17.9l-1.4 3.2M14.6 17.9l-1.4 3.2" />
        </>
      );
  }
}

export function WeatherIcon({ sky, className }: { sky: SkyState; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {shapes(sky)}
    </svg>
  );
}
