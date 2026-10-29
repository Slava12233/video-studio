---
name: studio-doctor
description: Check that this studio works on this computer - Node, FFmpeg, Git, Claude Code, the HyperFrames plugin and CLI, the render browser, the fal.ai key - and, with --render, prove the chain with a 2-second throwaway smoke render. Use when something does not install, render or generate, at the start of a session on a new machine, or when asked "is everything set up?".
argument-hint: [--render]
---

# Studio doctor

1. From the studio root run `node tools/doctor.mjs` (plain check, seconds). With `--render` it also writes a 2 s
   composition into `.studio-smoke/` (git-ignored), renders it and deletes the folder (about a minute): that is a
   heavy run, so `timeout 540 node tools/doctor.mjs --render` with a Bash timeout of 600,000 ms, one at a time. It
   writes `.verify-report.txt`.
2. Read the lines: ok / optional missing / required failing with a `fix:` hint.
3. Fixes, in order of least effort:
   - Node / Git / FFmpeg missing: `winget install OpenJS.NodeJS.LTS`, `winget install Git.Git`,
     `winget install Gyan.FFmpeg`; reopen the terminal.
   - Claude Code missing: `irm https://claude.ai/install.ps1 | iex` (the winget package does not auto-update).
   - HyperFrames plugin missing: `/reload-plugins`; still missing: `claude plugin marketplace add heygen-com/hyperframes`
     then `claude plugin install hyperframes@hyperframes`, restart Claude.
   - HyperFrames CLI not responding: first use needs internet (npm download); wait a minute, run the doctor again.
   - Render browser missing: `node tools/hf.mjs browser ensure` (about 150 MB once).
   - `FAL_KEY` missing: put the key after `FAL_KEY=` in `.env` (see `.env.example`). Never ask for the key in chat.
   - Low memory: close other apps; render with `--workers 2`.
4. For render problems the doctor does not catch, read `docs/TROUBLESHOOTING.md` and `docs/FIELD-NOTES.md` before
   changing anything.
5. Do not install software beyond the fixes above, do not edit `~/.claude/settings.json`, never print `.env`.
