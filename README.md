# Video Studio

A video creator and editor run with Claude Code: talking-head reels with Hebrew captions, films from photos with
AI camera moves, AI presenter explainers, product promos, social ads, music-driven videos and faceless explainers.
Compositions are HyperFrames HTML rendered to MP4; generation, voices, avatars and transcription run on fal.ai with
a per-project ledger and mandatory AI disclosure.

## Start
1. `git clone` this repo into a short ASCII path, then `claude` in the folder (trust it). The HyperFrames skills ship
   inside the repo (`.claude/skills/hyperframes-plugin/`, release 0.8.160, typed `/hf:<skill>`) and load once the folder
   is trusted; no plugin install is needed (`/reload-plugins` if they do not show).
2. Put your fal.ai key in `.env` after `FAL_KEY=` (never paste it in chat). `.env.example` lists the names.
3. `/studio-doctor` (add `--render` once to prove the chain with a 2 s throwaway render).
4. `/new-video <type> <slug> [--brand <client>]`, fill the brief, let the agent route to the HyperFrames workflow.
5. Drafts land in `projects/<date>-<slug>/renders/`; finals in `deliverables/`.
6. The second brain: `node tools/memory/obsidian-setup.mjs` registers this folder as an Obsidian vault and opens it
   (no click); `docs/hooks-paste-block.md` holds the hooks block for `.claude/settings.json` (the owner pastes it).
   `/sync` closes every session into `memory/`; `docs/OBSIDIAN.md` is the owner's guide.

Skills: `/new-video`, `/transcribe`, `/caption-cues`, `/ai-lab`, `/avatar-presenter`, `/fal-media`, `/render`,
`/review-cut`, `/deliver`, `/studio-doctor`; memory: `/sync`, `/recall`, `/consolidate`, `/memory-update`; vendored
Obsidian skills (`obsidian-markdown`, `obsidian-bases`, `obsidian-cli`, `json-canvas`, MIT, see `THIRD-PARTY.md`);
HyperFrames: `/hf:hyperframes` (the router) and twenty more `/hf:*` skills from the vendored plugin (Apache-2.0).
Agents: director, compositor, media-lab, transcriber, qa-reviewer, deliverer, librarian (`.claude/agents/`).
Rules: `CLAUDE.md` and `.claude/rules/`; the memory contract: `memory/README.md`.

## Scripts
```bash
npm run doctor            # environment check
npm run doctor:render     # plus the 2 s smoke render (bounded)
npm run hf -- --where     # which HyperFrames CLI the tools use (the vendored release)
npm run hf:check          # the vendored HyperFrames plugin matches its VENDORED.json
npm run new -- photo-film my-slug --brand _default
npm run ledger -- --project projects/<slug>
npm run memory:check      # HOT / INDEX / capabilities up to date + vault lint
npm run sync              # regenerate HOT, INDEX, HOME's block, the capability map; lint
npm run obsidian          # register the vault in Obsidian and open it (no click)
npm run memory:test       # the vault tools' tests on a throwaway copy
```

## Layout
| Folder | What |
| --- | --- |
| `projects/` | one folder per video: inputs (read-only), ai media + job files, script, renders, brief, ledger |
| `deliverables/` | final MP4 normalized to -14 LUFS, poster, DISCLOSURE.txt, ledger, delivery.json |
| `brand/` | `_default` kit (fonts, palette, disclosure texts); add one folder per client |
| `tools/` | HyperFrames launcher, scaffold, deliver, doctor, ffmpeg helpers, loudness, fal tools |
| `templates/` | brief per video type, project base (RTL css, AI job examples) |
| `docs/` | workflows, field notes, fal endpoints, troubleshooting, references, the Obsidian guide, the hooks paste block |
| `memory/` | the second brain (an Obsidian vault over this folder): HOT (generated), state, one note per project, lessons, decisions, open items, sessions, references, lane maps, the owner's Hebrew inbox, dashboards |
| `tools/memory/` | the vault tools: build-hot, build-capabilities, lint, new-note, log, obsidian-setup, tests |
| `.claude/hooks/` | SessionStart (HOT into every session) and PreCompact (checkpoint) hooks; installed by the owner from `docs/hooks-paste-block.md` |
| `.claude/skills/hyperframes-plugin/` | the HyperFrames plugin release vendored whole (21 skills as `/hf:*`, the pinned CLI version, `VENDORED.json` with hashes); `tools/vendor-hyperframes.mjs` copies and verifies it |

## Rules in one breath
Renders and ffmpeg run bounded (`timeout`), foreground, one at a time. Paid fal steps show an estimate and wait for a
go. Every AI asset is labeled on screen and listed in the deliverable. Hebrew is RTL with local fonts. Keys never
leave `.env`. Every session reads `memory/HOT.md` first and writes its state changes, lessons and rulings into the
vault the same turn; `/sync` closes it. An action is not done until its memory is written.
