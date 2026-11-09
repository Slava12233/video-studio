#!/usr/bin/env node
// tools/memory/build-hot.mjs: generates the vault's derived notes from the real notes (contract memory/README.md).
//   memory/HOT.md    what every session must know (<= 60 lines, <= 8,192 bytes); the SessionStart hook injects it
//   memory/INDEX.md  one line per note, grouped by folder; grep it, never read it whole
//   memory/HOME.md   only the block between %% generated:start %% and %% generated:end %%, labelled in Hebrew
// It also files a session note that sits outside its month folder into memory/sessions/YYYY-MM/ (rotation).
// Usage: node tools/memory/build-hot.mjs [--check] [--print] [--by <who>] [--root <dir>] [--now <ISO date>]
//   --check  writes nothing; exit 1 when any output would change (generated_at alone does not count)
//   --print  writes nothing; prints HOT and HOME's block
// A missing source gives a missing value; a number is never made up. Times are Asia/Jerusalem (MEMORY_TZ).
import fs from "node:fs";
import path from "node:path";
import {
  findRoot, parseFlags, loadNotes, readText, writeIfChanged, contentHash, lineCount, oneLine, vaultNow, dateOf,
  splitFrontmatter, parseFrontmatter, serializeFrontmatter, getSection, getBullets, buildResolver, str, isAbout, isMain,
  projectSpend, projectFolders,
} from "./lib.mjs";

export const HOT_REL = "memory/HOT.md";
export const INDEX_REL = "memory/INDEX.md";
export const HOME_REL = "memory/HOME.md";
export const HOT_MAX_LINES = 60;
export const HOT_MAX_BYTES = 8192;
export const GEN_LINE = "Never hand-edit; run node tools/memory/build-hot.mjs";
export const RULE_LINE = "Read the note before you act; verify on the files before you change them; names and paths only, never a key or a private detail";
export const HOME_START = "%% generated:start %%";
export const HOME_END = "%% generated:end %%";
export const LANES = ["plan", "media", "build", "review", "deliver", "harness"];
const OWNER_ORDER = ["slava", "harness"];
const CLOSED = /^(delivered|archived|done|superseded|cancelled)$/i;

/** Hebrew labels of HOME's generated block (Slava's chat language in this studio is Hebrew). */
export const LABELS = {
  today: "היום", projects: "פרויקטים בעבודה", open: "פריטים פתוחים לפי בעלים", lessons: "למידות אחרונות", spend: "הוצאות AI",
  none: "אין", noneYet: "אין עדיין", noState: "אין עדיין memory/state/current.md", asOf: (s) => `מצב נכון ל-${s}`,
  more: (n) => `ועוד ${n} בטבלה למטה`, total: (n) => `סה"כ ${n}`,
  owners: { slava: "סלבה", harness: "Claude" },
};

const usd = (n) => `$${Number(n || 0).toFixed(2)}`;

// ---------------------------------------------------------------- reading the vault

export function collect(root) {
  const notes = loadNotes(root);
  const byRel = new Map(notes.map((n) => [n.rel, n]));
  const current = byRel.get("memory/state/current.md") || null;
  const roadmap = byRel.get("memory/state/roadmap.md") || null;
  const isGenerated = (n) => str(n.fm.maintained_by) === "generated";
  const live = (n) => !isGenerated(n) && !isAbout(n) && !n.rel.startsWith("memory/archive/");

  const nextActions = current ? getBullets(getSection(current.body, /^next actions/i)) : [];

  const folders = new Set(projectFolders(root));
  const projects = notes
    .filter((n) => live(n) && str(n.fm.type) === "project")
    .map((n) => {
      const folder = str(n.fm.folder) || `projects/${n.name}`;
      const name = folder.replace(/^projects\//, "");
      const spend = projectSpend(root, name);
      return { note: n, name, folder, folderExists: folders.has(name), status: str(n.fm.status) || "?", kind: str(n.fm.kind) || "?", next: str(n.fm.next), spend, updated: dateOf(n.fm.updated) || dateOf(n.fm.created) || "" };
    })
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.name.localeCompare(b.name));
  const inFlight = projects.filter((p) => !CLOSED.test(p.status));

  const openItems = notes
    .filter((n) => live(n) && str(n.fm.type) === "open" && /^open$/i.test(str(n.fm.status)))
    .map((n) => ({ note: n, owner: (str(n.fm.owner) || "harness").toLowerCase(), summary: str(n.fm.summary) || n.title, updated: dateOf(n.fm.updated) || dateOf(n.fm.created) || "" }))
    .sort((a, b) => {
      const oa = OWNER_ORDER.indexOf(a.owner); const ob = OWNER_ORDER.indexOf(b.owner);
      return (oa === -1 ? 99 : oa) - (ob === -1 ? 99 : ob) || a.owner.localeCompare(b.owner) || b.updated.localeCompare(a.updated) || a.note.rel.localeCompare(b.note.rel);
    });

  const lessons = notes
    .filter((n) => live(n) && str(n.fm.type) === "lesson" && !/^(superseded|archived)$/i.test(str(n.fm.status)))
    .sort((a, b) => str(dateOf(b.fm.created)).localeCompare(str(dateOf(a.fm.created))) || str(b.fm.updated).localeCompare(str(a.fm.updated)) || a.rel.localeCompare(b.rel));
  const decisions = notes.filter((n) => live(n) && str(n.fm.type) === "decision");
  const references = notes.filter((n) => live(n) && str(n.fm.type) === "reference");
  const roadmapOpen = roadmap ? getBullets(getSection(roadmap.body, /^open|^backlog|^next/i)).length : 0;

  const maps = LANES.map((l) => ({ lane: l, rel: `memory/maps/${l}.md`, exists: byRel.has(`memory/maps/${l}.md`) }));

  // Environment: the doctor's last report (.verify-report.txt is git-ignored, written by tools/doctor.mjs).
  const env = [];
  const rep = readText(path.join(root, ".verify-report.txt"));
  if (rep) {
    const lines = rep.split("\n");
    const when = (/doctor:\s*(\d{4}-\d{2}-\d{2})/.exec(lines[0] || "") || [])[1];
    const summary = [...lines].reverse().find((l) => /required check/.test(l)) || "";
    if (when || summary) env.push(`doctor ${when || "?"}: ${oneLine(summary, 80) || "no summary"}`);
    for (const key of ["HyperFrames plugin", "Obsidian", "fal.ai key"]) {
      const l = lines.find((x) => x.includes(key));
      if (l) { const m = /^(ok |opt|FAIL)\s+(.+?)\s{2,}(.*)$/.exec(l); if (m) env.push(`${m[2].trim()}: ${oneLine(m[3].replace(/\s+at\s+\S+$/, ""), 90)}`); }
    }
  }

  return { root, notes, byRel, current, roadmap, roadmapOpen, nextActions, projects, inFlight, openItems, lessons, decisions, references, maps, env };
}

// ---------------------------------------------------------------- memory/HOT.md (English, machine-facing)

function projectLine(p, max = 230) {
  const spend = p.spend.exists ? ` · ${usd(p.spend.usd)} (${p.spend.calls} calls)` : " · $0.00";
  const missing = p.folderExists ? "" : " · (folder missing)";
  return oneLine(`[[${p.note.name}]] · ${p.kind} · ${p.status}${spend}${missing}${p.next ? ` · next: ${p.next}` : ""}`, max);
}

function hotBody(c, keep) {
  const L = ["# HOT", "", GEN_LINE, RULE_LINE, ""];
  const asOf = c.current ? str(c.current.fm.as_of) || str(c.current.fm.updated) : "";
  if (c.current) {
    L.push(`## Now · [[current]]${asOf ? ` · as_of ${asOf}` : ""}`);
    const na = c.nextActions.slice(0, 3);
    if (na.length) { L.push("Next actions:"); na.forEach((a, i) => L.push(`${i + 1}. ${oneLine(a, 260)}`)); } else L.push("Next actions: none written in state/current.md");
  } else {
    L.push("## Now", "memory/state/current.md is missing: rebuild it from the project notes and the newest session note (memory-update).");
  }
  const pr = c.inFlight.slice(0, keep.projects);
  L.push(`Projects in flight (${pr.length}${pr.length < c.inFlight.length ? ` of ${c.inFlight.length}` : ""}${c.projects.length ? `; ${c.projects.length} project notes in all` : ""}):`);
  if (pr.length) pr.forEach((p) => L.push(`- ${projectLine(p)}`)); else L.push("- none");
  L.push("");
  const oi = c.openItems.slice(0, keep.open);
  L.push(`## Open items by owner (${oi.length}${oi.length < c.openItems.length ? ` of ${c.openItems.length}` : ""})`);
  if (oi.length) oi.forEach((o) => L.push(`- ${o.owner} · [[${o.note.name}]] · ${oneLine(o.summary, 160)}`)); else L.push("- none");
  L.push("");
  const ln = c.lessons.slice(0, Math.min(5, keep.lessons));
  L.push(`## Newest lessons (${ln.length} of ${c.lessons.length})`);
  if (ln.length) ln.forEach((n) => L.push(`- ${dateOf(n.fm.created) || "?"} · [[${n.name}]] · ${oneLine(str(n.fm.summary) || n.title, 170)}`)); else L.push("- none yet");
  L.push("");
  L.push("## Harness");
  L.push(`${c.decisions.length} decisions · ${c.lessons.length} lessons · ${c.references.length} references · roadmap: ${c.roadmap ? `${c.roadmapOpen} open items in [[roadmap]]` : "no memory/state/roadmap.md"}`);
  L.push("Lane maps: " + c.maps.map((m) => `${m.lane} \`${m.rel}\`${m.exists ? "" : " (missing)"}`).join(" · "));
  if (c.env.length) { L.push("", "## Environment (from the doctor's last report)"); c.env.forEach((e) => L.push(`- ${e}`)); }
  return L.join("\n") + "\n";
}

function hotFile(c, created, generatedAt, by) {
  const keep = { lessons: 5, open: c.openItems.length, projects: c.inFlight.length };
  const render = () => {
    const body = hotBody(c, keep);
    return serializeFrontmatter({
      type: "state", created, status: "active", maintained_by: "generated", categories: ["memory"],
      summary: "What every session must know, generated from the vault notes; injected by the SessionStart hook.",
      generated_at: generatedAt, generated_by: by, content_hash: contentHash(body),
    }) + "\n" + body;
  };
  let out = render();
  const over = (s) => lineCount(s) > HOT_MAX_LINES || Buffer.byteLength(s, "utf8") > HOT_MAX_BYTES;
  while (over(out)) {
    if (keep.lessons > 0) keep.lessons--;
    else if (keep.open > 0) keep.open--;
    else if (keep.projects > 0) keep.projects--;
    else break;
    out = render();
  }
  return out;
}

// ---------------------------------------------------------------- INDEX.md

function indexFile(c, created, generatedAt, by) {
  const dup = buildResolver(c.root).duplicateBasenames();
  const notes = c.notes.filter((n) => n.rel !== INDEX_REL && n.rel !== HOT_REL);
  const groups = new Map();
  for (const n of notes) { if (!groups.has(n.folder)) groups.set(n.folder, []); groups.get(n.folder).push(n); }
  const order = [...groups.keys()].sort((a, b) => a.localeCompare(b));
  const L = ["# INDEX", "", GEN_LINE, `${notes.length} notes (HOT and this index are not listed). One line each: \`- [[name]] · type · summary\`. Grep it; never read it whole past 300 lines.`];
  for (const f of order) {
    L.push("", `## ${f}`);
    for (const n of groups.get(f).sort((a, b) => b.rel.localeCompare(a.rel))) {
      const link = dup.has(n.name.toLowerCase()) ? `[[${n.rel.slice(0, -3)}|${n.name}]]` : `[[${n.name}]]`;
      L.push(`- ${link} · ${str(n.fm.type) || "?"} · ${oneLine(str(n.fm.summary) || "(no summary)", 300)}`);
    }
  }
  const body = L.join("\n") + "\n";
  return serializeFrontmatter({
    type: "map", created, status: "active", maintained_by: "generated", categories: ["memory"],
    summary: "One line per note in the vault, grouped by folder, newest first; generated, grep it.",
    generated_at: generatedAt, generated_by: by, content_hash: contentHash(body),
  }) + "\n" + body;
}

// ---------------------------------------------------------------- HOME.md generated block (Hebrew)

export function homeBlockLines(c, today) {
  const S = LABELS;
  const L = [];
  L.push(`### ${S.today}`, `${today}${c.current && str(c.current.fm.as_of) ? ` · ${S.asOf(str(c.current.fm.as_of))} ([[current]])` : ""}`);
  c.nextActions.slice(0, 3).forEach((a, i) => L.push(`${i + 1}. ${oneLine(a, 220)}`));
  if (!c.current) L.push(S.noState);
  L.push("", `### ${S.projects}`);
  if (c.inFlight.length) c.inFlight.slice(0, 10).forEach((p) => L.push(`- ${projectLine(p, 200)}`)); else L.push(`- ${S.none}`);
  L.push("", `### ${S.spend}`);
  const spent = c.projects.filter((p) => p.spend.exists);
  if (spent.length) {
    spent.slice(0, 8).forEach((p) => L.push(`- [[${p.note.name}]] · ${usd(p.spend.usd)} · ${p.spend.calls} calls${p.spend.last ? ` · ${p.spend.last}` : ""}`));
    L.push(`- ${S.total(usd(spent.reduce((s, p) => s + p.spend.usd, 0)))}`);
  } else L.push(`- ${S.noneYet}`);
  L.push("", `### ${S.open}`);
  if (c.openItems.length) {
    c.openItems.slice(0, 15).forEach((o) => L.push(`- ${S.owners[o.owner] || o.owner} · [[${o.note.name}]] · ${oneLine(o.summary, 150)}`));
    if (c.openItems.length > 15) L.push(`- ${S.more(c.openItems.length - 15)}`);
  } else L.push(`- ${S.none}`);
  L.push("", `### ${S.lessons}`);
  if (c.lessons.length) c.lessons.slice(0, 5).forEach((n) => L.push(`- ${dateOf(n.fm.created) || "?"} · [[${n.name}]] · ${oneLine(str(n.fm.summary) || n.title, 150)}`)); else L.push(`- ${S.noneYet}`);
  return L;
}

const HOME_META_RE = /^%% content_hash: ([0-9a-f]+) · generated_at: (\S+) · .*%%$/;

/** Returns { text, found } with the block between the markers replaced. */
export function renderHome(homeText, lines, generatedAt) {
  const t = homeText.replace(/\r\n?/g, "\n");
  const a = t.indexOf(HOME_START); const b = t.indexOf(HOME_END);
  if (a === -1 || b === -1 || b < a) return { text: t, found: false };
  const inner = lines.join("\n");
  const meta = `%% content_hash: ${contentHash(inner)} · generated_at: ${generatedAt} · ${GEN_LINE} %%`;
  return { text: t.slice(0, a) + HOME_START + "\n" + meta + "\n" + inner + "\n" + t.slice(b), found: true };
}

/** The block's lines (without the meta line) and its recorded hash, for the lint. */
export function readHomeBlock(homeText) {
  const t = homeText.replace(/\r\n?/g, "\n");
  const a = t.indexOf(HOME_START); const b = t.indexOf(HOME_END);
  if (a === -1 || b === -1 || b < a) return null;
  const lines = t.slice(a + HOME_START.length, b).split("\n").slice(1, -1);
  const m = HOME_META_RE.exec(lines[0] || "");
  return { hash: m ? m[1] : null, generatedAt: m ? m[2] : null, inner: (m ? lines.slice(1) : lines).join("\n") };
}

// ---------------------------------------------------------------- sessions rotation

function sessionMoves(root) {
  const dir = path.join(root, "memory", "sessions");
  const moves = [];
  const visit = (rel) => {
    let entries = [];
    try { entries = fs.readdirSync(path.join(dir, rel), { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const r = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) { if (!rel) visit(r); continue; }
      const m = /^(\d{4}-\d{2})-\d{2}\.md$/.exec(e.name);
      if (m && rel !== m[1]) moves.push({ from: path.join(dir, r), to: path.join(dir, m[1], e.name) });
    }
  };
  visit("");
  return moves.filter((mv) => !fs.existsSync(mv.to));
}

// ---------------------------------------------------------------- main

export function buildAll(root, { by = "build-hot.mjs", now = new Date(), write = true } = {}) {
  const { date: today, iso } = vaultNow(now);
  const generatedAt = iso.replace(/:\d{2}([+-])/, "$1");
  const moves = sessionMoves(root);
  if (write) for (const mv of moves) { fs.mkdirSync(path.dirname(mv.to), { recursive: true }); fs.renameSync(mv.from, mv.to); }
  const c = collect(root);
  const outputs = [];

  // A generated file is "unchanged" when re-rendering it with its OLD stamp reproduces it exactly.
  const generated = (rel, make) => {
    const abs = path.join(root, rel);
    const old = readText(abs);
    const oldFm = old ? parseFrontmatter(splitFrontmatter(old).fmText) : {};
    const created = dateOf(oldFm.created) || today;
    const same = old !== null && make(created, str(oldFm.generated_at), str(oldFm.generated_by) || by) === old;
    outputs.push({ rel, abs, changed: !same, content: same ? old : make(created, generatedAt, by) });
  };
  generated(HOT_REL, (cr, g, b) => hotFile(c, cr, g, b));
  generated(INDEX_REL, (cr, g, b) => indexFile(c, cr, g, b));

  const homeAbs = path.join(root, HOME_REL);
  const homeText = readText(homeAbs);
  let homeFound = false;
  if (homeText !== null) {
    const lines = homeBlockLines(c, today);
    const prev = readHomeBlock(homeText);
    homeFound = !!prev;
    const keep = prev && prev.generatedAt ? renderHome(homeText, lines, prev.generatedAt) : null;
    if (keep && keep.text === homeText) outputs.push({ rel: HOME_REL, abs: homeAbs, changed: false, content: homeText });
    else if (prev) outputs.push({ rel: HOME_REL, abs: homeAbs, changed: true, content: renderHome(homeText, lines, generatedAt).text });
  }

  if (write) for (const o of outputs) if (o.changed) writeIfChanged(o.abs, o.content);
  return { outputs, moves, homeFound, collected: c };
}

if (isMain(import.meta.url)) {
  const { flags, values } = parseFlags();
  const root = findRoot();
  const dry = flags.has("check") || flags.has("print");
  let res;
  try {
    // Git Bash rewrites "/sync" into a Windows path; keep the last segment and put the slash back.
    const by = String(values.by || "build-hot.mjs").replace(/^.*[\\/]/, "");
    res = buildAll(root, { by: by.includes(".") ? by : "/" + by, now: values.now ? new Date(values.now) : new Date(), write: !dry });
  } catch (e) {
    console.error(`build-hot: failed: ${e.message}`);
    process.exit(2);
  }
  const changed = res.outputs.filter((o) => o.changed).map((o) => o.rel).concat(res.moves.map((m) => path.relative(root, m.from).split(path.sep).join("/") + " (rotate)"));
  const hot = res.outputs.find((o) => o.rel === HOT_REL).content;
  const info = `HOT ${lineCount(hot)} lines, ${Buffer.byteLength(hot, "utf8")} bytes`;
  if (flags.has("print")) {
    process.stdout.write(hot);
    const home = res.outputs.find((o) => o.rel === HOME_REL);
    if (home) { const b = readHomeBlock(home.content); process.stdout.write("\n----- HOME generated block\n" + (b ? b.inner : "(no markers)") + "\n"); }
    const idx = res.outputs.find((o) => o.rel === INDEX_REL);
    process.stdout.write(`\n----- INDEX: ${idx.content.split("\n").filter((l) => l.startsWith("- [[")).length} lines\n`);
  }
  if (!res.homeFound) console.error("build-hot: memory/HOME.md has no generated markers (or is missing); its block was not written");
  if (flags.has("check")) {
    if (changed.length) { console.log(`build-hot --check: would change ${changed.join(", ")}`); process.exit(1); }
    console.log(`build-hot --check: up to date (${info})`);
  } else if (!flags.has("print")) {
    console.log(changed.length ? `build-hot: wrote ${changed.join(", ")} (${info})` : `build-hot: nothing changed (${info})`);
  }
}
