---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, claude-code]
summary: "Claude Code's plugin loading rules (official docs, 2026-11-09): plugin ids <name>@<marketplace|inline|skills-dir|synced>; a plugin folder under .claude/skills/ with .claude-plugin/plugin.json loads in place as <name>@skills-dir after the folder is trusted (project root only); enabledPlugins precedence user < project < local < flag < managed; name conflicts: an installed marketplace plugin beats a same-named skills-dir plugin; the manifest version pins a release."
url: https://code.claude.com/docs/en/plugins/loading
license: docs
checked: 2026-11-09
verdict: adopted
---

# Claude Code plugin loading (official)

**What it is.** The reference page for where a plugin is loaded from and which settings file decides it. Ids are `<name>@<origin>`: `@<marketplace>` (installed, copied into `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`), `@inline` (`--plugin-dir`, `--plugin-url`, `CLAUDE_CODE_PLUGIN_DIRS`: this session only), `@skills-dir` (a plugin directory with `.claude-plugin/plugin.json` under `~/.claude/skills/` or the project's `.claude/skills/`; loaded in place, never copied), `@synced` (claude.ai). "To share a plugin through a repository, list it under `enabledPlugins` in `.claude/settings.json` or place it under `.claude/skills/`. Claude Code doesn't scan a project's `.claude/plugins/` directory." A repository plugin loads only after the workspace trust dialog for that folder, from the session's primary working directory (not a parent, not a subfolder); its MCP bundles and monitors do not load. `enabledPlugins` merges key by key, lowest to highest: `--add-dir`, user, project, local, `--settings` flag, managed; a project `false` therefore overrides a user `true`. Name conflicts (manifest names): managed > `--plugin-dir` > installed marketplace plugin > skills-dir plugin (the user's `~/.claude/skills/` copy beats the project's) > synced; the loser shows "Not loaded" in `/plugin` Errors. A manifest `version` pins the computed version, so `claude plugin update` changes nothing until the string changes; auto-update is off by default for non-Anthropic marketplaces. Companion pages: `plugins/create-marketplace` (a repo can be its own marketplace with relative `./plugins/<name>` sources; relative paths load in place when the marketplace was added from a local path), `plugins/manifest-reference` (`name` is the only required manifest key; `${CLAUDE_PLUGIN_ROOT}` is substituted in plugin skills only), `skills` (plugin skills are typed `/<plugin>:<skill>`; a project skill and a plugin skill of the same bare name both load).

**Why it matters here.** It is the basis of the vendored HyperFrames plugin in `.claude/skills/hyperframes-plugin/` ([[2026-11-09-hyperframes-skills-live-in-the-repo]]): a skills-dir plugin, loaded in place, pinned by its manifest version, named `hf` because of the name-conflict rule ([[2026-11-09-a-skills-dir-plugin-named-like-an-installed-plugin-is-not-loaded]]).

**What we took.** The skills-dir layout, the `false` at project scope for the marketplace copy (Slava's line), the trust and working-directory conditions written into `docs/TROUBLESHOOTING.md`. Not taken: a repo-local marketplace (`extraKnownMarketplaces` with a `directory` source: the docs do not say whether its `path` may be relative, and a `--plugin-dir` flag is session-only).
