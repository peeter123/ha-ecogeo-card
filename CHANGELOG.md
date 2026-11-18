# Changelog

All notable changes to the ecoGEO heat pump card, newest first, in the style of Keep a Changelog. A release's heading
is `## <version> - <YYYY-MM-DD>`; the heading has no date until the release is made, and the release adds it.

## 1.0.0 - 2026-11-18

The first release. A Lovelace card for Ecoforest ecoGEO heat pumps that draws the unit's internal schematic as inline
SVG, with live values and pipes coloured by temperature. It is read-only: it calls no service and writes no entity.

### Added

- The schematic for models B and C and the four variants of the manual's figures B1 to B4, with the cooling parts of
  each variant, at two levels of detail (simplified, the default, and full with the manual's item numbers).
- The outer-loop source (air, ground or a hybrid of both on one brine loop) and the DHW storage (an external tank, the
  integrated tank of model C, a tank not in use, or none on model B).
- Pipes coloured by temperature on an absolute scale (the stops are configurable), with the plate exchangers filled
  from the colour of the pipe that enters to the one that leaves, and dashes that run in the direction of the flow at a
  speed that follows the pump or the compressor. The refrigerant reverses in active cooling, idle circuits are muted
  and `prefers-reduced-motion` stops the animation.
- Live values beside their components, formatted with Home Assistant's locale with every number joined to its unit
  by a no-break space, and the more-info dialog of an entity on a tap.
- The compact layout for phones and narrow cards, chosen from the card's own width with hysteresis, and a panel view
  that fits the drawing to the screen.
- The visual editor, with entity suggestions from a device and a check of every binding.
- Entities from any source: `states` sets the texts that mean off and defrost, temperatures, power and pressures in
  other units are converted, and a unit the card cannot convert is shown as the entity reports it.
- HTR recovery from `htr_active` in heating and active cooling, and a footer with the mode, season, outside
  temperature, COP (EER while cooling) and the power items of the mode (DG1 and HTR while heating, DHW while
  producing DHW, Cooling and HTR in active cooling).
- Installation with HACS as a custom repository of category Dashboard, the loaded version in the browser console and
  a help link from the card editor to the README.
