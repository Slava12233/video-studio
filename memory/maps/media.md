---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [maps, media]
summary: "The Media lane map - the media-lab agent and the main session before any fal.ai job: the spend rule, the endpoint table, the fal and avatar lessons, the project's ledger."
---

# Media lane (media-lab, the main session on any fal.ai job)

## Read first, every lane
- `memory/HOT.md` (in your context from the SessionStart hook; read it if not)
- [[current]] (`memory/state/current.md`: what is in flight, next actions, `FAL_KEY` present or not)
- the project's note in `memory/projects/` (spend so far, with `as_of`) and its `BRIEF.md` (expected spend, what may be generated, consent for any real person's likeness)

## The docs this lane relies on
- `.claude/rules/fal-spend.md` (estimate first, explicit go, ledger every call, one regeneration at most) and `.claude/rules/disclosure.md`
- `docs/FAL-ENDPOINTS.md` (verified prices and limits; a price older than a month gets `get_pricing` first)
- `docs/FIELD-NOTES.md` → "fal.ai generation", "AI presenter (avatar) lessons", "Transcription and captions"
- the skills `/fal-media` (model choice, prompts) and `/ai-lab` (execution), `/avatar-presenter`, `/transcribe`
- the project's `ai-ledger.jsonl` (the source of truth for spend and disclosure)

## Lesson notes not yet promoted (read all; the notes win over any summary)
- every note under `memory/lessons/fal/` (grep `memory/INDEX.md` for `lessons/fal`)
- none yet (2026-11-09)

## Write
- job files and outputs inside the project folder (`ai/`); the ledger line comes from the tool; one `log.mjs project` line per generation round (`status: media`, the spend); a proposed lesson in [[proposals]] for any model quirk, price change or prompt that worked
