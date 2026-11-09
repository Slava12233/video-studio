---
type: map
created: 2026-11-09
status: active
maintained_by: generated
categories: [memory]
summary: One line per note in the vault, grouped by folder, newest first; generated, grep it.
generated_at: 2026-11-09T21:21+02:00
generated_by: /sync
content_hash: 3872f9862bfa0929
---

# INDEX

Never hand-edit; run node tools/memory/build-hot.mjs
48 notes (HOT and this index are not listed). One line each: `- [[name]] · type · summary`. Grep it; never read it whole past 300 lines.

## memory
- [[memory/README|README]] · contract · The contract of the studio's second brain - folders, note types, frontmatter, caps, who reads and writes what and when, generated notes, lint, Obsidian and the hooks.
- [[HOME]] · map · Slava's page in Hebrew - today, projects in flight, AI spend, open items by owner and the newest lessons (generated block), then the dashboards and the links.

## memory/bases
- [[memory/bases/README|README]] · contract · The six .base dashboards embedded in HOME (projects, open items, lessons, decisions, references, sessions); their labels are Hebrew; how to add a view.

## memory/capabilities
- [[tools]] · capability · The 23 Node tools under tools/ with their one-line purpose, generated.
- [[skills]] · capability · The 18 studio skills under .claude/skills (4 third-party, see THIRD-PARTY.md) and 21 plugin skills from 1 plugin folder there, generated.
- [[rules]] · capability · The 7 rule files under .claude/rules (always loaded or path-scoped), generated.
- [[hooks]] · capability · The 2 hook scripts under .claude/hooks, their events and whether project settings install them, generated.
- [[memory/capabilities/agents|agents]] · capability · The 7 sub-agents under .claude/agents with model, job and tool access, generated.

## memory/decisions
- [[2026-11-09-second-brain-in-obsidian]] · decision · Slava: the studio gets a second brain in Obsidian, installed A to Z, and the memory must always be kept current (status, what we learn, lessons); the root CLAUDE.md carries its rules.
- [[2026-11-09-hyperframes-skills-live-in-the-repo]] · decision · Slava: the HyperFrames skills must live at project level, not only in the user's plugin cache; the 0.8.160 release is vendored whole into .claude/skills/hyperframes-plugin/ as the plugin `hf` (skills /hf:<skill>), pinned and verified by the repo, and the marketplace copy goes off in the project set…
- [[2026-11-05-hebrew-chat-language]] · decision · Slava: every message to him in this repo is in Hebrew, including the question tool, the task list and the wrap-up; code, paths and repo files keep their language; overrides the laptop's English-only line for this repo.
- [[memory/decisions/_about|_about]] · contract · One note per ruling by Slava, YYYY-MM-DD-slug.md; never edited, superseded by a newer note; a go to spend is not a decision.

## memory/inbox
- [[proposals]] · inbox · Sub-agents append proposed lessons and corrections here; the main session merges them at /sync and empties the list.
- [[owner]] · inbox · Slava's inbox in Hebrew - he writes in plain language, the harness answers under each line at the start of every session; nothing is spent or published from this page.

## memory/lessons
- [[memory/lessons/_about|_about]] · contract · One fact per note under a category folder (rendering, composition, fal, hebrew-rtl, workflow, tooling, harness, operator); never edited, superseded; promoted to docs/ or a rule when earned twice.

## memory/lessons/harness
- [[2026-11-09-the-marketing-harness-vault-is-the-house-style]] · lesson · Slava's marketing harness (D:/AgentTeams/marketing-team-harness-main) already carries a proven Obsidian-vault memory (contract, generated HOT/INDEX, lint, bases, hooks, kepano skills); this studio's vault is that design adapted, not a new invention.
- [[2026-11-09-memory-tools-and-hooks-are-node-only-and-bounded]] · lesson · The memory layer is plain Markdown plus Node scripts and two hooks: no MCP server, no Python, no database; research of 2026-11-09 found that is also the community convergence and Anthropic's own pattern (notes file + compaction + just-in-time retrieval).

## memory/lessons/tooling
- [[2026-11-09-obsidian-is-a-machine-wide-install-on-this-laptop]] · lesson · On this laptop Obsidian 1.13.7 is installed for all users at C:/Program Files/Obsidian (winget Obsidian.Obsidian, uninstall string /allusers), not in %LOCALAPPDATA%; a winget upgrade needs admin; the per-user config still lives in %APPDATA%/obsidian.
- [[2026-11-09-obsidian-cli-needs-the-app-running-call-it-by-full-path]] · lesson · The official Obsidian CLI (1.12.7+) is the redirector Obsidian.com next to Obsidian.exe, needs the app running, is not on PATH on this laptop, and takes key=value parameters with vault=<name> first; call it as node tools/memory/obsidian-setup.mjs --cli <args>.
- [[2026-11-09-bash-commands-that-name-env-are-denied]] · lesson · A Bash command that mentions .env (even the grep for the key NAME that secrets.md suggests) or contains `rm -rf` is denied by the project's permission rules; check the key with `node tools/fal/fal.mjs --project .` (prints set / MISSING) and never use rm -rf.
- [[2026-11-09-a-skills-dir-plugin-named-like-an-installed-plugin-is-not-loaded]] · lesson · A plugin folder under .claude/skills/ (with .claude-plugin/plugin.json) loads in place as <name>@skills-dir, but Claude Code compares its manifest name against INSTALLED marketplace plugins, even ones disabled for the project: a vendored copy named hyperframes was 'Not loaded' until its manifest wa…
- [[2026-11-09-a-bounded-headless-claude-p-shows-what-a-session-would-load]] · lesson · To see what a new session would load (skills, plugins, hooks) without asking Slava to restart, run a bounded headless session from the studio root: timeout 240 claude -p '<list the skills...>' --model haiku --max-turns 1 --output-format text [--settings '<json>'] [--debug]; --settings simulates a s…

## memory/maps
- [[review]] · map · The Review lane map - the qa-reviewer agent and the main session before judging a rendered cut: the disclosure and RTL rules, the brief, the ledger, the review lessons.
- [[plan]] · map · The Plan lane map - the director agent and the main session before a treatment, storyboard or caption plan: the brief, the workflow for the type, the workflow and composition lessons.
- [[media]] · map · The Media lane map - the media-lab agent and the main session before any fal.ai job: the spend rule, the endpoint table, the fal and avatar lessons, the project's ledger.
- [[harness]] · map · The Harness lane map - the librarian agent and the main session at /sync, /consolidate and any change to the studio's own tools, skills, rules or memory: the contract, the procedure, the generated notes, the inboxes, the roadmap.
- [[deliver]] · map · The Deliver lane map - the deliverer agent and the main session before the final render and packaging: the render bounds, the disclosure file, the delivery facts, what the project note must show afterwards.
- [[build]] · map · The Build lane map - the compositor agent and the main session before authoring a composition or rendering a draft: the composition rules, the render bounds, the rendering and composition lessons.

## memory/open
- [[2026-11-09-turn-the-marketplace-hyperframes-copy-off]] · open · Done 2026-11-09: on Slava's yes in chat the harness set "hyperframes@hyperframes": false under enabledPlugins in .claude/settings.json and dropped its extraKnownMarketplaces block; from the next session only the vendored hf:* HyperFrames skills load.
- [[2026-11-09-install-the-memory-hooks]] · open · Done 2026-11-09: on Slava's yes in chat the harness added the three hook events (SessionStart, SubagentStart, PreCompact) to .claude/settings.json; HOT now lands in every session and sub-agent, a checkpoint is written before compaction.
- [[2026-11-09-fal-key-missing]] · open · Slava: put the fal.ai key after FAL_KEY= in .env (missing on 2026-11-09 by name); without it no generation, TTS, avatar or Hebrew transcription runs.
- [[2026-11-09-commit-the-second-brain]] · open · Slava: the second brain, the vendored HyperFrames plugin (.claude/skills/hyperframes-plugin/, 18 MB) and the Hebrew-language CLAUDE.md change are uncommitted in the working copy; the harness never commits unasked, so a commit (and a push) is his word.
- [[memory/open/_about|_about]] · contract · One note per open item with an owner (slava or harness) and status open until done; HOT and HOME list them by owner.

## memory/projects
- [[memory/projects/_about|_about]] · contract · One note per video project, named like its folder (YYYY-MM-DD-slug): kind, stage, spend, deliverable, current state and an append-only log.

## memory/references
- [[obsidian-mcp-servers]] · reference · Obsidian MCP servers compared 2026-11-09: bitbonsai/mcpvault (MIT, Node 22, file-based, no plugin, best fit if one is ever wanted), cyanheads/obsidian-mcp-server (Apache-2.0, needs the Local REST API plugin), MarkusPfundstein/mcp-obsidian (MIT, Python, REST plugin), StevenStavrakis/obsidian-mcp (MI…
- [[obsidian-cli-official]] · reference · The official Obsidian CLI (1.12.7+): enable in Settings > General, needs the app running, key=value syntax, vault=<name> first; files, search, properties, tags, tasks, bases, links, history, plugins, dev commands; json/tsv/csv output on list commands.
- [[kepano-obsidian-skills]] · reference · kepano/obsidian-skills (Steph Ango, MIT, ~51k stars): six Claude Code skills for Obsidian; four vendored here verbatim (obsidian-markdown, obsidian-bases, obsidian-cli, json-canvas), defuddle and knap skipped (npm global deps).
- [[claudesidian-and-memory-bank-patterns]] · reference · Vault starters and agent-memory patterns reviewed 2026-11-09: heyitsnoah/claudesidian (MIT, PARA folders, bash-only install, last push 2026-04), Cline's Memory Bank (six files, activeContext as current state), CoALA's episodic / semantic / procedural split, Letta's core vs archival memory and sleep…
- [[claude-mem]] · reference · thedotmack/claude-mem (Apache-2.0, ~115k stars, TypeScript + Bun worker, v15.13, pushed 2026-11-09): hooks-based auto-capture of Claude Code sessions into SQLite + Chroma with Haiku compression; skipped (opaque store outside the vault, lossy, Windows breakage reports, overbuilt for this studio).
- [[claude-code-plugin-loading]] · reference · Claude Code's plugin loading rules (official docs, 2026-11-09): plugin ids <name>@<marketplace|inline|skills-dir|synced>; a plugin folder under .claude/skills/ with .claude-plugin/plugin.json loads in place as <name>@skills-dir after the folder is trusted (project root only); enabledPlugins precede…
- [[claude-code-memory-and-hooks]] · reference · Claude Code's native memory and hooks (official docs, 2026-11-09): CLAUDE.md under ~200 lines, @imports, path-scoped .claude/rules, auto-memory MEMORY.md (200 lines / 25 KB loaded, relocatable with autoMemoryDirectory), SessionStart additionalContext, PreCompact can steer or block compaction, Sessi…
- [[basic-memory]] · reference · basicmachines-co/basic-memory (AGPL-3.0, ~4.5k stars, Python 3.12 + uv, pushed 2026-11-08): an MCP memory server that stores Markdown with wikilinks and frontmatter (Obsidian-compatible) plus a SQLite index; skipped here (Python, AGPL, an index that drifts from the files).
- [[anthropic-context-engineering-and-memory-tool]] · reference · Anthropic's guidance for agent memory: the smallest set of high-signal tokens, structured note-taking outside the context window, compaction, just-in-time retrieval by lightweight identifiers (paths), a progress log plus a checklist read at session start (memory tool docs).
- [[memory/references/_about|_about]] · contract · One external resource per note (repo, doc, model, skill) with a verdict, a licence and the date checked; docs/REFERENCES.md keeps the curated table.

## memory/sessions
- [[memory/sessions/_about|_about]] · contract · One append-only note per working day under YYYY-MM/: dated bullets, PreCompact checkpoints, a Close block from /sync.

## memory/sessions/2026-11
- [[2026-11-09]] · session · Session 2026-11-09: the second brain in Obsidian built A to Z (vault, tools, hooks installed on Slava's yes, skills, agent, rules); then the HyperFrames plugin release 0.8.160 vendored into the repo as the skills-dir plugin hf (/hf:<skill>) and the marketplace copy turned off on Slava's yes; FAL_KE…

## memory/state
- [[roadmap]] · state · How the harness itself evolves: the open improvements with an owner and a status, what was done and when, and what was considered and declined.
- [[current]] · state · The studio now: no video project yet; the second brain (Obsidian vault + tools + rules + hooks) installed 2026-11-09 and the hooks turned on with Slava's yes; FAL_KEY still missing; the commit is Slava's. Next actions numbered for the next session.
