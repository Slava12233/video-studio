---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, claude-code]
summary: "Claude Code's native memory and hooks (official docs, 2026-11-09): CLAUDE.md under ~200 lines, @imports, path-scoped .claude/rules, auto-memory MEMORY.md (200 lines / 25 KB loaded, relocatable with autoMemoryDirectory), SessionStart additionalContext, PreCompact can steer or block compaction, SessionEnd has 1.5 s."
url: https://code.claude.com/docs/en/memory
license: docs
checked: 2026-11-09
verdict: borrowed
---

# Claude Code memory and hooks (official)

**What it is.** The memory page: `CLAUDE.md` and `AGENTS.md` are read; keep each under ~200 lines; `@path` imports load with the importing file (they do not save context); a project-level import outside the working directory asks once; `.claude/rules/` files load always or by path glob; auto-memory lives in `~/.claude/projects/<project>/memory/` with a `MEMORY.md` index of which only the first 200 lines or 25 KB load, topic files on demand, relocatable with `autoMemoryDirectory` (a settings change: Slava's). The hooks page (33 events): SessionStart (matchers `startup`, `resume`, `clear`, `compact`, `fork`; stdout or `hookSpecificOutput.additionalContext` lands in context; cannot block), SubagentStart (same shape), PreCompact (matchers `manual`, `auto`; input `trigger`, `custom_instructions`; exit 2 or `decision: block` blocks compaction; stdout on exit 0 becomes instructions for the summary, 10,000 characters), SessionEnd (input `reason`; 1.5 s default budget, cheap logging only), Stop (`last_assistant_message`).

**Why it matters here.** It bounds the design: HOT must stay small because it is injected every session; the vault is the canonical memory and auto-memory keeps only a pointer and preferences; the PreCompact hook writes the checkpoint; nothing is hung on SessionEnd.

**What we took.** The hook contract in `.claude/hooks/session-start.mjs` and `pre-compact.mjs`; the rule file `.claude/rules/memory.md` (always loaded) and the contract `memory/README.md`; a pointer note in the auto-memory directory. Not taken: `autoMemoryDirectory` into the vault (two frontmatter schemas would mix; revisit in the roadmap if Slava wants one store).
