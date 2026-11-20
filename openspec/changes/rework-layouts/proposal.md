# Proposal

## Why

On a phone the card draws the simplified arrangement, a landscape drawing 1000 by 545 units, at portrait width: the
source and the external tank take about 38 % of the width, the cabinet with every value gets about 240 px of a 390 px
card, and five of the seven compact values had to be allowed onto pipes (`ON_PIPE_COMPACT`) because no clear place
exists. The full layout, meanwhile, shows about 30 values that the user finds clutter rather than information, while
two values they do want (the superheat and the expansion valve opening) are only shown at the full detail level, which
the live card does not use. The DG1 connections end in stubs that go nowhere. The card was published as 1.0.0 on
2026-11-18 and nobody uses it yet, so the layouts can be reworked now without a migration and released again as 1.0.0.

## What Changes

- **BREAKING** `layout` becomes `auto` (default), `horizontal` or `vertical`. `full` and `compact` are no longer
  accepted. Horizontal is the landscape drawing for wide cards; vertical is a new portrait drawing for phones and
  narrow sections; `auto` picks vertical below a width threshold and horizontal above it.
- **BREAKING** The full layout and the full detail level are removed, with the `detail` option. One drawing level
  remains: the simplified parts (no item numbers, no vessels, safety or drain valves, no mini-pressure switches,
  service outlets, manual trap 52 or drain valve 53).
- Both layouts show the same 19 values: production out and in (33, 34), brine out and in (31, 32), compressor speed
  (11), the DHW temperature, the source's Out, the superheat and the expansion valve opening (12), the production and
  brine pressures (38, 37), the discharge temperature and pressure (30, 36), the suction temperature and pressure
  (29, 35), the speeds of pumps 15 and 16, and the DG1 and DHW demand. The compressor percentage and power, the
  condensation and evaporation temperatures, the fan speed, the outside temperature (it stays in the footer), the
  air unit's and ground loop's In, the DG1 setpoint and the tank setpoint and start delta-T are no longer drawn.
- New band arrangement for both layouts: the DG1 emitter, the outer-loop source and the external DHW tank sit in a
  band above the cabinet, each above its own top connections (1/2, 3/4, 5/6), joined by short pipes. The pipe run
  above the cabinet to a source on the left and the tank on the right goes away. Vertical differs from horizontal in
  its cabinet, which is stretched in height to give the values rows between the pipes.
- The cabinet's parts are laid out once more, keeping the manual figure's topology but not its coordinates: in rows
  and columns with free lanes between them for the values, which the horizontal layout widens and the vertical layout
  heightens (added 2026-11-20, after the first attempt at the vertical layout found no room in the manual figure's
  coordinates).
- The air unit and the external tank are redrawn so that their values sit inside their bodies, without an Out or DHW
  caption (added 2026-11-20: the body names its value). The ground loop
  becomes a flat collector in a hatched ground strip; the hybrid places the air unit and the collector side by side.
- New `emitter` option (`underfloor`, default, `radiator` or `none`): a small underfloor loop or radiator on the DG1
  connections, coloured and animated with the DG1 production circuit, carrying the DG1 demand.
- Pressure transducers 38 and 37 sit on the production return and brine inlet lines next to probes 34 and 32,
  without the stub pipes that led to the (no longer drawn) vessel groups. The refrigerant probes are drawn as two
  pairs: discharge 30 with 36, suction 29 with 35.
- No value label lies on a pipe in either layout (`ON_PIPE_COMPACT` goes away). Labels render at least 10 px in both
  layouts.
- One footer for both layouts: the mode, the outside temperature, the efficiency (COP or EER), the mode's power
  items, and the alarm and offline indications. The on/off state and the season leave the footer.
- Browser tests: a preflight fails the browser project at once when Chromium measures text with whole-pixel advances
  (font smoothing off, as in an RDP session), a screenshot review loop supports the drawing work, and visual
  regression references (Vitest `toMatchScreenshot`) are recorded and compared on CI Linux only.
- The editor, the emulator, the README and docs/ecogeo-card.md follow. The release group prepares 1.0.0 again; the
  GitHub release and tag `v1.0.0` are replaced only when the user asks for it.

## Capabilities

### New Capabilities

- `heating-emitter`: the DG1 heat emitter drawn on connections 1/2 (underfloor loop, radiator or none), its colouring
  and animation with the DG1 production circuit, and the DG1 demand shown on it.

### Modified Capabilities

- `responsive-layout`: the layouts become horizontal and vertical, one width threshold, one label set, no value on a
  pipe, a 10 px label floor everywhere; the compact layout's requirements are replaced.
- `card-config`: `layout` takes `auto`, `horizontal` or `vertical`; `detail` is removed; `emitter` is added.
- `schematic-drawing`: the band arrangement, the cabinet layout with value lanes, one drawing level without item
  numbers, transducers 37/38 on their lines, the refrigerant probe pairs; the detail level and both full and
  simplified arrangement requirements are replaced.
- `live-values`: the 19 values in both layouts, the DG1 demand on the emitter, one footer.
- `outer-loop-source`: the source above connections 3/4 in the band, values inside the air unit, the flat ground
  collector, the hybrid side by side.
- `dhw-storage`: the external tank above connections 5/6 with its values inside, the DHW demand kept, setpoint and
  start delta-T no longer drawn; model C without the full-level parts.
- `temperature-coloring`: the emitter's pipes and body take the DG1 supply and return temperatures.
- `component-info`: the emitter's tooltip, and scenarios that named `detail: full`.
- `card-editor`: the appearance section loses the detail level, the unit section gains the emitter, and the layout
  field offers the new values.
- `dev-emulator`: the detail control goes, the emitter and the new layout values come in, the capture list follows the
  two layouts, and the browser preflight, the screenshot review loop and the visual references are added.

## Facts and their sources

- Connections 1/2 (DG1), 3/4 (outer loop) and 5/6 (DHW) on the cabinet's top edge, in that order: manual-figure.
- Transducers 37 (brine) and 38 (production) on stubs to the vessel and safety-valve groups (18/20 and 19/21):
  manual-figure. Drawing them on the brine inlet and production return lines is a simplification of that topology,
  recorded in the design, not a new fact.
- Probes 29/30 and transducers 35/36 on the compressor's suction and discharge lines: manual-figure.
- The DG1 emitter (underfloor loop or radiator) and the external tank: not manual items (the tank is the manual's
  "DHW inter-accumulator" of ports 5/6; the emitter is the heating installation on ports 1/2).
- Roles used: `refrigerant.superheat`, `refrigerant.expansion_valve`, `production.pressure`, `brine.pressure`,
  `compressor.discharge_temperature`, `compressor.discharge_pressure`, `compressor.suction_temperature`,
  `compressor.suction_pressure`, `production.pump`, `brine.pump`, `heating.demand`, `dhw.demand`: firmware-entity,
  unchanged. No role is added or removed.
- Superheat and expansion valve opening are firmware entities already shown at the full level: firmware-entity.
- No register, Registers.csv or derived state changes; the active circuits (operating-mode) are unchanged.

## Out of scope

- Removing roles that no longer have a label (`heating.setpoint`, `dhw.setpoint`, `dhw.start_delta`,
  `compressor.power`): they stay configurable and keep their more-info and suggestion behaviour; pruning them is a
  later change if they stay unused.
- More DG circuits (DG2, DG3, mixing groups): the card draws DG1 only, as before.
- Submitting to the HACS default list: still the later change named in add-hacs-release.
- A layout chosen by the card's height or aspect ratio: `auto` decides by width only, as today.
- Firmware changes: none needed.

## Impact

- Code: `src/diagram/geometry.ts` (one arrangement model with a band, the horizontal and vertical arrangements, the
  removal of the full arrangement and of the stubs), `src/diagram/label-places.ts` (one label set, places per
  arrangement, `FULL_PLACES`, `SIMPLIFIED_PLACES`, `COMPACT_PLACES` and `ON_PIPE_COMPACT` replaced), `source.ts`,
  `dhw.ts`, a new emitter module, `labels.ts` (footer), `symbols.ts`, `src/config/options.ts` (`layout`, `detail`,
  `emitter`), `src/lib/layout.ts` (one threshold), the editor schema, `src/strings.ts`, the emulator (`dev/`), and the
  scripts `search-places.mjs`, `measure-layout.mjs` and `capture.mjs`.
- Tests: the arrangement snapshots are recorded again (the `detail-full-*` and `labels-full-*` ones go), the overlap
  browser tests follow the two layouts, a new preflight and a visual regression project; the 13 Chromium failures of
  add-hacs-release disappear with their cause understood (RDP font smoothing) and guarded.
- Docs: README.md (options, layouts, screenshots), docs/ecogeo-card.md (layouts, threshold measurement, test loop),
  CHANGELOG.md (the 1.0.0 section rewritten).
- CI: `.github/workflows/check.yml` gains the visual regression run on Linux.
- Live installation: yes, at the end. Its config sets no `layout` or `detail`, so it stays valid; it gets the default
  `emitter: underfloor`, which matches its floor heating. `npm run release`, explicit deploy of
  `dist/ecogeo-card.js`, the dashboard resource bumped to the next `?v=` (id and current value in
  `private/installation.md`), then a phone-width and a desktop screenshot of the schematic view checked by a subagent.
- External: replacing the GitHub release and tag `v1.0.0` happens only on the user's explicit request.
