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
    It feeds only the offline indication.
  - The heat pump's on/off is the text sensor `sensor.<prefix>_heatpump_on_off`, with `OFF`, `ON`, `EMERGENCY`,
    `Unavailable` or `Unknown` (register 5058).
  - `sensor.<prefix>_compressor_operation_mode` is the compressor's process state (register 5277 "Modo 3"):
    `None`, `Time-Out`, `Balance`, `Cycle Inversion` or `Defrost`. It read `Balance` during heating in the
    firmware repo's watch capture of 2026-11-10. `Defrost` marks an active defrost.
  - `binary_sensor.<prefix>_summer` / `_winter` come from coils 127/128.
  - `binary_sensor.<prefix>_alarm` is coil 50, inverted.
  - `sensor.<prefix>_condensation_capacity` (5083) and `sensor.<prefix>_evaporation_capacity` (5185) are the
    capacities. In active cooling the firmware counts the condensation capacity as heat into the DHW tank. That
    is the HTR recovery: part of the heat goes to the outer loop and part into the tank, or all of it into the
    tank when the tank is colder than the brine outlet.
  - `superheat` is tagged °C with device class temperature although it is a temperature difference.
    `compressor_rpm` has the unit `RPM`.
- **Reference drawings:** the manual's figures (manual-figure, section 3.1, page 34), rendered and inspected on
  2026-11-10. The user's B4 figure is the reference topology. Facts read from the figures:
  - HTR exchanger 9 sits on the compressor discharge line, between compressor 11 (probe 30) and inversion valve
    14 / condenser 8. Pump 17 (with valves 22 and 25) circulates water from the DHW lines of ports 5/6 through
    exchanger 9, independently of valve 26. Every hot-gas path passes 9 first.
  - Exchanger 10 is the "Passive cooling / defrosting exchanger". Valves 27 (production side) and 28 (brine
    side) route water through it.
  - The variants differ only in the cooling parts (D3).

## Goals / Non-Goals

**Goals:**
- One self-contained ES module, `ecogeo-card.js`, that draws the full B4 schematic plus the external source and
  DHW tank, for any model, variant, source and feature combination in the config spec.
- All behaviour that can be decided without a browser (config resolution, mode, circuits, colours, geometry
  integrity, number formatting) lives in pure functions with unit tests.
- An emulator good enough to develop and verify every visual state without the live unit.

**Non-Goals:**
- A visual editor, HACS, browser tests, more registers, HTR state outside active cooling, live backup heater
  state, extra heating circuits. See the proposal's out-of-scope list.
- Pixel-exact reproduction of the manual figure. Its topology and item numbers are kept; coordinates are
  re-laid out for legibility.

## Decisions

### D1. Module layout
```
src/index.ts                 register card + window.customCards entry
src/strings.ts               every UI string, NBSP constant, mode labels
src/card/ecogeo-card.ts      LitElement: setConfig, hass, shouldUpdate, render, getCardSize, getGridOptions
src/config/options.ts        option table + validation (model, variant, source, dhw, prefix, features, colors)
src/config/roles.ts          role table: role path -> { domain, suffix, unit kind, display unit, decimals, item }
src/config/variants.ts       variant presets (B1-B4) -> feature states
src/config/resolve.ts        config -> ResolvedConfig (features, dhw default, entity ids per role, sample flag)
src/config/sample.ts         sample states for every role (sample mode)
src/calc/mode.ts             derived operating mode (pure)
src/calc/circuits.ts         mode + features + readings -> valve positions and active circuits (pure)
src/calc/readings.ts         hass + resolved roles -> numeric readings (unit conversion, sentinel, unavailable)
src/calc/display.ts          reading + role -> label text (number, NBSP, unit) (pure)
src/diagram/geometry.ts      coordinates and segment definitions as data (no Lit)
src/diagram/symbols.ts       SVG symbols: pump, 3-way valve, probe T, transducer P, switch, exchanger, compressor,
                             vessel, safety valve, drain valve, resistor, fan, tank, coil
src/diagram/cabinet.ts       cabinet + ports + internal components (svg template)
src/diagram/source.ts        air unit / ground loop / hybrid left of the cabinet
src/diagram/dhw.ts           external tank right / internal tank (model C) / none
src/diagram/pipes.ts         segment rendering: colour, muted, dash animation
src/diagram/labels.ts        value labels (HTML overlay, positioned in viewBox units)
src/diagram/colors.ts        temperature scale (stops -> color)
src/lib/*                    helpers copied from hrv-ventilation (D8)
```

### D2. Role table and entity resolution
Every value is a role path, matching the hrv `entityAt` pattern. The role table is the single source of the
domain, firmware suffix, unit kind, display unit, default decimals and manual item (firmware-entity unless
noted). Display units are the card's own, not the entity's.

| Role path | Domain . suffix | Shown as | Item |
|---|---|---|---|
| `production.outlet_temperature` | sensor.production_out | °C, 1 dec. | 33 |
| `production.return_temperature` | sensor.production_in | °C, 1 dec. | 34 |
| `production.pressure` | sensor.pressure_production | bar, 1 dec. | 38 |
| `production.pump` | sensor.production_pump | %, 1 dec. | 15 |
| `brine.outlet_temperature` | sensor.brine_out | °C, 1 dec. | 31 |
| `brine.inlet_temperature` | sensor.brine_in | °C, 1 dec. | 32 |
| `brine.pressure` | sensor.pressure_brine | bar, 1 dec. | 37 |
| `brine.pump` | sensor.brine_pump | %, 1 dec. | 16 |
| `compressor.speed` | sensor.compressor_rpm | rpm, 0 dec. | 11 |
| `compressor.percentage` | sensor.compressor_percentage | %, 1 dec. | 11 |
| `compressor.power` | sensor.power_consumption | W, 0 dec. | 11 |
| `compressor.suction_temperature` | sensor.compressor_suction_temperature | °C, 1 dec. | 29 |
| `compressor.discharge_temperature` | sensor.compressor_discharge_temperature | °C, 1 dec. | 30 |
| `compressor.suction_pressure` | sensor.compressor_suction_pressure | bar, 1 dec. | 35 |
| `compressor.discharge_pressure` | sensor.compressor_discharge_pressure | bar, 1 dec. | 36 |
| `compressor.mode` | sensor.compressor_operation_mode (text) | text | 11 |
| `refrigerant.condensation_temperature` | sensor.condensation_temperature | °C, 1 dec. | 8 |
| `refrigerant.evaporation_temperature` | sensor.evaporation_temperature | °C, 1 dec. | 7 |
| `refrigerant.superheat` | sensor.superheat | K, 1 dec. (difference) | 12 |
| `refrigerant.expansion_valve` | sensor.expansion_valve_position | %, 0 dec. | 12 |
| `heating.capacity` | sensor.condensation_capacity | W, 0 dec. | 8 |
| `cooling.capacity` | sensor.evaporation_capacity | W, 0 dec. | 7 |
| `heating.demand` | binary_sensor.dg1_demand | on/off | 1/2 |
| `heating.setpoint` | sensor.heating_dg1_setpoint | °C, 1 dec. | 1/2 |
| `dhw.temperature` | sensor.dhw_temperature | °C, 1 dec. | tank (54 on C) |
| `dhw.setpoint` | number.dhw_setpoint | °C, 0 dec. | tank |
| `dhw.start_delta` | number.delta_t_start_dhw | K, 0 dec. (difference) | tank |
| `dhw.demand` | binary_sensor.dhw_demand | on/off | 26 |
| `source.fan_speed` | sensor.aerothermal_fan_speed | %, 1 dec. | air unit |
| `source.air_unit_outlet_temperature` | sensor.brine_temperature_air_unit_outlet | °C, 1 dec. | air unit |
| `source.outside_temperature` | sensor.outside_temperature | °C, 1 dec. | air unit / footer |
| `unit.on_off` | sensor.heatpump_on_off (text) | text | footer |
| `unit.summer` / `unit.winter` | binary_sensor.summer / winter | on/off | footer |
| `unit.alarm` | binary_sensor.alarm | on/off | footer |
| `unit.connection` | binary_sensor.status | on/off | footer |
| `unit.cop` | sensor.cop | no unit, 1 dec. | footer |

- **Config shape:** `entities` is nested by role path, as in hrv:
  `entities: { dhw: { temperature: sensor.boiler_top } }`. It is read with hrv's `valueAt`/`entityAt`.
- **Resolution order:** an explicit `entities` override, then `<domain>.<prefix>_<suffix>` when `prefix` is set,
  then nothing. A blank or null `prefix` or entity counts as not set.
- **HA keys:** `view_layout`, `layout_options`, `grid_options` and `visibility` are accepted and ignored; any
  other unknown top-level key is an error.
- **Text roles:** the firmware writes `Unavailable` and `Unknown` into its text sensors when a register has no
  state. Readings treat `unavailable` and `unknown` case-insensitively as no value for every role.
- **Sample mode:** with no prefix and no overrides, the card is in sample mode (hrv `card-preview` pattern;
  sample values in `src/config/sample.ts` from the live snapshot).

### D3. Variants and features
`variants.ts` maps 1-4 to the cooling parts, after the manual's figures (page 34, inspected 2026-11-10):

| Variant | `active_cooling` (14) | `passive_cooling` (10, 27, 28) |
|---|---|---|
| 1 | false | false |
| 2 | false | true |
| 3 | true | false |
| 4 | true | true |

- **Parts in every figure:** HTR (9, 17, 22, 25) and the outlet resistor with its thermostat (44, 45) are drawn
  in all four figures. They are not part of any preset; `htr` and `backup_heater` default to `true`.
- **Figure error:** B2 shows a "14" label with no valve symbol. This is taken to be an error in the figure and
  recorded in `docs/ecogeo-card.md`.
- **Feature states:** a feature state is `true | false | 'unused'`. `ResolvedConfig.features` is the preset
  merged with the overrides.
  - `unused` draws the part muted and stops the card from deriving the part's own function. For example,
    passive cooling is never derived when `passive_cooling` is `unused`.
  - With `dhw: none`, HTR (9, 17, 22, 25) counts as `false`: its water lines have no DHW lines to join, so the
    group is not drawn and the discharge line runs from 11 straight to 14.
  - Exchanger 10 with valves 27/28 also serves defrost. In defrost they are active whenever they are drawn
    (`true` or `unused`).
- **Source default:** the default `source` is `ground` (the ecoGEO's design default). The live installation
  sets `air` in `private/installation.md`.

### D4. Mode and circuits are pure functions
- **Mode:** `deriveMode(readings, features): Mode` implements the precedence in the operating-mode spec.
  - Its inputs are `unit.on_off`, `compressor.mode`, `compressor.speed`, `dhw.demand`, `unit.summer`,
    `production.pump` and the feature states.
  - The bridge connectivity sensor (`unit.connection`) is not a mode input; it only sets the offline indication.
- **Running and defrost:**
  - "Compressor runs" means `compressor.speed > 0`.
  - "Production pump runs" means `production.pump > 0`; "brine pump runs" means `brine.pump > 0`.
  - "Defrost" means `compressor.mode` reads `Defrost` (case-insensitive).
- **Circuits:** `circuitsFor(mode, features, dhw, readings)` returns:
  - `{ valve26: 'production' | 'dhw', valve14: 'normal' | 'reversed', valves2728: 'closed' | 'exchanger' }`
  - the set of active circuit ids:
    - `refrigerant`
    - `brine`
    - `production_dg1`
    - `production_dhw`
    - `dhw_coil`
    - `exchanger_10` (production and brine through exchanger 10, in passive cooling and defrost)
    - `htr` (water through exchanger 9 and pump 17)
- **HTR:** `htr` is active only in `active_cooling`, when `htr` is `true`, `dhw` is not `none` and
  `heating.capacity > 0`. `dhw_coil` is then active too, and valve 26 stays towards ports 1/2. Outside active
  cooling, HTR is idle: its state is not known (coil 210 is not exposed).
- **Brine:** `brine` is active only while the brine pump runs, in every mode that lists it. This covers active
  cooling with all heat going into the tank.
- **Defrost:** active circuits are `brine`, `production_dg1` and `exchanger_10` (when 10/27/28 are drawn), and
  valves 27/28 are set to `exchanger`. `refrigerant` is idle and valve 26 stays towards ports 1/2. Register 5239
  (defrosting by DHW, heating or pool) is a setting the firmware does not expose.
- **Where the spec was silent:**
  - with `dhw: none` the `dhw` mode keeps its label and valve 26 follows the mode, but `production_dhw`,
    `dhw_coil` and `htr` are never active
  - valves 27/28 go to `exchanger` only when 10/27/28 are drawn
  - `exchanger_10` does not depend on the brine pump
- **Offline:** shown only when the connection entity exists in `hass` and reads `off`, `unavailable` or
  `unknown`.
- Rendering reads only these outputs.
- **Cooling operation mode:** the firmware's `cooling_operation_mode` text sensor (`None`, `Source`,
  `Direct Cooling`, `Cooling via Buffer`) is a setting, not a live state (it reads `Source` in winter). It is not
  a mode input.

### D5. Geometry as data
- **viewBox:** `geometry.ts` exports a `viewBox` of 1000 x 620:
  - x 0-210: source zone
  - x 240-760: cabinet
  - x 790-1000: DHW zone
  - y 0-110: the pipe run above the cabinet
  - cabinet top edge at y 130
- **Top ports:** x positions in manual order 1, 2 | 3, 4 | 5, 6.
  - Ports 1/2 end in short DG1 stubs that stay below the pipe run (y > 110), with their label.
  - The 3/4 pipes rise into the run and go left to the source zone, passing above the 1/2 stubs.
  - The 5/6 pipes rise and go right to the DHW zone. No pipes outside the cabinet cross.
- **Crossings inside the cabinet** (decided 2026-11-10 when group 4 traced the B4 figure): the line 1 -> 26 -> 5
  separates port 2 from port 6, yet the DHW return from 6 joins port 2's line, so at least one internal crossing
  is forced. As in the manual, the DHW supply and return lines cross the lines of ports 2, 3 and 4 with hops.
  - Each crossing is declared in `geometry.ts` as data, `{ over, under, at }`, and drawn as a hop: a small gap
    in the `under` segment.
  - Keep the number of crossings at or below the figure's: 15 (14 hops plus the return line passing behind
    resistor 44). This layout needs 14. Every crossing lies inside the cabinet.
- **Components** are `{ item, kind, x, y, rotation, feature? }`.
- **Segments** are `{ id, circuit, points: [x, y][], temperatureRole, speedRole?, direction: 1 | -1,
  feature? }`.
  - `circuit` may list several circuits. Such a segment is active when any of them is. This covers the
    production trunk shared by DG1 and DHW (from the 2/6 junction through valve 27, pump 15, condenser 8,
    resistor 44 and probe 33 to valve 26). Its return part takes the role `production.return_temperature`
    (probe 34 on "the return from connection 2 (or 6)").
  - `onlyWhen: { valves2728: 'closed' | 'exchanger' }` marks a segment that carries water only in that valve
    position (the legs behind a closed arm of 27/28: `prod_27_in`, `br_feed7`, `brine_7_28`).
    `isSegmentActive(segment, circuits)` takes the whole `circuitsFor` output and reads it.
  - Further segment fields: `reversible` (the refrigerant legs that flip direction in active cooling; the flip is
    applied at render time), `stub` (dead-end taps, coloured but never animated), `through` (a pipe through a
    part: hidden when the part is `false`, never muted), `bypass` (drawn only when the part is `false`) and
    `dhw` (`any`, `external`, `internal` or `none`). Components also carry `tag` (item-number offset), `size`
    and `dhw`.
  - The effective feature state (with HTR `false` under `dhw: none`) comes from one exported helper, used by
    the drawing and by the labels.
  - In active cooling the refrigerant segments flip `direction`. The swapped roles of 7 and 8 are expressed by
    `temperatureRole` lookups in `circuits.ts`, not by separate geometry.
  - The discharge line runs 11 -> 9 -> 14. HTR water segments run between exchanger 9, pump 17, valves 22/25
    and the 5/6 lines inside the cabinet.
- **Integrity tests:** unit tests check the geometry:
  - every segment endpoint touches a component port or another segment
  - every component of a drawn feature has an item number
  - no segment has fewer than two points
  - each `feature` part disappears entirely when the feature is `false`
  - no two segments of different circuits cross unless the crossing is declared, and every declared crossing
    is a real crossing
  - no segment outside the cabinet crosses another (checked again when group 5 adds source and DHW pipes)

### D6. Rendering
- **Scaling and labels:** one `<svg viewBox>` scaled to the card width with
  `preserveAspectRatio="xMidYMid meet"`. Value labels are HTML overlaid in percentage positions computed from
  viewBox coordinates (hrv `labels.ts` pattern), so text stays crisp and selectable, and taps fire
  `hass-more-info`.
- **Pipes:**
  - Each pipe is a base stroke (temperature colour, or `--disabled-text-color` when muted). When active, an
    overlay stroke with `stroke-dasharray` and a CSS animation on `stroke-dashoffset` is added.
  - The duration comes from a custom property per segment, `--flow-duration`, calculated from the speed role
    (0 % or unknown: no overlay).
  - HTR water segments have no speed role (pump 17 reports no speed) and animate at a fixed medium speed while
    `htr` is active.
  - `prefers-reduced-motion: reduce` disables all animation, including the fan's `rotate`.
- **Symbols** use `currentColor` and theme variables (`--primary-text-color`, `--secondary-text-color`,
  `--divider-color`, `--error-color` for the alarm). Item numbers are small `--secondary-text-color` text.
- **Number formatting:** the card formats every number itself in `calc/display.ts`, not through
  `hass.formatEntityState`. This keeps the no-break space and the card's units, which HA would otherwise change
  ("38.9%", "2803 RPM").
  - The number goes through hrv's `formatNumber` (copied `lib/format.ts`) with HA's locale.
  - The decimals come from the entity's `display_precision` in `hass.entities` when set, and from the role
    table otherwise.
  - The display unit comes from the role table and is joined with `NBSP`.
- **Footer:** the mode, on/off, season, outside temperature, COP, and the condensation and evaporation
  capacity, plus the alarm and offline indications.
- **Grid:** `getGridOptions()` returns `{ columns: 'full', rows: 'auto', min_rows: 8 }` (`'full'` spans the
  whole section, also when the section spans several columns); `getCardSize()` returns 10.

### D7. Colour scale
- `colors.ts` uses stops `[{t:-10,c:'#1e88e5'},{t:20,c:'#43a047'},{t:45,c:'#fb8c00'},{t:70,c:'#e53935'}]` by
  default and interpolates with `color-mix(in srgb, …)`, reusing hrv's `mixColor` approach from
  `diagram/streams.ts`. Values are clamped at the end stops.
- Stops are configurable through the `colors` option: an ascending list of 2-8 `{ temperature, color }`.
- The tank body and the HTR water segments use the same scale with the DHW temperature.
- **Mode-dependent roles** (looked up at render time, like the 7/8 swap; no geometry change):
  - `prod_10_out` takes the production outlet temperature (probe 33 is the first probe after exchanger 10).
    In `passive_cooling` and `defrost` the production legs from valve 27 to condenser 8 take it too, because
    the condenser does not change the water temperature with the compressor stopped.
  - When `htr` is active and `production_dhw` is not, the DHW lines between valve 26 / port 2 and the tank
    (`dhw_sup_*`, `dhw_ret_*` outside the 26 arm) carry HTR water: they take the DHW temperature and the fixed
    HTR speed.
  - In `defrost`, exchanger 10, valves 27/28 and their pipes are drawn active even when `unused`.

### D8. Helpers copied from hrv-ventilation
Each is copied with its unit test and adjusted only where noted:
- `lib/define.ts`
- `lib/availability.ts`: adds the -999.9 sentinel. Any value at or below -999 counts as unavailable.
- `lib/units.ts`: temperature °F to °C and power kW to W only. The flow conversions are dropped. Adds a rule
  for differences (superheat, start delta-T): HA converts these as if they were absolute temperatures, so a
  state in °F is converted back with the same absolute formula and shown in K.
- `lib/hass.ts`: the `hass` types, `stateOf` and more-info. Its `formatState` is not used for labels (D6).
- `lib/render.ts`: `shouldRender` and `configuredEntityIds`, fed by the resolved role map, not the raw config.
- `lib/config.ts`: `valueAt`, `asEntityId` and `entityAt`, with the role type replaced by this card's role
  table. The hrv humidity and stream helpers are dropped.
- `lib/options.ts`: `optionValue` and `invalidOptions`.
- `lib/format.ts`: `formatNumber` and `localeFromHass`.
- `lib/sample.ts`: the pattern only, with its own sample states.
- `strings.ts`: the NBSP pattern, plus `test/nbsp.ts` and the strings test.

The browser test project and its Playwright dependencies are not copied (out of scope).

### D9. Emulator
- **Files:** `dev/index.html`, `dev/preview.ts`, `dev/mock-hass.ts`, `dev/ha-stubs.ts` (after hrv), plus
  `dev/scenarios.ts`.
- **`scenarios.ts`:** the scenarios of the dev-emulator spec as full state maps keyed by role path. They are
  resolved to entity ids through a fixed demo prefix `demo_ecogeo`, so no installation id appears. The heating
  scenario is seeded from the live snapshot in `private/installation.md`, copied as rounded numbers, not ids.
- **Controls:** HTML selects for the options, and sliders that write into the mock `hass` and set
  `card.hass = newHass`.
- **URL state:** the query string carries `scenario`, `model`, `variant`, `source`, `dhw`, every `feature`,
  `theme` and `cycle`, so every combination is addressable.
- **Captures:** `scripts/capture.mjs` (after hrv, Playwright as a dev dependency for capture only, not tests) walks
  a fixed list of URLs and writes PNGs to `build/captures/`. Subagents read those.

### D10. Live rollout (group 7)
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

- **Readability of a dense figure.** The B4 figure has 46 items, so labels can collide at narrow widths. Values
  go first and item numbers are small and secondary. The POC targets a full-width panel view; a compact layout
  is a follow-up if needed.
- **Mode inference.** It could be wrong in edge cases, for example DHW demand on while the compressor is still
  ramping. The logic is pure and tested, and its inputs are shown on the card, so a wrong mode is visible and
  easy to correct in a later change. Using register 5024 (program mode) after a firmware change would make it
  firmer.
- **Defrost not yet seen live.** The `Defrost` value of the compressor operation mode and the path through
  exchanger 10 come from the register list, the manual's item name and the user's account of the unit. No
  defrost has been captured yet. Verify on the live card during the next defrost.
- **HTR outside active cooling.** HTR may also run in heating or DHW mode, but the card cannot tell, so it draws
  HTR idle there. A wrong "idle" is a known gap until the firmware exposes coil 210.
- **Defrost heat source.** Valve 26 stays towards ports 1/2 during defrost. If the unit defrosts from the DHW
  tank (register 5239), the drawing shows the heat coming from the wrong side until that register is exposed.
- **Copying helpers duplicates code across two repos.** That is accepted because the repos must not depend on
  each other. Each copy names its source file in a header comment.
