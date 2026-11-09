---
type: capability
created: 2026-11-09
status: active
maintained_by: generated
categories: [capabilities]
summary: The 7 sub-agents under .claude/agents with model, job and tool access, generated.
generated_at: 2026-11-09T20:34+02:00
content_hash: 1799fd86b2117369
---

# Agents

Never hand-edit; run node tools/memory/build-capabilities.mjs
7 agents. Delegation rule: sonnet for reading and verifying, opus for drafting and judging, never inherit. Every agent reads HOT and its lane map first and writes memory proposals to `memory/inbox/proposals.md`, never a canonical note.

| Agent | Model | Description | Tools | Skills |
|---|---|---|---|---|
| `compositor` | `opus` | HyperFrames composition builder - writes and edits the project's index.html, sub-compositions and build scripts from the treatment, storyboard and caption plan, runs lint and check, takes snapshots, and produces a bounded draft render. Use when a plan exists and the composition must be built or changed ("build it", "add the captions", "fix the seam at 12 s", "make the 9:16 variant"). | only 6: Read, Glob, Grep, Write, Edit, Bash | render |
| `deliverer` | `sonnet` | Final-render and packaging operator - runs the bounded delivery render through tools/deliver.mjs (check, segmented resumable render, two-pass loudness to -14 LUFS, poster, DISCLOSURE.txt, ledger copy, delivery.json), verifies the delivered file on frames and facts, and reports the paths. Use when the cut is approved and Slava wants the final file ("deliver", "export the final", "package it"). | only 5: Read, Glob, Grep, Bash, Write | deliver |
| `director` | `opus` | Creative director for a video project - turns a brief and the source material into a treatment, storyboard, shot list, beat table and caption plan that the compositor can build without guessing. Use at the start of a project after the brief is filled, when a cut needs a new creative direction, or when Slava asks "how should we tell this", "plan the video", "storyboard it". | only 6: Read, Glob, Grep, Write, Edit, Bash | — |
| `librarian` | `sonnet` | Keeper of the second brain's hygiene - runs the mechanical part of /consolidate (duplicates, stale facts, delivered projects past 90 days, lessons earned twice, dead links, caps) and of /sync (which facts of a session still lack their note or log line) as a proposal list in memory/inbox/proposals.md, and checks that the vault, docs/, the lane maps and CLAUDE.md agree. Use for /consolidate, for the mechanical part of /sync at session end, or after a big change to the harness. | only 6: Read, Glob, Grep, Write, Edit, Bash | memory-update, consolidate |
| `media-lab` | `sonnet` | fal.ai generation operator - prepares and dry-runs the project's AI job files (photo edits, stills, camera moves, music, SFX, TTS, avatar clips, upscales), reports the estimate, and runs paid jobs only when the prompt carries an explicit GO with the approved amount; inspects outputs as frames and keeps the ledger honest. Use for "generate the camera moves", "fix these photos", "make the voice-over", "estimate the AI cost". | only 12: Read, Glob, Grep, Write, Edit, Bash, fal:recommend_model, fal:search_models, fal:get_model_schema, fal:get_pricing, fal:estimate_cost, fal:search_docs | ai-lab, fal-media |
| `qa-reviewer` | `sonnet` | Independent reviewer of a rendered cut - probes the file, extracts frames at caption, badge and seam times, checks RTL typography, safe zones, disclosure coverage against the ledger, loudness windows and lip sync, and compares to the brief. Read-only; reports blockers and nits. Use after every draft render and before delivery ("review the cut", "is it ready", "check the captions"). | only 4: Read, Glob, Grep, Bash | review-cut |
| `transcriber` | `sonnet` | Transcript and caption specialist - runs the cloud word-level transcription (Scribe v2 via fal), proof-reads names, brand words and numbers, writes the corrected word list, builds the Hebrew caption cues and the beat plan, lists pause cuts, and reads TTS takes back against the script. Use for "transcribe this", "make the captions", "check the voice-over against the script", "where can we cut the pauses". | only 6: Read, Glob, Grep, Write, Edit, Bash | transcribe, caption-cues |
