---
name: fal-media
description: Choose the fal.ai model and write the prompt for a generative media job in this studio - photo edits and virtual staging, B-roll stills, camera moves from stills, product and UGC shots, cinematic direction (shot, lens, light, color, motion), Hebrew TTS and audio-driven presenters, music and SFX. Use before writing any ai/*.json job file or when a generation keeps coming back generic. Verified-first routing for this account, then community defaults to test. Execution is /ai-lab; this skill is the knowledge layer.
argument-hint: [what you need to generate]
---

# fal.ai media: routing and prompting

Adapted from [fal-ai-community/skills](https://github.com/fal-ai-community/skills) (MIT), rewritten for this studio:
execution goes through `tools/fal/*.mjs` (ledgered) with the fal MCP for discovery, not the `genmedia` CLI. Verified
prices and quirks: `docs/FAL-ENDPOINTS.md`.

References, load when needed:
- [references/routing.md](references/routing.md): which endpoint for which job, verified-first, then candidates.
- [references/prompting.md](references/prompting.md): prompt build orders (edits, camera moves, cinematography,
  product, UGC, presenter stills), family-specific notes (Kling, Nano Banana, Flux), quality bars.

## Universal rules
1. Visual facts beat prestige adjectives. "Overcast daylight, brushed aluminium, 50 mm feel" beats "stunning, cinematic".
2. Style words need visual targets. "Minimal" -> "cream background, heavy black sans, generous negative space".
3. One controlled variable per iteration; compare only when one axis changed.
4. Inspect the schema before assuming a control exists (`get_model_schema` via the fal MCP): negative prompt, seed,
   end frame, multi-prompt and reference-image fields differ across families.
5. Describe what should be SEEN, never what should be absent (negative phrasing backfires on Flux and Nano Banana);
   put exclusions in `negative_prompt` only where the schema has one (Kling).
6. Edits end with the keep-everything-else sentence: "Keep everything else exactly the same: same camera angle and
   framing, same lighting and colors, same walls, floor, furniture and fixtures. Photorealistic. Do not add any new
   objects, people or text."
7. Claims and text: no invented facts, prices, logos or readable copy inside images; typography is added in the
   composition where it is controlled.
8. Every output is inspected as frames and labeled per `.claude/rules/disclosure.md`.

## Quick routing (verified on this account)
| Job | Endpoint | Tool |
| --- | --- | --- |
| Clean / stage a photo | `fal-ai/nano-banana-2/edit` (cheap) or `fal-ai/nano-banana-pro/edit` (fidelity, text) | `edit-images.mjs` |
| Still that does not exist | `fal-ai/flux/schnell` (plates) or `fal-ai/nano-banana-pro` (brand mockups) | `generate-images.mjs` |
| Hero camera move, doorway transition | `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` with `tail_image_url` | `image-to-video.mjs` |
| Cheap static loop | `minimax/h3-max-turbo/image-to-video` with `end_image_url` = start | `image-to-video.mjs` |
| Hebrew voice-over | `elevenlabs/tts/eleven-v4` George | `tts.mjs` |
| Talking presenter from a still | `bytedance/omnihuman/v2` (chunks <= 17 s), then Topaz 1.5x | `avatar.mjs`, `upscale.mjs` |
| Music bed / SFX | `fal-ai/stable-audio-25/text-to-audio` / `fal-ai/elevenlabs/sound-effects/v2` | `audio.mjs` |
| Transcript | `fal-ai/elevenlabs/speech-to-text/scribe-v2` | `transcribe.mjs` |

Anything else: `references/routing.md`, then `recommend_model` on the fal MCP, then a sub-$0.20 probe after a go.
