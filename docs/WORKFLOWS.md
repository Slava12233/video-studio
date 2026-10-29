# Workflows: the seven video types

Each type maps to a HyperFrames workflow (loaded through the `hyperframes:hyperframes` router) plus studio tools and
skills. Times are for a 32 GB laptop; prices are fal.ai list prices (dates in `docs/FAL-ENDPOINTS.md`).

## 1. Talking-head reel (`/new-video talking-head <slug>`)
**Input:** one presenter clip (phone, 9:16 or 16:9), Hebrew or English speech. **Output:** 9:16 reel, 30-90 s,
captions, callout cards, optional B-roll and lower-thirds.
1. Scaffold with `--video <file>`; the CLI converts the footage to H.264 inside the project.
2. `/transcribe inputs/<file> --lang he --srt` -> `transcript.json`. Proof-read names, brand words, numbers.
3. Pick the look: plain captions -> `hyperframes:embedded-captions` (quiet `anchor` rail by default); designed
   overlays (titles, callouts, quotes, PiP) -> `hyperframes:talking-head-recut`. `/caption-cues` builds the Hebrew cue
   list (2-4 words, emphasis words, pills) from the corrected transcript.
4. B-roll: own footage in `inputs/` first; missing shots -> `/ai-lab image` or `clip`, labeled. Inserts <= 1.4 s,
   always back to the presenter on an emphasized word.
5. Framing: snap zooms on stressed words, hard cuts at phrase boundaries, never mid-word. A 16:9 source on a 9:16
   canvas: letterbox top-third with captions below, or the perspective-window crop (`docs/FIELD-NOTES.md`,
   Composition gotchas).
6. Pause removal: cut on transcript gaps >= 0.45 s; re-check lip sync after every cut.
7. Draft render at the footage's fps, `/review-cut`, fix, `/deliver`. Caption-less variant = same composition with the
   caption track `data-hidden`.
Time: 30-60 min. Cost: transcript $0.01-0.05 plus any B-roll.

## 2. Photo / footage film (`/new-video photo-film <slug>`)
**Input:** 8-20 photos and/or short clips. **Output:** 16:9 film, 30-60 s, music, Hebrew labels, optional 9:16.
1. Copy photos to `inputs/photos/` (read-only). Rooms and walk-through order in `BRIEF.md`; one-line concept
   (e.g. "every cut is a doorway"). Storyboard with the director (`STORYBOARD.md`, `storyboard.html` sketch sheet).
2. Photo fixes: `ai/edits.json` -> `/ai-lab edit` (`--dry`, estimate, go, run). Owner requests and virtual staging go
   here; all outputs are AI-edited -> labeled.
3. Crops: `node tools/media.mjs crop ai/images/<id>.png ai/images/<id>-169.png --aspect 16:9 --y 0.4`.
4. Camera moves: `ai/shots.json` -> `/ai-lab clip`. Kling 2.5 Turbo Pro 5 s for hero moves ($0.35 each), `end` image
   for doorway transitions, `{ "clip": ... }` to continue from the previous shot, MiniMax H3 for cheap static loops.
   Everything else is Ken Burns in HyperFrames for free.
5. Music + SFX: `ai/audio.json` -> `/ai-lab audio`. Beats: `node tools/hf.mjs beats` with
   `<audio data-timeline-role="music">`.
6. Build with `hyperframes:general-video` in companion mode: one standalone `index.html`, untimed `.scene` layers,
   `<video data-start>` inside them, catalog transitions, `.he` labels in the safe zone, `.ai-badge landscape` on every
   AI clip for its whole visible time.
7. Render 24 fps; over 45 s renders segmented (`deliver.mjs`), or in parts when the machine is busy.
Time: 1.5-3 h including generation. Cost: $4-8 for a 45-60 s film.

## 3. AI presenter explainer (`/new-video avatar-explainer <slug>`)
**Input:** 1-3 waist-up stills of the presenter (consented), a script or a reference transcript. **Output:** 16:9,
60-100 s, avatar clips, Hebrew caption pops, mockups, end card.
1. Script in `script/vo.txt` (adapted from the reference transcript via `/transcribe` when there is one). Only the
   brief's facts and prices.
2. `/avatar-presenter`: TTS bake-off on one paragraph if the voice is not fixed -> full-length read -> Slava signs
   the voice off -> read-back with Scribe -> chunk the VO at sentence pauses (<= 17 s for OmniHuman) -> `ai/avatar.json`
   -> `/ai-lab avatar` -> frame sheet of every clip -> optional Topaz upscale.
3. Build index from data (shots, mockups, flash cards, end card derived from the VO line bounds and clip durations) so
   a re-voice is a re-run; captions as timed divs; voiceover carve on the music bed (strength ~0.35 on a 0.55 bed).
4. "AI-generated presenter" badge for the whole visible time, AI-voice note at the start. `/review-cut`, `/deliver`.
Time: half a day. Cost: $15-30 (a voice change after clips exist costs about $13 again).

## 4. Product promo / explainer (`/new-video promo <slug>`)
**Input:** a URL, a script or notes. **Output:** 16:9 (plus 9:16), 20-60 s, product captures, kinetic text, optional voice.
1. URL or site tour -> `hyperframes:product-launch-video` (captures the site's own visuals). Text only ->
   `hyperframes:faceless-explainer`.
2. Voice: recorded in `inputs/` preferred; AI voice only with a go and a disclosure note at the start (`/ai-lab tts`).
3. Hebrew on screen: `.he` blocks, numbers in `.num`, product names in `.ltr`. UI captures at 100 % scale.
4. Charts and stats -> `hyperframes:motion-graphics` sub-composition; registry blocks (`hyperframes:hyperframes-registry`)
   before hand-building any named effect.
5. Deliver 16:9 at 30 fps; 9:16 variant as a second composition rendered with `--composition`.
Time: 1-2 h. Cost: usually $0 to $1.

## 5. Social ad / short reel (`/new-video social-ad <slug>`)
**Input:** a hook line, a number or claim, optional footage/stills, optional music. **Output:** 9:16 (plus 1:1, 4:5), 6-30 s.
1. Under ~30 s, motion is the message -> `hyperframes:motion-graphics` (kinetic type, count-up, logo sting).
2. Hook in the first 1.5 s, CTA in the last 2 s, `--cta` color only on the CTA, logo sting from `assets/logo.svg`.
3. Safe zones: nothing important in the bottom 250 px or top 200 px. Hebrew count-ups: digits in `.num`, words in `.he`.
4. Variants are extra compositions in the same project; render each with `--composition` and `--name`.
Time: 20-60 min. Cost: $0-0.50.

## 6. Music-driven video (`/new-video music-video <slug>`)
**Input:** a track (file, audio pulled from a video, or generated from a mood brief), optional stills/clips/lyrics.
**Output:** 9:16 or 16:9, the track's length, every cut on the beat grid.
1. Track into `inputs/` (or `/ai-lab audio` for a generated bed, labeled in DISCLOSURE.txt). `node tools/hf.mjs beats`
   for the grid; sections in `BRIEF.md`.
2. `hyperframes:music-to-video`: the music drives all pacing; user stills/clips cut onto the grid; missing visuals are
   typography or generated plates (labeled when shown as real).
3. Lyrics / text follow the Hebrew rules; hits on downbeats; one visual idea per bar.
Time: 1-2 h. Cost: $0-0.50.

## 7. Faceless explainer (`/new-video explainer <slug>`)
**Input:** an article, notes or a topic. **Output:** 16:9 (plus 9:16), 45-90 s, invented visuals per scene.
1. Source text in `script/source.md`; one takeaway; 3-5 beats, one visual idea each (typography, diagram, chart).
2. `hyperframes:faceless-explainer`; no site capture, no stock footage. Numbers only from the source text.
3. Narration: AI voice via `/ai-lab tts` (disclosed) or captions only.
Time: 1-2 h. Cost: $0-1.

## Common finish
`/review-cut` on the draft (frames at caption/badge times from the rendered file, RTL check, loudness, disclosure),
then `/deliver` -> `deliverables/<date>-<slug>/`: MP4 at delivery quality normalized to -14 LUFS, poster,
`DISCLOSURE.txt`, `ai-ledger.jsonl`, `BRIEF.md`, `delivery.json`. Check `has_audio`, duration and the labels before
sending anything.
