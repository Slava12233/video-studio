---
name: transcribe
description: Word-level transcript for Hebrew or English speech in a video or audio file through fal.ai (ElevenLabs Scribe v2, about $0.01 per minute), written to the project's transcript.json in the HyperFrames shape plus an optional SRT. Use before any captions, talking-head recut, pause removal, B-roll timing, or to read a TTS take back. Local whisper-cpp is not available for Hebrew on this Windows laptop, so use this instead of the CLI's transcribe.
argument-hint: <media file> [--lang he|en|auto] [--srt] [--keyterms "a,b"] [--out file.json]
---

# Transcribe (cloud, word-level)

Arguments: `$ARGUMENTS`.

1. The media must be inside the project (`inputs/`, `assets/` or `ai/audio/`). Confirm it has audio:
   `node ../../tools/media.mjs probe <file>`.
2. Dry run for the price, then run (from the project folder):
   ```bash
   node ../../tools/fal/transcribe.mjs <file> --project . --lang he --dry
   node ../../tools/fal/transcribe.mjs <file> --project . --lang he --srt captions.srt
   ```
   `--lang en` for English, `--lang auto` for mixed speech. `--keyterms "<brand>,<product>,CRM"` biases the model
   toward brand words (adds 30 % to the price). `--engine whisper` is the fallback if Scribe fails.
   `--out ai/audio/<id>.readback.json` when reading a TTS take back so `transcript.json` stays the footage
   transcript. Cents-level cost: a go is still required when the file is longer than 10 minutes; under that, say the
   price and run.
3. Output: `transcript.json` = `{ text, language, words: [{ text, start, end }] }` plus `type: "word"` on each entry
   (the embedded-captions and talking-head workflows read `.words` and filter on `type`), and with `--srt` a sidecar.
4. **Proof-read before building captions.** Paste the text in 3-4 line chunks to Slava and ask only about names,
   brand words, numbers and anything that does not parse as language. Edit entries in place (keep start/end), never
   merge two words into one entry. Write the corrected list to `words.corrected.json` when the fixes are many.
5. A missing or mistimed word: fix the text and keep the neighbours' times; caption timing tolerates 80 ms.
6. Continue: `/caption-cues` for the Hebrew cue plan, then `hyperframes:embedded-captions` (subtitles) or
   `hyperframes:talking-head-recut` (graphic overlays); both look for `transcript.json` in the project root.

Notes: the audio is sent as a small mono MP3 inside the request; nothing is stored on fal beyond the request history.
The key is never printed.
