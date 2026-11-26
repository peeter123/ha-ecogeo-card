# Tasks

## 1. README status and the split check

- [x] 1.1 In the Status section of `README.md`, remove the sentence that names `add-browser-tests` as the planned
  follow-up, and say instead that the next step is submitting the card to the HACS default list (proposal, README
  status). Keep the rest of the section as it is. Verify: `grep -n add-browser-tests README.md` finds nothing, and
  `npm run check` passes (the README tests and the Markdown format check included).
- [x] 1.2 Check the delta specs in `openspec/changes/tidy-specs/specs/` against the accepted specs (design D2, D4).
  For each of the 16 split requirements, every statement of the old description is in exactly one resulting
  requirement, in its description or a scenario. Every MODIFIED block keeps its exact header and all its scenarios
  unchanged. Every description is 500 characters or fewer. "Tap a component" and its added requirement match
  `COMPONENT_ROLES` and `componentRole` in `src/diagram/component-info.ts` (design D3). Verify:
  `npx openspec validate tidy-specs --strict` passes, and a verdict line per capability is recorded under this task.
  Verdict (2026-11-26): card-config: 2 split (5 blocks), nothing dropped, scenarios unchanged, longest description 355
    characters.
  Verdict (2026-11-26): card-editor: 1 split, nothing dropped, scenarios unchanged, longest description 409 characters.
  Verdict (2026-11-26): component-info: 2 split; "Tap a component" and "A component's own entity" match COMPONENT_ROLES
    (7, 8, 11, 15, 26, 33) and componentRole (compressor 11 fallback), longest 453 characters.
  Verdict (2026-11-26): dev-emulator: 2 split, nothing dropped, scenarios unchanged, longest description 400 characters.
  Verdict (2026-11-26): live-values: 1 split into 4 behaviours, nothing dropped, scenarios unchanged, longest
    description 263 characters.
  Verdict (2026-11-26): operating-mode: 1 split, nothing dropped, scenarios unchanged, longest description 428
    characters.
  Verdict (2026-11-26): responsive-layout: 2 split, nothing dropped (the measurement conditions moved out of "Vertical
    threshold"), scenarios unchanged, longest 353 characters.
  Verdict (2026-11-26): schematic-drawing: 3 split, nothing dropped, scenarios unchanged, longest description 446
    characters.
  Verdict (2026-11-26): temperature-coloring: 2 split, nothing dropped, scenarios unchanged, longest description 373
    characters.
- [x] 1.3 Point the test comments that cite a requirement whose rule moved to the requirement that now holds it:
  `test/diagram/labels.test.ts` (whole-percent pump speeds: live-values "Pump speed precision"),
  `test/diagram/lanes.test.ts` (schematic-drawing "Values in the lanes"), `test/dev/foreign.test.ts` (dev-emulator
  "Foreign naming leaves optional roles unbound") and `test/card/overlaps.browser.test.ts` (responsive-layout
  "Vertical threshold" and, where it cites the measurement, "Threshold measurement conditions"), and
  `test/lib/panel.test.ts` (the 320 px floor: responsive-layout "Narrowest drawing in a panel view"). Comments only; no
  test code changes. Verify: `npm run check` passes and `git diff --stat test/` shows comment lines only.

## Workflow follow-up

- Before archive, one fresh review covers the whole change.
- At archive, sync the delta specs, then confirm `npx openspec validate --specs --strict` passes for all 13 specs.
- Name the change in the archived-changes paragraph of `AGENTS.md`.
- No version bump, release, deploy or resource bump: the shipped card does not change.
