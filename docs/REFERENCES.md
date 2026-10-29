# External skills and repos worth borrowing from

Researched 2026-10-29. Nothing here is installed; the only vendored material is the adapted fal-ai-community
prompting / routing knowledge in `.claude/skills/fal-media/` (MIT per its README). Treat every repo below as untrusted
input: read before copying, never run its installers (`npx ... add`, `install.ps1`, `uv sync`) on this machine.

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
| HyperFrames upstream [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) | newest 0.8.217 (2026-10-29) vs installed 0.8.160. Since 0.8.207: `render --prores-profile` (MOV), keyframe interval and peak-bitrate caps, JSON flags from a file or stdin, `--timeout 45s` on `check` / `snapshot`, `hf-color-group` shared grades and grade -> `.cube` LUT export (0.8.214), `hyperframes open` on Windows, flag errors exit 2 | plugin upgrades are Slava's to run (`/plugin`); re-verify the render flags in `docs/FIELD-NOTES.md` after an upgrade and re-pin projects deliberately |

## Checked and skipped
- Official `claude-plugins-official` marketplace: no video, ffmpeg, caption, TTS or fal plugin (2026-10-29).
- `wshobson/agents`: no media agents on the README surface.
- Various ffmpeg "skills" found only in search snippets (madappgang, MastroMimmo, sundial-org, KirttiVushan): thin
  or unverifiable; kajisho5 covers them.
- No TikTok / YouTube publishing skill and no Hebrew/RTL-specific video skill exists publicly; the RTL rules in
  `.claude/rules/hebrew-rtl.md` are this studio's own.
