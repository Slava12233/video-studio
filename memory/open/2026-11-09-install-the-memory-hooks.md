---
type: open
created: 2026-11-09
updated: 2026-11-09
status: done
owner: slava
maintained_by: harness
categories: [open, harness]
summary: "Done 2026-11-09: on Slava's yes in chat the harness added the three hook events (SessionStart, SubagentStart, PreCompact) to .claude/settings.json; HOT now lands in every session and sub-agent, a checkpoint is written before compaction."
---

# Install the memory hooks

**Done 2026-11-09.** Slava answered "כן, התקן עכשיו" to the question in chat; the harness merged the `hooks` key from `docs/hooks-paste-block.md` into `.claude/settings.json` (the other keys untouched). `memory/capabilities/hooks.md` shows both scripts installed. The first session started after this one gets HOT from the hook (Claude Code reads the settings at start; a running session does not).

**What is waiting.** The two hook scripts exist (`.claude/hooks/session-start.mjs`, `.claude/hooks/pre-compact.mjs`) and work from the command line, but `.claude/settings.json` does not name them yet, so HOT is not injected automatically and no checkpoint is written before a compaction. Hooks and settings are installed by Slava only (`~/.claude/CLAUDE.md`).

**Who acts, and the click or the answer needed.** Slava: paste the JSON block from `docs/hooks-paste-block.md` into `.claude/settings.json` (merge the `"hooks"` key next to `permissions`), or answer the question in chat with yes; then any session runs `node tools/memory/build-capabilities.mjs` and `memory/capabilities/hooks.md` shows "Installed: yes".

**Cost or risk of waiting.** Every session must read `memory/HOT.md` itself (the rule says so, but a rule is weaker than a hook); a compaction loses the last messages unless the session logged them.

**Links.** [[current]] · [[hooks-paste-block]]
