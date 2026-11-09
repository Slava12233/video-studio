---
type: state
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [state, harness]
summary: "How the harness itself evolves: the open improvements with an owner and a status, what was done and when, and what was considered and declined."
---

# Harness roadmap

The memory is how this harness evolves: a lesson earned twice becomes a rule or a doc; a tool that misses a write gets the write; an idea lands here first. Slava may add lines in Hebrew; the harness keeps the statuses true. `/consolidate` reviews this note.

## Open

- harness · wire `/review-cut` and `/render` to append a session line and a project log line (status `review` / `build`) the way `new-video.mjs` and `deliver.mjs` do, once the first project shows where the seams are (2026-11-09)
- slava · decide whether to upgrade Obsidian 1.13.7 → 1.15.0 (`winget upgrade Obsidian.Obsidian`, needs admin: machine-wide install); nothing here needs it (2026-11-09)
- harness · a `projects.base` card view with the poster frame once deliverables exist (the poster path lives in the project note's `deliverable` folder) (2026-11-09)
- harness · consider an Obsidian Canvas (`json-canvas` skill) per video project as the storyboard map once a project has a storyboard (2026-11-09)
- harness · decide after three projects whether `docs/FIELD-NOTES.md` sections should become lesson notes with `promoted_to` or stay as the curated doc (2026-11-09)
- harness · after the next HyperFrames re-vendor (Slava's call): rerun the headless probe, re-verify the render flags in `docs/FIELD-NOTES.md`, and give `tools/vendor-hyperframes.mjs` a test on a fixture release (2026-11-09)

## Done

- 2026-11-09 · the second brain: vault contract, tools, hooks, skills, agent, rules, Obsidian registration ([[2026-11-09-second-brain-in-obsidian]])
- 2026-11-09 · the two memory hooks installed in `.claude/settings.json` on Slava's yes in chat ([[2026-11-09-install-the-memory-hooks]])
- 2026-11-09 · the HyperFrames plugin release vendored into the repo as the skills-dir plugin `hf` (`tools/vendor-hyperframes.mjs`, `/hf:<skill>` everywhere, the CLI pinned by the repo) ([[2026-11-09-hyperframes-skills-live-in-the-repo]]); the marketplace copy turned off in `.claude/settings.json` on Slava's yes ([[2026-11-09-turn-the-marketplace-hyperframes-copy-off]])

## Considered and declined

- 2026-11-09 · `claude-mem` (opaque SQLite + Chroma store, Bun worker, lossy compression; not browsable in Obsidian) · `basic-memory` (Python + uv, AGPL, an index that drifts from the files) · an Obsidian MCP server (needs the app or a REST plugin; plain files and the CLI do the job) · `claudesidian` (a personal-vault starter, bash-only install; its PARA layout was borrowed as an idea). Details: the `references/` notes.
