---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, memory-systems]
summary: "thedotmack/claude-mem (Apache-2.0, ~115k stars, TypeScript + Bun worker, v15.13, pushed 2026-11-09): hooks-based auto-capture of Claude Code sessions into SQLite + Chroma with Haiku compression; skipped (opaque store outside the vault, lossy, Windows breakage reports, overbuilt for this studio)."
url: https://github.com/thedotmack/claude-mem
license: Apache-2.0
checked: 2026-11-09
verdict: skipped
---

# claude-mem

**What it is.** A Claude Code plugin (`npx claude-mem install` or the marketplace) that hooks Setup, SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PostToolUseFailure, Stop, SubagentStop and SessionEnd, compresses what happened with Haiku and stores it in `~/.claude-mem/claude-mem.db` (SQLite) plus Chroma vectors; a Bun-managed worker; Node 20.19+/22.12+. Secondary reports (dev.to comments, Reddit snapshots, May 2026) mention a Windows update breaking it, lossy compression and a hardcoded store path.

**Why it matters here.** The most popular answer to "Claude Code forgets"; worth knowing why it does not fit.

**What we took, or why not.** Skipped: the store is not Markdown and not in the vault, so Slava cannot read it in Obsidian; the compression decides what matters instead of the contract; it adds a worker and a plugin (plugins are Slava's). Borrowed nothing beyond the reminder that a Stop or PreCompact hook is the right moment to persist.
