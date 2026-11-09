# /consolidate: the procedure as a checklist

Who: `librarian` (sonnet) runs part A and writes only `memory/inbox/proposals.md`; the main session runs part B (judgment and every canonical write) and part C. The contract is `memory/README.md` (§3 note bodies and promotion, §4 caps, §6 cadences). Today's date is written as an absolute date everywhere. Nothing is deleted.

## A. Find (librarian, read-only except proposals.md)

- [ ] **A1. Caps now.** `timeout 120 node tools/memory/lint.mjs` and `timeout 120 node tools/memory/build-hot.mjs --check`. Note: HOT lines and bytes (cap 60 / 8,192), HOME lines (cap 150), every note over 300 lines, the INDEX line count, every FAIL and WARN line.
- [ ] **A2. Duplicates.** In `memory/INDEX.md` (grep, never whole) list notes of the same `type` whose `summary` is the same or nearly the same (same file, same flag, same figure) or whose title is the same. Lessons and decisions first. For each pair note which is older and which carries more evidence.
- [ ] **A3. Stale facts.** Project notes whose `## Current state` is contradicted by a newer note, a session `## Close` or `state/current.md`, or whose `folder` no longer exists; lessons and decisions that a newer note replaces without `supersedes:` set; `state/current.md` lines whose verification date is older than 30 days.
- [ ] **A4. Closed items.** Projects with `status: delivered` whose last `## Log` line is more than 90 days old; open items whose note or a newer one says they are done; session notes of past months without a `## Close` (list them; sessions are never archived).
- [ ] **A5. Promotion candidates.** Lessons without `promoted_to` whose fact appears in two notes, two projects or two sessions, or that a lane map lists for more than 60 days; name the `docs/` section each belongs to. A lesson that is really a law (it forbids or requires something every time) is flagged "rule: Slava's word".
- [ ] **A6. Dead links and splits.** Every `dead link` FAIL from the lint with the likely target (a renamed or archived note); every note over 300 lines with a proposed cut.
- [ ] **A7. Write the proposals.** Append one block to `memory/inbox/proposals.md`: `## Consolidation YYYY-MM-DD`, then one line per finding with its reason or evidence:
  `- merge [[a]] into [[b]] — reason` · `- supersede [[old]] by a new note — evidence` · `- archive [[note]] — delivered YYYY-MM-DD` · `- promote [[lesson]] → docs/FIELD-NOTES.md#section — seen in [[a]] and [[b]]` · `- rule: [[lesson]] — Slava's word` · `- split [[note]] — N lines: sections …` · `- fix link [[x]] in [[note]] → [[y]]` · `- cap: HOT N lines / N bytes, HOME N lines`.
  Return the count per kind. Edit no other note.

## B. Apply (main session)

- [ ] **B1. Merge.** The surviving note keeps the facts and the evidence of both; the other gets only `status: superseded` and `superseded_by: "[[survivor]]"`. A changed dated fact is a new note with `supersedes:`.
- [ ] **B2. Supersede.** A new note from `memory/templates/<type>.md` with `supersedes: "[[old]]"`, created today; the old note gets only the two fields.
- [ ] **B3. Archive.** Move each closed note to `memory/archive/` (Obsidian CLI `move` when the app is open: `node tools/memory/obsidian-setup.mjs --cli move path=memory/projects/<name>.md to=memory/archive/`; otherwise move the file and fix the links the next lint names). Set `status: archived`. Done open items: `status: done`.
- [ ] **B4. Promote.** Write the distilled rule (two to five lines, the way the section already reads) into the named `docs/` section; set `promoted_to: docs/FIELD-NOTES.md#section` on the lesson; remove its link from the lane map's "not yet promoted" list. A "rule" proposal is put to Slava in Hebrew with the exact line and waits.
- [ ] **B5. Split.** A note over 300 lines becomes an entry note (frontmatter, `## Current state`, links) plus linked notes with full frontmatter.
- [ ] **B6. Enforce caps.** HOT trims itself in `build-hot.mjs`. HOME: only the generated block changes; Slava's part is cut only on his word.
- [ ] **B7. Decline what is wrong.** A proposal not applied gets one line in today's session note: what and why.
- [ ] **B8. Clear the block.** Remove the applied and declined lines of the `## Consolidation YYYY-MM-DD` block from `memory/inbox/proposals.md`.

## C. Regenerate, lint, report (main session)

- [ ] **C1.** `timeout 120 node tools/memory/build-capabilities.mjs`, then `timeout 120 node tools/memory/build-hot.mjs`.
- [ ] **C2.** `timeout 120 node tools/memory/lint.mjs`. Every FAIL fixed before the step ends (rerun C1 if a source changed, then lint again). Warnings listed in the report.
- [ ] **C3.** One line in today's session note: `- HH:MM — /consolidate: merged n, superseded n, archived n, promoted n, split n; caps now HOT n lines / n KB, HOME n lines, INDEX n lines; lint n FAIL n WARN`. A "Done" line in `memory/state/roadmap.md` when a doc or rule changed.
- [ ] **C4.** Report to Slava in Hebrew (at most 12 lines): merged, superseded, archived, promoted (counts, the names that matter), declined and why, the caps now, the lint result, what waits for his word.

## Rules

- Nothing is deleted; project folders are never touched here.
- One writer: canonical notes are the main session's; the librarian writes only `proposals.md` and the archive moves it is told to make.
- Dated notes are never edited after their day except `status: superseded` and `superseded_by:`.
- Generated notes are never hand-edited; names and paths only; dates absolute.
