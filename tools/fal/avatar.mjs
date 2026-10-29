#!/usr/bin/env node
// Audio-driven AI presenter clips on fal.ai: one still of the presenter + one voice chunk -> a talking clip.
// Verified 2026-10-24/25 (docs/FAL-ENDPOINTS.md, docs/FIELD-NOTES.md):
//   engine "omnihuman" = `bytedance/omnihuman/v2`  $0.105/s of output, keeps the still framing and gestures best,
//                        output 1284x716 for a 16:9 still (upscale with tools/fal/upscale.mjs), FAILS on chunks over ~17 s.
//   engine "kling"     = `fal-ai/kling-video/ai-avatar/v2/pro`  $0.115/s, 1920x1072 30 fps, restrained hands.
//   engine "heygen"    = `fal-ai/heygen/avatar4/image-to-video`  $0.10/s, true 1080p 25 fps, re-crops the still tighter.
// Stills must show what should move: waist-up, both hands visible, the stage baked in (no matting afterwards).
//
// Jobs file (default <project>/ai/avatar.json; see ai/avatar.example.json):
//   { "jobs": [ { "id": "seg-01", "engine": "omnihuman", "image": "inputs/avatar/polo-wide.png",
//                 "audio": "ai/audio/vo-01.mp3", "prompt": "calm presenter, natural hand gestures" } ] }
//
// Usage:
//   node tools/fal/avatar.mjs --project <dir> --dry
//   node tools/fal/avatar.mjs --project <dir> [ids...] [--force] [--engine omnihuman|kling|heygen]
//
// Output: <project>/ai/clips/<id>.mp4 + ledger line (disclosure: AI-generated presenter). Check EVERY clip's frames:
// spontaneous reframing cuts mid-sentence happen; decide per clip (keep as a jump cut, or regenerate once).
import fs from "node:fs";
import path from "node:path";
import { ffprobe, fmtUsd, fromProject, isMainModule, mapLimit, nextFree, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, price } from "./fal.mjs";

const ENGINES = { omnihuman: "bytedance/omnihuman/v2", kling: "fal-ai/kling-video/ai-avatar/v2/pro", heygen: "fal-ai/heygen/avatar4/image-to-video" };
const MAX_SEC = { omnihuman: 17, kling: 60, heygen: 60 };
export const DISCLOSURE = "AI-generated presenter video (audio-driven avatar via fal.ai). Must be disclosed on screen for its whole visible time.";

function loadJobs(project, jobsFile) {
  const file = fromProject(project, jobsFile || path.join("ai", "avatar.json"));
  if (!fs.existsSync(file)) throw new Error(`jobs file not found: ${file}\nCopy ai/avatar.example.json to ai/avatar.json and fill it.`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const jobs = Array.isArray(j) ? j : j.jobs;
  if (!Array.isArray(jobs) || !jobs.length) throw new Error(`${file}: expected { "jobs": [ ... ] }`);
  for (const job of jobs) {
    if (!job.id || !job.image || !job.audio) throw new Error(`${file}: every job needs id, image and audio`);
    if (job.engine && !ENGINES[job.engine]) throw new Error(`${file}: job ${job.id}: engine must be omnihuman | kling | heygen`);
  }
  return jobs;
}

function buildInput(job, engineOverride, seconds) {
  const engine = engineOverride || job.engine || "omnihuman";
  const endpoint = ENGINES[engine];
  const input = { _seconds: seconds };
  if (job.prompt) input.prompt = job.prompt;
  if (engine === "heygen") Object.assign(input, { aspect_ratio: job.aspect_ratio || "16:9", resolution: job.resolution || "1080p", ...(job.talking_style ? { talking_style: job.talking_style } : {}), ...(job.background ? { background: job.background } : {}) });
  return { engine, endpoint, input };
}

async function main() {
  const { flags, positional: only } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const jobs = loadJobs(project, flags.jobs);
  const clipsDir = path.join(fal.AI_DIR, "clips");
  const clipFile = (j) => path.join(clipsDir, `${j.id}.mp4`);
  const todo = jobs.filter((j) => (!only.length || only.includes(j.id)) && (flags.force || !fs.existsSync(clipFile(j))));
  const plan = todo.map((j) => {
    const audio = fromProject(project, j.audio), image = fromProject(project, j.image);
    if (!fs.existsSync(audio)) throw new Error(`${j.id}: audio not found: ${audio}`);
    if (!fs.existsSync(image)) throw new Error(`${j.id}: image not found: ${image}`);
    const seconds = ffprobe(audio).duration;
    return { job: j, audio, image, seconds, ...buildInput(j, flags.engine, seconds) };
  });
  const est = plan.reduce((s, p) => s + price(p.endpoint, p.input), 0);

  console.log(`project: ${project}`);
  console.log(`${fal.spentLine()} | avatar clips to generate: ${plan.length} | estimate ${fmtUsd(est)}`);
  for (const p of plan) {
    const warn = p.seconds > MAX_SEC[p.engine] ? `  WARNING ${p.seconds.toFixed(1)} s is over the ${MAX_SEC[p.engine]} s limit that worked for ${p.engine}: split the audio at a sentence pause` : "";
    console.log(`  ${p.job.id.padEnd(18)} ${p.engine.padEnd(10)} ${p.seconds.toFixed(1).padStart(5)} s  ${fmtUsd(price(p.endpoint, p.input)).padStart(6)}  ${path.basename(p.image)} + ${path.basename(p.audio)}${warn}`);
  }
  if (!plan.length) return;
  if (flags.dry) { console.log("(dry run: nothing generated)"); return; }
  fal.requireKey();
  fal.guard(est);
  fs.mkdirSync(clipsDir, { recursive: true });

  await mapLimit(plan, 4, async ({ job, audio, image, seconds, engine, endpoint, input }) => {
    const body = { ...input, image_url: await fal.upload(image), audio_url: await fal.upload(audio) };
    const t0 = Date.now();
    const res = await fal.run(endpoint, body, { label: job.id, timeoutMs: 40 * 60 * 1000 });
    const url = res.video && res.video.url;
    if (!url) throw new Error(`${job.id}: no video in the response: ${JSON.stringify(res).slice(0, 300)}`);
    const out = flags.force ? nextFree(clipFile(job)) : clipFile(job);
    const bytes = await fal.download(url, out);
    const info = ffprobe(out);
    const usd = price(endpoint, { ...input, _seconds: seconds });
    const total = fal.record({ kind: "avatar-clip", endpoint, engine, label: job.id, usd: +usd.toFixed(4), out: path.relative(project, out), image: path.relative(project, image), audio: path.relative(project, audio), result: { duration: info.duration, width: info.width, height: info.height, fps: info.fps }, input: body, disclosure: DISCLOSURE, seconds: Math.round((Date.now() - t0) / 1000) });
    console.log(`ok ${job.id} -> ${path.relative(project, out)} (${info.width}x${info.height} ${info.fps} fps ${info.duration.toFixed(2)} s, ${Math.round(bytes / 1024)} KB, ${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
  });
  console.log("done. Make a frame sheet of every clip (node tools/media.mjs frames <clip> <dir> --every 1) and look for mid-sentence reframes before cutting.");
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
