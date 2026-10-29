#!/usr/bin/env node
// Edit photos with Google's Nano Banana models on fal.ai: declutter, virtual staging, fix details,
// keep the room's geometry. Jobs come from a JSON file so nothing is hard-coded.
//
// Jobs file (default <project>/ai/edits.json; see templates/project-base/ai-jobs/edits.example.json):
//   { "jobs": [ { "id": "living", "src": "inputs/photos/living.jpg", "prompt": "...",
//                 "model": "nb2", "resolution": "2K", "aspect_ratio": "auto" } ] }
//   model      "nb2" = Nano Banana 2 (default, $0.06–0.16)   |   "pro" = Nano Banana Pro ($0.15–0.30)
//   src        one path or an array of paths (extra reference images), relative to the project
//   resolution "0.5K" | "1K" | "2K" | "4K"   (2K ≈ 2390×1792, enough for 1080p video)
//
// Usage:
//   node tools/fal/edit-images.mjs --project <dir> --dry             plan + estimate, no calls, no key needed
//   node tools/fal/edit-images.mjs --project <dir>                   run every job whose output is missing
//   node tools/fal/edit-images.mjs --project <dir> living kitchen    only these ids
//   node tools/fal/edit-images.mjs --project <dir> living --force    another try (numbered file)
//   node tools/fal/edit-images.mjs --project <dir> --jobs ai/other.json
//
// Output: <project>/ai/images/<id>.png + a line in <project>/ai-ledger.jsonl carrying an AI disclosure.
import fs from "node:fs";
import path from "node:path";
import { fmtUsd, fromProject, isMainModule, mapLimit, nextFree, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, dataUri, price } from "./fal.mjs";

const MODELS = { nb2: "fal-ai/nano-banana-2/edit", pro: "fal-ai/nano-banana-pro/edit" };
export const DISCLOSURE = "AI-edited image (Google Nano Banana via fal.ai). Must carry the on-screen disclosure label.";

export function loadJobs(project, jobsFile) {
  const file = fromProject(project, jobsFile || path.join("ai", "edits.json"));
  if (!fs.existsSync(file)) throw new Error(`jobs file not found: ${file}\nCopy ai/edits.example.json to ai/edits.json and fill it.`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const jobs = Array.isArray(j) ? j : j.jobs;
  if (!Array.isArray(jobs) || !jobs.length) throw new Error(`${file}: expected { "jobs": [ ... ] }`);
  for (const job of jobs) {
    if (!job.id || !job.prompt || !job.src) throw new Error(`${file}: every job needs id, src and prompt (offending: ${JSON.stringify(job).slice(0, 120)})`);
    if (job.model && !MODELS[job.model]) throw new Error(`${file}: job ${job.id}: model must be "nb2" or "pro"`);
  }
  return { file, jobs };
}

export function buildInput(job) {
  const input = { prompt: job.prompt, num_images: 1, output_format: "png", resolution: job.resolution || "1K", aspect_ratio: job.aspect_ratio || "auto" };
  if (job.seed !== undefined) input.seed = job.seed;
  return input;
}

async function main() {
  const { flags, positional: only } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const { jobs } = loadJobs(project, flags.jobs);
  const outDir = path.join(fal.AI_DIR, "images");
  const outFile = (job) => path.join(outDir, `${job.id}.png`);
  const todo = jobs.filter((j) => (!only.length || only.includes(j.id)) && (flags.force || !fs.existsSync(outFile(j))));
  const plan = todo.map((j) => ({ job: j, endpoint: MODELS[j.model || "nb2"], input: buildInput(j) }));
  const est = plan.reduce((s, p) => s + price(p.endpoint, p.input), 0);

  console.log(`project: ${project}`);
  console.log(`${fal.spentLine()} | edits to run: ${plan.length} | estimate ${fmtUsd(est)}`);
  for (const p of plan) console.log(`  ${p.job.id.padEnd(18)} ${p.job.model || "nb2"} ${p.input.resolution}  ← ${[].concat(p.job.src).join(", ")}`);
  if (!plan.length) return;
  if (flags.dry) { console.log("(dry run: nothing generated)"); return; }
  fal.requireKey();
  fal.guard(est);

  const results = await mapLimit(plan, 3, async ({ job, endpoint, input }) => {
    const srcs = [].concat(job.src).map((s) => fromProject(project, s));
    for (const s of srcs) if (!fs.existsSync(s)) throw new Error(`${job.id}: source image not found: ${s}`);
    const body = { ...input, image_urls: srcs.map(dataUri) };
    const t0 = Date.now();
    const res = await fal.run(endpoint, body, { label: job.id });
    const url = res.images && res.images[0] && res.images[0].url;
    if (!url) throw new Error(`${job.id}: no image in the response: ${JSON.stringify(res).slice(0, 300)}`);
    const out = flags.force ? nextFree(outFile(job)) : outFile(job);
    const bytes = await fal.download(url, out);
    const usd = price(endpoint, input);
    const total = fal.record({ kind: "image-edit", endpoint, label: job.id, usd, out: path.relative(project, out), sources: srcs.map((s) => path.relative(project, s)), input: body, note: job.note, disclosure: DISCLOSURE, seconds: Math.round((Date.now() - t0) / 1000) });
    console.log(`✓ ${job.id} → ${path.relative(project, out)} (${Math.round(bytes / 1024)} KB, ${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
    return out;
  });
  console.log(`done: ${results.length} image(s). Review them, then label every one as AI-edited where it appears on screen.`);
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
