# Proposal

## Why

The ecoGEO heat pump reports about forty live values to Home Assistant (firmware-entity): probe temperatures,
pressures, pump and compressor speeds, the expansion valve, demands and capacities. On a dashboard they are a flat
list of numbers. Without the unit's internal schematic in your head you cannot tell which circuit is running,
where heat flows, or whether a value is plausible. A card that draws the schematic of the service manual
(manual-figure, section 3.1) and puts each value on its component makes the unit's state readable at a glance.
It also gives later work, such as diagnostics or extra registers, a place to show up.

## What Changes

- New Lovelace card `custom:ecogeo-card`, bundled into one self-contained `dist/ecogeo-card.js`. The build,
  lint, test and release tooling is set up after `hrv-ventilation`, and the shared helpers are copied from it.
- The card draws, as inline SVG with no background image:
  - **Cabinet (centre):** the B4 figure's topology (manual-figure items 1-46), with the six top connections in
    the manual's order: 1/2 production (DG1), 3/4 brine (outer loop), 5/6 DHW.
  - **Outer-loop source (right of the cabinet):** an air unit, a ground loop, or both (hybrid), joined to ports 3/4.
  - **DHW storage (left of the cabinet):** an external tank joined to ports 5/6 (model B). Model C draws the tank
    inside the cabinet instead (manual-figure items 47-54). It can also be left out.
- The card shows each live value beside its component: probes 29-34, pressures 35-38, pumps 15/16 in %, the
  compressor (rpm, %, W), the expansion valve and superheat, condensation and evaporation, DHW temperature and
  setpoint, the air unit's fan speed and outlet temperature, outside temperature and COP (firmware-entity).
  Tapping a value opens more-info.
- It derives an operating mode from the live values: off, standby, heating, DHW, active cooling, passive cooling,
  plus an alarm overlay (derived). The mode sets the positions of valves 26, 27/28 and 14 and decides which
  circuits are active.
- Active circuits are coloured on an absolute temperature scale, each segment by its defining probe, and
  animated in the direction of flow at a speed that follows the pump or compressor. Inactive circuits are
  muted.
- Config: `model` (B or C), `variant` (1-4, a preset of optional parts), `source` (air, ground or hybrid),
  `dhw` (external, internal or none), `prefix` (builds every default entity id from the firmware naming),
  `features` (each optional part `true`, `false` or `unused`) and per-role `entities` overrides. An empty config
  shows sample values.
- Dev emulator (`npm run dev`) after hrv-ventilation's: a mock `hass` with scenario presets for every mode,
  controls for the model, variant, source, DHW and features, sliders that change values live, and a cycle mode
  for screenshots.
- Live installation: one task group uploads the release through the workspace deploy script, adds a dashboard
  resource (`?v=1`) and adds a new view `schematic` to the heat pump dashboard. Existing views are left
  untouched. Installation values go in `private/installation.md` only.

## Capabilities

### New Capabilities
- `card-config`: config keys, validation, variant presets and feature states, entity defaults built from the
  prefix, per-role overrides, and sample mode for an empty config.
- `operating-mode`: the mode derived from the live values, and the valve positions and active circuits that
  follow from it.
- `schematic-drawing`: the cabinet with its top connections and internal components, and which parts are drawn
  for each model, variant and feature state.
- `outer-loop-source`: the source drawn right of the cabinet (air unit, ground loop or hybrid) and its values.
- `dhw-storage`: the DHW tank drawn left of the cabinet (external), inside it (internal) or not at all, and its
  values.
- `temperature-coloring`: the colour scale, colour per segment, muted inactive circuits and flow animation.
- `live-values`: value labels, units and formatting, unavailable and sentinel values, and more-info on tap.
- `dev-emulator`: the local preview with scenarios, controls and the screenshot cycle.

### Modified Capabilities
- None (new repository).

## Impact

- **New repo** `ecogeo-card`. Dependencies: Lit 3 at runtime; Vite, TypeScript, Vitest (happy-dom), ESLint and
  Prettier for development. These are the versions hrv-ventilation pins.
- **Live installation (touched in the last group only):** the private workspace's deploy script gains a mapping
  `dist/` to `/config/www/custom/ecogeo-card/`. A dashboard resource is added, and the heat pump dashboard gets
  one new view. Nothing is written to the heat pump, and no existing view, card or entity changes.
- **Firmware facts used (firmware-entity), read-only:**
  - Temperatures: production_out/_in, brine_out/_in, compressor_suction_temperature,
    compressor_discharge_temperature, condensation_temperature, evaporation_temperature, superheat,
    dhw_temperature, outside_temperature, brine_temperature_air_unit_outlet.
  - Pressures: compressor_suction_pressure, compressor_discharge_pressure, pressure_brine, pressure_production.
  - Pumps, compressor and fan: production_pump, brine_pump, compressor_rpm, compressor_percentage,
    expansion_valve_position, aerothermal_fan_speed.
  - Power and capacity: power_consumption, condensation_capacity, heating_power_dg1, heating_power_dhw, cop.
  - Binary sensors: dhw_demand, dg1_demand, summer, winter, alarm.
  - Setpoints: number dhw_setpoint, number delta_t_start_dhw, heating_dg1_setpoint.
  - Cooling buffer sensors read -999.9 when no buffer is installed.

## Out of scope

- **Visual card editor:** follow-up change `add-card-editor`. Until then the card is configured in YAML.
- **HACS packaging and a public release:** follow-up change `add-hacs-release`.
- **Browser (Playwright) tests:** follow-up change `add-browser-tests`. This change verifies with unit tests and
  agent-inspected emulator screenshots.
- **Firmware registers not exposed yet** (Registers.csv): program mode 5024, source type 5143, DHW HTR setpoint
  59, passive cooling stop temperature 126, recirculation 12/42/43. Exposing them is a change in
  esphome-ecoforest-ecogeo. Until then `source` is set in the config, not detected.
- **Live state of the HTR circuit (9/17/22/25) and backup heater 44:** no entity or known register exists. They
  are drawn according to their feature state but never shown as running. Follow-up after a firmware change.
- **Model C's recirculation (item 49):** drawn as a pipe stub only, with no live value.
- **Several heating circuits (DG2, DG3, pool):** follow-up change `add-extra-circuits`.
