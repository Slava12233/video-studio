# Secrets (always loaded)

- `FAL_KEY` lives in `.env` at the studio root (git-ignored). The tools read it; nothing else does. Never print it,
  paste it in chat, write it into a prompt, ledger, log, memory file or report. Name it (`FAL_KEY`), never its value.
- `.env` is never read with the Read tool or `cat`; to check the key exists use `node tools/fal/fal.mjs --project .`
  (prints "set" / "MISSING") or `grep -c '^FAL_KEY=.' .env`.
- A key value that ever appears in a chat or a file is burned: say so and ask Slava to rotate it at fal.ai.
- Per-project `.env` files override the root one for that project only (same rules).
- Hooks, `settings*.json` outside this repo, plugins and CI secrets are installed by Slava only. The project
  `.claude/settings.json` here carries no hooks and no secrets; propose changes to it as a paste block.
- Secrets never go to git: `.env*` is ignored except `.env.example`, which holds names and empty values only.
