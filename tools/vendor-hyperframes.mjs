#!/usr/bin/env node
// tools/vendor-hyperframes.mjs: vendors the pinned HyperFrames plugin release into this repo as a Claude Code
// skills-directory plugin: .claude/skills/hyperframes-plugin/ (.claude-plugin/plugin.json + skills/). Claude Code
// loads such a folder in place as `hf@skills-dir` (docs: code.claude.com/docs/en/plugins/loading), so the
// HyperFrames skills live at project level, typed /hf:<skill>, pinned by the repo, independent of what
// ~/.claude/plugins holds. The marketplace copy (hyperframes@hyperframes) should be off in .claude/settings.json so
// the same skills are not offered twice; that line is Slava's to change.
//
//   node tools/vendor-hyperframes.mjs                  copy from the plugin installed under ~/.claude/plugins
//   node tools/vendor-hyperframes.mjs --from <dir>     copy from a plugin root (a cache version dir or a checkout)
//   node tools/vendor-hyperframes.mjs --check          verify the vendored copy against its VENDORED.json (exit 1 on drift)
//   node tools/vendor-hyperframes.mjs --dry            print what would be copied, write nothing
//   node tools/vendor-hyperframes.mjs --json           machine-readable result
//
// Payload (mirrors the upstream release package): .claude-plugin/plugin.json, plugin.json, LICENSE,
// skills-manifest.json and skills/ verbatim (text files normalised to LF, binaries byte for byte). VENDORED.json
// records the source, the version, the commit and a sha256 per skill. Re-vendoring (an upgrade) is Slava's call
// (CLAUDE.md "Never"); the tool refuses to overwrite a folder that is not a vendored copy.
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { STUDIO_ROOT, isMainModule } from "./lib/studio.mjs";
import { VENDORED_PLUGIN_DIR, findPlugin } from "./hf.mjs";

export const VENDORED_JSON = "VENDORED.json";
/**
 * The manifest name Claude Code sees, hence the skill prefix (/hf:hyperframes-core). Not "hyperframes": Claude
 * Code's name-conflict rule compares manifest names against INSTALLED marketplace plugins, and on a machine where
 * hyperframes@hyperframes is installed (even when it is disabled for this project) a same-named skills-dir copy is
 * reported "Not loaded ... already taken by an installed plugin" (verified with `claude --debug`, 2026-11-09). The
 * upstream portable plugin.json keeps "hyperframes" because its plugin-cli.mjs insists on that name.
 */
export const PLUGIN_NAME = "hf";
export const PAYLOAD_FILES = [".claude-plugin/plugin.json", "plugin.json", "LICENSE", "skills-manifest.json"];
const SKIP_DIRS = new Set(["node_modules", ".git"]);

const rel = (p) => p.split(path.sep).join("/");
const sha256 = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const isBinary = (buf) => buf.subarray(0, 8000).includes(0);
/** File bytes as they are stored and hashed: LF for text, untouched for binaries. */
function normalize(buf) {
  if (isBinary(buf)) return buf;
  const s = buf.toString("utf8");
  return s.includes("\r") ? Buffer.from(s.replace(/\r\n?/g, "\n"), "utf8") : buf;
}
function readNormalized(file) { return normalize(fs.readFileSync(file)); }

function walk(dir, base = dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    if (e.isDirectory()) { if (!SKIP_DIRS.has(e.name)) walk(path.join(dir, e.name), base, out); }
    else if (e.isFile()) out.push(rel(path.relative(base, path.join(dir, e.name))));
  }
  return out;
}

/** sha256 over the sorted (path, sha256 of normalised bytes) list of a directory. */
function hashDir(dir) {
  const files = walk(dir);
  const lines = files.map((f) => `${f}\0${sha256(readNormalized(path.join(dir, f)))}`);
  return { files: files.length, bytes: files.reduce((n, f) => n + readNormalized(path.join(dir, f)).length, 0), sha256: sha256(lines.join("\n")) };
}

/**
 * Files under `dir` that git would ignore (the repo's *.mp3 rule, a nested upstream .gitignore...), with the
 * source file of the winning pattern. Empty when git is not available. Negation matches are not ignores.
 */
function gitIgnored(root, dir) {
  const files = walk(dir).map((f) => rel(path.relative(root, path.join(dir, f))));
  if (!files.length) return [];
  const r = spawnSync("git", ["check-ignore", "-v", "--no-index", "--stdin"], { cwd: root, input: files.join("\n"), encoding: "utf8", windowsHide: true });
  if (r.status !== 0 && r.status !== 1) return [];
  return (r.stdout || "").split(/\r?\n/).filter(Boolean).map((line) => {
    const m = line.match(/^(.*?):(\d+):(.*?)\t(.*)$/);
    if (!m || m[3].startsWith("!")) return null;
    return { file: path.join(root, m[4]), source: m[1] ? path.resolve(root, m[1]) : null, pattern: m[3] };
  }).filter(Boolean);
}

const SHIM_HEADER = "# Written by tools/vendor-hyperframes.mjs: the vendored release travels whole, so files the repo's ignore rules would drop are re-included here.";

/**
 * Re-include every vendored file git would ignore. A rule from outside the vendored folder (the repo's .gitignore)
 * is undone by an anchored negation in <vendored>/.gitignore; a rule from an upstream .gitignore inside the folder
 * is undone by a .gitignore next to the file (a deeper file wins in git). Returns the shim files written.
 */
function writeGitignoreShims(root, dest) {
  const ignored = gitIgnored(root, dest);
  const rootLines = new Set();
  const dirShims = new Map();
  const destKey = path.resolve(dest).toLowerCase() + path.sep;
  for (const e of ignored) {
    const inside = e.source && e.source.toLowerCase().startsWith(destKey);
    if (inside) {
      const d = path.dirname(e.file);
      if (!dirShims.has(d)) dirShims.set(d, new Set());
      dirShims.get(d).add(path.basename(e.file));
    } else rootLines.add(`!/${rel(path.relative(dest, e.file))}`);
  }
  const written = [];
  if (rootLines.size) {
    const f = path.join(dest, ".gitignore");
    fs.writeFileSync(f, `${SHIM_HEADER}\n${[...rootLines].sort().join("\n")}\n`, "utf8");
    written.push(rel(path.relative(dest, f)));
  }
  for (const [d, names] of dirShims) {
    const f = path.join(d, ".gitignore");
    const body = `${SHIM_HEADER}\n${[...names].sort().map((n) => `!${n}`).join("\n")}\n`;
    if (fs.existsSync(f)) fs.appendFileSync(f, `\n${body}`, "utf8"); else fs.writeFileSync(f, body, "utf8");
    written.push(rel(path.relative(dest, f)));
  }
  return { shims: written.sort(), reIncluded: ignored.length };
}

function readJson(file) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; } }
function manifestOf(root) { return readJson(path.join(root, ".claude-plugin", "plugin.json")) || readJson(path.join(root, "plugin.json")); }

/** The install record of a cache directory (version, commit) from ~/.claude/plugins/installed_plugins.json. */
function installRecord(root) {
  const reg = readJson(path.join(os.homedir(), ".claude", "plugins", "installed_plugins.json"));
  const want = path.resolve(root).toLowerCase();
  for (const entries of Object.values(reg?.plugins || {})) {
    for (const e of Array.isArray(entries) ? entries : [entries]) {
      if (e?.installPath && path.resolve(e.installPath).toLowerCase() === want) return { version: e.version || null, gitCommitSha: e.gitCommitSha || null, installedAt: e.installedAt || null };
    }
  }
  return null;
}

export function readVendored(root = STUDIO_ROOT) {
  return readJson(path.join(root, rel(path.relative(root, VENDORED_PLUGIN_DIR)), VENDORED_JSON));
}

/** Plan a vendoring from `from`: the skills, the payload files and the manifest. Throws when `from` is not a release. */
export function plan(from) {
  const src = path.resolve(from);
  const manifest = manifestOf(src);
  if (!manifest || manifest.name !== "hyperframes" || !/^\d+\.\d+\.\d+/.test(String(manifest.version || ""))) {
    throw new Error(`${src} is not a HyperFrames plugin release (no .claude-plugin/plugin.json with name "hyperframes" and a version)`);
  }
  const skillsDir = path.join(src, "skills");
  const skills = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory() && fs.existsSync(path.join(skillsDir, e.name, "SKILL.md"))).map((e) => e.name).sort()
    : [];
  if (!skills.length) throw new Error(`${src}/skills has no <name>/SKILL.md folders`);
  const payload = PAYLOAD_FILES.filter((f) => fs.existsSync(path.join(src, f)));
  if (!payload.includes(".claude-plugin/plugin.json")) throw new Error(`${src}/.claude-plugin/plugin.json is missing (Claude Code needs it)`);
  return { src, manifest, skills, payload, record: installRecord(src) };
}

/** Copy the release at `from` into the vendored folder. Returns the VENDORED.json content. */
export function vendor(from, { root = STUDIO_ROOT, dry = false, log = () => {} } = {}) {
  const p = plan(from);
  const dest = VENDORED_PLUGIN_DIR;
  const destRel = rel(path.relative(root, dest));
  if (fs.existsSync(dest) && !fs.existsSync(path.join(dest, VENDORED_JSON))) {
    throw new Error(`${destRel} exists but has no ${VENDORED_JSON}: not a vendored copy, refusing to overwrite it`);
  }
  log(`source  ${p.src} (v${p.manifest.version}${p.record?.gitCommitSha ? `, commit ${p.record.gitCommitSha.slice(0, 12)}` : ""})`);
  log(`target  ${destRel}`);
  log(`skills  ${p.skills.length}: ${p.skills.join(", ")}`);
  log(`files   ${p.payload.join(", ")} + skills/ (text normalised to LF), then .gitignore shims where the repo's rules would drop a file`);
  if (dry) return null;

  // A re-vendor drops the old skills/ first, so files the new release removed do not linger.
  const skillsDest = path.join(dest, "skills");
  if (fs.existsSync(skillsDest)) fs.rmSync(skillsDest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });
  let files = 0, bytes = 0;
  const copy = (srcFile, dstFile) => {
    fs.mkdirSync(path.dirname(dstFile), { recursive: true });
    const buf = readNormalized(srcFile);
    fs.writeFileSync(dstFile, buf);
    files += 1; bytes += buf.length;
  };
  for (const f of p.payload) copy(path.join(p.src, f), path.join(dest, f));
  // Claude Code's manifest gets the repo's plugin name (see PLUGIN_NAME); everything else in it stays upstream's.
  const cmPath = path.join(dest, ".claude-plugin", "plugin.json");
  const cm = JSON.parse(fs.readFileSync(cmPath, "utf8"));
  cm.name = PLUGIN_NAME;
  cm.description = `${cm.description || "HyperFrames by HeyGen."} Release ${p.manifest.version} of the hyperframes plugin, vendored and pinned by this repo (tools/vendor-hyperframes.mjs); skills are typed /${PLUGIN_NAME}:<skill>.`;
  fs.writeFileSync(cmPath, JSON.stringify(cm, null, 2) + "\n", "utf8");
  // Only the <name>/ folders that hold a SKILL.md travel; stray files at skills/ root (upstream tests) do not.
  for (const s of p.skills) {
    const srcSkill = path.join(p.src, "skills", s);
    for (const f of walk(srcSkill)) copy(path.join(srcSkill, f), path.join(skillsDest, s, f));
  }

  // Git-ignore shims first, so the hashes below cover them.
  const shim = writeGitignoreShims(root, dest);
  if (shim.reIncluded) log(`git     ${shim.reIncluded} files were git-ignored; re-included through ${shim.shims.join(", ")}`);
  const skills = Object.fromEntries(p.skills.map((s) => [s, hashDir(path.join(skillsDest, s))]));
  const payloadFiles = [...p.payload, ...(fs.existsSync(path.join(dest, ".gitignore")) ? [".gitignore"] : [])];
  const payload = Object.fromEntries(payloadFiles.map((f) => [f, sha256(readNormalized(path.join(dest, f)))]));
  const vendored = {
    name: p.manifest.name,
    manifestName: PLUGIN_NAME,
    skillsTypedAs: `/${PLUGIN_NAME}:<skill>`,
    version: p.manifest.version,
    license: p.manifest.license || "Apache-2.0",
    repository: p.manifest.repository || "https://github.com/heygen-com/hyperframes",
    source: { from: p.src, marketplaceEntry: "hyperframes@hyperframes", gitCommitSha: p.record?.gitCommitSha || null, installedAt: p.record?.installedAt || null },
    vendoredAt: new Date().toISOString(),
    by: "tools/vendor-hyperframes.mjs",
    loadsAs: `${PLUGIN_NAME}@skills-dir (a plugin folder under .claude/skills/, loaded in place; .claude-plugin/plugin.json renamed from "hyperframes" because an installed hyperframes@hyperframes would shadow a same-named copy)`,
    normalisation: "text files LF, binaries verbatim; every sha256 below is computed on the stored bytes",
    gitignoreShims: shim.shims,
    files, bytes,
    payload,
    skills,
    sha256: sha256([...Object.entries(payload), ...Object.entries(skills).map(([k, v]) => [k, v.sha256])].map(([k, v]) => `${k}\0${v}`).join("\n")),
  };
  fs.writeFileSync(path.join(dest, VENDORED_JSON), JSON.stringify(vendored, null, 2) + "\n", "utf8");
  log(`written ${files} files, ${(bytes / 1024 / 1024).toFixed(1)} MB, ${VENDORED_JSON} with ${p.skills.length} skill hashes`);
  return vendored;
}

/** Verify the vendored copy against VENDORED.json and compare with the plugin installed under ~/.claude/plugins. */
export function verifyVendored(root = STUDIO_ROOT) {
  const dest = VENDORED_PLUGIN_DIR;
  const destRel = rel(path.relative(root, dest));
  const problems = [];
  const v = readVendored(root);
  if (!v) return { ok: false, present: false, version: null, skills: 0, files: 0, problems: [`${destRel}/${VENDORED_JSON} missing: run node tools/vendor-hyperframes.mjs`], cache: cacheInfo() };
  const manifest = manifestOf(dest);
  if (!manifest) problems.push(`${destRel}/.claude-plugin/plugin.json missing`);
  else {
    if (manifest.version !== v.version) problems.push(`manifest version ${manifest.version} differs from ${VENDORED_JSON} ${v.version}`);
    if (manifest.name !== PLUGIN_NAME) problems.push(`manifest name "${manifest.name}" is not "${PLUGIN_NAME}": an installed hyperframes@hyperframes would shadow this copy`);
  }
  for (const [f, h] of Object.entries(v.payload || {})) {
    const file = path.join(dest, f);
    if (!fs.existsSync(file)) problems.push(`${f} missing`);
    else if (sha256(readNormalized(file)) !== h) problems.push(`${f} changed`);
  }
  const skillsDir = path.join(dest, "skills");
  const onDisk = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : [];
  let files = 0;
  for (const [s, rec] of Object.entries(v.skills || {})) {
    const dir = path.join(skillsDir, s);
    if (!fs.existsSync(dir)) { problems.push(`skills/${s} missing`); continue; }
    const h = hashDir(dir);
    files += h.files;
    if (h.sha256 !== rec.sha256) problems.push(`skills/${s} changed (${h.files} files on disk, ${rec.files} vendored)`);
  }
  for (const s of onDisk) if (!v.skills?.[s]) problems.push(`skills/${s} is not in ${VENDORED_JSON} (hand-added?)`);
  const ignored = gitIgnored(root, dest);
  if (ignored.length) problems.push(`${ignored.length} vendored files are git-ignored (${rel(path.relative(dest, ignored[0].file))}${ignored.length > 1 ? ", ..." : ""}): rerun node tools/vendor-hyperframes.mjs`);
  return { ok: problems.length === 0, present: true, version: v.version, skills: Object.keys(v.skills || {}).length, files, vendoredAt: v.vendoredAt, commit: v.source?.gitCommitSha || null, problems, cache: cacheInfo() };
}

/** What ~/.claude/plugins holds, for the "newer release available" line. */
function cacheInfo() {
  const p = findPlugin({ vendored: false });
  return p ? { version: p.version, root: p.root } : null;
}

function parse(argv) {
  const flags = { check: false, dry: false, json: false, from: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--check") flags.check = true;
    else if (a === "--dry") flags.dry = true;
    else if (a === "--json") flags.json = true;
    else if (a === "--from") flags.from = argv[++i];
    else if (a.startsWith("--from=")) flags.from = a.slice(7);
    else throw new Error(`unknown argument ${a}`);
  }
  return flags;
}

if (isMainModule(import.meta.url)) {
  try {
    const flags = parse(process.argv.slice(2));
    if (flags.check) {
      const r = verifyVendored();
      if (flags.json) console.log(JSON.stringify(r, null, 2));
      else {
        console.log(r.present ? `vendored HyperFrames v${r.version} as ${PLUGIN_NAME}@skills-dir (/${PLUGIN_NAME}:<skill>): ${r.skills} skills, ${r.files} files, ${r.ok ? "matches" : "DRIFT from"} ${VENDORED_JSON}` : "no vendored HyperFrames plugin");
        for (const p of r.problems) console.log(`  - ${p}`);
        console.log(r.cache ? `plugin cache: v${r.cache.version}${r.present && r.cache.version === r.version ? " (same release)" : r.present ? " (differs: a re-vendor is Slava's decision)" : ""}` : "plugin cache: none under ~/.claude/plugins");
      }
      process.exit(r.ok ? 0 : 1);
    }
    const from = flags.from || findPlugin({ vendored: false })?.root;
    if (!from) throw new Error("no source: install the plugin (claude plugin install hyperframes@hyperframes) or pass --from <dir>");
    const v = vendor(from, { dry: flags.dry, log: flags.json ? () => {} : (l) => console.log(l) });
    if (flags.json) console.log(JSON.stringify(v, null, 2));
    if (!flags.dry) {
      const r = verifyVendored();
      if (!r.ok) throw new Error(`verification after copy failed: ${r.problems.join("; ")}`);
      if (!flags.json) console.log(`verified: ${r.skills} skills, ${r.files} files match ${VENDORED_JSON}`);
    }
  } catch (e) {
    console.error(`vendor-hyperframes: ${e.message}`);
    process.exit(1);
  }
}
