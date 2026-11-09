#!/usr/bin/env node
// tools/memory/lint.mjs: the vault lint of contract memory/README.md. Node 20+, no dependencies.
// Scope: every markdown note under memory/ (memory/templates/ skipped). Links resolve against every file of the
// vault outside the excluded folders (lib.mjs EXCLUDED_DIRS), the way Obsidian resolves them.
// FAIL: a token shape (fal key, sk-, gh*, EAA), an email outside the allow-list, a phone number, or an .env name
//   written with a value; a wikilink to a note that does not exist (WARN inside memory/archive/; links inside code
//   spans and fences are examples and are skipped);
//   a note over 300 lines (INDEX.md excepted); HOT.md over 60 lines or 8,192 bytes; HOME.md over 150 lines;
//   a generated note (or HOME's generated block) whose hash does not match; a lesson or decision edited after its
//   day (updated later than created) without status superseded; a note without type, created or summary.
// WARN: a figure (a $ amount or a percentage) in a state or project note without as_of; inbox/proposals.md holding
//   a line older than 7 days; a project note whose folder is missing (and not archived); a lesson whose promoted_to
//   path does not exist; a session note outside its month folder; the Hebrew inbox holding unanswered lines older
//   than 7 days.
// Usage: node tools/memory/lint.mjs [--fix-frontmatter-updated] [--root <dir>]
// Prints `FAIL|WARN path: reason` (never the matched secret), then a count. Exit 1 on a FAIL.
import fs from "node:fs";
import path from "node:path";
import {
  findRoot, parseFlags, loadNotes, buildResolver, extractWikilinks, scanSecrets, envExampleNames, ALLOWED_EMAILS, contentHash,
  lineCount, vaultNow, dateOf, daysBetween, str, setFrontmatterKey, isMain, getSection, getBullets,
} from "./lib.mjs";
import { readHomeBlock, HOT_REL, HOME_REL, INDEX_REL, HOT_MAX_LINES, HOT_MAX_BYTES } from "./build-hot.mjs";

export const NOTE_MAX = 300;
export const HOME_MAX = 150;
const FIGURE_RE = /\$\s?\d|\d[\d,.]*\s?(?:USD|ILS|₪)(?![A-Za-z])|\d+(?:\.\d+)?\s?%/;
const FACT_TYPES = new Set(["state", "project"]);
const REQUIRED = ["type", "created", "summary"];
const stripFences = (body) => body.replace(/^\s*(```|~~~)[\s\S]*?^\s*\1.*$/gm, "");

export function lint(root, { today = null, fixUpdated = false } = {}) {
  if (!today) today = vaultNow().date;
  const findings = [];
  const add = (level, rel, reason) => findings.push({ level, rel, reason });
  const notes = loadNotes(root);
  const resolver = buildResolver(root);
  const envNames = envExampleNames(root);
  const fixed = [];

  for (const n of notes) {
    const fm = n.fm;
    const type = str(fm.type);
    const status = str(fm.status).toLowerCase();
    const generated = str(fm.maintained_by) === "generated";
    const archived = n.rel.startsWith("memory/archive/");

    for (const h of scanSecrets(n.text, { envNames, allowed: ALLOWED_EMAILS })) {
      add("FAIL", n.rel, `line ${h.line}: ${h.kind === "env-value" ? `.env name ${h.name} written with a value` : `${h.kind} shape`}`);
    }

    if (!n.hasFm) add("FAIL", n.rel, "no frontmatter (type, created, summary required)");
    else for (const k of REQUIRED) if (!str(fm[k])) add("FAIL", n.rel, `frontmatter without ${k}`);

    const lines = lineCount(n.text);
    if (n.rel === HOT_REL) {
      const bytes = Buffer.byteLength(n.text, "utf8");
      if (lines > HOT_MAX_LINES || bytes > HOT_MAX_BYTES) add("FAIL", n.rel, `over its cap: ${lines} lines, ${bytes} bytes (max ${HOT_MAX_LINES} lines, ${HOT_MAX_BYTES} bytes)`);
    } else if (n.rel === HOME_REL) {
      if (lines > HOME_MAX) add("FAIL", n.rel, `${lines} lines, over the ${HOME_MAX}-line cap (/consolidate)`);
    } else if (n.rel !== INDEX_REL && lines > NOTE_MAX) {
      add("FAIL", n.rel, `${lines} lines, over the ${NOTE_MAX}-line cap: split into linked notes`);
    }

    if (generated) {
      if (!str(fm.content_hash)) add("FAIL", n.rel, "generated note without content_hash");
      else if (contentHash(n.body) !== str(fm.content_hash)) add("FAIL", n.rel, "hand-edited generated note (content_hash does not match): rerun its generator");
    }
    if (n.rel === HOME_REL) {
      const b = readHomeBlock(n.text);
      if (!b) add("WARN", n.rel, "no %% generated:start %% / %% generated:end %% markers");
      else if (b.hash && contentHash(b.inner) !== b.hash) add("FAIL", n.rel, "hand-edited generated block (hash does not match): rerun build-hot.mjs");
      else if (!b.hash) add("WARN", n.rel, "generated block not built yet: run build-hot.mjs");
    }

    if ((type === "lesson" || type === "decision") && status !== "superseded" && !archived) {
      const c = dateOf(fm.created); const u = dateOf(fm.updated);
      if (c && u && u > c) add("FAIL", n.rel, `${type} edited after its day (created ${c}, updated ${u}) without status superseded: write a superseding note`);
    }

    for (const l of extractWikilinks(n.text)) {
      if (l.inInlineCode || l.inFence || !l.target) continue; // code spans and fences hold examples, not links
      if (resolver.resolve(l.target)) continue;
      add(archived ? "WARN" : "FAIL", n.rel, `line ${l.line}: dead link ${l.raw}${archived ? " (in archive)" : ""}`);
    }

    if (FACT_TYPES.has(type) && !generated && !str(fm.as_of) && FIGURE_RE.test(stripFences(n.body))) {
      add("WARN", n.rel, "a figure without as_of in the frontmatter");
    }

    if (type === "project" && !archived && !/^(archived|cancelled)$/.test(status)) {
      const folder = str(fm.folder) || `projects/${n.name}`;
      if (!fs.existsSync(path.join(root, folder))) add("WARN", n.rel, `project folder ${folder} does not exist (archived? set status: archived and move the note)`);
    }

    if (type === "lesson" && str(fm.promoted_to)) {
      const target = str(fm.promoted_to).replace(/#.*$/, "");
      if (!fs.existsSync(path.join(root, target))) add("WARN", n.rel, `promoted_to ${target} does not exist`);
    }

    const sm = /^memory\/sessions\/(?:(.+)\/)?(\d{4}-\d{2})-\d{2}\.md$/.exec(n.rel);
    if (sm && sm[1] !== sm[2]) add("WARN", n.rel, `session note outside its month folder memory/sessions/${sm[2]}/ (build-hot.mjs rotates it)`);

    if (n.rel === "memory/inbox/proposals.md") {
      const dates = [...n.body.matchAll(/^\s*-\s+(\d{4}-\d{2}-\d{2})/gm)].map((m) => m[1]).sort();
      if (dates.length && daysBetween(dates[0], today) > 7) add("WARN", n.rel, `holds a proposal from ${dates[0]}, older than 7 days: merge it at /sync`);
    }
    if (n.rel === "memory/inbox/owner.md") {
      const open = getBullets(getSection(n.body, /^(פתוח|open)$/i)).filter((b) => !b.startsWith("↳"));
      if (open.length) add("WARN", n.rel, `${open.length} open line(s) from Slava waiting for an answer (memory-update: answer under each line)`);
    }

    if (fixUpdated && n.hasFm && !generated) {
      let text = n.text; let to = null;
      if (!str(fm.updated) && dateOf(fm.created)) to = dateOf(fm.created);
      const harnessy = /^(harness|agent:.+)$/.test(str(fm.maintained_by));
      if (harnessy && type !== "lesson" && type !== "decision" && n.mtime) {
        const m = vaultNow(n.mtime).date;
        const cur = to || dateOf(fm.updated);
        if (!cur || m > cur) to = m;
      }
      if (to && to !== dateOf(fm.updated)) {
        text = setFrontmatterKey(text, "updated", to);
        fs.writeFileSync(n.abs, text, "utf8");
        fixed.push(`${n.rel}: updated -> ${to}`);
      }
    }
  }
  return { findings, fixed, count: notes.length };
}

if (isMain(import.meta.url)) {
  const { flags } = parseFlags();
  const root = findRoot();
  const { findings, fixed, count } = lint(root, { fixUpdated: flags.has("fix-frontmatter-updated") });
  for (const f of fixed) console.log(`FIXED ${f}`);
  const order = { FAIL: 0, WARN: 1 };
  findings.sort((a, b) => order[a.level] - order[b.level] || a.rel.localeCompare(b.rel));
  for (const f of findings) console.log(`${f.level} ${f.rel}: ${f.reason}`);
  const fails = findings.filter((f) => f.level === "FAIL").length;
  console.log(`lint: ${count} notes, ${fails} FAIL, ${findings.length - fails} WARN`);
  process.exit(fails ? 1 : 0);
}
