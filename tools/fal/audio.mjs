#!/usr/bin/env node
// Music beds and sound effects on fal.ai.
//
//   type "music" = Stable Audio 2.5 ($0.20 per track, up to 190 s, .wav)
//   type "sfx"   = ElevenLabs Sound Effects v2 ($0.002 per second, 0.5–22 s, .mp3; "loop": true for seamless loops)
//
// Jobs file (default <project>/ai/audio.json; see templates/project-base/ai-jobs/audio.example.json):
//   { "jobs": [
//       { "id": "bed",    "type": "music", "prompt": "warm minimal piano ... 96 BPM, no vocals", "seconds": 60, "seed": 7 },
//       { "id": "whoosh", "type": "sfx",   "prompt": "soft cinematic whoosh", "seconds": 1.2, "influence": 0.5 }
//   ] }
//
// Usage:
//   node tools/fal/audio.mjs --project <dir> --dry
//   node tools/fal/audio.mjs --project <dir> [ids...] [--force]
//
// Output: <project>/ai/audio/<id>.wav|mp3 and a ledger line (disclosure: AI-generated audio).
import fs from "node:fs";
import path from "node:path";
import { fmtUsd, fromProject, isMainModule, mapLimit, nextFree, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, price } from "./fal.mjs";

const TYPES = {
  music: { endpoint: "fal-ai/stable-audio-25/text-to-audio", ext: "wav" },
  sfx: { endpoint: "fal-ai/elevenlabs/sound-effects/v2", ext: "mp3" },
};
export const DISCLOSURE = "AI-generated audio (fal.ai). Credit as AI-generated music/SFX in the deliverable notes.";

function loadJobs(project, jobsFile) {
  const file = fromProject(project, jobsFile || path.join("ai", "audio.json"));
  if (!fs.existsSync(file)) throw new Error(`jobs file not found: ${file}\nCopy ai/audio.example.json to ai/audio.json and fill it.`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const jobs = Array.isArray(j) ? j : j.jobs;
  for (const job of jobs || []) {
    if (!job.id || !job.prompt || !TYPES[job.type]) throw new Error(`${file}: every job needs id, prompt and type "music" | "sfx"`);
  }
  return jobs || [];
}

function buildInput(job) {
  if (job.type === "music") {
    const input = { prompt: job.prompt, seconds_total: Math.min(190, Math.max(1, Math.round(job.seconds || 60))), num_inference_steps: 8, guidance_scale: job.guidance ?? 1 };
    if (job.seed !== undefined) input.seed = job.seed;
    return input;
  }
  return { text: job.prompt, duration_seconds: Math.min(22, Math.max(0.5, Number(job.seconds || 2))), prompt_influence: job.influence ?? 0.3, loop: Boolean(job.loop), output_format: "mp3_44100_192" };
}

async function main() {
  const { flags, positional: only } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const jobs = loadJobs(project, flags.jobs);
  const outDir = path.join(fal.AI_DIR, "audio");
  const outFile = (job) => path.join(outDir, `${job.id}.${TYPES[job.type].ext}`);
  const todo = jobs.filter((j) => (!only.length || only.includes(j.id)) && (flags.force || !fs.existsSync(outFile(j))));
  const plan = todo.map((j) => ({ job: j, endpoint: TYPES[j.type].endpoint, input: buildInput(j) }));
  const est = plan.reduce((s, p) => s + price(p.endpoint, p.input), 0);

  console.log(`project: ${project}`);
  console.log(`${fal.spentLine()} | audio to generate: ${plan.length} | estimate ${fmtUsd(est)}`);
  for (const p of plan) console.log(`  ${p.job.id.padEnd(18)} ${p.job.type.padEnd(5)} ${String(p.input.seconds_total || p.input.duration_seconds).padStart(4)}s  ${fmtUsd(price(p.endpoint, p.input))}`);
  if (!plan.length) return;
  if (flags.dry) { console.log("(dry run: nothing generated)"); return; }
  fal.requireKey();
  fal.guard(est);

  await mapLimit(plan, 4, async ({ job, endpoint, input }) => {
    const t0 = Date.now();
    const res = await fal.run(endpoint, input, { label: job.id });
    const url = res.audio && res.audio.url;
    if (!url) throw new Error(`${job.id}: no audio in the response: ${JSON.stringify(res).slice(0, 300)}`);
    const out = flags.force ? nextFree(outFile(job)) : outFile(job);
    const bytes = await fal.download(url, out);
    const usd = price(endpoint, input);
    const total = fal.record({ kind: `audio-${job.type}`, endpoint, label: job.id, usd, out: path.relative(project, out), input, seed: res.seed, disclosure: DISCLOSURE, seconds: Math.round((Date.now() - t0) / 1000) });
    console.log(`✓ ${job.id} → ${path.relative(project, out)} (${Math.round(bytes / 1024)} KB, ${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
  });
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
