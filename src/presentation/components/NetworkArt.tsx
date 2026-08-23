"use client";

import { useEffect, useRef } from "react";

/**
 * 머리말 옆에 놓이는 **연결의 은유.**
 *
 * 장소들이 따로 떨어진 목록이 아니라 서로 이어진 하나의 지형이라는 것을, 글로
 * 설명하는 대신 옆에 둔다. 지도처럼 읽혀도 좋고 기하 도형으로 읽혀도 좋다 —
 * 어느 쪽이든 "이어져 있다" 가 남으면 된다.
 *
 * **눈에 띄면 실패다.** 이 옆에 제목이 서 있고, 읽을 것은 제목이다. 선과 점을
 * 아주 옅게 두고 양 끝을 흐려서, 보려고 하면 보이고 읽는 동안에는 배경으로
 * 물러나게 한다. 움직임도 같은 이유로 느리다 — 눈이 따라가기 시작하면 옆의
 * 글자를 읽지 못한다.
 *
 * **왜 SVG 가 아니라 canvas 인가.** 점이 움직이면 선도 함께 움직여야 하고, 어떤
 * 점끼리 이어질지가 매 순간 달라진다(멀어지면 끊기고 가까워지면 이어진다).
 * CSS 애니메이션은 요소를 각자 움직일 뿐 **선이 점을 따라가게 할 수 없다** —
 * 선의 양 끝 좌표를 매 프레임 다시 써야 하기 때문이다. canvas 는 매 프레임
 * 전부 다시 그리므로 그 관계가 저절로 유지된다.
 *
 * 장식이라 서버에서는 아무것도 그리지 않는다. 첫 페인트에 잠깐 비었다가 채워지고,
 * 그 사이 읽을 것은 옆의 제목이다.
 */

/** 이 값만 바꾸면 다른 배치가 나온다 */
const SEED = 20260823;

/** 좌표계. 실제 캔버스 크기와 무관하게 이 안에서 계산하고 마지막에 늘인다 */
const VIEW = 640;
const COLS = 9;
const ROWS = 9;
/** 칸 크기 대비 흔들 폭. 1 에 가까울수록 무질서해진다 */
const JITTER = 0.95;
/**
 * 이 확률로 점을 비운다. **격자를 깨는 것은 흔들기만으로는 부족하다** —
 * 칸마다 하나씩 있으면 아무리 흔들어도 밀도가 고르고, 고른 밀도는 무늬로 읽힌다.
 */
const DROP = 0.16;
/**
 * 이 거리 안의 점끼리 잇는다.
 *
 * 점이 움직이므로 정지 그림보다 넉넉해야 한다 — 흩어지는 순간 망이 조각나면
 * "연결" 이 아니라 흩날리는 점이 된다. 격자 칸의 약 1.8배면 이웃과 그 너머까지
 * 닿아, 몇 개가 멀어져도 전체는 이어진 채로 남는다.
 */
const LINK = (VIEW / COLS) * 1.8;

/**
 * 점의 속도(초당 좌표 단위). 한 점이 화면을 가로지르는 데 1분 반쯤 걸린다 —
 * 움직임을 알아볼 수는 있지만 눈이 좇아가지는 않는 정도다.
 */
const SPEED = 7;

/**
 * 방향이 도는 속도(초당 라디안). **직선으로 가면 기계가 된다** — 등속 직선 운동은
 * 궤적이 자로 그은 선이라, 점이 흐르는 것이 아니라 쏘아진 것으로 보인다. 방향을
 * 조금씩 틀면 완만한 곡선을 그리며 표류해, 무리가 살아 움직이는 것으로 읽힌다.
 */
const TURN = 0.16;

/** 점이 밖으로 나가도 되는 여유. 넓을수록 무리가 크게 돈다 */
const MARGIN = 150;

/**
 * 거리와 무관하게 **항상 이어 두는 이웃 수.**
 *
 * 거리 임계값만 쓰면 멀어진 점이 통째로 떨어져 나가 홀로 떠다닌다. 그러면
 * "이어져 있다" 가 아니라 "흩어진다" 로 읽힌다. 가장 가까운 둘과는 아무리 멀어도
 * 실을 남겨 두면, 하나가 끊길 때 다른 쪽으로 옮겨 붙는 것처럼 보인다 —
 * 망이 끊어지는 것이 아니라 **엮이는 상대가 바뀐다.**
 */
const KEEP_NEAREST = 2;

/** 결정적 의사난수. 시드를 바꾸면 다른 배치가 나온다 */
function makeRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    // xorshift32
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 0x1_0000_0000;
  };
}

type Node = { x: number; y: number; vx: number; vy: number; r: number; turn: number };

function makeNodes(): Node[] {
  const rand = makeRandom(SEED);
  const cellW = VIEW / COLS;
  const cellH = VIEW / ROWS;
  const out: Node[] = [];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const jx = (rand() - 0.5) * cellW * JITTER;
      const jy = (rand() - 0.5) * cellH * JITTER;
      const keep = rand();
      const r = 1.1 + rand() * 2.4;
      const angle = rand() * Math.PI * 2;
      // 속도도 흩는다. 전부 같은 속도면 무리가 한 덩어리로 흘러가 배치가 굳어 보인다
      const speed = SPEED * (0.35 + rand() * 0.9);
      // 도는 방향과 세기도 각자. 전부 같은 쪽으로 돌면 무리가 소용돌이가 된다
      const turn = (rand() - 0.5) * 2 * TURN;
      if (keep < DROP) continue;
      out.push({
        x: (col + 0.5) * cellW + jx,
        y: (row + 0.5) * cellH + jy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r,
        turn,
      });
    }
  }
  return out;
}

/**
 * 테마 색을 읽는다. 라이트·다크에서 각각 먹색·바랜 흰색이다.
 *
 * **커스텀 속성이 아니라 `color` 를 읽는다.** `--ink-primary` 는 다른 변수를
 * 가리키는 참조라 `getPropertyValue` 가 무엇을 돌려줄지 브라우저에 달렸다.
 * `color` 는 언제나 `rgb(...)` 로 해석돼 오고, canvas 는 그것을 그대로 쓴다.
 * 그래서 캔버스에 `text-ink` 를 붙여 두고 자기 색을 물어본다.
 */
function readInk(el: HTMLElement): string {
  return getComputedStyle(el).color || "#1c1a17";
}

/**
 * **점은 모듈이 들고 있다.** 홈과 탐색 화면은 서로 다른 라우트라 이 컴포넌트가
 * 언마운트됐다 다시 마운트된다. 노드를 컴포넌트 안에서 만들면 그때마다 처음 배치로
 * 돌아가, 화면을 옮길 때 그림이 한 번 튄다. 모듈에 두면 같은 세션 동안 계속
 * 흐르므로 두 화면이 **같은 그림의 다른 크기**로 읽힌다.
 */
const nodes = makeNodes();

export function NetworkArt({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let ink = readInk(canvas);
    let width = 0;
    let height = 0;
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    /*
      캔버스는 CSS 픽셀이 아니라 장치 픽셀로 그려야 선이 흐려지지 않는다.
      좌표계(VIEW)를 실제 크기에 맞춰 늘이고, 짧은 변을 채운 뒤 가운데로 민다 —
      SVG 의 `preserveAspectRatio="slice"` 와 같은 계산이다.
    */
    function resize() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      scale = Math.max(width, height) / VIEW;
      offsetX = (width - VIEW * scale) / 2;
      offsetY = (height - VIEW * scale) / 2;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    /*
      테마가 바뀌면 색도 바뀐다. 매 프레임 `getComputedStyle` 을 부르는 것은
      비싸므로(레이아웃을 강제한다) 루트의 속성 변화만 지켜본다.
    */
    const themeWatcher = new MutationObserver(() => {
      ink = readInk(canvas);
    });
    themeWatcher.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "class", "style"],
    });

    const px = (x: number) => offsetX + x * scale;
    const py = (y: number) => offsetY + y * scale;

    /*
      가장 가까운 이웃들. **매 프레임 다시 뽑는다** — 점이 움직이므로 누가 가장
      가까운지가 계속 바뀌고, 그 바뀜이 곧 "다른 쪽으로 옮겨 붙는" 움직임이다.
      크기가 고정된 배열을 미리 잡아 두고 덮어쓴다. 프레임마다 새로 만들면
      쓰레기가 쌓인다.
    */
    const nearIdx = new Int32Array(nodes.length * KEEP_NEAREST);
    const nearDist = new Float64Array(nodes.length * KEEP_NEAREST);

    function findNearest() {
      nearIdx.fill(-1);
      nearDist.fill(Number.POSITIVE_INFINITY);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = 0; j < nodes.length; j++) {
          if (i === j) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d2 = dx * dx + dy * dy;
          // 삽입 정렬. KEEP_NEAREST 가 2~3 이라 정렬 비용이 비교 비용보다 싸다
          for (let k = 0; k < KEEP_NEAREST; k++) {
            const slot = i * KEEP_NEAREST + k;
            if (d2 >= nearDist[slot]) continue;
            for (let m = KEEP_NEAREST - 1; m > k; m--) {
              nearDist[i * KEEP_NEAREST + m] = nearDist[i * KEEP_NEAREST + m - 1];
              nearIdx[i * KEEP_NEAREST + m] = nearIdx[i * KEEP_NEAREST + m - 1];
            }
            nearDist[slot] = d2;
            nearIdx[slot] = j;
            break;
          }
        }
      }
    }

    function strokeLine(a: Node, b: Node, alpha: number) {
      if (!ctx || alpha <= 0.004) return;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(px(a.x), py(a.y));
      ctx.lineTo(px(b.x), py(b.y));
      ctx.stroke();
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = ink;
      ctx.fillStyle = ink;

      findNearest();

      // 선이 먼저. 점이 그 위에 놓여야 교차점이 매듭으로 읽힌다
      ctx.lineWidth = Math.max(0.5, 0.6 * scale);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK * LINK) continue;
          const far = Math.sqrt(d2) / LINK;
          /*
            멀수록 옅다. **끊기는 순간이 보이면 안 된다** — 임계 거리에서 갑자기
            사라지면 선이 깜빡이는 것으로 읽힌다. 거리에 따라 0 까지 내려가면
            이어지고 끊기는 것이 저절로 부드러워진다.
          */
          strokeLine(a, b, 0.17 * (1 - far));
        }
      }

      /*
        임계 밖으로 나간 이웃에게 남기는 실. 위 루프가 이미 그린 것(임계 안)은
        건너뛰므로 겹쳐 그려 진해지는 일이 없다.

        멀수록 옅어지되 **0 이 되지는 않는다.** 이 실이 있어야 무리에서 떨어져
        나간 점이 여전히 어딘가에 매여 있는 것으로 보인다.
      */
      for (let i = 0; i < nodes.length; i++) {
        for (let k = 0; k < KEEP_NEAREST; k++) {
          const j = nearIdx[i * KEEP_NEAREST + k];
          if (j < 0) continue;
          const d2 = nearDist[i * KEEP_NEAREST + k];
          if (d2 <= LINK * LINK) continue;
          const stretch = Math.sqrt(d2) / LINK;
          strokeLine(nodes[i], nodes[j], 0.09 / stretch);
        }
      }

      ctx.globalAlpha = 0.34;
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(px(n.x), py(n.y), n.r * scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;

    function step(now: number) {
      // 첫 프레임은 간격을 모른다. 큰 값이 들어오면 점이 순간이동한다
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;

      for (const n of nodes) {
        /*
          방향을 조금씩 튼다. 속도의 크기는 그대로 두고 각도만 돌리므로 점이
          빨라지거나 느려지지 않고 **완만한 호를 그리며** 흐른다.
        */
        const a = n.turn * dt;
        const cos = Math.cos(a);
        const sin = Math.sin(a);
        const vx = n.vx * cos - n.vy * sin;
        n.vy = n.vx * sin + n.vy * cos;
        n.vx = vx;

        n.x += n.vx * dt;
        n.y += n.vy * dt;

        /*
          경계에서 되튄다. **밖으로 여유를 준다** — 화면 가장자리에서 정확히 튕기면
          점들이 테두리를 따라 미끄러져 사각형이 드러난다. 양 끝은 어차피 마스크로
          흐려지므로 그 바깥에서 도는 것은 보이지 않는다.

          되튈 때 좌표도 안으로 되민다. 방향만 뒤집으면 도는 각도에 따라 경계 밖에
          머문 채 부호가 계속 뒤집혀 점이 벽에 붙어 떠는 수가 있다.
        */
        if (n.x < -MARGIN) {
          n.x = -MARGIN;
          n.vx = Math.abs(n.vx);
        } else if (n.x > VIEW + MARGIN) {
          n.x = VIEW + MARGIN;
          n.vx = -Math.abs(n.vx);
        }
        if (n.y < -MARGIN) {
          n.y = -MARGIN;
          n.vy = Math.abs(n.vy);
        } else if (n.y > VIEW + MARGIN) {
          n.y = VIEW + MARGIN;
          n.vy = -Math.abs(n.vy);
        }
      }

      draw();
      frame = requestAnimationFrame(step);
    }

    if (reduced.matches) {
      // 움직임을 끈다. **그림은 남긴다** — 정지한 연결망도 연결망이다
      draw();
    } else {
      frame = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeWatcher.disconnect();
    };
  }, []);

  return (
    /*
      **장식이다.** 정보를 지지 않으므로 보조기술에서 감춘다.
      `network-art` 가 양 끝 페이드(mask)를 갖는다 (globals.css).
    */
    <div className={`network-art ${className}`} aria-hidden="true">
      {/* `text-ink` 가 곧 그림의 색이다. 루프가 이 요소의 `color` 를 읽는다 */}
      <canvas ref={canvasRef} className="h-full w-full text-ink" />
    </div>
  );
}
