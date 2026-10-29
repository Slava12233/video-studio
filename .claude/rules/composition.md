---
paths:
  - "projects/**/*.html"
  - "projects/**/*.mjs"
---
# HyperFrames compositions (loads when touching a composition or a build script)

The plugin's skills are the source of truth for the authoring contract: `hyperframes:hyperframes-core` before writing
composition HTML, `hyperframes:hyperframes-animation` / `hyperframes-keyframes` for motion, `hyperframes-audio` for
mixing, `hyperframes-registry` before hand-building any named effect. Do not improvise HTML-to-video rules.

## Launcher and loop
- Every CLI command is `node ../../tools/hf.mjs <cmd>` from the project folder (or `node tools/hf.mjs` from the root).
  Never bare `npx hyperframes`, never `hyperframes skills update`, never upgrade a project's pinned CLI mid-project.
- Loop: author -> `lint` after the first pass and after structural changes -> `check` (the gate; it re-runs lint) ->
  `snapshot --at a,b,c --no-end --zoom "#sel"` to look -> bounded draft render -> frames from the rendered file.
- `timeline --json` answers what is on the timeline; do not read every sub-composition to find out.

## Patterns that pass `check` and render correctly
- One standalone `index.html` per root composition (a bonus reel is its own project). Assets inside the project,
  relative paths, no `../`. All data (caption JSON, word lists) inlined; no render-time fetches.
- Untimed `.scene` layers whose opacity the timeline owns; `<video data-start>` inside them, never inside a timed
  wrapper; transitions from the animation catalog on the scene divs. Every timed element has `class="clip"`,
  `data-start` and a duration. Captions and overlays as timed divs are fine ("nested_structure" findings are
  Studio-layout warnings).
- One paused GSAP timeline registered on `window.__timelines`, deterministic (no `Date.now()`, no `Math.random()`
  without a seed), hidden initial states in CSS so frame 0 renders clean.
- Seams: `tl.set(...)` right before `tl.to(...)`; `tl.fromTo` with a visible from-state punches a hole from frame 0.
- Centering an animated element: `xPercent: -50` in the tween, never CSS `translateX(-50%)` on the tweened element.
- `inset: auto` after `left/right/top` resets them: explicit offsets per text layer, full-frame layers as `.clip.full`.
- `beats` needs `<audio data-timeline-role="music">` (or id `music` / `bgm`). The voiceover carve needs
  `@hyperframes/core` pinned to the CLI version as a dev dependency of the project.
- Build scripts derive the index from data (VO line bounds, clip durations, caption JSON) so a re-voice or a re-cut
  is a re-run; add `PART=a|b` support (split at a voice pause or scene seam, out-of-range clips `data-hidden`, part B
  driving the same timeline through an offset seek) when the piece is over 60 s.
- Bracket edits to an existing project with `history begin --who <agent>` / `history end` when the CLI offers it.
