// Readings (add-schematic-card D1, D4, D8): the states of the resolved roles as typed values. A number is converted to the
// role's unit (°F to °C, kW to W, a difference back to K); an unavailable or unknown state, a non-numeric state and
// the firmware sentinel are no value (undefined). Text roles give the trimmed state, binary roles true for `on` and
// false for `off` (also `true`, `yes`, `1` and their opposites, from any domain). Pure.
import { isUnavailable, numericValue } from '../lib/availability';
import type { EntityStateLike } from '../lib/hass';
import { stateOf } from '../lib/hass';
import { convertedState } from '../lib/units';
import { isOnOffEntity, ROLES, type KindOf, type RoleOf, type RolePath, type RoleSpec } from '../config/roles';

type ValueOfKind<K> = K extends 'number' ? number : K extends 'text' ? string : boolean;

/**
 * The value of a role by its kind: a number, a text or an on/off state; undefined when it has no value. A role that
 * accepts an on/off entity (`onOff` in the role table) gives a boolean when it is bound to one (add-entity-discovery D3).
 */
export type Reading<P extends RolePath> =
  ValueOfKind<KindOf<P>> | (RoleOf<P> extends { onOff: true } ? boolean : never) | undefined;

/** Every role's value. */
export type Readings = { readonly [P in RolePath]: Reading<P> };

/**
 * A state as a number in the role's unit, or undefined. A pressure in a unit the card cannot convert, or without a
 * unit, is the entity's own number: the label then shows the entity's unit (display.ts, add-entity-discovery D6).
 */
function numberOf(state: EntityStateLike | undefined, role: RoleSpec): number | undefined {
  if (role.quantity === undefined) return numericValue(state);
  const converted = convertedState(state, role.quantity);
  return converted ?? (role.quantity === 'pressure' ? numericValue(state) : undefined);
}

/**
 * An on/off text as a boolean: `on`, `true`, `yes` and `1` are on, `off`, `false`, `no` and `0` are off, case-insensitive
 * after trimming (add-entity-discovery D3). Anything else, including an unavailable state, is undefined.
 */
export function onOffOf(state: EntityStateLike | undefined): boolean | undefined {
  switch (state?.state.trim().toLowerCase()) {
    case 'on':
    case 'true':
    case 'yes':
    case '1':
      return true;
    case 'off':
    case 'false':
    case 'no':
    case '0':
      return false;
    default:
      return undefined;
  }
}

/** A state as the role's value, by its kind. */
function valueOf(
  state: EntityStateLike | undefined,
  role: RoleSpec,
  entityId: string | undefined,
): number | string | boolean | undefined {
  // A role that accepts an on/off entity gives a boolean when bound to one; a sensor on a text role stays text.
  if (role.onOff === true && isOnOffEntity(entityId)) return onOffOf(state);
  switch (role.kind) {
    case 'number':
      return numberOf(state, role);
    case 'text':
      return state === undefined ||
        isUnavailable(state) ||
        ['unavailable', 'unknown'].includes(state.state.trim().toLowerCase())
        ? undefined
        : state.state.trim();
    case 'binary':
      return onOffOf(state);
  }
}

/**
 * The readings of every role: `entities` gives each role's entity id (undefined for a role without an entity),
 * `states` is `hass.states` (or the sample states).
 */
export function readRoles(
  states: Readonly<Record<string, EntityStateLike | undefined>>,
  entities: Readonly<Record<RolePath, string | undefined>>,
): Readings {
  return Object.fromEntries(
    ROLES.map((role) => [role.path, valueOf(stateOf(states, entities[role.path]), role, entities[role.path])]),
  ) as unknown as Readings;
}

/** The roles that animate by their speed: the two pumps (flow) and the fan. */
const SPEED_ROLES = ['production.pump', 'brine.pump', 'source.fan_speed'] as const;

/** The readings for the animation: the pump and fan speed roles may also be `true` (running without a percentage). */
export type AnimationReadings = {
  readonly [P in RolePath]: P extends (typeof SPEED_ROLES)[number] ? number | boolean | undefined : Reading<P>;
};

/**
 * The readings for the animation (add-entity-discovery D6): a pump or fan speed above 0 in a unit other than the
 * role's own (rpm instead of %) cannot set a dash or fan period, so it becomes `true` (running at the fixed medium
 * speed). Every other reading is unchanged. Pure.
 */
export function animationReadings(
  readings: Readings,
  entities: Readonly<Record<RolePath, string | undefined>>,
  states: Readonly<Record<string, EntityStateLike | undefined>>,
): AnimationReadings {
  const changed: Partial<Record<(typeof SPEED_ROLES)[number], true>> = {};
  for (const path of SPEED_ROLES) {
    const value: unknown = readings[path];
    const unit = stateOf(states, entities[path])?.attributes.unit_of_measurement?.trim();
    if (typeof value === 'number' && value > 0 && unit !== undefined && unit !== '' && unit !== '%') {
      changed[path] = true;
    }
  }
  return { ...readings, ...changed };
}
