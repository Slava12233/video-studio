# Video Studio

A video creator and editor run with Claude Code: talking-head reels with Hebrew captions, films from photos with
AI camera moves, AI presenter explainers, product promos, social ads, music-driven videos and faceless explainers.
Compositions are HyperFrames HTML rendered to MP4; generation, voices, avatars and transcription run on fal.ai with
a per-project ledger and mandatory AI disclosure.

## Start
1. `git clone` this repo into a short ASCII path, then `claude` in the folder (trust it). The HyperFrames plugin is
   enabled from `.claude/settings.json`; `/reload-plugins` if asked.
2. Put your fal.ai key in `.env` after `FAL_KEY=` (never paste it in chat). `.env.example` lists the names.
3. `/studio-doctor` (add `--render` once to prove the chain with a 2 s throwaway render).
4. `/new-video <type> <slug> [--brand <client>]`, fill the brief, let the agent route to the HyperFrames workflow.
5. Drafts land in `projects/<date>-<slug>/renders/`; finals in `deliverables/`.

Skills: `/new-video`, `/transcribe`, `/caption-cues`, `/ai-lab`, `/avatar-presenter`, `/fal-media`, `/render`,
`/review-cut`, `/deliver`, `/studio-doctor`. Agents: director, compositor, media-lab, transcriber, qa-reviewer,
deliverer (`.claude/agents/`). Rules: `CLAUDE.md` and `.claude/rules/`.

## Scripts
```bash
npm run doctor            # environment check
npm run doctor:render     # plus the 2 s smoke render (bounded)
npm run hf -- --where     # which HyperFrames CLI the tools use
npm run new -- photo-film my-slug --brand _default
npm run ledger -- --project projects/<slug>
```

## Layout
| Folder | What |
| --- | --- |
| `projects/` | one folder per video: inputs (read-only), ai media + job files, script, renders, brief, ledger |
| `deliverables/` | final MP4 normalized to -14 LUFS, poster, DISCLOSURE.txt, ledger, delivery.json |
| `brand/` | `_default` kit (fonts, palette, disclosure texts); add one folder per client |
| `tools/` | HyperFrames launcher, scaffold, deliver, doctor, ffmpeg helpers, loudness, fal tools |
| `templates/` | brief per video type, project base (RTL css, AI job examples) |
| `docs/` | workflows, field notes, fal endpoints, troubleshooting, references |

## Rules in one breath
Renders and ffmpeg run bounded (`timeout`), foreground, one at a time. Paid fal steps show an estimate and wait for a
go. Every AI asset is labeled on screen and listed in the deliverable. Hebrew is RTL with local fonts. Keys never
leave `.env`.
