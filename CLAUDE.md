# CLAUDE.md

@AGENTS.md

## Claude Code specifics

- The OpenSpec skills are in `.claude/skills/` (a copy of `.agents/skills/`); start sessions in this folder so they
  and the hooks load.
- The quality hook (`.claude/settings.json`) and the deploy hook (`.claude/settings.local.json`) run after every
  Edit/Write; act on their output.
- Home Assistant MCP tools (`mcp__home-assistant__ha_*`) are deferred: load them with ToolSearch before calling.
