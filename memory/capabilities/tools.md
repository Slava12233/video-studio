---
type: capability
created: 2026-11-09
status: active
maintained_by: generated
categories: [capabilities]
summary: The 23 Node tools under tools/ with their one-line purpose, generated.
generated_at: 2026-11-09T21:14+02:00
content_hash: 9a3e3c7e1f8c82c7
---

# Tools

Never hand-edit; run node tools/memory/build-capabilities.mjs
Run from the studio root as `node tools/<path>`; paid fal tools take `--dry` first; renders and ffmpeg start with Git Bash `timeout N`.

| Tool | What it does |
|---|---|
| `tools/deliver.mjs` | Finish a video: delivery-quality render (bounded, segmented, resumable), two-pass loudness to -14 LUFS, |
| `tools/doctor.mjs` | Studio health check. Prints one line per requirement with a fix hint, writes .verify-report.txt at the studio root, |
| `tools/fal/audio.mjs` | Music beds and sound effects on fal.ai. |
| `tools/fal/avatar.mjs` | Audio-driven AI presenter clips on fal.ai: one still of the presenter + one voice chunk -> a talking clip. |
| `tools/fal/edit-images.mjs` | Edit photos with Google's Nano Banana models on fal.ai: declutter, virtual staging, fix details, |
| `tools/fal/fal.mjs` | Shared fal.ai client for the studio tools: queue API + polling, CDN uploads, downloads, a price table, a |
| `tools/fal/generate-images.mjs` | Generate stills (B-roll backgrounds, abstract plates, mood frames) on fal.ai. |
| `tools/fal/image-to-video.mjs` | Camera-move clips from stills (image-to-video) on fal.ai. Built for real-estate films: a still of a room |
| `tools/fal/transcribe.mjs` | Word-level transcription through fal.ai (no local Whisper needed; works for Hebrew on Windows). |
| `tools/fal/tts.mjs` | Voice-over from a script through fal.ai TTS. Hebrew-tested engines (2026-10-24/25, see docs/FIELD-NOTES.md): |
| `tools/fal/upscale.mjs` | Video upscale on fal.ai with Topaz (`fal-ai/topaz/upscale/video`, $0.01 per second of input; verified 2026-10-24: |
| `tools/hf.mjs` | HyperFrames launcher for this studio. |
| `tools/loudnorm.mjs` | Two-pass EBU R128 loudness normalization with ffmpeg (video stream copied, audio re-encoded AAC 192k). |
| `tools/media.mjs` | ffmpeg helpers for the studio (ffmpeg is found on PATH or in the winget package folder automatically). |
| `tools/memory/build-capabilities.mjs` | tools/memory/build-capabilities.mjs: generates the capability map under memory/capabilities/ from what is |
| `tools/memory/build-hot.mjs` | tools/memory/build-hot.mjs: generates the vault's derived notes from the real notes (contract memory/README.md). |
| `tools/memory/lib.mjs` | tools/memory/lib.mjs: shared helpers for the memory vault tools (build-hot, build-capabilities, lint, new-note, |
| `tools/memory/lint.mjs` | tools/memory/lint.mjs: the vault lint of contract memory/README.md. Node 20+, no dependencies. |
| `tools/memory/log.mjs` | tools/memory/log.mjs: the append-only write path of the vault (contract memory/README.md): one dated line into |
| `tools/memory/new-note.mjs` | tools/memory/new-note.mjs: creates a vault note from its template with correct frontmatter (contract memory/README.md). |
| `tools/memory/obsidian-setup.mjs` | tools/memory/obsidian-setup.mjs: makes Obsidian ready for this studio's vault without a click. |
| `tools/new-video.mjs` | Scaffold a new video project under projects/<date>-<slug>/: a HyperFrames project (via the repo's pinned |
| `tools/vendor-hyperframes.mjs` | tools/vendor-hyperframes.mjs: vendors the pinned HyperFrames plugin release into this repo as a Claude Code |
