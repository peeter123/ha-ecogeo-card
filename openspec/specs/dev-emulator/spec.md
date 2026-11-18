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
- heating with HTR recovery
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

#### Scenario: Heating with HTR scenario
- **WHEN** the developer picks the heating with HTR recovery scenario
- **THEN** the card shows mode "Heating", valve 26 towards connections 1/2, an active DG1 production circuit, an
  active HTR circuit and DHW loop, and a footer with a DG1 and an HTR power

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
- the DHW storage (external, internal, unused or none, as the model allows)
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
`layout` option (auto, full or compact), mirrored in the URL like the other controls. It SHALL also let the
developer show the card as in a panel view (URL `panel`), so the panel fit can be checked at the window's height.
The capture list SHALL include every scenario at a phone width (360 px) in the automatic layout, the full layout at
each detail level's compact threshold, and the panel view at a desktop window size (1280 x 800 px).

#### Scenario: Phone width
- **WHEN** a capture script opens the emulator URL with `width=360` and the heating scenario
- **THEN** the card renders 360 px wide in the compact layout without manual input

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
- **WHEN** the developer picks the heating with HTR recovery scenario with the foreign naming, in the full layout
- **THEN** the footer shows the condensation capacity as "DG1", the register COP and no HTR item, and exchanger 9
  and pump 17 are drawn without flow

### Requirement: Foreign naming in the capture list
The capture list SHALL include the foreign naming in the heating, heating with HTR recovery, DHW, defrost and off
scenarios, and in the heating scenario at a phone width (360 px).

#### Scenario: Captures
- **WHEN** a capture script runs the capture list
- **THEN** it captures the five foreign scenarios and the foreign heating scenario at 360 px
