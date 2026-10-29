---
name: caption-cues
description: Turn a corrected word-level Hebrew (or English) transcript into a caption and beat plan for a reel - 2-4 word cues timed to speech, emphasis words, word-highlight pills, pause cuts, and one graphic event per 3-5 s beat (callout card, number slam, lower-third, B-roll insert). Use after /transcribe and before hyperframes:embedded-captions or hyperframes:talking-head-recut, or when Slava asks to "add captions", "make it pop", "plan the graphics for this clip".
argument-hint: [transcript.json|words.corrected.json] [--style rail|pills|cinematic] [--beats]
---

# Caption cues and beat plan (Hebrew-first)

Arguments: `$ARGUMENTS`.

## Inputs
- A proof-read word list (`transcript.json` or `words.corrected.json`): one word per entry, `start`, `end`,
  `type: "word"`. If names, brand words or numbers are still unverified, go back to `/transcribe` step 4 first.
- The brief: hook, platform, emphasis words, style (rail / pills / cinematic), brand palette.

## Produce
1. **`captions.json`**: cues of 2-4 words, max two lines, grouped at phrase boundaries and at pauses >= 0.45 s; a cue
   never spans a cut. Each cue: `{ start, end, words: [{ text, start, end, hl: true|false }] }` with `hl` on the
   emphasis words (one or two per cue at most). Cue `end` >= `start + 0.3`. Timing within 80 ms of the words.
2. **`script/beats.md`**: a table with one row per 3-5 s beat: source time range, what is said (gist), the single
   graphic event (kicker pill, number slam, "?" sticker, rotate-and-snap, quote card, lower-third, B-roll insert of
   <= 1.4 s, logo sting), and the framing move (snap zoom tight / medium / wide, cut on a phrase boundary).
   Rules: the presenter's face is the hero; one idea per beat; motion follows speech rhythm (snap zooms on stressed
   words, hard cuts at phrase ends, never mid-word); hook event inside the first 1.5 s; CTA event in the last 2 s.
3. **Pause list** (when pause removal is on): gaps >= 0.45 s between words, with the proposed cut points; lip sync is
   re-checked after every cut.

## Hebrew rules that apply here
- `.caption` / `.pill` classes from `assets/hebrew.css`; numbers, English words and URLs inside a cue in `.ltr` or
  `.num`; 42-56 px on 1080 wide; keep cues above the bottom 250 px and below the top 200 px on 9:16.
- Emphasis color = `--accent`; "no" words may use `--cta`, "yes" words `--accent-2`; never color as the only signal.
- Right-to-left word order inside a cue is the transcript order; do not reverse arrays for display.

## Hand-off
Inline `captions.json` into the composition (no render-time fetch). Plain subtitles ->
`hyperframes:embedded-captions`; designed overlays from `beats.md` -> `hyperframes:talking-head-recut`. Verify on
frames from the rendered file at three cue times (`/review-cut`).
