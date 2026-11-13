# Proposal

## Why

The card reads its values by the esphome-ecoforest-ecogeo naming (`<domain>.<prefix>_<suffix>`) and by that
firmware's own words (`OFF`, `Defrost`) and units. That works for one firmware only. Another ESPHome firmware, a
KNX or Modbus integration, or a renamed device or entity gives other entity ids, other state values and other
units. Users then have to find each of the 37 roles by hand, and even then the mode can be wrong. The card is meant
for every ecoGEO, whatever exposes its values.

## What Changes

- **Entity suggestions in the editor.** The user picks the heat pump's device; a "Suggest entities" button fills
  the roles from that device's entities, from certain to loose: the firmware naming with the prefix inferred from the
  device, then the firmware suffix, then fuzzy matching of the object id and friendly name against keywords per role
  (EN, NL, ES, DE), always within the role's domain and unit. It fills only empty roles and roles whose entity Home
  Assistant does not know, uses each entity once, leaves a role empty on a tie or a weak match, and reports what it
  filled and what it left empty. The result is written as explicit `entities`; the card itself does no matching and
  never reads the device (derived: the editor writes the config, the card reads only the config).
- **Roles not present.** `entities.<role>: none` marks a value the installation does not have. The role gets no
  entity (not even the prefix default) and its label or footer item is hidden, not shown as a dash. The editor offers
  a "Not present" choice of roles.
- **State values from any source.** A new top-level option `states` with two lists, `off` (the on/off values that
  mean off, default `[OFF]`) and `defrost` (the compressor modes that mean defrost, default `[Defrost]`)
  (firmware-entity: `heatpump_on_off`, `compressor_operation_mode`). The on/off and compressor mode roles also accept
  an on/off entity (on means running, and on means defrosting). Binary roles read any on/off-like state
  (`on`/`off`, `true`/`false`, `yes`/`no`, `1`/`0`) from any domain. The editor offers the values of an enum entity
  as choices.
- **Compressor and pumps running from what exists.** The compressor counts as running from the first of speed,
  percentage or power that has a value (power above a threshold); the speed and pump roles also accept an on/off
  entity (derived).
- **Units the card does not use.** Pressure is converted to bar (kPa, MPa, Pa, mbar, psi). A number whose unit the
  card does not know for its role (Hz for the compressor, rpm for a pump) is shown with the entity's own unit instead
  of the card's.
- **Binding check.** The editor warns about roles whose entity Home Assistant does not know and roles whose unit does
  not fit (a `%` entity on a temperature role).
- **Filled when added.** When the card is added from the card picker and exactly one device carries the firmware
  naming, the stub config sets its prefix, so the preview shows live values; otherwise the sample preview stays.
- **Emulator with foreign naming.** The dev emulator gets a second naming, a mock source with other entity ids,
  Dutch names, kPa, Hz, an enum compressor mode, a switch for on/off and missing roles, used for screenshots and as
  the test fixture for the suggestions.
- Documentation: a concise section in `docs/ecogeo-card.md` and the README on using the card with another source
  (`states`, on/off entities, `none`, units), plus the editor's suggestions.

No breaking change: every default reproduces today's behaviour, and the prefix stays as the YAML shortcut.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `card-config`: the `states` option, `none` for a role, roles not present.
- `live-values`: on/off states from any domain, pressure conversion, the entity's own unit, hidden roles.
- `operating-mode`: `off` and `defrost` from the value lists or an on/off entity, compressor and pumps running from
  what exists.
- `card-editor`: device picker and suggestions, roles not present, binding check, state value choices, the stub
  config from the device.
- `dev-emulator`: the foreign naming.
- `temperature-coloring`: a pump on without a percentage animates at the fixed medium speed.
- `outer-loop-source`: a fan speed in another unit rotates the fan at a fixed medium speed.

## Out of scope

- Detecting the model, variant, source or DHW storage from the device: it is a guess about the hydraulic layout.
  It needs the firmware to expose the source type (Registers.csv 5143), a change in esphome-ecoforest-ecogeo, and then
  a follow-up change here.
- Resolving entities from the device at render time (registry-driven resolution): the card stays a pure function of
  its config.
- Inverted binary sources (a "heating season" entity for `unit.summer`): a template binary sensor covers it.
- A configurable sentinel: -999.9 cannot occur as a real reading on other sources.
- Translations of the keywords beyond EN, NL, ES and DE, and translations of the editor.

## Impact

- Code: `src/config/` (`states`, `none`, the role table's keywords and directions), `src/calc/readings.ts` and
  `mode.ts`, `src/lib/units.ts` and `availability.ts`, the labels and footer (hidden roles), `src/editor/`
  (device picker, suggestions, checks, value choices), a new pure suggestion module, `src/card/ecogeo-card.ts`
  (`getStubConfig`), `dev/` (the foreign naming), tests, README and docs.
- Depends on `add-card-editor` being archived (done).
- Live installation: yes. Release, deploy and `?v=` bump. Its dashboard config (prefix only) stays unchanged and
  must render exactly as before; the editor's new parts are checked on the live installation by the user.
