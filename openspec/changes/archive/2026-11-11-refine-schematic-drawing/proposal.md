# Proposal

## Why

The schematic works and is live, but it reads like the service manual's figure rather than a dashboard card. About
fifty small item numbers point to a table that only the installer manual has. Service hardware such as safety valves
and expansion vessels crowds the circuits. The exchangers stay grey while every pipe around them is coloured, the
DHW coil and the air unit are crude, the lines are thin, and the default colour scale runs through a green that
reads as "ok" rather than as a temperature. This change makes the drawing legible at a glance, before the compact
layout (`add-compact-layout`) and the visual editor (`add-card-editor`) build on it.

## What Changes

- **Item numbers off the drawing, names on hover.** By default the drawing shows no item numbers. Each drawn
  component carries its name as a tooltip, with the item number (for example "Production circulator pump (15)").
  Tapping a component that has an entity of its own opens that entity's more-info, as the value labels already do.
  Names come from the manual's component list (manual-figure, section 3.1).
- **Detail level.** A new option `detail`: `simplified` (default) or `full`. Simplified leaves out the service and
  safety hardware with no live value (manual-figure): expansion vessels 18/19, safety valves 20/21, drain valves
  23/24, mini-pressure switches 39/40, service outlets 41 and, on model C, manual trap 52 and drain valve 53,
  with their stub pipes. Full draws every part as now and shows the item numbers.
- **Exchangers coloured.** Plate exchangers 7, 8, 9 and 10 are filled per side with a gradient from that side's
  inlet to its outlet temperature, on the same scale as the pipes (derived from the probes of the segments that
  enter and leave each side). A new option `exchanger_fill`: `gradient` (default) or `none`.
- **Default colour scale without green.** The default stops become blue, light blue, pale blue, amber, orange and red. The
  `colors` option keeps working as it does.
- **Real DHW coil.** The external tank is drawn as a cylinder with domed ends and a helical coil inside (front turns
  solid, back turns faint), coloured and animated as the coil segment is today. Model C's coil 51 uses the same
  helix, smaller.
- **Air unit.** The air unit gets a finned coil block with the brine tube winding through it, and a fan with
  blades in a ring.
- **Thicker lines.** Pipes and symbol outlines get heavier strokes.
- Docs (`docs/ecogeo-card.md`) and README updated. The release is rebuilt, deployed and the dashboard resource
  bumped.
- **Follow-up fixes after the live release** (added 2026-11-11, at the user's request): a darker idle coil in the
  light theme; the external tank centred on its coil; the tank and the sources aligned to the cabinet's top line;
  the compressor drawn with the standard compressor symbol; the ground loop as a single U-loop; the air unit's
  brine inlet and outlet on the same side; the brine In and Out temperatures at the source's own ports; clean
  joints between the front and back halves of both coils, a rounder and tighter coil 51; model C's DHW values as
  one row inside tank 50. Released and deployed again.

## Capabilities

### New Capabilities

- `component-info`: what the card tells about a drawn component itself: its name and item number as a tooltip, and
  the more-info dialog of its own entity on a tap.

### Modified Capabilities

- `schematic-drawing`: item numbers shown only with `detail: full`; the service and safety parts drawn only with
  `detail: full`; exchanger fills; heavier line weights; the theme requirement no longer names item numbers; the
  standard compressor symbol.
- `temperature-coloring`: the default stops change; exchanger sides take the scale.
- `dhw-storage`: the external tank's shape and helical coil, centred and aligned to the cabinet top, with a darker
  idle coil in the light theme; model C's coil 51 as a helix, and model C's DHW values inside tank 50.
- `outer-loop-source`: the air unit's finned coil and bladed fan, its ports on one side; the ground loop as one
  U-loop; the sources aligned to the cabinet top; In and Out labels at the source's ports.
- `card-config`: the options `detail` and `exchanger_fill`.
- `dev-emulator`: controls for the detail level and the exchanger fill; the slider scenario follows the new palette.

## Out of scope

- Compact layout for narrow cards and mobile, stroke widths that grow on small cards: `add-compact-layout`.
- The visual card editor, including editing colours: `add-card-editor`.
- Finding the entities from the ESPHome device instead of a prefix: `add-entity-discovery`.
- A colour scale that adapts to the heating or cooling curve (for example its neutral point pinned to the DG1
  setpoint, `heating.setpoint`, firmware-entity): a later change, after living with the new default palette.
- New firmware registers: unchanged from `add-schematic-card` (esphome-ecoforest-ecogeo).

## Impact

- Code: `src/diagram/geometry.ts` (a `detail` mark on parts and stubs, helix data), `symbols.ts`, `cabinet.ts`,
  `source.ts`, `dhw.ts`, `colors.ts`, `labels.ts` (labels follow the moved tank and sources; new source port
  labels; model C's row inside tank 50), `src/config/options.ts`,
  `src/strings.ts` (component names), tests, emulator captures.
- Live installation: yes. `npm run release`, explicit deploy of `dist/ecogeo-card.js`, the dashboard resource
  bumped to the next `?v=` (resource id in `private/installation.md`). The existing view keeps its config: the new
  options have defaults, so the live card switches to the simplified drawing without a dashboard edit.
- No firmware change, no new entity roles.
