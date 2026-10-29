#!/usr/bin/env node
// Scaffold a new video project under projects/<date>-<slug>/: a HyperFrames project (via the installed plugin's
// CLI, pinned CLI version), the brand palette + local fonts + RTL css, a BRIEF.md from the template for this
// video type, inputs/ (read-only originals), ai/ (generated media) and example AI job files.
//
//   node tools/new-video.mjs <type> <slug> [--brand <name>] [--resolution portrait|landscape|square]
//                            [--video <file>] [--audio <file>] [--date YYYY-MM-DD]
//
//   type   talking-head      presenter footage -> captions / overlay reel (portrait)
//          photo-film        stills or clips -> cinematic film with AI camera moves (landscape)
//          avatar-explainer  still + script -> TTS voice -> audio-driven avatar clips -> explainer (landscape)
//          promo             product / site / brief -> launch or explainer video (landscape)
//          social-ad         short punchy cut, title, count-up, logo sting (portrait)
//          music-video       a track drives a beat-synced cut of stills / clips / lyrics (portrait)
//          explainer         text / notes -> faceless explainer with invented visuals (landscape)
//   brand  a folder under brand/ (default _default). Palette -> assets/hebrew.css, logo -> assets/.
import fs from "node:fs";
import path from "node:path";
import { STUDIO_ROOT, copyDir, isMainModule, parseArgs, slugify, today } from "./lib/studio.mjs";
import { runHf } from "./hf.mjs";

export const TYPES = {
  "talking-head": { resolution: "portrait", skill: "embedded-captions", brief: "talking-head.md", workflow: "hyperframes:embedded-captions (captions only) or hyperframes:talking-head-recut (graphic overlays)" },
  "photo-film": { resolution: "landscape", skill: "general-video", brief: "photo-film.md", workflow: "hyperframes:general-video in companion mode; AI camera moves via /ai-lab clip" },
  "avatar-explainer": { resolution: "landscape", skill: "general-video", brief: "avatar-explainer.md", workflow: "/avatar-presenter (script -> TTS -> avatar clips), then hyperframes:general-video for captions, mockups and the end card" },
  promo: { resolution: "landscape", skill: "product-launch-video", brief: "promo.md", workflow: "hyperframes:product-launch-video (from a URL or brief) or hyperframes:faceless-explainer (text only)" },
  "social-ad": { resolution: "portrait", skill: "motion-graphics", brief: "social-ad.md", workflow: "hyperframes:motion-graphics (under ~30 s, motion is the message)" },
  "music-video": { resolution: "portrait", skill: "music-to-video", brief: "music-video.md", workflow: "hyperframes:music-to-video (the track's beat grid drives every cut)" },
  explainer: { resolution: "landscape", skill: "faceless-explainer", brief: "explainer.md", workflow: "hyperframes:faceless-explainer (invented visuals per scene, optional AI voice)" },
};

export function listBrands() {
  const dir = path.join(STUDIO_ROOT, "brand");
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
}

export function scaffold({ type, slug, brand = "_default", resolution, video, audio, date = today() }) {
  const spec = TYPES[type];
  if (!spec) throw new Error(`unknown type "${type}". Use one of: ${Object.keys(TYPES).join(", ")}`);
  const brandDir = path.join(STUDIO_ROOT, "brand", brand);
  if (!fs.existsSync(brandDir)) throw new Error(`unknown brand "${brand}". Folders in brand/: ${listBrands().join(", ")}`);
  const name = `${date}-${slugify(slug)}`;
  const projectsDir = path.join(STUDIO_ROOT, "projects");
  const dir = path.join(projectsDir, name);
  if (fs.existsSync(dir)) throw new Error(`project already exists: ${dir}`);
  fs.mkdirSync(projectsDir, { recursive: true });
  const res = resolution || spec.resolution;

  // 1. HyperFrames project through the plugin's CLI (pins the plugin's CLI version in package.json).
  const args = ["init", name, "--non-interactive", "--resolution", res, "--skip-transcribe", `--skill=${spec.skill}`];
  if (video) args.push("--video", path.resolve(video));
  if (audio) args.push("--audio", path.resolve(audio));
  const r = runHf(args, { cwd: projectsDir });
  if (r.status !== 0 || !fs.existsSync(path.join(dir, "index.html"))) throw new Error(`hyperframes init failed (exit ${r.status}). Run node tools/doctor.mjs.`);

  // 2. Studio additions: folders, fonts, palette, logo, job examples.
  fs.mkdirSync(path.join(dir, "inputs"), { recursive: true });
  fs.writeFileSync(path.join(dir, "inputs", "README.txt"), "Originals. READ-ONLY: never edit, overwrite or delete; edited versions go to ai/images/, converted footage to assets/.\n");
  fs.mkdirSync(path.join(dir, "ai"), { recursive: true });
  fs.mkdirSync(path.join(dir, "renders"), { recursive: true });
  fs.mkdirSync(path.join(dir, "script"), { recursive: true });
  copyDir(path.join(STUDIO_ROOT, "brand", "_default", "fonts"), path.join(dir, "assets", "fonts"));
  const base = fs.readFileSync(path.join(STUDIO_ROOT, "templates", "project-base", "hebrew.css"), "utf8");
  const paletteFile = [path.join(brandDir, "palette.css"), path.join(STUDIO_ROOT, "brand", "_default", "palette.css")].find((f) => fs.existsSync(f));
  fs.writeFileSync(path.join(dir, "assets", "hebrew.css"), base.replace("/* @palette */", fs.readFileSync(paletteFile, "utf8").trim()), "utf8");
  fs.copyFileSync(path.join(STUDIO_ROOT, "templates", "project-base", "gitignore"), path.join(dir, ".gitignore"));
  const jobsSrc = path.join(STUDIO_ROOT, "templates", "project-base", "ai-jobs");
  for (const f of fs.readdirSync(jobsSrc)) fs.copyFileSync(path.join(jobsSrc, f), path.join(dir, "ai", f));
  const logo = path.join(brandDir, "logo");
  for (const f of fs.existsSync(logo) ? fs.readdirSync(logo) : []) if (/\.(svg|png)$/i.test(f)) fs.copyFileSync(path.join(logo, f), path.join(dir, "assets", f));

  // 3. Brief from the template.
  const tpl = fs.readFileSync(path.join(STUDIO_ROOT, "templates", "briefs", spec.brief), "utf8");
  const brief = tpl.replaceAll("{{SLUG}}", name).replaceAll("{{DATE}}", date).replaceAll("{{TYPE}}", type).replaceAll("{{RESOLUTION}}", res).replaceAll("{{WORKFLOW}}", spec.workflow).replaceAll("{{BRAND}}", brand)
    .replaceAll("{{VIDEO}}", video ? path.basename(video) : "(none yet)").replaceAll("{{AUDIO}}", audio ? path.basename(audio) : "(none yet)");
  fs.writeFileSync(path.join(dir, "BRIEF.md"), brief, "utf8");

  // 4. Hebrew-ready index.html: language + the RTL stylesheet. The agent replaces the body anyway.
  const idx = path.join(dir, "index.html");
  let html = fs.readFileSync(idx, "utf8");
  html = html.replace('<html lang="en"', '<html lang="he"');
  if (!html.includes("assets/hebrew.css")) html = html.replace(/(<script[^>]*gsap[^>]*><\/script>)/, '$1\n    <link rel="stylesheet" href="assets/hebrew.css" />');
  fs.writeFileSync(idx, html, "utf8");

  // 5. Studio notes next to the HyperFrames-generated CLAUDE.md (that file is HyperFrames' own rulebook; keep it).
  fs.writeFileSync(path.join(dir, "STUDIO-NOTES.md"), [
    `# ${name}`, "",
    `Type: ${type} | Brand: ${brand} | Resolution: ${res} | Created: ${date}`, "",
    `Workflow: ${spec.workflow}`, "",
    "- Studio rules: ../../CLAUDE.md and ../../.claude/rules/ (Hebrew/RTL, fal spend, disclosure, render bounds).",
    "- HyperFrames commands: `node ../../tools/hf.mjs <cmd>` from this folder (never bare npx).",
    "- Transcript (Hebrew): `node ../../tools/fal/transcribe.mjs inputs/<file> --project . --lang he --dry` then without --dry.",
    "- AI media: copy ai/<kind>.example.json to ai/<kind>.json, run the tool with --dry, show the estimate, wait for a go.",
    "- Render drafts: `timeout 1800 node ../../tools/hf.mjs render . -q draft --workers 4 -o renders/draft.mp4`.",
    "- Finish: `timeout 1800 node ../../tools/deliver.mjs --project .` (bounded; re-run to resume).",
    "",
  ].join("\n"), "utf8");

  return { dir, name, type, brand, resolution: res, workflow: spec.workflow };
}

if (isMainModule(import.meta.url)) {
  const { flags, positional } = parseArgs(process.argv.slice(2));
  const [type, slug, resPositional] = positional;
  if (!type || !slug) {
    console.error(`usage: node tools/new-video.mjs <${Object.keys(TYPES).join("|")}> <slug> [--brand <name>] [--resolution portrait|landscape|square] [--video <file>] [--audio <file>]`);
    process.exit(2);
  }
  try {
    const out = scaffold({ type, slug, brand: flags.brand ? String(flags.brand) : "_default", resolution: flags.resolution || resPositional, video: flags.video, audio: flags.audio, date: flags.date });
    console.log(`\nproject ready: ${out.dir}`);
    console.log(`  type ${out.type} | brand ${out.brand} | ${out.resolution} | workflow: ${out.workflow}`);
    console.log("  next: copy source files into inputs/, fill BRIEF.md, then invoke the hyperframes:hyperframes skill inside that folder.");
  } catch (e) { console.error(`error: ${e.message}`); process.exit(1); }
}
