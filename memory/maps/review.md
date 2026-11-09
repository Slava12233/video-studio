---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [maps, review]
summary: "The Review lane map - the qa-reviewer agent and the main session before judging a rendered cut: the disclosure and RTL rules, the brief, the ledger, the review lessons."
---

# Review lane (qa-reviewer, the main session on a rendered cut)

## Read first, every lane
- `memory/HOT.md` (in your context from the SessionStart hook; read it if not)
- [[current]] (`memory/state/current.md`)
- the project's note in `memory/projects/` (what Slava already approved or rejected, in `## Log`), its `BRIEF.md` and `ai-ledger.jsonl` (every AI asset that must carry a badge)

## The docs this lane relies on
- `.claude/rules/disclosure.md` (labels verified on frames of the rendered file at start, middle and end), `.claude/rules/hebrew-rtl.md` (captions 2-4 words, safe zones, no `dir="rtl"` on `<html>`), `.claude/rules/machine-limits.md` (`timeout 540` on every ffmpeg call)
- `docs/FIELD-NOTES.md` → "Hebrew / RTL", "Audio mix and delivery", "Transcription and captions"
- the skill `/review-cut` (the exact procedure and report shape)

## Lesson notes not yet promoted (read all; the notes win over any summary)
- every note under `memory/lessons/hebrew-rtl/` and `memory/lessons/workflow/` (grep `memory/INDEX.md`)
- none yet (2026-11-09)

## Write
- frames under `review/<render>/` in the project (the folder is yours); the verdict goes back to the main session, which writes one `log.mjs project` line (`status: review`, ready / not ready, the blockers' count); a proposed lesson in [[proposals]] for a recurring defect
