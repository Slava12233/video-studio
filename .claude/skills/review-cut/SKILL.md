---
name: review-cut
description: Quality review of a rendered draft or delivery against the brief - probe facts, frames extracted from the rendered file at caption, badge and seam times, RTL and typography check, safe zones, disclosure coverage from the ledger, loudness windows (bed under voice, pauses), lip sync after cuts. Use after every draft render and before /deliver, or when Slava asks "check it", "is it ready", "review the cut".
argument-hint: [rendered.mp4] [--project dir] [--times 1.2,8.5,30]
---

# Review a cut

Arguments: `$ARGUMENTS`. Review the **rendered file**, never a snapshot or the preview. Read-only on the project:
report findings, do not fix them here.

1. **Facts.** `node ../../tools/media.mjs probe <file>`: duration vs the root `data-duration` and the brief, fps vs the
   source footage, resolution, `hasAudio` when there is speech or music. `delivery.json` when present.
2. **Frames.** Pick 6-10 times: the hook (0.5-1.5 s), three caption cues (from `captions.json`), every AI asset's
   start / middle / end (from `ai-ledger.jsonl` + the composition's `data-start`), each scene seam, the CTA / end
   card. Extract with `timeout 540 ffmpeg -ss T -i <file> -frames:v 1 -update 1 out.jpg` (one bounded call per batch,
   or `node ../../tools/media.mjs frames <file> <dir> --every N` for a sweep). Look at each frame; zoom into text and
   edges. Judge: text cut off, overlap, wrong side punctuation, Latin/digits reversed, caption too low (bottom 250 px)
   or too high (top 200 px), badge missing or covered, black or repeated frames, anchor jumps (left-edge anchoring
   from `translateX(-50%)`), stale video frames (fast-capture judder).
3. **Disclosure.** Every ledger item with a visual disclosure maps to a `.ai-badge` that spans its whole on-screen
   time; the AI-voice note exists at the start when a TTS take is in the ledger. Missing -> blocks delivery.
4. **Audio.** `node ../../tools/loudnorm.mjs measure <file>` (target -14 LUFS / -1 dBTP for delivery; drafts may sit
   at -20). `window --ss T --t 4` in a speech pause and under a voiced line: the bed should sit about -31 dB in pauses
   and below the voice by at least 6 dB. Lip sync spot-check at two cut points when pauses were removed.
5. **Brief compliance.** Hook, CTA, facts and prices only from the brief, names/addresses policy, brand palette and
   fonts, variants requested.

## Report (this exact shape)
- Verdict: ready / not ready.
- Blockers (each with the time, the frame file, and what is wrong).
- Nits (optional fixes).
- Measurements: duration, fps, size, LUFS, true peak, bed-in-pause dB.
- Frames reviewed: list of times and paths.
