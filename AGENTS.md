# Agents guide

Claude Code reads `CLAUDE.md` and `.claude/rules/`; any other agent working here starts with those two, in that
order, then `docs/WORKFLOWS.md` and `docs/FIELD-NOTES.md`. The short version:

- This repo is a video studio (HyperFrames HTML -> video, fal.ai generation, Hebrew-first). Work happens in
  `projects/<date>-<slug>/` through the tools in `tools/`; never bare `npx hyperframes`.
- Renders and `ffmpeg` run bounded (`timeout N` first), foreground, one at a time on this laptop.
- Paid fal.ai steps print an estimate and wait for an explicit go; every call is ledgered; every AI asset is labeled
  on screen; `inputs/` is read-only; keys never leave `.env`.
