# fal.ai spend (always loaded)

This studio runs with **no hard cap**: `STUDIO_BUDGET_USD` stays empty. The discipline is procedural.

1. **Estimate first.** Every paid tool runs with `--dry` first and prints the plan and the estimate. Show the estimate
   in one short line ("4 photo fixes + 3 camera moves, about $1.40. Go?") and **wait for an explicit go from Slava in
   chat** before the un-dry run. A go covers that estimate only; a new job file, a `--force` retry or a different
   engine is a new estimate and a new go. Do not bundle a cheap probe into a bigger go.
2. **Ledger every call.** Paid generation goes through `tools/fal/*.mjs` so it lands in the project's
   `ai-ledger.jsonl` with its disclosure line. The fal MCP is for discovery (`recommend_model`, `search_models`,
   `get_model_schema`, `get_pricing`, `estimate_cost`) and for a one-off probe under about $0.20 after a go; a probe
   run through the MCP gets a ledger line appended by hand (same shape as the tools write).
3. **Prices and quirks** live in `docs/FAL-ENDPOINTS.md` and `tools/fal/fal.mjs` `PRICES`; both carry the
   verification date. A price older than a month, or a model not in the table, gets `get_pricing` before the estimate.
   Update the table and the price map together.
4. **Report spend** at every milestone: the project total from `node tools/fal/fal.mjs --project <dir>` and what the
   next step would add. Reference budgets: a 56 s photo film about $6; an 88 s AI-presenter explainer $16-30.
5. **Avoid rework that costs money.** Sign a voice off on a full-length read before any avatar clip. Regenerate a
   clip once at most with a more specific prompt, then fall back (Ken Burns instead of a camera move, a jump cut
   instead of a re-render). Read every TTS take back with Scribe before using it.
6. **Prompts** describe what should be seen; edits end with the keep-everything-else sentence. Inspect every output as
   frames (`node tools/media.mjs frames`), not thumbnails, before placing it.
7. **Rights and disclosure.** Generated or licensed music only. Every AI asset is disclosed on screen
   (`.claude/rules/disclosure.md`). Stills of a real person become an avatar only with that person's documented consent.
