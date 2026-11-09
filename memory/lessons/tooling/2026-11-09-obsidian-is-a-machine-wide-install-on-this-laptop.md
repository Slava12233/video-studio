---
type: lesson
created: 2026-11-09
updated: 2026-11-09
status: confirmed
maintained_by: harness
categories: [lessons, tooling]
summary: "On this laptop Obsidian 1.13.7 is installed for all users at C:/Program Files/Obsidian (winget Obsidian.Obsidian, uninstall string /allusers), not in %LOCALAPPDATA%; a winget upgrade needs admin; the per-user config still lives in %APPDATA%/obsidian."
applies_to: [obsidian, tooling, windows]
evidence: "HKLM uninstall key DisplayName Obsidian 1.13.7, DisplayIcon C:/Program Files/Obsidian/Obsidian.exe, UninstallString ... /allusers; `winget list --id Obsidian.Obsidian` 1.13.7 with 1.15.0 available (2026-11-09)"
promoted_to: 
supersedes: ""
superseded_by: ""
---

# Obsidian is a machine-wide install on this laptop

**The fact.** Obsidian 1.13.7 is installed for all users at `C:\Program Files\Obsidian\` (the installer ran with `/allusers`); the usual per-user path `%LOCALAPPDATA%\Programs\Obsidian\` does not exist. The vault registry and the CLI flag still live per user in `%APPDATA%\obsidian\obsidian.json`, next to one `<vault-id>.json` per registered vault and the Electron caches. winget lists 1.15.0 as available; upgrading a machine-wide install asks for elevation, so it is Slava's click, not the agent's.

**Evidence.** The registry uninstall key and `winget list`, 2026-11-09; `ls "$LOCALAPPDATA/Programs/Obsidian"` empty.

**How to apply.** `tools/memory/obsidian-setup.mjs` looks in `Program Files` as well as `%LOCALAPPDATA%` (the marketing harness's tool already did). Report the available upgrade to Slava; never run `winget upgrade` on it from a session (a UAC prompt hangs the call). Nothing in the vault needs a newer version: Bases (1.9+) and the CLI (1.12.7+) are both present.
