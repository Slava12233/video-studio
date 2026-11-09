---
type: open
created: 2026-11-09
updated: 2026-11-09
status: done
owner: slava
maintained_by: harness
categories: [open, harness]
summary: "Done 2026-11-09: on Slava's yes in chat the harness set \"hyperframes@hyperframes\": false under enabledPlugins in .claude/settings.json and dropped its extraKnownMarketplaces block; from the next session only the vendored hf:* HyperFrames skills load."
---

# Turn the marketplace copy of HyperFrames off for this project

**Done 2026-11-09.** Slava answered "כן, שנה עכשיו" to the question in chat; the harness set the key to `false` and removed the `extraKnownMarketplaces` block from `.claude/settings.json` (the rest of the file untouched; the user-level settings keep both for the other projects). A session started after that, or `/reload-plugins`, lists only the `hf:*` HyperFrames skills; `node tools/doctor.mjs` shows "HyperFrames marketplace copy: off".

**What was waiting.** The HyperFrames release is vendored in `.claude/skills/hyperframes-plugin/` and loads as `hf@skills-dir` ([[2026-11-09-hyperframes-skills-live-in-the-repo]]), but `.claude/settings.json` still enables `hyperframes@hyperframes` (and declares its marketplace), so a session sees 42 HyperFrames skills: `hyperframes:*` from `~/.claude/plugins/cache` and `hf:*` from the repo. Settings are Slava's to change (`~/.claude/CLAUDE.md`).

**Who acts, and the click or the answer needed.** Slava, one of: (a) answer yes in chat and the harness edits the two keys; (b) in `.claude/settings.json` change `"hyperframes@hyperframes": true` to `false` and delete the `extraKnownMarketplaces` block (the user-level copy of both stays for the other projects); (c) run `claude plugin disable hyperframes@hyperframes --scope project` from the studio root. Then `/reload-plugins` or a new session; `node tools/doctor.mjs` shows "HyperFrames marketplace copy: off".

**Cost or risk of waiting.** Twice the skill descriptions in every session's context, and the bare names the vendored skills use for each other (`/hyperframes-core`, `/media-use`) are ambiguous while both copies load. Nothing breaks: `tools/hf.mjs` already uses the vendored release.

**Links.** [[current]] · [[claude-code-plugin-loading]]
