#!/usr/bin/env node
// ffmpeg helpers for the studio (ffmpeg is found on PATH or in the winget package folder automatically).
//
//   node tools/media.mjs probe <file>                               duration, size, fps, audio → JSON
//   node tools/media.mjs last-frame <video> <out.png> [--offset 0.08]   last frame (used to chain AI clips)
//   node tools/media.mjs poster <video> <out.jpg> [--at 1.0]        one frame at a time (seconds)
//   node tools/media.mjs frames <video> <outdir> [--every 2]        one JPG every N seconds (quick visual check)
//   node tools/media.mjs audio <video> <out.mp3|wav>                extract the audio track
//   node tools/media.mjs crop <image> <out.png> --aspect 16:9|9:16|1:1|4:5 [--x 0.5] [--y 0.5]
//                                                                    biggest window of that aspect; x/y = where it sits (0..1)
//   node tools/media.mjs trim <in> <out> --start 3 --end 8          cut a range (re-encodes, frame-accurate)
//   node tools/media.mjs concat <out.mp4> <a.mp4> <b.mp4> ...       join clips with identical codecs (no re-encode)
//   node tools/media.mjs to-h264 <in> <out.mp4> [--fps 30]          normalize phone footage to H.264 / AAC
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ffmpeg, ffprobe, isMainModule, parseArgs } from "./lib/studio.mjs";

export function lastFrame(video, out, offset = 0.08) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  ffmpeg(["-sseof", `-${offset}`, "-i", video, "-frames:v", "1", "-update", "1", out]);
  return out;
}

export function poster(video, out, at = 1.0) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const info = ffprobe(video);
  const t = Math.max(0, Math.min(at, Math.max(0, info.duration - 0.05)));
  ffmpeg(["-ss", String(t), "-i", video, "-frames:v", "1", "-update", "1", "-q:v", "2", out]);
  return out;
}

export function frames(video, outdir, every = 2) {
  fs.mkdirSync(outdir, { recursive: true });
  ffmpeg(["-i", video, "-vf", `fps=1/${every},scale=-2:540`, "-q:v", "3", path.join(outdir, "f-%03d.jpg")]);
  return fs.readdirSync(outdir).filter((f) => f.endsWith(".jpg")).map((f) => path.join(outdir, f));
}

export function extractAudio(video, out) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const wav = out.toLowerCase().endsWith(".wav");
  ffmpeg(["-i", video, "-vn", ...(wav ? ["-ac", "2", "-ar", "48000"] : ["-c:a", "libmp3lame", "-q:a", "2"]), out]);
  return out;
}

export function crop(image, out, aspect = "16:9", x = 0.5, y = 0.5) {
  const [aw, ah] = aspect.split(":").map(Number);
  const info = ffprobe(image);
  const W = info.width, H = info.height;
  let w = W, h = Math.round((W * ah) / aw);
  if (h > H) { h = H; w = Math.round((H * aw) / ah); }
  const X = Math.round((W - w) * Math.min(1, Math.max(0, x)));
  const Y = Math.round((H - h) * Math.min(1, Math.max(0, y)));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  ffmpeg(["-i", image, "-vf", `crop=${w}:${h}:${X}:${Y}`, "-frames:v", "1", "-update", "1", out]);
  return { out, w, h, X, Y };
}

export function trim(input, out, start, end) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const args = ["-ss", String(start), "-i", input];
  if (end !== undefined) args.push("-to", String(Number(end) - Number(start)));
  ffmpeg([...args, "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  return out;
}

export function concat(out, inputs) {
  const list = path.join(os.tmpdir(), `hf-concat-${process.pid}.txt`);
  fs.writeFileSync(list, inputs.map((f) => `file '${path.resolve(f).replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  try { ffmpeg(["-f", "concat", "-safe", "0", "-i", list, "-c", "copy", "-movflags", "+faststart", out]); } finally { fs.rmSync(list, { force: true }); }
  return out;
}

export function toH264(input, out, fps) {
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const vf = fps ? ["-fps_mode", "cfr", "-r", String(fps)] : [];
  ffmpeg(["-i", input, ...vf, "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out]);
  return out;
}

if (isMainModule(import.meta.url)) {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [cmd, ...rest] = positional;
  try {
    switch (cmd) {
      case "probe": console.log(JSON.stringify(ffprobe(rest[0]), null, 2)); break;
      case "last-frame": console.log(lastFrame(rest[0], rest[1], Number(flags.offset || 0.08))); break;
      case "poster": console.log(poster(rest[0], rest[1], Number(flags.at || 1.0))); break;
      case "frames": console.log(frames(rest[0], rest[1], Number(flags.every || 2)).join("\n")); break;
      case "audio": console.log(extractAudio(rest[0], rest[1])); break;
      case "crop": console.log(JSON.stringify(crop(rest[0], rest[1], String(flags.aspect || "16:9"), Number(flags.x ?? 0.5), Number(flags.y ?? 0.5)))); break;
      case "trim": console.log(trim(rest[0], rest[1], Number(flags.start || 0), flags.end !== undefined ? Number(flags.end) : undefined)); break;
      case "concat": console.log(concat(rest[0], rest.slice(1))); break;
      case "to-h264": console.log(toH264(rest[0], rest[1], flags.fps ? Number(flags.fps) : undefined)); break;
      default:
        console.error("usage: node tools/media.mjs <probe|last-frame|poster|frames|audio|crop|trim|concat|to-h264> ... (see the header of this file)");
        process.exit(2);
    }
  } catch (e) { console.error(e.message); process.exit(1); }
}
