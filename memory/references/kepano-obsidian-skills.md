---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, obsidian]
summary: "kepano/obsidian-skills (Steph Ango, MIT, ~51k stars): six Claude Code skills for Obsidian; four vendored here verbatim (obsidian-markdown, obsidian-bases, obsidian-cli, json-canvas), defuddle and knap skipped (npm global deps)."
url: https://github.com/kepano/obsidian-skills
license: MIT (Copyright (c) 2026 Steph Ango)
checked: 2026-11-09
verdict: adopted
---

# kepano/obsidian-skills

**What it is.** Six agent skills by Obsidian's CEO: `obsidian-markdown` (wikilinks, embeds, callouts, properties), `obsidian-bases` (`.base` views, filters, formulas, summaries, with a functions reference), `obsidian-cli` (the official CLI commands), `json-canvas` (`.canvas` files), `defuddle` (clean Markdown from a web page; needs `npm install -g defuddle`), `knap` (notes from templates and JSON/CSV; needs `npm install -g knap`). Pure Markdown instructions, no scripts. Install methods upstream: the Claude Code marketplace (`/plugin marketplace add kepano/obsidian-skills`), `npx skills add`, or copying `skills/*` into `.claude/skills/`.

**Why it matters here.** Every vault note, base and canvas the studio writes follows these conventions, and the marketing harness vendored the same four.

**What we took.** Commit `3ccff5338ea700537839b21900aa5358a0402c98` (2026-09-15) cloned 2026-11-09 into the scratchpad (untrusted input: read, nothing executed); `skills/obsidian-markdown`, `obsidian-bases`, `obsidian-cli`, `json-canvas` copied into `.claude/skills/` with LF line ends and the LICENSE file beside each; hashes and the MIT text in `THIRD-PARTY.md`. Not the plugin route: plugins and settings are Slava's, and a vendored copy is pinned. `defuddle` and `knap` skipped: global npm installs this studio does not need.
