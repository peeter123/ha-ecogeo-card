# Design

## Context

See proposal.md for the motivation and the facts with their sources. The state the design starts from:

- `circuitsFor()` (`src/calc/circuits.ts`) is a pure function of the derived mode, the features, the DHW storage and
  two readings (`brine.pump`, `heating.capacity`). It adds `htr` and `dhw_coil` only in `active_cooling`. Rendering
  reads only its output: `src/diagram/pipes.ts` derives the HTR water on the DHW lines (DHW temperature, fixed HTR
  speed) from `circuits.active` alone, without the mode. A heating run with `htr` and `dhw_coil` active therefore needs
  no drawing change.
- The role table (`src/config/roles.ts`) gives each role a domain, a firmware suffix, a kind and the manual item behind
  it. `resolveEntities` binds each role to its override or prefix default. `none` removes the role (card-config "Roles
  not present"). An entity Home Assistant does not know shows a muted dash.
- `footerItems()` (`src/diagram/labels.ts`) builds the footer from fixed roles: on/off, season, outside temperature,
  COP, condensation and evaporation capacity. The COP and the outside temperature are the key tier. The rest is detail
  tier and hidden in the compact layout.
- The editor's binding check (`src/editor/binding-check.ts`) warns about every role bound to an entity Home Assistant
  does not know, including prefix defaults.

## Goals / Non-Goals

**Goals:**

- One rule for optional roles that every new role uses, so that later firmware-only roles can follow it.
- The footer shows only the power figures that the mode actually produces, and never counts the same heat twice.
- Installations without the firmware's derived sensors (older firmware, no electricity meter, another integration)
  keep a working footer and the existing HTR rule without any configuration.

**Non-Goals:**

- No value labels for HTR in the drawing (no power at exchanger 9, no setpoint), at either detail level.
- No change to the drawing's geometry, label places or compact threshold.
- No automatic switch between a preferred and a fallback entity while the preferred one is merely unavailable.

## Decisions

### D1. HTR state: `htr.active` in heating and active cooling only

`htr.active` (binary_sensor, suffix `htr_active`, item 9) decides the HTR circuit in `heating` and `active_cooling`:
with HTR `true` and a DHW tank in use (`external` or `internal`), an `on` state adds `htr` and `dhw_coil` to the active
circuits; any other state (off, unknown, unavailable) leaves them out. Valve 26 stays towards ports 1/2. In `dhw`,
`passive_cooling`, `defrost`, `off` and `standby` the role is ignored. Derived inputs: the mode, `htr`, the DHW storage,
`htr.active`.

When `htr.active` has no entity (D3), the existing rule applies: in `active_cooling` only, HTR is active when the
condensation capacity (`heating.capacity`, register 5083, item 8) is above 0 W.

- Why not every mode: the live history shows HTR never running in a DHW cycle, but `htr_active` stays on for 25-30 s
  after DHW demand starts. Trusting the role in `dhw` would draw pump 17 and exchanger 9 next to the DHW production
  circuit at the start of every DHW cycle. In passive cooling, defrost, off and standby the compressor does not deliver
  discharge heat to exchanger 9, so there is nothing to recover.
- Why not `htr_demand`: it starts at the same moment and ends earlier; `htr_active` is the flag the firmware's HTR
  power estimate uses, so the drawing and the footer's HTR power agree.
- Why keep the fallback: installations without the entity keep today's behaviour in active cooling.

### D2. Footer power items follow the mode

`footerItems()` takes the derived mode, the features and the DHW storage and builds the power items from this table;
the condensation and evaporation capacity items are removed:

| Mode | Items (caption, preferred role, fallback) |
| --- | --- |
| `heating` | DG1: `heating.power`, else `heating.capacity`. HTR: `htr.power`, no fallback |
| `dhw` | DHW: `dhw.power`, else `heating.capacity` |
| `active_cooling` | Cooling: `cooling.capacity`. HTR: `htr.power`, no fallback |
| `passive_cooling`, `defrost`, `off`, `standby` | none |

The HTR item shows in `heating` and `active_cooling` whenever HTR can run there: HTR `true` and a DHW tank in use
(`external` or `internal`; with `unused` the HTR group is drawn but never active, so there is no item). It shows also
at 0 W while HTR is idle, so the footer's items change only with the mode and do not reflow on every HTR run. All power
items are in the detail tier, formatted like the capacities today (W, no decimals, a no-break space).

- Why by mode: the firmware's DHW power includes the HTR heat, so showing DG1, DHW and HTR together while heating would
  count the HTR heat twice. By mode, the items of one mode add up to the useful heat: DG1 + HTR is the condensation
  capacity while heating.
- Why not a fixed set of four with dashes: longer, it shows the HTR heat twice while heating, and three of the four
  would be dashes most of the time.
- Caption "DG1" rather than "Heating": the mode text already reads "Heating", and the firmware names the figure
  "Heating Power DG1". With the fallback, "DG1" shows the condensation capacity, which also holds any HTR heat; the
  docs say so.
- Cooling has no fallback because `cooling.capacity` is already the base figure. `cooling.capacity` keeps its role path
  and default; only its footer caption changes from "Evaporation" to "Cooling", and it shows in `active_cooling` only.

### D3. Optional roles

A role table entry gets an `optional` flag; the five new roles (`htr.active`, `htr.power`, `heating.power`,
`dhw.power`, `unit.system_cop`) set it. An optional role **has no entity**, and its consumer uses the fallback, when:

- it is set to `none`, or
- it is not bound in `entities` and its prefix default (or, without a prefix, nothing) is an entity Home Assistant does
  not know.

An optional role bound explicitly in `entities` keeps the existing rule: an unknown entity shows a muted dash, so a
typo stays visible. An entity that exists but is unknown or unavailable shows a muted dash (or, for `htr.active`,
counts as not on); the card never switches to the fallback because of a state. With the sample values (card-config
"Sample values for an empty config"), every optional role takes its sample value; there is no fallback.

The check needs the states, so it runs where the readings are read, not in `resolveEntities` (which stays a pure
function of the config). Both the preferred and the fallback entity are watched for changes, so the card re-renders
when a default entity appears after a firmware update.

- Why the absent-default rule and not `none` only: users on older firmware, without a meter, or with another
  integration would otherwise have to set four or five roles to `none` to get a working footer.
- Why no fallback on unavailable: during a meter outage or a reconnect the footer would switch between the system COP
  and the register COP, which are different numbers, without saying so.

### D4. System COP with the register COP as fallback

`unit.system_cop` (sensor, suffix `system_cop_display`, item footer, 1 decimal) is the footer's efficiency, with
`unit.cop` (register COP, suffix `cop`) as its fallback by D3. `unit.cop` keeps its default, so a user who set it
explicitly is not affected. Whichever role feeds the item, the value 0 shows as a muted dash: both report 0 outside a
settled run (compressor stopped, the first minute after a start, defrost). The caption is "EER" in `active_cooling` and
"COP" otherwise, as on the firmware's own display. It stays in the key tier, so the compact footer shows it.

- Why not change `unit.cop`'s default: a config that sets `unit.cop` explicitly, or relies on the register COP,
  would silently get another figure. A separate role keeps both and lets the fallback decide.

### D5. Binding check

The editor's binding check skips the "does not exist" warning for an optional role whose entity comes from the prefix
default. An optional role bound explicitly to an unknown entity is still warned about, and the unit and domain checks
apply to every bound role as before.

### D6. Editor and suggestions

The five roles appear in the advanced entity pickers in the groups of their path (`htr` becomes a group with two
roles). Each gets keywords in `src/config/keywords.ts` for the device suggestions, in the existing languages (for
example `htr recovery recuperacion recuperatie` with `active actief activo`, and `power vermogen potencia leistung`).
The three heat power roles exclude a candidate named as electrical power (`electrical elektrisch electrico`), since
the firmware also has `Electrical Power DG1/DHW` in W on the same device (card-editor "Suggestions for the HTR and
power roles").

### D7. Emulator

- A "heating with HTR" scenario: heating, `htr_active` on, DG1 and HTR power, and a DHW temperature below 54 °C.
- The firmware naming's other scenarios get values for the new roles (DG1 or DHW power by mode, `system_cop_display`),
  and the sample values (`src/config/sample.ts`) get them too.
- The foreign naming leaves the new roles unbound, so it shows every fallback: the condensation capacity as DG1 or DHW,
  the register COP, no HTR item, and the active-cooling rule.

### D8. Docs

`docs/ecogeo-card.md`: the HTR rule with the live observation behind it, the footer table of D2, the optional-role
rule of D3, the system COP and its meter dependency (and that users without a meter get the register COP), and that the
HTR power is the firmware's estimate. README: the footer and the new roles in the entity list.

## Risks / Trade-offs

- [The footer in a panel view no longer fits its 64 px allowance] -> The new footer is not longer than the old one: at
  most two power items with shorter captions ("DG1", "DHW", "Cooling", "HTR") where there were always "Condensation"
  and "Evaporation". The footer wrap and panel fit browser tests run on the longest new footer (active cooling with
  HTR, EER) at 624 px (`detail: simplified`) and 664 px (`detail: full`), just above where each detail level leaves
  the compact layout (its threshold plus the hysteresis), and in the 1280 x 800 panel view.
- [A default entity that is briefly missing from `hass.states`, for example while ESPHome reconnects, makes an optional
  role fall back for a moment] -> ESPHome entities stay in the state machine as `unavailable` during a reconnect, so
  they show a dash; only a removed or renamed entity falls back. Accepted.
- [The HTR power is an estimate and can read 0 W while HTR runs (model or temperature difference unknown)] -> The
  docs say it is the firmware's estimate; the drawing's HTR state comes from `htr_active`, not from the power.
- [The DG1 fallback (condensation capacity) includes HTR heat] -> Documented; installations with the firmware's split
  get the right figure.
- [A cooling season has not been observed with `htr_active`] -> In active cooling the role decides as in heating; the
  firmware's spec states HTR runs in cooling with `HTR Active` on. To be confirmed on the live installation next summer
  and recorded in `private/installation.md`.

## Migration Plan

No config change is needed: existing configs gain the new roles through the prefix, and without the entities they
fall back to today's figures. Release with `npm run release`, deploy `dist/ecogeo-card.js`, bump the dashboard
resource's `?v=` and check the live card while heating with HTR (DG1 and HTR items, exchanger 9 and pump 17 active).
Rollback: deploy the previous `dist/ecogeo-card.js` and bump `?v=` again.
