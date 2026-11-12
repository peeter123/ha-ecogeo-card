# dev-emulator Specification

## Purpose

A local preview of the card that runs without Home Assistant: a mock `hass` with heat pump scenarios and controls,
for developing the drawing and for agent-inspected screenshots.

## Requirements

### Requirement: Local preview server
`npm run dev` SHALL start a local page that renders the card with a mock `hass`. The page SHALL need no Home
Assistant instance, no network access to it, and no installation-specific data.

#### Scenario: Start
- **WHEN** a developer runs `npm run dev`
- **THEN** a browser page shows the card in heating mode with plausible values

### Requirement: Scenario presets
The emulator SHALL offer these scenarios, each a complete set of states:
- off
- standby
- heating
- DHW
- active cooling (all heat to the outer loop)
- active cooling with HTR recovery
- passive cooling
- defrost
- alarm while heating
- bridge offline
- sensors unavailable
Choosing a scenario SHALL update the card at once.

#### Scenario: DHW scenario
- **WHEN** the developer picks the DHW scenario
- **THEN** the card shows mode "DHW", valve 26 towards connections 5/6, and an active DHW loop

#### Scenario: HTR scenario
- **WHEN** the developer picks the active cooling with HTR recovery scenario
- **THEN** the card shows mode "Active cooling", valve 14 reversed, valve 26 towards connections 1/2, and an
  active HTR circuit and DHW loop

#### Scenario: Defrost scenario
- **WHEN** the developer picks the defrost scenario
- **THEN** the card shows mode "Defrost", valves 27/28 towards exchanger 10, a muted refrigerant circuit and an
  active outer loop

#### Scenario: Unavailable scenario
- **WHEN** the developer picks the unavailable scenario
- **THEN** the card shows muted dashes for the unavailable values and no error

#### Scenario: Offline scenario
- **WHEN** the developer picks the bridge offline scenario
- **THEN** the card shows the offline indication and mode "Standby"

### Requirement: Configuration controls
The emulator SHALL let the developer switch:
- the model (B or C)
- the variant (1-4)
- the source (air, ground or hybrid)
- the DHW storage (external, internal or none)
- each feature (`true`, `false` or `unused`)
- the detail level (simplified or full)
- the exchanger fill (gradient or none)
- light or dark theme
The card SHALL re-render with the new configuration.

#### Scenario: Switch source
- **WHEN** the developer switches the source from air to ground
- **THEN** the air unit left of the cabinet is replaced by a ground loop

#### Scenario: Switch detail
- **WHEN** the developer switches the detail level from simplified to full
- **THEN** the item numbers and the safety and service parts appear, and the URL carries `detail=full`

### Requirement: Live value sliders
The emulator SHALL offer sliders for the main temperatures, pump and compressor speeds, the fan speed and the
condensation capacity. Moving a slider SHALL update the card's colours, labels and animation speed live.

#### Scenario: Warmer production
- **WHEN** the developer moves the production outlet slider from 25 °C to 55 °C
- **THEN** the supply segment shifts from between pale blue and amber towards between orange and red, and its
  label shows the new value

### Requirement: Screenshot cycle
The emulator SHALL have a cycle mode that steps through every scenario and configuration combination needed for
verification. Each step SHALL be addressable by URL, so that a script or an agent can capture it.

#### Scenario: Addressable step
- **WHEN** a capture script opens the emulator URL for scenario `passive_cooling` with `source=ground`
- **THEN** the page renders exactly that combination without manual input

### Requirement: Card width and layout controls
The emulator SHALL let the developer set the card's width (at least 320, 360, 412, 600, 800 and 1000 px) and the
`layout` option (auto, full or compact), mirrored in the URL like the other controls. The capture list SHALL
include every scenario at a phone width (360 px) in the automatic layout, and the full layout at the compact
threshold.

#### Scenario: Phone width
- **WHEN** a capture script opens the emulator URL with `width=360` and the heating scenario
- **THEN** the card renders 360 px wide in the compact layout without manual input
