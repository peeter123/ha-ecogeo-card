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

- [x] 2.1 Bring the compressor's `body` (`src/diagram/symbols.ts`), the emitter's `body` (`src/diagram/emitter.ts`),
  and `bandZonesFor`, `localPorts` and `partState` (`src/diagram/geometry.ts`) to complexity 15 or lower (design D2).
  Verify: D1's command over `src/diagram` reports nothing, and `test/diagram/__snapshots__/` has no diff.
  Verdict (2026-11-26): symbols `body` 21 to 2 (lookup table `SYMBOL_BODIES`, helpers `arrangementOf`,
    `valve3Body`, `inversionValveBody`, `exchangerBody`, `tankBody`), emitter `body` 16 to 4 (`columnsBox` 3),
    `bandZonesFor` 18 to 10 (`bandPorts`, `sourcePartsFor` 7, `tankPartsFor`), `localPorts` 17 to 1 (lookup table
    `LOCAL_PORTS`, `pair`), `partState` 16 to 7 (`hiddenByInstallation` 8, `featureState` 4); D1 command over
    `src/diagram` reports nothing, `test/diagram/__snapshots__/` has no diff.
- [x] 2.2 Reword the doc comment of `COMPONENT_ROLES` (`src/diagram/component-info.ts`). It says a component's role is
  "the one its value label shows". It should match component-info "A component's own entity": for most components
  the role its value label shows; for evaporator 7, condenser 8 and DHW valve 26 an entity no label shows. Verify:
  `npm run check` passes, the browser tests in Chromium and WebKit included.
  Verdict (2026-11-26): comment only, now matches component-info "A component's own entity"; `npm run check`
    passes: Test Files 87 passed, Tests 13716 passed and 4 expected fail, Chromium and WebKit included.

## 3. Editor, suggestions and card

- [x] 3.1 Bring `_configChanged` and `willUpdate` (`src/editor/ecogeo-card-editor.ts`), `score` and
  `suggestEntities` (`src/suggest/suggest.ts`) and the card's `render` (`src/card/ecogeo-card.ts`) to complexity 15 or
  lower (design D2). Verify:
  - D1's command over `src/` reports nothing;
  - the editor, suggestion and card unit tests pass unchanged;
  - `test/diagram/__snapshots__/` has no diff;
  - `npm run check` passes.
  Verdict (2026-11-26): `_configChanged` 19 to 14 (`pickedDevice` 3, `isEmptyStateList` 3, `decodeNotPresent` 4,
    `emptiedAfter` 1), `willUpdate` 16 to 6 (`_syncSchema` 7, `_shownData` 5), `score` 18 to 9 (`nameScore` 7,
    `directionScore` 6), `suggestEntities` 18 to 1 (`openRoles` 5, `rankedPairs` 1, `takePairs` 9, `entitiesWith`
    6), the card's `render` 16 to 12 (`statesFor` 4, `tapFor` 2; `readings` 4 to 1); D1's command over `src/`
    reports nothing, `test/` and `test/diagram/__snapshots__/` have no diff, and `npm run check` passes: Test Files
    87 passed, Tests 13716 passed and 4 expected fail, Chromium and WebKit included.

## 4. Emulator and scripts

- [x] 4.1 Before changing `scripts/search-places.mjs`, save the reports of `npm run search-places --
  --layout=horizontal --width=560` and `npm run search-places -- --layout=vertical --width=320` to the scratchpad.
  Then bring `searchInPage` and its page callback to complexity 15 or lower (design D2). Verify: D1's command over
  `scripts/search-places.mjs` reports nothing, and both reports are identical to the saved ones.
  Verdict (2026-11-26): `searchInPage` 39 to 8 and its page callback (`homeHits`) 37 to 4; the helpers, all nested in
    `searchInPage` because `page.evaluate` serialises only that function: `rebased` 1, `leftOf` 3, `within` 4,
    `crossesCabinet` 3, `meets` 2, `homeBoxOf` 5, `partHits` 1 (its filter 5), `pipeHits` 2, `labelHits` 10,
    `boundsHits` 9, `isPlace` 8, `freeBits` 8, `searchLabel` 7 (`obstacles` 8 and `shiftOf` 4 were already
    separate). D1's command over `scripts/search-places.mjs` reports nothing. Both reports are byte-identical to
    the saved ones (no timings or timestamps in them): `--layout=horizontal --width=560` and
    `--layout=vertical --width=320`.
- [x] 4.2 Bring `main` (`scripts/check-on-edit.mjs`), `overlapPairs` (`dev/overlaps.ts`) and `foreignValue`
  (`dev/foreign.ts`) to complexity 15 or lower (design D2). Verify:
  - D1's command over `dev/` and `scripts/` reports nothing;
  - the tests in `test/scripts/` and `test/dev/` pass unchanged;
  - an edit of a TypeScript file under `src/` and of a tracked Markdown file each gets the hook's checks, and a
    deliberate format error in the Markdown file is reported;
  - `npm run check` passes.
  Verdict (2026-11-26): `main` 26 to 11 (`readPayload` 4, `checkNonCode` 11, `checkTypeScript` 5), `overlapPairs` 20 to
    1 (`pipePairs` 6, `edgePairs` 2 and `cabinetPairs` 2 with filters at 4 and 5, `labelPairs` 14), `foreignValue` 17
    to 8 (`whenNumeric` 3,
    `foreignOnOff` 3, `foreignMode` 5). D1's command over `dev/` and `scripts/` reports nothing, and `test/scripts` and
    `test/dev` pass unchanged (6 files, 85 tests). The hook, run by hand: a TypeScript file under `src/` gets Prettier,
    ESLint, tsc and Vitest (a deliberate type error and an unused variable were reported, exit 2), a tracked Markdown
    file gets the format check (a deliberate error was reported, exit 2), a clean file exits 0, a bad payload exits 1,
    and the test edits are undone. `npm run check` passes (87 test files, 13716 tests passed, 4 expected fail).

## 5. Review pass for dead code and duplication

- [x] 5.1 Run `npx knip@6.45.1` (with a scratchpad config naming the entry points if it needs one) and
  `npx jscpd@5.4.3 src` once, and save both reports to the scratchpad (design D5). Confirm each finding in the code:
  a removed export or string is used nowhere, including `test/` and `dev/`, and a merged copy does the same thing
  for the same reason. Then fix the confirmed findings, with every touched function at complexity 15 or lower.
  Verify: the findings list, fixed or kept with a reason, is recorded under this task; `test/diagram/__snapshots__/`
  has no diff; and `npm run check` passes.
  Verdict (2026-11-26): knip 6.45.1 reported 39 findings (28 unused exports, 11 unused exported types) and one
    unlisted binary; jscpd 5.4.3 reported 0 clones (43 files, 8755 lines). Of the 39, fixed 34 and kept 5; no unused
    file, string or dependency.
  - knip, 32 exports that only their own file uses: fixed by dropping the `export` keyword (`compressorRuns`,
    `RUNNING_POWER`, `isLeftOut`, `NONE`, `STATES_KEYS`, `MIN_STOPS`, `MAX_STOPS`, `COMPRESSOR_ROLES`, `airUnitShape`,
    `collectorShape`, `emitterShape`, `STUB_LENGTH`, `VERTICAL_MAP_X`, `VERTICAL_MAP_Y_TANK50`, `effectiveFeature`,
    `LABEL_LINE_PX`, `VIEWBOX_WIDTH`, `FLOW_SECONDS_AT_FULL`, `PRODUCTION_LEGS_27_TO_8`, `carriesHtrWater`,
    `htrWaterActive`, `withTrailingEmptyRow`, `SCORE`, `fold`, `fits`, `score`, `Reading`, `RoleKind`, `TankShape`,
    `ExternalCoil`, `Crossing`, `SuggestReport`); none is dead code, no file in `src/`, `test/`, `dev/` or `scripts/`
    imports them, and the markup is unchanged.
  - knip, `CIRCUIT_IDS`: kept exported; it is only used as a type in its own file, so a plain `const` would fail
    the lint (`no-unused-vars`).
  - knip, `defaultLabelPlaces`: kept; `scripts/search-places.mjs` calls it by name through `geometry[...]`.
  - knip, `Placement` (labels.ts): fixed; nothing imports it from `labels.ts`, so it leaves the re-export.
  - knip, `RolePath` (lib/config.ts): fixed; the re-export is not copied text and no copied function uses it, so it
    goes, and the copy header names the deviation from hrv-ventilation.
  - knip, `ColorOption`, `BooleanOption`, `ListOption` (lib/options.ts): kept; hrv-ventilation's `src/lib/options.ts`
    exports and uses them, so the copy keeps the source's text, and an export creates no dependency between the repos.
  - knip, unlisted binary `uvx` in `scripts/lint-ha.mjs`: kept; uv is an external prerequisite of `npm run lint:ha`.
  - jscpd: 0 clones, nothing to merge. Smaller duplicates below its default threshold (a plain-object guard in
    `config/options.ts`, `diagram/colors.ts` and `editor/schema.ts`) are left (design D5).
  - `src/strings.ts`: every key and export is referenced; no dynamic lookup.
  - Reports: `scratchpad/review-pass/knip.txt` and `jscpd.txt` (knip config `knip.json` there, not committed).

## 6. The limit in the lint

- [x] 6.1 Add `complexity: ['error', { max: 15 }]` to `eslint.config.js` in one block for `src/`, `dev/`, `scripts/`
  and the root config files, not `test/` (design D4). Verify: `npm run lint` passes on the repository
  (release-packaging "The repository passes").
  Verdict (2026-11-26): one block in `eslint.config.js` (src, dev, scripts and root config files, not test) before
    `prettier`; `npm run lint` passes with no complexity finding.
- [x] 6.2 Add `test/scripts/complexity.test.ts`. It lints three fixtures through ESLint's Node API: complexity 16 under
  `scripts/` is reported and names the function, 15 under `src/` is not reported, and 16 under `test/` is not
  reported (design D4). Verify: it passes, and it fails when the rule is removed from `eslint.config.js` (checked
  once, then restored).
  Verdict (2026-11-26): `test/scripts/complexity.test.ts` (3 tests: 16 under `scripts/` reported with file and
    function, 15 under `src/` and 16 under `test/` with a clean result) passes; with the rule removed the "16 under
    scripts/" test fails; the rule is restored.
- [x] 6.3 Document the limit in the Development section of `docs/ecogeo-card.md`. Say what ESLint holds to 15, that
  `test/` is exempt, and that `?.` and `??` count in the classic variant. Point the lanes section's citation of
  "Cabinet layout with value lanes" to schematic-drawing "Values in the lanes" where it is about where the values sit.
  Verify: `npm run check` passes, the docs tests included.
  Verdict (2026-11-26): the Development section states the limit, the test/ exemption and what counts a path; the lanes
    section also cites "Values in the lanes"; `npm run check` passes (88 test files, 13719 tests passed,
    4 expected fail).

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
