---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, anthropic]
summary: "Anthropic's guidance for agent memory: the smallest set of high-signal tokens, structured note-taking outside the context window, compaction, just-in-time retrieval by lightweight identifiers (paths), a progress log plus a checklist read at session start (memory tool docs)."
url: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
license: docs
checked: 2026-11-09
verdict: borrowed
---

# Anthropic: effective context engineering and the memory tool

**What it is.** The engineering post (2025-09-29) argues for the smallest set of high-signal tokens, structured note-taking persisted outside the context window (a `NOTES.md`), compaction, and just-in-time retrieval through lightweight identifiers such as file paths; sub-agents as a context-isolation technique. The memory tool docs (`memory_20250818`: view, create, str_replace, insert, delete, rename under `/memories`, client-side) describe the multi-session pattern: an initializer session sets up a progress log and a feature checklist, every later session reads them first and updates them before ending; expire unused files; validate paths. (The research agent saw the engineering post through summaries; the memory tool page was fetched.)

**Why it matters here.** It is the rationale for HOT (≤ 60 lines), INDEX grepped never read whole, maps as progressive disclosure, `state/current.md` with numbered next actions as the progress log, `/consolidate` as the expiry pass, and paths instead of copied content.

**What we took.** The design principles above, written into `memory/README.md` §5 and §6. Not taken: the API memory tool itself (this is Claude Code; the vault is the store).
