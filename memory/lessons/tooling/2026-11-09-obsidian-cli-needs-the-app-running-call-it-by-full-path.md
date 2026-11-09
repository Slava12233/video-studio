---
type: lesson
created: 2026-11-09
updated: 2026-11-09
status: confirmed
maintained_by: harness
categories: [lessons, tooling]
summary: "The official Obsidian CLI (1.12.7+) is the redirector Obsidian.com next to Obsidian.exe, needs the app running, is not on PATH on this laptop, and takes key=value parameters with vault=<name> first; call it as node tools/memory/obsidian-setup.mjs --cli <args>."
applies_to: [obsidian, memory, tooling]
evidence: "https://obsidian.md/help/cli (fetched 2026-11-09); C:/Program Files/Obsidian/Obsidian.com present, `where obsidian` empty, user and machine PATH without Obsidian (2026-11-09)"
promoted_to: 
supersedes: ""
superseded_by: ""
---

# The Obsidian CLI needs the app running; call it by full path

**The fact.** Obsidian 1.12.7+ ships a command line interface: on Windows a terminal redirector `Obsidian.com` next to `Obsidian.exe` that connects stdin/stdout to the running app. It requires the app to be running (a first command launches it), targets the most recently focused vault unless `vault=<name>` comes first, takes `key=value` parameters and bare-word flags (`obsidian search query="caps" format=json`, `obsidian read file="HOT"`, `obsidian base:query path=memory/bases/projects.base format=md`), and is enabled by the `cli: true` key in `%APPDATA%\obsidian\obsidian.json` (the toggle in Settings > General). Registration is supposed to add it to the user PATH, but on this laptop nothing of Obsidian is on PATH.

**Evidence.** `help.obsidian.md/cli` read 2026-11-09 (full command list in the `obsidian-cli` skill and the reference note [[obsidian-cli-official]]); `C:\Program Files\Obsidian\Obsidian.com` (22 KB) exists; `where obsidian` finds nothing; the vault config already had `"cli": true`.

**How to apply.** Never depend on `obsidian` being on PATH: run `node tools/memory/obsidian-setup.mjs --cli <args>` (it resolves `Obsidian.com` itself) and only when the app is open; everything the vault needs works on plain files without it. Use the CLI where it beats files: `search` across the vault, `move`/`rename` with links kept, `base:query`, `backlinks`, `unresolved`.
