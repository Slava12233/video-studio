---
type: contract
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [sessions]
summary: "One append-only note per working day under YYYY-MM/: dated bullets, PreCompact checkpoints, a Close block from /sync."
---

# sessions/

One note per working day, `YYYY-MM/YYYY-MM-DD.md`, made from `memory/templates/session.md` by the first `node tools/memory/log.mjs session "..."` of the day (or by the PreCompact hook). Append-only dated bullets: what was asked, done, decided, left open; paths in backticks; `## Checkpoint HH:MM` blocks from the hook; the `## Close` block from `/sync` (asked, done, delivered, spent, open with owners, lessons and decisions filed, the first action for the next session). A note that lands outside its month folder is moved by `build-hot.mjs`. Session notes are never archived.
