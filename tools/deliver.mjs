#!/usr/bin/env node
// Finish a video: delivery-quality render (bounded, segmented, resumable), two-pass loudness to -14 LUFS,
// poster frame, AI ledger copy and DISCLOSURE.txt in deliverables/<project>/, plus delivery.json with the facts.
//
//   timeout 1800 node tools/deliver.mjs --project <dir> [--fps 24|30] [--workers 2|4] [--composition index.html]
//                          [--no-render]        package the newest MP4 in <project>/renders/ instead of rendering
//                          [--no-loudnorm]      keep the rendered loudness (default: normalize when audio exists)
//                          [--name <base>]      output file base name (default: project folder name)
//                          [--max-minutes 27]   inner bound for the render; the outer Git Bash timeout is the real one
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { STUDIO_ROOT, ffprobe, fmtUsd, isMainModule, parseArgs, resolveProject } from "./lib/studio.mjs";
import { runHf } from "./hf.mjs";
import { poster } from "./media.mjs";
import { normalize, measure } from "./loudnorm.mjs";
import { studioFal } from "./fal/fal.mjs";

function rootDuration(indexHtml) {
  const html = fs.readFileSync(indexHtml, "utf8");
  const m = html.match(/data-composition-id="[^"]*"[^>]*data-duration="([\d.]+)"/) || html.match(/data-duration="([\d.]+)"[^>]*data-composition-id=/);
  return m ? Number(m[1]) : null;
}

function newestMp4(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".mp4")).map((f) => ({ f: path.join(dir, f), t: fs.statSync(path.join(dir, f)).mtimeMs })).sort((a, b) => b.t - a.t);
  return files.length ? files[0].f : null;
}

function projectBrand(project) {
  const brief = path.join(project, "BRIEF.md");
  if (!fs.existsSync(brief)) return "_default";
  const m = fs.readFileSync(brief, "utf8").match(/\bBrand:\s*([A-Za-z0-9_-]+)/);
  return m && fs.existsSync(path.join(STUDIO_ROOT, "brand", m[1])) ? m[1] : "_default";
}

function disclosureText(items, labelBlock) {
  const ai = items.filter((i) => i.disclosure && !/Transcript only/.test(i.disclosure));
  const lines = [`AI DISCLOSURE - generated ${new Date().toISOString().slice(0, 10)}`, ""];
  if (!ai.length) {
    lines.push("No AI-generated or AI-edited images, clips, voices or audio were used in this video.", "", "Transcription and editing tools may have been used; they do not alter what the footage shows.");
  } else {
    lines.push(`${ai.length} AI-generated or AI-edited asset(s) were used. Each visual one must be labeled on screen while visible; an AI voice is disclosed at the start (see brand/_default/DISCLOSURE.md).`, "");
    for (const i of ai) lines.push(`- ${i.kind || "asset"}  ${i.label || ""}  ->  ${i.out || ""}`, `    model: ${i.endpoint}   cost: ${fmtUsd(i.usd)}   at: ${i.at}`, `    ${i.disclosure}`);
    lines.push("", `Total AI spend recorded: ${fmtUsd(ai.reduce((s, i) => s + (Number(i.usd) || 0), 0))}`);
  }
  if (labelBlock) lines.push("", "Standard label texts:", labelBlock.trim());
  return lines.join("\n") + "\n";
}

async function main() {
  const { flags } = parseArgs(process.argv.slice(2), ["no-loudnorm"]);
  const project = resolveProject(flags);
  if (!fs.existsSync(path.join(project, "index.html"))) throw new Error(`not a HyperFrames project (no index.html): ${project}`);
  const slug = path.basename(project);
  const base = String(flags.name || slug);
  const outDir = path.join(STUDIO_ROOT, "deliverables", slug);
  fs.mkdirSync(outDir, { recursive: true });
  const final = path.join(outDir, `${base}.mp4`);
  const rendersDir = path.join(project, "renders");
  let source;

  if (flags["no-render"]) {
    source = newestMp4(rendersDir);
    if (!source) throw new Error("--no-render given but renders/ has no MP4");
    console.log(`1/5 using ${path.relative(project, source)}`);
  } else {
    console.log("1/5 check");
    const chk = runHf(["check", "."], { cwd: project });
    if (chk.status !== 0) throw new Error("check reported errors; fix them before delivering");
    const dur = rootDuration(path.join(project, "index.html"));
    const workers = String(flags.workers || (os.totalmem() / 2 ** 30 >= 24 ? 4 : 2));
    source = path.join(rendersDir, `${base}-delivery.mp4`);
    const args = ["render", ".", "-q", String(flags.quality || "delivery"), "-o", source, "--workers", workers, "--experimental-fast-capture=false"];
    if (flags.composition) args.splice(2, 0, "-c", String(flags.composition));
    if (flags.fps) args.push("-f", String(flags.fps));
    const segmented = dur === null || dur > 45;
    if (segmented) { process.env.HF_SEGMENTED_CAPTURE = "true"; args.push("--keep-segments", "--resume"); }
    console.log(`2/5 render (${dur ? dur + " s" : "unknown length"}, ${workers} workers, ${segmented ? "segmented + resumable" : "single pass"})`);
    const r = runHf(args, { cwd: project, timeoutMs: Number(flags["max-minutes"] || 27) * 60 * 1000 });
    if (r.timedOut) throw new Error(`render stopped after ${flags["max-minutes"] || 27} minutes. Re-run the same command: captured segments are reused (--resume).`);
    if (r.status !== 0 || !fs.existsSync(source)) throw new Error(`render failed (exit ${r.status})`);
    if (segmented) fs.rmSync(path.join(rendersDir, ".hf-segments"), { recursive: true, force: true });
  }

  const info0 = ffprobe(source);
  if (info0.hasAudio && !flags["no-loudnorm"]) {
    console.log("3/5 loudness -> -14 LUFS / -1 dBTP (two-pass, video stream copied)");
    const m = normalize(source, final);
    console.log(`     input ${m.input_i} LUFS -> output ${m.output_i} LUFS, true peak ${m.output_tp} dBTP`);
  } else {
    console.log(`3/5 ${info0.hasAudio ? "loudness left as rendered (--no-loudnorm)" : "no audio track: nothing to normalize"}`);
    fs.copyFileSync(source, final);
  }

  console.log("4/5 poster + facts");
  const info = ffprobe(final);
  const posterFile = poster(final, path.join(outDir, `${base}-poster.jpg`), Math.min(1.0, info.duration * 0.25));
  const fal = studioFal(project);
  const { items, total_usd } = fal.readLedger();
  if (fs.existsSync(fal.LEDGER)) fs.copyFileSync(fal.LEDGER, path.join(outDir, "ai-ledger.jsonl"));
  if (fs.existsSync(path.join(project, "BRIEF.md"))) fs.copyFileSync(path.join(project, "BRIEF.md"), path.join(outDir, "BRIEF.md"));
  const brand = projectBrand(project);
  const discFile = [path.join(STUDIO_ROOT, "brand", brand, "DISCLOSURE.md"), path.join(STUDIO_ROOT, "brand", "_default", "DISCLOSURE.md")].find((f) => fs.existsSync(f));
  const labelBlock = discFile ? (fs.readFileSync(discFile, "utf8").match(/## Label texts[\s\S]*?(?=\n## |$)/) || [""])[0] : "";
  fs.writeFileSync(path.join(outDir, "DISCLOSURE.txt"), disclosureText(items, labelBlock), "utf8");
  let loudness = null;
  if (info.hasAudio) { try { const mm = measure(final); loudness = { lufs: Number(mm.input_i), true_peak_dbtp: Number(mm.input_tp) }; } catch { /* non-fatal */ } }
  const facts = { project: slug, brand, file: path.basename(final), poster: path.basename(posterFile), duration_s: +info.duration.toFixed(2), width: info.width, height: info.height, fps: info.fps, size_mb: +(info.sizeBytes / 2 ** 20).toFixed(1), has_audio: info.hasAudio, loudness, ai_assets: items.filter((i) => i.disclosure && !/Transcript only/.test(i.disclosure)).length, ai_spend_usd: total_usd, delivered: new Date().toISOString() };
  fs.writeFileSync(path.join(outDir, "delivery.json"), JSON.stringify(facts, null, 2));

  console.log("5/5 done");
  console.log(`  video   : ${final}`);
  console.log(`  poster  : ${posterFile}`);
  console.log(`  facts   : ${info.width}x${info.height} | ${info.duration.toFixed(1)} s | ${info.fps} fps | ${facts.size_mb} MB | audio ${info.hasAudio ? `yes (${loudness ? loudness.lufs + " LUFS" : "unmeasured"})` : "no"}`);
  console.log(`  AI      : ${facts.ai_assets} disclosed asset(s), ${fmtUsd(total_usd)} spent -> DISCLOSURE.txt + ai-ledger.jsonl`);
  console.log("  verify  : extract 3 frames from THIS file at caption/badge times before reporting (node tools/media.mjs frames ...).");
}

if (isMainModule(import.meta.url)) main().catch((e) => { console.error(`error: ${e.message}`); process.exit(1); });
