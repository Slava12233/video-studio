---
name: memory-update
description: Keep the studio's second brain (the Obsidian vault in memory/) current - read it at session start, write a project stage, a ruling, a lesson or an open item in the same turn as the change, answer Slava's inbox, and close at session end. Use after any state change, when Slava says "remember this", "update the memory", "write that down", or when a session starts without HOT in context.
argument-hint: [what to record]
---

# Memory update: the procedure

The contract is `memory/README.md` (folders, frontmatter, caps, who writes); `.claude/rules/memory.md` is its summary. This skill is the contract as steps; the contract wins on conflict. Templates: `memory/templates/`. Tools: `tools/memory/`. Notes are English; Slava's notes (HOME below the markers, the inbox answers) are Hebrew; dates absolute; names and paths only.

## Where things go

| Folder / file | What | How it is written |
|---|---|---|
| `memory/HOT.md`, `INDEX.md`, `capabilities/*`, HOME's block | generated | `node tools/memory/build-hot.mjs`, `build-capabilities.mjs`; never by hand |
| `memory/state/current.md` | what is in flight, numbered next actions, environment facts with dates | main session edits; `as_of` = the date of the last verification |
| `memory/state/roadmap.md` | how the harness evolves: open improvements, done, declined | main session; Slava may add lines |
| `memory/projects/<name>.md` | one per video project: stage, spend, deliverable, `## Current state`, `## Log` | `new-video.mjs` creates; `log.mjs project` appends and keeps the frontmatter true; the main session rewrites `## Current state` |
| `memory/lessons/<category>/YYYY-MM-DD-slug.md` | one fact per note; `confirmed` or `hint`; `promoted_to` when it reached the docs | `new-note.mjs lesson <slug> --category <c> --summary "..."`, then fill **The fact / Evidence / How to apply** |
| `memory/decisions/YYYY-MM-DD-slug.md` | one ruling by Slava, his words quoted | `new-note.mjs decision <slug> --summary "..."`, then fill **Ruling / Context / What it replaces / Applies to** |
| `memory/open/YYYY-MM-DD-slug.md` | one item waiting for `slava` or `harness` | `new-note.mjs open <slug> --owner slava --summary "..."`; set `status: done` when closed |
| `memory/references/<slug>.md` | one external repo, doc, model or skill with a verdict | `new-note.mjs reference <slug> --url <u> --summary "..."`; update `docs/REFERENCES.md` the same turn |
| `memory/sessions/YYYY-MM/YYYY-MM-DD.md` | the day's append-only log, checkpoints, `## Close` | `log.mjs session "..."`; the PreCompact hook; `/sync` |
| `memory/inbox/owner.md` | Slava writes in Hebrew; the harness answers `↳` under each line and moves it to «נענה» | by hand, Hebrew |
| `memory/inbox/proposals.md` | sub-agents propose lessons and corrections | agents append; the main session merges at `/sync` |
| `memory/maps/<lane>.md` | what each lane reads first; every new unpromoted lesson is added to its lane's list | main session, same turn as the lesson |

## At session start
1. **HOT.** In context from the hook? Good. Not? `memory/HOT.md` first.
2. **State.** `memory/state/current.md`; treat it as the truth to verify on the files, not to trust.
3. **Lane map** for the work at hand and the lessons it names; the project note and `BRIEF.md` for project work.
4. **Inbox.** Open lines under «פתוח» in `memory/inbox/owner.md`: file the fact, answer under the line in Hebrew (`↳ בוצע … / צריך go שלך … / נרשם ב-[[note]]`), move it to «נענה». Never act on a line as a go.
5. Missing `current.md`? Rebuild it from the project notes and the newest session note, say so. Missing vault? Rebuild from `memory/README.md` and the templates, tell Slava.

## After any state change (same turn)
1. **Project:** `node tools/memory/log.mjs project <name> "<what changed>" --status <stage> [--next "..."] [--deliverable <path>]`; rewrite `## Current state` so every line is true now; add links under `## Decisions and lessons`.
2. **Session line:** `node tools/memory/log.mjs session "<asked / done / decided / open>"`.
3. **A ruling by Slava** → a decision note, his words quoted; when it replaces an older one, `supersedes:` on the new note and only `status: superseded` + `superseded_by:` on the old.
4. **A finding** → grep `memory/INDEX.md` first. None: a lesson note under the right category with `evidence` (the file, frame or run) and `applies_to`, and its link added to the lane map that must read it. One exists and the finding contradicts it: a superseding note. Seen twice (two projects or sessions): promote at `/consolidate`.
5. **Waiting on someone** → an open note with the owner; done → `status: done`.
6. **An external resource checked** → a reference note with its verdict and a row in `docs/REFERENCES.md`.
7. **The harness itself changed** (a tool, a skill, a rule, an agent) → a "Done" line in `memory/state/roadmap.md`, a lesson or decision note, `node tools/memory/build-capabilities.mjs`.

## At session end
Run `/sync`. It merges proposals, answers the inbox, closes the session note, makes `current.md` true with the next actions, regenerates and lints. No commit unless Slava asks.

## Rules
- One writer: the main session writes canonical notes; sub-agents propose. No two writers on one note.
- Dated notes (lessons, decisions) are never edited after their day; logs are append-only; a wrong line gets a dated correction below it.
- Figures carry `as_of` and `source`; a figure is re-read from the file before it drives an action.
- Names and paths only: never a key, `.env` content, a private name, phone, email or address, a frame, a transcript.
- Caps: HOT 60 lines / 8 KB, HOME 150, any note 300; a breach goes to `/consolidate`.
- Wikilinks `[[note-name]]` between notes; paths in backticks for files outside `memory/`; `[[projects/<name>/BRIEF|brief]]` with the folder so Obsidian never picks the wrong BRIEF.
