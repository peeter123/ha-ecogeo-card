# Tasks

## 1. Calculations

- [x] 1.1 Bring `circuitsFor` (`src/calc/circuits.ts`) and `formatReading` (`src/calc/display.ts`) to complexity 15 or
  lower, as design D2 describes, with every helper they split into at 15 or lower too. Verify: D1's command over
  `src/calc` and `src/lib` reports nothing, the operating-mode and live-values unit tests pass unchanged, and
  `test/diagram/__snapshots__/` has no diff.
  Verdict (2026-11-26): `circuitsFor` 25 to 9 and `formatReading` 23 to 13 (new helpers `htrRecovering` 6,
  `circuitsOfMode` 11, `precisionFor` 4, `decimalsFor` 8); D1's command over `src/calc` and `src/lib` reports
  nothing, no diff in `test/`, `npm run check` passes (87 test files, 13716 tests passed, 4 expected fail).
- [x] 1.2 Point the comment in `src/calc/display.ts` that cites live-values "Locale and precision" for whole-percent
  pump speeds to "Pump speed precision". Verify: a grep finds no other `src/calc` comment citing a requirement whose
  rule moved in `tidy-specs` (see `openspec/changes/archive/2026-11-26-tidy-specs/proposal.md`), and `npm run check`
  passes.
  Verdict (2026-11-26): the comment cites "Pump speed precision" now; no other `src/calc` comment cites a split
  requirement; `npm run check` passes (87 test files, 13716 tests passed, 4 expected fail).

## 2. Drawing

- [ ] 2.1 Bring the compressor's `body` (`src/diagram/symbols.ts`), the emitter's `body` (`src/diagram/emitter.ts`),
  and `bandZonesFor`, `localPorts` and `partState` (`src/diagram/geometry.ts`) to complexity 15 or lower (design D2).
  Verify: D1's command over `src/diagram` reports nothing, and `test/diagram/__snapshots__/` has no diff.
- [ ] 2.2 Reword the doc comment of `COMPONENT_ROLES` (`src/diagram/component-info.ts`). It says a component's role is
  "the one its value label shows". It should match component-info "A component's own entity": for most components
  the role its value label shows; for evaporator 7, condenser 8 and DHW valve 26 an entity no label shows. Verify:
  `npm run check` passes, the browser tests in Chromium and WebKit included.

## 3. Editor, suggestions and card

- [ ] 3.1 Bring `_configChanged` and `willUpdate` (`src/editor/ecogeo-card-editor.ts`), `score` and
  `suggestEntities` (`src/suggest/suggest.ts`) and the card's `render` (`src/card/ecogeo-card.ts`) to complexity 15 or
  lower (design D2). Verify:
  - D1's command over `src/` reports nothing;
  - the editor, suggestion and card unit tests pass unchanged;
  - `test/diagram/__snapshots__/` has no diff;
  - `npm run check` passes.

## 4. Emulator and scripts

- [ ] 4.1 Before changing `scripts/search-places.mjs`, save the reports of `npm run search-places --
  --layout=horizontal --width=560` and `npm run search-places -- --layout=vertical --width=320` to the scratchpad.
  Then bring `searchInPage` and its page callback to complexity 15 or lower (design D2). Verify: D1's command over
  `scripts/search-places.mjs` reports nothing, and both reports are identical to the saved ones.
- [ ] 4.2 Bring `main` (`scripts/check-on-edit.mjs`), `overlapPairs` (`dev/overlaps.ts`) and `foreignValue`
  (`dev/foreign.ts`) to complexity 15 or lower (design D2). Verify:
  - D1's command over `dev/` and `scripts/` reports nothing;
  - the tests in `test/scripts/` and `test/dev/` pass unchanged;
  - an edit of a TypeScript file under `src/` and of a tracked Markdown file each gets the hook's checks, and a
    deliberate format error in the Markdown file is reported;
  - `npm run check` passes.

## 5. Review pass for dead code and duplication

- [ ] 5.1 Run `npx knip@6.45.1` (with a scratchpad config naming the entry points if it needs one) and
  `npx jscpd@5.4.3 src` once, and save both reports to the scratchpad (design D5). Confirm each finding in the code:
  a removed export or string is used nowhere, including `test/` and `dev/`, and a merged copy does the same thing
  for the same reason. Then fix the confirmed findings, with every touched function at complexity 15 or lower.
  Verify: the findings list, fixed or kept with a reason, is recorded under this task; `test/diagram/__snapshots__/`
  has no diff; and `npm run check` passes.

## 6. The limit in the lint

- [ ] 6.1 Add `complexity: ['error', { max: 15 }]` to `eslint.config.js` in one block for `src/`, `dev/`, `scripts/`
  and the root config files, not `test/` (design D4). Verify: `npm run lint` passes on the repository
  (release-packaging "The repository passes").
- [ ] 6.2 Add `test/scripts/complexity.test.ts`. It lints three fixtures through ESLint's Node API: complexity 16 under
  `scripts/` is reported and names the function, 15 under `scripts/` is not reported, and 16 under `test/` is not
  reported (design D4). Verify: it passes, and it fails when the rule is removed from `eslint.config.js` (checked
  once, then restored).
- [ ] 6.3 Document the limit in the Development section of `docs/ecogeo-card.md`. Say what ESLint holds to 15, that
  `test/` is exempt, and that `?.` and `??` count in the classic variant. Point the lanes section's citation of
  "Cabinet layout with value lanes" to schematic-drawing "Values in the lanes" where it is about where the values sit.
  Verify: `npm run check` passes, the docs tests included.

## 7. Release

- [ ] 7.1 Bump the patch version with `npm version patch --no-git-tag-version`. Add the 1.1.2 section to `CHANGELOG.md`
  (Changed: the code is held to a complexity limit and simplified, with no visible change). Run `npm run release`.
  Verify: `npm run release` and `npm run verify-dist` pass, and the version is 1.1.2 in `package.json` and both lock
  entries.

## 8. Live installation (each step needs the user's explicit go)

- [ ] 8.1 Deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource's `?v=` (id and value in
  `private/installation.md`) and record the deploy there. Verify: the resource version went up by one. A subagent's
  light screenshots at phone width and at desktop width of the schematic view show the card unchanged, with 1.1.2 in
  the console's load message.

## Workflow follow-up

- Before archive, one fresh review covers the whole change.
- At archive, sync the delta spec and name the change in `AGENTS.md`.
- Pushing, tagging `v1.1.2` and the GitHub release happen only on the user's explicit request.
