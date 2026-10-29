# Field notes: things that cost a failed run to learn

Collected from the first three studio productions (a UGC reel, an apartment film, an AI-presenter explainer;
HyperFrames plugin 0.8.96 -> 0.8.160, Windows 11, Node 24, FFmpeg 9, a 32 GB laptop shared by several Claude
sessions). Read before the first render or generation of a session. Add to this file when you learn something new;
keep each note to a few lines.

## Rendering
- **Bounded, foreground, one at a time.** Every render starts with Git Bash `timeout N` (1800 for a delivery render,
  540 per chunk when other sessions are active). Exit 124 is the bound, not a failure: report the tail, kill leftovers
  by PID, re-run once with `--resume` or fewer parts. Never background a render, never two renders on one machine.
- **Flags that worked (0.8.160):** `HF_SEGMENTED_CAPTURE=true timeout 1800 node tools/hf.mjs render . -o renders/x.mp4
  --workers 4 --experimental-fast-capture=false -f 24 -q delivery --keep-segments`, re-run with `--resume` on exit 124.
  Delete `renders/.hf-segments` after success (`deliver.mjs` does).
- **Judder from the fast-capture path.** The experimental `drawElementImage` capture repeated stale video frames about
  1 in 6 on long renders. Always pass `--experimental-fast-capture=false`. It looked like a footage problem; it was not.
- **Workers.** `auto` once picked 1 worker and blew a 9-minute bound; use `--workers 4` on a 32 GB laptop
  (5 for short caption reels), `--workers 2` on 16 GB machines. Each worker is a Chrome process.
- **Speed references.** 4 s blank 1080x1920 draft, 2 workers: 45 s. 10 s blank: 1 m 33 s. 56 s film 1080p24 delivery,
  4 workers: 5 m 27 s. 99 s presenter explainer 1080p24, 4 workers: 5 m 0 s. 29.5 s caption reel 1080x1920 30 fps,
  5 workers: about 3.5 min.
- **Shared machine.** Other sessions' ffmpeg / fal pipelines can take 7+ cores; a render that takes 5.5 min alone hits
  a 540 s bound at a third of the speed. Before a long render sample per-process CPU for a few seconds and wait for a
  quiet machine. `timeout` leaves no orphans of the HyperFrames tree, so a busy CPU after a timeout is someone else's
  job: never kill a node process by start time alone.
- **Part renders.** Over ~60 s of output, or whenever other sessions are active, split the composition into parts at
  voice pauses or scene seams (`PART=1..n` in the build script, out-of-range clips get `data-hidden`, part B drives
  the same GSAP timeline through an offset seek, audio cut per part), render each in 1-2 min, join with
  `node tools/media.mjs concat out.mp4 a.mp4 b.mp4` (same codec, no re-encode). Frame-exact and seam-continuous.
- **Snapshots and `beats` need ffmpeg on PATH.** The tools add the winget folder automatically; the raw CLI does not.
  On Windows ffmpeg usually lives in `%LOCALAPPDATA%\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*\bin`.
- **FFmpeg 9:** `-vsync` is gone, use `-fps_mode`. Direct `ffmpeg` calls in Bash start with `timeout N`, even
  one-frame stills (the machine hook denies them otherwise).
- **Verify the file, not the preview.** Extract frames from the rendered MP4 at caption and badge times
  (`node tools/media.mjs frames`), probe duration / fps / audio, measure loudness. Snapshots are not proof.

## Composition gotchas
- **`dir="rtl"` on `<html>` is a lint ERROR that renders a black video.** Put `dir="rtl"` (or `.he`) on the text
  elements instead.
- **Never centre a GSAP-animated element with CSS `translateX(-50%)`.** GSAP bakes the parsed px offset at tween
  creation; an `<img>` not yet loaded gives 0 px and the box renders anchored on its left edge in the render worker
  while snapshots look fine. Use `xPercent: -50` in the tween.
- **Do not wait for `document.images` before registering the timeline**: it stalls the render workers. Stick to
  `document.fonts.ready`.
- **`tl.fromTo(scene, {opacity:1, clipPath:...}, ...)` punches a hole from frame 0** (immediateRender applies the
  from-state at t=0). At a seam use `tl.set(...)` right before `tl.to(...)`. `fromTo` is fine for intros hidden at 0.
- **Pattern that passed `check` clean for films:** one standalone `index.html`; untimed `.scene` layers whose opacity
  the timeline owns; `<video data-start>` inside them, never inside a timed wrapper; transitions from the animation
  catalog on the scene divs. Captions and overlays as timed divs in the same file pass too (the "nested_structure"
  findings are Studio-layout warnings).
- **Inline all data** (caption JSON, word lists) into the HTML: no render-time fetches.
- **Lint rules that bite:** one root composition per project (a bonus reel is its own project), no `../` asset paths
  (copy assets into the project), every timed element has `data-start` + duration and `class="clip"`.
- **`inset: auto` after `left/right/top` resets them.** Position text layers with explicit offsets; keep full-frame
  layers separate (`.clip.full`).
- **`hyperframes beats`** needs `<audio data-timeline-role="music">` (or id `music` / `bgm`) in index.html.
- **Voiceover carve** (`/hyperframes-audio`): needs `npm i -D @hyperframes/core@<cli version>` in the project, then
  `node <plugin-cli> --script <audio-skill>/scripts/carve.mjs --comp index.html --bed music --voice vo`.
- **Perspective-window reel (9:16 from a 16:9 presenter):** a `#win` box (x/y/width/height tweened) with a `#cam`
  child (scale/translate crop, `transform-origin: 0 0`) and a `WIN(box)` helper that writes both tweens; a `CAPS=off`
  switch builds the caption-less variant from the same script. Splitting at a quiet seam (~29.5 s) kept each part
  under 4 minutes.
- **Snapshot review:** `snapshot --at a,b,c --no-end --zoom "#sel"`.

## Hebrew / RTL
- Fonts local with `unicode-range` on the Hebrew Heebo files so Latin falls through; `font-display: block`.
- `direction: rtl` on every Hebrew block; numbers and English inside in `.ltr` / `.num`; trailing punctuation
  drifting -> `<bdi>` or `&#x200F;`. Mixed-direction lines need `unicode-bidi: isolate` (the `.he` class has it).
- Caption sizes that read well: 42-56 px on 1080 wide, 2-4 words, accent emphasis, pills with `white-space: nowrap`.
  Keep captions above the bottom 250 px and below the top 200 px on 9:16.

## Transcription and captions
- whisper-cpp and Parakeet are not available for Hebrew on Windows; faster-whisper needs Python + a venv and Windows
  App Control blocked its DLLs. The cloud path (`tools/fal/transcribe.mjs`, Scribe v2, word-level) replaced all of
  that for about $0.01/min.
- Always hand-correct the word list (names, brand words, numbers like "100 אלף") before building captions; keep each
  word its own entry with its own start/end. Caption timing must match the transcript within 80 ms.
- A words JSON without Scribe's `type` field zeroes the caption matcher filter: keep `type: "word"` on every entry.
- Bash reserves `GROUPS` as a variable name: never use it for an env var in build scripts.

## fal.ai generation
- Prices and quirks per endpoint: `docs/FAL-ENDPOINTS.md`. Every call goes through the project ledger
  (`ai-ledger.jsonl`, append-only JSONL so parallel jobs never lose a line).
- **Kling 2.5 output:** 1920x1080, 24 fps, 5.04-5.08 s (plan 5.0 in the timeline, trim the tail). `tail_image_url`
  is honored well: doorway transitions land on the next room.
- **Chaining:** start a clip from the last frame of the previous one (`node tools/media.mjs last-frame clip.mp4
  frame.png`, offset 0.08 s avoids the final black frame). Dependency waves run in parallel.
- **Prompts:** describe the positive ("empty clean floor", "bed made hotel-style"); negative phrasing in Flux prompts
  backfires. End edit prompts with the keep-everything-else sentence.
- **Subject matting** (`hyperframes remove-background`) runs 1.4-1.8 s per frame on CPU; keep windows <= 4.4 s per
  bounded run.
- HeyGen CLI has no native Windows build (WSL only). HeyGen-on-fal bills through fal and is the only HeyGen path here.

## AI presenter (avatar) lessons
- Sign a voice off on a **full-length read** before generating clips: a voice change on an audio-driven avatar means
  regenerating every clip (about $13 on a 90 s film).
- Always Scribe-read-back a VO; splice a re-synthesized sentence at the pause boundaries instead of regenerating the
  whole take. MiniMax misreads some Hebrew numbers; ElevenLabs v4 George did not.
- OmniHuman v2: chunks under 17 s split at sentence pauses; output is audio length rounded up (+1 s billed); 2 of 2
  wide-still clips once came back with a spontaneous hard cut to a tighter framing mid-sentence. Make a frame sheet of
  every clip; keeping them as jump cuts was the cheaper call.
- Build index from data: shots / mockups / end card derived from the VO line bounds + plan + clip durations, so a
  re-voice is a re-run.

## Audio mix and delivery
- The voiceover carve at strength 0.7 on a 0.22 bed made the music inaudible (-47 dB in pauses). Strength 0.35 on a
  0.55 bed (music pre-normalized to -20 LUFS) gives bed about -31 dB in pauses / -32 dB under a -26 dB voice.
- HyperFrames renders land around -20 LUFS. Deliver through the two-pass `tools/loudnorm.mjs` to -14 LUFS / -1 dBTP
  with the video stream copied (`deliver.mjs` does it). Measure with `node tools/loudnorm.mjs window <file> --ss T --t D`;
  never trust the mix by ear.
- A short music bed is extended with `acrossfade` on the source WAV and re-matched to -20 LUFS.

## Windows + Claude Code
- Claude Code uses Git Bash for its Bash tool; commands in this repo are Bash-style. `python` may not be on PATH
  (Store alias only): use node for JSON work.
- `npx` from a Node script on Windows: spawn `node <npx-cli.js>` instead of `npx.cmd` (what `tools/hf.mjs` does).
- The Bash tool can mangle long heredocs that contain apostrophes: write files with the Write tool.
- Long paths and spaces break some tools: keep the studio under a short ASCII path; slugs are ASCII.
- A user-scope PreToolUse hook on the shared laptop denies unbounded `ffmpeg`, test and dev-server launchers and
  blocks a second heavy run while one is alive, including another session's. It cannot see inside `node tools/*.mjs`:
  the `timeout` rule for renders lives in `.claude/rules/machine-limits.md`.
