---
type: lesson
created: 2026-11-09
updated: 2026-11-09
status: confirmed
maintained_by: harness
categories: [lessons, tooling]
summary: "To see what a new session would load (skills, plugins, hooks) without asking Slava to restart, run a bounded headless session from the studio root: timeout 240 claude -p '<list the skills...>' --model haiku --max-turns 1 --output-format text [--settings '<json>'] [--debug]; --settings simulates a settings change at the flag level and --debug writes the plugin loading errors to ~/.claude/debug/<id>.txt."
applies_to: [claude-code, plugins, hooks, testing]
evidence: "Three runs on 2026-11-09 while vendoring the HyperFrames plugin: the first listed the 21 hyperframes:* skills (marketplace copy on), the second with --debug exposed the 'Not loaded ... name already taken' error for the skills-dir copy, the third after the rename listed the 21 hf:* skills only; each run took under a minute and ran the SessionStart hook (HOT visible in the debug log)"
promoted_to: 
supersedes: ""
superseded_by: ""
---

# A bounded headless `claude -p` shows what a session would load

**The fact.** A running session reads settings and plugins at start, so a change to `.claude/settings.json` or to `.claude/skills/` cannot be verified from inside it. A headless child session can: `timeout 240 claude -p "Without using any tools, list every skill available to you whose name contains X, one per line" --model haiku --max-turns 1 --output-format text` from the studio root loads the project settings, the plugins, the skills-dir plugins and the hooks exactly as a new session would, and answers in under a minute for a few cents. `--settings '{"enabledPlugins":{"<id>":false}}'` applies a settings change at the `flag` precedence level (above project, below managed) for that run only; `--debug` writes the plugin loading errors ("Not loaded — ...") and the hook outputs to `~/.claude/debug/<session-id>.txt`.

**Evidence.** See the frontmatter. Haiku's first answer without `--debug` was a bare "None", which looked like a model failure; the debug log showed the real cause (a plugin name conflict).

**How to apply.** Bound it (`timeout 240`, the Bash tool at 300,000 ms), use `--model haiku` and `--max-turns 1`, ask for a list and nothing else, and read the debug file when the answer is empty or odd. Do not use it for anything that spends money or writes files; it is a loading probe. Record what it proved in the lesson or decision that needed it.
