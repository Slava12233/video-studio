---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [maps, build]
summary: "The Build lane map - the compositor agent and the main session before authoring a composition or rendering a draft: the composition rules, the render bounds, the rendering and composition lessons."
---

# Build lane (compositor, the main session on a composition or a draft render)

## Read first, every lane
- `memory/HOT.md` (in your context from the SessionStart hook; read it if not)
- [[current]] (`memory/state/current.md`)
- the project's note in `memory/projects/`, its `BRIEF.md`, `TREATMENT.md` and `STORYBOARD.md`, `captions.json` when captions exist

## The docs this lane relies on
- `.claude/rules/composition.md` (the loop: author → lint → check → snapshot → bounded draft), `.claude/rules/hebrew-rtl.md`, `.claude/rules/machine-limits.md` (`timeout 1800`, `--workers 4`, `--experimental-fast-capture=false`, one heavy run at a time, exit 124 is the bound)
- `docs/FIELD-NOTES.md` → "Rendering", "Composition gotchas", "Hebrew / RTL", "Audio mix and delivery", "Windows + Claude Code"
- `docs/TROUBLESHOOTING.md` → "Rendering" before changing anything after a failed render
- the HyperFrames plugin skills (vendored in `.claude/skills/hyperframes-plugin/`, typed `/hf:<skill>`): `hf:hyperframes-core` before writing HTML, `hyperframes-animation` / `hyperframes-keyframes` for motion, `hyperframes-audio` for the mix, `hyperframes-registry` before hand-building a named effect
- the skill `/render` (bounded draft, parts on a busy machine)

## Lesson notes not yet promoted (read all; the notes win over any summary)
- every note under `memory/lessons/rendering/`, `memory/lessons/composition/` and `memory/lessons/hebrew-rtl/` (grep `memory/INDEX.md`)
- none yet (2026-11-09)

## Write
- the composition, build scripts and drafts inside the project folder; one `log.mjs project` line per draft (`status: build`, the draft path and its length); a proposed lesson in [[proposals]] for any render speed figure, flag, seam or RTL trick
