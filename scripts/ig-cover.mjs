/**
 * 발행 전에 커버를 먼저 그려 보고 컨펌을 받는 도구.
 *
 * **커버는 나간 뒤 고칠 수 없다.** 인스타는 올린 게시물의 이미지 교체를 지원하지
 * 않는다 — 지우고 다시 올리는 것뿐이고 그때 좋아요·저장은 사라진다. 그래서
 * 큐를 `approved` 로 올리기 전에 사람이 그림을 눈으로 본다.
 *
 * ```
 * node --env-file=.env.local scripts/ig-cover.mjs list
 * node --env-file=.env.local scripts/ig-cover.mjs make 12
 * node --env-file=.env.local scripts/ig-cover.mjs approve 12
 * ```
 *
 * `make` 는 dev 서버(`pnpm dev`)가 떠 있어야 한다. 커버를 그리는 쪽은 `/api/og`
 * 하나뿐이라 미리보기와 실제 발행이 **같은 그림**이다.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

/** 인스타가 받는 가장 세로로 긴 비율. `api/instagram/cron` 과 같은 값이어야 한다 */
const PORTRAIT_RATIO = 4 / 5;

/** 커버를 저장할 곳. `spot/<contentId>.jpg` 로 장소마다 한 장이다 */
const COVER_DIR = "assets/spot";

const BASE = process.env.COVER_BASE ?? "http://localhost:3000";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY?.trim();

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SECRET_KEY 가 필요하다.");
  console.error("node --env-file=.env.local scripts/ig-cover.mjs ... 로 부른다.");
  process.exit(1);
}

async function queue(path, init) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ig_queue${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`큐 요청 실패 HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

async function list() {
  const rows = await queue(
    "?select=id,content_id,status,chip,headline,pin,category,photo_ids,scheduled_for,published_at,last_error" +
      "&order=status.asc,created_at.asc",
  );
  if (rows.length === 0) return console.log("큐가 비었다.");

  /*
    **같은 제목이 몇 번 쓰였는지 함께 보여 준다.** 지역이 달라도 성격이 같으면
    고정 문구가 겹친다 — 한 줄씩 보면 멀쩡해 보이고 그리드에서만 드러난다.
  */
  const times = new Map();
  for (const r of rows) times.set(r.headline, (times.get(r.headline) ?? 0) + 1);

  for (const r of rows) {
    const when = r.published_at ?? r.scheduled_for ?? "-";
    const n = times.get(r.headline);
    console.log(
      `#${r.id}  [${r.status}]  ${r.content_id}  ${r.chip}  ${r.pin}\n` +
        `      ${r.headline.replace(/\n/g, " / ")}${n > 1 ? `  ← 같은 제목 ${n}건` : ""}\n` +
        `      사진 ${r.photo_ids.length}장  일정 ${when}` +
        (r.last_error ? `\n      실패: ${r.last_error}` : ""),
    );
  }

  const repeated = [...times.entries()].filter(([, n]) => n > 1);
  if (repeated.length > 0) {
    console.log(`\n되풀이된 제목 ${repeated.length}종 — 발행 전에 다시 짓는다:`);
    for (const [text, n] of repeated) console.log(`  ${n}건  ${text.replace(/\n/g, " / ")}`);
  }
}

async function rowOf(id) {
  const rows = await queue(`?id=eq.${Number(id)}&select=*`);
  if (rows.length === 0) throw new Error(`큐 #${id} 가 없다`);
  return rows[0];
}

/**
 * 커버 한 장을 그려 파일로 남긴다.
 *
 * 액자 크기를 사진에서 정하는 규칙은 `src/app/api/instagram/cron/route.ts` 와
 * **같아야 한다** — 다르면 컨펌한 그림과 나가는 그림이 갈린다.
 */
async function make(id) {
  const row = await rowOf(id);

  const widths = await Promise.all(
    row.photo_ids.map(async (pid) => {
      const res = await fetch(`${BASE}/api/photo/${pid}`);
      if (!res.ok) throw new Error(`사진 ${pid} 을 받지 못했다: HTTP ${res.status}`);
      const meta = await sharp(Buffer.from(await res.arrayBuffer())).metadata();
      if (!meta.width) throw new Error(`사진 ${pid} 의 크기를 읽지 못했다`);
      return meta.width;
    }),
  );
  const boxWidth = Math.max(...widths);
  const boxHeight = Math.round(boxWidth / PORTRAIT_RATIO);

  const cover = new URL(`${BASE}/api/og`);
  cover.searchParams.set("chip", row.chip);
  cover.searchParams.set("headline", row.headline);
  cover.searchParams.set("pin", row.pin);
  cover.searchParams.set("category", row.category);
  cover.searchParams.set("photo", row.photo_ids[0]);
  cover.searchParams.set("contentId", row.content_id);
  cover.searchParams.set("w", String(boxWidth));
  cover.searchParams.set("h", String(boxHeight));

  const res = await fetch(cover);
  if (!res.ok) throw new Error(`커버를 그리지 못했다 HTTP ${res.status}: ${await res.text()}`);

  await mkdir(COVER_DIR, { recursive: true });
  const path = join(COVER_DIR, `${row.content_id}.jpg`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));

  console.log(`#${row.id} [${row.status}] ${row.pin}`);
  console.log(`  ${row.headline.replace(/\n/g, " / ")}`);
  console.log(`  액자 ${boxWidth}x${boxHeight}  사진 ${row.photo_ids.length}장`);
  console.log(`  → ${path}`);
}

/** 커버 제목의 형식. 두 줄, 각 줄 8자 이하 — `cover-headline.ts` 와 같은 규칙이다 */
const MAX_CHARS = 8;

/**
 * 제목을 손으로 정한다.
 *
 * **모델 없이도 이 절차가 돌아가야 한다.** `ANTHROPIC_API_KEY` 가 없을 때도,
 * 모델이 지은 두 줄이 마음에 안 들 때도 사람이 직접 쓴 것이 최종이다.
 *
 * ```
 * ig-cover.mjs set-headline 16 $'물길 굽이마다\n정자가 있는 곳'
 * ```
 */
async function setHeadline(id, text) {
  const rows = (text ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  if (rows.length !== 2) throw new Error("제목은 두 줄이어야 한다");
  const tooLong = rows.find((l) => [...l].length > MAX_CHARS);
  if (tooLong) throw new Error(`한 줄은 ${MAX_CHARS}자까지다: "${tooLong}" (${[...tooLong].length}자)`);

  const [row] = await queue(`?id=eq.${Number(id)}&status=eq.draft`, {
    method: "PATCH",
    body: JSON.stringify({ headline: rows.join("\n") }),
  });
  if (!row) throw new Error(`큐 #${id} 가 없거나 draft 가 아니다`);
  console.log(`#${row.id}  → ${row.headline.replace(/\n/g, " / ")}`);
}

/**
 * 커버 배경으로 쓸 사진을 맨 앞으로 옮긴다.
 *
 * **첫 장이 곧 커버 배경이다.** 목록 순서는 공급자가 정한 것이라 제목과 어긋나는
 * 장이 앞에 오는 일이 있다 — 실측 2026-08-31: `자리가 전부 / 바다 쪽인 집` 커버에
 * 주방 안쪽 사진이 깔렸다. 사진을 빼지 않고 **순서만 바꾼다.**
 */
async function setCoverPhoto(id, photoId) {
  const row = await rowOf(id);
  if (row.status !== "draft") throw new Error(`큐 #${id} 는 draft 가 아니다`);
  if (!row.photo_ids.includes(photoId)) {
    throw new Error(`사진 ${photoId} 는 이 줄에 없다: ${row.photo_ids.join(", ")}`);
  }
  const photo_ids = [photoId, ...row.photo_ids.filter((p) => p !== photoId)];
  await queue(`?id=eq.${Number(id)}&status=eq.draft`, {
    method: "PATCH",
    body: JSON.stringify({ photo_ids }),
  });
  console.log(`#${id}  사진 순서 → ${photo_ids.join(", ")}`);
}

/**
 * 캡션을 파일에서 통째로 갈아 끼운다.
 *
 * **대괄호 표시가 남아 있으면 거절한다.** `draft-copy.ts` 가 비워 둔 자리를 채우지
 * 않은 채 넣으면 그대로 발행되고, 인스타는 캡션을 고칠 수 없다.
 *
 * ```
 * ig-cover.mjs set-caption 16 /tmp/caption-16.txt
 * ```
 */
async function setCaption(id, file) {
  if (!file) throw new Error("캡션 파일 경로가 필요하다");
  const caption = (await readFile(file, "utf8")).replace(/\s+$/, "");
  const unfilled = caption.match(/\[[^\]]{4,}\]/);
  if (unfilled) throw new Error(`채우지 않은 자리가 남았다: ${unfilled[0]}`);
  if (caption.length > 2200) throw new Error(`캡션이 ${caption.length}자다. 상한은 2200자`);

  const [row] = await queue(`?id=eq.${Number(id)}&status=eq.draft`, {
    method: "PATCH",
    body: JSON.stringify({ caption }),
  });
  if (!row) throw new Error(`큐 #${id} 가 없거나 draft 가 아니다`);
  console.log(`#${row.id}  캡션 ${row.caption.length}자로 교체`);
}

/**
 * 제목을 소개글에서 다시 짓는다. 나온 두 줄이 마음에 안 들면 다시 부르면 된다 —
 * 컨펌 전에는 몇 번이든 다시 그릴 수 있다.
 */
async function headline(id) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) throw new Error("CRON_SECRET 이 없다");
  const res = await fetch(`${BASE}/api/instagram/headline?id=${Number(id)}`, {
    headers: { Authorization: `Bearer ${secret}` },
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`제목을 짓지 못했다 HTTP ${res.status}: ${JSON.stringify(body)}`);
  console.log(`#${body.id}  ${body.before.replace(/\n/g, " / ")}`);
  console.log(`     → ${body.headline.replace(/\n/g, " / ")}`);
}

/** 컨펌이 끝난 줄만 발행 대상으로 올린다. **사람이 OK 한 뒤에만 부른다** */
async function approve(id) {
  const [row] = await queue(`?id=eq.${Number(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "approved" }),
  });
  if (!row) throw new Error(`큐 #${id} 가 없다`);
  console.log(`#${row.id} → approved (${row.content_id} · ${row.pin})`);
}

const [command, ...args] = process.argv.slice(2);
const run = {
  list: () => list(),
  make: () => Promise.all(args.map(make)),
  headline: () => Promise.all(args.map(headline)),
  "set-headline": () => setHeadline(args[0], args[1]),
  "set-caption": () => setCaption(args[0], args[1]),
  "set-cover-photo": () => setCoverPhoto(args[0], args[1]),
  approve: () => Promise.all(args.map(approve)),
}[command];

if (!run) {
  console.error("사용법: ig-cover.mjs list | headline <큐id...> | set-headline <큐id> <두 줄> | set-caption <큐id> <파일> | set-cover-photo <큐id> <사진id> | make <큐id...> | approve <큐id...>");
  process.exit(1);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
