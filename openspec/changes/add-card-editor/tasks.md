# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green. Groups 1-2 do not run `npm run release`.

Before group 1: `refine-schematic-drawing` and `add-compact-layout` must be archived, so the Appearance fields can
expose `detail`, `exchanger_fill` and `layout`.

## 1. Editor element and main sections

- [x] 1.1 Copy hrv-ventilation's editor element, schema helpers and field builders into `src/editor/` with their
  tests and a stand-in `ha-form` (design D1, headers naming sources and deviations).
  Verify: `npm test` (the copied schema and editor tests, adapted).
- [x] 1.2 Build the Unit, Entities, Features and Appearance sections from the option table (design D2), wire
  `getConfigElement()` and keep `getStubConfig()`'s sample preview; editor strings in `src/strings.ts`.
  Verify: `npm test` covers card-editor "Editor element", "Picker preview", "Existing config opens", "Clear the
  variant", "Unshown keys kept", "Round trip" (every emulator scenario config and an all-options config) and "No
  service calls".
- [x] 1.3 Document the editor in the README (how to open it, its sections) and in `docs/ecogeo-card.md`.
  Verify: the sections exist and `test/readme.ts` passes.

## 2. Advanced pickers and colour rows

- [x] 2.1 Add the advanced switch and one entity picker per role in grouped expandables, filtered by domain
  (design D2, D5); labels for every role in `src/strings.ts`.
  Verify: `npm test` covers "Override a role", "Switch not written", the switch on for a config with `entities`,
  and every role in `roles.ts` having a picker and a label.
- [x] 2.2 Add the colour stop rows (design D4).
  Verify: `npm test` covers "Add a stop", "Back to default", sorting, dropping an empty row, hex conversion, and the
  error message for a list of one stop.
- [x] 2.3 Document the advanced pickers and colour rows in the README and docs.
  Verify: the sections exist and `test/readme.ts` passes.

Visual verification of the editor: the dev emulator has no editor, so the live check in 3.3 is the editor's
visual verification (groups 1-2 change nothing in the card's rendering).

## 3. Release and live installation

- [ ] 3.1 Run `npm run release`.
  Verify: check-release reports `custom:ecogeo-card` registered.
- [ ] 3.2 Deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource `?v=` and record it in
  `private/installation.md`.
  Verify: UPLOAD with no CONFLICT; the resource reads the new `?v=`.
- [ ] 3.3 Live verification: with a browser tool, an agent opens the schematic view's card in Home Assistant's
  editor, screenshots the visual editor (main sections, then advanced on), and closes it without saving; it then
  confirms through the dashboard config that the view is unchanged. If no browser tool is available, the
  orchestrator asks the user to open the editor and confirm. Check the HA logs for errors mentioning `ecogeo`.
  Verify: verdict with the editor showing the live config's values, no config change and no log errors.

## Workflow follow-up

- Before archive: one fresh Opus review of the whole change, then `/opsx:archive add-card-editor`.
- Next candidate: `add-entity-discovery` (stub; plan it with `/opsx:explore` or `/opsx:propose` first).
