---
name: render
description: Render a HyperFrames composition within this laptop's bounds - draft, looks or delivery quality, bounded with Git Bash timeout, foreground, segmented and resumable over 45 s, split into parts on a busy machine, joined without re-encoding. Use for any "render it", "make a draft", "export the video" request on an existing project; /deliver wraps it for the final file.
argument-hint: [project dir] [-q draft|looks|delivery] [-f 24|30] [--part a|b] [--composition file.html]
---

# Bounded render

Arguments: `$ARGUMENTS`. Rules: `.claude/rules/machine-limits.md`. Launcher: `node ../../tools/hf.mjs` from the
project folder, never bare `npx hyperframes`.

1. **Gate.** `node ../../tools/hf.mjs check .` passes. Sample CPU for a few seconds; if another render or generation is
   running on the machine, wait (never kill someone else's process).
2. **Estimate time.** About 1.5 min per 10 s of 1080p24 draft on a quiet machine, delivery slower. Say it.
3. **Run (foreground, bounded).** Draft iteration:
   ```bash
   timeout 1800 node ../../tools/hf.mjs render . -q draft -f 24 --workers 4 --experimental-fast-capture=false -o renders/draft.mp4
   ```
   Over 45 s of output add `HF_SEGMENTED_CAPTURE=true` in the environment plus `--keep-segments --resume`. Give the
   Bash tool a timeout of 1,860,000 ms. `--workers 4` on this 32 GB laptop (5 for sub-30 s caption reels), never auto.
   Exit 124 = the bound: report the tail, kill leftover `node.exe` from this run by PID, re-run once with `--resume`,
   report as partial if it still does not finish. Never loop.
4. **Parts when the machine is busy or the piece is over ~60 s:** the build script writes `parts/index-a.html` /
   `index-b.html` (or `PART=1..n`) split at voice pauses or scene seams, out-of-range clips `data-hidden`, part B
   driving the same timeline through an offset seek, audio cut per part. Render each part with the same flags
   (1-2 min each), then `node ../../tools/media.mjs concat renders/full.mp4 renders/p1.mp4 renders/p2.mp4`
   (same codec, no re-encode). Delete `renders/.hf-segments` after a successful segmented render.
5. **Verify on the file.** `node ../../tools/media.mjs probe renders/x.mp4` (duration, fps, audio) and 3 frames from
   the rendered MP4 at caption or badge times. Hand the path and a poster frame to Slava; `/review-cut` for a full QA.
6. Variants (9:16, no captions, 1:1) are separate compositions in the same project: `-c compositions/<name>.html`
   with its own `-o`.

Never `publish`, `cloud` or upload without an explicit yes. Never upgrade the project's pinned CLI mid-project.
