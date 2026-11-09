---
type: lesson
created: 2026-11-09
updated: 2026-11-09
status: confirmed
maintained_by: harness
categories: [lessons, harness]
summary: "The memory layer is plain Markdown plus Node scripts and two hooks: no MCP server, no Python, no database; research of 2026-11-09 found that is also the community convergence and Anthropic's own pattern (notes file + compaction + just-in-time retrieval)."
applies_to: [memory, harness]
evidence: "Research agents 2026-11-09: code.claude.com/docs/en/memory and /hooks, anthropic.com/engineering/effective-context-engineering-for-ai-agents, platform.claude.com memory tool docs; repos compared in memory/references/"
promoted_to: 
supersedes: ""
superseded_by: ""
---

# The memory layer is Node-only, file-based and bounded

**The fact.** The vault needs nothing but Node 20+ and Markdown: `tools/memory/*.mjs` generate HOT, INDEX, HOME's block and the capability map, lint the notes, create and log; `.claude/hooks/session-start.mjs` injects HOT (SessionStart matchers `startup|resume|clear|compact`, plus SubagentStart) and `pre-compact.mjs` writes a checkpoint (PreCompact matchers `manual|auto`; its stdout could steer the compaction summary, exit 2 would block it, this hook does neither). Claude Code's native auto-memory (`~/.claude/projects/<project>/memory/MEMORY.md`, 200 lines / 25 KB loaded) stays for user preferences and a pointer to the vault; the vault is the canonical memory. Tools that read many files run with `timeout 120` where the shell has it.

**Evidence.** The official memory and hooks pages read 2026-11-09 (SessionStart `additionalContext`, PreCompact `trigger`, SessionEnd's 1.5 s default budget which makes it unfit for writes); the comparison of `basic-memory`, `claude-mem`, Obsidian MCP servers and `claudesidian` in `memory/references/`.

**How to apply.** Add behaviour with a script and a line in the contract, not with a new service. Anything that must run automatically (every session, before compaction) is a hook, prepared as a paste block for Slava; anything the agent must do is a skill step plus a lint check that catches the omission.
