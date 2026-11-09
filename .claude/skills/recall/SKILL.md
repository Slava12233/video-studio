---
name: recall
description: Answer "what do we know about X" from the second brain before any new research - grep memory/INDEX.md, the lane maps and docs/, search with the Obsidian CLI when the app is open, open the two or three notes that matter, and report the facts with their dates and the notes to open. Use when Slava asks what was decided, learned or tried, before re-researching a model, a flag or a workflow, or when a session starts on a project it does not remember.
argument-hint: <topic or question>
---

# /recall: what the vault knows

Arguments: `$ARGUMENTS` (a topic, a project name, a question). The vault first, the web second: a fact that is already in `memory/` or `docs/` is not researched again.

## Steps
1. **HOT and state.** `memory/HOT.md` (in context or read it) and `memory/state/current.md`: is the topic in flight?
2. **Grep, never read whole.** `grep -i "<words>" memory/INDEX.md` (one line per note: link, type, summary); then the lane map of the topic (`memory/maps/<lane>.md`) and `grep -i -n "<words>" docs/FIELD-NOTES.md docs/TROUBLESHOOTING.md docs/FAL-ENDPOINTS.md docs/WORKFLOWS.md docs/REFERENCES.md`. For a project: `memory/projects/<name>.md` and its `BRIEF.md`.
3. **Obsidian CLI when the app is open** (`node tools/memory/obsidian-setup.mjs --check --quiet` exits 0 and the app runs): `node tools/memory/obsidian-setup.mjs --cli vault=video-studio search query="<words>" format=json limit=15` finds body text the summaries miss; `--cli backlinks file="<note>"` shows what depends on a note.
4. **Open the two or three notes that matter** (newest first; a `superseded` note only to see what replaced it). Read the `## Current state` of a project note, the **How to apply** of a lesson, the **Ruling** of a decision.
5. **Report**, in Hebrew to Slava (English inside an agent): the facts with their dates and status (`confirmed` / `hint` / `superseded`), the figures with their `as_of`, the open items, and the notes to open as paths. Say plainly when the vault holds nothing on the topic; then research, and file what is found (`memory-update`).

## Rules
- Nothing is written by `/recall` except, when a gap was found and filled, the new note through `memory-update`.
- A fact without a date or a source is reported as "unverified".
- Never read `memory/INDEX.md` whole past 300 lines; never read every note of a folder.
