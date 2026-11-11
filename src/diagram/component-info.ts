// What the card tells about a drawn component itself (component-info spec, refine-schematic-drawing D2): its name as a tooltip and
// accessible name (strings.ts `componentLabel`), and, for a component that has an entity of its own, the more-info
// dialog of that entity on a tap (click, Enter or Space). The tap goes through the same callback as the value labels
// (`fireMoreInfo` in the card); the card calls no service.
import { css, nothing } from 'lit';
import type { RolePath } from '../config/roles';

/**
 * The role whose entity a component opens: the one its value label shows. Filled from the role table's `item` field
 * where one role belongs to the item, chosen by hand where several do (11, 12, 8, 7). A component that is not in this
 * table has no entity of its own and is neither tappable nor focusable: 1-6 and 47-49 (connections), 9, 10, 13, 14,
 * 17, 22, 25, 27, 28, 44, 45, coil 51 and the service and safety parts that only `detail: full` draws.
 */
export const COMPONENT_ROLES: Readonly<Record<number, RolePath>> = {
  7: 'refrigerant.evaporation_temperature',
  8: 'refrigerant.condensation_temperature',
  11: 'compressor.speed',
  12: 'refrigerant.expansion_valve',
  15: 'production.pump',
  16: 'brine.pump',
  26: 'dhw.demand',
  29: 'compressor.suction_temperature',
  30: 'compressor.discharge_temperature',
  31: 'brine.outlet_temperature',
  32: 'brine.inlet_temperature',
  33: 'production.outlet_temperature',
  34: 'production.return_temperature',
  35: 'compressor.suction_pressure',
  36: 'compressor.discharge_pressure',
  37: 'brine.pressure',
  38: 'production.pressure',
  50: 'dhw.temperature',
  54: 'dhw.temperature',
};

/** The role of the air unit's fan. */
export const FAN_ROLE: RolePath = 'source.fan_speed';
/** The role of the external DHW tank. */
export const EXTERNAL_TANK_ROLE: RolePath = 'dhw.temperature';

/** The roles' entity ids and what a tap does; `onTap` is undefined where taps do nothing (sample mode). */
export interface Taps {
  entities: Readonly<Record<RolePath, string | undefined>>;
  onTap: ((entityId: string) => void) | undefined;
}

/** The entity a tap on the role opens, or undefined: no tap handler (sample mode), or the role has no entity. */
export const tapTarget = (role: RolePath | undefined, taps: Taps | undefined): string | undefined =>
  role === undefined || taps?.onTap === undefined ? undefined : taps.entities[role];

/** The attribute and event bindings that make an SVG group a button; all `nothing` when there is no entity to open. */
export interface TapBindings {
  role: 'button' | typeof nothing;
  tabindex: '0' | typeof nothing;
  click: ((event: Event) => void) | typeof nothing;
  keydown: ((event: KeyboardEvent) => void) | typeof nothing;
}

export function tapBindings(
  entityId: string | undefined,
  onTap: ((entityId: string) => void) | undefined,
): TapBindings {
  if (entityId === undefined || onTap === undefined) {
    return { role: nothing, tabindex: nothing, click: nothing, keydown: nothing };
  }
  return {
    role: 'button',
    tabindex: '0',
    click: () => {
      onTap(entityId);
    },
    keydown: (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onTap(entityId);
    },
  };
}

/** The focus ring of a tappable part (a symbol, the external tank, the fan): shared by the three stylesheets. */
export const focusRingStyles = css`
  outline: 2px solid var(--primary-color, currentColor);
  outline-offset: 2px;
  filter: drop-shadow(0 0 2px var(--primary-color, currentColor));
`;
