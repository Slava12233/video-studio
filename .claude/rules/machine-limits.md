# Machine limits for this studio (always loaded)

The laptop-wide rules in `~/.claude/CLAUDE.md` outrank everything here; this file applies them to video work. The
`test-guard.ps1` hook denies unbounded `ffmpeg` and dev-server launchers and blocks a second heavy run while one is
alive anywhere on the machine, but it cannot see inside `node tools/*.mjs`: these lines are the bound for renders.

## Every render, encode, transcode or matting run is heavy
- First word of the shell command is Git Bash `timeout N`. N = **1800** for a delivery render or a part render,
  **540** for a direct `ffmpeg` / `ffprobe`-with-decode call, a snapshot sweep, `remove-background`, `beats` or
  anything else that decodes video. Give the Bash tool call a timeout of (N+60) x 1000 ms so the kill lands inside the
  call and the harness never backgrounds it.
- Foreground only: no `run_in_background`, no `&`. A call the harness backgrounded anyway is a runaway: stop it next
  (TaskStop or `/tasks`), then kill its process tree by PID. Never sleep-poll a task's `.output`.
- One heavy run at a time on this machine. Before a render longer than a minute, sample per-process CPU for a few
  seconds; if another session is rendering or generating, wait. Never kill a process you did not start, never by start
  time alone.
- Exit 124 is the bound, not a failure. Report the tail, kill leftover `node.exe` from YOUR run
  (`taskkill /PID <pid> /T /F`), then run ONCE more with `--resume` or fewer parts and report the result as partial.
  Never re-run an unchanged command hoping for a different result; never loop a render.
- No heap-flag fixes (`--max-old-space-size`): the timeout is the bound.

## Render settings that fit the bound (plugin 0.8.160, 32 GB laptop)
- `--workers 4` (5 for sub-30 s caption reels), never `auto`. `--experimental-fast-capture=false` always.
- Over 45 s of output: `HF_SEGMENTED_CAPTURE=true` plus `--keep-segments --resume` (`deliver.mjs` sets both). On a busy
  machine split into parts at voice pauses or scene seams and join with `node tools/media.mjs concat`.
- Expect about 1.5 min per 10 s of 1080p24 draft on a quiet machine; say the expected time before a long render.
- Paid or ledgered steps killed by the bound (fal jobs) get their ledger reconciled before anything else.

## Not heavy (no timeout needed)
`node tools/hf.mjs check|lint|timeline|info`, `node tools/media.mjs probe|poster|last-frame|crop` (one frame),
`node tools/fal/*.mjs --dry`, `node tools/doctor.mjs` without `--render`.
