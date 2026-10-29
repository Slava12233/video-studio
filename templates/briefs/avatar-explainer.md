# Brief: {{SLUG}}

Type: AI presenter explainer · Brand: {{BRAND}} · Format: {{RESOLUTION}} · Created: {{DATE}}
Workflow: {{WORKFLOW}}

## The presenter
- Stills in `inputs/avatar/`: __ files (waist-up, both hands visible, stage baked in; 16:9 for landscape)
- Framings available (wide / medium / tight) and wardrobe per still:
- Consent: the person in the stills approved an AI likeness (who, when):

## Script
- Source: adapted from a reference transcript / written from notes / supplied verbatim
- Language: Hebrew (default) / English · Length target: __ s (about 1.9 words per second)
- Script file: `script/vo.txt` (paragraph breaks = pauses; digits as words where TTS misreads them)
- Facts, prices and claims allowed on screen (only from here):

## Voice
- Engine and voice: ElevenLabs v4 George (default) / MiniMax Determined_Man / bake-off first
- Sign-off rule: approve the voice on a FULL-LENGTH read before generating clips (a voice change later means
  regenerating every clip)

## Avatar clips
- Engine: OmniHuman v2 (default, chunks <= 17 s) / Kling Avatar v2 Pro / HeyGen Avatar 4
- Chunking: split the VO at sentence pauses, one framing per chunk, cut framings on sentence ends
- Upscale OmniHuman output (1284x716) with Topaz 1.5x: yes / no

## Graphics
- Caption style (e.g. bold pops on a navy pill), phone / UI mockups to slide in, price card, logo placement, end card:
- Music bed: generated / none · Target mix: bed about -31 dB in pauses under a -26 dB voice; deliver at -14 LUFS

## Disclosure
- "AI-generated presenter" badge for the whole visible time + AI voice note at the start (`brand/_default/DISCLOSURE.md`)

## Delivery
- Deadline:
- Variants: 16:9 main, 9:16 cut-down
- Approved by:
