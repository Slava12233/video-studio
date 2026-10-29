// Shared helpers for the studio tools: paths, .env loading, ffmpeg lookup, argument parsing.
// Plain Node (>= 20), no dependencies. Every tool in tools/ imports from here.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const STUDIO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const IS_WIN = process.platform === "win32";

/** True when `importMetaUrl` is the script Node was started with (drive-letter case safe on Windows). */
export function isMainModule(importMetaUrl) {
  if (!process.argv[1]) return false;
  const a = path.resolve(process.argv[1]);
  const b = fileURLToPath(importMetaUrl);
  return IS_WIN ? a.toLowerCase() === b.toLowerCase() : a === b;
}

/**
 * Parse argv into { flags, positional }. `--k v` and `--k=v` set flags.k = "v"; a flag listed in
 * `boolFlags` (or followed by nothing / another flag) is `true`. Everything else is positional.
 */
export function parseArgs(argv, boolFlags = []) {
  const bools = new Set(["dry", "force", "serial", "srt", "help", "json", "quiet", "where", "render", "no-render", "verbose", ...boolFlags]);
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { positional.push(a); continue; }
    const eq = a.indexOf("=");
    if (eq > 0) { flags[a.slice(2, eq)] = a.slice(eq + 1); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (bools.has(key) || next === undefined || next.startsWith("--")) flags[key] = true;
    else { flags[key] = next; i++; }
  }
  return { flags, positional };
}

/** Load KEY=value lines from a .env file into process.env without overriding existing values. Values are never logged. */
export function loadEnvFile(file) {
  if (!fs.existsSync(file)) return false;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const m = t.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return true;
}

/** Project .env first (if given), then the studio-level .env. */
export function loadEnv(projectDir) {
  if (projectDir) loadEnvFile(path.join(projectDir, ".env"));
  loadEnvFile(path.join(STUDIO_ROOT, ".env"));
}

/** The project directory a tool works on: --project <dir>, else the current directory. */
export function resolveProject(flags) {
  return flags.project ? path.resolve(String(flags.project)) : process.cwd();
}

/** Resolve a path given in a jobs file: absolute stays, relative is from the project. */
export function fromProject(project, p) {
  return path.isAbsolute(p) ? p : path.join(project, p);
}

// ---------------------------------------------------------------- ffmpeg

export function findFfmpegDir() {
  const exe = IS_WIN ? "ffmpeg.exe" : "ffmpeg";
  const ok = (dir) => (dir && fs.existsSync(path.join(dir, exe)) ? dir : null);
  const which = spawnSync(IS_WIN ? "where" : "which", ["ffmpeg"], { encoding: "utf8", windowsHide: true });
  if (which.status === 0) {
    const first = (which.stdout || "").split(/\r?\n/).map((s) => s.trim()).find(Boolean);
    if (first) return path.dirname(first);
  }
  if (!IS_WIN) return ok("/opt/homebrew/bin") || ok("/usr/local/bin") || null;
  const local = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  const candidates = [path.join(local, "Microsoft", "WinGet", "Links")];
  const pk = path.join(local, "Microsoft", "WinGet", "Packages");
  if (fs.existsSync(pk)) {
    for (const d of fs.readdirSync(pk)) {
      if (!/ffmpeg/i.test(d)) continue;
      const p = path.join(pk, d);
      candidates.push(path.join(p, "bin"));
      for (const sub of fs.readdirSync(p)) candidates.push(path.join(p, sub, "bin"));
    }
  }
  candidates.push("C:\\ffmpeg\\bin", "C:\\Program Files\\ffmpeg\\bin", "C:\\ProgramData\\chocolatey\\bin");
  for (const c of candidates) if (ok(c)) return c;
  return null;
}

/** Put ffmpeg on PATH for this process (and children) and return the executables. */
export function ensureFfmpeg() {
  const dir = findFfmpegDir();
  if (!dir) throw new Error("ffmpeg not found. Install it with: winget install Gyan.FFmpeg (then reopen the terminal), or add ffmpeg to PATH.");
  const parts = (process.env.PATH || "").split(path.delimiter);
  if (!parts.includes(dir)) process.env.PATH = dir + path.delimiter + process.env.PATH;
  return { dir, ffmpeg: path.join(dir, IS_WIN ? "ffmpeg.exe" : "ffmpeg"), ffprobe: path.join(dir, IS_WIN ? "ffprobe.exe" : "ffprobe") };
}

/** Run ffmpeg with `-y -hide_banner`; throws with the tail of stderr on failure. */
export function ffmpeg(args, { quiet = true } = {}) {
  const { ffmpeg: bin } = ensureFfmpeg();
  const r = spawnSync(bin, ["-y", "-hide_banner", "-loglevel", quiet ? "error" : "info", ...args], {
    encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`ffmpeg failed (${r.status}): ${(r.stderr || "").trim().slice(-800)}`);
  return r;
}

/** Duration, size, fps and audio presence of a media file. */
export function ffprobe(file) {
  const { ffprobe: bin } = ensureFfmpeg();
  const r = spawnSync(bin, ["-v", "error", "-print_format", "json", "-show_format", "-show_streams", file], {
    encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024,
  });
  if (r.status !== 0) throw new Error(`ffprobe failed: ${(r.stderr || "").trim().slice(-400)}`);
  const j = JSON.parse(r.stdout || "{}");
  const v = (j.streams || []).find((s) => s.codec_type === "video");
  const a = (j.streams || []).find((s) => s.codec_type === "audio");
  let fps = null;
  if (v && v.r_frame_rate) { const [n, d] = v.r_frame_rate.split("/").map(Number); fps = d ? n / d : n; }
  return {
    duration: Number((j.format && j.format.duration) || 0),
    width: v ? v.width : null,
    height: v ? v.height : null,
    fps,
    hasAudio: Boolean(a),
    sizeBytes: Number((j.format && j.format.size) || 0),
    videoCodec: v ? v.codec_name : null,
    audioCodec: a ? a.codec_name : null,
  };
}

// ---------------------------------------------------------------- misc

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const today = () => new Date().toISOString().slice(0, 10);
export const fmtUsd = (n) => { const v = Number(n || 0); return v > 0 && v < 0.01 ? `$${v.toFixed(3)}` : `$${v.toFixed(2)}`; };

/** ASCII slug for folder names (Hebrew in paths trips several tools). */
export function slugify(s) {
  const out = String(s).toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return out || "video";
}

export function copyDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) copyDir(s, d); else fs.copyFileSync(s, d);
  }
}

export function relToStudio(p) { return path.relative(STUDIO_ROOT, p).split(path.sep).join("/"); }

/** Next free numbered variant: base.png, base-2.png, base-3.png ... */
export function nextFree(file) {
  if (!fs.existsSync(file)) return file;
  const { dir, name, ext } = path.parse(file);
  for (let n = 2; n < 1000; n++) { const f = path.join(dir, `${name}-${n}${ext}`); if (!fs.existsSync(f)) return f; }
  throw new Error(`too many variants of ${file}`);
}

/** Run `fn` over items with at most `limit` in flight. Preserves order of results. */
export async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    for (;;) { const i = next++; if (i >= items.length) return; results[i] = await fn(items[i], i); }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
