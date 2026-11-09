---
name: sync
description: Close a session into the second brain - merge the sub-agents' proposals, answer Slava's inbox, close today's session note, make memory/state/current.md true with numbered next actions, regenerate HOT, INDEX, HOME's block and the capability map, lint the vault, check Obsidian, and give Slava the short closing message in Hebrew. Use at the end of every session, after a delivery or a big change, or when Slava types /sync.
---

# /sync: close the session into the vault

The contract (`memory/README.md`) and `.claude/rules/memory.md` win on conflict; `memory-update` is the procedure for every note written here. English notes, Hebrew to Slava, absolute dates, names and paths only. Node tools run from the studio root with `timeout 120` first, one at a time, foreground.

**Output:** vault notes under `memory/`, the generated files (`memory/HOT.md`, `memory/INDEX.md`, HOME's block, `memory/capabilities/*`); `CLAUDE.md` or a rule only for a durable law Slava ruled. **Never a commit:** Slava commits.

## Procedure
1. **Collect the session's facts** with their evidence: project stage changes (drafts rendered, media generated with the spend, reviews, deliveries with paths), rulings by Slava (his words), findings, open items and their owners, what sub-agents reported. Start from today's `memory/sessions/YYYY-MM/YYYY-MM-DD.md`. A fact that cannot be verified on a file is written as "unverified".
2. **Verify on the files**, not on memory: `ls` the project's `renders/` and `deliverables/`, `node tools/fal/fal.mjs --project projects/<name>` for the spend, `delivery.json` for a delivery. The record says what the files show.
3. **Merge `memory/inbox/proposals.md`.** For each line: grep `memory/INDEX.md`; then (a) a lesson note from the template under the right category plus its link in the lane map, (b) a correction (a superseding note or a rewritten `## Current state` with a `## Log` line), or (c) decline it with a one-line reason that goes into today's session note. Empty the list below its heading. A `## Consolidation YYYY-MM-DD` block from `/consolidate` not yet applied stays and is named in the closing message.
4. **Answer `memory/inbox/owner.md`.** Every open line gets an indented `↳` bullet in Hebrew: done (with `[[note]]`), needs your go (the estimate stated; never acted on from the inbox), or filed to `[[note]]`. Move answered lines with their answers to «נענה». Slava's words are never edited.
5. **Project notes and state.** Every stage change of the session has its `log.mjs project` line and a true `## Current state`; every ruling a decision note; every finding a lesson note; every wait an open note. Then `memory/state/current.md`: "In flight" true now, "Next actions" rewritten as numbered first actions for the next session, "Environment" corrected where a fact changed, `as_of` and `source` set. A harness change → a "Done" line in `memory/state/roadmap.md`.
6. **Close the session note:** the `## Close` block (asked, done, delivered with paths, spent, open with owners, lessons and decisions filed as links, the first action for the next session) and `status: done`.
7. **Generate.** `timeout 120 node tools/memory/build-capabilities.mjs`, then `timeout 120 node tools/memory/build-hot.mjs --by sync`. Never hand-edit what they write; a failing tool is one line in the closing message and the old files stay.
8. **Lint.** `timeout 120 node tools/memory/lint.mjs`. A FAIL (a key or PII shape, a dead link, a cap breach, a hand-edited generated note, an edited dated note) blocks the close: fix the note, regenerate if a source changed, lint again until exit 0. A cap breach is fixed with `/consolidate`. Warnings go into the closing message.
9. **Obsidian.** `timeout 60 node tools/memory/obsidian-setup.mjs --check --quiet`; exit 1 means the vault is not registered or the CLI is off: run it without `--check` (it registers, enables, starts the app; never a click for Slava) and say so in one line.
10. **Closing message to Slava, in Hebrew, at most 12 lines:** what changed (projects, stages, paths), what was spent (per project, from the ledger), rulings recorded, open items by owner, inbox lines answered and proposals merged or declined (counts), the lint result in one line, the first action for the next session, the paths of today's session note and of the project notes touched. Remind him once that nothing was committed.

## Rules
- A sync records; it never renders, generates, publishes or spends. A pause or a change Slava asked for in chat is done by the main session before the sync, then recorded.
- Dated notes are superseded, never edited; logs are append-only.
- One writer: the main session; the `librarian` agent may do the mechanical part (step 1's list, step 3's grep) and writes only `memory/inbox/proposals.md`.
- Never a number a file or a run did not give.
