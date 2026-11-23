# ecoGEO card

This page explains the ecoGEO schematic card: what it shows, where each fact comes from and how the pieces fit
together.

## Purpose

The card draws the internal schematic of an Ecoforest ecoGEO heat pump (the hydraulic and refrigerant circuits) as
inline SVG, shows the live value of each sensor beside its component, and colours the pipes by temperature. It
reads entities from Home Assistant and never writes to them.

## Sources of truth

Every fact in the card, and in this document, is marked with where it comes from:

- **manual-figure**: the ecoGEO technical service manual, section 3.1 "Component location" (item numbers 1 to 54,
  figures B1 to B4 and C). Every drawn component and pipe cites its item number. The geometry follows the figure's
  topology, not its exact coordinates.
- **firmware-entity**: entity names and units as exposed by the `esphome-ecoforest-ecogeo` firmware (object ids
  `<prefix>_<suffix>`, default prefix `ecoforest_ecogeo`). The card's default entity mapping follows this naming.
- **Registers.csv**: the register list in the firmware repository, for the meaning and range of registers the
  firmware does not expose yet.
- **derived**: a state the card infers (operating mode, valve positions, active circuits). Each derived state names
  its inputs and is a pure, unit-tested function.

## Variants

The manual's section 3.1 "Component location" (page 34) shows four figures, B1 to B4, of the same unit. They differ
only in the cooling parts (manual-figure). The card's `variant` option selects the matching preset; the `features`
option overrides single parts.

| Variant (figure) | `active_cooling` (item 14) | `passive_cooling` (items 10, 27, 28) | Source |
|---|---|---|---|
| 1 (B1) | no | no | manual-figure, section 3.1, page 34 |
| 2 (B2) | no | yes | manual-figure, section 3.1, page 34 |
| 3 (B3) | yes | no | manual-figure, section 3.1, page 34 |
| 4 (B4) | yes | yes | manual-figure, section 3.1, page 34 |

- B1 has no cooling parts, B2 has passive cooling, B3 has active cooling and B4 has both.
- The HTR (items 9, 17, 22) and the outlet resistor with its thermostat (items 44, 45) appear in all four
  figures, so they are not part of any preset: `htr` and `backup_heater` default to `true` for every variant.
- Figure B2 shows a stray label "14" without a valve symbol. It is taken to be an error in the figure: variant 2 has
  no cycle inversion valve.
- A feature state is `true`, `false` or `unused`. `unused` draws the part muted and stops the card from deriving
  the part's own function; exchanger 10 with valves 27 and 28 still takes part in a defrost.

## Configuration

The options, feature states and the role table (every role with its firmware entity suffix, unit and manual item)
are in the [README](../README.md#configuration). The role table is the single source in `src/config/roles.ts`
(firmware-entity names and units; manual-figure item numbers). An entity for a role is chosen in this order: the
override in `entities`, then `<domain>.<prefix>_<suffix>` when `prefix` is set, then none. With neither a prefix
nor an entity the card shows built-in sample values, taken from a heating day of the live unit.

## Visual editor

`getConfigElement()` returns the `ecogeo-card-editor` element: Home Assistant's `ha-form` with a schema generated from
the option table (`src/config/options.ts`) and the variant presets (`src/config/variants.ts`), so a new option cannot
be left out of the editor. The mechanics are copied from the hrv-ventilation card editor (the editor element, the
schema helpers and the field builders, each file naming its source in its header). `getStubConfig(hass)` runs the
suggestion module's candidate and prefix steps over every device and counts the exact firmware ids
`<domain>.<prefix>_<suffix>`: exactly one device with at least half of the roles gives `{ prefix }`, so the picker's
preview shows that device's live values. Otherwise, and without `hass` (Home Assistant passes it, though the developer
docs do not say so), the stub is empty and the preview shows the sample values.

The sections are Unit (model, variant, source, DHW storage), Entities (the device picker and the prefix), Features (the
four features), Appearance (exchanger fill, layout, colour stops), Advanced entities (one picker per role, with
the "Not present" choice) and State values (the `states` lists). The variant is a select of the four variants, and the
DHW select offers only the storages the model allows (B: external, unused, none; C: internal, unused). The schema is
built from the config being edited: the DHW storage's default follows the model, and the empty choice of each feature is
labelled with the preset of the current variant. A feature is a select whose form values are text (`default`, `true`,
`false`, `unused`) and whose config values are a boolean, `unused` or no key at all.

The advanced entity pickers are built from the role table: an `entities` section with one section per role group (in the
table's order of first appearance) and one `entity` selector per role, filtered to the role's `accepts` domains and
labelled from `src/strings.ts`. A role set to `none` has no picker. Sections nest, so the form data has the config's own
shape, `entities.<group>.<role>`. They sit behind an "Advanced settings" switch, a separate `ha-form` with editor-local
state that starts on when the config has `entities` or `states` and is never written to the config; turning it off hides
the pickers and keeps the overrides (the editor does not lock the switch on, unlike the hrv-ventilation editor).

Entity discovery lives in the editor only; the card's render path never reads the registry or the suggestion module. The
device picker is an `ha-form` field with the `device` selector (no integration filter, so any integration works;
suggestions only reach entities that belong to a device, and entities without one, often YAML-configured Modbus or KNX,
are bound with the pickers), and the picked device is editor state, like the switch. "Suggest entities" is a native
`<button>` styled with theme variables, so the editor still contains no Home Assistant element but `ha-form`. It calls
`suggestEntities` (`src/suggest/suggest.ts`, the scoring of the design) with `hass.states`, `hass.entities`,
`hass.devices`, the device and the config, merges the result into `entities`, fires `config-changed` and turns the
switch on; the report (roles filled, roles left empty) is editor state shown until the next edit. "Not present" is a
`select` selector with `multiple` over the role labels, a virtual field: it is shown from the `none` values and folded
back into them, so adding a role writes `none` and removing it deletes the key (empty parents are pruned). The
`states.off` and `states.defrost` fields are `select` selectors with `multiple` and `custom_value`; their options are
the `attributes.options` of the entity bound to `unit.on_off` (off) or `compressor.mode` (defrost), plus the default,
and the schema is rebuilt when those options change. An empty list is always dropped and stays blank in the form until a
value is added; a list equal to its default is dropped too, unless the config already had it. The binding check
(`src/editor/binding-check.ts`) is a plain list: each role bound to an entity not in `hass.states` is a warning (except
an optional role, whose entity comes from the prefix default and does not exist: the firmware-only HTR, heat power and
system COP entities are often absent, so that default is not warned about, while an optional role set in `entities` to
an unknown entity still is, and `defaultedRoles` in `src/config/resolve.ts` is the one notion of "from the prefix
default"), and each bound to an entity whose domain is not accepted, or whose unit does not fit (a domain check plus the
suggestion module's `unitFits`, so the unit rule has one source), is another; an unavailable entity is not judged by its
unit. The check is stricter than the card: it also warns about a pressure or pump entity without a unit, which the card
still shows (pressure as bar, pump as %). It never fires `config-changed`.

The keywords of the HTR state, HTR power, DG1 power, DHW power and system COP are in `src/config/keywords.ts` like every
other role. A role may list `exclude` words: a candidate whose names or id contain one is not scored for that role (the
`_<suffix>` id rule still applies). The three heat power roles exclude electrical power ("Electrical Power DG1/DHW",
`electric`, `elektr`, which the firmware has in W on the same device); the DG1 power also excludes DHW and HTR words,
the DHW power HTR words, and the HTR power DHW words. `unit.cop` excludes the system words (`system`, `systeem`,
`sistema`), so a plain "COP" and a "System COP" no longer tie by names alone. An exclude word left in a friendly name (a
brand such as "Mitsubishi Electric", or a device named "System") leaves the role empty rather than binding it wrongly.

The colour stops are flat fields `colors_<i>_temperature` (a number box in °C) and `colors_<i>_color` (Home Assistant's
`color_rgb` selector, which reports `[r, g, b]`), one row per stop plus an empty row, because `ha-form` has no
list-of-objects selector. The rows are an editor-local draft, built from the config (the default stops when `colors` is
absent, plus one empty row whose colour starts at the neutral grey, because the native colour input shows black without
a value) when the editor opens or when `colors` arrives from outside, meaning it differs from the last list the editor
fired. Home Assistant's number box reports every keystroke, so the draft keeps the typed order (a row whose temperature
is cleared stays visible with its colour, and exactly one empty row stays at the end). On every change the draft is
folded back into `colors` (`src/editor/color-rows.ts`), without re-laying out the rows: the row keys never reach the
config, rows without a temperature are dropped, stops are sorted by temperature, rows equal to the default stops remove
the key, and rows equal to what the config already has leave it untouched, so a colour written as `#FFF`, a name or
`var()` round-trips as written (a name or `var()` shows black in the picker and keeps its text until a colour is picked;
a non-array `colors` is kept while the rows are still the defaults). Validation is the card's own (`colorsErrors`); its
message shows above the form.

What the editor writes follows three rules:

- Defaults are shown but not written. `ha-form` does not draw the default of a selector, so the editor fills the
  form's data with the defaults of unset fields and takes them out again before saving, unless the config already had
  the key.
- A cleared field removes its key, and stays empty in the form until the config changes from outside, so typing a
  new value does not append to the refilled default. An emptied `features` or `entities` group, and an emptied
  `entities.<group>`, is removed, unless the config had it empty.
- Keys the editor does not show are passed through unchanged: `type`, `grid_options`, `view_layout` and any other.

The editor shows the card's configuration error (`configErrors`) above the form, for example a DHW storage that does
not fit the model. It only fires `config-changed`: it calls no service and writes no entity, like the card. It is
tested with a stand-in `ha-form` (as in hrv-ventilation), including a round trip of every emulator configuration; the
real form is checked once on the live installation.

## Operating mode

The mode is derived (derived), by a pure function that names its inputs: `unit.on_off`, `compressor.mode`,
`compressor.speed`, `compressor.percentage`, `compressor.power`, `dhw.demand`, `unit.summer`, `production.pump`, the
`states` lists and the `active_cooling` and `passive_cooling` feature states. The first row whose condition holds wins.

| Order | Mode | Condition |
|---|---|---|
| 1 | Off | `unit.on_off` matches `states.off` (default OFF, case-insensitive), or its on/off entity reads off; EMERGENCY is not off |
| 2 | Defrost | `compressor.mode` matches `states.defrost` (default Defrost, case-insensitive), or its on/off entity reads on; Balance is not defrost |
| 3 | DHW | the compressor runs and `dhw.demand` is on |
| 4 | Active cooling | the compressor runs, `unit.summer` is on and `active_cooling` is `true` |
| 5 | Heating | the compressor runs |
| 6 | Passive cooling | the compressor is stopped, `unit.summer` is on, the production pump runs and `passive_cooling` is `true` |
| 7 | Standby | everything else, including an unknown running state (no speed, percentage or power) |

The compressor runs by the first of its speed (above 0, or on), its percentage (above 0) and its power (above 100 W)
that has a value; a pump runs when its speed is above 0 or it is on. If the compressor has none of the three, whether
it runs is unknown and the mode is Standby unless it is Off or Defrost. An unavailable or unknown input counts as not
running or not active. The alarm (`unit.alarm`) and the bridge connection (`unit.connection`,
the ESPHome device's connectivity, not the heat pump) never change the mode: they add an Alarm and an Offline
indication.

Valves and circuits follow the mode (also pure, in `src/calc/circuits.ts`):

| Mode | Valve 26 | Valve 14 | Valves 27/28 | Active circuits |
|---|---|---|---|---|
| Heating | ports 1/2 | normal | closed | refrigerant, brine, production to ports 1/2; with HTR recovery also HTR and the DHW coil |
| DHW | ports 5/6 | normal | closed | refrigerant, brine, production to ports 5/6, DHW coil |
| Active cooling | ports 1/2 | reversed | closed | refrigerant, brine, production to ports 1/2; with HTR recovery also HTR and the DHW coil |
| Passive cooling | ports 1/2 | normal | exchanger 10 | brine, production to ports 1/2, exchanger 10 |
| Defrost | ports 1/2 | normal | exchanger 10 | the same as passive cooling; the refrigerant is idle |
| Off, Standby | ports 1/2 | normal | closed | none |

- The brine circuit is active only while the brine pump runs.
- A circuit whose part is `false` or `unused` is never active, except exchanger 10 with valves 27/28 in a defrost
  (and not at all when `passive_cooling` is `false`).
- HTR recovery: in heating and active cooling, with `htr` `true`, a DHW storage in use (external or internal) and
  `htr.active` on (item 9), the HTR circuit (exchanger 9, pump 17) and the DHW coil are active and valve 26 stays
  towards ports 1/2. Any other state of `htr.active` (off, unknown, unavailable) leaves HTR drawn idle. The firmware's
  flag is the one its HTR power estimate uses, so the drawing and that power agree.
  - Live observation: on the live installation HTR ran during heating (DG1 demand) and `htr_active` switched on and off
    with each run; it never ran during a DHW cycle.
  - DHW mode ignores the role: `htr_active` stays on for 25 to 30 s after DHW demand starts, so trusting it there
    would draw pump 17 and exchanger 9 next to the DHW production circuit at the start of every DHW cycle. Passive
    cooling, defrost, off and standby ignore it too: the compressor delivers no discharge heat to exchanger 9 there.
  - Fallback: when `htr.active` has no entity (older firmware, `none`, see the optional roles below), the previous rule
    applies in active cooling only: `heating.capacity` (the condensation capacity, item 8) above 0 W. The capacity
    is above 0 W for the whole heating run, so it cannot tell HTR apart there, and heating never shows HTR in the
    fallback.
  - HTR in active cooling follows the firmware's description; a cooling season has not been observed with
    `htr_active`.
- Without DHW storage (`dhw: none`, model B only) or with an unused tank (`dhw: unused`) there is no DHW loop, so the
  DHW mode has no DHW circuits (no circuit to ports 5/6, no DHW coil) and HTR is never active. The DHW mode is still
  derived and labelled, and valve 26 follows it.

## Using another source

The card reads the firmware's entities by default. Any role can be bound to another entity (`entities`), and the
card reads what it finds.

- A number role wants a numeric state. Temperatures, power and pressure are converted: °F to °C, kW to W, and kPa,
  MPa, Pa, mbar and psi to bar.
- A unit the card cannot convert is shown as it is: a compressor speed in Hz reads "45 Hz", a pump in rpm
  "2400 rpm". A temperature, difference or power in an unknown unit has no value.
- A yes/no role (demand, summer, winter, alarm, connection) reads `on`, `true`, `yes` and `1` as on, and `off`,
  `false`, `no` and `0` as off, from any domain.
- The on/off, compressor mode, compressor speed and pump roles also take an on/off entity (`binary_sensor`, `switch` or
  `input_boolean`). Its label (compressor speed, pumps) reads "On" or "Off". On the on/off role,
  off means the unit is off; on the compressor mode role, on means defrost. A sensor that reads `1` on a text role stays
  text.
- Text roles are compared with `states`, which replaces the firmware's texts:

```yaml
type: custom:ecogeo-card
prefix: heatpump
states:
  off: [Uit, Standby]
  defrost: [Ontdooien]
```

- A role the unit does not have is set to `none` (`entities: { brine: { pressure: none } }`): no default entity, no
  label or footer item, and no value for the mode. Its component stays drawn. An unknown or unavailable entity
  keeps its label with a dash instead. `none` counts as an entity setting, so it does not give the sample. Hiding the
  footer's efficiency takes both `unit.cop` and `unit.system_cop` set to `none`: a config with only `unit.cop: none`
  shows the system COP once the firmware has `system_cop_display`.
- Five roles are optional, because only newer firmware has their entities: `htr.active`, `htr.power`, `heating.power`,
  `dhw.power` and `unit.system_cop`. An optional role has no entity, and whatever uses it takes its fallback, when it is
  set to `none`, or when it is not set in `entities` and its prefix default does not exist in Home Assistant (without a
  prefix there is no default, so an unset optional role has no entity). A role set to an entity id keeps it, so a typo
  shows a muted dash, and so does an entity that exists but is unavailable or unknown: the card does not switch to the
  fallback because of a state. The sample values give every optional role its own value, never a fallback. The card
  watches the default entity, so it takes the role when the entity appears (for example after a firmware update).
- A brine pump set to `none` does not limit the brine circuit: the mode alone decides whether it is active. Without a
  production pump role the card cannot tell passive cooling from standby, so passive cooling is never shown.
- Without a compressor speed, the card takes the percentage, then the power (above 100 W, so the standby draw does
  not count). With none of the three the mode is Standby.
- A pump or fan that runs without a percentage (an on/off entity that reads on, or a speed above 0 in rpm) animates
  at a fixed medium speed.

## Drawing

The cabinet is drawn as inline SVG, in the viewBox of its layout (the horizontal layout's is 1000 units wide and 755
tall, the vertical layout's 740 wide and 797 tall, see The arrangement), and scales with the card width. There is
no image anywhere. Everything below cites the manual (manual-figure, section 3.1, figures B1 to B4 and C, item
numbers 1 to 54); coordinates are the card's own, the topology is the figure's.

### Parts the drawing leaves out

The drawing is one level of the manual figure (rework-layouts D1): it shows no item numbers and leaves out the service
and safety parts that have no live value, together with the stub pipes that lead only to them. (Until rework-layouts the
option `detail` chose between this level and a `full` one with every part and its item number; the option is gone, and
the card rejects it as an unknown option.) The parts left out:

| Items | Part | Why left out |
|---|---|---|
| 18, 19 | Brine and production expansion vessels | no live value, service hardware |
| 20, 21 | Brine and production safety valves | over-pressure protection, no live value |
| 23, 24 | Brine drain and production discharge valves | service only |
| 39, 40 | Suction and discharge mini-pressure switches | safety trip, no entity |
| 41 | Service outlets (both) | service only |
| 25 | HTR system discharge valve | service only, no live value (decided 2026-11-20) |
| 52, 53 | Model C manual trap and tank drain valve | service only |

The transducers 35 to 38 (they carry the pressure values), valve 22 (it defines the HTR loop) and thermostat 45 (it
belongs to resistor 44) stay.

### Component names and taps

Every drawn component carries its name from the manual's component list and its item number as a tooltip, for example
"Production circulator pump (15)", and the same text as its accessible name; the connections are named the same way
("Production outlet (1)"). The parts that are not manual items (the emitter, the air unit and its fan, the ground
collector and the external tank) carry their names alone ("Underfloor heating", "Radiator", "Air unit", "Air unit fan",
"Ground collector", "DHW tank"). A component with an entity of its own is a button: a click, Enter or Space opens that
entity's more-info dialog, as the value labels do. These are the compressor (rpm), expansion valve 12, condenser 8 and
evaporator 7 (their temperatures), pumps 15 and 16, valve 26 (the DHW demand), probes 29 to 34, transducers 35 to 38,
the air unit's fan and the tanks (the DHW temperature), and the emitter (the DG1 demand; without that entity it is
neither tappable nor focusable). The other components have no entity of their own and are neither tappable nor
focusable. While the card shows its sample values nothing is tappable.

### Items drawn

No item number is drawn as text (the tooltip of each component carries it, see above). Parts in italics depend on a
feature or on the DHW storage (see below). Items 18 to 21, 23, 24, 39 to 41, 52 and 53 are not drawn (see Parts the
drawing leaves out), and the list below holds only the drawn items.

| Items | Symbol | Part |
|---|---|---|
| 1, 2 | port | Production outlet and return (DG1) |
| 3, 4 | port | Brine outlet and inlet (the outer loop) |
| 5, 6 | port | *DHW inter-accumulator outlet and inlet (model B with an external tank only)* |
| 7, 8 | plate exchanger | Evaporator and condenser |
| *9* | plate exchanger | *HTR system exchanger, on the discharge line* |
| *10* | plate exchanger | *Passive cooling / defrosting exchanger* |
| 11 | compressor | Compressor |
| 12, 13 | expansion valve, filter dryer | Electronic expansion valve, filter dryer |
| *14* | inversion valve | *Cycle inversion valve, drawn in its position (normal or reversed)* |
| 15, 16, *17* | pump | Production, brine and *HTR* circulator pumps |
| *22* | valve | *HTR system retention valve* |
| *26* | three-way valve | *DHW valve, drawn in its position (towards ports 1/2 or the DHW lines)* |
| *27*, *28* | three-way valve | *Passive cooling production and brine valves, drawn in their position* |
| 29 to 34 | probe T | Suction, discharge, brine outlet, brine inlet, production outlet and production return probes |
| 35, 36, 37, 38 | transducer P | Suction, discharge, brine and production pressure transducers |
| *44*, *45* | resistor, thermostat | *Outlet resistor and safety thermostat* |
| *47, 48, 49* | port | *Model C only: tap water inlet, DHW outlet and recirculation, on the top edge (see Source and DHW)* |
| *50, 51* | tank, coil | *Model C only: the integrated DHW storage tank and its coil* |
| *54* | probe T | *Model C only: the DHW temperature probe on the tank wall* |

Items 42 and 43 (cooling outlet and inlet of the inverter) and 46 (electrical panel) are not drawn: they carry no
production, brine or refrigerant flow and have no live value.

Probes 33 and 34 sit on the production outlet and return lines, 31 and 32 on the brine outlet and inlet lines, 30 on
the compressor discharge and 29 on the suction line, as in the figure.

### Features and DHW storage

- `true`: the part is drawn normally.
- `false`: the part is not drawn and its pipes are closed off as in a variant without it, by a straight pipe that
  replaces it. Without passive cooling, exchanger 10 and valves 27/28 go and the production and brine lines run
  straight through. Without HTR, exchanger 9, pump 17 and valve 22 go and the discharge line runs from the
  compressor straight to valve 14. Without active cooling, valve 14 goes and the discharge line runs straight to the
  condenser and the evaporator straight to the compressor. Without the backup heater, resistor 44 and thermostat 45
  go.
- `unused`: the part is drawn muted and is never active, except that exchanger 10 with valves 27/28 is drawn active in a
  defrost. Pipes that only serve it are muted; a pipe that merely passes through it (for example the discharge line
  through exchanger 9) stays normal.
- Without DHW storage (`dhw: none`, model B only) connections 5/6, valve 26 and the whole HTR group (9, 17, 22) are
  not drawn, because HTR only makes sense with a DHW storage; ports 1/2 connect straight to the production circuit, and
  the discharge line runs from compressor 11 straight to valve 14.
- Model C draws no connections 5/6. The DHW lines of valve 26 run into the integrated tank (items 47 to 54), drawn
  under the top edge (see Source and DHW).

### The arrangement

All coordinates of the drawing live in one value, an `Arrangement` (`src/diagram/geometry.ts`). It holds the viewBox,
the cabinet's outline, the zones (the integrated tank 50 with coil 51 inside the cabinet; above the cabinet the band
with its slots, the join lane and the bodies: the air unit, the ground collector, the external tank with its coil),
every component and pipe segment, the crossings and the value labels' placements. The band's pipes (the air coil, the
collector's probe, the link of the hybrid, the coil pipes of ports 5 and 6) and the labels placed from the zones
are generated from the arrangement's own zone constants, so they stay connected to their ports when a zone moves.

The cabinet's component and segment lists are authored once, in the cabinet frame (see The cabinet frame), so every
component keeps citing its item and its place in the B4 and C figures; the arrangement is derived from them by the maps
below. The card picks the arrangement with `arrangementFor(layout, key)`, a pure function of the layout the card shows
now (`horizontal` or `vertical`) and of the band key: the source, whether the external tank is drawn and the emitter
(see The band). The cabinet is the same for every key; the key only decides which slots of the band are filled, and so
where the bodies stand. An arrangement is built once per key. `bandKeyOf(context)` gives the key of a draw context.
Every consumer (the cabinet, the source, the DHW tank, the pipes, the labels and the card's viewBox) reads the
arrangement from the draw context the card builds, never from a module constant, so one drawing cannot mix two
arrangements. A draw context without an arrangement gets the horizontal one for its key, and `arrangementFor` without a
key gives the widest band (the hybrid with the tank). The key also says whether tank 50 is drawn (model C with internal
storage), because the vertical layout stretches the cabinet's top there (see The vertical arrangement). The frame itself
is not drawn by any layout; `FRAME` in `src/diagram/geometry.ts` exports it so that the tests can compare the
arrangement with it. The horizontal arrangement's viewBox is 1000 units wide (one unit is a tenth of a container-width
percent) and the vertical one's is 740, so a unit renders `width / 740` px there: the stroke widths take the viewBox's
width (`strokeWidths(width, viewBoxWidth)`) and the label font factor is per layout (see Minimum rendered sizes).

### The cabinet frame

The cabinet's parts are laid out once, in the cabinet frame: 720 units wide, the room of the widest band (the emitter
180, the hybrid source 322 and the external tank 160, with two gaps of 24: 710 units), and 520 tall, with its top edge
at y 0. The frame keeps the topology of the manual's figures B4 and C: the port order on the top edge, the order of the
parts along every pipe, the probe and HTR placements, the probe pairs, the transducers on their lines, the crossings as
hops (9, at most 15 as in the figure), and model C's tank 50 with coil 51, probe 54 and stubs 47 to 49. Every component
still cites its item number in the code. It does not keep the figure's coordinates. In the figure's frame (cabinet x 240
to 760, y 130 to 605) every symbol keeps its size and the union of the symbols' port spans covers y 214 to 428 without a
gap, so no map of it could open a row for a value, and in a first attempt at the phone-width layout the cabinet's values
landed 100 to 166 units from their parts. The frame is therefore re-authored with lanes (schematic-drawing "Cabinet
layout with value lanes"): the parts sit in rows and columns, and between them lie lanes, where the values sit.

A **row lane** is a horizontal strip across the whole cabinet that no part's box enters and only vertical pipes cross; a
**column lane** is the same in the vertical direction, crossed only by horizontal pipes. `ROW_LANES` and `COLUMN_LANES`
in `src/diagram/geometry.ts` record them with their ranges and the values they hold, and a unit test
(`test/diagram/lanes.test.ts`) checks them for every model, DHW storage, source and emitter, in the frame and in the
both arrangements under their maps. The horizontal layout widens the column lanes and may narrow the row lanes; the
vertical layout heightens the row lanes (it uses the frame with the identity x map).

Compressor 11, filter dryer 13 and exchanger 10 are centred on the frame's vertical centre line, x 360 (`CENTRE`;
decided by the user 2026-11-20, so they read as the middle of the drawing). The parts and pipes around them moved as far
as that needed, keeping the order along every pipe and the pairs; the column lane that opened the compressor row
(frame x 318 to 358) is gone, because the compressor now stands in its range. A unit test checks that the centres of 11,
13 and 10 lie within 2 units of the cabinet's centre line in the frame and in both layouts.

| Rows (frame y) | Parts |
|---|---|
| A, 8 to 74 | the DHW lines of valve 26 (supply at 42, return at 68), valve 26; model C: tank 50, coil 51 and probe 54 |
| B, 100 to 156 | the probe row (y 112): probes 33, 34, 31, 32 and pump 17; the transducer row (y 142): 38, 37 and valve 22; the compressor row (y 142): compressor 11 with the discharge and suction lines, and above them (y 126) probes 30 and 29 with transducers 36 and 35 |
| D, 228 to 408 | exchanger 9 (228 to 292), valve 14, thermostat 45 (y 254) over resistor 44 (y 300), and pump 16; exchangers 8 and 7 (319 to 405); the row at y 396: valve 27, pump 15, filter dryer 13, expansion valve 12, valve 28 |
| F, 444 to 506 | exchanger 10 |

| Lane (frame range) | Holds |
|---|---|
| Row, 76 to 100 | nothing in the horizontal layout (narrowed by 18 units there, to 6) |
| Row, 156 to 228 | the discharge and suction blocks (temperature over pressure, two rows) under their pairs, and the compressor speed in a third row under the compressor |
| Row, 408 to 444 | the expansion valve opening, centred under valve 12 |
| Column, 0 to 40 | production Out, left of probe 33 (thermostat 45 stands in probe 33's column, lower down) |
| Column, 77 to 117 | production In and the production pressure, between riser 1 (valve 26) and probes 34 and 38 |
| Column, 142 to 160 | nothing: the gap between the production trunk and the HTR column |
| Column, 229 to 269 | the value of pump 15, between the HTR column and exchanger 8 (tank 50 starts at 358) |
| Column, 542 to 572 | brine Out right of riser 3, the brine pressure left of transducer 37 and the value of pump 16 |
| Column, 609 to 667 | brine In, right of riser 4 and pump 16 |

What the frame moves against the figure, all of it keeping the order along the pipes: pump 17 and valve 22 stand in the
probe rows, above exchanger 9, which stands under the compressor row (the discharge line runs left along the compressor
row, past transducer 36 and probe 30, and down into exchanger 9's top port); thermostat 45 stands left of riser 1 in
probe 33's column, directly above resistor 44 with no other part between them (it is the resistor's safety thermostat,
and a unit test checks that they are neighbours); pump 16 stands on riser 4 at y 298, below transducer 37; and model C's
tank 50 fills the one stretch of columns between the lanes that is wide enough for it (x 358 to 532), 174 wide, so coil
51 sits in it with its ports 6 units inside the left wall. A unit test also checks that every cabinet label lies in a
lane: its anchor in the frame, its whole box in the horizontal arrangement (the values inside the bodies are not cabinet
labels).

### The horizontal arrangement

The card draws an arrangement of its own, not the frame: a cabinet 980 units wide instead of 720 and 502 tall instead
of 520, under a band that holds the emitter, the source and the tank (the viewBox is 1000 x 755). The cabinet fills
the drawing's width, so the labels beside the probes and pipes get room.

**The cabinet.** Its contents are the frame's under two monotone piecewise-linear maps, one per axis, so
every horizontal pipe stays horizontal, every vertical one vertical, and the order of all parts is kept: the port
order, the probe placements, the HTR placement and the hops carry over by construction. Symbols keep their size and
every column of parts keeps slope 1, so the pipes that end on a symbol's ports keep their distance; the x map only
widens the column lanes. The x map (`HORIZONTAL_MAP_X`, frame x to arrangement x, built by `laneMap` from the lanes and
`HORIZONTAL_LANE_EXTRA`; between breakpoints it is linear):

| Frame x | 0 | 40 | 77 | 117 | 229 | 269 | 542 | 572 | 609 | 667 | 720 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Arrangement x | 10 | 112 | 149 | 235 | 347 | 409 | 682 | 796 | 833 | 937 | 990 |

The 260 extra units (720 to 980) go to the lanes that hold values beside the parts they belong to, in proportion to
the width of the widest value at the threshold (92 units at 560 px, the place search's "widest box"), split equally
about the frame's centre line (decided by the user 2026-11-20): 130 in the lanes left of x 360 and 130 in the lanes
right of it, so the frame's centre line lands on the cabinet's centre (x 500) and compressor 11 and exchanger 10 stay
centred. Port 4 stays left of the tank's slot (x 830 to 990). Balancing did not cost the threshold (see The vertical
threshold):

- 0 to 40, +62: production Out beside probe 33, left of its body.
- 77 to 117, +46: production In and the production pressure, beside probes 34 and 38.
- 229 to 269, +22: the value of pump 15.
- 542 to 572, +84: brine Out right of riser 3, and the brine pressure and the value of pump 16 left of probes 32 and 37.
- 609 to 667, +46: brine In right of riser 4. Ports 5 and 6 (x 937 and 977) take the tank's slot.

The y map (`HORIZONTAL_MAP_Y`, from `HORIZONTAL_LANE_SHRINK`) shifts the cabinet's top edge under the band, 238 units
down, and narrows the one row lane that holds no value in this layout, the one from y 76 to 100, by 18 units, to 6
(frame y 0, 76, 100 and 520 become 238, 314, 320 and 740). The other two keep their 72 and 36 units: the discharge and
suction blocks (two rows 24 units apart, see The label places) and the compressor speed need the one, the opening the
other. The cabinet's bottom edge is at y 740, 15 units above the viewBox's. The y map does not depend on whether tank 50
is drawn: the horizontal layout does not change with it.

**No exceptions to the maps.** Every part of the cabinet, pipes and crossings included, is the frame's under the maps
(`test/diagram/simplified.test.ts` compares them). Pressure transducers 37 and 38 sit on their lines in the frame itself
(see How the B4 figure is laid out), so there are no stubs and no exception list (9 crossings, at most 15 as in the
manual's figure).

The invariants are tested on it for every source, DHW storage and model (`test/diagram/simplified.test.ts`): every part
inside its zone (the cabinet's parts inside the outline, the band's bodies inside the band and above the cabinet's
columns), no two parts overlap, ports 1-6 in order, every crossing a hop inside the cabinet and no crossing of pipes
outside it, and the source and tank pipes meeting their ports. The band has its own tests (`test/diagram/band.test.ts`),
the lanes theirs (`test/diagram/lanes.test.ts`).

### The vertical arrangement

The vertical layout (what a phone gets, verified from 320 px up to 1 px under the threshold) draws the same cabinet and
band as the horizontal one with a different pair of maps (rework-layouts D2): the identity on x, because the frame is
already 720 units wide, the room of the widest band, and a y map that heightens the row lanes.

- **viewBox.** 740 units wide (the cabinet at x 10 to 730 and 10 units of margin at each side), 797 tall with the band
  (cabinet 544 tall, top edge at y 238), 825 tall where tank 50 is drawn. It is not 1000 wide, so a unit renders
  `width / 740` px: `strokeWidths(width, viewBoxWidth)` takes the viewBox's width and the card passes its
  arrangement's, so pipes still render at least 2 px and outlines 1.25 px (at 320 px the pipes are 4.7 units wide and
  the outlines 2.9).
- **y map** (`VERTICAL_MAP_Y`, from `VERTICAL_LANE_EXTRA`, reasons in `VERTICAL_LANE_REASONS`): one lane gains height,
  the one under the compressor row (frame y 156 to 228) by 24 units, so it holds three rows of values at the 32 unit
  pitch of `PAIR_ROW_GAP.vertical` (the label height at 320 px with its margin): the discharge and suction blocks and
  the compressor speed. Frame y 0, 156, 228 and 520 become 238, 394, 490 and 782. The lane over the probe row holds no
  value, and the opening has its one row (36 units) under the valve row.
- **Tank 50's head.** Where tank 50 is drawn (model C with internal storage; `BandKey.internal`) the y map adds 28 units
  at frame y 10 to 24 (`VERTICAL_MAP_Y_TANK50`, `VERTICAL_TANK_HEAD`; decided by the user 2026-11-20). That range holds
  only tank 50's wall (its top is at y 8) and vertical pipes, no symbol: the DHW lines, valve 26, coil 51 and probe 54
  start below it, so they keep their size and move down with the tank's floor. The tank's wall stretches (the zone's
  height is `mapY(74) - mapY(8)`, 94 instead of 66), and the temperature sits above coil 51. The 28 units were found
  with the place search at 320 px: 24 left no place for tank 50's values in either engine. It is not a value lane: it is
  the one y-map breakpoint inside a body, and it applies only where tank 50 is drawn, because elsewhere the range holds
  only vertical pipes and growing it would leave an empty strip. The horizontal layout does not change.
- **Band.** The slots fill 710 of the 720 units in the widest case (the emitter at x 20 to 200), so the tank's slot (x
  570 to 730) lies over port 4 (x 607): the tank's pipe from port 5 runs left over port 4's riser, and the tank's jog
  (40 units over the top edge, `BAND_JOGS.vertical`) lies above port 4's (34), so the two never cross.
- **Fonts.** `LABEL_FONT_K.vertical` is 2.4: a label is 12 px tall at the 10 px floor, 12 * 1000 / 560 = 21.4 units at
  the horizontal threshold, and 1.2 * 2.4 * 7.4 = 21.3 units in this viewBox (1 cqw is 7.4 units), so labels are about
  as tall in units in both layouts at the threshold. The floor holds up to 417 px; at 320 px a 10 px label box is 23
  units tall, and above 417 px a label no longer grows in units, so the places found at 320 px hold up to the
  threshold.

**Rotated values.** In the vertical layout the hydraulic values beside vertical pipes are turned -90 degrees, reading
from bottom to top (decided by the user 2026-11-20): production Out, In and pressure 38, brine Out, In and pressure 37
and the pump 16 value. At 320 px they are 23 wide and 120, 105, 79, 120, 119, 79 and 69 units long (WebKit and
Chromium agree), and they fit the gaps between the vertical pipes beside their probes where horizontal values (the
gaps are 47 to 77 units wide, the text 92 to 120 units long) cannot. Their texts are the horizontal layout's, captions
included. `labels.ts` turns them about their centre (`.label.rotated`, `translate(-50%, -50%) rotate(-90deg)`), a
place records its `rotate: -90`, and `dev/overlaps.ts` measures a turned label by its rotated box (its half-leading is
at its sides). The refrigerant blocks, the compressor speed, the opening, the pump 15 value and the values in bodies
stay horizontal; the horizontal layout turns nothing. The Out, In and pressure of a side form one row, left to right
in that order, Out and In side by side at the same height (the shorter one's vertical extent lies within the longer
one's) and the pressure next to them (`ROW_GROUPS` in `dev/overlaps.ts`); the pump 15 value sits above pump 15,
horizontal.

**Gap places.** A rotated value and the pump 15 value may sit in a gap between vertical pipes beside their part, even
where that gap is not a lane through the whole cabinet, as long as it touches no part and no pipe (schematic-drawing
"Gap places in the vertical layout"). The lanes unit test therefore checks them for no part, no pipe at the pipe width
of a 320 px card and a distance from their part of at most 60 units (the recorded places are 10 to 46 units away), for
every source, DHW storage and emitter, instead of for a lane, and checks the row order and the shared height.

The vertical places (`VERTICAL_PLACES`, found with `npm run search-places -- --layout=vertical --width=320`, in the
arrangement without tank 50's head; `headShift` lowers them where it applies), identical in Chromium and WebKit over the
312 cases:

| Label | Place (x, y, alignment) | Where |
|---|---|---|
| Production Out (33) | 56, 424, middle, turned | left strip between the outline and riser 1, under probe 33 |
| Production In (34) | 96, 424, middle, turned | gap between riser 1 and the trunk (77 wide), left of probe 34's body, under it |
| Production pressure (38) | 132, 432, middle, turned | the same gap, next to In, under transducer 38 |
| Brine Out (31) | 532, 424, middle, turned | gap between the suction line and riser 3 (47 wide), under probe 31 |
| Brine In (32) | 628, 424, middle, turned | gap right of riser 4 (123 wide), in order after Out |
| Brine pressure (37) | 664, 420, middle, turned | the same gap, next to In |
| Pump 16 | 636, 560, middle, turned | the same gap, right of the pump |
| Pump 15 | 192, 620, start | horizontal, above the pump (the search keeps it no lower than its default place) |

The gaps between vertical pipes in the frame, in the rows beside the probes (frame x): 0 to 65, 65 to 142, 142 to 172,
172 to 193, 193 to 542 (the lane over the probe row only), 542 to 597 and 597 to 720. A rotated value needs about 37
units of free width (23 for its box, 2 x 4.6 for the margin, 2 x 2.35 for the half pipes): the 30 unit gap between the
trunk and the HTR column (x 142 and 172) and the 21 unit gap between the HTR column and the HTR riser (x 172, the water
column of pump 17 and valve 22, and x 193, the riser from exchanger 9 to the DHW supply line) are too narrow and hold
nothing.

The vertical layout is clean (zero overlaps, no margin, 0.5 px tolerance) at 320, 360, 412, 480, 520 and 559 px in every
scenario and installation (156 cases at each width) in both engines (`npm run measure-layout -- --layout=vertical
--widths=...`), and `test/card/overlaps.browser.test.ts` runs the same check for every scenario, installation and naming
at 320, 360, 412 and 559 px.

### The band

Above the cabinet lies the band (rework-layouts D3): a strip 176 units high (its top 6 units under the viewBox's top
edge) with three slots, left to right the DG1 emitter over ports 1/2, the outer-loop source over ports 3/4 and the
external DHW tank over ports 5/6, and under it the join lane, 56 units high, between the band's bottom edge and the
cabinet's top edge. Every body stands on the band's bottom edge, so the bodies' lower edges are level whatever their
height. Nothing is drawn beside the cabinet and no pipe runs over it: each pipe rises straight from its port into the
join lane, takes at most one horizontal jog there and rises into its part.

The emitter is the `emitter` option's body (see The emitter): 180 units wide, in the first slot. With `emitter: none`
its slot is empty (width 0) and gives its space to the others, and ports 1/2 keep short stubs.

**Slots.** `planBand` places the parts. Each is centred over the middle of its port pair (the emitter over ports 1/2 at
x 139 and 264, the source over 3/4 at x 694 and 827, the tank over 5/6 at x 937 and 977) where its width allows. Where
two parts would come closer than 24 units (`BAND.gap`) or leave the cabinet's columns, the parts move the least that
restores the order, the gaps and the bounds; neighbours that meet share the move (the cluster of the two centres on the
mean of their ideal places). A part of width 0 is empty: it has no slot and gives its space to the others, so the
arrangement is built per band key (the source, whether the external tank is drawn, the emitter): without a tank (`dhw:
none`, or model C, whose tank 50 is inside the cabinet) the hybrid is centred over its ports (x 590.5 to 912.5), with
the tank it moves left (x 484 to 806) and the tank ends at the cabinet's right edge (x 830 to 990). The source's width
is that of its body: 190 for the air unit, 120 for the collector, 322 for the hybrid (the air unit, 12 units of gap, the
collector). Ports 3/4 lie close together, so the source usually shifts left or right of its ports and the join pipes
jog.

**Joins.** The jogs lie at fixed heights above the cabinet's top edge (`bandJogs`): port 3's pipe at 22 units, the
tank's two pipes at 28 (at 40 in the vertical layout, where the tank's slot covers port 4: see The vertical
arrangement), port 4's pipe at 34 and the hybrid's link at 46, all above the stubs of connections 47 to 49 (12 units)
and under the band (56). Port 3's pipe jogs lowest, port 4's above it and the link highest, so a vertical piece never
meets a horizontal one: no two pipes outside the cabinet cross (a test checks it for every source and tank
combination), and no join pipe runs past another part, only under its own body. The tank's pipes jog outward, port 5's
to the left, port 6's to the right, into the columns left and right of the coil.

**Bodies.** None of the band's parts is a manual item: the manual's figures stop at connections 3 to 6. Their tooltips
carry their names alone ("Underfloor heating", "Radiator", "Air unit", "Air unit fan", "Ground collector", "DHW tank"),
no item number. Each body registers its obstacles inside (the coil panel and fan of the air unit, the hatching and
probe of the collector, the tank's rim) with `data-obstacle`, so the overlap check and the place search see them.
The values of a body are placed by functions of its zone (`bodySpecs` in `src/diagram/label-places.ts`), so they follow
the body.

One body height (decided by the user 2026-11-20): the emitter, the air unit, the ground collector (and the hybrid's two
bodies) and the external tank are all 176 units tall, in both layouts, each standing on the band's bottom edge. The band
was 170, the tank's height, with lower emitter, air unit and collector; the horizontal drawing grew 6 units (aspect
0.755, so the horizontal aspect test's bound is 0.76). How each body uses the extra height:

- **Emitter**, 180 x 176: an underfloor loop or a radiator, (see The emitter).
- **Air unit**, 190 x 176: the front view of an outdoor unit (decided with the user 2026-11-23). The coil panel (64 x
  120) stands on the left, inset by the margin, and the fan on its right (centre at 62 % of the width, ring of radius
  40). Eleven horizontal fins cross the panel, and the brine tube winds through it in four vertical passes, 14 apart,
  joined by U-bends at the top and bottom of the panel; it enters at the first pass and leaves at the last one, both on
  the panel's bottom face (18 and 60 units from the case's left edge), where the pipes from the join lane arrive. The
  case ends 8 units above the band's bottom edge and two small feet (24 x 8) stand under it on that edge, clear of those
  two pipe columns; the brine pipes cross the gap between the case and the edge into the panel. Three values sit in free
  boxes of the shape (`values`): the outside temperature above the fan, the fan speed below it, and the Out right of the
  coil panel at the case's bottom, beside the exit pass where the brine leaves. At 320 px, where a label is 10 px high,
  the three of them fit around the fan without touching an outline, a fin, a tube, the fan or each other
  (`air-values.browser.test.ts`).
- **Ground collector**, 120 x 176: a borehole, hatched along its top (14 units of diagonal ticks under the surface
  line), with the brine's probe hanging from it. The brine enters on the bottom face at the feed riser (9.5 units from
  the left edge: the pipe's edge on the 8-unit band margin), rises up the left side to a header just under the
  hatching, runs 20 units right into the first of two narrow U-loops (legs 16 apart, bends of radius 8), crosses a
  29-unit link to the second loop, runs 20 units on to the return riser and drops down it (9.5 units from the right
  edge) to the bottom face. The Out value sits at the bottom, below the loops' bends, ending just left of the return
  riser (its right edge 4.5 units left of it). A real double-U probe runs its two loops in parallel; they are drawn in
  series, so the brine has one path. The
  collector's halves take their temperatures (see Colours). At 320 px the Out fits clear of the pipes and the outline
  (`collector-out.browser.test.ts`).
- **External tank**, 160 x 176 with a dome of 14 on top and a flat bottom: see DHW storage.

**One band style** (decided by the user 2026-11-23). The four bodies share one corner radius (`BAND.radius`, 6 units,
also the tank's bottom corners), one outline weight (`max(2.5, --outline-width)`) and one inner margin (`BAND.margin`, 8
units), and draw no divider line from wall to wall: the air unit's values and the emitter's loop need none. The emitter,
the collector and the tank end flat on the band's bottom edge along their whole width, the air unit on its two feet (its
case ends above the edge), and the ground collector's hatching stays, because it is the surface and tells a collector
apart. Widths: emitter 180, air unit 190, ground collector 120, hybrid 322 (air unit, 12 units of gap, collector), tank
160.

### The emitter

The DG1 heating circuit's emitter (rework-layouts D5) is the first body of the band, over connections 1 and 2, so that
the production water visibly goes somewhere. It is not a manual item: the heating installation is outside the unit, and
the manual's figures stop at connections 1 and 2. Like the air unit, the collector and the tank it therefore cites no
item number (the comments in `src/diagram/emitter.ts` and `src/diagram/geometry.ts` say so); its tooltip names it,
"Underfloor heating" or "Radiator". The `emitter` option chooses it: `underfloor` (the default), `radiator` or `none`.

- **Pipes.** The supply pipe `dg1_sup` runs from connection 1 up through the join lane (at most one jog, 22 units over
  the top edge) into the body's bottom face and on to the inlet; the return pipe `dg1_ret` runs from the outlet to
  connection 2. On the radiator they meet the body 34 units inside its left and right edges; on the underfloor spiral
  both meet it at its centre, 14 units apart. Both are in the DG1 production circuit, like the cabinet's `p1_up` and
  `p2_in`, so activity and animation follow the circuit without logic of their own: they are coloured and animated
  while it is active (heating, passive cooling) and muted and still otherwise (DHW). The supply takes production outlet
  33 and the return production return 34, and the DG1 pipes inside the cabinet continue them (see Colours).
- **Underfloor** (`underfloor`), 180 x 176: a floor body (a rounded rectangle in the outline style) holding a bifilar
  spiral inside the band's 8-unit margin. It has three inward turns and a pitch of 14 units between adjacent runs, with
  rounded bends of half the pitch. The supply and return pipes enter on the bottom face side by side. The inward run
  winds clockwise from the supply pipe to the middle of the spiral's last turn, where it reverses; the outward run lies
  between the turns of the inward run and leaves at the return pipe. The two runs are band segments, `dg1_loop_in`
  (production outlet 33, the supply colour) and `dg1_loop_out` (production return 34, the return colour), both in the
  DG1 production circuit: so adjacent turns alternate between the warm and the cool colour, and the dash overlay runs
  in along the first and back out along the second like on the other pipes. Idle, both take the muted colour. The
  spiral has no gradient and does not depend on `exchanger_fill`. A tap on the runs reaches the body's button.
- **Radiator** (`radiator`), 180 x 176: a panel with six vertical columns (10 wide, 8 apart, 116 tall) in outline style.
  The supply pipe meets the first column at the top left (62 units under the body's top) and the return pipe leaves the
  last column at the bottom right (158 under it): inlet at the top on one side, outlet at the bottom on the other. With
  `exchanger_fill: gradient` (the default) the whole body is filled with the same vertical gradient, supply colour at
  its top to return colour at its bottom (opacity 0.5, the exchangers' 0.55 less a little for the columns);
  with `exchanger_fill: none` the body has no fill, and its outline, columns and pipes are drawn as with it.
- **No emitter** (`none`): the slot is empty and connections 1 and 2 end in the short dead-end stubs of the cabinet
  (`p1_stub`, `p2_stub`, band segments like the emitter's pipes, 12 units over the top edge, coloured, never animated).
- **No demand caption.** The body shows no "Demand" text, and without an emitter the stubs carry none either; the DG1
  demand is only the emitter's tap.
- **Tap.** The emitter is a button for the DG1 demand's more-info dialog (the role `heating.demand`); with that role set
  to `none` (or without an entity) it is neither a button nor focusable. Nothing is tappable while the sample values
  show.
- **Checks.** The radiator registers its columns (the spiral's runs are pipes) with `data-obstacle`; every pipe,
  the spiral's included, is sampled by the overlap check. `test/diagram/emitter.test.ts` holds the heating-emitter
  scenarios.

### How the B4 figure is laid out

The topology below is the figure's; the coordinates are the cabinet frame's (see The cabinet frame).

- **Top edge:** ports 1 and 2 are left, 3 and 4 right of centre, 5 and 6 far right. The DG1 emitter of ports 1/2 (or,
  without one, their stubs, 12 units long); the pipes of ports 3/4 and 5/6 rise from the top edge into the join lane of
  the band (see The band and the Source and DHW sections), so no pipe outside the cabinet crosses another.
- **DHW lines:** valve 26 sits on port 1's line. Its DHW output is the supply line across the cabinet to port 5, and
  the return line from port 6 runs back across to join port 2's line. Exchanger 9 taps the supply, pump 17 the return.
-  **Refrigerant:** compressor 11 is in the middle, drawn as the standard compressor symbol: a circle with two straight
  lines that start on it at the suction side and converge towards the discharge side, so the wide side faces the suction
  pipe (right) and the narrow side the discharge pipe (left). The symbol is open, as in the manual's figure: the circle
  and the two lines, drawn in the outline colour with no fill. The discharge runs left through 36 and 30 into HTR
  exchanger 9 and on to inversion valve 14, which feeds condenser 8 (heating) or evaporator 7 (active cooling). The
  expansion leg 8, 13, 12, 7 runs along the lower row; the suction returns through 29 and 35. Each temperature probe
  sits next to its pressure transducer as a pair on the same line, 22 units apart (30 at frame x 287 and 36 at 309 on
  the discharge line; 29 at 410 and 35 at 432 on the suction line), with no part between them. (The figure's
  mini-pressure switches 39 and 40 and service outlets 41 are not drawn.)
- **Valve 14's ports:** the three ports on its right are ordered suction (top), evaporator 7 (middle), condenser 8
  (bottom). The figure orders them evaporator, suction, condenser, which makes two refrigerant pipes cross; this
  order does not. It is a layout choice, the connections are the same.
- **Production:** the return trunk runs from the junction of ports 2 and 6 down to valve 27, pump 15 and condenser 8.
  From there the outlet runs left to resistor 44 and up past probe 33 to valve 26 and port 1. The resistor is drawn
  vertical on port 1's lane (the figure draws it horizontal with the return line passing behind it). Transducer 38
  sits on the production return riser of port 2 (frame x 142), under probe 34, drawn like
  probe 34 (body left of the riser, stem to it). The figure puts it on a tee towards vessel 19, safety valve 21 and
  drain 24; with those groups not drawn, drawing it on the line it measures, the same water on the same side of pump
  15, is the faithful simplification, and it needs no stub pipe.
- **Exchanger 10:** below the lower row, with valves 27 and 28 beside pump 15 and evaporator 7: production water
  passes one side, brine the other. Transducer 37 sits on port 4's line before pump 16 (frame x 597), under probe 32 and
  above the pump, drawn like probe 32 (the figure's tee towards vessel 18, safety valve 20 and drain 23 is not drawn,
  as for 38).
- **Crossings inside the cabinet:** the line from port 1 through valve 26 to port 5 separates port 2 from port 6, yet
  the DHW return from 6 has to join port 2's line, so at least one internal crossing is unavoidable. The figure has 15
  (14 hops, plus the return line passing behind resistor 44); this layout needs 9 (see The horizontal arrangement).
  Each is declared as data in `src/diagram/geometry.ts` and drawn as a hop, a small gap in one of the two pipes: the DHW
  supply and return across the lines of ports 2, 3 and 4 (5 hops) and across the HTR riser (1), the return trunk across
  the outlet line (1), the brine feed across port 3's line (1) and exchanger 10's brine pipes across each other (1).
  Tests fail when two pipes cross anywhere else.

## Source and DHW

The outer-loop source and the DHW storage are drawn in the band above the cabinet, the source over connections 3/4 and
the external tank over 5/6 (see The band). Their pipes are segments in `src/diagram/geometry.ts`, like the cabinet's, so
they take the same colour and animation (see Colours). The air unit, the ground collector and the external tank have no
item number in the manual; the manual's figures stop at the connections.

### Outer-loop source (`source`)

Connection 3 (brine outlet) and 4 (brine inlet) rise from the top edge into the join lane and into the source's bottom
face, port 3's pipe to the first connection of the body (the air unit's first pass, the collector's feed riser), the
body's exit down to port 4's pipe. They cross no pipe and pass under no other part. They belong to the brine circuit:
they are active with it, defrost included.

The drawing carries no captions that name a group or part ("DG1", "Outer loop", "DHW", "Air unit", "Ground loop", "DHW
tank"): the tooltips name the parts (see The band for the bodies and their sizes). The values inside the bodies are bare
numbers, with no Out or DHW caption either (the body and its tooltip name them). No value of the drawing
carries a "Demand" text.

- **Air:** the front view of an outdoor unit: a case on two feet, with the finned coil panel on the left and the guarded
  fan on its right. The brine tube winds through the panel in four vertical passes joined by rounded U-bends (half
  circles), across eleven horizontal fins. It enters at the first pass and leaves at the last one, both on the panel's
  bottom face, the side facing the cabinet: the feed reaches the first pass from port 3's pipe, the exit leaves the last
  pass towards port 4. The fan is a ring with a hub and five swept blades behind a static guard: three concentric rings
  and an X of four spokes, drawn thin like the fins so the blades stay visible. It rotates while `source.fan_speed` is
  above 0 % (a full turn takes 120 s divided by the speed in %, between 0.5 and 6 s) and stands still at 0 % or without
  a value. A fan speed in another unit (rpm) above 0 turns it at a fixed medium speed (3 s). It does not depend on the
  mode, so it also turns in standby when its own speed says so. With `prefers-reduced-motion` the fan stands still. The
  case's tooltip is "Air unit", the fan's "Air unit fan" (a button that opens the fan speed's more-info while the role
  has an entity).
- **Ground:** the collector (tooltip "Ground collector"): a borehole hatched along its top, with two U-loops in
  series. The brine runs in at the left, up the feed riser to the header, through the two loops (the feed, the header
  and the first loop are the collector's first half and take the brine outlet temperature, the second loop and the
  return riser its second half and take the brine inlet) and leaves down the return riser on the right to port 4.
- **Hybrid:** both on one brine loop, in series, side by side with the air unit first (left): port 3's pipe to the air
  unit's first pass, a link pipe from its last pass (down into the join lane, right and up) to the collector's feed
  riser, and the collector's exit to port 4. The link and the air unit's exit take the air unit's outlet temperature up
  to the first half of the collector. Series keeps the drawing free of crossings, which two branches in parallel would
  not.

The air unit shows the outside temperature (`source.outside_temperature`) above its fan and the fan speed
(`source.fan_speed`) below it, a whole percent for a percentage and the entity's own unit otherwise ("900 rpm"). The
source's Out is the brine temperature leaving the device, which is the heat pump's brine inlet, so the outer loop reads
at a glance without looking into the cabinet (probes 31 and 32 stay inside it). With `source: air` it is the air unit's
outlet (`source.air_unit_outlet_temperature`), right of the coil panel at the case's bottom, beside the exit pass; with
`source: ground` it is the collector's (`brine.inlet_temperature`) at its bottom, ending just left of the return riser;
the hybrid shows the collector's Out and the air unit's two other values, and the link pipe carries no label. The three
values of the air unit are bare, with no caption: the tooltips name them, and their places tell the two temperatures
apart (the outside one at the air intake on top, the Out at the outlet pipe). There is no In value. The outside
temperature is not in the footer while an air unit is drawn, so it is shown once. The air unit's values are value labels
that open more-info (see Live values). Known limitation: a fan speed in rpm with four
digits ("1450 rpm") is wider than the room right of the coil panel and can touch the panel in the vertical layout at
320 px; a percentage always fits.

### DHW storage (`dhw`)

- **External (model B):** ports 5 (outlet) and 6 (inlet), the manual's "DHW inter-accumulator", rise into the join lane
  and jog outward into the columns left and right of the coil, to a tank drawn as a rounded cylinder (straight walls, a
  domed top cap, a flat bottom with corners of the band radius) above them. The tank is centred on the coil and stands
  on the band's bottom edge. Its values, the DHW temperature (a bare number, no caption, at the regular weight and size
  of every value), sits in its upper part as a bare label on the tinted body, under the top cap's rim and over the coil:
  44 units under the tank's top. The coil starts 84 units under the tank's top, so the label clears it. The coil is a
  helix in the lower part of the tank, seen from the side: four and a half turns, the front half of each turn solid and
  the back half faint (35 % opacity). It is mirrored, so that port 5's pipe (the left one) reaches its upper left end
  and port 6's pipe (the right one) its lower right end, and the two pipes do not cross. The colour, the muting and the
  flow animation are those of the coil pipe; the dash overlay runs along the front halves only. An idle coil (no flow)
  is drawn in a neutral grey, darker than the other muted pipes in the light theme so that it stays visible on the
  tank's tinted body; the dark theme keeps the normal muted grey. While the coil is idle, the two pipes that feed it are
  drawn in that same grey where they run inside the tank (clipped to the tank body), so the grey changes at the tank
  wall and not at the joint with the coil. The back halves are drawn first, under the front halves, with butt caps, so
  the joints at the coil's sides are covered by a solid front half. Model C's coil 51 is drawn the same way, lying on
  its side, with closer (pitch 8) and rounder turns (seven and a half) than the external coil.
- **Internal (model C):** the integrated tank is drawn inside the cabinet, under the top edge, after figure C: tank 50
  with coil 51 (a helix, see above), probe 54 and the connections 47 (tap water inlet), 48 (DHW outlet) and 49
  (recirculation) on the top edge, their stubs below the join lane's jogs. Its DHW temperature sits inside
  tank 50, above coil 51. The figure's manual trap 52 and drain valve 53 are not drawn. The figure's tank is tall and
  fills the cabinet; this one is squat so that the probe row and the rest of the cabinet stay as in the B figures. It
  differs from the figure in these ways: 47 and 49 are short stubs that end at the tank's top rather than dip tubes (the
  coil fills the tank's height, so a tube would cross it), and probe 54 touches the wall. No tank is drawn in the band,
  so the source may use the tank's slot.
- **Unused (`dhw: unused`, either model):** the model's tank is drawn as above (on B the external tank and connections
  5/6; on C tank 50, coil 51 and the stubs 47 to 49; valve 26 on both), but muted: the tank body, outline and rim take
  the muted colour, the coil and the DHW pipes are muted and never animated, and the tank shows no values. HTR follows
  its own feature as with a tank in use (exchanger 9, pump 17 and valve 22 drawn, idle), and the discharge line
  routes as with a tank in use. No circuit to ports 5/6, no DHW coil and no HTR circuit is ever active; the mode label
  "DHW" still shows when the unit reports DHW mode, and valve 26 follows the mode.
- **None (model B only):** no tank, no DHW pipes, no connections 5/6, no valve 26 and no HTR group. The mode label "DHW"
  can still show when the unit reports DHW mode. Model C always has its integrated tank, so `dhw: none` there is a
  configuration error; use `unused`.

The tank body takes the DHW temperature colour through the custom property `--dhw-tank-color` (see Colours). The
source's Out and the tank's DHW temperature are live labels (see Live values).

## Colours

Every pipe is drawn twice: a base stroke in the colour of its temperature, and, while it flows, a dash overlay that
runs along it in the direction of the flow. The logic is in `src/diagram/colors.ts` (the scale) and
`src/diagram/pipes.ts` (which pipe takes which temperature, which is muted, which flows); both are pure functions
with unit tests.

### The scale

The scale is absolute: a temperature has the same colour whatever the other temperatures are. The default stops are

| Temperature | Colour |
|---|---|
| -10 °C | blue `#1e5aa8` |
| 10 °C | light blue `#5fa8e0` |
| 20 °C | pale blue `#8ecae6` |
| 30 °C | amber `#e8a317` |
| 50 °C | orange `#f2711c` |
| 70 °C | red `#d7263d` |

There is no green stop: the hues are about 214, 206, 199, 40, 24 and 352 degrees, none between 75 and 165. The pale blue
at 20 °C keeps the mix of light blue and amber from turning grey-green (a unit test samples the whole scale in 1 K
steps), so cold brine at -2.8 °C is a blue between the first two stops, closer to blue, and nothing reads as "fine" by
colour alone.

Between two stops the colour is a CSS `color-mix(in srgb, ...)` of the two, by the share of the way between them
(rounded to 0.1 %); outside the scale it is the colour of the nearest end, so a discharge of 95 °C is the 70 °C red.
The `colors` option replaces the stops with an ascending list of 2 to 8 `{ temperature, color }` entries; a list that
is too short or long, not ascending, or with something that is not a number or a CSS colour is a configuration error.
The interpolation is copied from hrv-ventilation `src/diagram/streams.ts` (`mixColor`); the card finds the two
neighbouring stops of an absolute temperature first, where hrv mixes two colours on a relative position.

### Which probe colours which pipe

| Pipe segments | Temperature role | Probe or point |
|---|---|---|
| Supply from the condenser to connection 1 (or 5 in DHW mode), the DHW supply, from connection 1 to the emitter (`dg1_sup`) or the stub of connection 1 | `production.outlet_temperature` | 33 |
| Return from the emitter to connection 2 (`dg1_ret`) or the stub of connection 2, and from connection 2 (or 6) to the condenser | `production.return_temperature` | 34 |
| The underfloor spiral's inward run (`dg1_loop_in`) and outward run (`dg1_loop_out`), and the radiator's fill (a gradient, top to bottom) | outlet 33 for the inward run and the radiator's top, return 34 for the outward run and its bottom | 33, 34 |
| Brine from connection 4 to the evaporator | `brine.inlet_temperature` | 32 |
| Brine from the evaporator to connection 3, and the pipes from 3 to the source | `brine.outlet_temperature` | 31 |
| Compressor 11 through HTR exchanger 9 and valve 14 to the condenser | `compressor.discharge_temperature` | 30 |
| Condenser 8 to the expansion valve | `refrigerant.condensation_temperature` | 8 |
| Expansion valve to evaporator 7 | `refrigerant.evaporation_temperature` | 7 |
| Evaporator 7 to the compressor | `compressor.suction_temperature` | 29 |
| Exit of the air unit; in a hybrid also the link and the collector's first half (feed, header, first loop) | `source.air_unit_outlet_temperature` | air unit |
| The collector's first half (ground source: the feed, the header, the first loop) | `brine.outlet_temperature` | 31 |
| The collector's second half (the second loop and the return riser), and the return to connection 4 | `brine.inlet_temperature` | 32 |
| HTR water (exchanger 9, pump 17, valve 22 and their lines) | `dhw.temperature` | tank |
| Model C stubs of connections 47, 48 and 49 | `dhw.temperature` | tank |

The mode changes some of these (they are looked up when drawing; the geometry does not change):

- **Active cooling** reverses the refrigerant legs that flip direction: the discharge colour then runs from the
  compressor through exchanger 9 to evaporator 7, which works as the condenser, and the suction colour from
  exchanger 8 back; the condensation and evaporation colours swap along with them.
- **Passive cooling and defrost:** the compressor is stopped, so the condenser does not change the water
  temperature. The production legs from valve 27 through pump 15 to the condenser take the outlet temperature, as
  does the leg from exchanger 10 (`prod_10_out`, after valve 27), but only while valves 27/28 are in the exchanger
  position: without exchanger 10 the water runs through the bypass and the legs keep the return colour.
- **HTR recovery** (heating or active cooling with HTR active): the DHW lines between valve 26 and the tank, outside the
  arm of valve 26, and the pipes to and in an external tank carry HTR water, so they take the DHW temperature.
- **The tank** body takes the DHW temperature on the same scale (a 25 % tint of the colour). Model C's coil 51 is a
  symbol: it takes the colour of the water feeding it: the production outlet colour in DHW mode, the DHW
  temperature during HTR recovery, and the muted colour otherwise.

### Muted pipes

A pipe is drawn in the theme's disabled colour (`--disabled-text-color`), without animation, when

- its circuit is not active in the derived mode (see Operating mode): the DHW loop while heating, the refrigerant
  circuit in defrost and passive cooling, everything in standby and off;
- its feature is `unused` (not `false`, which removes the part), except exchanger 10, valves 27/28 and their pipes in
  defrost, which use them (their symbols are un-muted too);
- or its probe has no value (unavailable, unknown, not a number or the firmware sentinel -999.9), even when its
  circuit is active. Such a pipe keeps its animation, since the flow is known and only the colour is not.

The source's symbols (air unit case and coil, ground collector) are muted the same way while the brine circuit is
inactive; the fan keeps following its own speed. The emitter is muted with its pipes while the DG1 production circuit is
inactive (in DHW mode, for one): its outline or columns, the spiral's runs and the radiator's fill take the muted
colour, and nothing flows.

The tap-water stubs of model C (47, 48, 49) are the exception: they are coloured by the DHW temperature in every
mode, and never animated.

### Exchanger fills

With `exchanger_fill: gradient` (the default) each plate exchanger (7 evaporator, 8 condenser, 9 HTR, 10 passive
cooling) is filled on each of its two sides, under the outline, the plate lines and the ports, with a vertical gradient
at 55 % opacity. A side runs from the colour of the pipe that enters it to the colour of the pipe that leaves it, so
the fill always agrees with the pipes at its ports:

| Exchanger | Left side | Right side |
|---|---|---|
| 8 condenser | production water, return colour in, outlet colour out | refrigerant, discharge colour in, condensation colour out |
| 7 evaporator | refrigerant, evaporation colour in, suction colour out | brine, inlet colour in, outlet colour out |
| 9 HTR | HTR water, the DHW colour at both ends | refrigerant, the discharge colour at both ends |
| 10 passive cooling | production water, return in, outlet out | brine, inlet in, outlet out |

In active cooling the refrigerant sides of 7 and 8 run the other way (7 condenses, 8 evaporates), so their start and
end swap, exactly as their pipes do. A side whose pipes are both muted (an idle circuit, HTR water outside HTR
recovery, exchanger 10 outside passive cooling and defrost) is filled in the muted colour. `exchanger_fill: none`
leaves the exchangers unfilled. The gradient ids carry a per-card prefix, so two cards on one dashboard do not share
them. The sides are data in `src/diagram/geometry.ts` (`sides` on the four exchangers) and the colours come from
`src/diagram/pipes.ts`.

### Line weights

Pipes are drawn 3 drawing units wide (the flow overlay too, with dashes of 3 and gaps of 18 units), component symbols
with a 2 unit outline, the cabinet outline 3 units and the source and tank outlines 2.5 units, so the drawing stays
legible when the card is scaled down. The hop of a crossing leaves a gap of 7 units on each side.

### Animation

An active pipe shows moving dashes in the direction of the flow (the geometry's direction, flipped for the reversible
refrigerant legs in active cooling). The dash period (`--flow-duration`) follows the speed of the pump or compressor
that moves the fluid: 1.2 s at 100 %, proportionally slower below, never faster than 0.6 s or slower than 8 s.

| Pipes | Speed from |
|---|---|
| Production, including through exchanger 10 and the DHW lines | `production.pump` (pump 15) |
| Brine, including through exchanger 10 and the source pipes | `brine.pump` (pump 16) |
| Refrigerant | `compressor.percentage` |
| HTR water (pump 17 reports no speed) | a fixed 3 s |

A pump without a percentage that runs (an on/off entity that reads on, or a speed in rpm above 0) also uses a fixed 3 s.

At 0 % or without a value the pipe is still. Dead-end taps (the HTR drain) are coloured
but never animated. With `prefers-reduced-motion: reduce` nothing is animated, the pipes and the fan alike; the colours
stay the same.

The tank body colour is the custom property `--dhw-tank-color` on the drawing; the tank takes the muted colour and
shows no number while the DHW temperature is unavailable; with `dhw: unused` it is always the muted colour.

## Live values

Values are HTML labels laid over the drawing at percentage positions computed from viewBox coordinates, so text stays
crisp and selectable; they scale with the drawing. The placements are in `src/diagram/label-places.ts` and reach the
drawing through the arrangement; `src/diagram/labels.ts` selects and renders them. Tapping a value opens Home
Assistant's more-info dialog for its entity (in sample mode they do nothing); the card calls no service and writes no
entity.

| Value | Where |
|---|---|
| Production outlet (33, "Out") and return (34, "In"), pressure (38), pump 15 | beside the probes and the transducer, left of their bodies in the lanes the x map opens (Out left of probe 33, In and the pressure between riser 270 and probes 34 and 38), about 35 units above pump 15 |
| Brine outlet (31, "Out") and inlet (32, "In"), pressure (37), pump 16 | right of the risers at the probes (Out right of riser 630, In right of riser 690), left of transducer 37, left of the pump |
| Discharge (30) and suction (29) temperatures, pressures 36 and 35 | one two-row block per pair (temperature over pressure, 24 units apart) in the row lane under the compressor row, below the pair |
| Compressor 11: rpm | in a third row of that lane, centred under the compressor |
| Valve opening (%) at 12 | alone, centred under valve 12, in the row lane under the valve row |
| Air unit: the outside temperature, the fan speed (whole percent, or its own unit) and, with `source: air` only, the Out, bare numbers | inside the case: the outside temperature centred above the fan, the fan speed centred below it, the Out right of the coil panel at the case's bottom, beside the exit pass |
| Ground collector: the Out (the hybrid shows it as the source's Out), a bare number | inside the body, at its bottom, below the loops' bends and ending just left of the return riser |
| Tank: temperature (no caption) | inside the upper part of the external tank, bare on its body; on model C inside tank 50, above coil 51 |

These 18 are all the card draws. The superheat (decided by the user 2026-11-20), the compressor percentage and power,
the condensation and evaporation temperatures, the air unit's and ground collector's In, the DG1 setpoint and the DHW
setpoint and start delta-T have no label; their roles stay configurable and keep their more-info and suggestions. Tap
valve 12 or a component with an entity for its more-info.

A value of a part that is not drawn is not shown (no DHW storage, or an unused tank (`dhw: unused`), no tank values; a
source that is not drawn, no source values). A drawn value with no value shows a muted dash and keeps its place. A role
set to `none` shows nothing (see Using another source).

The footer is one list, the same in both layouts: the mode, the outside temperature (with a ground source only: an air
unit shows it itself, above its fan), the efficiency (COP or EER), the power items of the mode, and the alarm and
offline indications. It shows no on/off state and no season (the roles `unit.on_off`, `unit.summer` and `unit.winter`
still feed the derived mode). An item whose role is `none` is left out.

The power items follow the mode, because the firmware's DHW power already includes the HTR heat: showing DG1, DHW and
HTR together while heating would count that heat twice. By mode, the items of one mode add up to the useful heat (DG1
plus HTR is the condensation capacity while heating). The condensation and evaporation capacities are no longer footer
items of their own; their roles stay, and they are the fallbacks below.

| Mode | Items (caption: role, fallback) |
| --- | --- |
| Heating | DG1: `heating.power`, else `heating.capacity`. HTR: `htr.power`, no fallback |
| DHW | DHW: `dhw.power`, else `heating.capacity` |
| Active cooling | Cooling: `cooling.capacity`. HTR: `htr.power`, no fallback |
| Passive cooling, defrost, off, standby | none |

- The HTR item shows in heating and active cooling whenever HTR can run there: the `htr` feature is `true`, the DHW
  tank is in use (external or internal) and the HTR power role has an entity. It shows 0 W while HTR is idle, so the
  footer changes with the mode and does not reflow on every HTR run. With `dhw: unused` the HTR group is drawn but
  never runs, so there is no item.
- The HTR power is the firmware's estimate: while the HTR coil is on, the condensation capacity minus the modelled
  production flow times the production temperature difference, averaged over 30 samples and limited to 0 W up to the
  capacity; in active cooling with HTR it equals the whole condensation capacity. It can read 0 W while HTR runs; the
  drawing's HTR state comes from `htr_active`, not from the power.
- DG1 and DHW take the condensation capacity (`heating.capacity`) when their power role has no entity (older
  firmware, another integration). That capacity also holds any HTR heat, so while HTR runs the fallback DG1 is
  higher than the firmware's own DG1 power; with the firmware's split the figure is exact. An existing but
  unavailable power entity shows a muted dash instead of the fallback.
- The efficiency is the system COP (`unit.system_cop`, `system_cop_display`), else the register COP (`unit.cop`) when
  the system COP role has no entity. The system COP is the firmware's figure over the useful heat and the measured
  electricity, so it needs the installation's electricity meter; users without a meter, or without that entity, get the
  register COP automatically. Whichever role feeds it, a value of 0 (compressor stopped, the first minute after a
  start, defrost) shows as a muted dash. The caption is EER in active cooling and COP in every other mode.

### Formatting

The card formats every number itself (`src/calc/display.ts`), never through `hass.formatEntityState`, which would turn
"38.9 %" into "38.9%" and "rpm" into "RPM".

- The number uses Home Assistant's language and number format, without a thousands separator ("2803 rpm", "4712 W").
  The copied `formatNumber` has a `grouping` flag for this.
- A passed-through unit (see Using another source) uses the entity's `display_precision`, else the decimals of its
  state ("45.6" is "45.6 Hz", "2400" is "2400 rpm").
- The decimals come from the entity's `display_precision` in the entity registry when it has one and the entity's unit
  is the role's own unit; else (no precision, or a converted value such as kW shown as W, a Fahrenheit probe) from the
  role table (1 for temperatures, the superheat, bar and the compressor percentage, 0 for rpm, W, the valve opening and
  the pump speeds). The pump speeds and the fan speed in % are the exception: they show whole percentages, "100 %" for
  99.9 %, whatever the entity's display precision (decided by the user 2026-11-20, so the value is short enough to sit
  above pump 15 in the vertical layout); a pump on an on/off entity still reads "On" or "Off", and one in rpm keeps that
  unit's decimals.
- The unit is the role's own, joined to the number by a no-break space: °C for temperatures, K for temperature
  differences (the superheat), bar, %, rpm and W. The COP has none.
- A state in °F is converted to °C, one in kW to W and a pressure in kPa, MPa, Pa, mbar or psi to bar (see Using another
  source); a unit the card cannot convert is shown as the entity reports it, except temperature, difference and power,
  which have no value. A temperature difference in °F is converted back with the same absolute formula (43.2 °F is 6.2
  K), because Home Assistant converted it as if it were a temperature.
- The card re-renders when the state or registry entry of one of its entities changes, or the theme, locale or
  configuration; other entities changing do nothing.

## Layout

The card observes its own width (a `ResizeObserver` on the card element) and derives a layout from it and from the
`layout` option (`auto`, `horizontal` or `vertical`, default `auto`). `horizontal` and `vertical` force that layout at
any width. With `auto` the card is vertical while it is narrower than the vertical threshold (560 px,
`VERTICAL_BELOW`) and horizontal from the threshold up; before the first width is known (or while the card is not
displayed, width 0) it is horizontal. The rule is `nextVertical` in `src/lib/layout.ts` (based on the narrow-layout
predicate copied from the hrv-ventilation repo's `src/diagram/labels.ts`, whose deviations the file's header records;
see Hysteresis); the threshold constant is this card's own. A re-render happens only when the derived layout changes,
so state updates keep their entity-based gating, and an observation whose width did not change is ignored. A width
change that keeps the layout but changes the stroke widths (see Minimum rendered sizes) renders again too.

Both layouts draw the same parts, the same 18 values with the same texts and the same footer (see The arrangement and
The vertical arrangement); they differ in the arrangement (the vertical drawing is taller for its width) and in the
orientation of the vertical layout's rotated values. The former values `full` and `compact` and the
`detail` option are gone: the card rejects them as configuration errors, and the emulator ignores an old `layout=full`,
`layout=compact` or `detail=` in a URL.

### Hysteresis

A page scrollbar can appear and disappear as the layout flips, which changes the card's width by about 15-17 px near
the threshold. So with `auto` a card that is already vertical returns to horizontal only at the threshold plus 24 px,
584 px (`VERTICAL_HYSTERESIS` in `src/lib/layout.ts`); going vertical still happens below the threshold, at 560 px. The
decision is the pure function `nextVertical(layout, width, currentlyVertical)`, which the card calls with whether the
layout it showed last was vertical because `auto` chose it. A vertical layout that `layout: vertical` forced does not
count: after a switch to `auto` the card shows what a newly loaded card of that width shows. Forced layouts ignore the
hysteresis.

### Panel views

Home Assistant sets `layout = 'panel'` on the card of a `panel` view and, when its card wrapper updates, `isPanel`; the
card counts as in a panel when either says so (the wrapper does not set `isPanel` when it rebuilds the card). Both are
plain reactive properties (a getter-only accessor for a name Home Assistant assigns breaks the card); the config's
`layout` option is a different thing. In a panel view the card is as wide as the window, so on a desktop screen the
drawing would be taller than the screen and the footer would be below the fold. The drawing's width is therefore
`drawingWidth` in `src/lib/layout.ts`: the card's width, or in a panel view at most `(window height - header height -
footer allowance) * viewBox width / viewBox height`. The header height is Home Assistant's `--header-height` (56 px if
unset) plus its `--safe-area-inset-top` (0 if unset); outside a panel view the card reads neither. The footer allowance
is 64 px: one footer line is about 20 px with 8 + 12 px of padding. The longest footer (active cooling with HTR and a
ground source: mode, outside temperature, EER, Cooling and HTR) fits one line (37 px) from the threshold plus the
hysteresis, 584 px, up, and wraps to two lines (58 px) only at phone widths such as 320 px (`sizes.browser.test.ts`
checks it stays within the allowance at 584 px and inside the card at 320 px); a one-line footer leaves up to 27 px of
free space under it. The width is never below 320 px, the narrowest width verified for the vertical layout (a window too
short for that scrolls). In a 1280 x 800 px window the horizontal arrangement (1000 x 755) is 900 px wide; for a 1280 px
wide card, a window about 1080 px or more tall leaves the drawing at the card's width.

The card sets the width as the `max-width` of the drawing and centres it, and recomputes on the window's `resize`. The
layout choice (`nextVertical`, with its hysteresis) and the stroke widths take the drawing's width, not the card's, so
the labels (which scale with the drawing) and the lines stay consistent with what is drawn; a short window can therefore
make a wide panel vertical. The arrangement's ratio depends on the layout and the layout on the width; the layout is
decided on the width the horizontal arrangement would get, and the shown arrangement's ratio then sets the width, so
the choice cannot depend on itself. Outside a panel view the drawing fills the card as before. The emulator shows this
with `panel=1` (a control, a 56 px mock header, and a slot as wide as the window).

### Minimum rendered sizes

At any card width pipes render at least 2 px wide, component outlines at least 1.25 px and value labels at least 10 px,
and the footer wraps onto further lines instead of overflowing.

- Strokes: `scale = width / viewBox width` (the horizontal drawing is 1000 units wide, the vertical one 740, so at the
  same card width the vertical strokes are in units 0.74 times the horizontal ones). The card sets
  `--pipe-width: max(3, 2 / scale)` and `--outline-width: max(2, 1.25 / scale)` on the svg, in drawing units and
  rounded up to 0.1 (so the rendered minimum still holds after rounding). The stroke rules of the drawing (pipes,
  outlines, the flow overlay) read them, with 3 and 2 as the fallbacks, so a card of unknown width draws as before.
  The overlay's dash pattern and the gaps of the hops scale with `--pipe-width`. From 667 px up `scale` is 0.667 or
  more and the widths stay 3 and 2; at the threshold (560 px) the horizontal layout draws pipes 3.6 and outlines 2.3
  units wide. Decorative thin lines (fins, the ground hatching, the tank rim) are fractions of
  `--outline-width`.
- Fonts: the labels are `max(10px, k cqw)`, the external tank's temperature `max(11px, 1.2 k cqw)`, with `k` per
  layout (`LABEL_FONT_K` in `src/diagram/label-places.ts`; the 8 px floor is gone). The horizontal layout's `k` is
  1.3. One cqw is 10 units of the drawing, so up to a 770 px card (where 1.3 cqw passes 10 px) a label is 10 px, and
  from there it grows with the drawing, to 13 px at 1000 px; in units a label is therefore never taller above the
  threshold than at its 10 px floor there. The vertical layout's `k` is 2.4 (see The vertical arrangement): 1 cqw is
  7.4 units there, so the label is the 10 px floor up to a 417 px card and about 13.4 px just under the threshold.
- Footer: a wrapping flex row with row and column gaps, in both layouts.

Browser tests measure these in Chromium and WebKit: `test/card/sizes.browser.test.ts` the rendered stroke widths and
the label font floor of 10 px (320, 412, 500 and 559 px, the last one px under the threshold, and the designed widths
at 1000 px), the wrapping footer (every item inside the card at 320 px, the longest footer inside the card and the
footer allowance at 584 px) and the band at the threshold, each for `layout: horizontal` and `layout: vertical`;
`test/card/layout.browser.test.ts` the layout at real widths and the automatic switch at the threshold (559 vertical,
560 horizontal, the hysteresis up to 584); `test/card/rotated.browser.test.ts` the turned values (taller than wide, at
least 10 px); `test/card/panel.browser.test.ts` the panel fit in a 1280 x 800 window.

### The vertical threshold

The threshold is 560 px (`VERTICAL_BELOW`; decided on 2026-11-20, re-measured the same day after the refinements of the
cabinet, see Browser below). It is the narrowest card width on the 20 px grid at which the place search finds an allowed
place for every one of the 16 labels of the 2026-11-20 search, in Chromium and in WebKit: a place where its box, with a
2 px margin, overlaps no other label, component, pipe at its rendered stroke width, outline or the drawing's edge, in
any emulator scenario, and which its own spec allows (the value blocks at their pairs, the hydraulic values beside their
parts, the values of the bodies inside their bodies). At 560 px every label is free at its default place in all 312
cases, in both engines, so `HORIZONTAL_PLACES` has no entry. The zone constant of tank 50's temperature is the place the
first search at 560 px found free (it ends 70 units from the tank's left wall). The refinements of 2026-11-20 (no
superheat, whole-percent pumps, no valve 25, compressor 11 and exchanger 10 on the centre line with the x map balanced,
one band body height) did not change the result: the search at 560 px keeps every default place free in both engines,
and balancing the x map cost nothing. The overlap measurement of `npm run measure-layout` (no margin, 0.5 px tolerance)
is clean from 540 px in both engines (130 overlaps in 130 cases at 520 px in both). What the result depends on: the grid
(20 px steps from 320 to 800 px, 25 widths); the label box, the em box of the text with the half-leading above and below
trimmed; the tolerance, 0.5 px (two boxes overlap when they share more than that in both directions); and the margin, 2
px horizontally and 1 px vertically around the label box, which the search keeps and the measurement does not. The two
rows of a value block (a temperature over a pressure, 24 units apart) are exempt from the margin between them, as they
keep their pitch.

Method (`npm run measure-layout`, `scripts/measure-layout.mjs`, Playwright): every emulator scenario is opened in the
forced horizontal layout (`--layout=vertical` forces the vertical one, to check the phone widths), in thirteen
installations (a ground collector, an air unit and the hybrid on model B; the same on model C with its internal tank
for the collector, the air unit and the hybrid; the unused-tank cases: a collector on model B and an air unit on model
C; an air unit and the hybrid without DHW storage; the emitters: a radiator with a collector, and no emitter with an
air unit and with the hybrid on model C), and the card is set to every width from 320 to 800 px in 20 px steps
(`--widths=a,b,c` measures only those, to iterate on a place, and prints no threshold). At each width the script
compares, in the DOM, the bounding boxes of the value labels with each other, with the boxes of the drawing's
component groups (the symbol groups, the DHW storage, the air unit and the ground collector) and with the obstacles
the bodies register (the air unit's coil panel and fan, the collector's hatching and probe, the tank's rim) and
with the pipes, and checks that no label's box leaves the drawing (`label X x edge`: the box extends past the svg's
box by more than the tolerance, which the other pairs cannot see). A label that crosses the cabinet's outline, partly
inside and partly outside, is reported as `label X x cabinet`; a label inside a body (the tank, the air unit, the
collector, tank 50) must lie inside its box (`label X x outline:<body>`) and is not compared with the body itself. The
threshold is the narrowest width with zero overlaps in every case, provided every wider measured width is also clean.

Pipes (refine-simplified-layout D4): every `path.pipe` is sampled along its rendered length at 1 px steps, each sample
a square of the pipe's rendered stroke width, and a label overlaps the pipe when a sample shares more than 0.5 px with
its box in both directions. A hop is a gap in the path data, so each subpath is sampled on its own and a label over a
hop's gap does not count; the halves of a helix share their segment's name. The labels inside tank 50 ignore pipe
samples inside tank 50's box. Pairs read `label X x pipe:<segment>`. There are no in-drawing captions to check any more.

The boxes, exclusions, installations and tolerance live in `dev/overlaps.ts`, shared by the script and by the browser
test `test/card/overlaps.browser.test.ts`, which runs the same check (with pipes) in the horizontal layout at the
threshold, 800 and 1000 px in headless Chromium and WebKit so that a change to the drawing or the labels that brings
overlaps back fails `npm test`. The layout at real widths (`test/card/layout.browser.test.ts`) is also a browser test:
happy-dom has no layout.

Browser: the place search ran in Chromium on a host with font smoothing on (see Text widths and font smoothing) and in
WebKit, at 560 px, with the same result in both: every default place is free. At 560 px the widest box of a label is 92
units wide (production Out and brine Out, "Out -12.3 °C") and 18 units tall, the same in both engines at the 10 px font.
The measurement of `measure-layout` is in the paragraph above, and the browser tests pass in both engines.

Result (the 16 values, no entry): at 560 px the search finds every label free at its default place, in both engines, and
the recorded places (none) leave `measure-layout` clean from 540 px up in both engines (checked at 520, 540, 560, 580,
600, 640, 700 and 800 px). History: before this change the
threshold was 680 px (with the cabinet 620 units wide and the source and tank in zones beside it); the x stretch of the
manual figure's frame to 980 units, with those zones gone, brought it to 560 px at the 8 px label minimum; the cabinet
frame with its lanes and the 10 px label floor first measured 580 px, and moving tank 50's value constants to the places
the search found free brought it back to 560 px.

### The label places

A label of the arrangement is at its default place (the cabinet frame's place under the maps, or its zone's place for
the bodies of the band and tank 50) unless `HORIZONTAL_PLACES` in `src/diagram/label-places.ts` gives it another, each
with its reason in code. `npm run search-places -- --layout=horizontal --width=560` finds them: for every value, over
every scenario, installation and naming (312 cases: 13 installations, 12 scenarios, 2 namings), the places on a 4-unit
grid, and its default place when that is free, where the label's box, with its 2 px margin, overlaps no component, no
pipe at its rendered width, no other label and no outline, stays inside the drawing, and, for a value inside a body,
stays inside it; of those the one nearest the label's default place (the search measures from the defaults, never from a
recorded place), the Out and In pairs together and in reading order (Out left of In, or above it) and the value blocks
(the discharge and suction pairs) as two rows `PAIR_ROW_GAP` units apart. A value inside a body is placed from its zone:
the search asks that its place there is free in every case. No label sits on a pipe, and there is no exception list: a
label with no place is a decision point. The search also prints, per label, what its default place meets ("Default place
meets"), and the table is its paste output. At 560 px the output is empty in Chromium and in WebKit (every default place
is free), so `HORIZONTAL_PLACES` is empty; the table and its unit test stay for the next time the drawing needs an
entry. `--quick`, `--scenario=`, `--installation=` and `--naming=` pick a single case to iterate on a place.

The default places, in the cabinet frame (the maps carry them to the arrangement), each in the lane beside its part:

| Label | Default place (frame x, y, alignment) | Where |
|---|---|---|
| Production Out (33) | 38, 112, end | in the lane left of probe 33, 2 units from its body |
| Production In (34) | 115, 112, end | in the lane between riser 1 and probes 34 and 38, 2 units left of probe 34 |
| Pressure 38 | 115, 142, end | the same lane, under production In, left of the transducer |
| Pump 15 | 229, 370, start | right of the pump, above its pipe, in the lane before exchanger 8 |
| Brine Out (31) | 544, 112, start | right of riser 3, beside probe 31's pipe |
| Brine In (32) | 609, 112, start | right of riser 4, at the start of its lane |
| Pressure 37 | 570, 142, end | in the lane left of probes 32 and 37, left of the transducer |
| Pump 16 | 570, 298, end | left of the pump, in the same lane |
| Discharge block (30, 36) | 283, 167 and 191, start | the two rows under the pair, in the row lane under the compressor row |
| Suction block (29, 35) | 401, 167 and 191, start | the same under the suction pair |
| Compressor speed (11) | 360, 215, middle | in a third row of the row lane under the compressor row, under the blocks, centred under the compressor |
| Opening (12) | 412, 426, middle | alone, centred under valve 12, in the row lane under the valve row |

Production In, Out and the pressure are beside probes 34 and 33 and transducer 38, and brine Out beside probe 31, with
no other part between: a unit test (`test/diagram/simplified.test.ts`, "values beside their probes") bounds the gap to
24 units and checks that no other drawn component lies between a label and its part, so a recorded place cannot drift
across another part, and the pressure labels stay within 8 units of their transducers at the threshold and at 1000 px
(their places are end-aligned, so they stay beside the transducer when the card widens).

The discharge and suction pairs are two-row blocks (same x and alignment, `PAIR_ROW_GAP` units between the rows), which
the search places together like the Out and In pairs (`BLOCK_PAIRS` in `dev/overlaps.ts`). The pitch follows the label
height at the threshold: a label is 12 px tall at the 10 px font, 12 px / 0.56 = 21.4 units at 560 px, plus a unit,
rounded up to the search's 4-unit grid: 24 (`PAIR_ROW_GAP` in `src/diagram/label-places.ts`; the search script reads it,
so the code and the search agree). The vertical layout's own pitch is 32 (320 px, see The vertical arrangement). In the
horizontal layout the temperature of tank 50 (model C) sits above coil 51, end-aligned, ending 70 units from the tank's
left wall. In the vertical layout it sits at the left (see The vertical arrangement).

### The expansion valve opening

Valve 12 shows one value, in both layouts: the opening in %, centred under valve 12 (in the row lane under the valve
row). The superheat is no longer drawn (decided by the user 2026-11-20); its role `refrigerant.superheat` stays
configurable, with its suggestions and the `difference` quantity (K, with its Fahrenheit conversion) that the start
delta-T shares, and the readings still convert it. Tapping the valve opens the opening's entity.

## Installation

The card is one JavaScript module, `ecogeo-card.js`, built from `src/` and committed as `dist/ecogeo-card.js`
(`npm run release` checks, builds and copies it).

The card is read-only: it calls no service and writes no entity, so it needs no permissions beyond those of the
dashboard it sits on.

### With HACS

1. In HACS, open the menu, choose Custom repositories, add `https://github.com/peeter123/ha-ecogeo-card` with the
   category Dashboard, and select Add.
2. Find the ecoGEO Schematic Card in HACS and download it. HACS reads `hacs.json` (the name and the file
   `ecogeo-card.js`) and takes the file from the latest GitHub release.
3. HACS adds the dashboard resource `/hacsfiles/ha-ecogeo-card/ecogeo-card.js` of type `module` itself. With
   dashboards in YAML mode, add it by hand under `resources:` as `url: /hacsfiles/ha-ecogeo-card/ecogeo-card.js`
   with `type: module`.
4. Hard-refresh the browser and add the card to a view, as in step 3 of the manual installation below.

The browser console shows the loaded version as `ecogeo-card <version>`, and the card editor's help link opens the
README. HACS offers an update when a new release is published.

### By hand

1. Copy `dist/ecogeo-card.js` to `/config/www/custom/ecogeo-card/ecogeo-card.js` on the Home Assistant host. Files
   under `/config/www/` are served as `/local/`.
2. Register it as a dashboard resource, type `module`, in Settings, Dashboards, Resources (or with
   `lovelace/resources/create`):
   `/local/custom/ecogeo-card/ecogeo-card.js?v=1`.
3. Add a view and the card. A `panel` view gives the schematic the full width:

   ```yaml
   title: Schematic
   path: schematic
   type: panel
   cards:
     - type: custom:ecogeo-card
       model: B
       variant: 4
       source: air
       dhw: external
       prefix: ecoforest_ecogeo
   ```

   The prefix is the firmware default; set `prefix`, or override single entities by role, when the entities are
   named differently (see the README for every option). The card also works in a `sections` view.
4. After each new build, copy the file again and change the number after `?v=` on the resource (for example
   `?v=2`), then hard-refresh the browser: `/local/` is cached for a long time, and only a changed URL makes the
   browser fetch the new file.

## Releases

The version is the `version` in `package.json`: semantic versioning, a minor version for new behaviour and a patch
version for fixes. It is bumped with `npm version <major|minor|patch> --no-git-tag-version`, which updates
`package.json` and `package-lock.json` together. The card logs it once to the browser console when it loads, as
`ecogeo-card <version>`.

- `CHANGELOG.md` has one section per version, newest first; its top section is the `package.json` version.
- `npm run release` runs `npm run check` and builds, then checks that the build is the single, current
  `ecogeo-card.js` (nothing else in `build/`, not older than `src/`), that it registers the card and its editor and
  that it reports the `package.json` version, and only then copies it to `dist/ecogeo-card.js`; otherwise `dist/` is
  left untouched.
- `npm run verify-dist` builds and runs the same build checks (not `npm run check`), then fails if the committed
  `dist/ecogeo-card.js` differs byte for byte from the build, so a release cannot ship a stale bundle.
- `.github/workflows/check.yml` runs the project check and then `verify-dist`; `.github/workflows/validate.yml` runs
  the HACS validation. Both run on every push and pull request and on demand; `validate.yml` also runs daily.
- A release is the tag `v<version>` and a GitHub release of that tag with `dist/ecogeo-card.js` attached, which is the
  file HACS downloads. Pushing, tagging and creating the release are done only when the maintainer asks for that
  release; a change's release group only bumps the version, adds the changelog entry and runs `npm run release`.

`check.yml` runs on the pinned image `ubuntu-26.04`, not `ubuntu-latest`, because the visual references depend on it
(see Visual references below); `validate.yml` renders nothing and stays on `ubuntu-latest`. The Playwright browser
install has a 20 minute limit and the job 30, because the system packages come from a mirror that is sometimes slow.

The checks and the pinned tool versions behind the workflows are in Development below.

## Development

`npm run check` runs the project's checks in this order: the type check, ESLint, Prettier, the Home Assistant quality
checks (`npm run lint:ha`) and the tests (unit and browser). `npm run release` runs it first. The quality checks hold
the repository's text and YAML to the standard of Home Assistant core, so they need [uv](https://docs.astral.sh/uv/)
on the `PATH`: `uvx` fetches each tool at an exact version, with no installation. Without uv, `npm run lint:ha` stops
with a message that names it.

`npm run lint:ha` (`scripts/lint-ha.mjs`) runs, and fails on any finding:

- **codespell** over the repository, configured by `.codespellrc`: it skips `.git`, `private`, `.claude`,
  `node_modules`, `build`, `dist`, JSON and images, accepts `hass`, and accepts the foreign keywords that are meant to
  be foreign (`compresor`, `produktion`, `ue` in `src/config/keywords.ts`, and `te` in `dev/foreign.ts`).
- **yamllint** over the tracked YAML (GitHub workflows, `openspec/config.yaml` and the change metadata), configured by
  `.yamllint`: the default rules with a line limit of 120 characters.
- **check-jsonschema** with the built-in schema `vendor.github-workflows` over `.github/workflows/*.yml`, when that
  folder exists: it catches an invalid workflow, such as a job without `runs-on`.
- **Markdown format** (`scripts/md-format.mjs`) over every tracked Markdown file outside `.agents/`, `.claude/` and
  `openspec/changes/archive/`: LF line endings only, exactly one final newline, and at most 120 characters per line.
  Table rows, fenced code blocks and lines with no space to break at (a long URL alone on a line) are exempt.
  `node scripts/md-format.mjs --fix` repairs only line endings and the final newline; prose is never rewrapped
  automatically.

The editing hook (`scripts/check-on-edit.mjs`) also runs the Markdown format check on an edited Markdown file and
yamllint on an edited YAML file, so a finding shows at once.

| Tool                  | Version | Source                                                                         |
| --------------------- | ------- | ------------------------------------------------------------------------------ |
| codespell             | 2.4.3   | Home Assistant core `requirements_test_pre_commit.txt` (dev branch, 2026-10-31) |
| yamllint              | 1.38.0  | same                                                                           |
| check-jsonschema      | 0.39.0  | the latest release when the checks were added (2026-11-18); core does not pin it |
| Markdown format check | none    | `scripts/md-format.mjs`, a Node port of the checker of hot-water-tank-estimator |
| uv                    | 0.13.1  | the version used locally and in CI (`astral-sh/setup-uv` v10.3.3, pinned by SHA) |
| actions/checkout      | v7      | as used by hot-water-tank-estimator's workflows (2026-11-18)                    |
| actions/upload-artifact | v7   | the latest release, v7.0.2 (2026-11-20); uploads the recorded visual references |
| actions/setup-node    | v7      | the latest release, v7.1.0, on its GitHub releases page (2026-11-18)            |
| runner image (check.yml) | ubuntu-26.04 | the label pins the Ubuntu release; GitHub updates the image weekly; the references were recorded on image 20261116.202.1 (run 44796692252) |
| hacs/action           | main    | the HACS docs' example; its last tagged release, 22.5.0, dates from 2022 (hacs.xyz, GitHub, 2026-11-18)    |

The codespell and yamllint versions are core's, as recorded in hot-water-tank-estimator on 2026-10-31. When the pins
change, update `scripts/lint-ha.mjs`, `.github/workflows/check.yml`, `.github/workflows/validate.yml` and this table
together.

The browser tests measure label and footer boxes in Roboto (`EMULATOR_FONT` in `dev/overlaps.ts`), so Roboto must be
installed for them to pass. CI installs it (`fonts-roboto`, a step of `check.yml`); install it locally too.

### Visual references

The `visual` Vitest project (`test/visual/renders.visual.test.ts`, `npm run test:visual`) compares fixed emulator
renders with recorded PNGs through `expect.element(...).toMatchScreenshot`. It runs in Chromium only, with reduced
motion (no flow or fan animation), and each test skips unless the platform is Linux: text rasterises differently per
platform, so a reference holds only where it was recorded. On Windows the run reports the tests as skipped. `npm test`
leaves the project out, because on a Linux machine it would fail on missing references.

The renders are the horizontal layout at 1000 px and the vertical layout at 320 px, each in light and dark, over four
installations that together cover every source, DHW storage and emitter: ground with the external tank and the
underfloor loop, air with no DHW and a radiator, hybrid on model C with the internal tank and no emitter, and air with
an unused tank. A failure names the render (layout, theme and installation) and writes the actual and the diff image
under a `.vitest/attachments` folder. On CI the Check workflow has a step that runs after any failed step and
uploads that folder as the `visual-diffs` artifact; the folder holds files only when a visual comparison failed or a
reference was missing, so otherwise nothing is uploaded. A comparison allows 20 differing pixels at a colour threshold
of 0.1: three runs on one host were pixel-identical, and moving one part by 4 to 30 px changes 61 to 362 pixels
(61 to 116 in the vertical layout), so a larger allowance, such as a ratio of the render, would let a moved part
pass.

The references are `test/visual/references/<layout>-<theme>-<installation>-chromium-linux.png`, committed. CI compares
them after `npm run check`, and a missing reference fails the step: on CI (`CI=true`, which turns off writing)
Vitest fails a comparison that has no reference with "No existing reference screenshot found" and writes the image
only to the attachments folder, not to the reference path. A drawing change that moves pixels fails there until the
references are recorded again:

1. In GitHub, run the Check workflow by hand (Actions, Check, Run workflow) with `update_references` ticked on the
   branch. It runs the project with `--update` and uploads the folder as the `visual-references` artifact.
2. Download the artifact, replace `test/visual/references/` with its contents, look at the images, and commit them.
   A renamed or removed render leaves its old PNG behind; delete it by hand.

The comparison needs the CI image's Roboto, so never commit references recorded elsewhere. The references were
recorded on the pinned `ubuntu-26.04` runner image (run 44796692252, image 20261116.202.1), which is why `check.yml`
does not use `ubuntu-latest`: a newer Ubuntu release can shift glyph pixels. A failure right after the image is
updated or the pin is moved means recording the references again through `update_references`, as above.

### Screenshot review

`npm run capture` opens every emulator URL of the capture list (`dev/captures.ts`) in headless Chromium and writes
one PNG of the card per entry to `build/captures/` (git-ignored; the panel view captures the whole window). It
prints one line per capture, `capture <name>: build/captures/<name>.png`, and a final count, so a reviewer can pick
the captures a task names. Every capture is checked against these criteria:

- No label sits on a pipe, a part or an outline.
- Every value is inside its body (the tank, exchanger or part it belongs to).
- Nothing crosses outside the cabinet.
- The band order is emitter, source, tank.
- Text is legible at the capture's width.
- The vertical layout's turned values read from bottom to top beside their probe, Out and In side by side with the
  pressure next to them, the pump 15 value above its pump.

These are the criteria the drawing is being built to meet; a capture that fails one is a finding, not a pass.
`--only=<regex>` writes only the captures whose name matches, to iterate on a drawing. The band captures
(`band-<source>-<storage>-<theme>-<width>`: every source above the external, internal, unused and no tank, light and
dark, at the vertical threshold and at 1000 px), the emitter captures (`emitter-<kind>-<source>-<theme>-<width>`:
underfloor, radiator and none above every source in heating, light and dark, at the vertical threshold and at 1000 px,
and `emitter-radiator-fill-none`) and `panel-heating` (1280 x 800) are the ones a drawing step checks. The vertical
layout has `phone-<scenario>` (360 px, the automatic layout), `vertical-<light|dark>-<scenario>` (forced vertical at
320 px), `vertical-band-<source>-<storage>-<theme>-<width>` and `vertical-emitter-<kind>-<source>-<theme>-<width>`
(every source above every DHW storage in DHW mode, and every emitter above every source in heating, at 320 px and 1 px
under the threshold, 559 px).

The capture is headless Chromium too, so take captures for review with font smoothing on as well: under RDP without
font smoothing the text is aliased and has whole-pixel widths.

#### Text widths and font smoothing

On Windows, Chromium lays text out with whole-pixel advances when font smoothing is off, as it is in a remote
desktop (RDP) session without font smoothing. Label boxes then grow by about 2 px (the preflight's two 10.3 px
reference strings measure 55 and 98 px with smoothing off), which eats the 2 px label margin rule and makes the overlap
tests fail for the wrong reason. The fix is to enable font smoothing in the RDP client (`allow font smoothing:i:1` in
the .rdp file, or the "Font smoothing" experience option) or to run the tests from the console or in CI.

Chromium on Linux at scale factor 1, CI's reference environment, also uses whole-pixel advances by design, so its
widths are whole too and nothing is wrong there. The guard therefore applies on Windows only: the browser test
project's setup file (`test/browser-preflight.setup.ts`) measures two reference strings at 10.3 px and stops the
Chromium run with a message naming font smoothing and RDP when both widths are whole numbers. WebKit and other
platforms are not affected.
