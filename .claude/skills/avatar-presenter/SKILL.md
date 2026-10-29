---
name: avatar-presenter
description: Produce an AI presenter explainer from one to three stills of a consenting person plus a script - script prep, Hebrew TTS bake-off and full-length sign-off, Scribe read-back, chunking at sentence pauses, audio-driven avatar clips (OmniHuman v2 / Kling Avatar / HeyGen Avatar 4 on fal.ai), frame-sheet review, optional Topaz upscale, then the HyperFrames build with caption pops, mockups and an end card. Use for "AI avatar", "digital presenter", "make this person present the video", "remake the promo with an avatar".
argument-hint: [project dir] [--voice George|...] [--engine omnihuman|kling|heygen]
---

# AI presenter explainer

Arguments: `$ARGUMENTS`. Facts and prices: `docs/FAL-ENDPOINTS.md`; lessons: `docs/FIELD-NOTES.md` (AI presenter
section).

## 0. Gate
- Consent: the person in the stills approved an AI likeness (who, when) in `BRIEF.md`. Without it, stop.
- Stills: waist-up, both hands visible, stage baked in, 16:9 for landscape. Audio-driven models animate only what the
  still shows; no matting afterwards. One still per framing (wide / medium / tight); cut framings on sentence ends.
- Budget: say the expected total before starting (about $16-30 for 90 s). Every paid step below is a separate
  `--dry` -> estimate -> go.

## 1. Script
- `script/vo.txt`, Hebrew, about 1.9 words per second of target length. Paragraph breaks are pauses. Facts, prices and
  claims only from the brief. When a reference film exists, `/transcribe` it first and adapt its beats.
- Numbers: write them the way the voice reads them correctly (ElevenLabs v4 read "משנים עשר" fine; MiniMax needed
  "מ-12"). Keep a line-bounds file (`script/vo-line-bounds.json`) once the voice exists so the build derives shots
  from it.

## 2. Voice
- Default: ElevenLabs v4 **George** (`lang he`, stability 0.5, similarity 0.75, speed 1.0). Alternative: MiniMax
  Determined_Man. If the voice is not fixed, bake off one paragraph per candidate (`ai/tts.json`, two jobs) and let
  Slava pick on the audio, not on a description.
- Then synthesize the **full script** and get the sign-off on the full-length read. A voice change after the avatar
  clips exist means regenerating every clip (about $13 on a 90 s film).
- Read-back: `/transcribe ai/audio/vo.mp3 --out ai/audio/vo.readback.json`; diff against the script; fix a wrong
  sentence by re-synthesizing that sentence and splicing it at the pause boundaries (`tools/media.mjs trim` + `concat`
  on WAV), not by regenerating the take.

## 3. Chunks and clips
- Split the VO at sentence pauses into chunks <= 17 s (OmniHuman fails above that); write
  `ai/avatar.json` with one job per chunk, the framing still for that beat, `engine: "omnihuman"` by default.
- `/ai-lab avatar` (`--dry`, go, run). Clips land in `ai/clips/`, 1284x716 from OmniHuman: `/ai-lab upscale` each
  kept clip with Topaz 1.5x when the delivery is 1080p ($0.01/s).
- Frame sheet of every clip (`node ../../tools/media.mjs frames <clip> <dir> --every 1`). Look for mid-sentence
  reframes and hand artifacts. Decide per clip with Slava: keep as a jump cut, regenerate once, or switch engine.
  OmniHuman output = audio length rounded up (+1 s): trim the tail to the audio when placing.

## 4. Build
- `/new-video avatar-explainer` project (if not created yet) with the client brand. Build with
  `hyperframes:general-video`: presenter clips on one track cut on sentence ends, caption pops as timed divs derived
  from the line bounds, mockups sliding in from the sides, price card, logo top-left, end card. Inline all data.
- Music bed under the voice with the voiceover carve at strength ~0.35 on a 0.55 bed (bed about -31 dB in pauses).
- Disclosure: `.ai-badge` "AI-generated presenter" for the whole visible time of every avatar clip, AI-voice note at
  the start.
- Bounded draft render in parts (`/render`), `/review-cut` (frames at caption times from the rendered file,
  loudness windows), then `/deliver`.

Output of this skill: a filled `BRIEF.md` + `script/`, `ai/audio/`, `ai/clips/`, `ai/avatar.json`, the ledger total,
and a one-paragraph status for Slava with the next paid step and its estimate.
