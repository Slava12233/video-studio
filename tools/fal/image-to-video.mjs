#!/usr/bin/env node
// Camera-move clips from stills (image-to-video) on fal.ai. Built for real-estate films: a still of a room
// becomes a 5-second dolly / push / orbit; a clip can start from the LAST FRAME of an earlier clip so a
// sequence feels continuous, and an END frame can be given so the move lands on the next room.
//
//   engine "kling" = Kling 2.5 Turbo Pro ($0.07/s, 5 or 10 s, honors the end frame well; 1920×1080 24 fps)
//   engine "h3"    = MiniMax H3 Max Turbo ($0.015–0.048/s, 1–15 s, end frame via end_image_url)
//
// Shots file (default <project>/ai/shots.json; see templates/project-base/ai-jobs/shots.example.json):
//   { "shots": [
//       { "id": "living-dolly", "start": "ai/images/living.png", "prompt": "slow dolly forward ...", "engine": "kling", "duration": 5 },
//       { "id": "to-kitchen",   "start": { "clip": "living-dolly" }, "end": "ai/images/kitchen.png", "prompt": "..." }
//   ] }
//   start   image path, or { "clip": "<id>" } = last frame of that clip (rendered first, automatically)
//   end     optional image path for the final frame
//   prompt  describe the camera move + what stays fixed; negative_prompt optional; resolution (h3) 480P|768P|1080P
//
// Usage:
//   node tools/fal/image-to-video.mjs --project <dir> --dry                 plan, waves and estimate
//   node tools/fal/image-to-video.mjs --project <dir>                       every missing shot, wave by wave, shots in a wave in parallel
//   node tools/fal/image-to-video.mjs --project <dir> living-dolly --engine h3
//   node tools/fal/image-to-video.mjs --project <dir> to-kitchen --force    another try (numbered)
//   node tools/fal/image-to-video.mjs --project <dir> --serial              one at a time
//
// Output: <project>/ai/clips/<id>.mp4 (+ ai/frames/<id>-last.png) and a ledger line with an AI disclosure.
import fs from "node:fs";
import path from "node:path";
import { fmtUsd, fromProject, isMainModule, mapLimit, nextFree, parseArgs, resolveProject, ffprobe } from "../lib/studio.mjs";
import { studioFal, dataUri, price } from "./fal.mjs";
import { lastFrame } from "../media.mjs";

const ENGINES = { kling: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video", h3: "minimax/h3-max-turbo/image-to-video" };
const DEFAULT_NEG = "blur, distortion, warping walls, morphing furniture, flicker, people appearing, text, watermark, low quality, extra objects appearing";
export const DISCLOSURE = "AI-generated video clip from a still image (fal.ai). Must carry the on-screen disclosure label.";

function loadShots(project, jobsFile) {
  const file = fromProject(project, jobsFile || path.join("ai", "shots.json"));
  if (!fs.existsSync(file)) throw new Error(`shots file not found: ${file}\nCopy ai/shots.example.json to ai/shots.json and fill it.`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const shots = Array.isArray(j) ? j : j.shots;
  if (!Array.isArray(shots) || !shots.length) throw new Error(`${file}: expected { "shots": [ ... ] }`);
  const ids = new Set(shots.map((s) => s.id));
  for (const s of shots) {
    if (!s.id || !s.prompt || !s.start) throw new Error(`${file}: every shot needs id, start and prompt (offending: ${JSON.stringify(s).slice(0, 120)})`);
    if (s.engine && !ENGINES[s.engine]) throw new Error(`${file}: shot ${s.id}: engine must be "kling" or "h3"`);
    if (typeof s.start === "object" && !ids.has(s.start.clip)) throw new Error(`${file}: shot ${s.id} starts from unknown clip "${s.start.clip}"`);
  }
  return { file, shots };
}

function buildInput(shot, engineOverride) {
  const engine = engineOverride || shot.engine || "kling";
  const endpoint = ENGINES[engine];
  if (engine === "kling") {
    const duration = String(Number(shot.duration || 5) > 5 ? 10 : 5);
    return { engine, endpoint, input: { prompt: shot.prompt, duration, negative_prompt: shot.negative_prompt || DEFAULT_NEG, cfg_scale: shot.cfg_scale ?? 0.5 } };
  }
  return { engine, endpoint, input: { prompt: shot.prompt, duration: Number(shot.duration || 5), resolution: shot.resolution || "1080P", prompt_expansion_mode: shot.prompt_expansion_mode || "balanced", ...(shot.seed !== undefined ? { seed: shot.seed } : {}) } };
}

/** Group shots into waves so a shot that starts from another clip runs after it. */
function waves(shots) {
  const byId = new Map(shots.map((s) => [s.id, s]));
  const depth = new Map();
  const d = (s, seen = new Set()) => {
    if (depth.has(s.id)) return depth.get(s.id);
    if (seen.has(s.id)) throw new Error(`circular start chain at ${s.id}`);
    seen.add(s.id);
    const v = typeof s.start === "object" && byId.has(s.start.clip) ? 1 + d(byId.get(s.start.clip), seen) : 0;
    depth.set(s.id, v);
    return v;
  };
  shots.forEach((s) => d(s));
  const out = [];
  for (const s of shots) (out[depth.get(s.id)] ||= []).push(s);
  return out;
}

async function main() {
  const { flags, positional: only } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const { shots } = loadShots(project, flags.jobs);
  const clipsDir = path.join(fal.AI_DIR, "clips");
  const framesDir = path.join(fal.AI_DIR, "frames");
  const clipFile = (s) => path.join(clipsDir, `${s.id}.mp4`);

  // Selected shots plus any clip they start from that does not exist yet.
  const byId = new Map(shots.map((s) => [s.id, s]));
  const wanted = new Set(shots.filter((s) => !only.length || only.includes(s.id)).map((s) => s.id));
  for (const id of [...wanted]) { let s = byId.get(id); while (typeof s.start === "object") { s = byId.get(s.start.clip); if (!fs.existsSync(clipFile(s))) wanted.add(s.id); } }
  const todo = shots.filter((s) => wanted.has(s.id) && (flags.force ? only.includes(s.id) || !fs.existsSync(clipFile(s)) : !fs.existsSync(clipFile(s))));
  const plan = new Map(todo.map((s) => [s.id, buildInput(s, flags.engine)]));
  const est = [...plan.values()].reduce((sum, p) => sum + price(p.endpoint, p.input), 0);
  const ws = waves(todo);

  console.log(`project: ${project}`);
  console.log(`${fal.spentLine()} | shots to generate: ${todo.length} in ${ws.length} wave(s) | estimate ${fmtUsd(est)}`);
  ws.forEach((w, i) => { for (const s of w) { const p = plan.get(s.id); console.log(`  wave ${i + 1}  ${s.id.padEnd(18)} ${p.engine.padEnd(5)} ${String(p.input.duration).padStart(2)}s  ${fmtUsd(price(p.endpoint, p.input))}  start=${typeof s.start === "object" ? "last frame of " + s.start.clip : s.start}${s.end ? "  end=" + s.end : ""}`); } });
  if (!todo.length) return;
  if (flags.dry) { console.log("(dry run: nothing generated)"); return; }
  fal.requireKey();
  fal.guard(est);
  fs.mkdirSync(clipsDir, { recursive: true });
  fs.mkdirSync(framesDir, { recursive: true });

  const one = async (shot) => {
    const { engine, endpoint, input } = plan.get(shot.id);
    let startImg;
    if (typeof shot.start === "object") {
      const src = clipFile(byId.get(shot.start.clip));
      if (!fs.existsSync(src)) throw new Error(`${shot.id}: start clip ${shot.start.clip} is missing`);
      startImg = lastFrame(src, path.join(framesDir, `${shot.start.clip}-last.png`));
    } else {
      startImg = fromProject(project, shot.start);
      if (!fs.existsSync(startImg)) throw new Error(`${shot.id}: start image not found: ${startImg}`);
    }
    const body = { ...input, image_url: dataUri(startImg) };
    if (shot.end) {
      const endImg = fromProject(project, shot.end);
      if (!fs.existsSync(endImg)) throw new Error(`${shot.id}: end image not found: ${endImg}`);
      body[engine === "kling" ? "tail_image_url" : "end_image_url"] = dataUri(endImg);
    }
    const t0 = Date.now();
    const res = await fal.run(endpoint, body, { label: shot.id });
    const url = res.video && res.video.url;
    if (!url) throw new Error(`${shot.id}: no video in the response: ${JSON.stringify(res).slice(0, 300)}`);
    const out = flags.force ? nextFree(clipFile(shot)) : clipFile(shot);
    const bytes = await fal.download(url, out);
    const info = ffprobe(out);
    const usd = price(endpoint, input);
    const total = fal.record({ kind: "clip", endpoint, engine, label: shot.id, usd, out: path.relative(project, out), start: typeof shot.start === "object" ? `last frame of ${shot.start.clip}` : shot.start, end: shot.end, input: body, result: { duration: info.duration, width: info.width, height: info.height, fps: info.fps }, disclosure: DISCLOSURE, seconds: Math.round((Date.now() - t0) / 1000) });
    console.log(`✓ ${shot.id} → ${path.relative(project, out)} (${info.width}×${info.height} ${info.duration.toFixed(2)}s, ${Math.round(bytes / 1024)} KB, ${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
  };

  for (const [i, w] of ws.entries()) {
    console.log(`— wave ${i + 1}/${ws.length}: ${w.map((s) => s.id).join(", ")}`);
    if (flags.serial) for (const s of w) await one(s);
    else await mapLimit(w, 6, one);
  }
  console.log("done. Review each clip (node tools/media.mjs frames <clip> <dir>) before placing it; label every clip as AI-generated on screen.");
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
