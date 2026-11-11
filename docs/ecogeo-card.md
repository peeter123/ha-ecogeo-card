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

## Operating mode

The mode is derived (derived), by a pure function that names its inputs: `unit.on_off`, `compressor.mode`,
`compressor.speed`, `dhw.demand`, `unit.summer`, `production.pump` and the `active_cooling` and
`passive_cooling` feature states. The first row whose condition holds wins.

| Order | Mode | Condition |
|---|---|---|
| 1 | Off | `unit.on_off` reads OFF (case-insensitive); EMERGENCY is not off |
| 2 | Defrost | `compressor.mode` reads Defrost (case-insensitive); Balance is not defrost |
| 3 | DHW | the compressor runs and `dhw.demand` is on |
| 4 | Active cooling | the compressor runs, `unit.summer` is on and `active_cooling` is `true` |
| 5 | Heating | the compressor runs |
| 6 | Passive cooling | the compressor is stopped, `unit.summer` is on, the production pump runs and `passive_cooling` is `true` |
| 7 | Standby | everything else, including an unknown compressor speed |

The compressor runs when its speed is above 0 rpm; a pump runs when its speed is above 0 %. An unavailable or unknown
input counts as not running or not active. The alarm (`unit.alarm`) and the bridge connection (`unit.connection`,
the ESPHome device's connectivity, not the heat pump) never change the mode: they add an Alarm and an Offline
indication.

Valves and circuits follow the mode (also pure, in `src/calc/circuits.ts`):

| Mode | Valve 26 | Valve 14 | Valves 27/28 | Active circuits |
|---|---|---|---|---|
| Heating | ports 1/2 | normal | closed | refrigerant, brine, production to ports 1/2 |
| DHW | ports 5/6 | normal | closed | refrigerant, brine, production to ports 5/6, DHW coil |
| Active cooling | ports 1/2 | reversed | closed | refrigerant, brine, production to ports 1/2; with HTR recovery also HTR and the DHW coil |
| Passive cooling | ports 1/2 | normal | exchanger 10 | brine, production to ports 1/2, exchanger 10 |
| Defrost | ports 1/2 | normal | exchanger 10 | the same as passive cooling; the refrigerant is idle |
| Off, Standby | ports 1/2 | normal | closed | none |

- The brine circuit is active only while the brine pump runs.
- A circuit whose part is `false` or `unused` is never active, except exchanger 10 with valves 27/28 in a defrost
  (and not at all when `passive_cooling` is `false`).
- HTR recovery: in active cooling, with `htr` `true`, a DHW storage and `heating.capacity` (the condensation
  capacity) above 0 W, the HTR circuit (exchanger 9, pump 17) and the DHW coil are active and valve 26 stays towards
  ports 1/2. In every other mode HTR is drawn idle: its state is not known (coil 210 is not exposed by the firmware).
- Without DHW storage (`dhw: none`) there is no DHW loop, so the DHW mode has no DHW circuits and HTR is never active.

## Drawing

The cabinet is drawn as inline SVG, in a fixed viewBox of 1000 x 620 units that scales with the card width. There is
no image anywhere. Everything below cites the manual (manual-figure, section 3.1, figures B1 to B4 and C, item
numbers 1 to 54); coordinates are the card's own, the topology is the figure's.

### Detail levels

The option `detail` sets how much of the manual figure is drawn. `simplified` (the default) shows no item numbers
and leaves out the service and safety parts that have no live value, together with the stub pipes that lead only to
them. `full` draws every part of the figure and writes its item number beside it. The parts left out in simplified:

| Items | Part | Why left out in simplified |
|---|---|---|
| 18, 19 | Brine and production expansion vessels | no live value, service hardware |
| 20, 21 | Brine and production safety valves | over-pressure protection, no live value |
| 23, 24 | Brine drain and production discharge valves | service only |
| 39, 40 | Suction and discharge mini-pressure switches | safety trip, no entity |
| 41 | Service outlets (both) | service only |
| 52, 53 | Model C manual trap and tank drain valve | service only |

The transducers 35 to 38 (they carry the pressure values), valves 22 and 25 (they define the HTR loop) and thermostat
45 (it belongs to resistor 44) stay in both levels.

### Component names and taps

Every drawn component carries its name from the manual's component list and its item number as a tooltip, for example
"Production circulator pump (15)", and the same text as its accessible name; the connections are named the same way
("Production outlet (1)"). A component with an entity of its own is a button: a click, Enter or Space opens that
entity's more-info dialog, as the value labels do. These are the compressor (rpm), expansion valve 12, condenser 8 and
evaporator 7 (their temperatures), pumps 15 and 16, valve 26 (the DHW demand), probes 29 to 34, transducers 35 to 38,
the air unit's fan and the tanks (the DHW temperature). The other components have no entity of their own and are
neither tappable nor focusable. While the card shows its sample values nothing is tappable.

### Items drawn

With `detail: full` each drawn component carries its item number as small secondary text. Parts in italics depend on
a feature or on the DHW storage (see below). Items 18 to 21, 23, 24, 39 to 41, 52 and 53 are drawn only with
`detail: full`.

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
| 18, 19 | expansion vessel | Brine and production expansion vessels |
| 20, 21 | safety valve | Brine and production safety valves |
| *22*, *25* | valve, drain valve | *HTR system retention and discharge valves* |
| 23, 24 | drain valve | Brine drain and production discharge valves |
| *26* | three-way valve | *DHW valve, drawn in its position (towards ports 1/2 or the DHW lines)* |
| *27*, *28* | three-way valve | *Passive cooling production and brine valves, drawn in their position* |
| 29 to 34 | probe T | Suction, discharge, brine outlet, brine inlet, production outlet and production return probes |
| 35, 36, 37, 38 | transducer P | Suction, discharge, brine and production pressure transducers |
| 39, 40 | mini-pressure switch | Suction and discharge switches |
| 41 | service outlet | Service outlets (two) |
| *44*, *45* | resistor, thermostat | *Outlet resistor and safety thermostat* |
| *47, 48, 49* | port | *Model C only: tap water inlet, DHW outlet and recirculation, on the top edge (see Source and DHW)* |
| *50, 51* | tank, coil | *Model C only: the integrated DHW storage tank and its coil* |
| *52, 53* | service outlet, drain valve | *Model C only: the manual trap on the coil's supply line and the tank drain valve* |
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
- `unused`: the part is drawn muted and is never active, except that exchanger 10 with valves 27/28 is drawn active in a defrost. Pipes that only serve it are muted; a pipe that merely
  passes through it (for example the discharge line through exchanger 9) stays normal.
- Without DHW storage (`dhw: none`) connections 5/6, valve 26 and the whole HTR group (9, 17, 22, 25) are not drawn,
  because HTR only makes sense with a DHW storage; ports 1/2 connect straight to the production circuit, and the discharge line runs from compressor 11 straight to valve 14.
- Model C draws no connections 5/6. The DHW lines of valve 26 run into the integrated tank (items 47 to 54), drawn
  under the top edge (see Source and DHW).

### How the B4 figure is laid out

- **Top edge:** ports 1 and 2 are left, 3 and 4 right of centre, 5 and 6 far right. The DG1 stubs of ports 1/2 end
  just below the pipe run above the cabinet; the pipes of ports 3/4 and 5/6 leave from the top edge into that run
  (see the Source and DHW sections), so no pipe outside the cabinet crosses another.
- **DHW lines:** valve 26 sits on port 1's line. Its DHW output is the supply line across the cabinet to port 5, and
  the return line from port 6 runs back across to join port 2's line. Exchanger 9 taps the supply, pump 17 the return.
- **Refrigerant:** compressor 11 is in the middle, drawn as the standard compressor symbol: a circle with two straight
  lines that start on it at the suction side and converge towards the discharge side, so the wide side faces the
  suction pipe (right) and the narrow side the discharge pipe (left). The discharge runs left through 36, 40 (drawn only with `detail: full`) and 30 into HTR exchanger 9 and on to inversion valve 14, which feeds condenser 8 (heating) or evaporator 7 (active
  cooling). The expansion leg 8, 41, 13, 12, 7 runs along the lower row; the suction returns through 29, 35 and 39
  with service outlet 41.
- **Valve 14's ports:** the three ports on its right are ordered suction (top), evaporator 7 (middle), condenser 8
  (bottom). The figure orders them evaporator, suction, condenser, which makes two refrigerant pipes cross; this
  order does not. It is a layout choice, the connections are the same.
- **Production:** the return trunk runs from the junction of ports 2 and 6 down to valve 27, pump 15 and condenser 8.
  From there the outlet runs left to resistor 44 and up past probe 33 to valve 26 and port 1. The resistor is drawn
  vertical on port 1's lane (the figure draws it horizontal with the return line passing behind it). The vessel 19,
  transducer 38 and safety valve 21 sit on the pump's suction side and drain 24 after the pump, as in the figure.
- **Exchanger 10:** below the lower row, with valves 27 and 28 beside pump 15 and evaporator 7: production water
  passes one side, brine the other. Vessel 18, transducer 37 and safety valve 20 tap port 4's line before pump 16;
  drain 23 hangs on port 3's line.
- **Crossings inside the cabinet:** the line from port 1 through valve 26 to port 5 separates port 2 from port 6, yet
  the DHW return from 6 has to join port 2's line, so at least one internal crossing is unavoidable. The figure
  has 15 (14 hops, plus the return line passing behind resistor 44); this layout needs 14. Each is declared as data in `src/diagram/geometry.ts`
  and drawn as a hop, a small gap in one of the two pipes: the DHW supply and return across the lines of ports 2, 3
  and 4 (5 hops) and across the HTR riser (1), the return trunk across the outlet line (1), the brine feed across
  port 3's line (1), exchanger 10's brine pipes across each other (1) and across port 3's drain line (1), and the
  production vessel and drain taps across exchanger 10's two production pipes (4). Tests fail when two pipes cross
  anywhere else.

## Source and DHW

The outer-loop source and the DHW storage are drawn outside the cabinet, in the zones left (x 0 to 240) and right
(x 790 to 1000) of it. Their pipes are segments in `src/diagram/geometry.ts`, like the cabinet's, so they take
the same colour and animation (see Colours). The air unit, the ground loop and the external tank have no item number in the manual;
the manual's figures stop at the connections.

### Outer-loop source (`source`)

Connection 3 (brine outlet) and 4 (brine inlet) rise from the top edge into the pipe run above the cabinet, above the
DG1 stubs and the circuit labels. Port 4's pipe is the higher one (y 50, port 3's runs at y 85), so the two never
cross on their way left. They belong to the brine circuit: they are active with it, defrost included.

The top of the source sits on the cabinet's top line (y 130): the air unit's housing, or the ground loop's ground
line when there is no air unit, so that the thick top lines of the unit and of the source are level (the external
tank's top is level with them too). In the hybrid the air unit sits there and the ground loop below it. The captions
keep their places relative to their device: "Air unit" above the housing, "Ground loop" under the loop.

- **Air:** a housing with a slatted front (slats left and right of the fan), a coil block with a frame and 13 thin
  vertical fins, and a fan under it. The brine tube winds over the fins in four passes joined by rounded U-bends
  (half circles). It enters and leaves the coil block on its right side, the side facing the cabinet: both pipes
  leave through the housing's right wall. The feed comes down from port 3's line at x 226 to the bottom pass; the
  exit leaves the top pass and rises at x 206, left of the feed, so that no pipe crosses another (it is the reason
  for the order of the ports: the exit on top). The fan is a ring with a hub and five swept blades. It rotates
  while `source.fan_speed` is above 0 % (a full turn takes 120 s divided by the speed in %, between 0.5 and 6 s) and
  stands still at 0 % or without a value. It does not depend on the mode, so it also turns in standby when its own
  speed says so. With `prefers-reduced-motion` the fan stands still.
- **Ground:** a ground line (the surface, hatched) with a single loop below it, like a borehole's U-tube: one leg
  goes down from the line, a half circle forms the bottom and one leg comes back up. The brine goes down the leg
  fed from port 3 (at x 166) and returns up the other (x 106) to port 4. The hatching leaves out the places where
  the legs pass.
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

- **External (model B):** ports 5 (outlet) and 6 (inlet), the manual's "DHW inter-accumulator", rise into the run and
  go right to a tank drawn as a rounded cylinder (straight walls, elliptical domed caps). The tank is centred on the
  coil and the apex of its top dome sits on the cabinet's top line; its values are centred under it. Port 5's pipe is the
  higher one (y 50 against y 85) so they do not cross. The coil is a helix in the lower part of the tank, seen from
  the side: four and a half turns, the front half of each turn solid and the back half faint (35 % opacity). Its two
  ends meet the pipes from ports 5 and 6. The colour, the muting and the flow animation are those of the coil pipe;
  the dash overlay runs along the front halves only. An idle coil (no flow) is drawn in a neutral grey, darker than the
  other muted pipes in the light theme so that it stays visible on the tank's tinted body; the dark theme keeps the
  normal muted grey. While the coil is idle, the two pipes that feed it are drawn in that same grey where they run
  inside the tank (clipped to the tank body), so the grey changes at the tank wall and not at the joint with the coil.
  The back halves are drawn first, under the front halves, with butt caps, so the joints at the coil's sides are
  covered by a solid front half. Model C's coil 51 is drawn the same way, lying on its side, with closer (pitch 8) and
  rounder turns (seven and a half) than the external coil.
- **Internal (model C):** the integrated tank is drawn inside the cabinet, under the top edge, after figure C: tank
  50 with coil 51 (a helix, see above), probe 54 and the connections 47 (tap water inlet), 48 (DHW outlet) and 49 (recirculation) on the
  top edge, the manual trap 52 on the coil's supply line, and the drain valve 53 on the tank wall. The figure's tank
  is tall and fills the cabinet; this one is squat so that the probe row and the rest of the cabinet stay as in the
  B figures. It differs from the figure in these ways: 47 and 49 are short stubs that end at the tank's top rather
  than dip tubes (the coil fills the tank's height, so a tube would cross it), the trap sits on the supply line
  instead of the coil's high point, and probe 54 and drain valve 53 touch the wall.
- **None:** no tank, no DHW pipes, no connections 5/6, no valve 26 and no HTR group. The mode label "DHW" can still show when the unit reports DHW mode.

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

There is no green stop: the hues are about 214, 206, 199, 40, 24 and 352 degrees, none between 75 and 165. The pale blue at 20 °C keeps
the mix of light blue and amber from turning grey-green (a unit test samples the whole scale in 1 K steps), so cold brine at -2.8 °C is a blue between the first two stops, closer to blue, and nothing reads as
"fine" by colour alone.

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
- **HTR recovery** (active cooling with HTR active): the DHW lines between valve 26 and the tank, outside the arm of
  valve 26, and the pipes to and in an external tank carry HTR water, so they take the DHW temperature.
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

At 0 % or without a value the pipe is still. Dead-end taps (vessels, drain valves, safety valves) are coloured
but never animated. With `prefers-reduced-motion: reduce` nothing is animated, the pipes and the fan alike; the colours
stay the same.

The tank body colour is the custom property `--dhw-tank-color` on the drawing; the tank takes the muted colour and
shows no number while the DHW temperature is unavailable.

## Live values

Values are HTML labels laid over the drawing at percentage positions computed from viewBox coordinates, so text stays
crisp and selectable; they scale with the drawing. Positions are in `src/diagram/labels.ts`. Tapping a value opens
Home Assistant's more-info dialog for its entity (in sample mode they do nothing); the card calls no service and
writes no entity.

| Value | Where |
|---|---|
| Production outlet (33) and return (34), pressure (38), pump 15 | left of probe 33, under probe 34, under pressure probe 38, above pump 15 |
| DG1 setpoint, and "Demand" while the DG1 demand is on | above the DG1 label at connections 1/2, and right of port 2 |
| Brine outlet (31) and inlet (32), pressure (37), pump 16 | under the probes, under probe 37, left of the pump |
| Discharge (30) and suction (29) temperatures, pressures 36 and 35 | below the discharge and suction lines of the probe row |
| Compressor 11: rpm, %, W | a stack inside the refrigerant loop |
| Superheat (K) and valve opening (%) at 12 | above the expansion valve |
| Condensation (8) and evaporation (7) temperatures | under exchangers 8 and 7 |
| Air unit: fan, outside temperature | under the housing |
| Air unit: In (brine outlet of the heat pump) and Out (air unit outlet temperature); a hybrid: only In | right of the housing, next to the ports: air, In at the bottom port and Out at the top one; hybrid, In at the top port |
| Ground loop: In (brine outlet) and Out (brine inlet); a hybrid: only Out | at the ground line, In right of the down leg and Out left of the up leg |
| Tank: temperature, setpoint, start delta-T (K), "Demand" while on | under the external tank; on model C as one row inside tank 50, in the strip above coil 51, with no background plate, at the normal label size and with the short captions "Set" and "ΔT" (the "Demand" text under the row) |

The labels have a minimum font size, so on a card narrower than about 560 px while the demand line shows (about 510 px for the three values alone) the labels inside tank 50 start to touch; narrower cards are left to the compact layout (`add-compact-layout`).

A value of a part that is not drawn is not shown (no DHW storage, no tank values; a source that is not drawn, no
source values). A drawn value with no value shows a muted dash and keeps its place.

The footer shows the mode, the on/off state, the season, the outside temperature, the COP, the condensation and
evaporation capacity, and the alarm and offline indications.

### Formatting

The card formats every number itself (`src/calc/display.ts`), never through `hass.formatEntityState`, which would turn
"38.9 %" into "38.9%" and "rpm" into "RPM".

- The number uses Home Assistant's language and number format, without a thousands separator ("2803 rpm", "4712 W").
  The copied `formatNumber` has a `grouping` flag for this.
- The decimals come from the entity's `display_precision` in the entity registry when it has one and the entity's unit
  is the role's own unit; else (no precision, or a converted value such as kW shown as W, a Fahrenheit probe) from the role
  table (1 for temperatures, bar and %, 0 for rpm, W, the valve opening, the DHW setpoint and start delta-T).
- The unit is the role's own, joined to the number by a no-break space: °C for temperatures, K for temperature
  differences (superheat, start delta-T), bar, %, rpm and W. The COP has none.
- A state in °F is converted to °C and one in kW to W; a temperature difference in °F is converted back with the
  same absolute formula (43.2 °F is 6.2 K), because Home Assistant converted it as if it were a temperature.
- The card re-renders when the state or registry entry of one of its entities changes, or the theme, locale or
  configuration; other entities changing do nothing.

## Layout

The card observes its own width (a `ResizeObserver` on the card element) and derives a layout from it and from the
`layout` option (`auto`, `full` or `compact`, default `auto`). `full` and `compact` force that layout at any width.
With `auto` the card is compact while it is narrower than the compact threshold and full from the threshold up;
before the first width is known (or while the card is not displayed, width 0) it is full. The rule is `isCompact` in
`src/lib/layout.ts`, copied from the hrv-ventilation repo (`src/diagram/labels.ts`); the threshold constant
`COMPACT_BELOW` is this card's own. A re-render happens only when the derived layout changes, so state updates keep
their entity-based gating, and an observation whose width did not change is ignored.

What the compact layout shows: the schematic at the simplified detail level whatever `detail` says, only the key
value labels (production outlet and return, brine outlet and inlet, compressor speed, the DHW temperature and the
source's outlet temperature), and a footer with the mode, the COP, the outside temperature and the alarm and
offline indications. Lines and text keep a minimum rendered size so that a thin card stays legible. This content
arrives with the `add-compact-layout` change; the threshold and the `layout` option come first.

### The compact threshold

The threshold is 700 px (measured on 2026-11-11). It is the narrowest card width at which the full layout, at the
simplified detail level, shows no overlapping labels in any emulator scenario, on the 20 px grid from 320 to 800 px with
every wider grid width also clean.

Method (`npm run measure-layout`, `scripts/measure-layout.mjs`, Playwright): every emulator scenario is opened in
the forced full layout at the simplified detail level, in four installations (a ground loop on model B, an air unit,
the hybrid, and model C with its internal tank), and the card is set to every width from 320 to 800 px in 20 px
steps. At each width the script compares, in the DOM, the bounding boxes of the value labels with each other and
with the boxes of the drawing's component groups (the symbol groups, the DHW storage, the air unit and the marks of
the ground loop). A label's box leaves out the half-leading above and below its text; two boxes overlap when they
share more than 0.5 px in both directions. The labels inside tank 50 on model C are not compared with tank 50, which
they sit on by design. The threshold is the narrowest width with zero overlaps in every case, provided every wider
measured width is also clean. Pipes are not checked by the script; the emulator captures at the threshold
(`threshold-*` in `npm run capture`) are inspected by eye for those.

The boxes, exclusions, installations and tolerance live in `dev/overlaps.ts`, shared by the script and by the
browser test `test/card/overlaps.browser.test.ts`, which runs the same check at the threshold in headless Chromium
so that a change to the drawing or the labels that brings overlaps back fails `npm test`. The layout at real widths
(`test/card/layout.browser.test.ts`) is also a browser test: happy-dom has no layout.

Two choices decide the result. A label's box is its em box, with the half-leading trimmed, because the line boxes of
the stacked compressor rows overlap at every width. And the tolerance is 0.5 px; with no tolerance the threshold
would be about 740 px. Measuring in 10 px steps would give 690 px, but there the compressor rows have only about 6 px
of margin, so the 20 px grid value of 700 px is kept.

Result: below 700 px the stacked compressor values (speed, percentage, power) start to touch because the labels stop
shrinking at their 8 px minimum while their spacing keeps shrinking; below about 600 px more labels collide with
each other and with components.

## Installation

The card is one JavaScript module, `ecogeo-card.js`, built from `src/` and committed as `dist/ecogeo-card.js`
(`npm run release` checks, builds and copies it).

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

The card is read-only: it calls no service and writes no entity, so it needs no permissions beyond those of the
dashboard it sits on.
