---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, obsidian]
summary: "The official Obsidian CLI (1.12.7+): enable in Settings > General, needs the app running, key=value syntax, vault=<name> first; files, search, properties, tags, tasks, bases, links, history, plugins, dev commands; json/tsv/csv output on list commands."
url: https://obsidian.md/help/cli
license: Obsidian app, free for commercial use (obsidian.md/license, 2025-02-20)
checked: 2026-11-09
verdict: adopted
---

# The official Obsidian CLI

**What it is.** A command line interface shipped inside Obsidian 1.12.7+ (Settings > General > "Command line interface"). Syntax: `obsidian [vault=<name|id>] <command> key=value ... flag`; `file=` resolves like a wikilink, `path=` is an exact vault path; `\n` and `\t` in `content=`; `--copy` copies the output. Output formats: `format=json|tsv|csv` on `backlinks`, `tags`, `tasks`, `unresolved`, `plugins`, `bookmarks`, `hotkeys`; `search format=text|json`; `properties yaml|json|tsv`; `outline tree|md|json`; `base:query json|csv|tsv|md|paths`. Commands by family: general (`help`, `version`, `reload`, `restart`), bases (`bases`, `base:views`, `base:create`, `base:query`), daily notes, files (`file`, `files`, `folder(s)`, `open`, `create`, `read`, `append`, `prepend`, `move`, `rename`, `delete`), history (`diff`, `history*`), links (`backlinks`, `links`, `unresolved`, `orphans`, `deadends`), `outline`, `wordcount`, plugins, properties (`properties`, `property:set|remove|read`, `aliases`), search (`search`, `search:context`, `search:open`), tags and tasks, templates, bookmarks, commands and hotkeys, vault (`vault info=name|path|files|folders|size`, `vaults`), workspace and tabs, developer (`devtools`, `dev:*`, `eval code=`). Requires the running app; on Windows the redirector is `Obsidian.com`.

**Why it matters here.** Search across the vault, moves and renames with links kept, `base:query` for dashboards from the terminal, `unresolved` for dead links, when Obsidian is open.

**What we took.** `node tools/memory/obsidian-setup.mjs --cli <args>` wraps it by full path ([[2026-11-09-obsidian-cli-needs-the-app-running-call-it-by-full-path]]); the `obsidian-cli` skill is vendored. Not depended on: the vault works on plain files.
