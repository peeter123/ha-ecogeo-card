# Proposal

## Why

Several functions have grown large enough to be hard to read and change safely. ESLint's `complexity` rule, at a
limit of 20, reports 6 functions over it in `src/`, `dev/` and `scripts/`. At 15 it reports 17 (measured 2026-11-26),
for example `circuitsFor` at 25 and `formatReading` at 23. Nothing in the project check stops a function from
growing further. The user asked on 2026-11-26 for the code to be simplified and for cyclomatic complexity to be part
of the lint, with a limit of 15, test files exempt, and one review pass for dead code and duplication (user decision
2026-11-26).

## What Changes

- **A complexity limit in the lint.** `npm run lint` fails on any function in `src/`, `dev/`, `scripts/` or the root
  config files whose cyclomatic complexity is over 15. The rule is ESLint's built-in `complexity`, classic variant;
  in its count `?.`, `??`, `||=` and default values each add a path. `test/` is exempt. The quality hook runs ESLint
  on an edited TypeScript file, so it reports the limit too.
- **The functions over the limit refactored, with no change in behaviour.** As measured on 2026-11-26:
  - `src/calc`: `circuitsFor` (25), `formatReading` (23).
  - `src/diagram`: the compressor's `body` in `symbols.ts` (21), `bandZonesFor` (18), `localPorts` (17), `partState`
    (16), the emitter's `body` (16).
  - `src/editor`, `src/suggest`, `src/card`: `_configChanged` (19), `willUpdate` (16), `score` (18),
    `suggestEntities` (18), the card's `render` (16).
  - `dev/`: `overlapPairs` (20), `foreignValue` (17).
  - `scripts/`: `searchInPage` (39) and the page callback (37) in `search-places.mjs`, `main` (26) in
    `check-on-edit.mjs`.
  - The list to fix is whatever the rule reports when the work starts (design D1).
- **One review pass of `src/` for dead code and duplication.** Two existing tools run once through npx at pinned
  versions, without being added to `package.json` or to the check:
  - knip 6.45.1 for unused files, exports and dependencies;
  - jscpd 5.4.3 for copied blocks.
  Confirmed findings are fixed. A finding that is kept is named with its reason. No files move or get renamed.
- **Citations left by `tidy-specs`.** A few comments still cite a requirement whose rule moved. They are in
  `src/calc/display.ts` (whole-percent pump speeds) and in the doc comment of `COMPONENT_ROLES` in
  `src/diagram/component-info.ts` ("the one its value label shows"). The lanes section of `docs/ecogeo-card.md` has one
  too. Each now points to the requirement that holds the rule.
- **Release 1.1.2** (patch): the bundle changes, the card's behaviour does not.
- **Live installation:** deploy 1.1.2 and bump the dashboard resource's `?v=`, each step with the user's go.

Existing tools checked:

- **ESLint `complexity`** is used. It is built in and already in the lint, so it adds no dependency.
- **`eslint-plugin-sonarjs` `cognitive-complexity`** is not used. It would be a new dependency, and the user asked for
  cyclomatic complexity.
- **knip and jscpd** are used once, at pinned versions. They are the standard tools for unused code and for copied
  code.
- **`ts-prune`** is not used: it is deprecated in favour of knip.

## Out of scope

- Splitting `src/diagram/geometry.ts` (2458 lines) into modules, or any other file reorganisation (user decision
  2026-11-26).
- A complexity limit for `test/`.
- Any visible change: the drawing, values, editor and config stay as they are. The arrangement markup snapshots and
  the visual references stay unchanged.
- Adding knip or jscpd to `npm run check`: a later change if the review pass shows they pay off.
- Submitting the card to the HACS default list: still the later change named in `add-hacs-release`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `release-packaging`: a new requirement, the complexity limit in the project check.

## Impact

- Code: the functions listed above, in `src/`, `dev/` and `scripts/`; `eslint.config.js` (the rule).
- Tests: a unit test of the rule's scope (design D4). The arrangement snapshots, unit, browser and visual tests stay
  unchanged.
- Docs: `docs/ecogeo-card.md` (Development: the limit; the lanes citation), `CHANGELOG.md` (1.1.2), `AGENTS.md` (the
  archived change, at archive).
- Release: `package.json`, `package-lock.json` and `dist/ecogeo-card.js` at 1.1.2.
- Live installation: yes, at the end, with the user's go per step. The config needs no change.
  - Deploy `dist/ecogeo-card.js` explicitly.
  - Bump the dashboard resource's `?v=` (id and value in `private/installation.md`).
  - A subagent checks a phone-width and a desktop screenshot of the schematic view.
