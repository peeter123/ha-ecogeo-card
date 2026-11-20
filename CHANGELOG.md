# Changelog

All notable changes to the ecoGEO heat pump card, newest first, in the style of Keep a Changelog. A release's heading
is `## <version> - <YYYY-MM-DD>`; the heading has no date until the release is made, and the release adds it.

## 1.0.0

The first release. A Lovelace card for Ecoforest ecoGEO heat pumps that draws the unit's internal schematic as inline
SVG, with live values and pipes coloured by temperature. It is read-only: it calls no service and writes no entity.

### Added

- The schematic for models B and C and the four variants of the manual's figures B1 to B4, with the cooling parts of
  each variant, in one drawing level: the parts that matter, without item numbers, vessels, safety and drain valves,
  mini-pressure switches, service outlets or the manual trap.
- Two layouts. The horizontal layout is the landscape drawing for wide cards. The vertical layout is a portrait
  drawing for phones and narrow sections, with the hydraulic values beside vertical pipes rotated to read along their
  pipe. The `layout` option is `auto` (the default: vertical below 560 px, horizontal above, chosen from the card's
  own width with hysteresis), `horizontal` or `vertical`. A panel view fits the drawing to the screen.
- A band above the cabinet with the heat emitter, the outer-loop source and the external DHW tank, each above its own
  connections and joined to them by short pipes. The emitter, the source and the tank share one body height.
- The `emitter` option (`underfloor`, the default, `radiator` or `none`): a small underfloor loop or radiator on the
  DG1 connections, coloured and animated with the DG1 circuit and carrying the DG1 demand.
- The outer-loop source (air, ground or a hybrid of both on one brine loop) and the DHW storage (an external tank, the
  integrated tank of model C, a tank not in use, or none on model B). The air unit and the external tank carry their
  values inside their bodies, the ground loop is a flat collector in a ground strip, and the hybrid places the air
  unit and the collector side by side.
- A cabinet laid out in rows and columns with free lanes between the parts for the values, with the compressor and
  the passive cooling and defrosting exchanger on its centre line. The same 18 values are shown in both layouts, and
  none lies on a pipe or below 10 px: production and brine out, in and pressure, compressor speed, DHW temperature,
  the source's Out, expansion valve opening, discharge and suction temperature and pressure, the speeds of both pumps
  (whole percentages) and the DG1 and DHW demand.
- Pipes coloured by temperature on an absolute scale (the stops are configurable), with the plate exchangers filled
  from the colour of the pipe that enters to the one that leaves, and dashes that run in the direction of the flow at a
  speed that follows the pump or the compressor. The refrigerant reverses in active cooling, idle circuits are muted
  and `prefers-reduced-motion` stops the animation.
- Values formatted with Home Assistant's locale with every number joined to its unit by a no-break space, and the
  more-info dialog of an entity on a tap.
- One footer in both layouts: the mode, the outside temperature, the COP (EER while cooling), the power items of the
  mode (DG1 and HTR while heating, DHW while producing DHW, Cooling and HTR in active cooling) and the alarm and
  offline indications.
- The visual editor, with entity suggestions from a device and a check of every binding.
- Entities from any source: `states` sets the texts that mean off and defrost, temperatures, power and pressures in
  other units are converted, and a unit the card cannot convert is shown as the entity reports it.
- HTR recovery from `htr_active` in heating and active cooling.
- Installation with HACS as a custom repository of category Dashboard, the loaded version in the browser console and
  a help link from the card editor to the README.

### Removed

- The `detail` option and the full level with its item numbers; the card always draws the one level.
- The `full` and `compact` values of `layout`; use `horizontal`, `vertical` or `auto`.
- The labels for the compressor percentage and power, condensation and evaporation temperature, superheat, fan speed,
  the outside temperature (it stays in the footer), the air unit's and ground loop's In, and the DG1 setpoint, tank
  setpoint and start delta-T. Their roles stay configurable.
- The on/off state and the season in the footer.
