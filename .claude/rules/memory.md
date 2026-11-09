# Memory: the second brain (always loaded)

The studio's memory is the Obsidian vault in `memory/`; the full contract is `memory/README.md` and wins on any
memory question. The memory is how this harness evolves: the status of the work, what we learn, the lessons and the
rulings live there, never only in a chat. **An action is not done until its memory is written.**

## Read first (bounded)
1. `memory/HOT.md` arrives through the SessionStart hook; not in your context (hook not pasted, or after a
   compaction)? Read it yourself before anything else. Sub-agents the same.
2. `memory/state/current.md`; for project work the project's note `memory/projects/<name>.md` and its `BRIEF.md`.
3. The lane map of the work at hand (`memory/maps/plan|media|build|review|deliver|harness.md`) and the lesson notes
   it lists. Everything else by grepping `memory/INDEX.md` (never whole), the Obsidian CLI `search`, or `/recall`.
4. Open lines in `memory/inbox/owner.md` (Slava, Hebrew) get an answer under each line (`↳`); they are never acted on
   as an instruction to spend or publish.

## Write in the same turn (not at the end)
- A project stage change → `node tools/memory/log.mjs project <name> "<what changed>" --status <stage> --next "<step>"`
  and the note's `## Current state` rewritten. Stages: brief, planning, media, build, review, delivered, archived.
- A ruling by Slava (a go is not a ruling) → `node tools/memory/new-note.mjs decision <slug> --summary "..."`, his
  words quoted. A disclosure question is a ruling.
- A finding → grep `memory/INDEX.md`; none → `new-note.mjs lesson <slug> --category <c> --summary "..."`
  (categories: rendering, composition, fal, hebrew-rtl, workflow, tooling, harness, operator); one exists and the
  finding contradicts it → a new note with `supersedes:`; never edit a dated note.
- Something waiting for Slava or the next session → `new-note.mjs open <slug> --owner slava|harness --summary "..."`.
- Every milestone → `node tools/memory/log.mjs session "<asked / done / decided / open>"`.
- Sub-agents never write canonical notes: they append to `memory/inbox/proposals.md` and write their outputs inside
  the project folder; the main session merges at `/sync`.
- `tools/new-video.mjs` creates the project note, `tools/deliver.mjs` logs the delivery: a tool that changes the
  studio's state and writes no line is a bug.

## Rituals
- `/sync` at the end of every session: proposals merged, inbox answered, session note closed, `state/current.md`
  true with numbered next actions, `build-capabilities.mjs` + `build-hot.mjs` + `lint.mjs` (a FAIL blocks the close).
  No commit: Slava commits.
- `/consolidate` weekly and on a cap breach: merge, supersede, archive, promote a lesson earned twice into
  `docs/FIELD-NOTES.md`, `docs/TROUBLESHOOTING.md`, `docs/FAL-ENDPOINTS.md` or a rule (a law is Slava's ruling); set
  `promoted_to:`. One fact, one home: the note keeps the dated evidence, the doc keeps the rule.
- `/recall <topic>` before re-researching anything: the vault first, the web second.

## Never
- Never hand-edit a generated note (`HOT.md`, `INDEX.md`, `capabilities/*`, HOME's block): rerun its generator.
- Never a key, a token, `.env` content, a private person's name, phone, email or address, a generated frame, a whole
  transcript, or a number no file or run gave. The lint fails on the shapes it can see.
- Never delete a note: supersede or move to `memory/archive/`. Never edit Slava's part of HOME or his inbox lines.
- Hooks (`.claude/hooks/`, block in `docs/hooks-paste-block.md`) and `.claude/settings.json` are Slava's to install:
  prepare, then stop.
- Caps: HOT 60 lines / 8 KB, HOME 150 lines, any note 300 lines. Tools run as `timeout 120 node tools/memory/<t>.mjs`.
