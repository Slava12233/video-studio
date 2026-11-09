---
type: inbox
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [inbox]
summary: Sub-agents append proposed lessons and corrections here; the main session merges them at /sync and empties the list.
---

# Proposals

Sub-agents (director, compositor, media-lab, transcriber, qa-reviewer, deliverer, librarian) append one line per proposal under "Open", newest last:

`- YYYY-MM-DD HH:MM agent:<name> — proposed lesson: … (evidence: <path or run>)`

A correction uses the same shape with `proposed correction:` and names the note it corrects as a wikilink. Names and paths only: never a key, a private person's name, phone or email. The main session merges every line at `/sync` (a lesson note, a superseding note, or a dropped line with the reason in the session note) and then empties the list; the lint warns when a line is older than 7 days.

## Open
