# Prompting: build orders, family notes, quality bars

Adapted from fal-ai-community/skills (cinematography, commercial, ugc, fal-prompting) and this studio's own runs.

## Photo edits (Nano Banana)
Order: (1) the change, as what should be seen ("the parquet is fully visible where the box was", "bed made
hotel-style with white bedding"); (2) scope ("only the sofa cushions change"); (3) the keep-everything-else sentence;
(4) "Photorealistic. No people, no text." Resolution 2K for 1080p video; `aspect_ratio: "auto"`. Multi-reference edits
pass extra images in `src: [..]`. One edit per job; chain edits on the edited output when a photo needs two.

## Camera moves from stills (Kling 2.5 Turbo Pro, MiniMax H3)
Order: (1) "Smooth steady cinematic real-estate camera move:" (2) the single move (slow push-in toward the balcony
door / slow lateral slide right / gentle orbit) (3) parallax cue ("parallax on the sofa") (4) "consistent geometry,
natural daylight, photorealistic, no people" (5) for a transition: "ending on the kitchen view exactly as in the
final frame". Kling: `duration` 5 or 10, `cfg_scale` 0.5, `negative_prompt` "blur, distortion, warping walls,
morphing furniture, flicker, people appearing, text, watermark". H3 loops: same image as start and end, "Fixed shot
looping video of the kitchen: only the light shifts gently and the curtain moves slightly, camera static".

## Cinematic stills and shots (SCLCAM)
1. Subject: who or what is in frame. 2. Context: location, time, weather, story moment. 3. Lens / framing: distance,
angle, focal-length feel, depth of field. 4. Camera motion (video only): push-in, dolly, tracking, handheld, crane.
5. Atmosphere: haze, rain, practicals, reflections, texture. 6. Mood / color: palette, contrast, grade, exposure.
7. Output controls: aspect ratio, duration, first-frame continuity.
Template: `[subject] in [context], framed as [shot size and angle], [lens feel], [lighting setup], [camera movement],
[color grade], [texture], [aspect / duration], [continuity constraints]`.
Quality bar: the move is physically plausible; lens, shot size and angle agree; light direction is consistent; one
shot per prompt unless the model supports shot lists.

## Product and commercial stills
Order: (1) product invariant: exact object, material, color, packaging, scale (2) role: hero, PDP, teaser, social ad
(3) setting: surface, background, props, distance (4) lighting: softbox, strip, rim, backlight (5) camera: angle,
focal feel, macro, DoF (6) composition: centered, negative space, safe zone, text-free area (7) brand tone (8)
guardrails: preserve logo and packaging, no extra text, no distorted labels. Batches keep one skeleton and vary one
axis (background, crop, light). Fidelity misses -> switch from text-only generation to an edit from a reference.

## UGC / creator-style clips (fal-ai-community `ugc`)
Script beats: hook (one tension or curiosity gap) -> context -> product moment -> proof (visible, supplied) -> turn
(before/after, objection answered) -> close (soft CTA). Prompt order per clip: speaker and frame -> performance (eye
contact, casual delivery, gestures) -> product action -> camera (handheld phone, desk tripod) -> light and sound feel
-> platform constraints (9:16, safe zones, no generated captions) -> guardrails (no fake claims, no new logos).
Claims only from the brief; replace unsupported claims with observable statements.

## Presenter stills for audio-driven avatars (this studio)
Waist-up, both hands visible, the stage baked in (backdrop, lighting, props), eyes to camera, neutral mouth,
16:9 for landscape. One still per framing. Generate framings as Nano Banana Pro edits of one approved photo
("same person, same clothes, wider framing showing both hands, same backdrop"), never a new face.

## Hebrew TTS text
Short sentences; paragraph breaks for pauses (ElevenLabs) or `<#0.4#>` tags (MiniMax); numbers written the way the
voice reads them (test "12", "מ-12", "שניים עשר" on one sentence first); brand names in Latin letters when the voice
mangles the transliteration. Read every take back with Scribe before using it.

## Music and SFX
Music: genre + instruments + tempo (BPM) + mood + structure + "no vocals, instrumental, pristine studio quality"; ask
for the length the film needs plus 5 s. SFX: one sound, its material and space ("smooth sliding glass door glides open
softly, quiet interior"), duration, `loop: true` for ambiences.

## Family notes
- **Kling**: strong end-frame adherence (`tail_image_url`); keep one move per prompt; 5 s output is 5.04-5.08 s.
- **Nano Banana**: follows the keep sentence well; 2K is enough for 1080p; text inside images is readable at Pro.
- **Flux schnell**: 4 steps, seeds for repeatable variants; negative phrasing backfires.
- **OmniHuman v2**: animates only what the still shows; chunks over ~17 s fail; may reframe mid-sentence.
- **Scribe v2**: `keyterms` biases brand words (+30 % price); returns `type` on entries, keep it.
