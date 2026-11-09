# Third-party skills: sources and licences

Checked 2026-11-09. `.claude/skills/` holds two kinds of third-party content: four Claude Code skills copied verbatim from kepano/obsidian-skills (line ends normalised to LF, the upstream `LICENSE` beside each `SKILL.md`; table below) and the HyperFrames plugin release vendored whole into `.claude/skills/hyperframes-plugin/` (its own section below). The studio's own rules (`CLAUDE.md`, `.claude/rules/`, `memory/README.md`) win on any conflict with their text. The fal-ai-community prompting knowledge adapted into `.claude/skills/fal-media/` is listed in `docs/REFERENCES.md`.

| Skill | Source repo | Licence | Upstream path and commit | sha256 of `SKILL.md` | Used for |
|---|---|---|---|---|---|
| `obsidian-markdown` | https://github.com/kepano/obsidian-skills | MIT (Copyright (c) 2026 Steph Ango (@kepano)) | `skills/obsidian-markdown/` at `3ccff5338ea700537839b21900aa5358a0402c98` (2026-09-15) | `7ad72e1f0a9081ed325e76b6402ad5de50a00e63e2341fd403a92f147234a007` | Writing vault notes in Obsidian Flavored Markdown: properties, wikilinks, embeds, callouts |
| `obsidian-bases` | same | same | `skills/obsidian-bases/` at the same commit | `c0037f20926c7d8591cdd040365e4c0e4c0c4146386a506f28f241faee9a27d9` | The `.base` dashboards in `memory/bases/` (views, filters, formulas) |
| `obsidian-cli` | same | same | `skills/obsidian-cli/` at the same commit | `b54257cdc0e5d04488b35b0c797bfe427b24359f0848d3c73924dcacf8da6358` | Searching and moving notes through Obsidian's command line when the app is open (`node tools/memory/obsidian-setup.mjs --cli ...`) |
| `json-canvas` | same | same | `skills/json-canvas/` at the same commit | `97d1ae0728955c4203922753d5656890e5e4dd371b8306ea11884f9b510f1b85` | `.canvas` boards (a storyboard or project map drawn as nodes and edges) |

Not vendored from the same repo: `defuddle` and `knap` (both need a global npm install the studio does not use). Re-vendor: clone the repo into a scratch folder (untrusted input: read, never run its installers), copy the four `skills/<name>/` folders with `sed 's/\r$//'`, copy `LICENSE` beside each, update the commit and the hashes here and in `memory/references/kepano-obsidian-skills.md`.

## The HyperFrames plugin (`.claude/skills/hyperframes-plugin/`, Apache-2.0)

| Item | Value |
|---|---|
| Source | https://github.com/heygen-com/hyperframes (HeyGen), the Claude Code plugin `hyperframes@hyperframes` from the marketplace `heygen-com/hyperframes` |
| Release | 0.8.160, commit `695110e46ba4ec971f5dcfc797ce8bf750e1029d`, copied 2026-11-09 from the local plugin cache `~/.claude/plugins/cache/hyperframes/hyperframes/0.8.160` |
| What is copied | `.claude-plugin/plugin.json`, `plugin.json`, `LICENSE`, `skills-manifest.json` and the 21 `skills/<name>/` folders (943 files, 15.8 MB: Markdown, scripts, HTML templates, fonts, PNG masks, 19 short SFX MP3s). The rest of the upstream repository (CLI source, docs, examples, registry) is not copied; the CLI itself is fetched from npm at the pinned version by `tools/hf.mjs`. |
| Changes | text files normalised to LF; `.claude-plugin/plugin.json` `name` set to `hf` and one sentence appended to its `description`, so Claude Code loads the folder beside an installed `hyperframes@hyperframes` without a name conflict; two `.gitignore` shims re-include files the repo's ignore rules would drop. Nothing else is edited. `VENDORED.json` records the source, the commit and a sha256 per skill. |
| Loads as | `hf@skills-dir` (a plugin folder under `.claude/skills/`, loaded in place); skills typed `/hf:<skill>`; the marketplace copy is off in `.claude/settings.json` |
| Verify / re-vendor | `node tools/vendor-hyperframes.mjs --check`; `node tools/vendor-hyperframes.mjs` copies the release found under `~/.claude/plugins` (or `--from <dir>`), a decision Slava takes (`CLAUDE.md`, Never) |

## Licence obligations

**Apache-2.0 (the HyperFrames plugin).** Use, modification and redistribution are allowed, including commercially, on these conditions: the licence text travels with the copy (it ships as `.claude/skills/hyperframes-plugin/LICENSE`); modified files carry a notice of the change (the "Changes" row above and `VENDORED.json`); an upstream `NOTICE` file would have to be carried along (none exists in the release, checked 2026-11-09); the HeyGen and HyperFrames names are used only to describe the origin. The software is provided "AS IS" with no warranty.

**MIT (the four kepano skills).** Copying, modifying and redistributing are allowed, including commercially. Condition: the copyright notice and the permission notice must be included in all copies or substantial portions. The notice is reproduced below and ships as `.claude/skills/<name>/LICENSE`. The software is provided "AS IS" with no warranty. No `NOTICE` file exists at the repo root (checked 2026-11-09).

```
MIT License

Copyright (c) 2026 Steph Ango (@kepano)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Obsidian itself** (https://obsidian.md) is not shipped: it is installed on the machine (winget `Obsidian.Obsidian`). The app is free for personal and commercial use (obsidian.md/license, 2025-02-20); Obsidian Sync and Publish are optional paid services the studio does not need.

**The memory tools** (`tools/memory/*.mjs`, `.claude/hooks/*.mjs`) are this studio's own, adapted from Slava's marketing-team harness vault tools (2026-10); no third-party code.
