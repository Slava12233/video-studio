#!/usr/bin/env node
// tools/memory/new-note.mjs: creates a vault note from its template with correct frontmatter (contract memory/README.md).
// Prevents the two classic mistakes: a malformed frontmatter and a note in the wrong folder.
//   node tools/memory/new-note.mjs project <project-folder-name> --summary "..." [--kind photo-film] [--brand _default] [--resolution landscape]
//   node tools/memory/new-note.mjs lesson <slug> --category <rendering|composition|fal|hebrew-rtl|workflow|tooling|harness|operator> --summary "..."
//   node tools/memory/new-note.mjs decision <slug> --summary "..."
//   node tools/memory/new-note.mjs open <slug> --summary "..." [--owner slava|harness]
//   node tools/memory/new-note.mjs reference <slug> --summary "..." [--url https://...]
//   node tools/memory/new-note.mjs session [--date YYYY-MM-DD]
// Options: --title "..." (default: the slug, words), --date YYYY-MM-DD (default today), --print (also print the note),
//          --body-file <file> (text appended under the first heading). Never overwrites an existing note; prints the path.
import fs from "node:fs";
import path from "node:path";
import { findRoot, parseFlags, readText, vaultNow, setFrontmatterKey, splitFrontmatter, parseFrontmatter, str, isMain } from "./lib.mjs";

export const LESSON_CATEGORIES = ["rendering", "composition", "fal", "hebrew-rtl", "workflow", "tooling", "harness", "operator"];
const TYPES = {
  project: { template: "project.md", dir: () => "memory/projects", file: (slug) => `${slug}.md` },
  lesson: { template: "lesson.md", dir: (o) => `memory/lessons/${o.category}`, file: (slug, date) => `${date}-${slug}.md` },
  decision: { template: "decision.md", dir: () => "memory/decisions", file: (slug, date) => `${date}-${slug}.md` },
  open: { template: "open.md", dir: () => "memory/open", file: (slug, date) => `${date}-${slug}.md` },
  reference: { template: "reference.md", dir: () => "memory/references", file: (slug) => `${slug}.md` },
  session: { template: "session.md", dir: (o, date) => `memory/sessions/${date.slice(0, 7)}`, file: (slug, date) => `${date}.md` },
};

export const slugify = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "note";
const titleOf = (slug) => slug.replace(/^\d{4}-\d{2}-\d{2}-/, "").split("-").filter(Boolean).map((w, i) => (i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");

/** Creates the note; returns { rel, abs, text }. Throws on a bad type, a missing category or an existing file. */
export function createNote(root, type, slugIn, opts = {}) {
  const spec = TYPES[type];
  if (!spec) throw new Error(`unknown type "${type}". One of: ${Object.keys(TYPES).join(", ")}`);
  const date = opts.date || vaultNow().date;
  if (type === "lesson" && !LESSON_CATEGORIES.includes(String(opts.category))) throw new Error(`lesson needs --category <${LESSON_CATEGORIES.join("|")}>`);
  const slug = type === "session" ? date : type === "project" ? String(slugIn || "").trim() : slugify(slugIn || "");
  if (!slug) throw new Error("a slug is required");
  const relDir = spec.dir(opts, date);
  const rel = `${relDir}/${spec.file(slug, date)}`;
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) throw new Error(`already exists: ${rel}`);
  const tpl = readText(path.join(root, "memory", "templates", spec.template));
  if (tpl === null) throw new Error(`template missing: memory/templates/${spec.template}`);
  const title = opts.title || (type === "session" ? date : type === "project" ? slug : titleOf(slug));
  let text = tpl.replace(/\{\{date\}\}/g, date).replace(/\{\{title\}\}/g, title);
  const summary = str(opts.summary) || (type === "session" ? `Session ${date}.` : "");
  if (summary) text = setFrontmatterKey(text, "summary", summary);
  const fm = parseFrontmatter(splitFrontmatter(text).fmText);
  const cats = Array.isArray(fm.categories) ? [...fm.categories] : [];
  if (type === "lesson" && !cats.includes(opts.category)) cats.push(opts.category);
  if (cats.length) text = setFrontmatterKey(text, "categories", cats);
  for (const k of ["kind", "brand", "resolution", "owner", "url", "folder", "applies_to"]) if (opts[k] !== undefined && opts[k] !== "") text = setFrontmatterKey(text, k, opts[k]);
  if (type === "project" && !opts.folder) text = setFrontmatterKey(text, "folder", `projects/${slug}`);
  if (opts.body) text = text.replace(/\n*$/, "\n\n") + String(opts.body).trim() + "\n";
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text, "utf8");
  return { rel, abs, text };
}

if (isMain(import.meta.url)) {
  const { flags, values, positional } = parseFlags();
  const [type, slug] = positional;
  if (!type || flags.has("help")) {
    console.error("usage: node tools/memory/new-note.mjs <project|lesson|decision|open|reference|session> <slug> --summary \"...\" [--category c] [--owner slava|harness] [--kind k] [--title t] [--date YYYY-MM-DD]");
    process.exit(2);
  }
  try {
    const body = values["body-file"] ? readText(path.resolve(values["body-file"])) : undefined;
    const out = createNote(findRoot(), type, slug, { ...values, body });
    console.log(out.rel);
    if (flags.has("print")) process.stdout.write(out.text);
  } catch (e) { console.error(`new-note: ${e.message}`); process.exit(1); }
}
