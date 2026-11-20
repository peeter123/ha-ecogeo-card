# Spec Delta

## REMOVED Requirements

### Requirement: Configuration controls
**Reason**: The detail level control goes with the `detail` option, and the emitter control comes in.
**Migration**: See "Configuration switches".

## ADDED Requirements

### Requirement: Configuration switches
The emulator SHALL let the developer switch:
- the model (B or C)
- the variant (1-4)
- the source (air, ground or hybrid)
- the DHW storage (external, internal, unused or none, as the model allows)
- the emitter (underfloor, radiator or none)
- each feature (`true`, `false` or `unused`)
- the exchanger fill (gradient or none)
- light or dark theme
The card SHALL re-render with the new configuration.

#### Scenario: Switch source
- **WHEN** the developer switches the source from air to ground
- **THEN** the air unit above connections 3/4 is replaced by a ground collector

#### Scenario: Switch emitter
- **WHEN** the developer switches the emitter from underfloor to radiator
- **THEN** the underfloor loop above connections 1/2 is replaced by a radiator, and the URL carries
  `emitter=radiator`

## MODIFIED Requirements

### Requirement: Card width and layout controls
The emulator SHALL let the developer set the card's width (at least 320, 360, 412, 600, 800 and 1000 px) and the
`layout` option (auto, horizontal or vertical), mirrored in the URL like the other controls. It SHALL also let the
developer show the card as in a panel view (URL `panel`), so the panel fit can be checked at the window's height.
The capture list SHALL include every scenario at a phone width (360 px) in the automatic layout, every scenario in
the vertical layout at 320 px, the horizontal layout at the vertical threshold, and the panel view at a desktop
window size (1280 x 800 px).

#### Scenario: Phone width
- **WHEN** a capture script opens the emulator URL with `width=360` and the heating scenario
- **THEN** the card renders 360 px wide in the vertical layout without manual input

#### Scenario: Panel view
- **WHEN** a capture script opens the emulator URL with `panel=1` and the heating scenario in a 1280 x 800 px window
- **THEN** the card renders as in a panel view, with its footer inside the window

### Requirement: Foreign naming
The emulator SHALL offer a naming control, `firmware` (default) or `foreign`, mirrored in the URL as `naming`. The
foreign naming SHALL be a mock source with other entity ids and Dutch friendly names, pressures in kPa, the
compressor speed in Hz, the compressor mode as an enum with Dutch values, the on/off state as a switch, and some
roles set to `none`, configured through `entities` and `states`. It SHALL leave the optional roles (card-config)
unbound, so the card shows their fallbacks, and SHALL bind `unit.cop`, so the register COP shows as the fallback of
`unit.system_cop`.

#### Scenario: Foreign heating
- **WHEN** a capture script opens the emulator URL with `naming=foreign` and the heating scenario
- **THEN** the card shows mode "Heating", the pressures in bar, the compressor speed in Hz, and no labels for the
  roles that are not present

#### Scenario: Foreign defrost
- **WHEN** the developer picks the defrost scenario with the foreign naming
- **THEN** the card shows mode "Defrost"

#### Scenario: Foreign fallbacks
- **WHEN** the developer picks the heating with HTR recovery scenario with the foreign naming
- **THEN** the footer shows the condensation capacity as "DG1", the register COP and no HTR item, and exchanger 9
  and pump 17 are drawn without flow

## ADDED Requirements

### Requirement: Browser text preflight
Before its tests, the browser test project SHALL measure a reference label text in each browser and SHALL fail at once,
with a message that names font smoothing and remote desktop sessions, when Chromium on Windows measures text with
whole-pixel advances where the reference needs fractional ones, instead of running the overlap tests on wrong text
widths. Chromium on Linux, which uses whole-pixel advances at scale factor 1 by design, and WebKit SHALL pass the
preflight.

#### Scenario: Font smoothing off
- **WHEN** the browser tests run in Chromium on Windows with system font smoothing off
- **THEN** the run fails before the overlap tests with a message naming font smoothing and remote desktop sessions

#### Scenario: Normal host
- **WHEN** the browser tests run in CI on Linux, or on Windows with font smoothing on
- **THEN** the preflight passes and the tests run

### Requirement: Screenshot review loop
`npm run capture` SHALL write one PNG per capture of the capture list. The docs SHALL hold the criteria a reviewer
checks every capture against: no label on a pipe, part or outline, values inside their bodies, no crossing outside
the cabinet, the band order emitter, source, tank, and text legible at the capture's width.

#### Scenario: Capture and criteria
- **WHEN** a developer runs `npm run capture` and opens the docs' review section
- **THEN** there is one PNG per capture-list entry under `build/captures/`, and the section lists the criteria above

### Requirement: Visual references on Linux
The browser tests SHALL compare a fixed set of emulator renders (both layouts, light and dark, every source, every DHW
storage, every emitter) with recorded reference images in Chromium on Linux, and SHALL skip that comparison on other
platforms. The repository's continuous checks SHALL run it. The references SHALL be recorded on Linux only.

#### Scenario: Skipped on Windows
- **WHEN** the browser tests run on Windows
- **THEN** the visual comparisons are skipped and reported as skipped, not as passed

#### Scenario: Changed drawing
- **WHEN** a change moves a part of the drawing and the references are not recorded again
- **THEN** the continuous checks fail on the visual comparison and name the render that differs
