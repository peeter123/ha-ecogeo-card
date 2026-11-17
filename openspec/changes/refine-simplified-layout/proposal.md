# Proposal

## Why

At the default `detail: simplified` the card is cramped, and its values sit on the drawing. The simplified level is
the full drawing with the service and safety parts left out: it keeps every coordinate, so the band at the bottom of
the cabinet where vessels 18/19, safety valves 20/21 and drains 23/24 were stays empty (about 105 of the cabinet's 475
units), while about 15 of the 20 value labels share the probe row and the refrigerant core. On the live installation
(panel view) the brine values (5.2 °C, 1.3 °C, 100.0 %) sit on the dashed pipes 3 and 4, "Demand" sits on the
cabinet's top edge, and the DG1 setpoint sits between the run pipes. The overlap check that sets the compact
threshold does not see this: it compares labels with labels and with components, never with pipes
(`dev/overlaps.ts`). On a 1280 x 800 desktop the panel view also runs taller than the screen, and the footer falls
below the fold.

## What Changes

- **A pipe-aware overlap check.** The shared check (`dev/overlaps.ts`, used by `npm run measure-layout` and the
  browser tests) also compares the value labels and the in-drawing captions with the pipes, at their rendered stroke
  width. The compact threshold and the compact places are measured with it.
- **Its own arrangement for the simplified detail level.** The cabinet is wider (about 620 instead of 520 units) and
  shorter (the empty bottom band goes; pressure transducer 38 moves up), the probe row and the brine-side values get
  room clear of the pipes, and the outer-loop source (air unit, ground loop) and the external DHW tank are drawn
  smaller to make that width. The drawing's height shrinks with the cabinet. The topology stays the manual figure's.
  `detail: full` keeps its parts, pipes and crossings.
- **Label places and a threshold for the full detail level** (added after the pre-archive review). Measured with
  pipes, the full level overlapped at every width, so it gets label places of its own (`FULL_PLACES`), among them the
  production Out/In column outside the cabinet's left wall with Out and In captions, and its own compact threshold
  (640 px, `COMPACT_BELOW_FULL`; the simplified level's is 600 px). The overlap check also counts a label that
  crosses the cabinet outline.
- **Fewer values at the simplified level.** The superheat and the expansion valve opening (item 12) are shown only
  with `detail: full`; the compact layout already leaves them out. Tapping valve 12 still opens the opening's
  more-info.
- **The compact layout follows.** It draws the new simplified arrangement, so its label places are searched again,
  now with pipes as obstacles.
- **A panel view fits the screen.** In a panel view the drawing is no taller than the screen leaves room for under
  Home Assistant's header with the footer: it gets narrower and centred instead.
- **Extra heating circuits become long-term.** DG2, DG3 and the pool are external circuits with their own valves; the
  heat pump has no connection for them. `add-extra-circuits` leaves the README's planned follow-ups and is noted as a
  long-term idea.
- README and docs updated; release, deploy and resource bump.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `schematic-drawing`: the detail level gets its own arrangement at `simplified` (wider, shorter cabinet; smaller
  source and tank); `full` keeps its parts, pipes and crossings, with label places of its own.
- `live-values`: the superheat and the expansion valve opening are shown only at the full detail level; at the full
  level the production outlet and return values form an Out/In column outside the cabinet.
- `responsive-layout`: the compact threshold is set per detail level, and it and the compact places count overlaps
  with pipes, captions and the cabinet outline; a panel view fits the screen's height.
- `dev-emulator`: a panel control, so the panel fit can be captured.

## Facts and their sources

- Items 18-21, 23, 24 (left out at the simplified level), 12, 37, 38 and the connections 1-6: manual-figure.
- Superheat and expansion valve opening: firmware-entity roles `refrigerant.superheat` and
  `refrigerant.expansion_valve`, unchanged.
- The layout the card shows and the panel fit are derived states: inputs the `layout` and `detail` options, the
  measured width and Home Assistant's `isPanel` flag on the card.

## Out of scope

- A new arrangement for `detail: full`: its parts, pipes and crossings stay as drawn; only its value labels get
  places of its own (added after the pre-archive review).
- A portrait re-layout (source above, tank below): still a later idea from `add-compact-layout`.
- Extra heating circuits (DG2, DG3, pool): long-term, no change named; they need external valves and sensors the card
  does not know about.
- Detecting the source or model from the device: still needs the firmware to expose the source type (Registers.csv
  5143), a change in esphome-ecoforest-ecogeo first.
- An adaptive colour scale: unchanged from `refine-schematic-drawing`.

## Impact

- Code: `src/diagram/geometry.ts` (the geometry as a value per detail level), `labels.ts` (placements per arrangement,
  the two values gated on detail, compact places), `cabinet.ts`, `source.ts`, `dhw.ts` (read the
  arrangement), `src/diagram/label-places.ts` (`SIMPLIFIED_PLACES`, `COMPACT_PLACES`, `FULL_PLACES`),
  `src/card/ecogeo-card.ts` (viewBox per arrangement, `isPanel`, the panel fit), `src/lib/layout.ts` (`COMPACT_BELOW`
  re-measured, `COMPACT_BELOW_FULL` and `compactBelow(detail)`).
- Dev and tests: `dev/overlaps.ts` (pipes and captions), `scripts/measure-layout.mjs` (`--detail`), `scripts/search-places.mjs`, `dev/url-state.ts` (panel),
  `dev/captures.ts`, the browser tests, and new invariant tests for the simplified arrangement.
- Docs: `docs/ecogeo-card.md` (arrangements, overlap method, threshold, compact places, panel fit), `README.md`
  (detail level, panel view, follow-ups).
- Live installation: the card's config and dashboard are unchanged (panel view, default detail). After the release,
  `dist/ecogeo-card.js` is deployed and the dashboard resource's `?v=` is bumped (ids in `private/installation.md`);
  the new drawing is then checked with a light screenshot at desktop, tablet and phone width.
