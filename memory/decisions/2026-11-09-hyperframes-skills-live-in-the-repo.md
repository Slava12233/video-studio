---
type: decision
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [decisions, harness]
summary: "Slava: the HyperFrames skills must live at project level, not only in the user's plugin cache; the 0.8.160 release is vendored whole into .claude/skills/hyperframes-plugin/ as the plugin `hf` (skills /hf:<skill>), pinned and verified by the repo, and the marketplace copy goes off in the project settings."
decided_by: slava
supersedes: ""
superseded_by: ""
---

# The HyperFrames skills live in the repo, at project level

**Ruling.** Slava, 2026-11-09, in chat (English): "what about the hyper frames skills ... as i see that we only have them on the global level, i want them in the project level"; then "proceed".

**Context.** Until then the HyperFrames plugin (`hyperframes@hyperframes`, 0.8.160) lived only in `~/.claude/plugins/cache/`, enabled at user scope and at project scope through `.claude/settings.json`; the repo carried no copy of its 21 skills, `tools/hf.mjs` found the CLI through the cache, and `memory/capabilities/skills.md` could not list them. The official plugin docs ([[claude-code-plugin-loading]]) name one documented way to ship a plugin inside a repository without a marketplace: a plugin folder under `.claude/skills/` with `.claude-plugin/plugin.json`, loaded in place as `<name>@skills-dir`.

**What was done.** `tools/vendor-hyperframes.mjs` copies the release (manifests, `LICENSE`, `skills-manifest.json`, the 21 skill folders: 943 files, 15.8 MB, text normalised to LF) into `.claude/skills/hyperframes-plugin/` and writes `VENDORED.json` (version, commit `695110e46ba4`, a sha256 per skill); `--check` verifies. The Claude Code manifest is named `hf` because an installed `hyperframes` plugin shadows a same-named folder even when disabled ([[2026-11-09-a-skills-dir-plugin-named-like-an-installed-plugin-is-not-loaded]]); the skills are therefore typed `/hf:<skill>` and every reference in `CLAUDE.md`, the rules, the skills, the agents and `docs/WORKFLOWS.md` was renamed. `tools/hf.mjs` resolves the vendored copy first, so the CLI version is pinned by the repo. `tools/doctor.mjs` checks the copy, `build-capabilities.mjs` lists the plugin's skills, `THIRD-PARTY.md` records the Apache-2.0 obligations.

**What it replaces.** The implicit pin "whatever version the user's plugin cache holds". The cache copy stays for Slava's other projects.

**Applies to.** Every session and agent in this repo: invoke `hf:hyperframes`, `hf:hyperframes-core` and the other `hf:*` skills; never `npx hyperframes` bare; a re-vendor (a release change) is Slava's decision, like a plugin upgrade. The marketplace copy is off in `.claude/settings.json` since Slava's yes in chat the same evening ([[2026-11-09-turn-the-marketplace-hyperframes-copy-off]]). See also [[2026-11-09-second-brain-in-obsidian]] and [[current]].
