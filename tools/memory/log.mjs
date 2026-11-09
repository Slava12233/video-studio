#!/usr/bin/env node
// tools/memory/log.mjs: the append-only write path of the vault (contract memory/README.md): one dated line into
// today's session note, or into a project note's ## Log with its frontmatter kept true.
//   node tools/memory/log.mjs session "<what was asked / done / decided / left open>"
//   node tools/memory/log.mjs project <project-folder-name> "<what changed>" [--status brief|planning|media|build|review|delivered|archived]
//        [--next "<the next step>"] [--deliverable <path>]
// The project line also recomputes spend_usd from projects/<name>/ai-ledger.jsonl (with as_of and source) and sets
// updated. Creates today's session note from the template when missing. Names and paths only; the text passes the
// secrets scrubber before it is written. Exit 0 on success, 1 on an error. Exports logSession / logProject for the tools.
import fs from "node:fs";
import path from "node:path";
import { findRoot, parseFlags, readText, vaultNow, setFrontmatterKey, appendUnderSection, scrubSecrets, envExampleNames, projectSpend, str, isMain } from "./lib.mjs";
import { createNote } from "./new-note.mjs";

const clean = (root, s) => scrubSecrets(String(s).replace(/\s+/g, " ").trim(), { envNames: envExampleNames(root) });

/** Appends `- HH:MM — text` to today's session note (created from the template when missing). Returns the rel path. */
export function logSession(root, text, { now = new Date() } = {}) {
  const { date, time } = vaultNow(now);
  const rel = `memory/sessions/${date.slice(0, 7)}/${date}.md`;
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) createNote(root, "session", null, { date });
  let note = readText(abs);
  const line = `- ${time} — ${clean(root, text)}`;
  // The session body: dated bullets live between the heading and the first "## " section (Checkpoint / Close).
  const close = /^## (Checkpoint|Close)\b.*$/m.exec(note);
  if (close) {
    const before = note.slice(0, close.index).replace(/\n*$/, "\n");
    const emptyBullet = /\n- \n$/.test(before) ? before.replace(/\n- \n$/, "\n") : before;
    note = `${emptyBullet}${line}\n\n${note.slice(close.index)}`;
  } else note = `${note.replace(/\n- \n*$/, "\n").replace(/\n*$/, "\n")}${line}\n`;
  note = setFrontmatterKey(note, "updated", date);
  fs.writeFileSync(abs, note, "utf8");
  return rel;
}

/** Appends a dated line to the project note's ## Log and keeps its frontmatter true (status, next, deliverable, spend). */
export function logProject(root, name, text, { status, next, deliverable, now = new Date() } = {}) {
  const rel = `memory/projects/${name}.md`;
  const abs = path.join(root, rel);
  if (!fs.existsSync(abs)) throw new Error(`no project note ${rel} (create it: node tools/memory/new-note.mjs project ${name} --summary "...")`);
  const { date, time } = vaultNow(now);
  let note = readText(abs);
  const line = `- ${date} ${time} — ${clean(root, text)}${status ? ` (status: ${status})` : ""}`;
  note = appendUnderSection(note, /^log$/i, "## Log", line);
  if (status) note = setFrontmatterKey(note, "status", status);
  if (next !== undefined) note = setFrontmatterKey(note, "next", clean(root, next));
  if (deliverable) note = setFrontmatterKey(note, "deliverable", String(deliverable).split(path.sep).join("/"));
  const spend = projectSpend(root, name);
  if (spend.exists) {
    note = setFrontmatterKey(note, "spend_usd", spend.usd);
    note = setFrontmatterKey(note, "as_of", `${date}T${time}`);
    note = setFrontmatterKey(note, "source", "ai-ledger.jsonl");
  }
  note = setFrontmatterKey(note, "updated", date);
  fs.writeFileSync(abs, note, "utf8");
  return rel;
}

if (isMain(import.meta.url)) {
  const { values, positional } = parseFlags();
  const root = findRoot();
  try {
    if (positional[0] === "session" && positional[1]) console.log(logSession(root, positional.slice(1).join(" ")));
    else if (positional[0] === "project" && positional[1] && positional[2]) console.log(logProject(root, positional[1], positional.slice(2).join(" "), { status: str(values.status) || undefined, next: values.next, deliverable: values.deliverable }));
    else { console.error('usage: node tools/memory/log.mjs session "<text>" | project <name> "<text>" [--status s] [--next "..."] [--deliverable <path>]'); process.exit(2); }
  } catch (e) { console.error(`log: ${e.message}`); process.exit(1); }
}
