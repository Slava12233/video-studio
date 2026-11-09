---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, hooks]
summary: The memory hooks (SessionStart + SubagentStart inject HOT, PreCompact writes a checkpoint) are installed by Slava only; this page holds the block to paste into .claude/settings.json and how to verify it.
---

# Hooks: the block for `.claude/settings.json` (Slava pastes it)

Two small Node scripts in `.claude/hooks/` make the memory automatic: `session-start.mjs` prints `memory/HOT.md` (plus one line when the Hebrew inbox has unanswered lines) into every new session and every sub-agent as context; `pre-compact.mjs` appends a `## Checkpoint HH:MM` block (the last 8 assistant messages, scrubbed of key shapes, emails and phone numbers, 300 characters each) to today's `memory/sessions/YYYY-MM/YYYY-MM-DD.md` before Claude Code compacts a long conversation. Both need only Node 20+, always exit 0 and never block anything.

Per the laptop rules (`~/.claude/CLAUDE.md`), hooks and `settings*.json` are installed by Slava only. The agent prepared this block and stopped. **The vault works without the hooks**: `.claude/rules/memory.md` tells every session to read `memory/HOT.md` itself and to log as it goes; the hooks make that automatic and compaction-proof.

## The block

Open `.claude/settings.json` in the studio root and add the `"hooks"` key next to `"permissions"` (keep everything else as it is). If a `"hooks"` key already exists, add the three events inside it.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/session-start.mjs", "timeout": 15 }
        ]
      }
    ],
    "SubagentStart": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/session-start.mjs", "timeout": 15 }
        ]
      }
    ],
    "PreCompact": [
      {
        "matcher": "manual|auto",
        "hooks": [
          { "type": "command", "command": "node .claude/hooks/pre-compact.mjs", "timeout": 30 }
        ]
      }
    ]
  }
}
```

The commands use paths relative to the studio root, so start Claude Code from that folder (sessions started inside `projects/<slug>/` still find the vault: the scripts walk up to `memory/HOT.md`). If sessions are ever started from elsewhere, write `node "$CLAUDE_PROJECT_DIR/.claude/hooks/session-start.mjs"` instead.

## Verify

- Without a session, from the studio root: `echo {} | node .claude/hooks/session-start.mjs` prints JSON whose `additionalContext` starts with the HOT text.
- In a new session: ask "what does HOT say about the next actions?"; the answer quotes `memory/HOT.md` without reading it. Or run `claude --debug` and look for `session-start.mjs` exiting 0.
- For PreCompact: run `/compact` once; today's session note gains a `## Checkpoint` block.
- `node tools/memory/build-capabilities.mjs` then `memory/capabilities/hooks.md` shows "Installed: yes" for both scripts; `/studio-doctor` lists the hooks line.

## Turn them off

Delete the three events (or the whole `"hooks"` key). Sessions then read `memory/HOT.md` themselves, as the rule says, and `memory/capabilities/hooks.md` shows "no (paste block not applied)".

## Also Slava's: the HyperFrames marketplace copy (`enabledPlugins`)

The HyperFrames skills ship inside the repo (`.claude/skills/hyperframes-plugin/`, loaded in place as `hf@skills-dir`, skills typed `/hf:<skill>`). `.claude/settings.json` still enables the marketplace copy of the same plugin, so every HyperFrames skill is offered twice until this change lands. In `.claude/settings.json` replace the two keys at the top of the file with:

```json
{
  "enabledPlugins": {
    "hyperframes@hyperframes": false
  }
}
```

and delete the `"extraKnownMarketplaces"` block (the user-level copies of both keys in `~/.claude/settings.json` stay for the other projects). Alternative: `claude plugin disable hyperframes@hyperframes --scope project` from the studio root, then delete the block by hand. Verify: `/reload-plugins` (or a new session) lists only `/hf:*` HyperFrames skills; `node tools/doctor.mjs` shows "HyperFrames marketplace copy: off". The repo's copy is named `hf` on purpose: Claude Code refuses a plugin folder whose name matches an installed marketplace plugin, even a disabled one (`memory/lessons/tooling/2026-11-09-a-skills-dir-plugin-named-like-an-installed-plugin-is-not-loaded.md`).
