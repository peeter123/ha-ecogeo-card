# Design

## Context

- **Starting point:** the repo holds only planning files. Group 1 creates the build, copying hrv-ventilation's
  tooling: Vite library build into `build/`, release copy into `dist/`, TypeScript strict, Vitest unit project in
  happy-dom, ESLint (typescript-eslint strict + lit + wc), Prettier, and the quality hook
  `scripts/check-on-edit.mjs`, which is already copied.
- **Live source:** the esphome-ecoforest-ecogeo firmware (firmware-entity) on an ESP32 board. Its fast poll
  is 5 s, so `hass` updates at most every few seconds per entity. The firmware reports -999.9 for absent probes
  (seen on the cooling buffer sensors).
- **Firmware facts that shape the mode logic** (firmware-entity, checked in its `packages/`):
  - `binary_sensor.<prefix>_status` is the ESPHome bridge connectivity (`platform: status`), not the heat pump.
  - The heat pump's on/off is the text sensor `sensor.<prefix>_heatpump_on_off`, with `OFF`, `ON`, `EMERGENCY`,
    `Unavailable` or `Unknown` (register 5058).
  - `binary_sensor.<prefix>_summer` / `_winter` come from coils 127/128.
  - `binary_sensor.<prefix>_alarm` is coil 50, inverted.
- **Reference drawings:** the manual's figures (manual-figure, section 3.1). The user's B4 figure is the reference
  topology. The B1-B3 and C figures are in the same section and are checked during group 3.

## Goals / Non-Goals

**Goals:**
- One self-contained ES module, `ecogeo-card.js`, that draws the full B4 schematic plus the external source and
  DHW tank, for any model, variant, source and feature combination in the config spec.
- All behaviour that can be decided without a browser (config resolution, mode, circuits, colours, geometry
  integrity) lives in pure functions with unit tests.
- An emulator good enough to develop and verify every visual state without the live unit.

**Non-Goals:**
- A visual editor, HACS, browser tests, more registers, live HTR/backup heater state, extra heating circuits.
  See the proposal's out-of-scope list.
- Pixel-exact reproduction of the manual figure. Its topology and item numbers are kept; coordinates are
  re-laid out for legibility.

## Decisions

### D1. Module layout
```
src/index.ts                 register card + window.customCards entry
src/strings.ts               every UI string, NBSP constant, mode labels
src/card/ecogeo-card.ts      LitElement: setConfig, hass, shouldUpdate, render, getCardSize, getGridOptions
src/config/options.ts        option table + validation (model, variant, source, dhw, prefix, features, colors)
src/config/roles.ts          role table: role path -> { domain, suffix, unit kind, item }
src/config/variants.ts       variant presets (B1-B4) -> feature states
src/config/resolve.ts        config -> ResolvedConfig (features, dhw default, entity ids per role, sample flag)
src/calc/mode.ts             derived operating mode (pure)
src/calc/circuits.ts         mode + features -> valve positions and active circuits (pure)
src/calc/readings.ts         hass + resolved roles -> numeric readings (unit conversion, sentinel, unavailable)
src/diagram/geometry.ts      coordinates and segment definitions as data (no Lit)
src/diagram/symbols.ts       SVG symbols: pump, 3-way valve, probe T, transducer P, switch, exchanger, compressor,
                             vessel, safety valve, drain valve, resistor, fan, tank, coil
src/diagram/cabinet.ts       cabinet + ports + internal components (svg template)
src/diagram/source.ts        air unit / ground loop / hybrid right of the cabinet
src/diagram/dhw.ts           external tank left / internal tank (model C) / none
src/diagram/pipes.ts         segment rendering: colour, muted, dash animation
src/diagram/labels.ts        value labels (HTML overlay, positioned in viewBox units)
src/diagram/colors.ts        temperature scale (stops -> color)
src/lib/*                    helpers copied from hrv-ventilation (D8)
```

### D2. Role table and entity resolution
Every value is a role path, matching the hrv `entityAt` pattern. The role table is the single source of the
domain, firmware suffix, unit kind and manual item (firmware-entity unless noted).

| Role path | Domain . suffix | Item |
|---|---|---|
| `production.outlet_temperature` | sensor.production_out | 33 |
| `production.return_temperature` | sensor.production_in | 34 |
| `production.pressure` | sensor.pressure_production | 38 |
| `production.pump` | sensor.production_pump (%) | 15 |
| `brine.outlet_temperature` | sensor.brine_out | 31 |
| `brine.inlet_temperature` | sensor.brine_in | 32 |
| `brine.pressure` | sensor.pressure_brine | 37 |
| `brine.pump` | sensor.brine_pump (%) | 16 |
| `compressor.speed` | sensor.compressor_rpm | 11 |
| `compressor.percentage` | sensor.compressor_percentage | 11 |
| `compressor.power` | sensor.power_consumption | 11 |
| `compressor.suction_temperature` | sensor.compressor_suction_temperature | 29 |
| `compressor.discharge_temperature` | sensor.compressor_discharge_temperature | 30 |
| `compressor.suction_pressure` | sensor.compressor_suction_pressure | 35 |
| `compressor.discharge_pressure` | sensor.compressor_discharge_pressure | 36 |
| `refrigerant.condensation_temperature` | sensor.condensation_temperature | 8 |
| `refrigerant.evaporation_temperature` | sensor.evaporation_temperature | 7 |
| `refrigerant.superheat` | sensor.superheat | 12 |
| `refrigerant.expansion_valve` | sensor.expansion_valve_position (%) | 12 |
| `heating.capacity` | sensor.condensation_capacity | 8 |
| `heating.demand` | binary_sensor.dg1_demand | 1/2 |
| `heating.setpoint` | sensor.heating_dg1_setpoint | 1/2 |
| `dhw.temperature` | sensor.dhw_temperature | tank (54 on C) |
| `dhw.setpoint` | number.dhw_setpoint | tank |
| `dhw.start_delta` | number.delta_t_start_dhw | tank |
| `dhw.demand` | binary_sensor.dhw_demand | 26 |
| `source.fan_speed` | sensor.aerothermal_fan_speed (%) | air unit |
| `source.air_unit_outlet_temperature` | sensor.brine_temperature_air_unit_outlet | air unit |
| `source.outside_temperature` | sensor.outside_temperature | air unit / footer |
| `unit.on_off` | sensor.heatpump_on_off (text) | footer |
| `unit.summer` / `unit.winter` | binary_sensor.summer / winter | footer |
| `unit.alarm` | binary_sensor.alarm | footer |
| `unit.cop` | sensor.cop | footer |

Resolution order: an explicit `entities[role]` override, then `<domain>.<prefix>_<suffix>` when `prefix` is set,
then nothing. With no prefix and no overrides, the card is in sample mode (hrv `card-preview` pattern; sample
values in `src/config/sample.ts` from the live snapshot).

### D3. Variants and features
`variants.ts` maps 1-4 to `{ active_cooling, passive_cooling, htr, backup_heater }`. Variant 4 has all four
(manual-figure B4). Variants 1-3 are filled in group 2 from the manual's B1-B3 figures. From the text layer the
figures differ in items 14, 10, 27, 28 and 24, but this is not confirmed. If a figure is ambiguous, the task
records it as a decision point for the user rather than guessing.

A feature state is `true | false | 'unused'`. `ResolvedConfig.features` is the preset merged with the overrides.
The default `source` is `ground` (the ecoGEO's design default). The live installation sets `air` in
`private/installation.md`.

### D4. Mode and circuits are pure functions
- `deriveMode(readings, features): Mode` implements the precedence in the operating-mode spec. The on/off input
  is `unit.on_off`; the bridge connectivity sensor is not used.
- "Compressor runs" means `compressor.speed > 0`.
- "Production pump runs" means `production.pump > 0`.
- `circuitsFor(mode, features, dhw)` returns:
  - `{ valve26: 'production' | 'dhw', valve14: 'normal' | 'reversed', valves2728: 'closed' | 'exchanger' }`
  - the set of active circuit ids: `refrigerant`, `brine`, `production_dg1`, `production_dhw`, `dhw_coil`,
    `passive`
  Rendering reads only these outputs.
- The firmware's `cooling_operation_mode` text sensor (`None`, `Source`, `Direct Cooling`,
  `Cooling via Buffer`) is a setting, not a live state (it reads `Source` in winter). It is not a mode input.

### D5. Geometry as data
- `geometry.ts` exports a `viewBox` of 1000 x 620:
  - x 0-210: DHW zone
  - x 240-760: cabinet
  - x 790-1000: source zone
  - y 0-110: the pipe run above the cabinet
  - cabinet top edge at y 130
- Top ports: x positions in manual order 1, 2 | 3, 4 | 5, 6. The left-right order of the circuits follows the
  manual figure (1/2 left, 3/4 centre-right, 5/6 right). The DHW zone is on the left, so the 5/6 pipes leave the
  top edge, rise into the run above the cabinet and cross over to the left zone; the 3/4 pipes run to the right
  zone. Crossings are drawn as a hop (a small arc) on the crossing pipe.
- Components are `{ item, kind, x, y, rotation, feature? }`.
- Segments are `{ id, circuit, points: [x, y][], temperatureRole, speedRole, direction: 1 | -1, feature? }`. In
  active cooling the refrigerant segments flip `direction`. The swapped roles of 7 and 8 are expressed by
  `temperatureRole` lookups in `circuits.ts`, not by separate geometry.
- Unit tests check the geometry's integrity:
  - every segment endpoint touches a component port or another segment
  - every component of a drawn feature has an item number
  - no segment has fewer than two points
  - each `feature` part disappears entirely when the feature is `false`

### D6. Rendering
- One `<svg viewBox>` scaled to the card width with `preserveAspectRatio="xMidYMid meet"`. Value labels are HTML
  overlaid in percentage positions computed from viewBox coordinates (hrv `labels.ts` pattern), so text stays
  crisp and selectable, and taps fire `hass-more-info`.
- Pipes are drawn as a base stroke (temperature colour, or `--disabled-text-color` when muted), plus, when
  active, an overlay stroke with `stroke-dasharray` and a CSS animation on `stroke-dashoffset`. The duration
  comes from a custom property per segment, `--flow-duration`, calculated from the speed role (0 % or unknown:
  no overlay). `prefers-reduced-motion: reduce` disables all animation, including the fan's `rotate`.
- Symbols use `currentColor` and theme variables (`--primary-text-color`, `--secondary-text-color`,
  `--divider-color`, `--error-color` for the alarm). Item numbers are small `--secondary-text-color` text.
- `getGridOptions()` returns full width (12 columns) and a minimum of 8 rows; `getCardSize()` returns 10.

### D7. Colour scale
`colors.ts` uses stops `[{t:-10,c:'#1e88e5'},{t:20,c:'#43a047'},{t:45,c:'#fb8c00'},{t:70,c:'#e53935'}]` by
default and interpolates with `color-mix(in srgb, …)`, reusing hrv's `mixColor` approach from
`diagram/streams.ts`. Values are clamped at the end stops. Stops are configurable through the `colors` option:
an ascending list of 2-8 `{ temperature, color }`. The tank body uses the same scale with the DHW temperature.

### D8. Helpers copied from hrv-ventilation
Each is copied with its unit test and adjusted only where noted:
- `lib/define.ts`
- `lib/availability.ts`: adds the -999.9 sentinel. Any value at or below -999 counts as unavailable.
- `lib/units.ts`: temperature °F to °C and power kW to W only. The flow conversions are dropped.
- `lib/hass.ts`: `formatState` and more-info.
- `lib/render.ts`: `shouldRender` and `configuredEntityIds`, fed by the resolved role map, not the raw config.
- `lib/config.ts`: `entityAt`, adapted to the role table.
- `lib/options.ts`: `optionValue` and `invalidOptions`.
- `lib/format.ts`
- `lib/sample.ts`: the pattern only, with its own sample states.
- `strings.ts`: the NBSP pattern, plus `test/nbsp.ts` and the strings test.

The browser test project and its Playwright dependencies are not copied (out of scope).

### D9. Emulator
- **Files:** `dev/index.html`, `dev/preview.ts`, `dev/mock-hass.ts`, `dev/ha-stubs.ts` (after hrv), plus
  `dev/scenarios.ts`.
- **`scenarios.ts`:** the eight scenarios as full state maps keyed by role path. They are resolved to entity ids
  through a fixed demo prefix `demo_ecogeo`, so no installation id appears. The heating scenario is seeded from the
  live snapshot in `private/installation.md`, copied as rounded numbers, not ids.
- **Controls:** HTML selects for the options, and sliders that write into the mock `hass` and set
  `card.hass = newHass`.
- **URL state:** the query string carries `scenario`, `model`, `variant`, `source`, `dhw`, every `feature`,
  `theme` and `cycle`, so every combination is addressable.
- **Captures:** `scripts/capture.mjs` (after hrv, Playwright as a dev dependency for capture only, not tests) walks
  a fixed list of URLs and writes PNGs to `build/captures/`. Subagents read those.

### D10. Live rollout (group 6)
Steps in the private workspace (path in `private/installation.md`), following that repo's AGENTS.md:
1. Add `$EcogeoRepo` and the mapping `"$EcogeoRepo/dist/"` to `www/custom/ecogeo-card/` to `scripts/deploy.ps1`
   `$Mappings`, most specific first.
2. Update `docs/deploy.md`.
3. Run `deploy.ps1 -Status`, then `npm run release` and an explicit deploy of `dist/ecogeo-card.js`.
4. Add the resource `ha_config_set_dashboard_resource` with
   `url=/local/custom/ecogeo-card/ecogeo-card.js?v=1` and `resource_type=module`.
5. Append the view `{ title: Schematic, path: schematic, type: panel, cards: [<card yaml from
   private/installation.md>] }` to `<dashboard>` with `ha_config_set_dashboard(python_transform=...)`,
   leaving existing views untouched.
6. Record the resource id and `?v=` in `private/installation.md`, and add a topic-index line to the workspace's
   AGENTS.md.

## Risks / Trade-offs

- **Ambiguous B1-B3 presets.** Mitigation: every feature is overridable, and an ambiguity becomes a decision point
  in group 2 rather than a guess.
- **Readability of a dense figure.** The B4 figure has 46 items, so labels can collide at narrow widths. Values
  go first and item numbers are small and secondary. The POC targets a full-width panel view; a compact layout
  is a follow-up if needed.
- **Mode inference.** It could be wrong in edge cases, for example DHW demand on while the compressor is still
  ramping. The logic is pure and tested, and its inputs are shown on the card, so a wrong mode is visible and
  easy to correct in a later change. Using register 5024 (program mode) after a firmware change would make it
  firmer.
- **Copying helpers duplicates code across two repos.** That is accepted because the repos must not depend on
  each other. Each copy names its source file in a header comment.
- **The 5/6 pipes cross the 3/4 pipes on their way to the left zone.** Hops keep the crossing readable. If the
  emulator screenshots show clutter, group 3 may route the DHW pipes along the cabinet's left side instead, but
  only through a decision point.
