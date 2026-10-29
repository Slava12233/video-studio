#!/usr/bin/env node
// Voice-over from a script through fal.ai TTS. Hebrew-tested engines (2026-10-24/25, see docs/FIELD-NOTES.md):
//   engine "eleven"  = ElevenLabs v4 `elevenlabs/tts/eleven-v4` ($0.08 per 1k chars; Hebrew with language_code "he";
//                      voices Adam / Brian / Daniel / George; studio default George, stability 0.5, similarity 0.75, speed 1.0)
//   engine "minimax" = MiniMax Speech 2.8 HD `fal-ai/minimax/speech-2.8-hd` ($0.10 per 1k chars; voices Determined_Man,
//                      Elegant_Man, Deep_Voice_Man; <#0.4#> pause tags; reads at about 1.9 words/s at speed 1.0)
//
// Jobs file (default <project>/ai/tts.json; see ai/tts.example.json):
//   { "jobs": [ { "id": "vo", "engine": "eleven", "voice": "George", "lang": "he", "textFile": "script/vo.txt",
//                 "speed": 1.0, "stability": 0.5, "similarity": 0.75 } ] }
//   text | textFile   the script (paragraph breaks give 0.3-0.6 s pauses on ElevenLabs)
//
// Usage:
//   node tools/fal/tts.mjs --project <dir> --dry
//   node tools/fal/tts.mjs --project <dir> [ids...] [--force]
//
// Output: <project>/ai/audio/<id>.mp3 + ledger line (disclosure: AI-generated voice). Then READ IT BACK with
// tools/fal/transcribe.mjs and splice a re-synthesized sentence instead of regenerating the whole take.
import fs from "node:fs";
import path from "node:path";
import { ffprobe, fmtUsd, fromProject, isMainModule, mapLimit, nextFree, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, price } from "./fal.mjs";

const ENGINES = { eleven: "elevenlabs/tts/eleven-v4", minimax: "fal-ai/minimax/speech-2.8-hd" };
export const DISCLOSURE = "AI-generated voice (fal.ai TTS). Disclose at the start of the video (spoken or on-screen note) and in DISCLOSURE.txt.";

function loadJobs(project, jobsFile) {
  const file = fromProject(project, jobsFile || path.join("ai", "tts.json"));
  if (!fs.existsSync(file)) throw new Error(`jobs file not found: ${file}\nCopy ai/tts.example.json to ai/tts.json and fill it.`);
  const j = JSON.parse(fs.readFileSync(file, "utf8"));
  const jobs = Array.isArray(j) ? j : j.jobs;
  if (!Array.isArray(jobs) || !jobs.length) throw new Error(`${file}: expected { "jobs": [ ... ] }`);
  for (const job of jobs) {
    if (!job.id || (!job.text && !job.textFile)) throw new Error(`${file}: every job needs id and text or textFile`);
    if (job.engine && !ENGINES[job.engine]) throw new Error(`${file}: job ${job.id}: engine must be "eleven" or "minimax"`);
    if (job.textFile) {
      const f = fromProject(project, job.textFile);
      if (!fs.existsSync(f)) throw new Error(`${job.id}: textFile not found: ${f}`);
      job.text = fs.readFileSync(f, "utf8").replace(/\r\n/g, "\n").trim();
    }
  }
  return jobs;
}

export function buildInput(job) {
  const engine = job.engine || "eleven";
  if (engine === "eleven") {
    return { engine, endpoint: ENGINES.eleven, input: { text: job.text, voice: job.voice || "George", language_code: job.lang || "he", stability: job.stability ?? 0.5, similarity_boost: job.similarity ?? 0.75, speed: job.speed ?? 1.0 } };
  }
  return { engine, endpoint: ENGINES.minimax, input: { text: job.text, voice_setting: { voice_id: job.voice || "Determined_Man", speed: job.speed ?? 1.0, vol: job.vol ?? 1, pitch: job.pitch ?? 0 }, output_format: "url" } };
}

async function main() {
  const { flags, positional: only } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const jobs = loadJobs(project, flags.jobs);
  const outDir = path.join(fal.AI_DIR, "audio");
  const outFile = (job) => path.join(outDir, `${job.id}.mp3`);
  const todo = jobs.filter((j) => (!only.length || only.includes(j.id)) && (flags.force || !fs.existsSync(outFile(j))));
  const plan = todo.map((j) => ({ job: j, ...buildInput(j) }));
  const est = plan.reduce((s, p) => s + price(p.endpoint, p.input), 0);

  console.log(`project: ${project}`);
  console.log(`${fal.spentLine()} | voice-overs to synthesize: ${plan.length} | estimate ${fmtUsd(est)}`);
  for (const p of plan) {
    const words = p.job.text.split(/\s+/).filter(Boolean).length;
    const voice = p.input.voice || p.input.voice_setting.voice_id;
    console.log(`  ${p.job.id.padEnd(18)} ${p.engine.padEnd(7)} ${voice.padEnd(16)} ${String(p.job.text.length).padStart(5)} chars / ${words} words ~ ${Math.round(words / 1.9)} s  ${fmtUsd(price(p.endpoint, p.input))}`);
  }
  if (!plan.length) return;
  if (flags.dry) { console.log("(dry run: nothing synthesized)"); return; }
  fal.requireKey();
  fal.guard(est);

  await mapLimit(plan, 3, async ({ job, engine, endpoint, input }) => {
    const t0 = Date.now();
    const res = await fal.run(endpoint, input, { label: job.id });
    const url = res.audio && res.audio.url;
    if (!url) throw new Error(`${job.id}: no audio in the response: ${JSON.stringify(res).slice(0, 300)}`);
    const out = flags.force ? nextFree(outFile(job)) : outFile(job);
    const bytes = await fal.download(url, out);
    const info = ffprobe(out);
    const usd = price(endpoint, input);
    const total = fal.record({ kind: "voice", endpoint, engine, label: job.id, usd: +usd.toFixed(4), out: path.relative(project, out), chars: job.text.length, result: { duration: info.duration }, input: { ...input, text: `<${job.text.length} chars>` }, disclosure: DISCLOSURE, seconds: Math.round((Date.now() - t0) / 1000) });
    console.log(`ok ${job.id} -> ${path.relative(project, out)} (${info.duration.toFixed(1)} s, ${Math.round(bytes / 1024)} KB, ${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
  });
  console.log("done. Read every take back: node ../../tools/fal/transcribe.mjs ai/audio/<id>.mp3 --project . --lang he --out ai/audio/<id>.readback.json");
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
