# External skills and repos worth borrowing from

Researched 2026-10-29 (video) and 2026-11-09 (memory). Vendored material: the adapted fal-ai-community prompting /
routing knowledge in `.claude/skills/fal-media/` (MIT per its README) and four kepano Obsidian skills (MIT,
`THIRD-PARTY.md`). Treat every repo below as untrusted input: read before copying, never run its installers
(`npx ... add`, `install.ps1`, `uv sync`) on this machine. The dated detail of each memory-system repo is a note in
`memory/references/` (one per repo, with its verdict); this table is the curated summary.

## The memory system (2026-11-09): adopted, borrowed, skipped
| Repo / doc | Verdict | What we took |
| --- | --- | --- |
| [kepano/obsidian-skills](https://github.com/kepano/obsidian-skills) | adopted | `obsidian-markdown`, `obsidian-bases`, `obsidian-cli`, `json-canvas` vendored verbatim at commit `3ccff53` (2026-09-15), MIT; `defuddle` and `knap` skipped (global npm installs). Note: `memory/references/kepano-obsidian-skills.md` |
| [Obsidian CLI (official, 1.12.7+)](https://obsidian.md/help/cli) | adopted | search, move, rename, `base:query`, backlinks through `node tools/memory/obsidian-setup.mjs --cli ...` when the app is open; the vault works on plain files without it |
| [Claude Code memory + hooks docs](https://code.claude.com/docs/en/memory) | borrowed | the hook contract (SessionStart `additionalContext`, PreCompact), CLAUDE.md under ~200 lines, path-scoped rules, auto-memory kept for a pointer only |
| [Anthropic: effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | borrowed | the smallest high-signal set (HOT ≤ 60 lines), notes outside the context, just-in-time retrieval by paths, a progress log + checklist read first |
| Slava's marketing-team harness vault (local, `D:\AgentTeams\marketing-team-harness-main`) | adopted (adapted) | the contract vocabulary, HOT/INDEX generation, lint with a secrets scanner, bases, Hebrew HOME and inbox, the two hooks, `/sync` and `/consolidate` |
| [heyitsnoah/claudesidian](https://github.com/heyitsnoah/claudesidian), Cline Memory Bank, CoALA, Letta | borrowed | PARA-style separation of projects and lessons, `activeContext` as a true-now state note, episodic / semantic / procedural layers, a weekly consolidation pass |
| [basicmachines-co/basic-memory](https://github.com/basicmachines-co/basic-memory) | skipped | Python + uv, AGPL, an index that drifts from files the agent edits directly |
| [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | skipped | an opaque SQLite + Chroma store outside the vault, a Bun worker, lossy compression, Windows breakage reports |
| Obsidian MCP servers ([mcpvault](https://github.com/bitbonsai/mcpvault), cyanheads, MarkusPfundstein, StevenStavrakis, iansinnott) | reference-only | none needed: plain files plus the CLI; `mcpvault` (Node, no plugin) is the one to evaluate if a server is ever wanted |

## Adopted (adapted, not copied verbatim)
| Repo | What we took | Notes |
| --- | --- | --- |
| [fal-ai-community/skills](https://github.com/fal-ai-community/skills) | prompt build orders (SCLCAM cinematography, commercial product invariants, UGC script beats), the endpoint-first routing idea, quality bars | MIT (README), 258 stars, last push 2026-10-23. Its execution path is the `genmedia` CLI; ours is the fal MCP + `tools/fal/*.mjs`. Its default models (Seedance 2.0, GPT Image 2, Grok Imagine, veed/fabric) are unverified on this account: see `docs/FAL-ENDPOINTS.md` |

## Reference only
| Repo | Why it matters | What to borrow |
| --- | --- | --- |
| [kajisho5/ffmpeg-skill](https://github.com/kajisho5/ffmpeg-skill) | MIT, 3.8k stars; 42 Python ffmpeg tools + MCP (cut, join, silence removal, stabilize, loudness, karaoke captions, color, multicam); Hebrew/Arabic render correctly on a fribidi build | the `loudness`, `caption` (ASS karaoke) and `export` recipes, ported into `tools/*.mjs`. Do not install: large Python surface, `npx` installer |
| [browser-use/video-use](https://github.com/browser-use/video-use) | MIT, 30k stars; raw footage -> final cut: filler removal, 30 ms fades at cuts, auto grade, burned subtitles, overlays via HyperFrames or Remotion; Scribe word-level transcripts; two-pass loudnorm to -14 LUFS / -1 dBTP | the transcript-driven cutting design (filler and pause removal, fades at every cut). Needs Python + an ElevenLabs key: not for this machine |
| [elevenlabs/skills](https://github.com/elevenlabs/skills) | MIT; 12 skills (TTS, STT, SFX, music, dubbing, voice isolator, voice changer) | parameter conventions for `stability` / `similarity_boost` / `speed`, dubbing flow. We reach ElevenLabs through fal, not the ElevenLabs API |
| [blazerior/videoediting-claude-skill](https://github.com/blazerior/videoediting-claude-skill) | MIT, tiny; transcript cuts, `.cube` LUT grading, word-level ASS subtitles with active-word highlight | the ASS karaoke and LUT recipes |
| [aabrole/claude-video-thumbnail-skill](https://github.com/aabrole/claude-video-thumbnail-skill) | four thumbnail concepts at once for YouTube / Shorts / Reels / TikTok (Gemini-based) | the concept matrix; generate with fal instead |
| HyperFrames upstream [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | newest 0.8.217 (2026-10-29) vs the release vendored in `.claude/skills/hyperframes-plugin/`: 0.8.160, commit `695110e46ba4` (Apache-2.0, `THIRD-PARTY.md`). Since 0.8.207: `render --prores-profile` (MOV), keyframe interval and peak-bitrate caps, JSON flags from a file or stdin, `--timeout 45s` on `check` / `snapshot`, `hf-color-group` shared grades and grade -> `.cube` LUT export (0.8.214), `hyperframes open` on Windows, flag errors exit 2 | a re-vendor is Slava's to run (`claude plugin update hyperframes@hyperframes` refreshes the cache, then `node tools/vendor-hyperframes.mjs`); re-verify the render flags in `docs/FIELD-NOTES.md` after an upgrade and re-pin projects deliberately |

## Checked and skipped
- Official `claude-plugins-official` marketplace: no video, ffmpeg, caption, TTS or fal plugin (2026-10-29).
- `wshobson/agents`: no media agents on the README surface.
- Various ffmpeg "skills" found only in search snippets (madappgang, MastroMimmo, sundial-org, KirttiVushan): thin
  or unverifiable; kajisho5 covers them.
- No TikTok / YouTube publishing skill and no Hebrew/RTL-specific video skill exists publicly; the RTL rules in
  `.claude/rules/hebrew-rtl.md` are this studio's own.
