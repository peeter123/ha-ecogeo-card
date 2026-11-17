# Proposal

Status: stub, to be explored (`/opsx:explore`) before design, specs and tasks are written. The open questions at the
end are the explore session's agenda.

## Why

The card draws HTR (heat recovery: exchanger 9, pump 17, valves 22/25, manual-figure) as active only in active
cooling, and only when the condensation capacity is above 0 W (operating-mode "HTR recovery in active cooling",
`src/calc/circuits.ts`). In every other mode HTR is drawn idle, because when the card was planned the firmware did not
expose the HTR state (coil 210, `docs/ecogeo-card.md`). That assumption no longer holds:

- The firmware now exposes the HTR state and its values (firmware-entity, see Facts).
- HTR also runs while heating. On the live installation on 2026-11-17 the unit was in heating (DG1 demand on,
  "Direct Heating") with `htr_active` on and about 1835 W of HTR heating power going into the DHW tank (49.5 °C against
  an HTR setpoint of 54 °C), while the card showed exchanger 9 and pump 17 idle and the DHW lines muted. The
  operating-mode scenario "HTR idle while heating" states the opposite of what the unit does.

## What Changes

A first sketch, to be settled in explore:

- **HTR state from an entity.** A new role, for example `htr.active` (binary_sensor, firmware suffix `htr_active`),
  overridable and settable to `none` like every role, with keywords for the editor's entity suggestions.
- **HTR in any mode where it runs.** When the role has a value, it decides whether the HTR circuit (exchanger 9,
  pump 17, the HTR water to the DHW lines) and the DHW coil are drawn active, in heating as well as in active cooling,
  with `htr: true` and a DHW storage in use. Valve 26 stays towards ports 1/2. When the role has no value, today's
  active-cooling rule stays as the fallback.
- **Maybe HTR values.** The HTR heating power, the HTR setpoint or the HTR demand as values at exchanger 9 or pump 17,
  at the full detail level only, or not at all.
- Emulator scenarios for heating with HTR (and DHW with HTR, if the firmware allows it), docs and README.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `operating-mode`: HTR recovery follows the HTR state entity in every mode when it has a value; the active-cooling
  rule becomes the fallback; "HTR idle while heating" changes.
- `card-config`: the new role and its default entity.
- `card-editor`: the new role in the advanced pickers and the entity suggestions.
- `temperature-coloring`: the HTR water segments carry the DHW temperature during HTR recovery in any mode.
- `live-values`: only if HTR values are added.
- `dev-emulator`: scenarios with HTR active while heating.

## Facts and their sources

- Exchanger 9, pump 17, valves 22 and 25, valve 26, DHW coil: manual-figure (unchanged).
- `binary_sensor.<prefix>_htr_active`, `binary_sensor.<prefix>_htr_demand`, `sensor.<prefix>_heating_power_htr` (W),
  `sensor.<prefix>_htr_setpoint` (°C), `sensor.<prefix>_total_heating_energy_htr` and
  `sensor.<prefix>_total_daily_heating_energy_htr` (kWh): firmware-entity, seen on the live installation with firmware
  2026.9.1 built 2026-11-15. Their exact suffixes and units are to be checked against the esphome-ecoforest-ecogeo
  repo, not taken from the live host.
- The register behind `htr_active` (coil 210 or another): Registers.csv, to be confirmed in explore.
- During HTR recovery while heating, the live unit reported the same value for `heating_power_dhw` and
  `heating_power_htr`: firmware-entity, observed once; whether that is by design needs checking.
- Whether HTR is active: derived, inputs the new role, `htr`, the DHW storage and the mode (and the condensation
  capacity when the role has no value).

## Out of scope

- Writing HTR settings (setpoint, enable): the card stays read-only.
- Exposing further HTR registers: a firmware change in esphome-ecoforest-ecogeo first.
- Anything else from the README's planned follow-ups (`add-hacs-release`).

## Live installation

Expected: a release with deploy and a `?v=` bump of the dashboard resource. The live card config should need no
change, since the default entity follows the firmware naming with the card's `prefix`; to be confirmed when the role
is named.

## Open questions for explore

1. Does HTR run in DHW mode too, and what then flows where (valve 26 towards ports 5/6, and pump 17 at the same time)?
2. Should `htr_demand` matter to the drawing (demand without activity), or only `htr_active`?
3. Which HTR values, if any, are worth showing, and at which detail level and layout?
4. Does the heating mode's drawing change while HTR is active (the discharge line through exchanger 9 coloured as
   giving heat, the DHW tank charging), beyond the HTR circuit and the DHW coil?
5. Does the fallback rule (active cooling with condensation capacity above 0 W) stay, or go once the role exists?
6. The emulator's foreign naming: what does a non-ecoGEO naming call this entity, if anything?
