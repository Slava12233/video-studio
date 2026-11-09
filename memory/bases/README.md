---
type: contract
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [bases]
summary: The six .base dashboards embedded in HOME (projects, open items, lessons, decisions, references, sessions); their labels are Hebrew; how to add a view.
---

# bases/

The six `.base` files (`projects`, `open-items`, `lessons`, `decisions`, `references`, `sessions`) are the live tables that HOME embeds with `![[name.base]]`; each filters the notes by `type` and skips `memory/templates/`. Bases is a core Obsidian plugin (1.9+; this laptop runs 1.13.7), reads only YAML frontmatter, and needs no community plugin. Labels (`displayName`, view `name`) are Hebrew for Slava; the filters, properties and order are the contract's field names. To add a view, copy a block under `views:` and change its `filters` and `order`; the `obsidian-bases` skill documents the syntax and the functions. The agent can also query a base from the terminal when Obsidian is open: `node tools/memory/obsidian-setup.mjs --cli base:query path=memory/bases/projects.base format=md`.
