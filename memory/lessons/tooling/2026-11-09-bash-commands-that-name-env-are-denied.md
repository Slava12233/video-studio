---
type: lesson
created: 2026-11-09
updated: 2026-11-09
status: confirmed
maintained_by: harness
categories: [lessons, tooling]
summary: "A Bash command that mentions .env (even the grep for the key NAME that secrets.md suggests) or contains `rm -rf` is denied by the project's permission rules; check the key with `node tools/fal/fal.mjs --project .` (prints set / MISSING) and never use rm -rf."
applies_to: [claude-code, secrets, tooling]
evidence: "Two denied Bash calls on 2026-11-09 in this repo: one grep on .env bundled with other commands, one loop with `rm -rf .claude/skills/<dir>`; .claude/settings.json deny list: Read(./.env), Bash(cat .env), Bash(rm -rf *)"
promoted_to: 
supersedes: ""
superseded_by: ""
---

# Bash commands that name .env or use rm -rf are denied

**The fact.** The project's `.claude/settings.json` denies `Read(./.env)`, `Bash(cat .env)` and `Bash(rm -rf *)`; in practice a Bash call that references `.env` anywhere in a compound command is refused whole, and so is any call containing `rm -rf`, even for a folder that does not exist yet. The `.claude/rules/secrets.md` suggestion to grep `.env` for the key name (a count of lines that start with the name and an equals sign) therefore does not work from a session.

**Evidence.** Two "Permission to use Bash ... has been denied" results on 2026-11-09 while installing the memory system; both commands passed once the `.env` reference and the `rm -rf` were removed.

**How to apply.** Key presence: `node tools/fal/fal.mjs --project .` prints `FAL_KEY : set` or `MISSING` (names only). Deleting: never `rm -rf`; move to `projects/_archive/` or `memory/archive/`, or delete single files; when a folder must go, ask Slava. Keep `.env` out of every command line, including `ls` and `grep`.
