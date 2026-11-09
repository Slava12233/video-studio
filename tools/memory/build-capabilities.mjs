#!/usr/bin/env node
// tools/memory/build-capabilities.mjs: generates the capability map under memory/capabilities/ from what is
// installed in this studio (contract memory/README.md). Node 20+, no dependencies. Machine-facing, English.
//   skills.md   one row per .claude/skills/*/SKILL.md (name, description, path; third-party ones marked)
//   agents.md   one row per .claude/agents/*.md (name, model, description, tools summary, skills)
//   rules.md    one row per .claude/rules/*.md (always loaded or path-scoped, title)
//   tools.md    one row per tools/**/*.mjs (its first comment line)
//   hooks.md    .claude/hooks/* with the event from docs/hooks-paste-block.md and whether project settings install it
// Usage: node tools/memory/build-capabilities.mjs [--check] [--root <dir>]
// Every cell passes the secrets scrubber, so a token or a value never lands in the map.
import fs from "node:fs";
import path from "node:path";
import {
  findRoot, parseFlags, readText, contentHash, oneLine, vaultNow, dateOf, splitFrontmatter, parseFrontmatter,
  serializeFrontmatter, str, listAgents, listSkills, listSkillsDirPlugins, listRules, listTools, scrubSecrets, writeIfChanged, isMain,
} from "./lib.mjs";

const GEN_LINE = "Never hand-edit; run node tools/memory/build-capabilities.mjs";
const THIRD_PARTY = new Set(["obsidian-markdown", "obsidian-bases", "obsidian-cli", "json-canvas"]);

const cell = (s, max = 600) => scrubSecrets(oneLine(str(s), max)).replace(/\|/g, "\\|") || "—";
const table = (header, rows) => [`| ${header.join(" | ")} |`, `|${header.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.join(" | ")} |`)];

function skillsNote(root) {
  const skills = listSkills(root);
  const plugins = listSkillsDirPlugins(root);
  const third = skills.filter((s) => THIRD_PARTY.has(s.dir)).length;
  const pluginSkills = plugins.reduce((n, p) => n + p.skills.length, 0);
  const lines = [
    `${skills.length} studio skills typed as \`/<name>\`, plus ${pluginSkills} plugin skills typed as \`/<plugin>:<name>\` from ${plugins.length} plugin folder${plugins.length === 1 ? "" : "s"} under .claude/skills (a folder with .claude-plugin/plugin.json loads in place as \`<name>@skills-dir\`). "studio" means written for this studio; "kepano/obsidian-skills" is vendored third-party (MIT, THIRD-PARTY.md).`, "",
    "## Studio skills", "",
    ...table(["Skill", "Description", "Source", "Path"], skills.map((s) => [`\`/${s.name}\``, cell(s.description), THIRD_PARTY.has(s.dir) ? "kepano/obsidian-skills" : "studio", `\`${s.path}\``])),
  ];
  for (const p of plugins) {
    const v = p.vendored;
    const origin = v
      ? `Vendored ${String(v.vendoredAt || "").slice(0, 10)} from \`${v.source?.marketplaceEntry || "?"}\`${v.source?.gitCommitSha ? ` at commit \`${String(v.source.gitCommitSha).slice(0, 12)}\`` : ""}, ${v.license || p.license || "licence not stated"} (THIRD-PARTY.md); verify with \`node tools/vendor-hyperframes.mjs --check\`.`
      : `Manifest \`${p.path}\`${p.license ? `, ${p.license}` : ""}.`;
    lines.push("", `## Plugin \`${p.name}\` v${p.version || "?"} (\`.claude/skills/${p.dir}/\`, loads as \`${p.id}\`)`, "",
      `${p.skills.length} skills, typed as \`/${p.name}:<name>\`. ${origin}`, "",
      ...table(["Skill", "Description", "Path"], p.skills.map((s) => [`\`/${p.name}:${s.name}\``, cell(s.description), `\`${s.path}\``])));
  }
  return {
    file: "skills.md", title: "Skills",
    summary: `The ${skills.length} studio skills under .claude/skills (${third} third-party, see THIRD-PARTY.md) and ${pluginSkills} plugin skills from ${plugins.length} plugin folder${plugins.length === 1 ? "" : "s"} there, generated.`,
    lines,
  };
}

function toolsSummary(a) {
  const short = (t) => t.replace(/^mcp__([\w-]+)__/, "$1:");
  if (a.tools.length) return `only ${a.tools.length}: ${a.tools.map(short).join(", ")}`;
  if (a.disallowedTools.length) return `all except ${a.disallowedTools.length}: ${a.disallowedTools.map(short).join(", ")}`;
  return "all (inherits the session tools)";
}

function agentsNote(root) {
  const agents = listAgents(root);
  return {
    file: "agents.md", title: "Agents",
    summary: `The ${agents.length} sub-agents under .claude/agents with model, job and tool access, generated.`,
    lines: [`${agents.length} agents. Delegation rule: sonnet for reading and verifying, opus for drafting and judging, never inherit. Every agent reads HOT and its lane map first and writes memory proposals to \`memory/inbox/proposals.md\`, never a canonical note.`, "",
      ...table(["Agent", "Model", "Description", "Tools", "Skills"], agents.map((a) => [`\`${a.name}\``, a.model ? `\`${a.model}\`` : "—", cell(a.description), cell(toolsSummary(a), 900), cell(a.skills.join(", "))]))],
  };
}

function rulesNote(root) {
  const rules = listRules(root);
  return {
    file: "rules.md", title: "Rules",
    summary: `The ${rules.length} rule files under .claude/rules (always loaded or path-scoped), generated.`,
    lines: ["Unscoped rules load every session; path-scoped ones load when a matching file is touched. `CLAUDE.md` at the root summarises them.", "",
      ...table(["Rule", "Loads", "Title", "Path"], rules.map((r) => [`\`${r.name}\``, r.paths.length ? cell(r.paths.map((p) => `\`${p}\``).join(", "), 200) : "always", cell(r.title), `\`${r.path}\``]))],
  };
}

function toolsNote(root) {
  const tools = listTools(root);
  return {
    file: "tools.md", title: "Tools",
    summary: `The ${tools.length} Node tools under tools/ with their one-line purpose, generated.`,
    lines: ["Run from the studio root as `node tools/<path>`; paid fal tools take `--dry` first; renders and ffmpeg start with Git Bash `timeout N`.", "",
      ...table(["Tool", "What it does"], tools.map((t) => [`\`${t.rel}\``, cell(t.headline, 300)]))],
  };
}

function pasteBlockEvents(root) {
  const map = new Map();
  const t = readText(path.join(root, "docs", "hooks-paste-block.md"));
  if (!t) return map;
  for (const m of t.matchAll(/```json\n([\s\S]*?)```/g)) {
    let j; try { j = JSON.parse(m[1]); } catch { continue; }
    for (const [event, groups] of Object.entries(j.hooks || {})) {
      for (const g of groups || []) for (const h of g.hooks || []) {
        const file = (/[\w.-]+\.(?:mjs|js|ps1|sh|py|cmd)/.exec(String(h.command || "")) || [])[0];
        if (file) { const prev = map.get(file); map.set(file, { event: prev ? `${prev.event}, ${event}` : event, matcher: g.matcher || "" }); }
      }
    }
  }
  return map;
}

function hooksNote(root) {
  const dir = path.join(root, ".claude", "hooks");
  let files = [];
  try { files = fs.readdirSync(dir).filter((f) => /\.(mjs|js|ps1|sh|py|cmd)$/i.test(f) && !/\.test\./.test(f)).sort(); } catch { files = []; }
  const events = pasteBlockEvents(root);
  const settings = ["settings.json", "settings.local.json"].map((f) => readText(path.join(root, ".claude", f)) || "").join("\n");
  const rows = files.map((f) => {
    const text = readText(path.join(dir, f)) || "";
    const comment = [];
    for (const l of text.split("\n").filter((x) => !/^#!/.test(x))) { const m = /^\s*(?:\/\/|#)\s?(.*)$/.exec(l); if (!m || /^hook contract/i.test(m[1].trim())) break; if (m[1].trim()) comment.push(m[1].trim()); if (comment.length >= 2) break; }
    const ev = events.get(f);
    return [`\`${f}\``, ev ? `\`${ev.event}\`${ev.matcher ? ` (${ev.matcher.replace(/\|/g, "\\|")})` : ""}` : "—", cell(comment.join(" ") || "no header comment"), settings.includes(f) ? "yes" : "no (paste block not applied)"];
  });
  return {
    file: "hooks.md", title: "Hooks",
    summary: `The ${rows.length} hook scripts under .claude/hooks, their events and whether project settings install them, generated.`,
    lines: ["Hooks are installed by Slava only: `docs/hooks-paste-block.md` holds the block for `.claude/settings.json`. \"Installed\" reads the project settings files for the script name. The vault works without them (sessions read `memory/HOT.md` themselves).", "",
      ...(rows.length ? table(["Hook", "Event", "What it does", "Installed"], rows) : ["No hook scripts in `.claude/hooks/` yet."])],
  };
}

function render(n, created, generatedAt) {
  const body = [`# ${n.title}`, "", GEN_LINE, ...n.lines].join("\n") + "\n";
  return serializeFrontmatter({ type: "capability", created, status: "active", maintained_by: "generated", categories: ["capabilities"], summary: n.summary, generated_at: generatedAt, content_hash: contentHash(body) }) + "\n" + body;
}

export function buildCapabilities(root, { now = new Date(), write = true } = {}) {
  const { date: today, iso } = vaultNow(now);
  const generatedAt = iso.replace(/:\d{2}([+-])/, "$1");
  const notes = [skillsNote(root), agentsNote(root), rulesNote(root), toolsNote(root), hooksNote(root)];
  const outputs = notes.map((n) => {
    const rel = `memory/capabilities/${n.file}`;
    const abs = path.join(root, rel);
    const old = readText(abs);
    const oldFm = old ? parseFrontmatter(splitFrontmatter(old).fmText) : {};
    const created = dateOf(oldFm.created) || today;
    const same = old !== null && render(n, created, str(oldFm.generated_at)) === old;
    return { rel, abs, changed: !same, content: same ? old : render(n, created, generatedAt) };
  });
  if (write) for (const o of outputs) if (o.changed) writeIfChanged(o.abs, o.content);
  return { outputs };
}

if (isMain(import.meta.url)) {
  const { flags } = parseFlags();
  const root = findRoot();
  let res;
  try { res = buildCapabilities(root, { write: !flags.has("check") }); } catch (e) { console.error(`build-capabilities: failed: ${e.message}`); process.exit(2); }
  const changed = res.outputs.filter((o) => o.changed).map((o) => o.rel);
  if (flags.has("check")) {
    if (changed.length) { console.log(`build-capabilities --check: would change ${changed.join(", ")}`); process.exit(1); }
    console.log("build-capabilities --check: up to date");
  } else console.log(changed.length ? `build-capabilities: wrote ${changed.join(", ")}` : "build-capabilities: nothing changed");
}
