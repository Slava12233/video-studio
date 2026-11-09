---
type: decision
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [decisions, harness]
summary: "Slava: the studio gets a second brain in Obsidian, installed A to Z, and the memory must always be kept current (status, what we learn, lessons); the root CLAUDE.md carries its rules."
decided_by: slava
supersedes: ""
superseded_by: ""
---

# The second brain lives in an Obsidian vault and is always kept current

**Ruling.** Slava, 2026-11-09, in chat (English): "what we basically want to add is a second brain. The second brain will be our memory system that we're going to use with Obsidian. [...] install obsidian and obsidian skills and tools. research the repos that can help us to create the best memory system and install everything a-z. update the root claude.md about it and all the rules we added about the memory. The memory is a really big part of this harness and how this harness is going to evolve, so the memory has to always update it: the current status of our work, what we learn, the lessons, etc."

**Context.** The studio was bootstrapped 2026-10-29 with no persistent memory beyond `docs/FIELD-NOTES.md`. Slava's other harnesses on this laptop (`marketing-team-harness-main`, `RealEstateTeam`) already keep an Obsidian-vault memory with a contract, a generated HOT, lint, bases and hooks; that design is the house style and was adapted here ([[2026-11-09-the-marketing-harness-vault-is-the-house-style]]). The research notes under `memory/references/` record what was adopted and what was declined.

**What it replaces.** Nothing: the first memory contract of this studio. `docs/FIELD-NOTES.md` stays the curated home of promoted gotchas; the vault adds the dated trail, the state and the rituals.

**Applies to.** Every session in this repo, every sub-agent, every tool that changes the studio's state: read `memory/HOT.md` first; write the state change in the same turn; `/sync` at session end; an action is not done until its memory is written (`memory/README.md`, `.claude/rules/memory.md`). Hooks and `.claude/settings.json` stay Slava's to install.
