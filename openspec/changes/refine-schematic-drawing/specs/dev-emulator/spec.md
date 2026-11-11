# Spec Delta

## MODIFIED Requirements

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
