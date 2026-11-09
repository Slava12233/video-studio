---
name: consolidate
description: The weekly consolidation of the second brain (memory/) - duplicates merged, stale facts superseded, delivered projects archived after 90 days, lessons earned twice promoted into docs/FIELD-NOTES.md or a rule, dead links fixed, caps enforced, HOT and HOME regenerated. Use weekly, when lint reports a cap breach, after a busy project, or when Slava types /consolidate.
---

# /consolidate: the weekly vault consolidation

The procedure is `.claude/skills/consolidate/PROCEDURE.md`; read it and follow it step by step. This skill says who does which part, what may be written, and what Slava gets back. The contract (`memory/README.md`: caps, who writes, promotion) and `memory-update` win on conflict.

**Output:** vault notes only (superseding notes, `status` fields, `promoted_to`, `memory/archive/` moves, split notes), the promoted lines in `docs/FIELD-NOTES.md`, `docs/TROUBLESHOOTING.md` or `docs/FAL-ENDPOINTS.md`, the regenerated files, one line in today's session note. A new **rule** (`.claude/rules/*`, `CLAUDE.md`) only on Slava's ruling in chat. **Language:** notes and docs in English; the report to Slava in Hebrew.

## When
- Weekly (the first session of the week), and after a project is delivered.
- Whenever `node tools/memory/lint.mjs` reports a cap breach (HOT over 60 lines or 8 KB, HOME over 150 lines, a note over 300 lines), including a FAIL that blocks `/sync`.
- When Slava types `/consolidate`.

## Who does what
1. **The mechanical pass: `librarian` (sonnet).** Brief it with the path of `PROCEDURE.md`, the contract, today's date and the scope (the whole vault, or the folders the lint named). It reads; it finds duplicate lessons and decisions, project notes whose `## Current state` contradicts a newer note or whose folder is gone, dated notes a newer one already replaces, delivered projects past 90 days, lessons seen twice (the same fact in two notes or two projects) that have no `promoted_to`, notes over 300 lines, dead links, the caps now. It writes nothing canonical: its whole output is one block appended to `memory/inbox/proposals.md` under `## Consolidation YYYY-MM-DD`, one line per proposal (`- merge [[a]] into [[b]] — reason`, `- supersede [[old]] by a new note — evidence`, `- archive [[note]] — delivered YYYY-MM-DD`, `- promote [[lesson]] → docs/FIELD-NOTES.md#section — seen in [[a]] and [[b]]`, `- split [[note]] — 340 lines`, `- fix link [[x]] in [[note]] → [[y]]`), and it returns the count per kind.
2. **The judgment and the writes: the main session.** For each proposal, apply it or decline it with a one-line reason under it:
   - **Merge:** the surviving note keeps the facts and the evidence of both; the other gets `status: superseded` and `superseded_by:` (a dated note is never edited beyond those two fields; a changed fact is a new superseding note).
   - **Supersede:** a new note from the template with `supersedes:`; the old note gets only the two fields.
   - **Archive:** move the note to `memory/archive/` (the Obsidian CLI `move` when the app is open, so links follow; otherwise move the file and fix the links the lint names), set `status: archived`.
   - **Promote:** write the distilled rule as a few lines in the right `docs/` section (gotcha → `FIELD-NOTES.md`, fix → `TROUBLESHOOTING.md`, price or limit → `FAL-ENDPOINTS.md`), set `promoted_to:` on the lesson, remove it from the lane map's "not yet promoted" list. A standing law (`.claude/rules/`, `CLAUDE.md`) is proposed to Slava in Hebrew with the exact line and waits for his word.
   - **Split:** a note over 300 lines becomes an entry note plus linked notes, every one with full frontmatter.
   - **HOME:** only the generated block changes, through `build-hot.mjs`; Slava's part below `%% generated:end %%` is cut only on his word (propose the cut in Hebrew and stop).
3. **Regenerate and check.** `timeout 120 node tools/memory/build-hot.mjs`, `timeout 120 node tools/memory/lint.mjs`. A FAIL is fixed before the skill ends; warnings are reported.
4. **Close the block.** Applied and declined lines leave the `## Consolidation YYYY-MM-DD` block (declined ones with their reason in today's session note). One line in the session note: `- HH:MM — /consolidate: merged n, superseded n, archived n, promoted n, split n; caps now HOT n lines / n KB, HOME n lines, INDEX n lines; lint n FAIL n WARN`. A "Done" line in `memory/state/roadmap.md` when the harness changed.

## Report to Slava (Hebrew, at most 12 lines)
What was merged, superseded, archived and promoted (counts and the names that matter), what was declined and why, the caps now (HOT lines and KB, HOME lines, the longest note, the INDEX line count), the lint result, and anything waiting for his word (a rule, a cut in HOME).

## Rules
- Nothing is deleted: superseded and archived notes are kept. Projects' folders are never touched here (a project folder goes to `projects/_archive/` only on Slava's word).
- One writer: the main session; the librarian writes only `memory/inbox/proposals.md` and the archive moves it is told to make.
- Generated notes are never hand-edited; names and paths only; dates absolute.
