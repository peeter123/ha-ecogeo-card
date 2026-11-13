# Tasks

Each group is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Every group ends with `npm run check` green. Groups 1-5 do not run `npm run release`.

## 1. State values and units from any source

- [x] 1.1 Add the `states` option (`off`, `defrost`, defaults `['OFF']`, `['Defrost']`) with validation, and pass the
  lists to `deriveMode` (design D4).
  Verify: `npm test` covers card-config "Own off values", "Default replaced", "Invalid states" and operating-mode
  "Own defrost value"; the existing "Off", "Emergency is not off", "Defrost" and "Balance is not defrost" still pass.
- [x] 1.2 Read on/off states from any domain for binary roles, and on/off entities for the on/off, compressor mode,
  compressor speed and pump roles, with "On"/"Off" labels (design D3).
  Verify: `npm test` covers live-values "Demand as a number", "Summer from a switch", "Pump as on/off" and
  operating-mode "Off from a switch", "On from a switch", "Defrost from a binary sensor", "Pump on/off".
- [x] 1.3 Derive compressor running from speed, percentage, then power above 100 W (design D5).
  Verify: `npm test` covers operating-mode "No speed entity", "Power only", "Standby power", "Speed wins",
  "Compressor speed unavailable" and "Every input unavailable".
- [x] 1.4 Add the pressure quantity (kPa, MPa, Pa, mbar, psi to bar) and show a non-convertible unit as the entity's
  own number and unit (design D6).
  Verify: `npm test` covers live-values "Pressure in kPa", "Compressor speed in Hz", "Pump speed in rpm" and the
  NBSP between number and unit; the existing unit tests still pass. Added in review: temperature-coloring "Pump on
  without a percentage" and outer-loop-source "Fan speed in rpm" (design D6, Animation).
- [x] 1.5 Documentation: add a concise section "Using another source" to `docs/ecogeo-card.md` (what the card
  expects per kind of value, on/off entities, `states` with a short YAML example, the running fallback, the
  converted and passed-through units) and the `states` option to the README option table. Short sentences, one
  example, no repetition of the role table.
  Verify: the section and the option row exist, the example is valid config (a unit test parses it), and
  `test/readme.ts` passes.
- [x] 1.6 Emulator check: the firmware scenarios render unchanged.
  Verify: a subagent captures the heating, DHW, defrost and off scenarios and returns a verdict that they match
  the previous release.

## 2. Roles not present

- [x] 2.1 Accept `none` in `entities`: no prefix default, counted as an entity setting (no sample mode), and a set
  of roles not present in the resolved config (design D1).
  Verify: `npm test` covers card-config "Fan speed not present", "None is not a sample config" and the updated
  "Not an entity id".
- [x] 2.2 Hide the labels and footer items of roles not present, in the full and compact layouts; keep the dash
  for unknown entities (design D7); `none` mode inputs count as no value.
  Verify: `npm test` covers live-values "No pressure sensors", "No COP", "Unknown entity keeps its dash"; a browser
  test checks no label is rendered at items 37/38 with both pressure roles `none`. Added in review: operating-mode
  "Brine pump not present" and component-info "Compressor without a speed role" (design D7).
- [x] 2.3 Document `none` in the README (entities section) and in the "Using another source" section of the docs.
  Verify: `test/readme.ts` passes.

## 3. Foreign naming in the emulator

- [ ] 3.1 Add the foreign mock source with `hass.entities` and `hass.devices` for both namings, the `naming`
  control and URL key, and the captures (design D11); export the mock for tests.
  Verify: `npm test` covers the URL round trip of `naming`; a subagent captures dev-emulator "Foreign heating"
  (also at 360 px), "Foreign defrost", foreign DHW and off, and returns a verdict (mode, bar, Hz, no labels for the
  roles not present, no overlaps).
- [ ] 3.2 Note the naming control in the emulator section of the README or docs, wherever the emulator controls are
  documented.
  Verify: `test/readme.ts` passes.

## 4. Suggestion module

- [ ] 4.1 Extend the role table with `accepts` and `direction`, and add `src/config/keywords.ts` (EN, NL, ES, DE)
  (design D2).
  Verify: `npm test` asserts every role has `accepts` and keywords, and every paired probe has a direction.
- [ ] 4.2 Implement the pure suggestion function: candidates, prefix inference, fit, scoring, assignment, ties,
  report (design D8).
  Verify: `npm test` covers card-editor "Renamed device", "Foreign names", "Unit must fit", "Tie left empty" against
  the firmware and foreign fixtures (every foreign role bound as the fixture intends, or left empty where it is
  `none`), "Own choice kept", "Broken binding replaced" and each entity used once.

## 5. Editor and stub config

- [ ] 5.1 Add the device picker, the "Suggest entities" button and the report to the Entities section; pickers filter
  by `accepts`; the advanced switch opens for `entities` or `states` (design D9).
  Verify: `npm test` covers card-editor "Device not written", "Empty roles filled", "Report", "Override a role",
  "Switch not written" and "Round trip" for configs with `states` and `none`.
- [ ] 5.2 Add the "Not present" choice and the `states.off` / `states.defrost` value choices.
  Verify: `npm test` covers "Mark the fan speed", "Enum options offered" and "Default not written".
- [ ] 5.3 Add the binding check warnings.
  Verify: `npm test` covers "Unknown entity" and "Wrong unit", and that the check never fires `config-changed`.
- [ ] 5.4 Fill the stub config from a firmware-named device (design D10).
  Verify: `npm test` covers "Picker preview", "One firmware device", "Two firmware devices" and a missing `hass`.
- [ ] 5.5 Document the device picker, suggestions, report, "Not present", value choices, binding check and the
  filled stub in the README editor section and the docs.
  Verify: `test/readme.ts` passes.

## 6. Release and live installation

- [ ] 6.1 Run `npm run release`, deploy `dist/ecogeo-card.js` explicitly, bump the dashboard resource `?v=` and
  record it in `private/installation.md`.
  Verify: check-release reports both elements registered; UPLOAD with no CONFLICT; the resource reads the new `?v=`.
- [ ] 6.2 Live check of the card: the live view (prefix only) renders as before.
  Verify: an agent screenshot of the live dashboard plus a state check (mode matches the live values); the dashboard
  config is unchanged; no `ecogeo` errors in the system log.
- [ ] 6.3 Live check of the editor: the user opens the card's editor, picks the heat pump's device, presses
  "Suggest entities" and checks the report and bindings, then closes without saving; the user also adds a new card
  from the picker and checks that the stub sets the prefix (no browser tool is available to the agent).
  Verify: the user's confirmation; the dashboard config is unchanged afterwards.

## Workflow follow-up

- Before archive: one fresh Opus review of the whole change, then `/opsx:archive add-entity-discovery`.
- Follow-up candidates: detecting the source and DHW storage once the firmware exposes register 5143
  (esphome-ecoforest-ecogeo).
