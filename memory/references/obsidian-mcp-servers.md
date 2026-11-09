---
type: reference
created: 2026-11-09
updated: 2026-11-09
status: active
maintained_by: harness
categories: [references, memory-systems, obsidian]
summary: "Obsidian MCP servers compared 2026-11-09: bitbonsai/mcpvault (MIT, Node 22, file-based, no plugin, best fit if one is ever wanted), cyanheads/obsidian-mcp-server (Apache-2.0, needs the Local REST API plugin), MarkusPfundstein/mcp-obsidian (MIT, Python, REST plugin), StevenStavrakis/obsidian-mcp (MIT, Node), iansinnott/obsidian-claude-code-mcp (stale since 2025-06); none adopted."
url: https://github.com/bitbonsai/mcpvault
license: MIT (mcpvault)
checked: 2026-11-09
verdict: reference-only
---

# Obsidian MCP servers

**What it is.** Five servers that expose a vault to an MCP client: `bitbonsai/mcpvault` (1,720 stars, MIT, Node 22.12+, `npx @bitbonsai/mcpvault@latest <vault>`, works with Obsidian closed, pushed 2026-11-09), `cyanheads/obsidian-mcp-server` (702 stars, Apache-2.0, Bun or Node 24, needs Obsidian open with the Local REST API plugin and an API key, pushed 2026-10-31), `MarkusPfundstein/mcp-obsidian` (4,526 stars, MIT, Python + `uvx`, REST plugin, pushed 2026-08-31), `StevenStavrakis/obsidian-mcp` (750 stars, MIT, Node 22+, filesystem, pushed 2026-10-08), `iansinnott/obsidian-claude-code-mcp` (359 stars, 0BSD, an Obsidian plugin with a WebSocket MCP server, last push 2025-06-27). `smithery-ai/mcp-obsidian` returned 404.

**Why it matters here.** Claude Code already reads and writes the vault's Markdown directly, and the official CLI covers search, backlinks and moves; an MCP would add a process and a settings change for little.

**What we took, or why not.** None adopted. If Slava ever wants semantic search or a server for another client, `mcpvault` is the one to evaluate first (Node, no plugin, no app needed); the REST-plugin ones need Obsidian running; the plugin one is stale.
