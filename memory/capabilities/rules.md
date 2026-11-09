---
type: capability
created: 2026-11-09
status: active
maintained_by: generated
categories: [capabilities]
summary: The 7 rule files under .claude/rules (always loaded or path-scoped), generated.
generated_at: 2026-11-09T20:34+02:00
content_hash: 28531223087d798e
---

# Rules

Never hand-edit; run node tools/memory/build-capabilities.mjs
Unscoped rules load every session; path-scoped ones load when a matching file is touched. `CLAUDE.md` at the root summarises them.

| Rule | Loads | Title | Path |
|---|---|---|---|
| `composition` | `projects/**/*.html`, `projects/**/*.mjs` | HyperFrames compositions (loads when touching a composition or a build script) | `.claude/rules/composition.md` |
| `disclosure` | always | AI disclosure (always loaded) | `.claude/rules/disclosure.md` |
| `fal-spend` | always | fal.ai spend (always loaded) | `.claude/rules/fal-spend.md` |
| `hebrew-rtl` | `**/*.html`, `**/*.css`, `**/*.srt`, `**/transcript*.json`, `**/words*.json` | Hebrew and RTL (loads when touching compositions, styles, captions or transcripts) | `.claude/rules/hebrew-rtl.md` |
| `machine-limits` | always | Machine limits for this studio (always loaded) | `.claude/rules/machine-limits.md` |
| `memory` | always | Memory: the second brain (always loaded) | `.claude/rules/memory.md` |
| `secrets` | always | Secrets (always loaded) | `.claude/rules/secrets.md` |
