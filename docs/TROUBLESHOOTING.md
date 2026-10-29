# Troubleshooting

Start with `/studio-doctor` (`node tools/doctor.mjs`, add `--render` to prove the chain). Then look here, then
`docs/FIELD-NOTES.md`.

## Environment
**`node`, `git`, `ffmpeg` or `claude` not found.** Install with winget (`OpenJS.NodeJS.LTS`, `Git.Git`,
`Gyan.FFmpeg`) or `irm https://claude.ai/install.ps1 | iex` for Claude Code (the winget Claude package does not
auto-update). Reopen the terminal: new programs appear on PATH only in new windows.

**HyperFrames plugin missing (`/hyperframes:hyperframes` not found).** `/reload-plugins`; still missing:
`claude plugin marketplace add heygen-com/hyperframes` then `claude plugin install hyperframes@hyperframes`, restart
Claude. `node tools/hf.mjs --where` prints the plugin root and version the tools will use.

**First `hyperframes` command hangs for minutes.** It downloads the render browser (~150 MB) once. Wait, or run
`node tools/hf.mjs browser ensure` and watch the progress.

**The Bash tool fails with "unexpected EOF while looking for matching quote" on a file write.** Long heredocs with
apostrophes are mangled on this machine. Use the Write tool for file contents.

## Rendering
**`check` reports errors.** Fix them; never render around a failing check. `dir="rtl"` on `<html>` is an error that
renders black: move it to the text elements.

**Render exits 124 (the `timeout` bound).** Not a failure. Report the tail, kill any leftover node.exe from this run
by PID, re-run once with `--resume` (segmented) or split into parts (`docs/FIELD-NOTES.md`, Part renders). Never loop.

**The hook denies a command ("heavy command without a time bound").** Prefix it with `timeout N`
(ffmpeg 540, renders 1800) and give the Bash tool a timeout of (N+60) seconds in ms. If it says another heavy run is
alive, wait; do not kill another session's process.

**Render is slow or the laptop freezes.** Another session is probably rendering or generating: check CPU first. Use
`--workers 4` (never auto), `-q draft` while iterating, part renders when busy.

**Repeated or stuttering frames.** `--experimental-fast-capture=false` was missing.

**Element anchored at its left edge in the render but centered in snapshots.** CSS `translateX(-50%)` on a tweened
element: use `xPercent: -50` in the tween.

**Render workers stall at start.** A script waits for `document.images`; wait only for `document.fonts.ready`.

**Black frames or missing images.** Assets must be inside the project (`assets/`, `ai/`), relative paths, no `../`,
local fonts only, no render-time fetches (inline the JSON).

**No sound in the final video.** The composition needs an `<audio>` element (videos are `muted` with a separate audio
track). `delivery.json` says `has_audio: false` when it is missing.

**Music inaudible after the voiceover carve.** Carve strength too high on a quiet bed; aim for strength ~0.35 on a
0.55 bed (bed about -31 dB in pauses). Measure with `node tools/loudnorm.mjs window`.

## fal.ai
**"FAL_KEY is missing".** `.env` at the studio root with `FAL_KEY=...` (copy `.env.example`). Never paste the key in chat.

**HTTP 401 / 403.** Key wrong or expired: replace it in `.env` (and rotate the old one if it was ever pasted anywhere).

**HTTP 402 / insufficient credits.** Top up at fal.ai.

**HTTP 422 input rejected.** Field names changed: `get_model_schema <endpoint>` through the fal MCP, fix the job file,
update the tool and `docs/FAL-ENDPOINTS.md`.

**`downstream_service_error` from OmniHuman.** The chunk is too long (> ~17 s): split at a sentence pause.

**A clip has warped walls or extra objects.** Regenerate once with `--force` and a more specific positive prompt. If it
fails again, use a Ken Burns move on the still instead.

**Transcript is nonsense or in the wrong language.** Pass `--lang he` (or `en`) explicitly; add `--keyterms` for brand
words; `--engine whisper` is the fallback. Heavy music hurts; transcribe the cleanest take.

**"budget guard" refusal.** A cap is set in `.env` (`STUDIO_BUDGET_USD`). This studio runs without a cap by default;
clear or raise it only with Slava's OK.

## Claude Code behaviour
**It asks permission for every command.** `.claude/settings.json` allows the studio commands after the folder is
trusted. Open Claude at the studio root, not in a subfolder.

**It wants to run a render in the background.** No: foreground, bounded, one at a time (`.claude/rules/machine-limits.md`).

**A subagent inherits the main model.** Agent files set `model: sonnet` or `opus` explicitly; never `inherit`.
