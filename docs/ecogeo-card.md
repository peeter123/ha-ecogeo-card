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
- The HTR (items 9, 17, 22, 25) and the outlet resistor with its thermostat (items 44, 45) appear in all four
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
  `input_boolean`). Its label (compressor speed, pumps) or footer item (on/off) reads "On" or "Off". On the on/off role,
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

The cabinet is drawn as inline SVG, in a fixed viewBox that is 1000 units wide and 545 tall (see The arrangement), and
scales with the card width. There is
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
| 52, 53 | Model C manual trap and tank drain valve | service only |

The transducers 35 to 38 (they carry the pressure values), valves 22 and 25 (they define the HTR loop) and thermostat
45 (it belongs to resistor 44) stay.

### Component names and taps

Every drawn component carries its name from the manual's component list and its item number as a tooltip, for example
"Production circulator pump (15)", and the same text as its accessible name; the connections are named the same way
("Production outlet (1)"). A component with an entity of its own is a button: a click, Enter or Space opens that
entity's more-info dialog, as the value labels do. These are the compressor (rpm), expansion valve 12, condenser 8 and
evaporator 7 (their temperatures), pumps 15 and 16, valve 26 (the DHW demand), probes 29 to 34, transducers 35 to 38,
the air unit's fan and the tanks (the DHW temperature). The other components have no entity of their own and are
neither tappable nor focusable. While the card shows its sample values nothing is tappable.

### Items drawn

No item number is drawn as text (the tooltip of each component carries it, see above). Parts in italics depend on a
feature or on the DHW storage (see below). Items 18 to 21, 23, 24, 39 to 41, 52 and 53 are not drawn (see Parts the
drawing leaves out), and the list below holds only the drawn items.

| Items | Symbol | Part |
|---|---|---|
| 1, 2 | port | Production outlet and return, labelled DG1 |
| 3, 4 | port | Brine outlet and inlet, labelled Outer loop |
| 5, 6 | port | *DHW inter-accumulator outlet and inlet, labelled DHW (model B with an external tank only)* |
| 7, 8 | plate exchanger | Evaporator and condenser |
| *9* | plate exchanger | *HTR system exchanger, on the discharge line* |
| *10* | plate exchanger | *Passive cooling / defrosting exchanger* |
| 11 | compressor | Compressor |
| 12, 13 | expansion valve, filter dryer | Electronic expansion valve, filter dryer |
| *14* | inversion valve | *Cycle inversion valve, drawn in its position (normal or reversed)* |
| 15, 16, *17* | pump | Production, brine and *HTR* circulator pumps |
| *22*, *25* | valve, drain valve | *HTR system retention and discharge valves* |
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
  straight through. Without HTR, exchanger 9, pump 17 and valves 22/25 go and the discharge line runs from the
  compressor straight to valve 14. Without active cooling, valve 14 goes and the discharge line runs straight to the
  condenser and the evaporator straight to the compressor. Without the backup heater, resistor 44 and thermostat 45
  go.
- `unused`: the part is drawn muted and is never active, except that exchanger 10 with valves 27/28 is drawn active in a
  defrost. Pipes that only serve it are muted; a pipe that merely passes through it (for example the discharge line
  through exchanger 9) stays normal.
- Without DHW storage (`dhw: none`, model B only) connections 5/6, valve 26 and the whole HTR group (9, 17, 22, 25) are
  not drawn, because HTR only makes sense with a DHW storage; ports 1/2 connect straight to the production circuit, and
  the discharge line runs from compressor 11 straight to valve 14.
- Model C draws no connections 5/6. The DHW lines of valve 26 run into the integrated tank (items 47 to 54), drawn
  under the top edge (see Source and DHW).

### The arrangement

All coordinates of the drawing live in one value, an `Arrangement` (`src/diagram/geometry.ts`). It holds the viewBox,
the cabinet's outline, the zone constants (the air unit, the ground loop, the external tank, the integrated tank 50
with coil 51, and the pipe run above the cabinet), every component and pipe segment, the crossings, the circuit labels
and the value labels' placements. The source and tank pipes (the air coil, the
ground loop's U, the run above the cabinet, the coil pipes of ports 5 and 6) and the labels placed from the zones
are generated from the arrangement's own zone constants, so they stay connected to their ports when a zone moves.

The component and segment lists are authored in the coordinates of the manual figure (the frame: cabinet x 240 to 760,
y 130 to 605), so every component keeps citing its item and its place in the B4 and C figures; the arrangement is
derived from them by the maps below. The card picks the arrangement with `arrangementFor(layout)`, a pure function of
the layout the card shows now (`horizontal` or `vertical`). Every consumer (the cabinet, the source, the DHW tank, the
pipes, the labels and the card's viewBox) reads the arrangement from the draw context the card builds, never from a
module constant, so one drawing cannot mix two arrangements. Until the vertical arrangement is built (a later group of
`rework-layouts`), `arrangementFor('vertical')` returns the horizontal one. A draw context without an arrangement gets
the horizontal one. The frame itself is not drawn by any layout; `FRAME` in `src/diagram/geometry.ts` exports it so
that the tests can compare the arrangement with it. The label text size relies on the viewBox being 1000 units wide (one
unit is a tenth of a container-width percent), so every arrangement keeps that width and only the height differs.

### The horizontal arrangement

The card draws an arrangement of its own, not the frame: a cabinet 620 units wide instead of 520 and 400 tall instead of
475 (the viewBox is 1000 x 545 instead of 1000 x 620), with the air unit, ground loop and external tank drawn smaller
beside it. The labels beside the probes and pipes get room, and there is no empty band under the lowest part.

**The cabinet.** Its contents are the frame's under two monotone piecewise-linear maps, one per axis, so
every horizontal pipe stays horizontal, every vertical one vertical, and the order of all parts is kept: the port
order, the probe placements, the HTR placement and the hops carry over by construction. Symbols keep their size
(`fx` has slope 1 over every span a component's ports cover, so the pipes that end on its ports keep their distance),
and the maps only stretch, so no clearance shrinks. The x map (`SIMPLIFIED_MAP_X`, frame x to arrangement x; between
breakpoints it is linear, left of 240 and right of 760 it keeps its offset):

| Frame x | 240 | 254 | 286 | 296 | 312 | 338 | 397 | 416 | 539 | 560 | 590 | 598 | 630 | 674 | 690 | 709 | 725 | 748 | 760 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Arrangement x | 200 | 218 | 250 | 272 | 288 | 324 | 383 | 410 | 533 | 564 | 594 | 606 | 638 | 712 | 728 | 755 | 771 | 800 | 820 |

The 100 extra units go to the gaps between the parts, mostly where the labels are: the probe lane at the left (+4 at
240-254, +12 at 286-296, +10 at 312-338, +8 at 397-416), the gap between expansion valve 12 and evaporator 7 (+10 at
539-560) and the brine lane at the right (+4, +30 at 630-674, +8, +6, +8). The y map (`SIMPLIFIED_MAP_Y`) is the
identity: the rows inside need no stretch. The cut is the band below y 505 of the frame's cabinet, which held only parts
that are no longer drawn (vessels, safety and drain valves, items 18-21, 23, 24), so the cabinet's bottom edge
moves from y 605 to y 530, 29 units under exchanger 10, the lowest part, and the viewBox from 620 to 545.

**The source and the external tank.** They are not mapped point by point (their shapes would distort) but placed from
zone constants at a uniform scale of 0.8: the air unit's housing is 99.2 x 168 units with a fan of radius 27.2 (the
blades scale with it), the ground loop is 46 units between its legs (about 0.77 of the frame's 60) and 112 deep, the
external tank is 134 x 144 with a dome of 11 and a coil of half width 40. The top of the air unit's housing, the ground
line and the tank's dome stay on the cabinet's top line (y 130). The source zone ends at x 190 (the feed's column; its
legs at x 84 and 130, the housing's wall at x 108; the run above the cabinet joins at x 198), the tank zone starts at x
840 and the tank (x 853 to 987) is centred in it. The air unit is 12 units left of where the scale puts it and the
ground loop's legs at x 84 and 130 (0.8 and 2.8 units left of the scaled position), so that the brine In and Out labels
(up to 64 units wide at the nominal label size, about 72 at 600 px) fit between the housing and the feed's column and
between the loop and the cabinet. The pipes of the source and of ports 5 and 6 are generated from these constants, so
they stay connected to the ports, which follow `fx`.

**Exceptions to the maps** (`SIMPLIFIED_EXCEPTIONS`, each with its reason in code): pressure transducer 38 and its
stub sat in the cut band (y 520), so they move up, between the two production lines of exchanger 10 (y 448 and 492) on
the production return side: the stub ends at y 470, the transducer sits right of it with its stem pointing left, and
the stub no longer crosses the line at y 492 (10 crossings remain, at most 15 as in the manual's figure); the
pressure label follows it, right of the transducer. A later group of `rework-layouts` moves both transducers onto the
lines they measure and deletes these exceptions.

The invariants are tested on it for every source, DHW storage and model (`test/diagram/simplified.test.ts`): every part
inside its zone, no two parts overlap, ports 1-6 in order, every crossing a hop inside the cabinet, and the source and
tank pipes meeting their ports.

### How the B4 figure is laid out

- **Top edge:** ports 1 and 2 are left, 3 and 4 right of centre, 5 and 6 far right. The DG1 stubs of ports 1/2 end
  just below the pipe run above the cabinet; the pipes of ports 3/4 and 5/6 leave from the top edge into that run
  (see the Source and DHW sections), so no pipe outside the cabinet crosses another.
- **DHW lines:** valve 26 sits on port 1's line. Its DHW output is the supply line across the cabinet to port 5, and
  the return line from port 6 runs back across to join port 2's line. Exchanger 9 taps the supply, pump 17 the return.
- **Refrigerant:** compressor 11 is in the middle, drawn as the standard compressor symbol: a circle with two straight
  lines that start on it at the suction side and converge towards the discharge side, so the wide side faces the suction
  pipe (right) and the narrow side the discharge pipe (left). The discharge runs left through 36 and 30 into HTR
  exchanger 9 and on to inversion valve 14, which feeds condenser 8 (heating) or evaporator 7 (active cooling). The
  expansion leg 8, 13, 12, 7 runs along the lower row; the suction returns through 29 and 35. (The figure's
  mini-pressure switches 39 and 40 and service outlets 41 are not drawn.)
- **Valve 14's ports:** the three ports on its right are ordered suction (top), evaporator 7 (middle), condenser 8
  (bottom). The figure orders them evaporator, suction, condenser, which makes two refrigerant pipes cross; this
  order does not. It is a layout choice, the connections are the same.
- **Production:** the return trunk runs from the junction of ports 2 and 6 down to valve 27, pump 15 and condenser 8.
  From there the outlet runs left to resistor 44 and up past probe 33 to valve 26 and port 1. The resistor is drawn
  vertical on port 1's lane (the figure draws it horizontal with the return line passing behind it). Transducer 38 sits
  on the pump's suction side, as in the figure (vessel 19, safety valve 21 and drain 24 are not drawn).
- **Exchanger 10:** below the lower row, with valves 27 and 28 beside pump 15 and evaporator 7: production water
  passes one side, brine the other. Transducer 37 taps port 4's line before pump 16
  (vessel 18, safety valve 20 and drain 23 are not drawn).
- **Crossings inside the cabinet:** the line from port 1 through valve 26 to port 5 separates port 2 from port 6, yet
  the DHW return from 6 has to join port 2's line, so at least one internal crossing is unavoidable. The figure has 15
  (14 hops, plus the return line passing behind resistor 44); this layout needs 10 (see The horizontal arrangement).
  Each is declared as data in `src/diagram/geometry.ts` and drawn as a hop, a small gap in one of the two pipes: the DHW
  supply and return across the lines of ports 2, 3 and 4 (5 hops) and across the HTR riser (1), the return trunk across
  the outlet line (1), the brine feed across port 3's line (1), exchanger 10's brine pipes across each other (1) and the
  transducer 38 tap across exchanger 10's production pipe (1). Tests fail when two pipes cross anywhere else.

## Source and DHW

The outer-loop source and the DHW storage are drawn outside the cabinet, in the zones left (x 0 to 190) and right (x 840
to 1000) of it (see The horizontal arrangement; the frame's zones were x 0 to 240 and 790 to 1000). Their pipes are
segments in `src/diagram/geometry.ts`, like the cabinet's, so they take the same colour and animation (see Colours). The
air unit, the ground loop and the external tank have no item number in the manual; the manual's figures stop at the
connections.

### Outer-loop source (`source`)

Connection 3 (brine outlet) and 4 (brine inlet) rise from the top edge into the pipe run above the cabinet, above the
DG1 stubs and the circuit labels. Port 4's pipe is the higher one (y 50, port 3's runs at y 85), so the two never
cross on their way left. They belong to the brine circuit: they are active with it, defrost included.

The top of the source sits on the cabinet's top line (y 130): the air unit's housing, or the ground loop's ground
line when there is no air unit, so that the thick top lines of the unit and of the source are level (the external
tank's top is level with them too). In the hybrid the air unit sits there and the ground loop below it. The captions
keep their places relative to their device: "Air unit" above the housing, "Ground loop" under the loop.

- **Air:** a housing with a slatted front (slats left and right of the fan), a coil block with a frame and 13 thin
  vertical fins, and a fan under it. The brine tube winds over the fins in four passes joined by rounded U-bends (half
  circles). It enters and leaves the coil block on its right side, the side facing the cabinet: both pipes leave through
  the housing's right wall. The feed comes down from port 3's line at x 190 to the bottom pass; the
  exit leaves the top pass and rises at x 172, left of the feed, so that no pipe crosses another (it
  is the reason for the order of the ports: the exit on top). The fan is a ring with a hub and five swept blades. It
  rotates while `source.fan_speed` is above 0 % (a full turn takes 120 s divided by the speed in %, between 0.5 and 6 s)
  and stands still at 0 % or without a value. A fan speed in another unit (rpm) above 0 turns it at a fixed medium speed
  (3 s). It does not depend on the mode, so it also turns in standby when its own speed says so. With
  `prefers-reduced-motion` the fan stands still.
- **Ground:** a ground line (the surface, hatched) with a single loop below it, like a borehole's U-tube: one leg goes
  down from the line, a half circle forms the bottom and one leg comes back up. The brine goes down the leg fed from
  port 3 (the down leg at x 130) and returns up the other (the up leg at x 84) to port 4. The hatching leaves out the
  places where the legs pass.
- **Hybrid:** both on one brine loop, in series. The brine runs through the air unit first and then down to the
  ground loop, which sits under the air unit; the link leaves the air unit from its outlet port. In the hybrid the
  air unit is entered at its top pass (and left at the bottom one), the other way round than the air source, so
  that the link can run down on the right without crossing the feed. The loop's exit returns up along the left
  edge to port 4, left of the housing. Series keeps the drawing free of crossings in the narrow zone, which two
  branches in parallel would not.

The source shows the brine temperature entering and leaving each device where its pipes meet it, so that the outer
loop reads at a glance without looking into the cabinet (probes 31 and 32 stay inside it). The captions are from
the device's point of view: "In" where the brine enters the device, "Out" where it leaves. The air unit's "In" is
`brine.outlet_temperature` (the heat pump's brine outlet feeds the unit) and its "Out"
`source.air_unit_outlet_temperature`; the ground loop's "In" is `brine.outlet_temperature` at the down leg and its
"Out" `brine.inlet_temperature` at the up leg, both at the ground line. In the hybrid the air unit shows only its "In"
and the ground loop only its "Out"; the link pipe between them (the air unit's "Out", the ground loop's "In")
carries no label. The fan speed and the outside temperature stay under the
housing. These are ordinary value labels (see Live values).

### DHW storage (`dhw`)

- **External (model B):** ports 5 (outlet) and 6 (inlet), the manual's "DHW inter-accumulator", rise into the run and go
  right to a tank drawn as a rounded cylinder (straight walls, elliptical domed caps). The tank is centred on the coil
  and the apex of its top dome sits on the cabinet's top line; its values are centred under it. Port 5's pipe is the
  higher one (y 50 against y 85) so they do not cross. The coil is a helix in the lower part of the tank, seen from the
  side: four and a half turns, the front half of each turn solid and the back half faint (35 % opacity). Its two ends
  meet the pipes from ports 5 and 6. The colour, the muting and the flow animation are those of the coil pipe; the dash
  overlay runs along the front halves only. An idle coil (no flow) is drawn in a neutral grey, darker than the other
  muted pipes in the light theme so that it stays visible on the tank's tinted body; the dark theme keeps the normal
  muted grey. While the coil is idle, the two pipes that feed it are drawn in that same grey where they run inside the
  tank (clipped to the tank body), so the grey changes at the tank wall and not at the joint with the coil. The back
  halves are drawn first, under the front halves, with butt caps, so the joints at the coil's sides are covered by a
  solid front half. Model C's coil 51 is drawn the same way, lying on its side, with closer (pitch 8) and rounder turns
  (seven and a half) than the external coil.
- **Internal (model C):** the integrated tank is drawn inside the cabinet, under the top edge, after figure C: tank 50
  with coil 51 (a helix, see above), probe 54 and the connections 47 (tap water inlet), 48 (DHW outlet) and 49
  (recirculation) on the top edge. The figure's manual trap 52 and drain valve 53 are not drawn. The figure's tank is
  tall and fills the cabinet; this one is squat so that the probe row and the rest of the cabinet stay as in the B
  figures. It differs from the figure in these ways: 47 and 49 are short stubs that end at the tank's top rather than
  dip tubes (the coil fills the tank's height, so a tube would cross it), and probe 54 touches the wall.
- **Unused (`dhw: unused`, either model):** the model's tank is drawn as above (on B the external tank and connections
  5/6; on C tank 50, coil 51 and the stubs 47 to 49; valve 26 on both), but muted:
  the tank body, outline and rim take the muted colour, the coil and the DHW pipes are muted and never animated, and the
  tank shows no values. HTR follows its own feature as with a tank in use (exchanger 9, pump 17 and valves 22/25 drawn,
  idle), and the discharge line routes as with a tank in use. No circuit to ports 5/6, no DHW coil and no HTR circuit is
  ever active; the mode label "DHW" still shows when the unit reports DHW mode, and valve 26 follows the mode.
- **None (model B only):** no tank, no DHW pipes, no connections 5/6, no valve 26 and no HTR group. The mode label "DHW"
  can still show when the unit reports DHW mode. Model C always has its integrated tank, so `dhw: none` there is a
  configuration error; use `unused`.

The tank body takes the DHW temperature colour through the custom property `--dhw-tank-color` (see Colours). The
fan speed, outside temperature, the In and Out temperatures of the air unit and of the ground loop and the tank
values are live labels (see Live values).

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
| Supply from the condenser to connection 1 (or 5 in DHW mode), the DHW supply, the DG1 stub of connection 1 | `production.outlet_temperature` | 33 |
| Return from connection 2 (or 6) to the condenser, the DG1 stub of connection 2 | `production.return_temperature` | 34 |
| Brine from connection 4 to the evaporator | `brine.inlet_temperature` | 32 |
| Brine from the evaporator to connection 3, and the pipes from 3 to the source | `brine.outlet_temperature` | 31 |
| Compressor 11 through HTR exchanger 9 and valve 14 to the condenser | `compressor.discharge_temperature` | 30 |
| Condenser 8 to the expansion valve | `refrigerant.condensation_temperature` | 8 |
| Expansion valve to evaporator 7 | `refrigerant.evaporation_temperature` | 7 |
| Evaporator 7 to the compressor | `compressor.suction_temperature` | 29 |
| Exit of the air unit; in a hybrid also the link down and the ground loop's down leg | `source.air_unit_outlet_temperature` | air unit |
| The ground loop's down leg (ground source), the first half of its bottom | `brine.outlet_temperature` | 31 |
| The ground loop's up leg and the second half of its bottom, and the return to connection 4 | `brine.inlet_temperature` | 32 |
| HTR water (exchanger 9, pump 17, valves 22/25 and their lines) | `dhw.temperature` | tank |
| Model C stubs of connections 47, 48 and 49 | `dhw.temperature` | tank |

The mode changes some of these (they are looked up when drawing; the geometry does not change):

- **Active cooling** reverses the refrigerant legs that flip direction: the discharge colour then runs from the
  compressor through exchanger 9 to evaporator 7, which works as the condenser, and the suction colour from
  exchanger 8 back; the condensation and evaporation colours swap along with them.
- **Passive cooling and defrost:** the compressor is stopped, so the condenser does not change the water
  temperature. The production legs from valve 27 through pump 15 to the condenser (with the taps on the pump's
  suction and the drain) take the outlet temperature, as does the leg from exchanger 10 (`prod_10_out`, after
  valve 27), but only while valves 27/28 are in the exchanger position: without exchanger 10 the water runs through
  the bypass and the legs keep the return colour.
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

The source's symbols (air unit housing and coil, ground line) are muted the same way while the brine circuit is
inactive; the fan keeps following its own speed.

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

At 0 % or without a value the pipe is still. Dead-end taps (the transducers' stubs and the HTR drain) are coloured
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
| Production outlet (33) and return (34), pressure (38), pump 15 | left of probe 33, under probe 34, right of transducer 38, above pump 15 |
| DG1 setpoint, and "Demand" while the DG1 demand is on | above the DG1 label at connections 1/2, and right of port 2 |
| Brine outlet (31) and inlet (32), pressure (37), pump 16 | under the probes, under probe 37, left of the pump |
| Discharge (30) and suction (29) temperatures, pressures 36 and 35 | below the discharge and suction lines of the probe row |
| Compressor 11: rpm, %, W | a stack inside the refrigerant loop |
| Superheat (K) and valve opening (%) at 12 | not on the drawing at the moment (see Superheat and the expansion valve opening); tap valve 12 for the opening |
| Condensation (8) and evaporation (7) temperatures | under exchangers 8 and 7 |
| Air unit: fan, outside temperature | under the housing |
| Air unit: In (brine outlet of the heat pump) and Out (air unit outlet temperature); a hybrid: only In | right of the housing, next to the ports: air, In at the bottom port and Out at the top one; hybrid, In at the top port |
| Ground loop: In (brine outlet) and Out (brine inlet); a hybrid: only Out | at the ground line, In right of the down leg and Out left of the up leg |
| Tank: temperature, setpoint, start delta-T (K), "Demand" while on | under the external tank; on model C as one row inside tank 50, in the strip above coil 51, with no background plate, at the normal label size and with the short captions "Set" and "ΔT" (the "Demand" text under the row) |

The labels have a minimum font size, so on a card narrower than about 560 px (measured with the demand line showing;
about 510 px for the three values alone) the labels inside tank 50 start to touch; narrower cards get the vertical
layout.

A value of a part that is not drawn is not shown (no DHW storage, or an unused tank (`dhw: unused`), no tank values; a
source that is not drawn, no source values). A drawn value with no value shows a muted dash and keeps its place. A role
set to `none` shows nothing (see Using another source).

The footer shows the mode, the on/off state, the season, the outside temperature, the efficiency (COP or EER), the
power items of the mode, and the alarm and offline indications. An item whose role is `none` is left out; the season
only when both summer and winter are `none`.

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
  role table (1 for temperatures, bar and %, 0 for rpm, W, the valve opening, the DHW setpoint and start delta-T).
- The unit is the role's own, joined to the number by a no-break space: °C for temperatures, K for temperature
  differences (superheat, start delta-T), bar, %, rpm and W. The COP has none.
- A state in °F is converted to °C, one in kW to W and a pressure in kPa, MPa, Pa, mbar or psi to bar (see Using another
  source); a unit the card cannot convert is shown as the entity reports it, except temperature, difference and power,
  which have no value. A temperature difference in °F is converted back with the same absolute formula (43.2 °F is 6.2
  K), because Home Assistant converted it as if it were a temperature.
- The card re-renders when the state or registry entry of one of its entities changes, or the theme, locale or
  configuration; other entities changing do nothing.

## Layout

The card observes its own width (a `ResizeObserver` on the card element) and derives a layout from it and from the
`layout` option (`auto`, `horizontal` or `vertical`, default `auto`). `horizontal` and `vertical` force that layout at
any width. With `auto` the card is vertical while it is narrower than the vertical threshold (600 px,
`VERTICAL_BELOW`) and horizontal from the threshold up; before the first width is known (or while the card is not
displayed, width 0) it is horizontal. The rule is `nextVertical` in `src/lib/layout.ts` (based on the narrow-layout
predicate copied from the hrv-ventilation repo's `src/diagram/labels.ts`, whose deviations the file's header records;
see Hysteresis); the threshold constant is this card's own. A re-render happens only when the derived layout changes,
so state updates keep their entity-based gating, and an observation whose width did not change is ignored. A width
change that keeps the layout but changes the stroke widths (see Minimum rendered sizes) renders again too.

The horizontal layout is the one drawn today (see The arrangement). The vertical layout follows in a later group of the
`rework-layouts` change: until it is built, `layout: vertical` (and `auto` below the threshold) draws the horizontal
arrangement, and the phone-width checks are not in the test suite. The former values `full` and `compact` and the
`detail` option are gone: the card rejects them as configuration errors, and the emulator ignores an old `layout=full`,
`layout=compact` or `detail=` in a URL.

### Hysteresis

A page scrollbar can appear and disappear as the layout flips, which changes the card's width by about 15-17 px near
the threshold. So with `auto` a card that is already vertical returns to horizontal only at the threshold plus 24 px,
624 px (`VERTICAL_HYSTERESIS` in `src/lib/layout.ts`); going vertical still happens below the threshold, at 600 px. The
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
is 64 px: one footer line is about 20 px with 8 + 12 px of padding. The longest footer (active cooling with HTR: mode,
on/off, season, outside temperature, EER, Cooling and HTR) wraps to two lines at the narrowest widths of the horizontal
layout, about 60 px at 624 px (`sizes.browser.test.ts` checks it stays within the allowance), so the footer stays on
screen even then (in a 1280 x 800 window it stays on one line); a one-line footer leaves up to 24 px of free space under
it. The width is never below 320 px, the narrowest width verified for the vertical layout (a window too short for that
scrolls). In a 1280 x 800 px window the horizontal arrangement (1000 x 545) is 1247 px wide; for a 1280 px wide card, a
window about 820 px or more tall leaves the drawing at the card's width.

The card sets the width as the `max-width` of the drawing and centres it, and recomputes on the window's `resize`. The
layout choice (`nextVertical`, with its hysteresis) and the stroke widths take the drawing's width, not the card's, so
the labels (which scale with the drawing) and the lines stay consistent with what is drawn; a short window can therefore
make a wide panel vertical. The arrangement's ratio depends on the layout and the layout on the width; the layout is
decided on the width the horizontal arrangement would get, and the shown arrangement's ratio then sets the width, so
the choice cannot depend on itself. Outside a panel view the drawing fills the card as before. The emulator shows this
with `panel=1` (a control, a 56 px mock header, and a slot as wide as the window).

### Minimum rendered sizes

At any card width pipes render at least 2 px wide, component outlines at least 1.25 px and value labels at least 8 px,
and the footer wraps onto further lines instead of overflowing. (The label minimum becomes 10 px with the label fonts
of a later group of `rework-layouts`.)

- Strokes: `scale = width / 1000` (the drawing is 1000 units wide). The card sets `--pipe-width: max(3, 2 / scale)` and
  `--outline-width: max(2, 1.25 / scale)` on the svg, in drawing units and rounded up to 0.1 (so the rendered minimum
  still holds after rounding). The stroke rules of the drawing (pipes, outlines, the flow overlay) read them, with 3 and
  2 as the fallbacks, so a card of unknown width draws as before. The overlay's dash pattern and the gaps of the hops
  scale with `--pipe-width`. From 667 px up `scale` is 0.667 or more and the widths stay 3 and 2; between 600 px (the
  threshold) and 667 px the pipes are up to 3.4 units wide, and the threshold measurement below was taken with that.
  Decorative thin lines (fins, the air unit's divider, the ground hatching, the tank rim) are fractions of
  `--outline-width`.
- Fonts: the labels are `max(8px, 0.95cqw)` and the external tank's temperature `max(9px, 1.2cqw)`, in both layouts.
- Footer: a wrapping flex row with row and column gaps, in both layouts.

Browser tests measure these in Chromium and WebKit: `test/card/sizes.browser.test.ts` the rendered stroke widths and the
label font floor (320, 360, 500 and 599 px, and the designed widths at 1000 px), the wrapping footer (every item inside
the card at 320 px, the longest footer inside the card and the footer allowance at 624 px) and the band at the
threshold, each for `layout: horizontal` and `layout: vertical`; `test/card/layout.browser.test.ts` the layout at real
widths; `test/card/panel.browser.test.ts` the panel fit in a 1280 x 800 window.

### The vertical threshold

The threshold is 600 px (`VERTICAL_BELOW`; measured on 2026-11-13 with pipes and captions counted, after
refine-simplified-layout drew the arrangement and gave some labels places of their own; it is measured again when the
labels are reduced to the 19 values, a later group of `rework-layouts`). It is the narrowest card width at which the
horizontal layout has no value label that overlaps another label, a component, a pipe or a caption in any emulator
scenario, on the 20 px grid from 320 to 800 px with every wider grid width also clean. The grid, the label box (the em
box of the text, see below) and the tolerance (0.5 px) are what the result depends on.

Method (`npm run measure-layout`, `scripts/measure-layout.mjs`, Playwright): every emulator scenario is opened in the
forced horizontal layout, in seven installations (a ground loop on model B, an air unit, the hybrid, model C with its
internal tank on a ground loop and on an air unit, and the unused-tank cases: a ground loop on model B and an air unit
on model C), and the card is set to every width from 320 to 800 px in 20 px steps (`--widths=a,b,c` measures only those,
to iterate on a place, and prints no threshold). At each width the script compares, in the DOM, the bounding boxes of
the value labels with each other, with the boxes of the drawing's component groups (the symbol groups, the DHW storage,
the air unit and the marks of the ground loop), with the pipes and with the captions, and checks that no label's box
leaves the drawing (`label X x edge`: the box extends past the svg's box by more than the tolerance, which the other
pairs cannot see). A label that crosses the cabinet's outline, partly inside and partly outside, is reported as
`label X x cabinet`. A label's box leaves out the half-leading above and below its text; two boxes overlap when they
share more than 0.5 px in both directions. The labels inside tank 50 on model C are not compared with tank 50, which
they sit on by design. The threshold is the narrowest width with zero overlaps in every case, provided every wider
measured width is also clean. `--no-pipes` leaves the pipes and captions out, which is the measurement of before
refine-simplified-layout (580 px on that drawing).

Pipes and captions (refine-simplified-layout D4): every `path.pipe` is sampled along its rendered length at 1 px steps,
each sample a square of the pipe's rendered stroke width, and a label overlaps the pipe when a sample shares more than
0.5 px with its box in both directions. A hop is a gap in the path data, so each subpath is sampled on its own and a
label over a hop's gap does not count; the halves of a helix share their segment's name. The captions
(`text.circuit-label`, `text.source-caption`, `text.tank-caption`) are boxed like labels, as the em box of their text,
and a caption overlapping a label or a pipe counts (captions inside a part's group, such as the ground loop's, are
checked against pipes only; as that part they are already checked against labels). The `bare` labels inside tank 50
ignore pipe samples inside tank 50's box. Pairs read `label X x pipe:<segment>`, `caption:<text> x label X` and
`caption:<text> x pipe:<segment>`.

The boxes, exclusions, installations and tolerance live in `dev/overlaps.ts`, shared by the script and by the browser
test `test/card/overlaps.browser.test.ts`, which runs the same check (with pipes) in the horizontal layout at the
threshold, 800 and 1000 px in headless Chromium and WebKit so that a change to the drawing or the labels that brings
overlaps back fails `npm test`. The layout at real widths (`test/card/layout.browser.test.ts`) is also a browser test:
happy-dom has no layout.

Two choices decide the result. A label's box is its em box, with the half-leading trimmed, because the line boxes of the
stacked compressor rows overlap at every width. And the tolerance is 0.5 px; with no tolerance (boxes that merely touch
count) the threshold is the same, 600 px (re-measured 2026-11-13 with the tolerance set to 0; it was 680 px before
refine-simplified-layout).

History: the first measurement (add-compact-layout, labels and components only) gave 700 px, then 640 px once the
compressor rows were spaced 12 units apart. With pipes and captions counted on the drawing before
refine-simplified-layout the threshold was 700 px (171 overlaps at 640 px and 660 px, 126 at 680 px, 3242 at 320 px; the
most frequent pairs were the compressor rows, the superheat against the expansion valve opening, the production inlet
against pipes `prod_44_26` and `trunk`, the discharge and suction temperatures against their pressures and the DG1
caption against the DG1 setpoint). The wider, shorter cabinet (see The arrangement) and the places in the next section
brought it to 600 px (no overlaps from 600 px; 3 at 580 px, all the air unit's Out label against the feed pipe in the
defrost scenario; 179 at 560 px, 2662 at 320 px). Below 600 px the labels stop shrinking at their 8 px minimum while the
drawing keeps shrinking, so what remains are rows that are 12 to 13 units apart (the discharge and suction temperatures
against their pressures, the fan against the outside temperature), and the Out label against the feed pipe.

### The label places

A label of the arrangement is at its place in the frame under the maps (or at its zone's place for the source, the tank
and tank 50), unless `SIMPLIFIED_PLACES` in `src/diagram/label-places.ts` gives it another, each with its reason in
code. A later group of `rework-layouts` replaces this table with per-layout places found by `npm run search-places`
(that script still searches with the rules of the former narrow layout until then). Today's table:

| Label | Place | Why |
|---|---|---|
| Air unit outlet (the top port's value) | starts 3 units off the housing's wall, 12 units under the top port | "Out" and its widest value (-12.3 in the defrost scenario) end before the feed pipe at 600 px |
| Fan, outside temperature | left-aligned 9 units inside the housing, 12 and 25 units under it | the outside value (about 105 units wide at 600 px) centred on the fan reaches the hybrid return pipe |
| Compressor 11: rpm, %, W | x 497, y 308, 322 and 336 (a pitch of 14 units instead of 12) | the text of a 600 px card is taller than 12 units |
| DG1 demand | y 118 instead of 123 | the plate touches the cabinet's top edge at 123 |
| Ground loop In (ground) | 3 units off the down leg (x 130), start-aligned | the legs moved right for the Out value, and the widest In value must still end left of the cabinet (x 200) |
| Ground loop Out (ground; hybrid) | 3 units off the up leg (x 84), end-aligned | the widest value (-12.3, defrost) crossed the drawing's left edge at 600 px; it now stays 2 px or more inside it in Chromium and WebKit |

The brine outlet and inlet, pump 16's speed and the DG1 setpoint keep their places under the maps: with the cabinet's
extra width they clear pipes `ln3`, `ln4_a`, `src_out` and the DG1 caption at 600 px and above, so they need no place of
their own.

### Superheat and the expansion valve opening

The two values at item 12 are not on the drawing at the moment (the former `detail: simplified` left them out because
they put several pairs on the drawing, and the `full` level is gone); a later group of `rework-layouts` shows them in
the horizontal layout. Tapping valve 12 still opens the opening's entity.

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
- **Markdown format** (`scripts/md-format.mjs`) over every tracked Markdown file outside `.claude/` and
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
| actions/setup-node    | v7      | the latest release, v7.1.0, on its GitHub releases page (2026-11-18)            |
| hacs/action           | main    | the HACS docs' example; its last tagged release, 22.5.0, dates from 2022 (hacs.xyz, GitHub, 2026-11-18)    |

The codespell and yamllint versions are core's, as recorded in hot-water-tank-estimator on 2026-10-31. When the pins
change, update `scripts/lint-ha.mjs`, `.github/workflows/check.yml`, `.github/workflows/validate.yml` and this table
together.

The browser tests measure label and footer boxes in Roboto (`EMULATOR_FONT` in `dev/overlaps.ts`), so Roboto must be
installed for them to pass. CI installs it (`fonts-roboto`, a step of `check.yml`); install it locally too.

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

These are the criteria the drawing is being built to meet (the band order and the values inside bodies apply to the
reworked drawing as it lands); a capture that fails one is a finding, not a pass.

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
