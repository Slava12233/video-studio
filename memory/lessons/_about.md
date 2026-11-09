---
type: contract
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [lessons]
summary: "One fact per note under a category folder (rendering, composition, fal, hebrew-rtl, workflow, tooling, harness, operator); never edited, superseded; promoted to docs/ or a rule when earned twice."
---

# lessons/

One fact per note, `YYYY-MM-DD-slug.md`, under one of the category folders: `rendering/` (render flags, speeds, bounds), `composition/` (HyperFrames HTML, GSAP, seams), `fal/` (models, prompts, prices, quirks), `hebrew-rtl/` (fonts, captions, direction), `workflow/` (how a video type is made, what order works), `tooling/` (the studio's tools, ffmpeg, Windows, Claude Code), `harness/` (the agent setup itself: memory, skills, agents, hooks), `operator/` (working with Slava: how he decides, what he wants to see). Made with `node tools/memory/new-note.mjs lesson <slug> --category <c> --summary "..."`. `status` is `confirmed` (seen on a file, a frame or a run) or `hint`. Never edited after its day: a correction is a new note with `supersedes:`. A lesson earned twice is promoted at `/consolidate`: its distilled rule goes to `docs/FIELD-NOTES.md`, `docs/TROUBLESHOOTING.md`, `docs/FAL-ENDPOINTS.md` or a `.claude/rules/` file (Slava's ruling for a law), and the note gets `promoted_to:`. The lane maps in `memory/maps/` list the lessons each lane must read before it works.
