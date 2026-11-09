---
type: state
created: 2026-11-09
status: active
maintained_by: generated
categories: [memory]
summary: What every session must know, generated from the vault notes; injected by the SessionStart hook.
generated_at: 2026-11-09T21:24+02:00
generated_by: /sync
content_hash: 946454e082ed000b
---

# HOT

Never hand-edit; run node tools/memory/build-hot.mjs
Read the note before you act; verify on the files before you change them; names and paths only, never a key or a private detail

## Now · [[current]] · as_of 2026-11-09
Next actions:
1. Slava: put the fal.ai key after `FAL_KEY=` in `.env` (missing on 2026-11-09, by name); then `/studio-doctor` once (a new session also confirms only `hf:*` HyperFrames skills are listed).
2. First video: `/new-video <type> <slug>`; the project note is created with the folder; fill the brief; build with `hf:hyperframes`; `/sync` at the end of the session.
3. Slava, optional: `winget upgrade Obsidian.Obsidian` (1.13.7 → 1.15.0, needs admin); nothing here needs it.
Projects in flight (0):
- none

## Open items by owner (1)
- slava · [[2026-11-09-fal-key-missing]] · Slava: put the fal.ai key after FAL_KEY= in .env (missing on 2026-11-09 by name); without it no generation, TTS, avatar or Hebrew transcription runs.

## Newest lessons (5 of 7)
- 2026-11-09 · [[2026-11-09-memory-tools-and-hooks-are-node-only-and-bounded]] · The memory layer is plain Markdown plus Node scripts and two hooks: no MCP server, no Python, no database; research of 2026-11-09 found that is also the community conver…
- 2026-11-09 · [[2026-11-09-the-marketing-harness-vault-is-the-house-style]] · Slava's marketing harness (D:/AgentTeams/marketing-team-harness-main) already carries a proven Obsidian-vault memory (contract, generated HOT/INDEX, lint, bases, hooks,…
- 2026-11-09 · [[2026-11-09-a-bounded-headless-claude-p-shows-what-a-session-would-load]] · To see what a new session would load (skills, plugins, hooks) without asking Slava to restart, run a bounded headless session from the studio root: timeout 240 claude -p…
- 2026-11-09 · [[2026-11-09-a-skills-dir-plugin-named-like-an-installed-plugin-is-not-loaded]] · A plugin folder under .claude/skills/ (with .claude-plugin/plugin.json) loads in place as <name>@skills-dir, but Claude Code compares its manifest name against INSTALLED…
- 2026-11-09 · [[2026-11-09-bash-commands-that-name-env-are-denied]] · A Bash command that mentions .env (even the grep for the key NAME that secrets.md suggests) or contains `rm -rf` is denied by the project's permission rules; check the k…

## Harness
3 decisions · 7 lessons · 9 references · roadmap: 6 open items in [[roadmap]]
Lane maps: plan `memory/maps/plan.md` · media `memory/maps/media.md` · build `memory/maps/build.md` · review `memory/maps/review.md` · deliver `memory/maps/deliver.md` · harness `memory/maps/harness.md`

## Environment (from the doctor's last report)
- doctor 2026-11-09: all required checks passed
- HyperFrames plugin: v0.8.160 (vendored)
- Obsidian app: v1.13.7 at C:\Program Files\Obsidian\Obsidian.exe (running)
- fal.ai key (FAL_KEY in .env): missing in .env
