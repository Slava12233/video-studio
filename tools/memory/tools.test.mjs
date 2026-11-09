// tools/memory/tools.test.mjs: the vault tools on a throwaway copy of the vault skeleton (node:test, no dependencies).
//   timeout 300 node --test tools/memory/tools.test.mjs
// Covers: frontmatter round trip, the secrets scanner, new-note + log, build-hot caps and determinism, lint on the
// fixture, the two hooks' pure functions. Writes only under the OS temp folder.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { STUDIO_ROOT, parseFrontmatter, serializeFrontmatter, setFrontmatterKey, splitFrontmatter, scanSecrets, scrubSecrets, contentHash, lineCount, appendUnderSection, extractWikilinks, oneLine } from "./lib.mjs";
import { createNote } from "./new-note.mjs";
import { logSession, logProject } from "./log.mjs";
import { buildAll, HOT_MAX_LINES, HOT_MAX_BYTES, readHomeBlock } from "./build-hot.mjs";
import { buildCapabilities } from "./build-capabilities.mjs";
import { lint } from "./lint.mjs";

const HOOKS = path.join(STUDIO_ROOT, ".claude", "hooks");
const { contextText, openInboxLines } = await import(pathToFileURL(path.join(HOOKS, "session-start.mjs")).href);
const { lastAssistantTexts, checkpoint } = await import(pathToFileURL(path.join(HOOKS, "pre-compact.mjs")).href);

/** A throwaway vault: the real templates, bases, HOME, state, maps, inbox and _about notes; no lessons, projects or sessions. */
function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vs-memory-"));
  const copy = (rel) => { const s = path.join(STUDIO_ROOT, rel); if (!fs.existsSync(s)) return; const d = path.join(root, rel); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.cpSync(s, d, { recursive: true }); };
  for (const rel of ["memory/templates", "memory/bases", "memory/maps", "memory/inbox", "memory/state", "memory/HOME.md", "memory/README.md", "tools/memory", ".claude/hooks", ".env.example", "docs/hooks-paste-block.md"]) copy(rel);
  for (const f of ["projects", "lessons", "decisions", "open", "references", "sessions"]) copy(`memory/${f}/_about.md`);
  // The maps link to lesson and decision notes of the real vault: copy those too so the fixture lints clean.
  for (const n of ["memory/lessons", "memory/decisions", "memory/references"]) copy(n);
  copy("memory/open");
  fs.mkdirSync(path.join(root, ".claude", "skills", "x"), { recursive: true });
  fs.writeFileSync(path.join(root, ".claude", "skills", "x", "SKILL.md"), "---\nname: x\ndescription: a test skill\n---\n# x\n");
  fs.mkdirSync(path.join(root, ".claude", "agents"), { recursive: true });
  fs.writeFileSync(path.join(root, ".claude", "agents", "a.md"), "---\nname: a\ndescription: test agent\nmodel: sonnet\ntools: Read\n---\nbody\n");
  fs.mkdirSync(path.join(root, ".claude", "rules"), { recursive: true });
  fs.writeFileSync(path.join(root, ".claude", "rules", "r.md"), "# A rule\n");
  fs.mkdirSync(path.join(root, "projects", "2026-11-10-test-film"), { recursive: true });
  fs.writeFileSync(path.join(root, "projects", "2026-11-10-test-film", "BRIEF.md"), "# Brief: 2026-11-10-test-film\n\nType: photo-film · Brand: _default · Format: landscape · Created: 2026-11-10\n");
  fs.writeFileSync(path.join(root, "projects", "2026-11-10-test-film", "ai-ledger.jsonl"), JSON.stringify({ at: "2026-11-10T10:00:00Z", endpoint: "x", usd: 1.25, label: "a" }) + "\n" + JSON.stringify({ at: "2026-11-10T10:05:00Z", endpoint: "y", usd: 0.5 }) + "\n");
  // the docs the open items and maps link to
  fs.mkdirSync(path.join(root, "docs"), { recursive: true });
  for (const d of ["FIELD-NOTES.md", "OBSIDIAN.md"]) fs.writeFileSync(path.join(root, "docs", d), `# ${d}\n`);
  return root;
}

test("frontmatter round trip, quoting and setFrontmatterKey", () => {
  const fm = { type: "lesson", created: "2026-11-09", status: "confirmed", categories: ["lessons", "fal"], summary: "a: b #c", empty: "", n: 3 };
  const text = serializeFrontmatter(fm) + "\nbody\n";
  const parsed = parseFrontmatter(splitFrontmatter(text).fmText);
  assert.equal(parsed.type, "lesson");
  assert.deepEqual(parsed.categories, ["lessons", "fal"]);
  assert.equal(parsed.summary, "a: b #c");
  assert.equal(parsed.empty, "");
  assert.equal(parsed.n, "3");
  const t2 = setFrontmatterKey(text, "status", "superseded");
  assert.match(t2, /^status: superseded$/m);
  const t3 = setFrontmatterKey(text, "spend_usd", 1.5);
  assert.match(t3, /^spend_usd: 1.5$/m);
  assert.equal(splitFrontmatter(t3).body, "\nbody\n");
});

test("secrets scanner: fal key, sk- key, phone, email; allowed emails and placeholders pass", () => {
  const bad = "key 12345678-1234-1234-1234-123456789abc:0123456789abcdef0123456789abcdef and sk-abcdefghijklmnopqrstuvwxyz0123 call +972 50-123-4567 mail someone@example.com";
  const kinds = scanSecrets(bad).map((h) => h.kind);
  assert.ok(kinds.includes("fal-key") && kinds.includes("api-key") && kinds.includes("phone") && kinds.includes("email"), kinds.join(","));
  assert.equal(scanSecrets("Slava Labovkin <141155788+Slava12233@users.noreply.github.com> and noreply@anthropic.com").length, 0);
  assert.equal(scanSecrets("FAL_KEY=<your key> FAL_KEY= FAL_KEY : MISSING", { envNames: new Set(["FAL_KEY"]) }).length, 0);
  assert.equal(scanSecrets("FAL_KEY=abc123realvalue", { envNames: new Set(["FAL_KEY"]) })[0].kind, "env-value");
  assert.equal(scanSecrets("rendered 2026-11-09 at 20:05, 1080x1920, $1.40, 0.8.160, id 52708130309834").length, 0);
  assert.ok(!scrubSecrets(bad).includes("sk-abcdefghijklmnopqrstuvwxyz0123"));
  assert.ok(scrubSecrets(bad).includes("[redacted]"));
});

test("markdown helpers", () => {
  const body = "# T\n\n## Log\n- a\n\n## Other\n- b\n";
  const out = appendUnderSection(body, /^log$/i, "## Log", "- c");
  assert.match(out, /## Log\n- a\n- c\n\n## Other/);
  const links = extractWikilinks("see [[a|x]] and ![[b.base]] and `[[not]]` and [[c#h]]");
  assert.deepEqual(links.filter((l) => !l.inInlineCode).map((l) => l.target), ["a", "b.base", "c"]);
  assert.equal(oneLine("x `code span` y", 10).includes("`"), false);
  assert.equal(lineCount("a\nb\n"), 2);
  assert.equal(contentHash("a \n\nb\n"), contentHash("a\n\nb"));
});

test("new-note, log, build-hot, capabilities and lint on a fixture vault", async () => {
  const root = fixture();
  const now = new Date("2026-11-10T12:34:00+02:00");
  const p = createNote(root, "project", "2026-11-10-test-film", { summary: "A test film.", kind: "photo-film", resolution: "landscape", date: "2026-11-10" });
  assert.equal(p.rel, "memory/projects/2026-11-10-test-film.md");
  assert.throws(() => createNote(root, "project", "2026-11-10-test-film", { summary: "again" }), /already exists/);
  const l = createNote(root, "lesson", "Workers Four Is The Bound", { category: "rendering", summary: "Four workers on 32 GB.", date: "2026-11-10" });
  assert.equal(l.rel, "memory/lessons/rendering/2026-11-10-workers-four-is-the-bound.md");
  assert.match(l.text, /^categories: \[lessons, rendering\]$/m);
  assert.throws(() => createNote(root, "lesson", "x", { summary: "no category" }), /category/);
  createNote(root, "decision", "fps-24-for-films", { summary: "Films render at 24 fps.", date: "2026-11-10" });
  createNote(root, "open", "slava-approve-draft", { summary: "Approve draft 2.", owner: "slava", date: "2026-11-10" });

  const s = logSession(root, "asked: a test; FAL_KEY=abc123realvalue must be scrubbed", { now });
  assert.equal(s, "memory/sessions/2026-11/2026-11-10.md");
  const sess = fs.readFileSync(path.join(root, s), "utf8");
  assert.match(sess, /- 12:34 — asked: a test; FAL_KEY=\[redacted\]/);
  assert.ok(!/\n- \n/.test(sess), "the template's empty bullet was replaced");
  logSession(root, "second line", { now });
  assert.match(fs.readFileSync(path.join(root, s), "utf8"), /first|second line/);

  logProject(root, "2026-11-10-test-film", "draft 1 rendered", { status: "build", next: "review draft 1", now });
  const proj = fs.readFileSync(path.join(root, p.rel), "utf8");
  assert.match(proj, /^status: build$/m);
  assert.match(proj, /^spend_usd: 1.75$/m);
  assert.match(proj, /^next: review draft 1$/m);
  assert.match(proj, /## Log\n[\s\S]*- 2026-11-10 12:34 — draft 1 rendered \(status: build\)/);
  assert.throws(() => logProject(root, "nope", "x"), /no project note/);

  const caps = buildCapabilities(root, { now });
  assert.equal(caps.outputs.length, 5);
  const res = buildAll(root, { now, by: "test" });
  const hot = res.outputs.find((o) => o.rel === "memory/HOT.md").content;
  assert.ok(lineCount(hot) <= HOT_MAX_LINES && Buffer.byteLength(hot, "utf8") <= HOT_MAX_BYTES);
  assert.match(hot, /\[\[2026-11-10-test-film\]\] · photo-film · build · \$1.75 \(2 calls\)/);
  assert.match(hot, /slava · \[\[2026-11-10-slava-approve-draft\]\]/);
  assert.match(hot, /\[\[2026-11-10-workers-four-is-the-bound\]\]/);
  assert.ok(res.homeFound);
  const home = fs.readFileSync(path.join(root, "memory", "HOME.md"), "utf8");
  const block = readHomeBlock(home);
  assert.ok(block && block.hash && contentHash(block.inner) === block.hash);
  assert.match(block.inner, /### פרויקטים בעבודה/);
  // deterministic: a second run the same day changes nothing; the next day only HOME's "today" line moves
  const again = buildAll(root, { now: new Date("2026-11-10T18:00:00+02:00"), by: "test" });
  assert.deepEqual(again.outputs.filter((o) => o.changed).map((o) => o.rel), []);
  const nextDay = buildAll(root, { now: new Date("2026-11-11T09:00:00+02:00"), by: "test", write: false });
  assert.deepEqual(nextDay.outputs.filter((o) => o.changed).map((o) => o.rel), ["memory/HOME.md"]);

  const r = lint(root, { today: "2026-11-10" });
  const fails = r.findings.filter((f) => f.level === "FAIL");
  assert.deepEqual(fails, [], JSON.stringify(fails, null, 1));

  // a hand edit of a generated note and a secret in a note fail the lint
  fs.appendFileSync(path.join(root, "memory", "HOT.md"), "\nhand edit\n");
  fs.writeFileSync(path.join(root, "memory", "lessons", "rendering", "2026-11-10-bad.md"), "---\ntype: lesson\ncreated: 2026-11-10\nsummary: bad\n---\n# bad\ncall +972 50-123-4567 and see [[no-such-note]]\n");
  const r2 = lint(root, { today: "2026-11-10" });
  const reasons = r2.findings.filter((f) => f.level === "FAIL").map((f) => f.reason).join(" | ");
  assert.match(reasons, /content_hash does not match/);
  assert.match(reasons, /phone shape/);
  assert.match(reasons, /dead link \[\[no-such-note\]\]/);

  // hooks: HOT injected (frontmatter stripped), inbox count, checkpoint written and scrubbed
  const ctx = contextText([root]);
  assert.match(ctx, /^memory\/HOT.md \(the vault's hot note/);
  assert.ok(!ctx.includes("content_hash:"));
  fs.appendFileSync(path.join(root, "memory", "inbox", "owner.md"), "");
  const inbox = fs.readFileSync(path.join(root, "memory", "inbox", "owner.md"), "utf8").replace("## פתוח\n", "## פתוח\n- שאלה אחת\n- ↳ תשובה\n");
  fs.writeFileSync(path.join(root, "memory", "inbox", "owner.md"), inbox);
  assert.equal(openInboxLines(root), 1);
  assert.match(contextText([root]), /1 open line\(s\) from Slava/);
  const jsonl = [JSON.stringify({ type: "assistant", message: { content: [{ type: "text", text: "first message FAL_KEY=abc123realvalue" }] } }), JSON.stringify({ type: "assistant", isSidechain: true, message: { content: [{ type: "text", text: "sidechain" }] } }), JSON.stringify({ type: "user", message: { content: "u" } }), JSON.stringify({ type: "assistant", message: { content: [{ type: "thinking", thinking: "t" }, { type: "text", text: "second" }] } })].join("\n");
  assert.deepEqual(lastAssistantTexts(jsonl), ["first message FAL_KEY=abc123realvalue", "second"]);
  const tf = path.join(root, "transcript.jsonl"); fs.writeFileSync(tf, jsonl);
  const cp = await checkpoint({ transcript_path: tf, trigger: "auto", cwd: root }, { root, now });
  assert.equal(cp.count, 2);
  const after = fs.readFileSync(path.join(root, s), "utf8");
  assert.match(after, /## Checkpoint 12:34\n<!-- PreCompact hook \(auto\)[^\n]*-->\n- first message FAL_KEY=\[redacted\]\n- second\n\n## Close/);
  fs.rmSync(root, { recursive: true, force: true });
});
