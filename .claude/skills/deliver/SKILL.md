---
name: deliver
description: Finish a video - bounded delivery-quality render, two-pass loudness to -14 LUFS, poster frame, AI ledger copy and DISCLOSURE.txt into deliverables/<project>/. Use when Slava approves the draft and wants the final file, or asks "export", "final", "deliver".
argument-hint: [project dir] [--fps 24|30] [--no-render] [--no-loudnorm] [--name base]
---

# Deliver

Arguments: `$ARGUMENTS`.

1. Confirm the draft is approved and `/review-cut` reported "ready" (or its blockers were fixed and re-checked).
2. Frame rate: 24 for films, promos and presenter explainers; 30 for talking-head reels and ads shot at 30 fps (match
   the source: `node ../../tools/media.mjs probe inputs/<file>`).
3. From the studio root, bounded and foreground (Bash timeout 1,860,000 ms):
   ```bash
   timeout 1800 node tools/deliver.mjs --project projects/<date>-<slug> --fps 24
   ```
   It runs `check`, renders at delivery quality with the safe flags (segmented and resumable over 45 s), normalizes
   loudness to -14 LUFS / -1 dBTP with the video stream copied, writes the poster, copies `ai-ledger.jsonl` and
   `BRIEF.md`, writes `DISCLOSURE.txt` (label texts from the project's brand) and `delivery.json`. On exit 124 re-run
   the same command: segments are reused. `--no-render` packages the newest MP4 in `renders/` (for a part-rendered
   join); `--no-loudnorm` keeps the mix as rendered.
4. Verify before announcing: open the poster, read `delivery.json` (duration, fps, size, `has_audio`, `loudness`)
   against the brief, and extract three frames from the delivered MP4 at caption / badge times. Speech or music means
   `has_audio: true`.
5. `DISCLOSURE.txt` lists AI assets: confirm each visual one carries its `.ai-badge` for the whole visible time on
   the delivered frames and the AI-voice note exists at the start. Missing label -> fix the composition, re-run.
6. Report: the two file paths, duration, format, loudness, AI spend. Variants (9:16 / 1:1 / without captions) are
   separate compositions: run again with `--composition` and `--name`.

Delivery folder: `deliverables/<date>-<slug>/` -> `<name>.mp4`, `<name>-poster.jpg`, `DISCLOSURE.txt`,
`ai-ledger.jsonl`, `BRIEF.md`, `delivery.json`. Never publish or upload anywhere without an explicit yes.
