# Spec Delta

## MODIFIED Requirements

### Requirement: Locale and precision
Numbers SHALL use Home Assistant's locale and number format setting. The decimals SHALL come from the entity's
display precision when Home Assistant has one and the entity's unit is the card's unit for the role, and from the
card's default for the role otherwise.

#### Scenario: Locale
- **WHEN** Home Assistant's number format uses a decimal comma
- **THEN** the production outlet reads "25,2 °C"

#### Scenario: Display precision
- **WHEN** the production outlet entity has a display precision of 0 and reads 25.2 °C
- **THEN** the label reads "25 °C"

#### Scenario: Passed-through decimals
- **WHEN** the compressor speed entity reports 45.6 Hz without a display precision
- **THEN** the label reads "45.6 Hz"

#### Scenario: Pump precision ignored
- **WHEN** the pump 15 entity has a display precision of 1 and reads 99.9 %
- **THEN** the label at pump 15 reads "100 %"

## ADDED Requirements

### Requirement: Decimals of converted values
The decimals of a converted value, such as kW shown in W, SHALL come from the card's default for the role.

#### Scenario: Converted power
- **WHEN** a power entity reports 1.234 kW with a display precision of 2 and the card shows the role in W
- **THEN** the label uses the role's default number of decimals, not the entity's display precision

### Requirement: Temperature difference in degrees Celsius
A temperature difference reported in °C SHALL count as the card's unit K, since the number is unchanged.

#### Scenario: Difference in °C
- **WHEN** a temperature difference entity reports 5.2 °C
- **THEN** the label shows 5.2 K and takes its decimals as for the unit K

### Requirement: Decimals of values in the entity's own unit
A value shown with the entity's own unit (see "The card's own units") SHALL take its decimals from the entity's
display precision, or else keep the decimals of its state.

#### Scenario: Own unit with display precision
- **WHEN** the compressor speed entity reports 45.6 Hz with a display precision of 0
- **THEN** the label reads "46 Hz"

### Requirement: Pump speed precision
The speeds of pumps 15 and 16 in % SHALL show whole percentages (0 decimals), whatever the entity's display precision
(decided by the user 2026-11-20).

#### Scenario: Brine pump precision ignored
- **WHEN** the pump 16 entity has a display precision of 1 and reads 49.6 %
- **THEN** the label at pump 16 reads "50 %"
