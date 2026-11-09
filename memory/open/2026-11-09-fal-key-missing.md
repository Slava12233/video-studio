---
type: open
created: 2026-11-09
updated: 2026-11-09
status: open
owner: slava
maintained_by: harness
categories: [open, fal]
summary: "Slava: put the fal.ai key after FAL_KEY= in .env (missing on 2026-11-09 by name); without it no generation, TTS, avatar or Hebrew transcription runs."
---

# FAL_KEY is missing

**What is waiting.** `node tools/fal/fal.mjs --project .` printed `FAL_KEY : MISSING (add it to .env)` on 2026-11-09 (the doctor said the same on 2026-10-30).

**Who acts, and the click or the answer needed.** Slava: open `.env` at the studio root and put the key after `FAL_KEY=` (see `.env.example`). Never paste it in chat: a pasted key is burned and rotated.

**Cost or risk of waiting.** No paid fal step can run: no AI photo fixes, camera moves, TTS, avatars or Scribe transcription; HyperFrames rendering and free Ken Burns work without it.

**Links.** [[current]]
