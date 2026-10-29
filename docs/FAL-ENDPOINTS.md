# fal.ai endpoints: verified prices, limits and quirks

Everything here was paid for and checked on this account on the date shown. Prices change; before a paid step that
matters, re-check with the fal MCP (`get_pricing`, `get_model_schema`) and update this table and
`tools/fal/fal.mjs` `PRICES` together. Endpoint IDs are copied exactly; never prepend `fal-ai/` to an ID that lacks it.

## Images
| Endpoint | Use | Price | Verified | Notes |
| --- | --- | --- | --- | --- |
| `fal-ai/nano-banana-pro/edit` | photo cleanup, virtual staging, mockups with text | $0.15 (1K/2K), $0.30 (4K) | 2026-10-19 | 2K is about 2390x1792, enough for 1080p video |
| `fal-ai/nano-banana-2/edit` | cheaper edits | $0.08 (1K), $0.12 (2K) | 2026-10-19 | default for declutter jobs |
| `fal-ai/nano-banana-pro` | stills where text / brand fidelity matters | $0.15 | 2026-10-24 | |
| `fal-ai/flux/schnell` | cheap B-roll plates | $0.003 / MP | 2026-10-19 | describe the positive; negative phrasing backfires |

## Image to video
| Endpoint | Use | Price | Verified | Notes |
| --- | --- | --- | --- | --- |
| `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` | hero camera moves, doorway transitions | $0.07 / s (5 or 10 s) | 2026-10-12 | `tail_image_url` honored well; output 1920x1080 24 fps, 5.04-5.08 s; 11 parallel jobs finish in about 5.5 min |
| `minimax/h3-max-turbo/image-to-video` | cheap static loops, 1-15 s | $0.048 / s at 1080P ($0.015 480P, $0.024 768P) | 2026-10-12 (promo price, re-verify) | `end_image_url`; same image as start and end + "Fixed shot looping video of ..." gives a clean loop |
| Veo 3.1 Fast | not used yet | $0.10 / s, no audio | 2026-10-12 | endpoint ID not recorded; look it up before use |

## Audio-driven avatars (AI presenter)
| Endpoint | Price | Verified | Result on a 16:9 waist-up still + Hebrew audio |
| --- | --- | --- | --- |
| `bytedance/omnihuman/v2` | $0.105 / s of output (audio length rounded up, plus 1 s) | 2026-10-24/25 | keeps framing and gestures most naturally, cleanest hands; output **1284x716** (upscale for 1080p); audio 4-300 s allowed but **every chunk over ~17 s failed** (`downstream_service_error`); 2 of 2 wide-still clips once came back with a spontaneous hard cut to a tighter framing mid-sentence: check every clip |
| `fal-ai/kling-video/ai-avatar/v2/pro` | $0.115 / s (standard tier $0.0562 / s) | 2026-10-24 | 1920x1072 30 fps, keeps framing, restrained hands |
| `fal-ai/heygen/avatar4/image-to-video` | $0.10 / s | 2026-10-24 | true 1080p 25 fps, 16:9, `talking_style`, `background`; **re-crops the still tighter** |
| `fal-ai/heygen/avatar5/digital-twin` | | 2026-10-24 | needs HeyGen-named avatars: useless here |
| longcat (720p) | $0.60 / s | 2026-10-24 | too expensive |
| Wan S2V | | 2026-10-24 | 7.5 s per call |
| veed / argil | | 2026-10-24 | stock avatars only |
| Flashtalk | | 2026-10-24 | returns a 448x768 portrait crop: unusable for 16:9 |

Stills must be waist-up with both hands visible and the stage baked in: audio-driven models only animate what the
still shows, and matting afterwards is not an option.

## Text to speech (Hebrew)
| Endpoint | Price | Verified | Notes |
| --- | --- | --- | --- |
| `elevenlabs/tts/eleven-v4` | $0.08 / 1k chars | 2026-10-25 | `language_code: "he"`, voices Adam / Brian / Daniel / George; Slava picked **George** (stability 0.5, similarity 0.75, speed 1.0): 101.6 s for a 207-word script, Scribe read-back 209/209, "משנים עשר" read as twelve without tricks, paragraph breaks give 0.3-0.6 s pauses. `timestamps` output unverified |
| `fal-ai/minimax/speech-2.8-hd` | $0.10 / 1k chars | 2026-10-24 | voices Determined_Man, Elegant_Man, Deep_Voice_Man; speed 1.0 reads at 1.9 words/s (speed 1.15 for 96 s of 207 words); `<#0.4#>` pause tags work; "משנים עשר" voiced as sixty and "תריסר" as thirty, while "מ שניים עשר" and "מ-12" read as twelve. Rejected by Slava after a full-length listen |
| `heygen/heygen-voice` | $0.015 / 1k | 2026-10-24 | plus a 3-minute reference clone |
| ElevenLabs multilingual-v2 | | 2026-10-24 | unintelligible Hebrew |
| Gemini TTS | | 2026-10-24 | Hebrew is Preview |

## Speech to text
| Endpoint | Price | Verified | Notes |
| --- | --- | --- | --- |
| `fal-ai/elevenlabs/speech-to-text/scribe-v2` | $0.008 / min | 2026-10-19 | word-level, strong Hebrew, `language_code: "heb"`, `keyterms` adds 30 %; the only Hebrew transcription path on this Windows laptop |
| `fal-ai/wizper` | | 2026-10-19 | no word level |
| `fal-ai/whisper` | about $0.03 / min | 2026-10-19 | word level exists but "unlisted" for this account |

## Music, SFX, upscale
| Endpoint | Price | Verified | Notes |
| --- | --- | --- | --- |
| `fal-ai/stable-audio-25/text-to-audio` | $0.20 / track | 2026-10-19 | up to 190 s, WAV; extend a short bed with `acrossfade` on the source WAV |
| `fal-ai/elevenlabs/sound-effects/v2` | $0.002 / s | 2026-10-19 | 0.5-22 s, `loop: true` for seamless loops |
| `fal-ai/topaz/upscale/video` | $0.01 / s | 2026-10-24 | Proteus, 1.5x on 1284x716 -> 1928x1076, H.264, keeps audio; MCP flags it "unlisted" but it runs |

## Reference budgets
- 13 Kling clips + 8 Nano Banana edits + music bed for a 56 s apartment film: $5.89 (2026-10-12).
- 88 s AI-presenter explainer, one voice change included: $29.50 (2026-10-25); without the re-voice about $16.
- 10 minutes of Hebrew transcription: about $0.08.

## Candidates not yet verified on this account
From the fal-ai-community routing notes (`.claude/skills/fal-media/`): `bytedance/seedance-2.0/*` (quality video),
`xai/grok-imagine-video/*` (cheap drafts), `openai/gpt-image-2` (text-heavy stills), `veed/fabric-1.0`
(portrait + audio talking head), `fal-ai/creatify/aurora`, `fal-ai/sync-lipsync/v2`, `fal-ai/flux-2/klein/9b`,
`fal-ai/kling-video/v3/pro/*`. Check price and schema with the fal MCP and run a $0.10-class test before relying on any.
