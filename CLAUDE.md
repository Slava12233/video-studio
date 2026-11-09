# Video Studio: rules for the agent

This repo is a video creator and editor run by Slava (technical operator, Hebrew in chat). Videos are Hebrew-first.
The stack: Claude Code + the HyperFrames plugin (HTML -> video, vendored in the repo) + fal.ai (generation, TTS, avatars, transcription)
+ the Node tools in `tools/` + the second brain in `memory/` (an Obsidian vault). The laptop-wide rules in
`~/.claude/CLAUDE.md` outrank this file, except the chat language (see "Working with Slava"). `.claude/rules/` holds
the detailed rules: the unscoped ones load every session, the path-scoped ones when you touch matching files.
**Read `memory/HOT.md` before anything else** (the SessionStart hook injects it; if it is not in your context, read it).

## Map
- `projects/<date>-<slug>/`: one folder per video (a HyperFrames project). `inputs/` originals (read-only), `ai/`
  generated media + job files, `script/` VO and beats, `assets/` fonts, css, converted footage, `renders/` drafts,
  `BRIEF.md`, `TREATMENT.md`, `STORYBOARD.md`, `transcript.json`, `captions.json`, `ai-ledger.jsonl`.
- `tools/hf.mjs`: the HyperFrames CLI launcher pinned to the release vendored in this repo (below). Always
  `node tools/hf.mjs <cmd>` from the root or `node ../../tools/hf.mjs <cmd>` inside a project. Never bare `npx hyperframes`.
- `.claude/skills/hyperframes-plugin/`: the HyperFrames plugin release (0.8.160) vendored whole as a project-level
  plugin; Claude Code loads the folder in place as `hf@skills-dir`, so its 21 skills are typed `/hf:<skill>`
  (`hf:hyperframes` routes, `hf:hyperframes-core` is the authoring contract, `hf:hyperframes-cli` the CLI). `VENDORED.json`
  carries the version, the commit and a hash per skill; `node tools/vendor-hyperframes.mjs --check` verifies, a re-vendor
  is Slava's call. The marketplace copy `hyperframes@hyperframes` stays off in `.claude/settings.json` so nothing is
  offered twice (the vendored copy is named `hf` because an installed `hyperframes` plugin shadows a same-named folder).
- `tools/new-video.mjs` (`/new-video`), `tools/deliver.mjs` (`/deliver`), `tools/doctor.mjs` (`/studio-doctor`),
  `tools/media.mjs` (ffmpeg helpers: probe, poster, frames, last-frame, crop, trim, concat, to-h264),
  `tools/loudnorm.mjs` (two-pass loudness), `tools/fal/*.mjs` (edit-images, generate-images, image-to-video, audio,
  tts, avatar, upscale, transcribe: priced, ledgered, `--dry` first).
- `memory/`: the second brain, an Obsidian vault over this folder. `HOT.md` (generated, read first), `INDEX.md`
  (generated, grep it), `state/current.md` + `state/roadmap.md`, `projects/` (one note per video), `lessons/<category>/`,
  `decisions/`, `open/`, `sessions/YYYY-MM/`, `references/`, `maps/` (what each lane reads first), `inbox/` (Slava's
  Hebrew inbox + the agents' proposals), `bases/` (dashboards), `templates/`; contract `memory/README.md`.
  `tools/memory/` (build-hot, build-capabilities, lint, new-note, log, obsidian-setup), `.claude/hooks/` (session-start,
  pre-compact; Slava installs them from `docs/hooks-paste-block.md`), `docs/OBSIDIAN.md` (Slava's guide).
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
   promo, social-ad, music-video, explainer). The tool also creates the project's memory note `memory/projects/<name>.md`.
2. Fill `BRIEF.md` with Slava; confirm it back in two or three lines. Questions one at a time with a recommended
   default; stop asking when the build can start.
3. Plan: the `director` agent (or `hf:hyperframes-creative` inline for small pieces) writes `TREATMENT.md`,
   the storyboard / beat table and draft AI job files. Speech first: `/transcribe` then `/caption-cues`.
4. Media: `/ai-lab` or the `media-lab` agent. `--dry`, estimate, **explicit go from Slava**, run, inspect frames, label.
5. Build: `hf:hyperframes` routes to the workflow; the `compositor` agent or you author the composition.
   The plugin's skills are the source of truth for composition rules; read them from `.claude/skills/hyperframes-plugin/skills/`.
6. `check` -> bounded draft render (`/render`) -> `/review-cut` (or the `qa-reviewer` agent) on the rendered file
   -> fix -> `/deliver` (or the `deliverer` agent; the tool logs the delivery into the project note).
7. `/sync` at the end of every session: the memory closed (project notes, lessons, decisions, state, HOT regenerated,
   lint), no commit.

Memory runs through every step: a stage change, a ruling by Slava, a finding or a wait is written in the same turn
(`.claude/rules/memory.md`), never only said in chat.

## Subagents (`.claude/agents/`)
`director` (opus) plans; `compositor` (opus) builds; `media-lab` (sonnet) generates only with a `GO: $<amount>` line
in its prompt; `transcriber` (sonnet) transcribes and plans captions; `qa-reviewer` (sonnet) reviews read-only;
`deliverer` (sonnet) renders the final; `librarian` (sonnet) finds what the vault needs consolidated and proposes,
never writes canonical notes. Models are explicit, never `inherit`. Every agent reads `memory/HOT.md` and its lane map
(`memory/maps/<lane>.md`) first, writes its outputs inside the project folder, and proposes lessons in
`memory/inbox/proposals.md`. Each agent reports in a fixed shape; relay what matters to Slava. One heavy run on the
machine at a time applies across agents too.

## Memory: the second brain (details in `.claude/rules/memory.md`, contract `memory/README.md`)
`memory/` is the harness's memory and how it evolves: the status of the work, what we learn, the lessons and Slava's
rulings live there, never only in a chat. **Read first:** `memory/HOT.md`, `memory/state/current.md`, the lane map
in `memory/maps/` for the work at hand; everything else by grepping `memory/INDEX.md` or `/recall <topic>`.
**Write in the same turn:** a project stage (`node tools/memory/log.mjs project <name> "..." --status <stage>`), a
ruling by Slava (`node tools/memory/new-note.mjs decision <slug> --summary "..."`), a finding
(`new-note.mjs lesson <slug> --category <rendering|composition|fal|hebrew-rtl|workflow|tooling|harness|operator>`),
a wait (`new-note.mjs open <slug> --owner slava|harness`), a session line (`log.mjs session "..."`). Sub-agents only
propose (`memory/inbox/proposals.md`). **Rituals:** `/sync` closes every session (regenerate, lint, no commit);
`/consolidate` weekly promotes a lesson earned twice into `docs/` or a rule; `/recall` before any new research.
Generated notes (`HOT.md`, `INDEX.md`, `capabilities/*`, HOME's block) are never hand-edited; notes are superseded
or archived, never deleted. Slava's pages (`memory/HOME.md`, `memory/inbox/owner.md`) are Hebrew; the rest English.
**An action is not done until its memory is written.**

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
**Language: Hebrew, in every session in this repo.** Every message to Slava is in Hebrew, and so is every question
asked with `AskUserQuestion` (question, header, options and their descriptions), the task list and the wrap-up box.
This overrides the "English only" line in `~/.claude/CLAUDE.md`, for this repo only. Code, commands, paths and repo
files keep their language. Subagent reports may stay in English; what reaches Slava from them is relayed in Hebrew.
His vault pages (`memory/HOME.md`, `memory/inbox/owner.md`, the bases' labels) are Hebrew too; machine-facing notes
(state, projects, lessons, decisions, sessions, maps) stay English.

Lead with the result or the decision. Show, don't describe: path plus a poster frame after each draft. Say the
expected time before a long render and the estimate before a paid step. A failure gets one sentence on what failed
and one on what you try next. Verify on the rendered file before reporting anything as done.

## Never
- Never print or paste a key; never commit `.env`; never read `.env` with Read or `cat`.
- Never modify or delete anything in `inputs/`; never delete a project (move it to `projects/_archive/`).
- Never `hyperframes publish`, `cloud` or upload a video anywhere without an explicit yes.
- Never invent property facts, prices, results or names. Use the brief.
- Never re-vendor or upgrade the HyperFrames release (`tools/vendor-hyperframes.mjs`) or a project's pinned CLI
  mid-project; releases, plugins and settings changes are Slava's.
- Never git commit or push unless Slava asks for that commit.
- Never hand-edit a generated memory note, delete a note (supersede or archive it), or leave a stage change, ruling,
  lesson or wait out of `memory/`. Never edit Slava's part of HOME or his inbox lines.
- Never install hooks or edit `.claude/settings.json` yourself: prepare the paste block (`docs/hooks-paste-block.md`),
  then stop.
