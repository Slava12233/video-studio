---
name: ai-lab
description: Generate or edit media with fal.ai through the studio's ledgered tools - photo fixes and virtual staging (Nano Banana), B-roll stills (Flux / Nano Banana Pro), camera-move clips from photos (Kling 2.5 / MiniMax H3), music beds and sound effects, Hebrew voice-over (ElevenLabs v4 / MiniMax), audio-driven avatar clips (OmniHuman / Kling / HeyGen), Topaz upscales. Use when a video needs an asset that does not exist yet. Estimates first, waits for a go, logs every asset with its AI disclosure.
argument-hint: <edit|image|clip|audio|tts|avatar|upscale> [ids...] [--dry] [--force]
---

# AI lab (fal.ai, ledgered)

Arguments: `$ARGUMENTS`. Work inside the current project (`projects/<date>-<slug>/`); every command below runs from
the project folder. Prices, limits and quirks: `docs/FAL-ENDPOINTS.md`. Prompt craft and model choice: `/fal-media`.

| Need | Tool | Jobs file | Output |
| --- | --- | --- | --- |
| Clean up / stage a photo | `tools/fal/edit-images.mjs` | `ai/edits.json` | `ai/images/<id>.png` |
| A still that does not exist | `tools/fal/generate-images.mjs` | `ai/images.json` (or `--prompt`) | `ai/images/<id>.png` |
| Camera move from a still | `tools/fal/image-to-video.mjs` | `ai/shots.json` | `ai/clips/<id>.mp4` |
| Music bed / sound effect | `tools/fal/audio.mjs` | `ai/audio.json` | `ai/audio/<id>.wav|mp3` |
| Voice-over from a script | `tools/fal/tts.mjs` | `ai/tts.json` | `ai/audio/<id>.mp3` |
| Talking presenter from still + voice | `tools/fal/avatar.mjs` | `ai/avatar.json` | `ai/clips/<id>.mp4` |
| Upscale a clip (Topaz 1.5x) | `tools/fal/upscale.mjs <clip>` | none | `ai/clips/<name>-up.mp4` |

Each project has `ai/*.example.json`; copy one to the real name and edit it.

## Procedure (always in this order)

1. **Write the jobs file.** Prompts describe what should be SEEN ("empty clean floor", "bed made hotel-style"), never
   what should be absent. Edits end with the keep-everything-else sentence from the example. Camera moves: one move
   per shot, "consistent geometry, no people", 5 s on Kling; chain with `{ "clip": "<id>" }` and land on the next room
   with `end`. Avatars: one still per framing, one VO chunk per job, chunks <= 17 s for OmniHuman.
2. **Dry run:** `node ../../tools/fal/<tool>.mjs --project . --dry`. Show the list and the estimate in one short
   line, e.g. "4 photo fixes + 3 camera moves, about $1.40. Go?"
3. **Wait for an explicit go from Slava.** No go, no spend. The go covers this estimate only. `FAL_KEY` missing ->
   the tool says so; stop.
4. **Run** the same command without `--dry`. Shots in a wave run in parallel; a 5 s Kling clip takes 1.5-3 minutes,
   an avatar chunk 2-6 minutes. The call is network-bound, not CPU-heavy, but still foreground: give the Bash call a
   timeout that covers the wave (10-25 minutes).
5. **Inspect every output as frames** (`node ../../tools/media.mjs frames <clip> <dir> --every 1`, or open the PNG)
   before placing it. Warped walls, extra objects, a mid-sentence reframe: regenerate once with `--force` and a more
   specific positive prompt, then fall back (Ken Burns on the still, keep the jump cut).
6. **Label.** Every output carries its disclosure in `ai-ledger.jsonl`; the composition carries the `.ai-badge` for
   the asset's whole visible time (`.claude/rules/disclosure.md`). Report the project total
   (`node ../../tools/fal/fal.mjs --project .`).

Discovery and schema questions go through the fal MCP (`recommend_model`, `get_model_schema`, `get_pricing`); paid
runs go through these tools so they are ledgered. A 422 from a tool means a field name changed: fetch the schema, fix
the job file and the tool, update `docs/FAL-ENDPOINTS.md`.
