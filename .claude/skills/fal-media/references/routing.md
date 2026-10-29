# Routing: which fal endpoint for which job

Rule: endpoint-first. Pick from the verified table, confirm the schema (`get_model_schema`) and the price
(`get_pricing`) when the job is not routine, then run through the ledgered tool. Text search (`search_models`) is a
fallback for a role not covered here. Never invent an endpoint ID; never prepend `fal-ai/` to an ID that lacks it.

## Verified on this account (details and dates in docs/FAL-ENDPOINTS.md)
| Role | First choice | Alternative | Notes |
| --- | --- | --- | --- |
| Image edit, declutter, object removal | `fal-ai/nano-banana-2/edit` | `fal-ai/nano-banana-pro/edit` | 2K for video; keep sentence |
| Virtual staging | `fal-ai/nano-banana-pro/edit` | `fal-ai/nano-banana-2/edit` | labeled as staging |
| Still with text / UI / brand fidelity | `fal-ai/nano-banana-pro` | | typography still better in the composition |
| Fast draft still, abstract plate | `fal-ai/flux/schnell` | | $0.003/MP, seeds for variants |
| Camera move from a still (hero) | `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` | `minimax/h3-max-turbo/image-to-video` | Kling honors the end frame; 5 s hero moves |
| Static loop, ambient motion | `minimax/h3-max-turbo/image-to-video` | | same start and end image |
| Hebrew TTS | `elevenlabs/tts/eleven-v4` | `fal-ai/minimax/speech-2.8-hd` | sign off on a full read |
| Audio-driven presenter | `bytedance/omnihuman/v2` | `fal-ai/kling-video/ai-avatar/v2/pro`, `fal-ai/heygen/avatar4/image-to-video` | chunks <= 17 s; upscale 1284x716 |
| Video upscale | `fal-ai/topaz/upscale/video` | | 1.5x, H.264, keeps audio |
| Music bed | `fal-ai/stable-audio-25/text-to-audio` | | up to 190 s, $0.20 |
| SFX | `fal-ai/elevenlabs/sound-effects/v2` | | 0.5-22 s, loop flag |
| Word-level transcript | `fal-ai/elevenlabs/speech-to-text/scribe-v2` | `fal-ai/whisper` | `language_code: "heb"` |

## Community defaults, NOT yet verified here (price and schema check + a cheap probe before relying on them)
From fal-ai-community/skills `model-routing` (2026-05):
- Text-heavy stills (posters, labels, infographics): `openai/gpt-image-2` at high quality (expensive), then
  `fal-ai/nano-banana-pro`.
- Premium realistic stills: `openai/gpt-image-2`; one step down `fal-ai/nano-banana-pro`, then `fal-ai/nano-banana-2`.
- Fast drafts: `fal-ai/flux-2/klein/9b`.
- Image edits with product fidelity: `fal-ai/nano-banana-pro/edit`, then `openai/gpt-image-2/edit`, then
  `fal-ai/bytedance/seedream/v5/lite/edit`.
- Highest-quality video: `bytedance/seedance-2.0/{text,image,reference}-to-video` (fast variants exist).
- Cheap motion previews: `xai/grok-imagine-video/{text,image}-to-video`, `.../edit-video`.
- Multi-shot storytelling: Seedance 2.0, then `fal-ai/kling-video/v3/pro/{text,image}-to-video` (multi-prompt,
  element controls), then `alibaba/happy-horse/*`.
- Talking head from portrait + audio: `veed/fabric-1.0`; portrait + text: `veed/fabric-1.0/text`; avatar with visual
  direction: `fal-ai/creatify/aurora`; new speech on existing footage: `fal-ai/sync-lipsync/v2`.
- Product B-roll: `bytedance/seedance-2.0/image-to-video`; fast B-roll draft: `xai/grok-imagine-video/image-to-video`.

When one of these wins a probe on this account, move it to the verified table with the date and the price.
