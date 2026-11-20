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

The cabinet is drawn as inline SVG, in a fixed viewBox that is 1000 units wide and 647 tall (see The arrangement), and
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
the cabinet's outline, the zones (the integrated tank 50 with coil 51 inside the cabinet; above the cabinet the band
with its slots, the join lane and the bodies: the air unit, the ground collector, the external tank with its coil),
every component and pipe segment, the crossings and the value labels' placements. The band's pipes (the air coil, the
collector's serpentine, the link of the hybrid, the coil pipes of ports 5 and 6) and the labels placed from the zones
are generated from the arrangement's own zone constants, so they stay connected to their ports when a zone moves.

The cabinet's component and segment lists are authored in the coordinates of the manual figure (the frame: cabinet x 240
to 760, y 130 to 605), so every component keeps citing its item and its place in the B4 and C figures; the arrangement
is derived from them by the maps below. The card picks the arrangement with `arrangementFor(layout, key)`, a pure
function of the layout the card shows now (`horizontal` or `vertical`) and of the band key: the source, whether the
external tank is drawn and the emitter (see The band). The cabinet is the same for every key; the key only
decides which slots of the band are filled, and so where the bodies stand. An arrangement is built once per key.
`bandKeyOf(context)` gives the key of a draw context. Every consumer (the cabinet, the source, the DHW tank, the pipes,
the labels and the card's viewBox) reads the arrangement from the draw context the card builds, never from a module
constant, so one drawing cannot mix two arrangements. A draw context without an arrangement gets the horizontal one for
its key, and `arrangementFor` without a key gives the widest band (the hybrid with the tank). Until the vertical
arrangement is built (a later step of `rework-layouts`), `arrangementFor('vertical')` returns the horizontal one. The
frame itself is not drawn by any layout; `FRAME` in `src/diagram/geometry.ts` exports it so that the tests can compare
the arrangement with it. The label text size relies on the viewBox being 1000 units wide (one unit is a tenth of a
container-width percent), so every arrangement keeps that width and only the height differs.

### The horizontal arrangement

The card draws an arrangement of its own, not the frame: a cabinet 980 units wide instead of 520 and 400 tall instead
of 475, under a band that holds the source and the tank (the viewBox is 1000 x 647 instead of 1000 x 620). The cabinet
fills the drawing's width, so the labels beside the probes and pipes get room, and there is no empty band under the
lowest part.

**The cabinet.** Its contents are the frame's under two monotone piecewise-linear maps, one per axis, so
every horizontal pipe stays horizontal, every vertical one vertical, and the order of all parts is kept: the port
order, the probe placements, the HTR placement and the hops carry over by construction. Symbols keep their size
(the x map has slope 1 over every span a component's ports cover, so the pipes that end on its ports keep their
distance), and the maps only stretch, so no clearance shrinks. The x map (`HORIZONTAL_MAP_X`, frame x to arrangement x;
between breakpoints it is linear, left of 240 and right of 760 it keeps its offset):

| Frame x | 240 | 245 | 286 | 287 | 312 | 338 | 397 | 416 | 452 | 473 | 496 | 539 | 560 | 590 | 598 | 630 | 665 | 690 | 722 | 748 | 760 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Arrangement x | 10 | 110 | 151 | 242 | 267 | 303 | 362 | 389 | 425 | 470 | 493 | 536 | 567 | 597 | 609 | 641 | 746 | 771 | 880 | 920 | 990 |

The 460 extra units go where the values sit beside the parts they belong to, and to the ports of the band:

- 240 to 245, +95: production Out beside probe 33, left of its body (probe 33 is left of riser 270).
- 286 to 287, +90: production In and the production pressure, beside probes 34 and 38, between riser 270 and their
  bodies. Thermostat 45 at 286 keeps its stem on the riser, so the lane starts right of it.
- 452 to 473, +24: the lane between transducer 36 and filter dryer 13 and compressor 11 (only pipes cross it), so that
  the discharge value block clears the compressor.
- 312 to 338, +10 (the lane before the HTR column), 397 to 416, +8, 539 to 560, +10 (the core of the refrigerant
  circuit) and 590 to 598, +4: as before.
- 630 to 665, +70: brine Out right of riser 630, and the brine pressure and pump values left of probes 32 and 37.
- 690 to 722, +77, 722 to 748, +14 and 748 to 760, +58: ports 5 and 6 and the right edge. They place the tank's slot
  (width 160) right of the source's, so that the hybrid source and the tank fit side by side in the band, and the lane
  right of the brine inlet riser, free below the DHW lines, holds the brine In value.

The y map (`HORIZONTAL_MAP_Y`) is a shift that puts the cabinet's top edge under the band, 232 units down instead of
130, with no stretch: the rows inside need no more room. The cut is the band below y 505 of the frame's cabinet, which
held only parts that are no longer drawn (vessels, safety and drain valves, items 18-21, 23, 24), so the cabinet's
bottom edge moves from y 605 to y 530 of the frame (632 in the arrangement), 29 units under exchanger 10, the lowest
part, and the viewBox's height ends 15 units under it.

**No exceptions to the maps.** Every part of the cabinet, pipes and crossings included, is the frame's under the maps
(`test/diagram/simplified.test.ts` compares them). Pressure transducers 37 and 38 used to be exceptions (38 sat on a
stub in the cut band); they now sit on their lines in the frame itself (see How the B4 figure is laid out), so the
stubs, the crossing and the exception list are gone (9 crossings remain, at most 15 as in the manual's figure).

The invariants are tested on it for every source, DHW storage and model (`test/diagram/simplified.test.ts`): every part
inside its zone (the cabinet's parts inside the outline, the band's bodies inside the band and above the cabinet's
columns), no two parts overlap, ports 1-6 in order, every crossing a hop inside the cabinet and no crossing of pipes
outside it, and the source and tank pipes meeting their ports. The band has its own tests (`test/diagram/band.test.ts`).

### The band

Above the cabinet lies the band (rework-layouts D3): a strip 170 units high (its top 6 units under the viewBox's top
edge) with three slots, left to right the DG1 emitter over ports 1/2, the outer-loop source over ports 3/4 and the
external DHW tank over ports 5/6, and under it the join lane, 56 units high, between the band's bottom edge and the
cabinet's top edge. Every body stands on the band's bottom edge, so the bodies' lower edges are level whatever their
height. Nothing is drawn beside the cabinet and no pipe runs over it: each pipe rises straight from its port into the
join lane, takes at most one horizontal jog there and rises into its part.

The emitter is the `emitter` option's body (see The emitter): 200 units wide, in the first slot. With `emitter: none`
its slot is empty (width 0) and gives its space to the others, and ports 1/2 keep short stubs with the DG1 demand beside
them.

**Slots.** `planBand` places the parts. Each is centred over the middle of its port pair (the emitter over ports 1/2 at
x 135 and 267, the source over 3/4 at x 641 and 771, the tank over 5/6 at x 880 and 920) where its width allows. Where
two parts would come closer than 24 units (`BAND.gap`) or leave the cabinet's columns, the parts move the least that
restores the order, the gaps and the bounds; neighbours that meet share the move (the cluster of the two centres on the
mean of their ideal places). A part of width 0 is empty: it has no slot and gives its space to the others, so the
arrangement is built per band key (the source, whether the external tank is drawn, the emitter): without a
tank (`dhw: none`, or model C, whose tank 50 is inside the cabinet) the hybrid is centred over its ports (x 550 to 862),
with the tank it moves left (x 494 to 806) and the tank ends at the cabinet's right edge (x 830 to 990). The source's
width is that of its body: 130 for the air unit, 170 for the collector, 312 for the hybrid (the air unit, 12 units of
gap, the collector). Ports 3/4 lie close together, so the source usually shifts left or right of its ports and the join
pipes jog.

**Joins.** The jogs lie at fixed heights above the cabinet's top edge (`bandJogs`): port 3's pipe at 22 units, the
tank's two pipes at 28, port 4's pipe at 34 and the hybrid's link at 46, all above the stubs of connections 47 to 49
(12 units) and under the band (56). Port 3's pipe jogs lowest, port 4's above it and the link highest, so a vertical
piece never meets a horizontal one: no two pipes outside the cabinet cross (a test checks it for every source and tank
combination), and no join pipe runs past another part, only under its own body. The tank's pipes jog outward, port 5's
to the left, port 6's to the right, into the columns left and right of the coil.

**Bodies.** None of the band's parts is a manual item: the manual's figures stop at connections 3 to 6. Their tooltips
carry their names alone ("Underfloor heating", "Radiator", "Air unit", "Air unit fan", "Ground collector", "DHW tank"),
no item number. Each body registers its obstacles inside (the coil block and fan of the air unit, the hatching and
serpentine of the collector, the tank's rim) with `data-obstacle`, so the overlap check and the place search see them.
The values of a body are placed by functions of its zone (`bodySpecs` in `src/diagram/label-places.ts`), so they follow
the body.

- **Emitter**, 200 x 124: an underfloor loop or a radiator, with the DG1 demand in a strip at its top (see The emitter).
- **Air unit**, 130 x 168: the fan (a ring of radius 28) at the top, a divider, a strip 24 high for the Out value, and
  the coil block (110 x 58) at the bottom, facing the cabinet. The brine tube winds through the block in four vertical
  passes, 22 apart, joined by U-bends at the top and bottom of the block; it enters at the first pass and leaves at the
  last one, both on the block's bottom face (32 and 98 units from the housing's left edge), where the pipes from the
  join lane arrive. Six horizontal fins cross the passes. The Out value sits in the strip **between the coil block and
  the fan**, not above the fan: it is next to the coil's outlet, and the fan keeps the top of the housing to itself,
  which also keeps the value away from the housing's top outline in a small drawing (decided with the captures,
  2026-11-19).
- **Ground collector**, 170 x 112: a strip of ground, hatched along its top (14 units of diagonal ticks under the
  surface line), the Out value in a strip 24 high under the hatching, and the serpentine in its lower part: four
  horizontal passes 14 apart joined by half-circle bends. The brine enters on the bottom face at the feed riser (14
  units from the left edge), rises to the top pass, runs through the passes and leaves down the left end of the bottom
  pass (34 units from the left edge). The collector's halves take their temperatures (see Colours).
- **External tank**, 160 x 170 with domes of 14: see DHW storage.

### The emitter

The DG1 heating circuit's emitter (rework-layouts D5) is the first body of the band, over connections 1 and 2, so that
the production water visibly goes somewhere. It is not a manual item: the heating installation is outside the unit, and
the manual's figures stop at connections 1 and 2. Like the air unit, the collector and the tank it therefore cites no
item number (the comments in `src/diagram/emitter.ts` and `src/diagram/geometry.ts` say so); its tooltip names it,
"Underfloor heating" or "Radiator". The `emitter` option chooses it: `underfloor` (the default), `radiator` or `none`.

- **Pipes.** The supply pipe `dg1_sup` runs from connection 1 up through the join lane (at most one jog, 22 units over
  the top edge) into the body's bottom face, 34 units inside its left edge, and on to the inlet; the return pipe
  `dg1_ret` runs from the outlet down the right side of the body (34 units inside its right edge) to connection 2. Both
  are in the DG1 production circuit, like the cabinet's `p1_up` and `p2_in`, so activity and animation follow the
  circuit without logic of their own: they are coloured and animated while it is active (heating, passive cooling) and
  muted and still otherwise (DHW). The supply takes production outlet 33 and the return production return 34, and the
  DG1 pipes inside the cabinet continue them (see Colours).
- **Underfloor** (`underfloor`), 200 x 124: a floor strip (a rounded rectangle in the outline style) with a divider, the
  floor surface, 43 units under its top. Under the divider one serpentine runs in five horizontal passes 14 apart,
  joined by half-circle bends: the supply pipe enters at the top pass at the left, the passes run right, left, right,
  left and right, and the return pipe leaves the bottom pass at the right. The serpentine is one path stroked with a
  vertical gradient (user space, from the first pass to the last) from the supply colour at the first, top pass (the
  inlet) to the return colour at the last, bottom pass (the outlet); the gradient is the loop's own and does not follow
  `exchanger_fill`. Idle, the loop takes the muted colour; while the circuit flows, the dash overlay runs along it like
  on the pipes.
- **Radiator** (`radiator`), 200 x 124: a panel with six vertical columns (10 wide, 8 apart, 72 tall) in outline style.
  The supply pipe meets the first column at the top left (54 units under the body's top) and the return pipe leaves the
  last column at the bottom right (106 under it): inlet at the top on one side, outlet at the bottom on the other. With
  `exchanger_fill: gradient` (the default) the whole body is filled with the same vertical gradient, supply colour at
  its top to return colour at its bottom (opacity 0.5, the exchangers' 0.55 less a little for the demand text); with
  `exchanger_fill: none` the body has no fill, and its outline, columns and pipes are drawn as with it.
- **No emitter** (`none`): the slot is empty and connections 1 and 2 end in the short dead-end stubs of the cabinet
  (`p1_stub`, `p2_stub`, band segments like the emitter's pipes, 12 units over the top edge, coloured, never animated).
- **Demand.** The DG1 demand is the label `emitter_demand` ("Demand" while the demand entity is on, nothing otherwise),
  inside the body in a strip 24 high at its top (14 units under the top), above the divider or the columns, so it
  touches no pipe. Without an emitter it is the label `dg1_demand`, beside the stubs of connections 1 and 2 (a recorded
  place, see The label places). It is one value: a configuration shows one of the two.
- **Tap.** The emitter is a button for the DG1 demand's more-info dialog (the role `heating.demand`); with that role set
  to `none` (or without an entity) it is neither a button nor focusable. Nothing is tappable while the sample values
  show.
- **Checks.** The body registers its divider (underfloor) or its columns (radiator) with `data-obstacle`; the loop, like
  every pipe, is sampled by the overlap check. `test/diagram/emitter.test.ts` holds the heating-emitter scenarios.

### How the B4 figure is laid out

- **Top edge:** ports 1 and 2 are left, 3 and 4 right of centre, 5 and 6 far right. The DG1 emitter of ports 1/2 (or,
  without one, their stubs, 12 units long); the pipes of ports 3/4 and 5/6 rise from the top edge into the join lane of
  the band (see The band and the Source and DHW sections), so no pipe outside the cabinet crosses another.
- **DHW lines:** valve 26 sits on port 1's line. Its DHW output is the supply line across the cabinet to port 5, and
  the return line from port 6 runs back across to join port 2's line. Exchanger 9 taps the supply, pump 17 the return.
-  **Refrigerant:** compressor 11 is in the middle, drawn as the standard compressor symbol: a circle with two
  straight lines that start on it at the suction side and converge towards the discharge side, so the wide side faces
  the suction pipe (right) and the narrow side the discharge pipe (left). The two parts of the circle outside the
  lines (between each line and the circle) are filled solid in the outline colour, `currentColor`, which the card sets
  to the theme's primary text colour (the compressor has no feature, so it is never muted): black on a light
  theme, the light outline colour on a dark one. Each filled part is one closed path: along its line, on to the circle
  on the same slope (the lines end 1 unit inside it) and back along the arc, so no sliver stays unfilled; the part
  between the lines stays empty. The discharge runs left through 36 and 30 into HTR exchanger 9 and on to inversion
  valve 14, which feeds condenser 8 (heating) or evaporator 7 (active cooling). The expansion leg 8, 13, 12, 7 runs
  along the lower row; the suction returns through 29 and 35. Each temperature probe sits next to its pressure
  transducer as a pair on the same line, 22 units apart (30 at frame x 430 and 36 at 452 on the discharge line; 29 at
  542 and 35 at 564 on the suction line), with no part between them. (The figure's mini-pressure switches 39 and 40
  and service outlets 41 are not drawn.)
- **Valve 14's ports:** the three ports on its right are ordered suction (top), evaporator 7 (middle), condenser 8
  (bottom). The figure orders them evaporator, suction, condenser, which makes two refrigerant pipes cross; this
  order does not. It is a layout choice, the connections are the same.
- **Production:** the return trunk runs from the junction of ports 2 and 6 down to valve 27, pump 15 and condenser 8.
  From there the outlet runs left to resistor 44 and up past probe 33 to valve 26 and port 1. The resistor is drawn
  vertical on port 1's lane (the figure draws it horizontal with the return line passing behind it). Transducer 38
  sits on the production return riser of port 2 (frame x 312), under probe 34 and above thermostat 45, drawn like
  probe 34 (body left of the riser, stem to it). The figure puts it on a tee towards vessel 19, safety valve 21 and
  drain 24; with those groups not drawn, drawing it on the line it measures, the same water on the same side of pump
  15, is the faithful simplification, and it needs no stub pipe.
- **Exchanger 10:** below the lower row, with valves 27 and 28 beside pump 15 and evaporator 7: production water
  passes one side, brine the other. Transducer 37 sits on port 4's line before pump 16 (frame x 690), under probe 32 and
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
tank"): the tooltips name the parts (see The band for the bodies and their sizes).

- **Air:** the housing with the fan at its top, the Out strip and the coil block at its bottom. The brine tube winds
  through the block in four vertical passes joined by rounded U-bends (half circles), across six horizontal fins. It
  enters at the first pass and leaves at the last one, both on the block's bottom face, the side facing the cabinet: the
  feed reaches the first pass from port 3's pipe, the exit leaves the last pass towards port 4. The fan is a ring with a
  hub and five swept blades. It rotates while `source.fan_speed` is above 0 % (a full turn takes 120 s divided by the
  speed in %, between 0.5 and 6 s) and stands still at 0 % or without a value. A fan speed in another unit (rpm) above 0
  turns it at a fixed medium speed (3 s). It does not depend on the mode, so it also turns in standby when its own speed
  says so. With `prefers-reduced-motion` the fan stands still. The housing's tooltip is "Air unit", the fan's "Air unit
  fan" (a button that opens the fan speed's more-info while the role has an entity).
- **Ground:** the collector (tooltip "Ground collector"): a ground strip hatched along its top with a flat serpentine of
  four horizontal passes in its lower part. The brine runs in at the left, up the feed riser to the top pass, through
  the passes (the first two are the collector's first half and take the brine outlet temperature, the last two its
  second half and take the brine inlet) and leaves down the left end of the bottom pass to port 4.
- **Hybrid:** both on one brine loop, in series, side by side with the air unit first (left): port 3's pipe to the air
  unit's first pass, a link pipe from its last pass (down into the join lane, right and up) to the collector's feed
  riser, and the collector's exit to port 4. The link and the air unit's exit take the air unit's outlet temperature up
  to the first half of the collector. Series keeps the drawing free of crossings, which two branches in parallel would
  not.

The source shows one value, its Out: the brine temperature leaving the device, which is the heat pump's brine inlet, so
the outer loop reads at a glance without looking into the cabinet (probes 31 and 32 stay inside it). It sits inside the
body: the air unit's Out (`source.air_unit_outlet_temperature`) in the strip between the coil block and the fan, the
collector's Out (`brine.inlet_temperature`) in the strip between the hatching and the serpentine; the hybrid shows only
the collector's Out, and the air unit and the link pipe carry no label. There is no In value, no fan speed and no
outside temperature on the drawing (their roles stay in the config, and the fan still turns by its speed). It is an
ordinary value label (see Live values).

### DHW storage (`dhw`)

- **External (model B):** ports 5 (outlet) and 6 (inlet), the manual's "DHW inter-accumulator", rise into the join lane
  and jog outward into the columns left and right of the coil, to a tank drawn as a rounded cylinder (straight walls,
  elliptical domed caps) above them. The tank is centred on the coil and stands on the band's bottom edge. Its values,
  the DHW temperature with a "DHW" caption and "Demand" while the DHW demand is on, sit in its upper part as bare labels
  on the tinted body, under the top cap's rim and over the coil: the temperature 38 units under the tank's top and the
  demand 60 under it, 22 apart so that the two keep the search's 2 px margin in WebKit, whose boxes are a unit taller.
  The coil is a helix in the lower part of the tank, seen from the side: four and a half turns, the front half of each
  turn solid and the back half faint (35 % opacity). It is mirrored, so that port 5's pipe (the left one) reaches its
  upper left end and port 6's pipe (the right one) its lower right end, and the two pipes do not cross. The colour, the
  muting and the flow animation are those of the coil pipe; the dash overlay runs along the front halves only. An idle
  coil (no flow) is drawn in a neutral grey, darker than the other muted pipes in the light theme so that it stays
  visible on the tank's tinted body; the dark theme keeps the normal muted grey. While the coil is idle, the two pipes
  that feed it are drawn in that same grey where they run inside the tank (clipped to the tank body), so the grey
  changes at the tank wall and not at the joint with the coil. The back halves are drawn first, under the front halves,
  with butt caps, so the joints at the coil's sides are covered by a solid front half. Model C's coil 51 is drawn the
  same way, lying on its side, with closer (pitch 8) and rounder turns (seven and a half) than the external coil.
- **Internal (model C):** the integrated tank is drawn inside the cabinet, under the top edge, after figure C: tank 50
  with coil 51 (a helix, see above), probe 54 and the connections 47 (tap water inlet), 48 (DHW outlet) and 49
  (recirculation) on the top edge, their stubs below the join lane's jogs. Its DHW temperature and demand sit inside
  tank 50, above coil 51. The figure's manual trap 52 and drain valve 53 are not drawn. The figure's tank is
  tall and fills the cabinet; this one is squat so that the probe row and the rest of the cabinet stay as in the B
  figures. It differs from the figure in these ways: 47 and 49 are short stubs that end at the tank's top rather than
  dip tubes (the coil fills the tank's height, so a tube would cross it), and probe 54 touches the wall. No tank is
  drawn in the band, so the source may use the tank's slot.
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
source's Out and the tank's DHW temperature and demand are live labels (see Live values).

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
| The underfloor loop's passes (a gradient from the first to the last) and the radiator's fill (top to bottom) | outlet at the inlet, return at the outlet | 33, 34 |
| Brine from connection 4 to the evaporator | `brine.inlet_temperature` | 32 |
| Brine from the evaporator to connection 3, and the pipes from 3 to the source | `brine.outlet_temperature` | 31 |
| Compressor 11 through HTR exchanger 9 and valve 14 to the condenser | `compressor.discharge_temperature` | 30 |
| Condenser 8 to the expansion valve | `refrigerant.condensation_temperature` | 8 |
| Expansion valve to evaporator 7 | `refrigerant.evaporation_temperature` | 7 |
| Evaporator 7 to the compressor | `compressor.suction_temperature` | 29 |
| Exit of the air unit; in a hybrid also the link and the collector's first half (passes 1 and 2) | `source.air_unit_outlet_temperature` | air unit |
| The collector's first half (ground source: the feed, passes 1 and 2) | `brine.outlet_temperature` | 31 |
| The collector's second half (passes 3 and 4), and the return to connection 4 | `brine.inlet_temperature` | 32 |
| HTR water (exchanger 9, pump 17, valves 22/25 and their lines) | `dhw.temperature` | tank |
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

The source's symbols (air unit housing and coil, ground collector) are muted the same way while the brine circuit is
inactive; the fan keeps following its own speed. The emitter is muted with its pipes while the DG1 production circuit is
inactive (in DHW mode, for one): its outline, divider or columns, the loop and the radiator's fill take the muted
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
| "Demand" while the DG1 demand is on | inside the emitter's body, in the strip at its top; without an emitter just above the cabinet's top edge, right of connection 2's stub |
| Brine outlet (31, "Out") and inlet (32, "In"), pressure (37), pump 16 | right of the risers at the probes (Out right of riser 630, In right of riser 690), left of transducer 37, left of the pump |
| Discharge (30) and suction (29) temperatures, pressures 36 and 35 | one two-row block per pair (temperature over pressure, 16 units apart) under the discharge and suction lines, below the pair |
| Compressor 11: rpm | inside the refrigerant loop |
| Superheat (K) and valve opening (%) at 12 | left of evaporator 7, the superheat over the opening |
| Source: "Out" of the air unit, the ground collector (the hybrid: of its collector only) | inside the body: the air unit's strip between coil block and fan, the collector's strip under its hatching |
| Tank: temperature with its "DHW" caption, and "Demand" while on | inside the upper part of the external tank, bare on its body; on model C inside tank 50, above coil 51 |

These 19 are all the card draws. The compressor percentage and power, the condensation and evaporation temperatures,
the fan speed, the outside temperature (it is in the footer), the air unit's and ground collector's In, the DG1 setpoint
and the DHW setpoint and start delta-T have no label; their roles stay configurable and keep their more-info and
suggestions. Tap valve 12 or a component with an entity for its more-info.

A value of a part that is not drawn is not shown (no DHW storage, or an unused tank (`dhw: unused`), no tank values; a
source that is not drawn, no source values). A drawn value with no value shows a muted dash and keeps its place. A role
set to `none` shows nothing (see Using another source).

The footer is one list, the same in both layouts: the mode, the outside temperature, the efficiency (COP or EER), the
power items of the mode, and the alarm and offline indications. It shows no on/off state and no season (the roles
`unit.on_off`, `unit.summer` and `unit.winter` still feed the derived mode). An item whose role is `none` is left
out.

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
  role table (1 for temperatures, the superheat, bar and %, 0 for rpm, W and the valve opening).
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

The horizontal layout is the one drawn today (see The arrangement). The vertical layout follows in a later step of the
`rework-layouts` change: until it is built, `layout: vertical` (and `auto` below the threshold) draws the horizontal
arrangement, and the phone-width checks are not in the test suite. The former values `full` and `compact` and the
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
is 64 px: one footer line is about 20 px with 8 + 12 px of padding. The longest footer (active cooling with HTR: mode,
outside temperature, EER, Cooling and HTR) fits one line (37 px) from the threshold plus the hysteresis, 584 px, up, and
wraps to two lines (58 px) only at phone widths such as 320 px (`sizes.browser.test.ts` checks it stays within the
allowance at 584 px and inside the card at 320 px); a one-line footer leaves up to 27 px of free space under it. The
width is never below 320 px, the narrowest width verified for the vertical layout (a window too short for that scrolls).
In a 1280 x 800 px window the horizontal arrangement (1000 x 647) is 1051 px wide; for a 1280 px wide card, a window
about 950 px or more tall leaves the drawing at the card's width.

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
of a later step of `rework-layouts`.)

- Strokes: `scale = width / 1000` (the drawing is 1000 units wide). The card sets `--pipe-width: max(3, 2 / scale)` and
  `--outline-width: max(2, 1.25 / scale)` on the svg, in drawing units and rounded up to 0.1 (so the rendered minimum
  still holds after rounding). The stroke rules of the drawing (pipes, outlines, the flow overlay) read them, with 3 and
  2 as the fallbacks, so a card of unknown width draws as before. The overlay's dash pattern and the gaps of the hops
  scale with `--pipe-width`. From 667 px up `scale` is 0.667 or more and the widths stay 3 and 2; at the threshold (560
  px) the horizontal layout draws pipes 3.6 and outlines 2.3 units wide. Decorative thin lines (fins,
  the air unit's divider, the ground hatching, the tank rim) are fractions of `--outline-width`.
- Fonts: the labels are `max(8px, 0.95cqw)` and the external tank's temperature `max(9px, 1.2cqw)`, in both layouts.
- Footer: a wrapping flex row with row and column gaps, in both layouts.

Browser tests measure these in Chromium and WebKit: `test/card/sizes.browser.test.ts` the rendered stroke widths and the
label font floor (320, 500 and 559 px, the last one px under the threshold, and the designed widths at 1000 px), the
wrapping footer (every item inside the card at 320 px, the longest footer inside the card and the footer allowance at
584 px) and the band at the threshold, each for `layout: horizontal` and `layout: vertical`;
`test/card/layout.browser.test.ts` the layout at real widths; `test/card/panel.browser.test.ts` the panel fit in a 1280
x 800 window.

### The vertical threshold

The threshold is 560 px (`VERTICAL_BELOW`; decided on 2026-11-19, see Browser below). It is the narrowest card width on
the 20 px grid from 320 to 800 px at which the place search puts every one of the 19 labels where its box, with a 2 px
margin, overlaps no other label, component, pipe at its rendered stroke width, outline or the drawing's edge, in any
emulator scenario, and at a place its own spec allows: the value blocks at their pairs, the hydraulic values beside
their parts, the values of the bodies inside their bodies. Below it the search finds places
down to 500 px, but from 540 px the two blocks no longer fit between the discharge and suction lines at their default
places and the search moves them about 50 units off their pairs, so the threshold stays at 560 px; at 480 px
the values of the
collector and of tank 50 find no place at all. The overlap measurement of `npm run measure-layout` (no margin, 0.5 px
tolerance) is clean from 500 px with the recorded places, in Chromium and in WebKit alike (6 overlaps at 480 px, 3353
at 320 px). What the result depends on: the grid (20 px steps from 320 to 800 px, 25 widths); the label box, the em box
of the text with the half-leading above and below trimmed; the tolerance, 0.5 px (two boxes overlap when they share more
than that in both directions); and the margin, 2 px horizontally and 1 px vertically around the label box, which the
search keeps and the measurement does not. The two rows of a value block (a temperature over a pressure, 16 units apart)
are exempt from the margin between them, as they keep their pitch.

Method (`npm run measure-layout`, `scripts/measure-layout.mjs`, Playwright): every emulator scenario is opened in the
forced horizontal layout, in thirteen installations (a ground collector, an air unit and the hybrid on model B; the same
on model C with its internal tank for the collector, the air unit and the hybrid; the unused-tank cases: a collector on
model B and an air unit on model C; an air unit and the hybrid without DHW storage; the emitters: a radiator with a
collector, and no emitter with an air unit and with the hybrid on model C), and the card is set to every width from 320
to 800 px in 20 px steps (`--widths=a,b,c` measures only those, to iterate on a place, and prints no threshold). At each
width the script compares, in the DOM, the bounding boxes of the value labels with each other, with the boxes of the
drawing's component groups (the symbol groups, the DHW storage, the air unit and the ground collector) and with the
obstacles the bodies register (the air unit's coil block and fan, the collector's hatching and serpentine, the tank's
rim) and with the pipes, and checks that no label's box leaves the drawing (`label X x edge`: the box extends past the
svg's box by more than the tolerance, which the other pairs cannot see). A label that crosses the cabinet's outline,
partly inside and partly outside, is reported as `label X x cabinet`; a label inside a body (the tank, the air unit, the
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

Browser: the place search ran in Chromium on a host with font smoothing on (see Text widths and font smoothing);
`measure-layout` ran in Chromium and in WebKit, with the same numbers, and the browser tests pass in both. The place
search also ran in WebKit (whose text is about 2 px narrower, and whose label boxes are a unit taller: 15 against 14
units) at 560 and 540 px. After the emitter (rework-layouts 6.4) the search at 560 px finds the six places below in both
engines, and "Default place meets" lists nothing for any body label in either (a first run in WebKit found the tank's
temperature meeting its demand within the margin in 10 of 312 cases; the rows are now 22 apart, 38 and 60 under the
tank's top). At 540 px the discharge and suction blocks move 50 and 53 units off their pairs in both engines, so the
threshold stays 560 px.

Result (the 19 values, the places below): at 560 px the search finds a place for every label, and the recorded places
leave `measure-layout` clean from 500 px up in both engines. Below about 842 px the labels sit at their 8 px minimum
(`max(8px, 0.95cqw)`) while the drawing keeps shrinking, so towards the narrow end the first things to go are the
discharge and suction blocks against their lines, then the bodies' values. History: before this change the threshold was
680 px (with the cabinet 620 units wide and the source and tank in zones beside it); the x stretch of the cabinet to 980
units, with those zones gone, brought it to 560 px.

### The label places

A label of the arrangement is at its default place (the frame's place under the maps, or its zone's place for the bodies
of the band and tank 50) unless `HORIZONTAL_PLACES` in `src/diagram/label-places.ts` gives it another, each with its
reason in code. The table is what `npm run search-places -- --layout=horizontal --width=560` found (the vertical layout
gets its own table in a later step): for every value, over every scenario, installation and naming (312 cases: 13
installations, 12 scenarios, 2 namings), the places on a 4-unit grid, and its default place when that is free, where the
label's box, with its 2 px margin, overlaps no component, no pipe at its rendered width, no other label and no outline,
stays inside the drawing, and, for a value inside a body, stays inside it; of those the one nearest the label's default
place (the search measures from the defaults, never from a recorded place), the Out and In pairs together and in reading
order (Out left of In, or above it) and the value blocks (the discharge and suction pairs, the superheat over the valve
opening) as two rows 16 units apart. No label sits on a pipe, and there is no exception list: a label with no place is a
decision point. The search also prints, per label, what its default place meets ("Default place meets"); the reasons
below are that output at 560 px.

| Label | Place (x, y, alignment) | Why the default place fails |
|---|---|---|
| Production Out (33) | 104, 328, end | the default ends exactly at probe 33's left edge and meets its symbol (312 cases); 6 units left of it, in the lane between the cabinet's edge and the probe |
| Production In (34) | 236, 328, end | the default meets probe 34's symbol; 6 units left of it, between riser 270 and probes 34 and 38 |
| Pressure 38 | 236, 356, end | the default meets transducer 38's symbol; the search keeps the default place's alignment (end) for the pressure labels, so it ends 6 units left of it at 236, under production In, and stays beside the transducer on wider cards |
| Brine In (32) | 776, 328, start | the default starts 3 units right of riser `ln4_a` and meets it; 5 units right of it |
| Pressure 37 | 740, 356, end | the default meets transducer 37's symbol; the search keeps the default place's alignment (end), so it ends 6 units left of it at 740 and stays beside the transducer on wider cards |
| DG1 demand | 336, 220, end | only without an emitter (with one the demand is the body label `emitter_demand`): the default crosses the cabinet's top edge (12 cases); 5 units higher, right-aligned |

Production In, Out and the pressure are beside probes 34 and 33 and transducer 38, and brine Out beside probe 31, with
no other part between: a unit test (`test/diagram/simplified.test.ts`, "values beside their probes") bounds the gap to
24 units, the places lying 6 to 13 units away, and checks that no other drawn component lies between a label and its
part, so the search cannot drift a label across another part.

Every other label keeps its default place: brine Out (right of riser 630, beside probe 31), pump 15's and 16's values,
the discharge and suction blocks (see below), the compressor speed, the superheat and valve opening, the bodies' values
(the source's Out in the strip of the air unit or collector, the DHW values in the upper part of the external tank, the
values in tank 50) and the model C values. The search finds them free at 560 px, and the overlap tests check them like
the rest.

The discharge and suction pairs and the superheat over the valve opening are two-row blocks (16 units apart, same x and
alignment), which the search places together like the Out and In pairs (`BLOCK_PAIRS` in `dev/overlaps.ts`). The
discharge block starts at x 423 under the line, the suction block ends at x 579, rows at y 362 and 378. The x map opens
24 units between transducer 36 and filter dryer 13 so that the discharge block clears compressor 11. The values of tank
50 (model C) sit in one row above coil 51: the temperature at the left wall and the demand right of it, ending 40 units
short of the right wall, where probe 54 sits.

### Superheat and the expansion valve opening

Valve 12 shows two values, in both layouts: the superheat in K over the opening in %, both left of evaporator 7 in the
horizontal layout (16 units apart). Their roles are `refrigerant.superheat` and `refrigerant.expansion_valve`; tapping
the valve opens the opening's entity.

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

These are the criteria the drawing is being built to meet; a capture that fails one is a finding, not a pass.
`--only=<regex>` writes only the captures whose name matches, to iterate on a drawing. The band captures
(`band-<source>-<storage>-<theme>-<width>`: every source above the external, internal, unused and no tank, light and
dark, at the vertical threshold and at 1000 px), the emitter captures (`emitter-<kind>-<source>-<theme>-<width>`:
underfloor, radiator and none above every source in heating, light and dark, at the vertical threshold and at 1000 px,
and `emitter-radiator-fill-none`) and `panel-heating` (1280 x 800) are the ones a drawing step checks.

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
