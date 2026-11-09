---
type: contract
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [projects]
summary: "One note per video project, named like its folder (YYYY-MM-DD-slug): kind, stage, spend, deliverable, current state and an append-only log."
---

# projects/

One note per video project, named exactly like its folder under `projects/` (`YYYY-MM-DD-slug.md`), made from `memory/templates/project.md` by `tools/new-video.mjs` the moment the project is scaffolded. `status` is the stage: brief → planning → media → build → review → delivered → archived. `## Current state` is rewritten so every line is true now; `## Log` is append-only (`node tools/memory/log.mjs project <name> "..."`); `tools/deliver.mjs` writes the delivery line itself. Private facts stay in the project's `BRIEF.md`; the note points at it. Delivered projects move to `memory/archive/` 90 days after delivery (`/consolidate`).
