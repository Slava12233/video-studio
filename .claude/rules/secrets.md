# Secrets (always loaded)

- `FAL_KEY` lives in `.env` at the studio root (git-ignored). The tools read it; nothing else does. Never print it,
  paste it in chat, write it into a prompt, ledger, log, memory file or report. Name it (`FAL_KEY`), never its value.
- `.env` is never read with the Read tool or `cat`; to check the key exists use `node tools/fal/fal.mjs --project .`
  (prints "set" / "MISSING") or `grep -c '^FAL_KEY=.' .env`.
- A key value that ever appears in a chat or a file is burned: say so and ask Slava to rotate it at fal.ai.
- Per-project `.env` files override the root one for that project only (same rules).
- Hooks, `settings*.json` outside this repo, plugins and CI secrets are installed by Slava only. The project
  `.claude/settings.json` here carries no secrets; its three memory hook events (SessionStart, SubagentStart,
  PreCompact) were added on Slava's yes in chat on 2026-11-09, and the same evening, on his yes, the marketplace
  copy of HyperFrames was set to `false` under `enabledPlugins` (the skills ship in the repo as `hf:*`); restore
  blocks: `docs/hooks-paste-block.md`. Propose any further change to it as a paste block.
- `.env` must not appear in a Bash command line at all (the deny rules refuse the whole call): check the key by name
  with `node tools/fal/fal.mjs --project .` (prints set / MISSING).
- Secrets never go to git: `.env*` is ignored except `.env.example`, which holds names and empty values only.
