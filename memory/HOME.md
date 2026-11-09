---
type: map
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: slava
categories: [memory]
summary: Slava's page in Hebrew - today, projects in flight, AI spend, open items by owner and the newest lessons (generated block), then the dashboards and the links.
---

# האולפן: המוח השני

%% generated:start %%
%% content_hash: a25ea328455d66a5 · generated_at: 2026-11-09T21:21+02:00 · Never hand-edit; run node tools/memory/build-hot.mjs %%
### היום
2026-11-09 · מצב נכון ל-2026-11-09 ([[current]])
1. Slava: put the fal.ai key after `FAL_KEY=` in `.env` (missing on 2026-11-09, by name); then `/studio-doctor` once (a new session also confirms only `hf:*` HyperFrames skills are listed).
2. First video: `/new-video <type> <slug>`; the project note is created with the folder; fill the brief; build with `hf:hyperframes`; `/sync` at the end of the session.
3. Slava: `git commit` of the second brain and the vendored HyperFrames plugin when he is ready (the harness never commits unasked); optionally `winget upgrade Obsidian.Obsidian` (1.13.7 → 1.15.0, needs admin).

### פרויקטים בעבודה
- אין

### הוצאות AI
- אין עדיין

### פריטים פתוחים לפי בעלים
- סלבה · [[2026-11-09-commit-the-second-brain]] · Slava: the second brain, the vendored HyperFrames plugin (.claude/skills/hyperframes-plugin/, 18 MB) and the Hebrew-language CLAUDE.md change are unc…
- סלבה · [[2026-11-09-fal-key-missing]] · Slava: put the fal.ai key after FAL_KEY= in .env (missing on 2026-11-09 by name); without it no generation, TTS, avatar or Hebrew transcription runs.

### למידות אחרונות
- 2026-11-09 · [[2026-11-09-memory-tools-and-hooks-are-node-only-and-bounded]] · The memory layer is plain Markdown plus Node scripts and two hooks: no MCP server, no Python, no database; research of 2026-11-09 found that is also…
- 2026-11-09 · [[2026-11-09-the-marketing-harness-vault-is-the-house-style]] · Slava's marketing harness (D:/AgentTeams/marketing-team-harness-main) already carries a proven Obsidian-vault memory (contract, generated HOT/INDEX,…
- 2026-11-09 · [[2026-11-09-a-bounded-headless-claude-p-shows-what-a-session-would-load]] · To see what a new session would load (skills, plugins, hooks) without asking Slava to restart, run a bounded headless session from the studio root: t…
- 2026-11-09 · [[2026-11-09-a-skills-dir-plugin-named-like-an-installed-plugin-is-not-loaded]] · A plugin folder under .claude/skills/ (with .claude-plugin/plugin.json) loads in place as <name>@skills-dir, but Claude Code compares its manifest na…
- 2026-11-09 · [[2026-11-09-bash-commands-that-name-env-are-denied]] · A Bash command that mentions .env (even the grep for the key NAME that secrets.md suggests) or contains `rm -rf` is denied by the project's permissio…
%% generated:end %%

## על הדף הזה

זה העמוד הראשי שלך בזיכרון של אולפן הווידאו: למעלה מה שנכון היום (נבנה אוטומטית מהפתקים ב-`/sync`), למטה הטבלאות החיות.
רוצה לבקש משהו, לשאול או לתקן עובדה? כתוב בשפה חופשית ב-[[owner|תיבת הדואר]]; הסוכן קורא אותה בתחילת כל סשן ועונה מתחת לכל שורה.
בצ'אט: `/sync` סוגר סשן וכותב את הזיכרון, `/recall <נושא>` שולף מה שידוע, `/consolidate` מסדר את הזיכרון פעם בשבוע, `/studio-doctor` בודק שהכול מחובר (כולל Obsidian).

## פרויקטים

![[projects.base]]

## פריטים פתוחים

![[open-items.base]]

## למידות

![[lessons.base]]

## החלטות

![[decisions.base]]

## מקורות חיצוניים

![[references.base]]

## סשנים

![[sessions.base]]

## קישורים

- [[current|המצב הנוכחי]]: מה בעבודה, הצעדים הבאים, עובדות הסביבה
- [[roadmap|מפת הדרכים של ההארנס]]: איך המערכת עצמה מתפתחת
- [[owner|תיבת הדואר שלך]]: כאן כותבים לסוכן
- [[memory/README|החוזה של הזיכרון]]: איך הכול בנוי, מי כותב מה ומתי
- [[hooks-paste-block|ה-hooks]]: הבלוק להדבקה ב-`.claude/settings.json` (רק אתה מתקין)
- המדריך ל-Obsidian: `docs/OBSIDIAN.md`
