# Design

## Context

hrv-ventilation (local path in `private/installation.md`) has a visual editor in `src/editor/`:
`hrv-card-editor.ts` (an "Advanced settings" `ha-form` switch above the fields `ha-form`), `schema.ts`
(`EditorSchema`, `visibleSchema`, `withShownDefaults`/`withoutShownDefaults`, `clearedPaths`,
`withoutUndefined`, `withoutBlankTexts`, `hasAdvancedValue`) and `fields.ts` (field builders), tested in
`test/editor/` with a stand-in `ha-form` element. This card's config is resolved by `src/config/options.ts`,
`roles.ts` and `resolve.ts`; options have defaults there. See proposal.md for the motivation.

## Goals / Non-Goals

**Goals:**
- Reuse hrv's proven editor mechanics by copy, adapted to this card's options and role table.
- One source of truth: the editor's fields are generated from the option table and the role table, so a new role
  or option cannot be forgotten.

**Non-Goals:**
- Device-based entity discovery (`add-entity-discovery`).
- Live preview logic of its own (Home Assistant previews the card from `config-changed`).

## Decisions

### D1. Copied files
| This card | Copied from (hrv-ventilation) | Deviation |
|---|---|---|
| `src/editor/ecogeo-card-editor.ts` | `src/editor/hrv-card-editor.ts` | tag name, strings, shows the card's config error above the form |
| `src/editor/schema.ts` | `src/editor/schema.ts` | unchanged apart from types (`hasAdvancedValue` kept unused; the switch follows `entities`, D5) |
| `src/editor/fields.ts` | `src/editor/fields.ts` | only the builders this card needs: choice, entity, color (plus `numberField`, kept unused) |
| `test/editor/*` | `test/editor/hrv-card-editor.test.ts`, `schema.test.ts`, `fixtures.ts`, `no-form.test.ts` | this card's schema |
Each file starts with a header naming its source and deviations. No import or path reference to hrv.

### D2. Schema generated from the tables
- Unit, prefix, appearance fields come from `src/config/options.ts` (allowed values become select options with
  labels from `src/strings.ts`).
- Feature fields are selects with `true`, `false`, `unused` and an empty choice labelled with the variant's
  default for the current variant ("Variant default: on").
- Advanced: one `expandable` section per role group, one `entity` selector per role with
  `{ entity: { domain: <role domain> } }`, labelled from a role-name table in `src/strings.ts`. A unit test asserts
  every role in `roles.ts` has a picker and a label.
- `ha-form` selects return strings, so a field whose config value is not a string (feature booleans, the numeric
  variant) is a "coded" field: `toFormData`/`fromFormData` convert between the config value and the select value.
  Features use the select values `default`, `true`, `false`, `unused`; `default` removes the key. The variant is a
  select of the allowed variants written back as a number (not a free number box).
- The schema depends on the config (model-dependent DHW default, variant-dependent feature labels), so the editor
  builds it per config and replaces it only when it actually changes, keeping open sections open.
- The prefix section's name is `entity_prefix` (label "Entities"), so it cannot collide with the `entities`
  pickers. An empty prefix removes the key.
- Variant select labels come from `src/strings.ts` ("Variant 1" ... "Variant 4"). The DHW select offers only the
  storages the current model allows; a config whose current value is not allowed still shows it (and the card's
  error above the form).
- Field order follows the proposal: passive cooling, active cooling, HTR, backup heater. A changed key keeps its
  position in `features`, so the YAML is not reordered.
- Values the editor cannot represent (an invalid `features`, `prefix: ''`, `features:` with no value) are
  normalised on the first edit; the card's error is shown above the form beforehand. Round trip is guaranteed for
  valid configs.
- A test asserts that every option in the option table has an editor field, apart from an explicit list of Home
  Assistant keys and the group-2 keys handled elsewhere.
- `getStubConfig()` returns `{}` (no prefix, no entities), which renders the sample-value preview; the card had no
  `getStubConfig()` before this change.

### D3. Minimal writes
hrv's `withShownDefaults` fills the form with defaults; `withoutShownDefaults` strips them again on change, and
`clearedPaths` removes cleared keys (ha-form reports `undefined` at the path). Unknown top-level keys
(`grid_options`, `view_layout`, ...) pass through untouched. Empty `features`/`entities` objects are pruned.
The round-trip test opens each emulator scenario's config and a config with every option set.

### D4. Colour stop rows
`ha-form` has no list-of-objects selector, so the schema is built from the current config: rows
`colors_<i>_temperature` (number selector, °C) and `colors_<i>_color` (color selector, hex), one per stop plus one
empty row. On change, rows are folded back into `colors` (sorted, empty rows dropped); equal to `DEFAULT_STOPS`
-> key removed. Validation reuses `src/config/options.ts`; its error message is shown above the form.
- The row logic lives in `src/editor/color-rows.ts` (not `schema.ts`, which stays generic). The colour selector is
  HA's `color_rgb`; `fields.ts` converts `[r, g, b]` to and from hex.
- With no `colors`, the rows show `DEFAULT_STOPS`. A row with a temperature but no colour yet is written with a
  neutral grey (`#9e9e9e`). Colours the selector cannot show (names, `var()`) show an empty field and keep their
  text while the row's colour is unchanged; hex is kept as written unless the picked colour differs. Rows equal to
  the config's current list leave `colors` untouched, so round trips are exact.
- Home Assistant's number selector reports every keystroke, so the rows are an editor-local draft: they keep the
  order typed and stay in place (a row whose temperature is cleared stays visible with its colour). Only the list
  written to `colors` is sorted and filtered. The draft is rebuilt from the config when the editor opens or when
  `colors` arrives from outside (differs from the last list the editor fired). This amends "folded back on every
  change" above: the fold happens on every change, the rows are not re-laid out from it.
- HA's colour selector is a native colour input, which shows black when it has no value. The empty row's colour
  therefore starts at the neutral grey; rows whose colour is a name or `var()` show black in the picker (documented
  in the README and docs) and keep their text until a colour is picked.
- A non-array `colors` (e.g. `colors:` with no value) is kept when the rows still equal the defaults.
- A list the card rejects is still written; the card's error shows above the form. One empty row is shown even at
  8 stops.

### D5. Advanced switch state
As in hrv: the switch is a separate `ha-form` with editor-local state; it starts on when the config has any
`entities` key. Turning it off hides the pickers but does not remove overrides. Unlike hrv the switch is not
locked on by overrides; it turns on again only when `entities` arrives from outside while it is off.
- `ha-form` nests a section's data under its name, so the pickers sit in an `entities` expandable that wraps one
  expandable per role group (`entities.<group>.<role>`); the live check (task 3.3) confirms Home Assistant renders
  nested expandables. An emptied `entities.<group>` is pruned like an emptied `entities`.
- Picker labels are looked up by the role's leaf name, so roles sharing a leaf name across groups (`pressure`,
  `pump`, `setpoint`, ...) share one label; the group section's title disambiguates.

### D6. Unused DHW storage
Found in the live check: model C always has its integrated tank, so `dhw: none` there was wrong, and it also
removed HTR (the drawing counts HTR as `false` without DHW storage, `effectiveFeature` in
`src/diagram/geometry.ts`). Decided by the user: a new `dhw` value `unused`, like a feature's `unused`.
- Config: `DHW_STORAGES` gains `unused`. Valid on B and C; `none` on C is a mismatch error like `internal` on B.
  Defaults are unchanged (B external, C internal). The live installation (B, external) is unaffected.
- Drawing: `unused` draws what the model's tank storage draws (B: external tank, connections 5/6, valve 26; C:
  tank 50, coil 51 and the stubs 47-49), every DHW part in the muted style and never animated; the tank body takes
  the muted colour and shows no values (full and compact layout). The `dhw` visibility rules treat `unused` as the
  model's storage for drawing, and as `none` for activity.
- HTR: `effectiveFeature` forces HTR off only for `none`; with `unused` HTR follows its feature. The HTR circuit and
  the DHW coil are active only with `external` or `internal` (calc/circuits.ts).
- Mode: the `dhw` mode is still derived and labelled; valve 26 follows the mode as with `none`.
- Editor: the DHW select offers B: external, unused, none; C: internal, unused (plus a disallowed current value,
  as before). Strings in `src/strings.ts`.
- Emulator: the DHW storage control offers `unused` (with `none` only on B, as the card rejects it on C).
- Docs: README option table and `docs/ecogeo-card.md` describe `unused` and the model C rule.
- Settled during implementation: the drawing context carries the model (`DrawContext.model`, required), since
  `unused` draws the model's tank. The "DHW tank" and "DHW" captions stay (only values are left out), and the
  tank stays a more-info target for the DHW temperature. The emulator disables the DHW choices the card would
  reject; a rejected value in the URL falls back to the default.
- Settled in review: the unused tank's outline and rim are muted too (not only its fill), so it does not read as a
  tank in use with an unavailable temperature. Valve 26 is the DHW diverter on both models and is muted with an
  unused tank on B and on C. In the compact layout an unused tank leaves six key values instead of seven; the
  live-values delta covers this, no responsive-layout delta.

## Risks / Trade-offs

- [Home Assistant's `ha-form` behaves differently from the stub] -> the stub follows hrv's, which matched HA; a
  live check opens the real editor once (task 3.3).
- [Fifty pickers are slow to render] -> they live in collapsed sections behind the switch; `ha-form` renders
  expandables lazily.
- [Colour selector returns RGB arrays rather than hex] -> the fields builder converts to and from hex; unit-tested.

## Migration Plan

No config change: existing YAML opens in the editor. Release, deploy, bump `?v=`. Rollback: revert, redeploy,
bump.
