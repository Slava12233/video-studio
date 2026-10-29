---
paths:
  - "**/*.html"
  - "**/*.css"
  - "**/*.srt"
  - "**/transcript*.json"
  - "**/words*.json"
---
# Hebrew and RTL (loads when touching compositions, styles, captions or transcripts)

- Videos are Hebrew-first. Every Hebrew text block gets `class="he"` (`direction: rtl; unicode-bidi: isolate`).
  Numbers, prices, English words and URLs inside a Hebrew line go in `<span class="ltr">` or `.num`. Trailing
  punctuation jumping to the wrong side: wrap the line in `<bdi>` or end it with `&#x200F;`.
- **Never put `dir="rtl"` on `<html>`**: HyperFrames lint flags it as an error and the render comes out black. Put it
  on the text elements (or use `.he`).
- Fonts are local: `assets/hebrew.css` + `assets/fonts/` (Heebo for Hebrew and Latin, Rubik 900 for giant numbers,
  Inter for Latin blocks), `font-display: block`, Hebrew subsets with `unicode-range`. No Google Fonts, no remote
  assets at render time. Wait for `document.fonts.ready` only.
- Captions: 2-4 words per cue, max two lines, 42-56 px on a 1080-wide frame, `.caption` class, emphasis words in
  `.hl` (accent color), word-highlight pills with `white-space: nowrap`. Keep captions and badges above the bottom
  250 px and below the top 200 px on 9:16; bottom-right `.ai-badge.landscape` on 16:9.
- Caption timing matches the corrected transcript within 80 ms; one word per entry with its own `start`/`end` and
  `type: "word"`; never pack two words into one entry.
- Proof-read names, brand words and numbers (for example "100 אלף") in the transcript before building cues. TTS
  misreads of Hebrew numbers (MiniMax read "משנים עשר" as sixty) are caught by a Scribe read-back, not by ear.
- Digits read LTR inside RTL lines: count-ups put the digits in `.num` and the words in `.he`.
- Emoji inside Hebrew pills render fine; mixed-direction lines need `unicode-bidi: isolate` (the `.he` class has it).
- Slugs, folder names and ids are ASCII; Hebrew in paths trips several tools.
