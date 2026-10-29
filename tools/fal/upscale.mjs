#!/usr/bin/env node
// Video upscale on fal.ai with Topaz (`fal-ai/topaz/upscale/video`, $0.01 per second of input; verified 2026-10-24:
// 1.5x on a 1284x716 OmniHuman clip -> 1928x1076, H.264, keeps audio). The MCP flags the model "unlisted" but it runs.
//
//   node tools/fal/upscale.mjs --project <dir> <clip.mp4> [--factor 1.5] [--out ai/clips/<name>-up.mp4] [--dry]
import fs from "node:fs";
import path from "node:path";
import { ffprobe, fmtUsd, fromProject, isMainModule, parseArgs, resolveProject } from "../lib/studio.mjs";
import { studioFal, price } from "./fal.mjs";

const ENDPOINT = "fal-ai/topaz/upscale/video";

async function main() {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const project = resolveProject(flags);
  const fal = studioFal(project);
  const src = positional[0] && fromProject(project, positional[0]);
  if (!src || !fs.existsSync(src)) { console.error("usage: node tools/fal/upscale.mjs --project <dir> <clip.mp4> [--factor 1.5] [--out <file>] [--dry]"); process.exit(2); }
  const info = ffprobe(src);
  const factor = Number(flags.factor || 1.5);
  const out = fromProject(project, String(flags.out || path.join("ai", "clips", `${path.parse(src).name}-up.mp4`)));
  const input = { upscale_factor: factor, H264_output: true, _seconds: info.duration };
  const est = price(ENDPOINT, input);
  console.log(`${path.relative(project, src)}: ${info.width}x${info.height} ${info.duration.toFixed(1)} s -> x${factor} ~ ${Math.round(info.width * factor)}x${Math.round(info.height * factor)} | estimate ${fmtUsd(est)} | ${fal.spentLine()}`);
  if (flags.dry) { console.log("(dry run)"); return; }
  fal.requireKey();
  fal.guard(est);
  const body = { ...input, video_url: await fal.upload(src, { maxInline: 0 }) };
  const t0 = Date.now();
  const res = await fal.run(ENDPOINT, body, { label: "upscale", timeoutMs: 40 * 60 * 1000 });
  const url = res.video && res.video.url;
  if (!url) throw new Error(`no video in the response: ${JSON.stringify(res).slice(0, 300)}`);
  const bytes = await fal.download(url, out);
  const o = ffprobe(out);
  const total = fal.record({ kind: "upscale", endpoint: ENDPOINT, label: path.basename(src), usd: +est.toFixed(4), out: path.relative(project, out), source: path.relative(project, src), result: { duration: o.duration, width: o.width, height: o.height, fps: o.fps }, input: body, disclosure: "Upscaled with AI (Topaz via fal.ai); carries the source clip's own disclosure.", seconds: Math.round((Date.now() - t0) / 1000) });
  console.log(`ok ${path.relative(project, out)} (${o.width}x${o.height} ${o.duration.toFixed(2)} s, ${Math.round(bytes / 1024)} KB, ${fmtUsd(est)}; project total ${fmtUsd(total)})`);
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
