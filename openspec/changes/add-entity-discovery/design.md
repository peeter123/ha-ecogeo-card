# Design

## Context

The role table (`src/config/roles.ts`) gives every role its domain, firmware suffix, kind, quantity, unit and manual
item. `resolveEntities` (`src/config/resolve.ts`) maps the config to one entity id per role: an override, else
`<domain>.<prefix>_<suffix>`, else nothing. `readRoles` (`src/calc/readings.ts`) turns states into typed values:
numbers converted by quantity (temperature, difference, power in `src/lib/units.ts`), text trimmed, binary only
`on`/`off`. `deriveMode` (`src/calc/mode.ts`) compares text with the firmware's `off` and `defrost` and treats
`compressor.speed` as the only running signal. The editor (`src/editor/`) is built from `ha-form` with an advanced
switch and one picker per role. `getStubConfig()` returns `{}`. See proposal.md for the motivation.

Home Assistant gives the frontend `hass.states` (state, unit, `device_class`, `friendly_name`, `options` for enum
sensors), `hass.entities` (registry display entries: `entity_id`, `device_id`, `platform`, `name`) and
`hass.devices` (`name`, `name_by_user`). The card already declares `entities` loosely in `src/lib/hass.ts`.

## Goals / Non-Goals

**Goals:**
- The card stays a pure function of its config and `hass.states`; all matching happens once, in the editor.
- Every default reproduces today's behaviour, so the live config (prefix only) renders unchanged.
- One source of truth: suggestions, pickers, checks and value reading all use the role table.

**Non-Goals:**
- Reading the device or the registry at render time.
- Detecting model, variant, source or DHW storage (proposal, Out of scope).

## Decisions

### D1. Resolution stays config-only
Order per role: an `entities` value (an entity id, or `none` meaning no entity), else the prefix default, else
nothing. `ResolvedConfig.entities` keeps `undefined` for "no entity" and gains a set of roles that are not present,
so labels can tell "hidden" (`none`) from "dash" (unknown or unavailable). The re-render check (live-values,
"Efficient updates") is unchanged: `none` roles have no entity to watch.
Alternative: resolve from the device at render time. Rejected: the card would depend on the registry, could change
while open, and could not be tested from a config alone.

### D2. The role table grows
Each role gains:
- `accepts`: the domains its picker and the suggestions allow. Number roles: `sensor`, `number`, `input_number`;
  the compressor speed and pump roles also `binary_sensor`, `switch`, `input_boolean`. Binary roles: `binary_sensor`,
  `switch`, `input_boolean`, `sensor`. Text roles: `sensor`, `select`, `input_select`, `binary_sensor`, `switch`,
  `input_boolean`.
- `direction` (`in` or `out`) for the paired probes (31/32, 33/34, 29/30, 35/36).
- `keywords`: per language (EN, NL, ES, DE) the subject words (for example brine: `brine`, `glycol`, `source`,
  `bron`, `brijn`, `captacion`, `sole`) and role words (`pressure`, `druk`, `presion`, `druck`). Kept in its own
  file, `src/config/keywords.ts`, so the table stays readable; a test asserts every role has keywords.
- The direction words (`in`, `inlet`, `return`, `retour`, `entrada`, `ruecklauf` against `out`, `outlet`,
  `supply`, `aanvoer`, `salida`, `vorlauf`) are shared, not per role.

### D3. Reading on/off shapes (readings.ts)
- Binary roles: `on`, `true`, `yes`, `1` are on; `off`, `false`, `no`, `0` are off; lower case after trimming;
  any domain. Everything else is no value.
- An "on/off entity" is one whose domain is `binary_sensor`, `switch` or `input_boolean`. Text roles bound to one
  give a boolean instead of a text: `unit.on_off` on means running, `compressor.mode` on means defrost. The speed
  and pump roles bound to one give a boolean, shown as "On" or "Off" (strings in `src/strings.ts`).
- A sensor reading `1` on a text role stays text (`1`), so `states.defrost: ['4']` can match a numeric code.
Alternative: detect on/off from the state value. Rejected for text roles: `0` can be a real mode code.
Inputs behind the derived states (operating-mode): `unit.on_off`, `compressor.mode`, `compressor.speed`,
`compressor.percentage`, `compressor.power`, `dhw.demand`, `unit.summer`, `production.pump`, `brine.pump`,
`heating.capacity`.

### D4. `states`
`states.off` and `states.defrost`, lists of texts, defaults `['OFF']` and `['Defrost']` (firmware-entity). A set
list replaces the default; matching is case-insensitive after trimming. `deriveMode` receives the lists as an
input, so it stays pure. Validated in `src/config/options.ts` like the other options.
Alternative: per-role objects (`entities.compressor.mode: { entity, defrost }`). Rejected in exploration: two forms
for one key in YAML and editor.

### D5. Compressor running
`compressorRuns` takes the first role with a value among `compressor.speed` (above 0, or on),
`compressor.percentage` (above 0) and `compressor.power` (above 100 W). The 100 W threshold covers the standby
draw of the electronics and a crankcase heater; a running compressor draws far more (derived). If none has a value,
running is unknown and the mode is `standby` (as today with an unknown speed). Pumps run above 0 or when on.

### D6. Units
- New quantity `pressure` (bar): kPa ÷ 100, MPa × 10, Pa ÷ 100000, mbar ÷ 1000, psi × 0.0689476. The pressure
  roles get it, so suggestions and checks can use it.
- A number role whose entity unit is not the role's unit and not convertible to it is shown with the entity's own
  number and unit (normalised spelling kept as Home Assistant reports it), decimals from the entity's display
  precision, or else the number as the state reports it (no padding: `2400` stays "2400 rpm"). A role without a
  quantity that matches its unit (for example `%` on a pump) shows as today.
- Exception: temperature, temperature difference and power roles in a unit the card cannot convert have no value,
  as today, because they feed the colouring and the mode (the 100 W threshold). Every other number role, pressure
  included, passes through; a pressure entity without a unit keeps its number, as today.
- `states` values are texts; a numeric code is quoted in YAML (`defrost: ['4']`).
- Animation: a pump that runs without a percentage (on, or a speed above 0 in another unit such as rpm) animates
  its segments at the fixed medium speed HTR already uses; a fan speed above 0 in another unit rotates the fan at a
  fixed medium speed (temperature-coloring "Flow animation", outer-loop-source "Air unit").
- `unit.connection` reads on/off like every binary role, so `0`, `false` and `no` show the card offline.
- Unit fit (for the editor check and suggestions): the role's convertible units; for the compressor speed rpm or Hz;
  for pumps and the fan % or rpm; for the COP no unit. Colouring only uses temperatures, which are always
  converted or no value.

### D7. Hidden roles
Labels and footer items look up whether their role is not present (D1) and render nothing. Components stay drawn
(their presence follows `features`, `source` and `dhw`). In the compact layout the same rule holds. An item fed
by two roles (the footer's season item: `unit.summer`, `unit.winter`) is hidden only when both are `none`; otherwise
the present role drives it; a lone season role that reads off shows a dash (both flags off is a real firmware state).
- Pumps: a brine pump set to `none` does not gate the brine circuit (operating-mode "Circuits limited by pumps and
  feature states"). A production pump set to `none` counts as not running, so passive cooling is never shown without
  it: without the pump the card cannot tell passive cooling from standby. Documented in "Using another source".
- Compressor 11 taps the first present of speed, percentage, power (component-info "Tap a component").

### D8. Suggestion module (`src/suggest/`)
A pure function: input `hass.states`, `hass.entities`, `hass.devices`, the device id and the current config; output
the new `entities` values and a report (filled roles, empty roles). Steps:
1. Candidates: registry entries with that `device_id` whose state exists.
2. Prefix: the longest common start of the candidates' object ids, cut after the last `_`.
3. Fit: domain in the role's `accepts`, unit fits (D6), `device_class` compatible when both are set.
4. Score per (role, candidate): exact firmware id 100; object id ending in `_<suffix>` 90; else keywords: tokens of
   the object id (after the prefix) and of the friendly name (without the device name), lower case, accents
   removed, split on non-letters; subject word hit 30, role word hit 20, direction match 10. An opposite direction
   word excludes the candidate. Below 40 is weak.
5. Assignment: all (role, candidate) pairs by score, highest first; a pair is taken when its role is still open
   and its entity unused. A role whose two best candidates score within 5 of each other is left empty (tie).
6. Only roles that are empty or bound to an unknown entity take part (card-editor).
The numbers are tuned against the two fixtures (firmware, foreign) and fixed by tests.

### D9. Editor parts
- Device picker: an `ha-form` field with the `device` selector, no integration filter (KNX, Modbus). Editor state
  only, like the advanced switch.
- "Suggest entities": a native `<button>` styled with Home Assistant's theme variables (not a Home Assistant element,
  so the "only `ha-form`" rule holds). After use it turns the advanced switch on.
- Report and binding warnings: a plain list below the form, strings in `src/strings.ts`.
- "Not present": a `select` selector with `multiple: true` over the role labels.
- `states.off` / `states.defrost`: `select` selectors with `multiple: true` and `custom_value: true`; options are the
  bound entity's `attributes.options` when present, plus the default.
- Pickers filter by `accepts` (D2) instead of a single domain.

### D10. Stub config
`getStubConfig(hass)` runs D8's step 1-2 over every device and counts exact firmware ids. Exactly one device with at
least half of the roles found gives `{ prefix }`; otherwise `{}`. Home Assistant's frontend passes `hass` as the
first argument, but the developer docs do not document it, so a missing `hass` gives `{}`.

### D11. Foreign naming in the emulator
`dev/` gets a second mock source: entity ids like `sensor.wp_<n>`, Dutch friendly names, kPa, Hz, an enum
compressor mode (`Uit`, `Verwarmen`, `Tapwater`, `Ontdooien`) with `states`, a switch for on/off, the fan speed,
COP and DG1 setpoint as `none`. Both mocks also provide `hass.entities` and `hass.devices`. The mock is exported for
the suggestion tests, so the test fixture and the screenshots are one source. The scenarios' values are mapped onto
the foreign entities, so every scenario works with both namings.

## Risks / Trade-offs

- [Fuzzy suggestions bind a wrong entity] → only within one device, unit and domain first, direction excludes,
  ties and weak matches stay empty, the report names the empty roles, and the user sees every binding in the pickers.
- [Keyword lists incomplete] → kept in one file with a test per role; a missing word only leaves a role empty.
- [`getStubConfig(hass)` undocumented] → falls back to `{}`, today's behaviour.
- [The 100 W threshold misreads a unit] → only used when neither speed nor percentage has a value; speed and
  percentage stay first.
- [Text role on a numeric sensor] → stays text by design (D3); `states` can list numeric codes.

## Migration Plan

The live config sets only `prefix`; every default reproduces today's reading, units and mode, so no dashboard change
is needed. Release, deploy `dist/ecogeo-card.js`, bump `?v=`. Rollback: deploy the previous `dist/ecogeo-card.js`
and bump `?v=` again.
