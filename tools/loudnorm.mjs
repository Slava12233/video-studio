#!/usr/bin/env node
// Two-pass EBU R128 loudness normalization with ffmpeg (video stream copied, audio re-encoded AAC 192k).
// HyperFrames renders land around -20 LUFS; platforms expect about -14 LUFS / -1 dBTP. Measure, never trust by ear.
//
//   node tools/loudnorm.mjs <in.mp4> <out.mp4> [--i -14] [--tp -1] [--lra 11]
//   node tools/loudnorm.mjs measure <file>                print integrated loudness, true peak, LRA (JSON)
//   node tools/loudnorm.mjs window <file> --ss 12 --t 4   mean/max volume of a time window (volumedetect)
import fs from "node:fs";
import path from "node:path";
import { ffmpeg, isMainModule, parseArgs } from "./lib/studio.mjs";

function parseLoudnormJson(stderr) {
  const i = stderr.lastIndexOf("{");
  const j = stderr.lastIndexOf("}");
  if (i < 0 || j < i) throw new Error("loudnorm did not print its JSON block (is the file audio-less?)");
  return JSON.parse(stderr.slice(i, j + 1));
}

/** Pass 1: measure. Returns the loudnorm stats object (input_i, input_tp, input_lra, input_thresh, target_offset). */
export function measure(file, { I = -14, TP = -1, LRA = 11 } = {}) {
  const r = ffmpeg(["-i", file, "-vn", "-af", `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`, "-f", "null", "-"], { quiet: false });
  return parseLoudnormJson(r.stderr || "");
}

/** Pass 2: normalize `input` into `out` using the pass-1 measurement (linear mode). Returns the stats of both passes. */
export function normalize(input, out, { I = -14, TP = -1, LRA = 11 } = {}) {
  const m = measure(input, { I, TP, LRA });
  const af = `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const r = ffmpeg(["-i", input, "-af", af, "-ar", "48000", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out], { quiet: false });
  const p2 = parseLoudnormJson(r.stderr || "");
  return { ...m, output_i: p2.output_i, output_tp: p2.output_tp, output_lra: p2.output_lra };
}

/** Mean and max volume of a window (dB), for checking a music bed under speech or in pauses. */
export function windowVolume(file, ss, t) {
  const r = ffmpeg(["-ss", String(ss), "-t", String(t), "-i", file, "-vn", "-af", "volumedetect", "-f", "null", "-"], { quiet: false });
  const mean = (r.stderr.match(/mean_volume:\s*(-?[\d.]+)/) || [])[1];
  const max = (r.stderr.match(/max_volume:\s*(-?[\d.]+)/) || [])[1];
  return { ss, t, mean_db: mean ? Number(mean) : null, max_db: max ? Number(max) : null };
}

if (isMainModule(import.meta.url)) {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  try {
    if (positional[0] === "measure") console.log(JSON.stringify(measure(positional[1]), null, 2));
    else if (positional[0] === "window") console.log(JSON.stringify(windowVolume(positional[1], Number(flags.ss || 0), Number(flags.t || 4))));
    else if (positional.length >= 2) {
      const s = normalize(positional[0], positional[1], { I: Number(flags.i ?? -14), TP: Number(flags.tp ?? -1), LRA: Number(flags.lra ?? 11) });
      console.log(`${positional[1]}: ${s.input_i} LUFS -> ${s.output_i} LUFS, true peak ${s.output_tp} dBTP`);
    } else { console.error("usage: node tools/loudnorm.mjs <in> <out> | measure <file> | window <file> --ss S --t T"); process.exit(2); }
  } catch (e) { console.error(e.message); process.exit(1); }
}
