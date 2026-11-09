---
type: state
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [state]
summary: "The studio now: no video project yet; the second brain (Obsidian vault + tools + rules + hooks) installed 2026-11-09 and the hooks turned on with Slava's yes; FAL_KEY still missing; the commit is Slava's. Next actions numbered for the next session."
as_of: 2026-11-09
source: "files of the repo, tools/doctor.mjs report of 2026-10-30 (.verify-report.txt), node tools/fal/fal.mjs --project . (2026-11-09), winget list (2026-11-09), node tools/vendor-hyperframes.mjs --check and a headless claude -p probe (2026-11-09)"
---

# Current state

Every fact carries the date it was verified on a file or a run; anything not verified is marked **unverified**. Re-read the file before acting on a line.

## In flight

- **No video project yet** (`projects/` is empty, 2026-11-09). The studio was bootstrapped 2026-10-29 (commit `ba4cb6c`): HyperFrames plugin pinned at 0.8.160, fal tools, seven video types, rules, skills and six agents.
- **The second brain** was installed 2026-11-09: `memory/` vault, `tools/memory/`, `.claude/rules/memory.md`, the `memory-update`, `sync`, `consolidate`, `recall` skills, the `librarian` agent, the kepano Obsidian skills, the two hooks (installed in `.claude/settings.json` on Slava's yes), `docs/OBSIDIAN.md`. See [[2026-11-09-second-brain-in-obsidian]].
- **The HyperFrames skills live in the repo** since 2026-11-09: the 0.8.160 release is vendored whole into `.claude/skills/hyperframes-plugin/` as the plugin `hf` (21 skills typed `/hf:<skill>`, `VENDORED.json` with a hash per skill, `node tools/vendor-hyperframes.mjs --check` passes); `tools/hf.mjs` uses that copy first; every `hyperframes:` reference in the repo became `hf:`. The marketplace copy `hyperframes@hyperframes` is off in `.claude/settings.json` since Slava's yes in chat (2026-11-09), so a new session sees only the `hf:*` skills. See [[2026-11-09-hyperframes-skills-live-in-the-repo]], [[2026-11-09-turn-the-marketplace-hyperframes-copy-off]] (done).
- Everything is committed and pushed: `dfaf820` on `main` = `origin/main` (2026-11-09 21:23, on Slava's "push to git"; 1080 files). The working copy is clean apart from what the next session writes. The harness commits only on Slava's word.

## Next actions

1. Slava: put the fal.ai key after `FAL_KEY=` in `.env` (missing on 2026-11-09, by name); then `/studio-doctor` once (a new session also confirms only `hf:*` HyperFrames skills are listed).
2. First video: `/new-video <type> <slug>`; the project note is created with the folder; fill the brief; build with `hf:hyperframes`; `/sync` at the end of the session.
3. Slava, optional: `winget upgrade Obsidian.Obsidian` (1.13.7 → 1.15.0, needs admin); nothing here needs it.

## Environment (verified)

- Machine: Windows 11, 32 GB, Node v24.19.0, Git 2.55, FFmpeg 9.0.2 (doctor 2026-10-30, `.verify-report.txt`).
- Claude Code 2.1.319 (`claude --version`, 2026-11-09). HyperFrames release 0.8.160 vendored in `.claude/skills/hyperframes-plugin/` (commit `695110e46ba4`; `node tools/hf.mjs --where` says `source: vendored`, `--version` answers 0.8.160; the plugin cache under `~/.claude/plugins` holds the same release; upstream 0.8.217 on 2026-10-29, a re-vendor is Slava's). A headless probe on 2026-11-09 (`claude -p` with the marketplace copy off at the flag level) listed the 21 `hf:*` skills and no `hyperframes:*` skill.
- Obsidian 1.13.7 installed for all users at `C:\Program Files\Obsidian\` (winget `Obsidian.Obsidian`; 1.15.0 available, 2026-11-09); the CLI redirector `Obsidian.com` is next to the exe; the command line interface is enabled in Obsidian's config; this folder is registered as a vault (id `9c91eab3d3b3d06f`) and the CLI answered `vault info`, `search` and `base:query` through `node tools/memory/obsidian-setup.mjs --cli` with the app running (2026-11-09).
- The two memory hooks exist in `.claude/hooks/`, pass their tests, and are installed in `.claude/settings.json` since 2026-11-09 (Slava's yes in chat): SessionStart + SubagentStart inject HOT, PreCompact writes a checkpoint. The first new session after that start gets HOT automatically.
- `FAL_KEY`: **missing** in `.env` (2026-11-09). No AI generation, TTS or transcription until it is set.
- Other vaults on this machine (Slava's other harnesses) stay registered and untouched.

## Spend

- AI spend to date: $0.00 (no project ledger yet, 2026-11-09).
