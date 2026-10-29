---
name: new-video
description: Start a new video project in this studio - talking-head reel, photo/footage film, AI presenter explainer, product promo, social ad, music-driven video or faceless explainer. Use whenever Slava wants a new video and no project folder exists for it yet. Scaffolds projects/<date>-<slug> with the brand palette, local Hebrew fonts, RTL css, a BRIEF.md and the AI job examples, then routes to the HyperFrames workflow.
argument-hint: <talking-head|photo-film|avatar-explainer|promo|social-ad|music-video|explainer> <slug> [--brand <folder in brand/>] [--resolution portrait|landscape|square] [--video <file>] [--audio <file>]
---

# New video

Arguments: `$ARGUMENTS` (type, slug, optional brand / resolution / source files).

- Type missing: pick it from the request. Presenter footage -> `talking-head`; photos or clips to turn into a film ->
  `photo-film`; a still of a person plus a script -> `avatar-explainer`; a product, site or brief to market ->
  `promo`; a short punchy cut, title or count-up -> `social-ad`; a track that should drive the cut -> `music-video`;
  text or notes to explain with invented visuals -> `explainer`.
- Slug missing: a short ASCII slug from the topic (2-3 words, hyphens). Brand missing: `_default` unless the request
  names a client that has a folder in `brand/`.
- Resolution defaults: talking-head, social-ad, music-video -> portrait; the rest -> landscape. Override only when a
  platform needs another shape.

## Steps

1. From the studio root:
   ```bash
   node tools/new-video.mjs <type> <slug> [--brand <name>] [--resolution ...] [--video <file>] [--audio <file>]
   ```
   Pass `--video` / `--audio` when the source file already exists. The tool runs `hyperframes init` through the
   installed plugin's CLI (pinned version), then adds `inputs/`, `ai/` (with every `*.example.json`), `script/`,
   `renders/`, `assets/fonts` + `assets/hebrew.css` (brand palette inlined), the brand logo, `BRIEF.md`,
   `STUDIO-NOTES.md`. HyperFrames' own `CLAUDE.md` inside the project is its rulebook: keep it.
2. Copy source files into `inputs/` (copy, never move; originals stay untouched). Phone footage that is not H.264 MP4:
   `node tools/media.mjs to-h264 <in> <out.mp4>` into `assets/`.
3. Fill `BRIEF.md` with Slava: goal, audience, platform/format, length, language, voice, must-have shots or lines,
   brand, facts allowed on screen, deadline. One question at a time, each with a recommended default; stop asking
   when the build can start. Keep `Brand: <name>` on the header line (`deliver.mjs` reads it).
4. Read `docs/WORKFLOWS.md` (the section for this type) and skim `docs/FIELD-NOTES.md` once per session.
5. Hand off: `cd` into the project and invoke the `hyperframes:hyperframes` skill with the brief. Build there. Every
   HyperFrames command is `node ../../tools/hf.mjs <cmd>`; never bare `npx hyperframes`. For an `avatar-explainer`,
   run `/avatar-presenter` before the HyperFrames build; for captions, `/transcribe` then `/caption-cues`.
