# AI disclosure (mandatory, every brand)

Anything AI-generated or AI-edited that a viewer could take for a real photo, clip or voice is disclosed **on
screen, for as long as it is visible**, and listed in the deliverable's `DISCLOSURE.txt` (written by
`tools/deliver.mjs` from the project's `ai-ledger.jsonl`).

Whether something needs a label, or how to word it for a specific client, is Slava's call. Never decide it silently
and never drop a label because it "looks cleaner".

## When
| Asset | Label? |
| --- | --- |
| Photo cleaned up by AI (cables, clutter, reflections) | Yes: "AI-edited" |
| Empty room virtually staged (furniture added) | Yes: "virtual staging" |
| Camera move generated from a still (image-to-video) | Yes: "AI-generated footage" |
| Audio-driven avatar / AI presenter | Yes, whole visible time: "AI-generated presenter" |
| Generated B-roll still or background | Yes when shown as if real; decorative abstract plates: no |
| AI voice-over | Yes: spoken or on-screen note at the start |
| Upscaled clip | Carries the source clip's label; no extra label |
| Generated music / SFX | No on-screen label; listed in DISCLOSURE.txt |
| Captions, color grade, cuts, Ken Burns on real footage, transcription | No |

## Label texts
Hebrew (default):
- הדמיה — התמונה עובדה בבינה מלאכותית
- הדמיית ריהוט (Virtual staging) — נוצרה בבינה מלאכותית
- קטע וידאו שנוצר בבינה מלאכותית
- מגיש/ה שנוצר/ה בבינה מלאכותית
- קריינות שנוצרה בבינה מלאכותית

English:
- AI-edited image
- Virtual staging — AI-generated
- AI-generated footage
- AI-generated presenter
- AI-generated voice

## How
Use the `.ai-badge` class from `assets/hebrew.css` on a timed element that spans the asset's whole visibility:

```html
<div class="ai-badge clip" data-start="12" data-duration="5">קטע וידאו שנוצר בבינה מלאכותית</div>
```

Placement: bottom-right on 16:9 (`ai-badge landscape`), above the platform safe zone on 9:16 (default, 300 px from
the bottom). Minimum 26 px font on 1080 wide, white on 72 % ink. Never animate it away while the asset is on screen.
Verify on frames extracted from the **rendered** file, not on snapshots.
