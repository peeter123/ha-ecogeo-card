# Proposal

## Why

The card draws HTR (heat recovery: exchanger 9, pump 17, valves 22/25, manual-figure) as active only in active
cooling, and only when the condensation capacity is above 0 W (operating-mode "HTR recovery in active cooling",
`src/calc/circuits.ts`). When the card was planned the firmware did not expose the HTR state. It does now, and HTR also
runs while heating: on the live installation on 2026-11-17 the unit was heating (DG1 demand on) with `htr_active` on
and about 1835 W of HTR heat going into the DHW tank, while the card drew exchanger 9 and pump 17 idle. The
operating-mode scenario "HTR idle while heating" states the opposite of what the unit does.

The footer has the same blind spot. It shows the condensation and evaporation capacity, the compressor's raw output,
so it cannot show that part of the heat goes to the DHW tank through HTR while the rest goes to DG1. The firmware now
splits the useful heat by service (DG1, DHW, HTR) and calculates a system COP from the metered electrical power, and
the footer should show those figures, falling back to the capacities and the register COP on installations that do not
have them.

## What Changes

- **HTR state from an entity.** A new role `htr.active` (binary_sensor, suffix `htr_active`). In `heating` and
  `active_cooling`, with HTR `true` and a DHW tank in use, it decides whether the HTR circuit (exchanger 9, pump 17,
  the HTR water to the DHW lines) and the DHW coil are active. Valve 26 stays towards ports 1/2. In every other mode,
  `dhw` included, HTR stays idle whatever the role says. When the role has no entity, today's active-cooling rule
  (condensation capacity above 0 W) is the fallback.
- **Footer power items follow the mode.** The condensation and evaporation capacity leave the footer. In their place:
  - `heating`: DG1 power, and HTR power when HTR is drawn
  - `dhw`: DHW power
  - `active_cooling`: cooling power (the evaporation capacity), and HTR power when HTR is drawn
  - `passive_cooling`, `defrost`, `off`, `standby`: no power item

  New roles `heating.power` (`heating_power_dg1`), `dhw.power` (`heating_power_dhw`) and `htr.power`
  (`heating_power_htr`). DG1 and DHW power fall back to the condensation capacity; HTR power has no fallback (no HTR
  item).
- **System COP.** A new role `unit.system_cop` (`system_cop_display`) for the footer's efficiency, falling back to the
  existing `unit.cop` (the register COP). The value 0, which both report outside a settled run, shows as a muted dash.
  The caption is "EER" in `active_cooling` and "COP" otherwise.
- **Optional roles.** The five new roles are optional: each falls back (as above) when it is set to `none`, when its
  prefix-default entity does not exist in Home Assistant, or when there is no prefix and no entity for it (except with
  the sample values, which cover every role). A role set explicitly to an entity id keeps today's rule: an unknown
  entity shows a muted dash and the editor warns. An entity that exists but is unknown or unavailable shows a muted
  dash, with no fallback. The editor's binding check does not warn about an absent default entity of an optional
  role. Each new role gets editor keywords for the entity suggestions.
- Emulator: a heating with HTR scenario, sample values for the new roles, and the fallbacks shown by the foreign
  naming. Docs (`docs/ecogeo-card.md`) and README.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `operating-mode`: HTR recovery follows `htr.active` in `heating` and `active_cooling`; the active-cooling rule
  becomes the fallback; "HTR idle while heating" changes.
- `card-config`: the five new roles with their default entities, and optional roles that fall back when their
  default entity is absent.
- `card-editor`: the new roles in the advanced pickers and the entity suggestions; the binding check skips absent
  default entities of optional roles.
- `live-values`: the footer's power items by mode, the system COP with its fallback, the dash for 0 and the EER
  caption; the capacities leave the footer; the optional roles' fallback against "Roles not present are hidden".
- `dhw-storage`: the DHW coil loop is active with HTR recovery while heating too.
- `dev-emulator`: the heating with HTR scenario, and the foreign naming without the optional roles.

## Facts and their sources

- Exchanger 9, pump 17, valves 22 and 25, valve 26, the DHW coil: manual-figure (unchanged).
- `binary_sensor.<prefix>_htr_active` (coil 129), `sensor.<prefix>_heating_power_dg1`, `_heating_power_dhw`,
  `_heating_power_htr` (W) and `sensor.<prefix>_system_cop_display` (no unit, 1 decimal): firmware-entity, from the
  esphome-ecoforest-ecogeo repo (`packages/binary_sensors.yml`, `packages/derived_sensors.yml`), confirmed on the live
  installation on 2026-11-17.
- Coil 129 is listed as "Activation HTR" (R/W) in Registers.csv, but behaves as a running flag: on the live
  installation it switched on and off with each HTR run (8 runs from 2026-11-15 to 2026-11-17). `htr_demand`
  (coil 210, "Active Demand HTR") tracks it, ending 25-45 s earlier. Registers.csv and firmware-entity.
- HTR runs only during DG1 demand. When DHW demand starts, `htr_demand` drops within 1 s and `htr_active` 25-30 s
  later; HTR never ran during a DHW cycle in that period: firmware-entity history.
- `heating_power_htr` is an estimate: while coil 129 is on, the condensation capacity minus the modelled production
  flow times the production temperature difference, averaged over 30 samples, limited to 0..capacity; in cooling with
  HTR it equals the whole condensation capacity. `heating_power_dhw` includes the HTR heat, so while heating with HTR
  it equals `heating_power_htr`, and DG1 + DHW equals the condensation capacity outside cooling: firmware-entity
  (firmware README, "Thermal power sensors").
- The firmware has no cooling power entity; it uses the evaporation capacity (register 5185) as the useful cooling
  power: firmware-entity.
- `system_cop_display` is the system COP from the metered electrical power (an external meter imported from Home
  Assistant). It is 0 when no settled run is going on and in defrost, and unknown while the meter is unknown. In
  cooling it is the cooling recovery efficiency, (cooling + HTR heat) / electricity; the firmware's own display
  captions it EER while cooling: firmware-entity.
- Whether HTR is active, which power items the footer shows and which role feeds them: derived, inputs the mode,
  `htr`, the DHW storage, `htr.active` (or the condensation capacity), and which roles have an entity.

## Out of scope

- Writing HTR settings (setpoint, enable): the card stays read-only.
- The HTR setpoint and `htr_demand` as values: not shown.
- Per-service COPs (COP Heating, COP DHW, EER, their system variants): the system COP covers the footer.
- Exposing further registers, or a cooling power entity: a firmware change in esphome-ecoforest-ecogeo first.
- `add-hacs-release`, from the README's planned follow-ups.

## Impact

- Code: `src/config/roles.ts` (the `optional` flag), `src/config/keywords.ts`, `src/config/sample.ts`, the presence
  check of optional roles where the readings are read (`src/calc/readings.ts`; `src/config/resolve.ts` only passes
  the flag through), `src/calc/circuits.ts`, the footer (`src/diagram/labels.ts`, `src/strings.ts`), the
  binding check (`src/editor/binding-check.ts`), the emulator scenarios and naming (`dev/`).
- Tests: circuits, footer, binding check, roles and keywords; footer snapshots; the panel fit and footer wrap browser
  tests.
- Live installation: a release with deploy and a `?v=` bump of the dashboard resource. The live card config needs no
  change: the new roles' default entities exist under the card's `prefix`.
