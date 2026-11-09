#!/usr/bin/env node
// Studio health check. Prints one line per requirement with a fix hint, writes .verify-report.txt at the studio root,
// exits 1 when a REQUIRED item fails.
//
//   node tools/doctor.mjs            checks only
//   node tools/doctor.mjs --render   also renders a throwaway 2 s composition in .studio-smoke/ (about a minute)
//   node tools/doctor.mjs --json     machine-readable
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { IS_WIN, STUDIO_ROOT, ffprobe, findFfmpegDir, isMainModule, loadEnv, parseArgs } from "./lib/studio.mjs";
import { findPlugin, invocation, runHf } from "./hf.mjs";
import { verifyVendored } from "./vendor-hyperframes.mjs";
import { status as obsidianStatus } from "./memory/obsidian-setup.mjs";
import { buildAll } from "./memory/build-hot.mjs";
import { lint } from "./memory/lint.mjs";

const results = [];
const add = (name, ok, detail, { required = true, fix = "" } = {}) => { results.push({ name, ok, detail, required, fix }); return ok; };
const ver = (cmd, args, { shell = false, timeout = 20000 } = {}) => {
  const r = shell
    ? spawnSync([cmd, ...args].join(" "), { encoding: "utf8", windowsHide: true, shell: true, timeout })
    : spawnSync(cmd, args, { encoding: "utf8", windowsHide: true, timeout });
  return r.status === 0 ? (r.stdout || r.stderr || "").trim().split(/\r?\n/)[0] : null;
};

function checkEnvironment() {
  const major = Number(process.versions.node.split(".")[0]);
  add("Node.js", major >= 22, `v${process.versions.node}`, { fix: "install Node.js LTS: winget install OpenJS.NodeJS.LTS (the HyperFrames CLI needs 22+)" });
  const npm = ver(IS_WIN ? "npm.cmd" : "npm", ["--version"], { shell: IS_WIN });
  add("npm", Boolean(npm), npm ? `v${npm}` : "not found", { fix: "comes with Node.js; reopen the terminal after installing Node" });
  const git = ver("git", ["--version"]);
  add("Git (Git Bash for Claude Code)", Boolean(git), git || "not found", { required: false, fix: "winget install Git.Git (Claude Code uses its Bash)" });
  const ffdir = findFfmpegDir();
  const ffv = ffdir ? ver(path.join(ffdir, IS_WIN ? "ffmpeg.exe" : "ffmpeg"), ["-version"]) : null;
  add("FFmpeg", Boolean(ffv), ffv ? `${ffv.split(" ").slice(0, 3).join(" ")} at ${ffdir}` : "not found", { fix: "winget install Gyan.FFmpeg, then reopen the terminal" });
  const claude = ver(IS_WIN ? "claude.exe" : "claude", ["--version"], { shell: IS_WIN }) || ver("claude", ["--version"], { shell: true });
  add("Claude Code", Boolean(claude), claude || "not found on PATH", { fix: "PowerShell: irm https://claude.ai/install.ps1 | iex, then reopen the terminal" });
  const plugin = findPlugin();
  add("HyperFrames plugin", Boolean(plugin), plugin ? `v${plugin.version} (${plugin.source}) at ${plugin.root}` : "not found", { fix: "node tools/vendor-hyperframes.mjs restores the repo's copy from a plugin under ~/.claude/plugins (install one once: claude plugin marketplace add heygen-com/hyperframes && claude plugin install hyperframes@hyperframes)" });
  try {
    const v = verifyVendored(STUDIO_ROOT);
    const cache = v.cache ? (v.present && v.cache.version === v.version ? "; plugin cache: same release" : `; plugin cache: v${v.cache.version}${v.present ? " (differs: a re-vendor is Slava's call)" : ""}`) : "; plugin cache: none";
    add("HyperFrames skills (vendored)", v.ok, v.present ? `v${v.version}, ${v.skills} skills, ${v.files} files ${v.ok ? "match VENDORED.json" : `DRIFT: ${v.problems.join("; ")}`}${cache}` : `${v.problems.join("; ")}${cache}`, { required: false, fix: "node tools/vendor-hyperframes.mjs --check names the drift; re-vendor (node tools/vendor-hyperframes.mjs) only on Slava's word, it changes the pinned release" });
  } catch (e) { add("HyperFrames skills (vendored)", false, e.message, { required: false }); }
  try {
    const settings = JSON.parse(fs.readFileSync(path.join(STUDIO_ROOT, ".claude", "settings.json"), "utf8"));
    const marketplaceCopy = settings.enabledPlugins?.["hyperframes@hyperframes"];
    add("HyperFrames marketplace copy", marketplaceCopy === false, marketplaceCopy === false ? "off in .claude/settings.json (only the vendored hf:* skills load)" : "still on in .claude/settings.json: every HyperFrames skill is offered twice (hyperframes:* and hf:*)", { required: false, fix: "Slava sets \"hyperframes@hyperframes\": false under enabledPlugins in .claude/settings.json (or claude plugin disable hyperframes@hyperframes --scope project), then /reload-plugins" });
  } catch { /* no project settings: nothing to report */ }
  const totalGb = os.totalmem() / 2 ** 30;
  add("Memory", totalGb >= 8, `${totalGb.toFixed(1)} GB total, ${(os.freemem() / 2 ** 30).toFixed(1)} GB free${totalGb < 24 ? " -> render with --workers 2" : ""}`, { required: false, fix: "close other apps before rendering" });
  try {
    const st = fs.statfsSync(STUDIO_ROOT);
    const freeGb = (st.bavail * st.bsize) / 2 ** 30;
    add("Disk space", freeGb >= 5, `${freeGb.toFixed(1)} GB free on the studio drive`, { required: false, fix: "renders and the browser need ~5 GB free" });
  } catch { add("Disk space", true, "not measured", { required: false }); }
  loadEnv();
  const envFile = path.join(STUDIO_ROOT, ".env");
  add("fal.ai key (FAL_KEY in .env)", Boolean(process.env.FAL_KEY), process.env.FAL_KEY ? "set" : fs.existsSync(envFile) ? "missing in .env" : ".env not found", { required: false, fix: "put the key after FAL_KEY= in .env (see .env.example); needed for AI generation, TTS, avatars and Hebrew transcription" });
  return plugin;
}

function checkHyperframes(plugin) {
  const inv = invocation(["--version"]);
  const r = spawnSync(inv.command, inv.args, { encoding: "utf8", windowsHide: true, env: inv.env, shell: inv.shell, timeout: 240000, cwd: STUDIO_ROOT });
  const out = ((r.stdout || "") + (r.stderr || "")).trim();
  const m = out.match(/\d+\.\d+\.\d+/);
  add("HyperFrames CLI", r.status === 0 && Boolean(m), m ? `v${m[0]}${plugin ? "" : " (npx fallback)"}` : out.split(/\r?\n/).slice(-2).join(" | ") || "no output", { fix: "needs internet the first time (npm download). Re-run after a minute; see docs/TROUBLESHOOTING.md" });
  const b = runHf(["browser", "path"], { cwd: STUDIO_ROOT, stdio: "pipe", timeoutMs: 60000 });
  const p = ((b.stdout || "") + (b.stderr || "")).trim().split(/\r?\n/).find((l) => /chrome|chromium/i.test(l)) || "";
  add("Render browser (Chrome headless)", b.status === 0 && Boolean(p), p || "not downloaded", { fix: "node tools/hf.mjs browser ensure   (downloads ~150 MB once)" });
}

function killTree(pid) {
  if (IS_WIN) spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { windowsHide: true });
  else { try { process.kill(-pid, "SIGKILL"); } catch { try { process.kill(pid, "SIGKILL"); } catch { /* gone */ } } }
}

// The smallest correct composition: one root, timed .clip layers, a paused GSAP timeline on window.__timelines,
// hidden initial states in CSS. Written into .studio-smoke/ (git-ignored) only for the smoke render, then removed.
const SMOKE_HTML = [
  "<!doctype html>",
  '<html lang="en" data-resolution="portrait">',
  "<head>",
  '<meta charset="UTF-8" />',
  '<meta name="viewport" content="width=1080, height=1920" />',
  '<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>',
  "<style>",
  "* { margin: 0; padding: 0; box-sizing: border-box; }",
  "html, body { width: 1080px; height: 1920px; overflow: hidden; background: #05080f; }",
  "#root { position: relative; width: 100%; height: 100%; overflow: hidden; font-family: system-ui, sans-serif; color: #ffffff; }",
  ".clip { position: absolute; }",
  "#bg { left: 0; top: 0; width: 100%; height: 100%; background: radial-gradient(120% 80% at 50% 20%, #0b1220 0%, #05080f 70%); }",
  "#title { left: 80px; right: 80px; top: 820px; text-align: center; font-weight: 900; font-size: 120px; line-height: 1.1; opacity: 0; }",
  "#bar { left: 240px; right: 240px; top: 1000px; height: 10px; background: #ffd60a; border-radius: 5px; transform-origin: 0 50%; }",
  "</style>",
  "</head>",
  "<body>",
  '<div id="root" data-composition-id="main" data-start="0" data-duration="2" data-width="1080" data-height="1920" data-fps="24">',
  '  <div id="bg" class="clip" data-start="0" data-duration="2" data-track-index="0"></div>',
  '  <h1 id="title" class="clip" data-start="0" data-duration="2" data-track-index="1">Studio OK</h1>',
  '  <div id="bar" class="clip" data-start="0" data-duration="2" data-track-index="2"></div>',
  "</div>",
  "<script>",
  '  gsap.set("#bar", { scaleX: 0 });',
  "  const tl = gsap.timeline({ paused: true });",
  '  tl.fromTo("#title", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out" }, 0.1);',
  '  tl.to("#bar", { scaleX: 1, duration: 0.6, ease: "expo.out" }, 0.4);',
  '  tl.to(["#title", "#bar"], { opacity: 0, duration: 0.3, ease: "power2.in" }, 1.6);',
  "  window.__timelines = window.__timelines || {};",
  '  window.__timelines["main"] = tl;',
  "  tl.seek(0);",
  "</script>",
  "</body>",
  "</html>",
  "",
].join("\n");

const SMOKE_CONFIG = {
  $schema: "https://hyperframes.heygen.com/schema/hyperframes.json",
  registry: "https://raw.githubusercontent.com/heygen-com/hyperframes/main/registry",
  paths: { blocks: "compositions", components: "compositions/components", assets: "assets" },
  media: { autoProxy: true },
  registryItems: [],
};

async function smokeRender() {
  const dir = path.join(STUDIO_ROOT, ".studio-smoke");
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, "renders"), { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), SMOKE_HTML, "utf8");
  fs.writeFileSync(path.join(dir, "hyperframes.json"), JSON.stringify(SMOKE_CONFIG, null, 2));
  fs.writeFileSync(path.join(dir, "meta.json"), JSON.stringify({ id: "studio-smoke", name: "Studio smoke test" }, null, 2));
  const out = path.join(dir, "renders", "smoke.mp4");
  const inv = invocation(["render", ".", "-o", out, "-q", "draft", "-f", "24", "--workers", "2", "--experimental-fast-capture=false"]);
  const t0 = Date.now();
  const status = await new Promise((resolve) => {
    const child = spawn(inv.command, inv.args, { cwd: dir, env: inv.env, shell: inv.shell, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let tail = "";
    const keep = (d) => { tail = (tail + d.toString()).slice(-1500); };
    child.stdout.on("data", keep); child.stderr.on("data", keep);
    const timer = setTimeout(() => { killTree(child.pid); resolve({ code: 124, tail }); }, 6 * 60 * 1000);
    child.on("exit", (code) => { clearTimeout(timer); resolve({ code, tail }); });
  });
  const secs = Math.round((Date.now() - t0) / 1000);
  let ok = status.code === 0 && fs.existsSync(out);
  let detail = `exit ${status.code} after ${secs} s`;
  if (ok) {
    const info = ffprobe(out);
    ok = Math.abs(info.duration - 2) < 0.3 && info.width === 1080 && info.height === 1920;
    detail = `${info.width}x${info.height} | ${info.duration.toFixed(2)} s | ${info.fps} fps | rendered in ${secs} s (throwaway, .studio-smoke/ removed)`;
  } else detail += " | " + status.tail.replace(/\x1b\[[0-9;]*m/g, "").split(/\r?\n/).filter(Boolean).slice(-3).join(" | ");
  add("Smoke render (2 s portrait)", ok, detail, { fix: status.code === 124 ? "took longer than 6 minutes: close other apps and retry" : "see docs/TROUBLESHOOTING.md -> Rendering" });
  if (ok) fs.rmSync(dir, { recursive: true, force: true });
}

// The second brain (memory/README.md): the vault's generated notes, the lint, the hooks and Obsidian. All optional:
// the studio renders without them; the memory contract still asks every session to read memory/HOT.md itself.
function checkMemory() {
  const hot = path.join(STUDIO_ROOT, "memory", "HOT.md");
  const hotText = fs.existsSync(hot) ? fs.readFileSync(hot, "utf8") : "";
  add("Memory vault (memory/HOT.md)", Boolean(hotText), hotText ? `generated ${(hotText.match(/generated_at: (\S+)/) || [])[1] || "?"}` : "missing", { required: false, fix: "node tools/memory/build-hot.mjs" });
  try {
    const stale = buildAll(STUDIO_ROOT, { write: false }).outputs.filter((o) => o.changed).map((o) => o.rel);
    add("Memory generated notes", !stale.length, stale.length ? `stale: ${stale.join(", ")}` : "up to date", { required: false, fix: "node tools/memory/build-hot.mjs (or /sync)" });
  } catch (e) { add("Memory generated notes", false, e.message, { required: false, fix: "node tools/memory/build-hot.mjs" }); }
  try {
    const r = lint(STUDIO_ROOT);
    const fails = r.findings.filter((f) => f.level === "FAIL").length;
    add("Memory lint", !fails, `${r.count} notes, ${fails} FAIL, ${r.findings.length - fails} WARN`, { required: false, fix: "node tools/memory/lint.mjs and fix the lines it names" });
  } catch (e) { add("Memory lint", false, e.message, { required: false, fix: "node tools/memory/lint.mjs" }); }
  const settings = ["settings.json", "settings.local.json"].map((f) => { try { return fs.readFileSync(path.join(STUDIO_ROOT, ".claude", f), "utf8"); } catch { return ""; } }).join("\n");
  const hooks = ["session-start.mjs", "pre-compact.mjs"].filter((h) => settings.includes(h));
  add("Memory hooks (.claude/settings.json)", hooks.length === 2, hooks.length === 2 ? "SessionStart + PreCompact installed" : `${hooks.length} of 2 installed`, { required: false, fix: "Slava pastes the block from docs/hooks-paste-block.md (sessions read HOT themselves until then)" });
  try {
    const st = obsidianStatus(STUDIO_ROOT);
    add("Obsidian app", Boolean(st.app), st.app ? `v${st.version || "?"} at ${st.app}${st.running ? " (running)" : " (closed)"}` : "not installed", { required: false, fix: "winget install Obsidian.Obsidian (optional: the vault works on plain files)" });
    if (st.app) add("Obsidian vault + CLI", Boolean(st.vaultId) && st.cliEnabled && Boolean(st.cli), `${st.vaultId ? "vault registered" : "vault NOT registered"}, CLI ${st.cliEnabled ? "enabled" : "off"}${st.cli ? "" : ", Obsidian.com missing"}`, { required: false, fix: "node tools/memory/obsidian-setup.mjs (no click needed; close and reopen Obsidian once if it was open)" });
  } catch (e) { add("Obsidian app", false, e.message, { required: false }); }
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2));
  const plugin = checkEnvironment();
  checkHyperframes(plugin);
  checkMemory();
  if (flags.render) await smokeRender();
  const failedRequired = results.filter((r) => r.required && !r.ok);
  const lines = results.map((r) => `${r.ok ? "ok " : r.required ? "FAIL" : "opt"} ${r.name.padEnd(36)} ${r.detail}${!r.ok && r.fix ? `\n    fix: ${r.fix}` : ""}`);
  const summary = failedRequired.length ? `${failedRequired.length} required check(s) failed` : `all required checks passed${flags.render ? " (including the render)" : ""}`;
  const report = [`Video Studio doctor: ${new Date().toISOString()}`, `studio: ${STUDIO_ROOT}`, "", ...lines, "", summary, ""].join("\n");
  if (flags.json) console.log(JSON.stringify({ ok: !failedRequired.length, results }, null, 2)); else console.log(report);
  try { fs.writeFileSync(path.join(STUDIO_ROOT, ".verify-report.txt"), report, "utf8"); } catch { /* read-only location: skip */ }
  process.exit(failedRequired.length ? 1 : 0);
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`doctor crashed: ${e.message}`); process.exit(1); });
