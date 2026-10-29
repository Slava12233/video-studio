#!/usr/bin/env node
// Generate stills (B-roll backgrounds, abstract plates, mood frames) on fal.ai.
//
//   model "flux" = FLUX.1 schnell (default, ~$0.003/MP, 2 s)   |   "pro" = Nano Banana Pro ($0.15, best for text/brand mockups)
//
// Jobs file (default <project>/ai/images.json; see templates/project-base/ai-jobs/images.example.json):
//   { "jobs": [ { "id": "skyline", "prompt": "...", "model": "flux", "size": "portrait_16_9", "seed": 7 } ] }
//   size (flux):  square_hd | square | portrait_4_3 | portrait_16_9 | landscape_4_3 | landscape_16_9 | {"width":1080,"height":1920}
//   aspect (pro): 16:9 | 9:16 | 1:1 | 4:5 | 3:2 ...   resolution (pro): 1K | 2K | 4K
//
// Usage:
//   node tools/fal/generate-images.mjs --project <dir> --dry
//   node tools/fal/generate-images.mjs --project <dir> [ids...] [--force]
//   node tools/fal/generate-images.mjs --project <dir> --prompt "..." --id skyline [--size portrait_16_9] [--model pro]
//
// Output: <project>/ai/images/<id>.png + ledger line with an AI disclosure.
import fs from "node:fs";
import path from "node:path";
import { fmtUsd, fromProject, isMainModule, mapLimit, nextFree, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, price } from "./fal.mjs";

const MODELS = { flux: "fal-ai/flux/schnell", pro: "fal-ai/nano-banana-pro" };
export const DISCLOSURE = "AI-generated image (fal.ai). Must carry the on-screen disclosure label when shown as if real.";

function loadJobs(project, flags) {
  if (flags.prompt) return [{ id: String(flags.id || "image"), prompt: String(flags.prompt), model: String(flags.model || "flux"), size: flags.size, aspect: flags.aspect, resolution: flags.resolution, seed: flags.seed !== undefined ? Number(flags.seed) : undefined }];
  const file = fromProject(project, flags.jobs || path.join("ai", "images.json"));
  if (!fs.existsSync(file)) throw new Error(`jobs file not found: ${file}\nCopy ai/images.example.json to ai/images.json, or pass --prompt "..." --id name.`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const jobs = Array.isArray(j) ? j : j.jobs;
  for (const job of jobs || []) if (!job.id || !job.prompt) throw new Error(`${file}: every job needs id and prompt`);
  return jobs || [];
}

function buildInput(job) {
  const model = job.model || "flux";
  if (model === "pro") {
    const input = { prompt: job.prompt, num_images: 1, output_format: "png", aspect_ratio: job.aspect || "16:9", resolution: job.resolution || "1K" };
    if (job.seed !== undefined) input.seed = job.seed;
    return { endpoint: MODELS.pro, input, ext: "png" };
  }
  if (model !== "flux") throw new Error(`job ${job.id}: model must be "flux" or "pro"`);
  const input = { prompt: job.prompt, num_images: 1, output_format: "png", num_inference_steps: 4, image_size: job.size || "landscape_16_9" };
  if (job.seed !== undefined) input.seed = job.seed;
  return { endpoint: MODELS.flux, input, ext: "png" };
}

async function main() {
  const { flags, positional: only } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const jobs = loadJobs(project, flags);
  const outDir = path.join(fal.AI_DIR, "images");
  const outFile = (job) => path.join(outDir, `${job.id}.png`);
  const todo = jobs.filter((j) => (!only.length || only.includes(j.id)) && (flags.force || !fs.existsSync(outFile(j))));
  const plan = todo.map((j) => ({ job: j, ...buildInput(j) }));
  const est = plan.reduce((s, p) => s + price(p.endpoint, p.input), 0);

  console.log(`project: ${project}`);
  console.log(`${fal.spentLine()} | images to generate: ${plan.length} | estimate ${fmtUsd(est)}`);
  for (const p of plan) console.log(`  ${p.job.id.padEnd(18)} ${p.job.model || "flux"}  ${p.input.image_size ? JSON.stringify(p.input.image_size) : p.input.aspect_ratio + " " + p.input.resolution}`);
  if (!plan.length) return;
  if (flags.dry) { console.log("(dry run: nothing generated)"); return; }
  fal.requireKey();
  fal.guard(est);

  await mapLimit(plan, 4, async ({ job, endpoint, input }) => {
    const t0 = Date.now();
    const res = await fal.run(endpoint, input, { label: job.id });
    const url = res.images && res.images[0] && res.images[0].url;
    if (!url) throw new Error(`${job.id}: no image in the response: ${JSON.stringify(res).slice(0, 300)}`);
    const out = flags.force ? nextFree(outFile(job)) : outFile(job);
    const bytes = await fal.download(url, out);
    const usd = price(endpoint, input);
    const total = fal.record({ kind: "image", endpoint, label: job.id, usd, out: path.relative(project, out), input, seed: res.seed, disclosure: DISCLOSURE, seconds: Math.round((Date.now() - t0) / 1000) });
    console.log(`✓ ${job.id} → ${path.relative(project, out)} (${Math.round(bytes / 1024)} KB, ${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
  });
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
