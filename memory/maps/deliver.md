---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [maps, deliver]
summary: "The Deliver lane map - the deliverer agent and the main session before the final render and packaging: the render bounds, the disclosure file, the delivery facts, what the project note must show afterwards."
---

# Deliver lane (deliverer, the main session on the final file)

## Read first, every lane
- `memory/HOT.md` (in your context from the SessionStart hook; read it if not)
- [[current]] (`memory/state/current.md`)
- the project's note in `memory/projects/` (status must be `review` with a "ready" verdict logged), its `BRIEF.md` (frame rate, variants, brand)

## The docs this lane relies on
- `.claude/rules/machine-limits.md` (`timeout 1800`, segmented + resumable over 45 s, exit 124 → one retry with `--resume`), `.claude/rules/disclosure.md` (`DISCLOSURE.txt` from the ledger; an unlabeled asset blocks delivery)
- `docs/FIELD-NOTES.md` → "Rendering", "Audio mix and delivery"
- the skill `/deliver` (the procedure; `tools/deliver.mjs` writes the delivery and the project note's log line itself)

## Lesson notes not yet promoted (read all; the notes win over any summary)
- every note under `memory/lessons/rendering/` (grep `memory/INDEX.md`)
- none yet (2026-11-09)

## Write
- `deliverables/<project>/` (the tool); the project note gets `status: delivered`, `deliverable`, `spend_usd` from the tool; the main session adds the verification result (three frames checked) as a `log.mjs project` line and a session line; never publish or upload without Slava's explicit yes
