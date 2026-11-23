# Proposal

## Why

The cabinet drawing of 1.0.0 reads clean, but the band above it does not. Each body follows its own rules:

- The values sit in a header strip, a middle strip, under the hatching, or in bold in the tank.
- Two bodies carry a divider line, and the emitter and the tank carry a "Demand" caption.
- The tank's domed bottom makes it look higher than its neighbours.
- The pipes from the connections jog at four different heights (22, 28, 34 and 46 units above the cabinet).

The user reviewed the released card on 2026-11-23 and asked for:

- one look across the band;
- a ground collector that shows how a borehole is built in practice;
- a spiral underfloor loop;
- an air unit modelled on a real outdoor unit, with its fan speed and the outside temperature;
- the compressor's black fill reverted.

## What Changes

- **One band style.**
  - The emitter, the air unit, the ground collector and the external tank share one corner radius, one outline weight
    and one inner margin.
  - They have no divider lines and no captions.
  - Every body stands flat on the band's bottom edge.
  - Every value inside a body has the same size and regular weight, and sits next to the part or pipe it measures.
- **One jog level.** The horizontal sections of every pipe between the cabinet's top edge and the band lie at one
  height above the cabinet. The external tank keeps a level of its own only where one level cannot avoid a crossing;
  the design names that case.
- **Demand captions removed.** The "Demand" text is no longer drawn anywhere: not in the emitter, not beside the
  connection 1/2 stubs, not in the external tank and not in tank 50. The demand stays visible through the circuit's
  colouring and animation, and the emitter and the tanks still open the demand entities' more-info.
- **Air unit.** The air unit is redrawn as a wide outdoor unit, modelled on a photo the user supplied:
  - a case on two feet;
  - one large fan right of centre, with a guard of concentric rings and four spokes;
  - the finned coil with the brine serpentine as a panel on its left.

  It shows three bare values inside its case:
  - the outside temperature at the top;
  - the fan speed below the fan;
  - the brine leaving the unit, next to the outlet pipe.

  The outside temperature leaves the footer whenever the air unit is drawn. In the hybrid the air unit shows the
  outside temperature and fan speed. Its Out stays hidden there: the collector's Out is the source's Out.
- **Ground collector.** The flat horizontal serpentine becomes a borehole collector:
  - the surface on top;
  - the brine rises up the collector's left side to just under the surface;
  - two vertical U-loops hang down into the ground, in series;
  - the brine drops down the right side to the outlet.

  Its Out sits at the bottom next to the outlet pipe, like the air unit's.
- **Underfloor emitter.** The underfloor serpentine becomes a bifilar spiral: in towards the centre, turn, and out
  between the inward turns. The inward run takes the supply colour and the outward run the return colour, so adjacent
  turns alternate warm and cool. The radiator keeps its columns.
- **External tank.**
  - A flat bottom on the band's edge, with only the top dome kept.
  - Its coil is flipped vertically, so the straight pipe runs along the top: the supply rises beside the coil, runs
    along the top to the helix's start, and the helix winds down to the return.
  - The DHW temperature loses its bold emphasis.

  Coil 51 of model C is unchanged.
- **Compressor.** Compressor 11 returns to the open symbol: a circle with two converging lines and no fill.
- **Body widths.** The bodies change width so that the widest band still fits the vertical layout's 720 units:
  emitter 180, air unit 190, ground collector 120, tank 160 (710 with the hybrid and two gaps of 24).
- The emulator, README.md, docs/ecogeo-card.md and the visual references follow. The release group bumps the minor
  version.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `outer-loop-source`:
  - the air unit's drawing and its three values;
  - the fan speed shown as a value;
  - the borehole collector with its Out at the outlet;
  - the hybrid's air unit values.
- `heating-emitter`:
  - the spiral underfloor loop and its colouring by run;
  - the DG1 demand caption removed.
- `dhw-storage`:
  - the flat-bottomed external tank with its coil's straight pipe on top;
  - no "Demand" in either tank;
  - no bold DHW temperature in the external tank.
- `schematic-drawing`:
  - the open compressor symbol;
  - one band style;
  - one jog level.
- `live-values`:
  - the values on the drawing (no demands; fan speed and outside temperature at the air unit);
  - the footer's outside temperature only without an air unit.

## Facts and their sources

- Compressor 11 and the item numbers of the cabinet: manual-figure, unchanged.
- Connections 3/4 (brine outlet and inlet) and 5/6 (DHW inter-accumulator outlet and inlet): manual-figure. The air
  unit, the ground collector, the external tank and the emitter remain the card's own drawings of what the connections
  lead to, not manual items.
- The roles used are unchanged:
  - `source.fan_speed` (`aerothermal_fan_speed`), `source.outside_temperature` (`outside_temperature`) and
    `source.air_unit_outlet_temperature` (`brine_temperature_air_unit_outlet`): firmware-entity.
  - `heating.demand` and `dhw.demand`: firmware-entity. They keep their roles and more-info but have no label.
- The bifilar spiral and the borehole double-U collector: common installation practice, drawn as illustrations, not
  manual items. The collector's two U-loops are drawn in series to keep one pipe path. A real double-U probe runs them
  in parallel; that simplification is recorded in the design.
- The air unit's look: a photo of an air-to-water outdoor unit supplied by the user on 2026-11-23. No vendor's
  branding is drawn.
- No register, Registers.csv or derived state changes.

## Out of scope

- Removing the demand roles or the outside temperature role: they stay configurable, keep their suggestions and their
  more-info.
- Coil 51 of model C keeps its current orientation (decided by the user 2026-11-23).
- Parallel U-loops, more boreholes, or a configurable number of loops in the collector.
- Other emitter patterns (meander variants, more radiators, DG2/DG3).
- Firmware changes: none needed.

## Impact

- Code:
  - `src/diagram/geometry.ts`: the band sizes, the shapes, the band segments, the jog levels and the collector, coil
    and emitter paths;
  - `source.ts`, `emitter.ts`, `dhw.ts` and `symbols.ts` (the compressor);
  - `label-places.ts`: the body specs, with the air unit's three values and no demand specs;
  - `labels.ts`: the footer's outside temperature by source, and no demand captions;
  - `src/strings.ts`: the demand caption strings, if nothing else uses them.
- Tests:
  - the arrangement and label snapshots are recorded again;
  - the browser overlap tests cover the new air unit values at 320 px;
  - the compressor fill test goes;
  - the visual references are recorded again on CI Linux.
- Docs: README.md (features, values), docs/ecogeo-card.md (the band, the values, the footer), CHANGELOG.md (a new
  minor version).
- Live installation: yes, at the end, with the user's go per step. Its config needs no change: it uses
  `source: air`, `dhw: external` and the default `emitter: underfloor`.
  - Run `npm run release`.
  - Deploy `dist/ecogeo-card.js` explicitly.
  - Bump the dashboard resource's `?v=` (id and value in `private/installation.md`).
  - A subagent checks a phone-width and a desktop screenshot of the schematic view.
- External: no GitHub release or tag unless the user asks for one.
