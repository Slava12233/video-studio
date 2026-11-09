#!/usr/bin/env node
// tools/memory/obsidian-setup.mjs: makes Obsidian ready for this studio's vault without a click.
//   1. finds the Obsidian app (per-user or machine install) and its CLI redirector (Obsidian.com on Windows);
//   2. registers the studio root as a vault in Obsidian's global config (obsidian.json, the file the app writes on
//      File > Open folder as vault), marked open; other vaults are left exactly as they are;
//   3. turns on the command line interface in that config (the key `cli`, what Settings > General > Advanced writes);
//   4. starts Obsidian when it is not running (a running app reads the config at startup: after a first enable it has
//      to be closed and reopened once; the tool says so and never kills it).
// Usage:  node tools/memory/obsidian-setup.mjs              register + enable + start, then report
//         node tools/memory/obsidian-setup.mjs --check      report only; exit 0 when ready, 1 otherwise
//         node tools/memory/obsidian-setup.mjs --no-open    register + enable, do not start the app
//         node tools/memory/obsidian-setup.mjs --cli-path   print the CLI binary path (empty line when absent)
//         node tools/memory/obsidian-setup.mjs --cli <args…>  run the Obsidian CLI by full path (no PATH needed),
//                                                            e.g. --cli vault=video-studio search query=caps
// The CLI needs the app running (it starts it otherwise). Output is names and paths only. No dependencies. Node 20+.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, spawn } from "node:child_process";
import { findRoot, isMain } from "./lib.mjs";

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const cliIdx = argv.indexOf("--cli");
const CLI_ARGS = cliIdx >= 0 ? argv.slice(cliIdx + 1) : null;
const QUIET = has("--quiet");
const log = (s) => { if (!QUIET) console.log(s); };

export function configDir() {
  if (process.platform === "win32") return path.join(process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"), "obsidian");
  if (process.platform === "darwin") return path.join(os.homedir(), "Library", "Application Support", "obsidian");
  return path.join(process.env.XDG_CONFIG_HOME || path.join(os.homedir(), ".config"), "obsidian");
}

function onPath(name) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [name], { encoding: "utf8", windowsHide: true });
  const first = (r.stdout || "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean)[0];
  return r.status === 0 && first ? first : "";
}

export function findApp() {
  const c = [];
  if (process.platform === "win32") {
    const local = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
    for (const dir of [path.join(local, "Programs", "Obsidian"), path.join(local, "Obsidian"), process.env.ProgramFiles && path.join(process.env.ProgramFiles, "Obsidian"), process.env.ProgramW6432 && path.join(process.env.ProgramW6432, "Obsidian"), "C:\\Program Files\\Obsidian"].filter(Boolean)) {
      c.push({ app: path.join(dir, "Obsidian.exe"), cli: path.join(dir, "Obsidian.com") });
    }
  } else if (process.platform === "darwin") {
    for (const base of ["/Applications", path.join(os.homedir(), "Applications")]) c.push({ app: path.join(base, "Obsidian.app"), cli: path.join(base, "Obsidian.app", "Contents", "MacOS", "Obsidian") });
  } else {
    for (const p of ["/usr/bin/obsidian", "/usr/local/bin/obsidian", "/opt/Obsidian/obsidian", "/snap/bin/obsidian"]) c.push({ app: p, cli: p });
  }
  for (const x of c) if (fs.existsSync(x.app)) return { app: x.app, cli: fs.existsSync(x.cli) ? x.cli : onPath("obsidian") };
  const p = onPath("obsidian");
  return p ? { app: p, cli: p } : null;
}

export function appVersion(app) {
  if (!app || process.platform !== "win32") return "";
  const r = spawnSync("powershell", ["-NoProfile", "-Command", `(Get-Item '${app.replace(/'/g, "''")}').VersionInfo.ProductVersion`], { encoding: "utf8", windowsHide: true, timeout: 15000 });
  return (r.stdout || "").trim().replace(/\.0$/, "");
}

export function isRunning() {
  if (process.platform === "win32") {
    const r = spawnSync("tasklist", ["/FI", "IMAGENAME eq Obsidian.exe", "/NH"], { encoding: "utf8", windowsHide: true });
    return /Obsidian\.exe/i.test(r.stdout || "");
  }
  const r = spawnSync("pgrep", ["-x", "Obsidian"], { encoding: "utf8" });
  return r.status === 0;
}

const readConfig = (file) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; } };
const samePath = (a, b) => { const n = (p) => path.resolve(String(p || "")).replace(/[\\/]+$/, "").toLowerCase(); return n(a) === n(b); };
export function registeredId(cfg, vault) {
  if (!cfg || !cfg.vaults) return "";
  for (const [id, v] of Object.entries(cfg.vaults)) if (v && samePath(v.path, vault)) return id;
  return "";
}
const randomId = () => { let s = ""; for (let i = 0; i < 16; i++) s += Math.floor(Math.random() * 16).toString(16); return s; };

export function status(vault = findRoot()) {
  const app = findApp();
  const file = path.join(configDir(), "obsidian.json");
  const cfg = readConfig(file);
  return { vault, app: app ? app.app : "", cli: app ? app.cli : "", version: app ? appVersion(app.app) : "", configFile: file, vaultId: registeredId(cfg, vault), cliEnabled: !!cfg && cfg.cli === true, running: isRunning() };
}

function startApp(app) {
  try {
    const child = process.platform === "darwin" ? spawn("open", ["-a", "Obsidian"], { detached: true, stdio: "ignore" }) : spawn(app, [], { detached: true, stdio: "ignore", windowsHide: false });
    child.unref();
    return true;
  } catch { return false; }
}

function main() {
  const vault = findRoot();
  const st = status(vault);
  if (has("--cli-path")) { console.log(st.cli); return 0; }

  if (CLI_ARGS) {
    if (!st.cli) { console.error("obsidian-setup: no Obsidian CLI found (install Obsidian 1.12.7+ and run this tool once)"); return 2; }
    const r = spawnSync(st.cli, CLI_ARGS, { encoding: "utf8", stdio: "inherit", windowsHide: true, timeout: 60000 });
    return r.status == null ? 2 : r.status;
  }

  if (has("--check")) {
    log(`obsidian-setup --check (vault ${vault})`);
    log(`  app:         ${st.app ? `${st.app}${st.version ? ` (v${st.version})` : ""}` : "not found"}`);
    log(`  cli binary:  ${st.cli || "not found"}`);
    log(`  registered:  ${st.vaultId ? `yes (id ${st.vaultId})` : "no"} in ${st.configFile}`);
    log(`  cli enabled: ${st.cliEnabled ? "yes" : "no"}`);
    log(`  app running: ${st.running ? "yes" : "no"}`);
    const ready = !!st.app && !!st.vaultId && st.cliEnabled;
    log(ready ? "obsidian-setup: ready" : "obsidian-setup: not ready (run without --check)");
    return ready ? 0 : 1;
  }

  if (!st.app) { log("obsidian-setup: Obsidian is not installed; nothing registered. Install it (winget install Obsidian.Obsidian) and run again."); return 1; }
  const dir = configDir(); const file = st.configFile;
  const cfg = readConfig(file) || { vaults: {} };
  if (!cfg.vaults) cfg.vaults = {};
  let changed = false;
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(file)) { try { fs.copyFileSync(file, file + ".bak-video-studio"); } catch { /* best effort */ } }
  if (!registeredId(cfg, vault)) {
    cfg.vaults[randomId()] = { path: vault, ts: Date.now(), open: true };   // other vaults keep their own `open` flags
    changed = true;
    log(`obsidian-setup: registered ${vault} as a vault`);
  } else log("obsidian-setup: vault already registered");
  if (cfg.cli !== true) { cfg.cli = true; changed = true; log("obsidian-setup: command line interface enabled"); }
  else log("obsidian-setup: command line interface already enabled");
  if (changed) fs.writeFileSync(file, JSON.stringify(cfg));

  if (!st.running) {
    if (has("--no-open")) log("obsidian-setup: app not started (--no-open)");
    else log(startApp(st.app) ? "obsidian-setup: Obsidian started; it opens the vault" : "obsidian-setup: could not start Obsidian; open it yourself once");
  } else if (changed) log("obsidian-setup: Obsidian is running; close and reopen it once so it reads the new setting (the vault and the CLI answer after that)");
  else log("obsidian-setup: Obsidian is running");
  log(`obsidian-setup: CLI = ${st.cli || "not found"} (the tools call it by this path; nothing to add to PATH)`);
  return 0;
}

if (isMain(import.meta.url)) process.exit(main());
