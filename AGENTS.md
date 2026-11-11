# AGENTS.md

A Lovelace card for Ecoforest ecoGEO heat pumps: the unit's internal schematic drawn as inline SVG, with live values
and pipes coloured by temperature. Planned and built with OpenSpec; `openspec/config.yaml` is the constitution and
its rules are binding. Read it, and the active change in `openspec/changes/`, before any work.

## Layout

- `openspec/`: `config.yaml` (context, rules, apply workflow), `specs/` (accepted capabilities), `changes/`
  (active changes and `archive/`).
- `src/`: the card (TypeScript, Lit 3), bundled by Vite into one `ecogeo-card.js`. `npm run build` writes to `build/`
  (git-ignored); `npm run release` checks, builds and copies the bundle to the committed `dist/ecogeo-card.js`,
  which is the file that gets deployed.
- `test/`: Vitest, two projects: `unit` (happy-dom, `*.test.ts`) and `browser` (headless Chromium through
  Playwright, `*.browser.test.ts`) for anything that depends on real layout (widths, rendered sizes, overlaps).
  `npm test` runs both. `dev/`: the emulator (`npm run dev`) with a mock `hass`.
- `scripts/check-on-edit.mjs`: the quality hook (`.claude/settings.json`), run after every edit of a TypeScript file
  under `src/`, `test/` or `dev/`. Keep it green.
- `docs/ecogeo-card.md`: the public explanation. `README.md`: features, install and configuration.
- `private/` (git-ignored): `installation.md` with everything specific to the live installation.

The first change, `add-schematic-card`, is archived in `openspec/changes/archive/2026-11-11-add-schematic-card/`;
its capabilities are the accepted specs in `openspec/specs/`. Follow-ups are named in its proposal. The second,
`refine-schematic-drawing` (detail level, component info, palette, exchanger fills, tank and source drawing), is
archived in `openspec/changes/archive/2026-11-11-refine-schematic-drawing/`.

## Rules in short

- Read-only card: no service calls, no entity writes; more-info only.
- Draw everything in SVG; cite the manual item number (1-54) behind every component and pipe.
- Entity defaults follow the esphome-ecoforest-ecogeo firmware naming (`<prefix>_<suffix>`, prefix
  `ecoforest_ecogeo`); every role can be overridden in the card config.
- Nothing installation-specific in tracked files; it goes in `private/installation.md`.
- No emoji. A no-break space between every number and its unit (NBSP in `src/strings.ts`).
- Helpers from the hrv-ventilation repo (local path in `private/installation.md`) are copied, never imported.
- The apply session orchestrates only: Sonnet subagents implement, an Opus subagent reviews, one commit per task
  group, never push (details in `openspec/config.yaml`).

## Deploy (live installation)

A private Home Assistant workspace owns the deploy script (its path and the exact deploy command are in
`private/installation.md`). Its `$Mappings` uploads `dist/` to `/config/www/custom/ecogeo-card/`. The deploy hook in
`.claude/settings.local.json` runs it after every edit, but `npm run release` writes `dist/` without an edit, so
deploy `dist/ecogeo-card.js` explicitly afterwards. Then bump the dashboard resource's `?v=` (resource id and current value in `private/installation.md`) and
hard-refresh the browser.
