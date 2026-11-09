---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [maps, plan]
summary: "The Plan lane map - the director agent and the main session before a treatment, storyboard or caption plan: the brief, the workflow for the type, the workflow and composition lessons."
---

# Plan lane (director, the main session on a treatment)

## Read first, every lane
- `memory/HOT.md` (in your context from the SessionStart hook; read it if not)
- [[current]] (`memory/state/current.md`: what is in flight, next actions, environment)
- the project's note in `memory/projects/` and its `BRIEF.md` (the brief decides every fact that may appear on screen)

## The docs this lane relies on
- `docs/WORKFLOWS.md`, the section for the video type (the seven types and their HyperFrames workflow)
- `templates/briefs/<type>.md` (what a filled brief answers)
- `docs/FIELD-NOTES.md` → "Composition gotchas", "Hebrew / RTL", "AI presenter (avatar) lessons"
- `.claude/rules/disclosure.md` (what must be labeled; doubts go to Slava), `.claude/rules/hebrew-rtl.md`
- the HyperFrames plugin skills (vendored in `.claude/skills/hyperframes-plugin/`, typed `/hf:<skill>`) `hf:hyperframes-creative` (design, beats, narration) and `hf:hyperframes-studio` (plan, storyboard, build order)

## Lesson notes not yet promoted (read all; the notes win over any summary)
- every note under `memory/lessons/workflow/` and `memory/lessons/composition/` (grep `memory/INDEX.md` for `lessons/workflow` and `lessons/composition`)
- none yet (2026-11-09)

## Decisions that bind planning
- [[2026-11-05-hebrew-chat-language]] (chat in Hebrew; on-screen language as the brief says)
- [[2026-11-09-second-brain-in-obsidian]] (every plan, treatment and storyboard leaves a line in the project note)

## Write
- the treatment, storyboard and beat table inside the project folder; one `log.mjs project` line (`status: planning`); a proposed lesson in [[proposals]] for anything learned
