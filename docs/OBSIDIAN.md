---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, obsidian]
summary: A plain-language guide to the studio's second brain in Obsidian - what it is, how it was set up with no click, HOME, the inbox, the dashboards, the CLI, the hooks, and what goes wrong.
---

# The second brain in Obsidian: a guide for Slava

## What it is

The studio remembers in plain text files under `memory/`: what is in flight right now, one note per video project, every lesson learned (one fact per note), every ruling you made, every open item, a note per working day, and the external repos and docs that were checked. Together they are a vault: a folder of linked notes. Claude reads it at the start of every session and writes to it as it works, so nothing depends on a long chat history, and the same lessons reach every future session and every sub-agent.

**Obsidian** shows that folder as a clickable notebook: your HOME page with today's picture, live tables of projects, open items and lessons, a graph of how notes connect, and an inbox where you write to the agent in Hebrew. You never have to use it: the harness works the same without it. It is the most comfortable way to look inside.

## How it was set up (no click)

Obsidian 1.13.7 was already installed on this laptop (for all users, `C:\Program Files\Obsidian\`). On 2026-11-09 `node tools/memory/obsidian-setup.mjs`:

1. registered the studio folder (the one with `CLAUDE.md` and `memory/`) as a vault in Obsidian's own settings file, the same entry Obsidian writes when someone opens a folder by hand; your other vaults stayed as they were;
2. kept the command line interface on in that file (it already was), so Claude can search the vault and move or rename notes with their links kept;
3. started Obsidian, which opens on this vault.

`/studio-doctor` checks all three; `/sync` re-runs the check. If Obsidian was open while the tool ran, close it and open it once. The vault uses only built-in features (Bases, Properties, Backlinks, Graph, Bookmarks, Templates): no community plugin to install. Obsidian hides the folders that are not notes (`node_modules/`, `.claude/`, `deliverables/`, renders, caches, generated media). The left sidebar's Bookmarks hold HOME, the inbox, the current state, the roadmap, HOT, the contract and this guide.

## HOME: your page

`memory/HOME.md` is the page to keep open. Its top part is rebuilt at every `/sync` (do not edit between the two `%%` marker lines; the check flags it): today's date and the next three actions, the projects in flight with their stage and AI spend, the AI spend per project, the open items by owner (you or Claude), the five newest lessons. Below it are the live tables (projects by stage and delivered, open items, lessons by date and by category and the ones promoted into the docs, decisions, external references, sessions) and the links. Everything under the generated block is yours: add your own notes or links there.

## The inbox: write to the agent

Open the inbox (`memory/inbox/owner.md`) and write anything in Hebrew under «פתוח», one line per matter: a question, a request, a correction ("the client wants the logo smaller"), an idea for a video or for the harness. At the start of every session Claude answers under your line (an indented line that starts with ↳) and moves the line to «נענה». The inbox never spends money or publishes anything: a line that would cost money becomes an estimate that still needs your go in chat.

## What the agent writes, and when

- **In the same turn as the change:** a project's stage (brief → planning → media → build → review → delivered), a ruling you made (a decision note, your words quoted), a finding (a lesson note), something waiting for you (an open item), one line in today's session note.
- **At the end of a session, `/sync`:** merges the sub-agents' proposals, answers the inbox, closes the day's note, makes `memory/state/current.md` true with numbered next actions, regenerates HOT, INDEX, HOME's block and the capability map, lints the vault. No commit: you commit.
- **Weekly, `/consolidate`:** merges duplicates, supersedes stale facts, archives delivered projects after 90 days, promotes a lesson earned twice into `docs/FIELD-NOTES.md` or a rule, enforces the caps.
- **`/recall <topic>`:** what the vault knows about a topic, with the notes to open.

## The command line (already on) and the hooks (your paste)

Obsidian's CLI lets Claude search the vault and rename or move notes with their links kept, when the app is open; the tools call it by its full path, nothing was added to your terminal. The two hooks that make the memory automatic (HOT into every session, a checkpoint before compaction) are a paste for you: `docs/hooks-paste-block.md`. Until then every session reads HOT itself.

## What goes wrong, and what to do

| What you see | What it means | What to do |
|---|---|---|
| HOME's top part is empty between the `%%` lines | `/sync` has not run yet | Ask for `/sync`, or run `node tools/memory/build-hot.mjs` |
| The tables on HOME are empty | No project, lesson or decision notes yet of that type | Normal before the first project |
| A table shows an unknown file type | Obsidian older than 1.9 | Help → Check for updates |
| `/sync` stops with "lint: … FAIL" | A note breaks a rule: a phone or email, a dead link, a hand edit inside a generated part, a key shape | Ask Claude to fix the lines it names; never put a private person's details or a key in a note |
| You edited HOME between the `%%` lines | The next build overwrites it and the lint flags it | Write below the generated part |
| Obsidian opens on its start screen, not on this vault | The setup tool has not run on this computer | `node tools/memory/obsidian-setup.mjs` in the studio folder |
| Claude says the Obsidian CLI does not answer | Obsidian is closed, or was open while the CLI was enabled | Open Obsidian (or close and reopen it once) |
| HOT never appears in new sessions | The hooks are not pasted yet, or Claude Code started from another folder | Paste `docs/hooks-paste-block.md`; start Claude Code from the studio folder |
| A note's `updated` date is older than its content | A hand edit without the date | `node tools/memory/lint.mjs --fix-frontmatter-updated` |

## On the phone (optional)

Obsidian Sync (a paid Obsidian service, not part of this studio) can mirror the vault to a phone: Settings → Core plugins → Sync, exclude `projects/`, `node_modules/` and `deliverables/`. Write on the phone only in the inbox; let the harness write everything else.
