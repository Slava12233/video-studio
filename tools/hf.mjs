#!/usr/bin/env node
// HyperFrames launcher for this studio.
//
// Runs the CLI release that matches the installed Claude Code plugin (hyperframes@hyperframes), so the
// agent, the setup scripts and every project use ONE version. Falls back to `npx hyperframes@latest`
// when no plugin is installed (and says so).
//
//   node tools/hf.mjs <command> [args...]     e.g.  node tools/hf.mjs render . -q draft --workers 2
//   node tools/hf.mjs --where                 print the plugin root, CLI version and launcher path (JSON)
//
// Run it from inside the project you are working on (or pass the project dir to the command).
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { IS_WIN, isMainModule } from "./lib/studio.mjs";

function semverDesc(a, b) {
  const pa = a.split(".").map(Number), pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
  return 0;
}

/** Locate the installed HyperFrames plugin: { root, cli, version } or null. */
export function findPlugin() {
  const home = os.homedir();
  const roots = [];
  const reg = path.join(home, ".claude", "plugins", "installed_plugins.json");
  if (fs.existsSync(reg)) {
    try {
      const j = JSON.parse(fs.readFileSync(reg, "utf8"));
      for (const [name, entries] of Object.entries(j.plugins || {})) {
        if (!/^hyperframes@/.test(name)) continue;
        for (const e of Array.isArray(entries) ? entries : [entries]) if (e && e.installPath) roots.push(e.installPath);
      }
    } catch { /* unreadable registry: fall through to the cache scan */ }
  }
  const cache = path.join(home, ".claude", "plugins", "cache", "hyperframes", "hyperframes");
  if (fs.existsSync(cache)) {
    for (const v of fs.readdirSync(cache).filter((d) => /^\d+\.\d+\.\d+/.test(d)).sort(semverDesc)) roots.push(path.join(cache, v));
  }
  for (const root of roots) {
    const cli = path.join(root, "skills", "hyperframes", "scripts", "plugin-cli.mjs");
    if (!fs.existsSync(cli)) continue;
    let version = null;
    for (const m of ["plugin.json", ".claude-plugin/plugin.json"]) {
      const f = path.join(root, m);
      if (!fs.existsSync(f)) continue;
      try { version = JSON.parse(fs.readFileSync(f, "utf8")).version || null; break; } catch { /* next manifest */ }
    }
    return { root, cli, version };
  }
  return null;
}

function npxCli() {
  const c = path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js");
  return fs.existsSync(c) ? c : null;
}

/** The command that runs the HyperFrames CLI with `args`. */
export function invocation(args) {
  const plugin = findPlugin();
  const env = { ...process.env, HYPERFRAMES_NO_UPDATE_CHECK: "1" };
  if (plugin) return { command: process.execPath, args: [plugin.cli, ...args], env, plugin, shell: false };
  env.HYPERFRAMES_SKIP_SKILLS = "1";
  const npxArgs = ["--yes", "hyperframes@latest", ...args];
  const cli = npxCli();
  if (cli) return { command: process.execPath, args: [cli, ...npxArgs], env, plugin: null, shell: false };
  // Last resort: a shell command string (Node warns when an args array is used with shell: true).
  return { command: [IS_WIN ? "npx.cmd" : "npx", ...npxArgs.map((a) => (/\s/.test(a) ? `"${a}"` : a))].join(" "), args: [], env, plugin: null, shell: true };
}

/** Run the CLI in `cwd`; returns the exit code (stdio inherited unless told otherwise). */
export function runHf(args, { cwd = process.cwd(), stdio = "inherit", timeoutMs } = {}) {
  const inv = invocation(args);
  if (!inv.plugin && !process.env.HF_QUIET_FALLBACK) {
    console.error("[hf] HyperFrames plugin not found under ~/.claude/plugins; falling back to `npx hyperframes@latest`. Install it: claude plugin marketplace add heygen-com/hyperframes, then claude plugin install hyperframes@hyperframes.");
  }
  const r = spawnSync(inv.command, inv.args, { cwd, env: inv.env, stdio, windowsHide: true, shell: inv.shell, timeout: timeoutMs, encoding: stdio === "pipe" ? "utf8" : undefined });
  if (r.error && r.error.code !== "ETIMEDOUT") throw r.error;
  return { status: r.status === null ? 124 : r.status, stdout: r.stdout, stderr: r.stderr, timedOut: r.error && r.error.code === "ETIMEDOUT" };
}

if (isMainModule(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--where") {
    const p = findPlugin();
    if (p) console.log(JSON.stringify({ pluginRoot: p.root, version: p.version, launcher: p.cli }, null, 2));
    else console.log(JSON.stringify({ pluginRoot: null, version: null, fallback: "npx hyperframes@latest" }, null, 2));
    process.exit(p || args[0] === "--where" ? 0 : 1);
  }
  process.exit(runHf(args).status);
}
