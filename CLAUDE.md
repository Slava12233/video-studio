# Video Studio: rules for the agent

This repo is a video creator and editor run by Slava (technical operator, English in chat). Videos are Hebrew-first.
The stack: Claude Code + the HyperFrames plugin (HTML -> video) + fal.ai (generation, TTS, avatars, transcription)
+ the Node tools in `tools/`. The laptop-wide rules in `~/.claude/CLAUDE.md` outrank this file. `.claude/rules/`
holds the detailed rules: the unscoped ones load every session, the path-scoped ones when you touch matching files.

## Map
- `projects/<date>-<slug>/`: one folder per video (a HyperFrames project). `inputs/` originals (read-only), `ai/`
  generated media + job files, `script/` VO and beats, `assets/` fonts, css, converted footage, `renders/` drafts,
  `BRIEF.md`, `TREATMENT.md`, `STORYBOARD.md`, `transcript.json`, `captions.json`, `ai-ledger.jsonl`.
- `tools/hf.mjs`: the HyperFrames CLI launcher pinned to the installed plugin. Always `node tools/hf.mjs <cmd>` from
  the root or `node ../../tools/hf.mjs <cmd>` inside a project. Never bare `npx hyperframes`.
- `tools/new-video.mjs` (`/new-video`), `tools/deliver.mjs` (`/deliver`), `tools/doctor.mjs` (`/studio-doctor`),
  `tools/media.mjs` (ffmpeg helpers: probe, poster, frames, last-frame, crop, trim, concat, to-h264),
  `tools/loudnorm.mjs` (two-pass loudness), `tools/fal/*.mjs` (edit-images, generate-images, image-to-video, audio,
  tts, avatar, upscale, transcribe: priced, ledgered, `--dry` first).
- `brand/<client>/`: `BRAND.md`, `palette.css`, `logo/`; `_default/` also holds the fonts and `DISCLOSURE.md`.
  Add a client by copying `_default/` (see `brand/README.md`).
- `templates/briefs/` one brief per video type; `templates/project-base/` what every project gets.
- `docs/WORKFLOWS.md` (how each of the seven types is made), `docs/FIELD-NOTES.md` (gotchas: read before the first
  render or generation of a session), `docs/FAL-ENDPOINTS.md` (verified prices and limits), `docs/TROUBLESHOOTING.md`,
  `docs/REFERENCES.md` (external skills).
- `deliverables/<date>-<slug>/`: final MP4 (-14 LUFS), poster, `DISCLOSURE.txt`, ledger, brief, `delivery.json`.
- `node tools/doctor.mjs --render` writes a throwaway 2 s composition into `.studio-smoke/` and renders it to prove
  the chain on a machine; nothing else ships as an example.

## How every video runs
1. No project yet: `/new-video <type> <slug> [--brand <client>]` (types: talking-head, photo-film, avatar-explainer,
   promo, social-ad, music-video, explainer).
2. Fill `BRIEF.md` with Slava; confirm it back in two or three lines. Questions one at a time with a recommended
   default; stop asking when the build can start.
3. Plan: the `director` agent (or `hyperframes:hyperframes-creative` inline for small pieces) writes `TREATMENT.md`,
   the storyboard / beat table and draft AI job files. Speech first: `/transcribe` then `/caption-cues`.
4. Media: `/ai-lab` or the `media-lab` agent. `--dry`, estimate, **explicit go from Slava**, run, inspect frames, label.
5. Build: `hyperframes:hyperframes` routes to the workflow; the `compositor` agent or you author the composition.
   The plugin's skills are the source of truth for composition rules; read them from the installed plugin.
6. `check` -> bounded draft render (`/render`) -> `/review-cut` (or the `qa-reviewer` agent) on the rendered file
   -> fix -> `/deliver` (or the `deliverer` agent).

## Subagents (`.claude/agents/`)
`director` (opus) plans; `compositor` (opus) builds; `media-lab` (sonnet) generates only with a `GO: $<amount>` line
in its prompt; `transcriber` (sonnet) transcribes and plans captions; `qa-reviewer` (sonnet) reviews read-only;
`deliverer` (sonnet) renders the final. Models are explicit, never `inherit`. Each agent reports in a fixed shape;
relay what matters to Slava. One heavy run on the machine at a time applies across agents too.

## Machine limits (details in `.claude/rules/machine-limits.md`)
Every render, encode or `ffmpeg` call starts with Git Bash `timeout N` (renders 1800, ffmpeg 540), foreground,
`--workers 4`, `--experimental-fast-capture=false`, one heavy run at a time on this laptop, exit 124 is the bound
(report, kill your leftovers by PID, one retry with `--resume`). Never background a render; never kill another
session's process.

## fal.ai (details in `.claude/rules/fal-spend.md`)
No hard cap: every paid step prints its estimate first and waits for an explicit go in chat; every call lands in the
project ledger with its disclosure. The fal MCP is for discovery and schema; paid runs go through `tools/fal/`.
`FAL_KEY` lives in `.env` and is never printed or pasted (`.claude/rules/secrets.md`).

## Disclosure (details in `.claude/rules/disclosure.md`)
Every AI-generated or AI-edited visual carries the `.ai-badge` for its whole on-screen time; AI voices are disclosed
at the start; `DISCLOSURE.txt` comes from the ledger. Doubts go to Slava, never decided silently. `inputs/` is
read-only. No private names, numbers or addresses without the brief's approval.

## Hebrew and RTL (details in `.claude/rules/hebrew-rtl.md`)
Local Heebo / Rubik / Inter fonts, `.he` blocks, `.ltr` / `.num` for Latin and digits, captions 2-4 words within
80 ms of the transcript, safe zones on 9:16, `dir="rtl"` never on `<html>`.

## Working with Slava
Lead with the result or the decision. Show, don't describe: path plus a poster frame after each draft. Say the
expected time before a long render and the estimate before a paid step. A failure gets one sentence on what failed
and one on what you try next. Verify on the rendered file before reporting anything as done.

## Never
- Never print or paste a key; never commit `.env`; never read `.env` with Read or `cat`.
- Never modify or delete anything in `inputs/`; never delete a project (move it to `projects/_archive/`).
- Never `hyperframes publish`, `cloud` or upload a video anywhere without an explicit yes.
- Never invent property facts, prices, results or names. Use the brief.
- Never upgrade the HyperFrames plugin or a project's pinned CLI mid-project; plugin and settings changes are Slava's.
- Never git commit or push unless Slava asks for that commit.
