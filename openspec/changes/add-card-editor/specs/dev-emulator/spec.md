# Spec Delta

## MODIFIED Requirements

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

