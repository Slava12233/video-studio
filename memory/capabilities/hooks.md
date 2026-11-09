---
type: capability
created: 2026-11-09
status: active
maintained_by: generated
categories: [capabilities]
summary: The 2 hook scripts under .claude/hooks, their events and whether project settings install them, generated.
generated_at: 2026-11-09T20:46+02:00
content_hash: e951b288eff7aed5
---

# Hooks

Never hand-edit; run node tools/memory/build-capabilities.mjs
Hooks are installed by Slava only: `docs/hooks-paste-block.md` holds the block for `.claude/settings.json`. "Installed" reads the project settings files for the script name. The vault works without them (sessions read `memory/HOT.md` themselves).

| Hook | Event | What it does | Installed |
|---|---|---|---|
| `pre-compact.mjs` | `PreCompact` (manual\|auto) | PreCompact hook (Node 20+, no dependencies): before a compaction, appends a "## Checkpoint HH:MM" block (Asia/Jerusalem) to today's session note memory/sessions/YYYY-MM/YYYY-MM-DD.md with the text of the last 8 assistant messages, each | yes |
| `session-start.mjs` | `SessionStart, SubagentStart` (*) | SessionStart and SubagentStart hook: injects memory/HOT.md (without its frontmatter) into every new session and every sub-agent as context, plus one line when Slava's inbox (memory/inbox/owner.md) holds unanswered lines. | yes |
