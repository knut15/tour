#!/usr/bin/env node
/**
 * `.curvez/architecture.md` 의 `## 금지 import` 표를 읽어 소스에 실제로 grep 을 돌린다.
 *
 * 문서의 표가 "선언" 이고 lint 가 "집행" 이라고 적혀 있지만, `eslint.config.mjs` 에는
 * 레이어 경계 규칙이 없다. 그래서 지금은 이 스크립트가 유일한 집행 수단이다.
 * lint 로 옮기면 이 스크립트를 지운다.
 *
 * 규칙을 여기에 복사하지 않는다. 문서가 정본이고 스크립트는 실행기다.
 * 표에 규칙을 추가하면 코드를 고치지 않아도 다음 CI 부터 검사된다.
 */

import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const DOC = ".curvez/architecture.md";

/**
 * `## 예외` 표에 문서화된 면제. **여기 적힌 조합은 그 규칙에서만 빠진다.**
 *
 * 이 목록이 문서와 어긋나면 아래 `assertExemptionsDocumented` 가 실패한다.
 * 문서에서 예외가 사라졌는데 스크립트만 남아 조용히 통과시키는 상황을 막는다.
 */
const EXEMPTIONS = [
  { rule: "ARCH-011", file: "src/presentation/lib/container.ts" },
];

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(2);
}

/** `## <제목>` 부터 다음 `## ` 직전까지를 돌려준다. */
function section(doc, title) {
  const lines = doc.split("\n");
  const start = lines.findIndex((l) => l.trim() === `## ${title}`);
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].startsWith("## ")) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end).join("\n");
}

/**
 * 표 한 줄을 셀로 자른다.
 *
 * 금지 패턴 안의 `|` 는 문서에서 `\|` 로 이스케이프돼 있다. 이스케이프되지 않은
 * `|` 에서만 잘라야 `(next\|react)` 같은 패턴이 두 셀로 찢어지지 않는다.
 */
function cells(line) {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.trim());
}

function parseRules(doc) {
  const body = section(doc, "금지 import");
  if (body === null) fail(`${DOC} 에 '## 금지 import' 헤딩이 없다`);

  const rules = [];
  for (const line of body.split("\n")) {
    if (!/^\s*\|\s*ARCH-\d{3}\s*\|/.test(line)) continue;
    const [id, path, pattern] = cells(line);
    if (!id || !path || !pattern) fail(`${id ?? "?"} 행의 열이 비어 있다: ${line}`);
    // 표기용 이스케이프를 되돌려 grep -E 에 넘길 실제 정규식으로 만든다.
    rules.push({ id, path, pattern: pattern.replace(/\\\|/g, "|") });
  }
  if (rules.length === 0) fail("금지 import 표에서 규칙을 하나도 읽지 못했다");
  return rules;
}

/** 스크립트가 들고 있는 면제가 문서의 `## 예외` 에도 있는지 확인한다. */
function assertExemptionsDocumented(doc) {
  const body = section(doc, "예외");
  if (body === null) fail(`${DOC} 에 '## 예외' 헤딩이 없다`);
  for (const { rule, file } of EXEMPTIONS) {
    if (!body.includes(file) || !body.includes(rule)) {
      fail(
        `면제 ${rule} → ${file} 가 문서의 '## 예외' 에 없다. ` +
          `문서에서 지웠다면 이 스크립트의 EXEMPTIONS 에서도 지워야 한다`,
      );
    }
  }
}

function isExempt(ruleId, filePath) {
  return EXEMPTIONS.some((e) => e.rule === ruleId && e.file === filePath);
}

function check(rule) {
  if (!existsSync(rule.path)) {
    return { ...rule, skipped: true, hits: [] };
  }
  // 문서가 "grep -E 에 그대로 들어가는 값" 이라고 선언하므로 grep 을 그대로 쓴다.
  // JS 정규식으로 옮기면 ERE 와 미묘하게 달라져 문서와 검사가 어긋난다.
  const r = spawnSync("grep", ["-rInE", "--", rule.pattern, rule.path], {
    encoding: "utf8",
  });
  // grep: 0 = 일치, 1 = 일치 없음, 2 이상 = 오류(대개 정규식 문법)
  if (r.status !== 0 && r.status !== 1) {
    fail(`${rule.id} 의 정규식을 grep 이 거부했다: ${(r.stderr || "").trim()}`);
  }
  const hits = (r.stdout || "")
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const m = line.match(/^([^:]+):(\d+):(.*)$/);
      return m ? { file: m[1], line: Number(m[2]), text: m[3].trim() } : null;
    })
    .filter(Boolean)
    .filter((h) => !isExempt(rule.id, h.file));
  return { ...rule, skipped: false, hits };
}

function main() {
  if (!existsSync(DOC)) fail(`${DOC} 가 없다. 저장소 루트에서 실행해야 한다`);
  const doc = readFileSync(DOC, "utf8");

  assertExemptionsDocumented(doc);
  const results = parseRules(doc).map(check);

  let violations = 0;
  for (const r of results) {
    if (r.skipped) {
      console.log(`SKIP  ${r.id}  ${r.path} (경로 없음)`);
      continue;
    }
    if (r.hits.length === 0) {
      console.log(`OK    ${r.id}  ${r.path}`);
      continue;
    }
    violations += r.hits.length;
    console.log(`FAIL  ${r.id}  ${r.path}  위반 ${r.hits.length}건`);
    for (const h of r.hits) {
      console.log(`        ${h.file}:${h.line}  ${h.text}`);
    }
  }

  const checked = results.filter((r) => !r.skipped).length;
  console.log(
    `\n규칙 ${results.length}개 중 ${checked}개 검사, 면제 ${EXEMPTIONS.length}건, 위반 ${violations}건`,
  );
  process.exit(violations === 0 ? 0 : 1);
}

main();
