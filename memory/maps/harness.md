---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [maps, harness]
summary: "The Harness lane map - the librarian agent and the main session at /sync, /consolidate and any change to the studio's own tools, skills, rules or memory: the contract, the procedure, the generated notes, the inboxes, the roadmap."
---

# Harness lane (librarian, the main session at /sync, /consolidate and harness work)

## Read first, every lane
- `memory/HOT.md` (in your context from the SessionStart hook; read it if not)
- [[current]] (`memory/state/current.md`) and [[roadmap]] (`memory/state/roadmap.md`)

## The contract and the procedures
- [[memory/README|README]] (`memory/README.md`, the contract) · `.claude/rules/memory.md` (its always-loaded summary) · skills `memory-update`, `sync`, `consolidate` (procedure `.claude/skills/consolidate/PROCEDURE.md`), `recall`
- `CLAUDE.md` (the studio's rulebook) and `~/.claude/CLAUDE.md` (the laptop's; hooks, settings and plugins are Slava's)
- `docs/OBSIDIAN.md` (Slava's guide), `docs/hooks-paste-block.md`, `docs/REFERENCES.md` (external repos: adopted, reference-only, skipped), `THIRD-PARTY.md` (licences of the vendored skills)

## Generated notes (never hand-edit)
- `memory/HOT.md` · `memory/INDEX.md` · `memory/capabilities/*` · the generated block of [[HOME]]

## Inboxes
- [[owner]] (Slava writes in Hebrew, the harness answers) · [[proposals]] (agents propose, the main session merges)

## Lesson notes not yet promoted (read all)
- every note under `memory/lessons/harness/`, `memory/lessons/tooling/` and `memory/lessons/operator/` (grep `memory/INDEX.md`)
- [[2026-11-09-obsidian-cli-needs-the-app-running-call-it-by-full-path]] · [[2026-11-09-obsidian-is-a-machine-wide-install-on-this-laptop]] · [[2026-11-09-bash-commands-that-name-env-are-denied]] · [[2026-11-09-the-marketing-harness-vault-is-the-house-style]]

## Write
- vault notes per the contract; `tools/memory/*` and `.claude/hooks/*` changes get a `tools.test.mjs` run (`timeout 300 node --test tools/memory/tools.test.mjs`); a new rule or a changed workflow is a line in [[roadmap]] "Done" and a lesson or decision note; hooks and settings changes are prepared as a paste block and stop
