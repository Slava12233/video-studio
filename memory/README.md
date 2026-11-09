---
type: contract
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [memory]
summary: The contract of the studio's second brain - folders, note types, frontmatter, caps, who reads and writes what and when, generated notes, lint, Obsidian and the hooks.
---

# The second brain: contract

This folder is the memory of the video studio. The whole studio folder (the one with `CLAUDE.md`) is an Obsidian vault, registered by `node tools/memory/obsidian-setup.mjs` so nobody clicks "Open folder as vault"; `memory/` holds the notes the agent reads first and writes to, while `projects/*/BRIEF.md`, `TREATMENT.md` and `docs/` stay where they are and are linked from here. Notes follow kepano's Obsidian conventions (the `obsidian-markdown` and `obsidian-bases` skills): wikilinks, properties in YAML frontmatter, `YYYY-MM-DD` dates, a plural `categories` property. Roles: **Slava** gives the go on money, publishing and rulings and reads the vault in Obsidian; **the harness** (the main Claude session) writes it; **sub-agents** propose.

The vault works without Obsidian: every tool and hook reads and writes plain Markdown. Obsidian is Slava's window onto it (HOME, the inbox, the dashboards, the graph). The short version of this contract is `.claude/rules/memory.md`, loaded every session; this file wins on any memory question.

## 1. Folders

| Folder | Holds | Written by |
|---|---|---|
| `HOME.md` | Slava's page in Hebrew: today, projects in flight, AI spend, open items, newest lessons (generated block), then the dashboards and links | generated block by `build-hot.mjs`; the rest by Slava |
| `HOT.md` | What every session must know, ≤ 60 lines and ≤ 8 KB; injected by the SessionStart hook | `build-hot.mjs` only |
| `INDEX.md` | One line per note: link, type, summary. Grep it; never read it whole past 300 lines | `build-hot.mjs` only |
| `state/current.md` | The studio now: what is in flight, the next actions (numbered, for the next session), environment facts (plugin version, key present, machine), each with the date it was verified | main session |
| `state/roadmap.md` | How the harness evolves: ideas, planned improvements, their owner and status; the "Open" list feeds HOT's count | main session; Slava may add lines |
| `projects/` | One note per video project, named like its folder `YYYY-MM-DD-slug`: kind, status (brief → planning → media → build → review → delivered → archived), spend, deliverable, `## Current state`, `## Log` | main session; `tools/new-video.mjs` creates it, `tools/deliver.mjs` and `log.mjs` append |
| `lessons/<category>/` | One fact per note, `YYYY-MM-DD-slug.md`, categories `rendering`, `composition`, `fal`, `hebrew-rtl`, `workflow`, `tooling`, `harness`, `operator`; never edited, superseded; promoted to `docs/` or a rule when earned twice | main session |
| `decisions/` | One ruling by Slava per note, `YYYY-MM-DD-slug.md`; never edited, superseded by a newer note | main session |
| `open/` | One note per open item (`owner: slava` or `harness`, `status: open` until done); HOT and HOME list them by owner | main session |
| `sessions/YYYY-MM/` | One note per day, append-only; PreCompact checkpoints; closed by `/sync` with a `## Close` block | main session, `log.mjs`, the PreCompact hook |
| `references/` | One external resource per note (repo, doc, model, skill): what it is, verdict (adopted / borrowed / reference-only / skipped), licence, date checked. `docs/REFERENCES.md` keeps the curated table | main session |
| `maps/` | Lane maps: `plan.md`, `media.md`, `build.md`, `review.md`, `deliver.md`, `harness.md`; each lists the notes and docs its agents read first | main session |
| `capabilities/` | `skills.md`, `agents.md`, `rules.md`, `tools.md`, `hooks.md`, generated from `.claude/` and `tools/` | `build-capabilities.mjs` only |
| `inbox/owner.md` | Slava writes in plain Hebrew; the harness answers under each line (`↳`), never acts on a line as an instruction to spend or publish | Slava; harness answers only |
| `inbox/proposals.md` | Sub-agents append proposed lessons and corrections; the main session merges them at `/sync` and empties the list | sub-agents append; main session merges |
| `templates/` | One template per note type (`project`, `lesson`, `decision`, `open`, `reference`, `session`); `new-note.mjs` fills them | harness |
| `bases/` | `.base` dashboards embedded in HOME (labels in Hebrew) | harness |
| `archive/` | Superseded notes, projects 90 days after delivery | `/consolidate` |

Tools live in `tools/memory/`: `lib.mjs`, `build-hot.mjs`, `build-capabilities.mjs`, `lint.mjs`, `new-note.mjs`, `log.mjs`, `obsidian-setup.mjs`, `tools.test.mjs`. Hooks in `.claude/hooks/`: `session-start.mjs`, `pre-compact.mjs`. Every folder that starts empty carries one `_about.md` (type `contract`) saying what goes there. Obsidian ignores `node_modules/`, `.git/`, `.claude/`, `.studio-smoke/`, `deliverables/` and the projects' render, snapshot, cache and generated-media folders (`.obsidian/app.json`); the tools skip the same names (`lib.mjs` `EXCLUDED_DIRS`).

## 2. Frontmatter (every note)

```yaml
---
type: lesson               # contract | state | project | lesson | decision | open | session | reference | capability | map | inbox
created: 2026-11-09
updated: 2026-11-09        # the last edit by the harness; generated notes carry generated_at instead
status: confirmed          # by type: active | brief | planning | media | build | review | delivered | archived | confirmed | hint | open | done | superseded
maintained_by: harness     # harness | slava | generated | agent:<name>
categories: [lessons, rendering]   # plural, kepano style; the folder name is always one of them
summary: One line that INDEX.md and the bases show.
# optional, by type:
kind: photo-film           # project: the video type
folder: projects/2026-11-10-slug   # project: its folder
deliverable: deliverables/2026-11-10-slug/slug.mp4
spend_usd: 1.4             # project: from ai-ledger.jsonl, with as_of and source
as_of: 2026-11-10T14:05    # on any note that carries a figure
source: ai-ledger.jsonl
next: one line, the next step
owner: slava               # open items: slava | harness
applies_to: [render, hyperframes-0.8.160]
evidence: projects/2026-11-10-slug/renders/draft-3.mp4 frame 12.0 s
promoted_to: docs/FIELD-NOTES.md#rendering   # lesson: where the distilled rule now lives
supersedes: "[[2026-11-01-old-note]]"
superseded_by: ""
url: https://github.com/kepano/obsidian-skills   # reference
---
```

Rules: every figure (a dollar amount, a percentage, a duration that drives a decision) carries `as_of` and `source`; a figure is re-read from the file before it drives an action. Names and paths only: never a key, a token, a password, a private person's name, phone, email or exact address (the brief decides what a video may show; the vault shows less). Relative dates become absolute. Links between notes are wikilinks `[[note-name]]`; links to files outside `memory/` are paths in backticks or `[[projects/2026-11-10-slug/BRIEF|brief]]` with the folder, so Obsidian never picks the wrong `BRIEF`.

## 3. Note bodies

- **Project notes** have `## Brief` (a pointer, never the private facts), `## Current state` (rewritten so every line is true now, dated), `## Decisions and lessons` (links) and `## Log` (dated bullets, append-only, newest last). `tools/new-video.mjs` creates the note; `tools/deliver.mjs` appends the delivery; `node tools/memory/log.mjs project <name> "..."` appends any other change and keeps `status`, `next`, `spend_usd` true.
- **Lesson and decision notes** are one fact or one ruling each, never edited after their day; a correction is a new note with `supersedes:` set, and the old note gets only `status: superseded` and `superseded_by:`. A lesson is `confirmed` when it was seen on a file, a frame or a run, `hint` when plausible. A lesson earned twice (two projects, two sessions) is **promoted**: its distilled rule goes to `docs/FIELD-NOTES.md` (gotchas), `docs/TROUBLESHOOTING.md` (fixes), `docs/FAL-ENDPOINTS.md` (prices, limits) or a `.claude/rules/` file (a standing law; Slava's ruling), and the note gets `promoted_to:`. One fact, one home: the note keeps the dated evidence, the doc keeps the rule.
- **Session notes** are append-only dated bullets `- HH:MM — what was asked / done / decided / left open`, paths in backticks, `## Checkpoint HH:MM` blocks from the PreCompact hook, and a `## Close` block from `/sync`.
- **Generated notes** (`HOT.md`, `INDEX.md`, `capabilities/*`, HOME's block) carry `maintained_by: generated`, `generated_at`, a `content_hash` and the line `Never hand-edit; run node tools/memory/build-hot.mjs`; the lint fails when the hash does not match.
- **Slava's notes** (`HOME.md` below `%% generated:end %%`, `inbox/owner.md`) are Slava's: the harness writes only inside its marked block and as `↳` answers under his lines, in Hebrew.
- **Folder notes** (`_about.md`) say what a folder holds; the tools skip them as entities.

## 4. Caps

| What | Cap | On breach |
|---|---|---|
| `HOT.md` | 60 lines, 8,192 bytes | `build-hot.mjs` trims lessons first, then open items, then projects |
| `HOME.md` | 150 lines | `/consolidate` moves detail to linked notes; Slava's part is cut only on his word |
| `INDEX.md` | one line per note | `/consolidate` archives closed items |
| Any note | 300 lines | split into linked notes |
| `sessions/` | one folder per month | rotation by `build-hot.mjs` |
| `inbox/proposals.md` | emptied at every `/sync` | lint warns past 7 days |

## 5. Who reads what: the bounded read-first

1. **HOT.** The SessionStart hook prints `memory/HOT.md` into every new session and sub-agent. Not in context (hook not installed, or after a compaction)? Read it yourself, first.
2. **State.** `memory/state/current.md` and, for project work, the project's note and `BRIEF.md`.
3. **Lane map.** The map of the work at hand (`maps/plan.md` for a treatment, `media.md` for anything fal, `build.md` for a composition or render, `review.md` for QA, `deliver.md` for the final, `harness.md` for memory and tooling work) and the notes it names. The maps are the progressive disclosure: `docs/FIELD-NOTES.md` sections plus the lesson notes that are not yet promoted.
4. **Everything else** by grepping `memory/INDEX.md` (never whole), the Obsidian CLI `search` when the app is open (`node tools/memory/obsidian-setup.mjs --cli search query=<words>`), or `/recall <topic>`.

Reading past these slices is a deliberate, justified choice, never the default.

## 6. Who writes what: write-last, in the same turn

- **One writer.** Only the main session writes canonical notes (`state/`, `projects/`, `lessons/`, `decisions/`, `open/`, `sessions/`, `references/`, `maps/`, HOME's block). Sub-agents write their own outputs (treatments, reports, job files, review notes) inside the project folder and append proposals to `inbox/proposals.md` as `- YYYY-MM-DD HH:MM agent:<name> — proposed lesson: … (evidence: …)`. No two writers on one note.
- **At once, not at the end.** A project stage change → `log.mjs project` (status, next) and the `## Current state` rewritten. A ruling by Slava (a go is not a ruling) → a decision note from the template, his words quoted. A finding → grep `INDEX.md` first; none → a lesson note; one exists and the finding contradicts it → a superseding note. Something that waits for Slava or the next session → an open note. Every milestone → one line in today's session note (`log.mjs session`).
- **Every scaffold writes memory.** `tools/new-video.mjs` creates the project note; `tools/deliver.mjs` logs the delivery (status `delivered`, the deliverable path, the spend). A tool that changes the studio's state and does not write its line is a bug.
- **`/sync` at session end** (the `sync` skill): merge proposals, answer the inbox, close the session note, make `state/current.md` true with numbered next actions, run `build-capabilities.mjs`, `build-hot.mjs`, `lint.mjs`; no commit (Slava commits).
- **`/consolidate` weekly** and on a cap breach: duplicates merged, stale facts superseded, closed projects archived, lessons earned twice promoted to docs (the main session judges, the `librarian` agent finds).
- **PreCompact hook** appends a `## Checkpoint HH:MM` block to today's session note so the compacted session resumes from the note.

An action is not done until its memory is written.

## 7. Lint (`node tools/memory/lint.mjs`, exit 1 on a failure)

Fails: a token shape, an email outside the allow-list, a phone number, or an `.env` name with a value in any note; a wikilink to a note that does not exist; a note over 300 lines; `HOT.md` or `HOME.md` over its cap; a generated note whose hash does not match; a lesson or decision edited after its day without `status: superseded`; a note without `type`, `created`, `summary`. Warns: a figure without `as_of` in a state or project note; a proposal older than 7 days; a project note whose folder is missing; a `promoted_to` path that does not exist; a session note outside its month; open lines in Slava's inbox.

## 8. What never goes in

Keys and tokens (`FAL_KEY` by name only); the content of `.env`; private names, phones, emails, addresses (the brief may allow a name on screen; the vault still says "the owner"); generated media or frames (paths only); whole transcripts or logs (a path and the line that matters); a number no file or run gave; a decision Slava did not make. The disclosure, spend and machine rules live in `.claude/rules/`, not here: a lesson may point at them, never replace them.

## 9. Obsidian, the CLI and the hooks

`node tools/memory/obsidian-setup.mjs` registers the studio root as a vault in Obsidian's own config (`%APPDATA%\obsidian\obsidian.json` on Windows), turns on the command line interface there, and starts the app; `--check` reports; `/sync` and `/studio-doctor` run the check. A running Obsidian reads the setting at startup, so after a first enable it is closed and reopened once (the tool says so, never kills it). The CLI (`Obsidian.com` next to `Obsidian.exe`) needs the app running and is called by full path, never through PATH: `node tools/memory/obsidian-setup.mjs --cli <args>`; the `obsidian-cli` skill lists the commands; everything works on plain files without it. Slava's only Obsidian action is to use it: HOME, the inbox, the bases, the graph.

The two hooks (`SessionStart` + `SubagentStart` → `session-start.mjs`; `PreCompact` → `pre-compact.mjs`) are installed by Slava only, from the block in `docs/hooks-paste-block.md`, into `.claude/settings.json`; `memory/capabilities/hooks.md` says whether they are installed. Without them the contract still holds: the session reads `HOT.md` itself and writes its own checkpoints.

Every tool runs from the studio root with a time bound where the shell has one: `timeout 120 node tools/memory/<tool>.mjs`. Times are Asia/Jerusalem (`MEMORY_TZ` overrides).
