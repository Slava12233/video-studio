#!/usr/bin/env node
// Word-level transcription through fal.ai (no local Whisper needed; works for Hebrew on Windows).
//
//   engine "scribe"  = ElevenLabs Scribe v2 (default): word timestamps, strong Hebrew, ~$0.008 per minute
//   engine "whisper" = Whisper large v3 with chunk_level=word (fallback, may be unlisted on some accounts)
//
// Writes <project>/transcript.json in the HyperFrames shape  { text, language, words: [{ text, start, end }] }
// (the embedded-captions and talking-head workflows read `.words`), and optionally an SRT sidecar.
//
// Usage:
//   node tools/fal/transcribe.mjs <video-or-audio> --project <dir> [--lang he|en|auto] [--engine scribe|whisper]
//                                 [--out transcript.json] [--srt captions.srt] [--keyterms "הבית,CRM"] [--dry]
//
// Afterwards PROOF-READ the transcript: fix names, brand words and numbers before building captions.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ffmpeg, ffprobe, fmtUsd, fromProject, isMainModule, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, dataUri, price } from "./fal.mjs";

const ENGINES = { scribe: "fal-ai/elevenlabs/speech-to-text/scribe-v2", whisper: "fal-ai/whisper" };
const ISO3 = { he: "heb", iw: "heb", en: "eng", ru: "rus", ar: "ara", fr: "fra", es: "spa", de: "deu", it: "ita", pt: "por", uk: "ukr", am: "amh", yi: "yid" };

/** Group words into SRT cues: up to `maxWords` words or `maxSec` seconds, break early at sentence punctuation. */
export function toSrt(words, { maxWords = 4, maxSec = 2.4 } = {}) {
  const cues = [];
  let cur = [];
  const flush = () => { if (cur.length) { cues.push({ start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map((w) => w.text).join(" ") }); cur = []; } };
  for (const w of words) {
    cur.push(w);
    const span = w.end - cur[0].start;
    if (cur.length >= maxWords || span >= maxSec || /[.!?؟。]$/.test(w.text)) flush();
  }
  flush();
  const ts = (s) => { const ms = Math.round(s * 1000); const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), sec = Math.floor((ms % 60000) / 1000), r = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")},${String(r).padStart(3, "0")}`; };
  return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(Math.max(c.end, c.start + 0.3))}\n${c.text}\n`).join("\n");
}

function normalizeWords(engine, res) {
  if (engine === "scribe") {
    return (res.words || []).filter((w) => (w.type || "word") === "word" && String(w.text || "").trim()).map((w) => ({ text: String(w.text).trim(), start: +Number(w.start).toFixed(3), end: +Number(w.end).toFixed(3) }));
  }
  return (res.chunks || []).filter((c) => String(c.text || "").trim()).map((c) => ({ text: String(c.text).trim(), start: +Number(c.timestamp[0]).toFixed(3), end: +Number(c.timestamp[1] ?? c.timestamp[0] + 0.3).toFixed(3) }));
}

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const media = positional[0];
  if (!media) { console.error("usage: node tools/fal/transcribe.mjs <video-or-audio> --project <dir> [--lang he|en|auto] [--engine scribe|whisper] [--srt file.srt]"); process.exit(2); }
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const engine = String(flags.engine || "scribe");
  if (!ENGINES[engine]) throw new Error('engine must be "scribe" or "whisper"');
  const lang = String(flags.lang || "he");
  const src = fromProject(project, media);
  if (!fs.existsSync(src)) throw new Error(`media not found: ${src}`);
  const info = ffprobe(src);
  const minutes = Math.max(0.1, info.duration / 60);
  const endpoint = ENGINES[engine];
  const est = price(endpoint, { _minutes: minutes });
  const out = fromProject(project, String(flags.out || "transcript.json"));

  console.log(`media   : ${src} (${info.duration.toFixed(1)} s, audio ${info.hasAudio ? "yes" : "NO"})`);
  console.log(`engine  : ${engine} (${endpoint}), language ${lang}`);
  console.log(`estimate: ${fmtUsd(est)} | ${fal.spentLine()}`);
  if (!info.hasAudio) throw new Error("the file has no audio track");
  if (flags.dry) { console.log("(dry run)"); return; }
  fal.requireKey();
  fal.guard(est);

  // Small mono MP3 keeps the data URI light (1 min ≈ 360 KB).
  const tmp = path.join(os.tmpdir(), `hf-transcribe-${process.pid}.mp3`);
  ffmpeg(["-i", src, "-vn", "-ac", "1", "-ar", "16000", "-c:a", "libmp3lame", "-b:a", "48k", tmp]);
  let input;
  if (engine === "scribe") {
    input = { audio_url: dataUri(tmp), tag_audio_events: false, diarize: false };
    if (lang !== "auto") input.language_code = ISO3[lang] || lang;
    if (flags.keyterms) input.keyterms = String(flags.keyterms).split(",").map((s) => s.trim()).filter(Boolean).slice(0, 100);
  } else {
    input = { audio_url: dataUri(tmp), task: "transcribe", chunk_level: "word" };
    if (lang !== "auto") input.language = lang === "iw" ? "he" : lang;
  }
  const t0 = Date.now();
  let res;
  try { res = await fal.run(endpoint, input, { label: `transcribe:${engine}` }); } finally { fs.rmSync(tmp, { force: true }); }
  const words = normalizeWords(engine, res);
  if (!words.length) throw new Error(`no words came back: ${JSON.stringify(res).slice(0, 400)}`);
  const transcript = {
    text: res.text || words.map((w) => w.text).join(" "),
    language: res.language_code || (res.inferred_languages && res.inferred_languages[0]) || lang,
    engine: endpoint,
    source: path.relative(project, src),
    duration: info.duration,
    created: new Date().toISOString(),
    words,
  };
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(transcript, null, 1), "utf8");
  let srtPath = null;
  if (flags.srt) { srtPath = fromProject(project, flags.srt === true ? "captions.srt" : String(flags.srt)); fs.writeFileSync(srtPath, toSrt(words), "utf8"); }
  const usd = price(endpoint, { _minutes: minutes, ...(input.keyterms ? { _keyterms: true } : {}) }) * (input.keyterms ? 1.3 : 1);
  const total = fal.record({ kind: "transcript", endpoint, label: `transcribe ${path.basename(src)}`, usd: +usd.toFixed(4), out: path.relative(project, out), minutes: +minutes.toFixed(2), words: words.length, input: { ...input, audio_url: "<data-uri>" }, disclosure: "Transcript only; not a visual asset.", seconds: Math.round((Date.now() - t0) / 1000) });
  console.log(`✓ ${words.length} words → ${path.relative(project, out)}${srtPath ? ` + ${path.relative(project, srtPath)}` : ""} (${fmtUsd(usd)}; project total ${fmtUsd(total)})`);
  console.log(`first words: ${words.slice(0, 12).map((w) => w.text).join(" ")}`);
  console.log("Now proof-read the transcript (names, brand words, numbers) before building captions.");
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
