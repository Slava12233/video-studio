---
type: lesson
created: 2026-11-09
updated: 2026-11-09
status: confirmed
maintained_by: harness
categories: [lessons, tooling]
summary: "A plugin folder under .claude/skills/ (with .claude-plugin/plugin.json) loads in place as <name>@skills-dir, but Claude Code compares its manifest name against INSTALLED marketplace plugins, even ones disabled for the project: a vendored copy named hyperframes was 'Not loaded' until its manifest was renamed hf (claude --debug, 2026-11-09)."
applies_to: [claude-code, plugins, hyperframes]
evidence: "Headless run from the studio root with --settings '{\"enabledPlugins\":{\"hyperframes@hyperframes\":false}}' and --debug on 2026-11-09: ~/.claude/debug/<id>.txt says 'Not loaded — the name \"hyperframes\" is already taken by an installed plugin (hyperframes@hyperframes), which takes precedence. Give the plugin ... a different name'; after the rename the same run listed the 21 hf:* skills and no hyperframes:* skill"
promoted_to: 
supersedes: ""
superseded_by: ""
---

# A skills-dir plugin named like an installed plugin is not loaded

**The fact.** Claude Code loads a folder under the project's `.claude/skills/` that holds `.claude-plugin/plugin.json` as a plugin (`<name>@skills-dir`, in place, after the folder is trusted, from the primary working directory only). Its name-conflict rule compares the manifest `name` against installed marketplace plugins and refuses the folder when one matches: "Not loaded — the name is already taken by an installed plugin ... which takes precedence". Disabling the marketplace plugin for the project (`"<id>": false` in settings, even at the `--settings` flag level) does not lift the conflict; only a different manifest name does. A plain `enabledPlugins` `false` does work for what it says: the marketplace copy's skills vanished from the session.

**Evidence.** See the frontmatter. The vendored HyperFrames release in `.claude/skills/hyperframes-plugin/` therefore carries `"name": "hf"` in `.claude-plugin/plugin.json` (the upstream portable `plugin.json` keeps `hyperframes`, which its `plugin-cli.mjs` insists on), and its skills are `/hf:<skill>`.

**How to apply.** When vendoring any plugin into this repo, give the manifest a name no marketplace plugin on the machine uses, record the reason in `VENDORED.json`, and verify with a bounded headless run ([[2026-11-09-a-bounded-headless-claude-p-shows-what-a-session-would-load]]) before asking Slava to change settings. Ask Slava to turn the marketplace copy off in `.claude/settings.json`, or every skill is offered twice. Docs: [[claude-code-plugin-loading]].
