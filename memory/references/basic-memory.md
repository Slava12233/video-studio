---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, memory-systems]
summary: "basicmachines-co/basic-memory (AGPL-3.0, ~4.5k stars, Python 3.12 + uv, pushed 2026-11-08): an MCP memory server that stores Markdown with wikilinks and frontmatter (Obsidian-compatible) plus a SQLite index; skipped here (Python, AGPL, an index that drifts from the files)."
url: https://github.com/basicmachines-co/basic-memory
license: AGPL-3.0
checked: 2026-11-09
verdict: skipped
---

# basic-memory

**What it is.** An MCP server (`uv tool install basic-memory`) that keeps a knowledge graph in plain Markdown files with semantic markup, frontmatter and wikilinks, indexed in SQLite (Postgres optional; a paid cloud exists). Obsidian can open the same folder. Active maintenance (pushed 2026-11-08); no formal releases listed; Windows support unstated.

**Why it matters here.** The closest existing product to "an agent memory that is also an Obsidian vault"; its note shape (observations, relations as wikilinks) is a good sanity check for ours.

**What we took, or why not.** Skipped: it needs Python and `uv` on a Node-only studio, is AGPL, runs a second process, and its index must stay in sync with files the agent also edits directly. Borrowed the idea that relations are wikilinks and that every note is reachable by name.
