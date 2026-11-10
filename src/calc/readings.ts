// Readings (design D1, D4, D8): the states of the resolved roles as typed values. A number is converted to the
// role's unit (°F to °C, kW to W, a difference back to K); an unavailable or unknown state, a non-numeric state and
// the firmware sentinel are no value (undefined). Text roles give the trimmed state, binary roles true for `on` and
// false for `off`. Pure.
import { isUnavailable, numericValue } from '../lib/availability';
import type { EntityStateLike } from '../lib/hass';
import { stateOf } from '../lib/hass';
import { convertedState } from '../lib/units';
import { ROLES, type KindOf, type RolePath, type RoleSpec } from '../config/roles';

type ValueOfKind<K> = K extends 'number' ? number : K extends 'text' ? string : boolean;

/** The value of a role by its kind: a number, a text or an on/off state; undefined when it has no value. */
export type Reading<P extends RolePath> = ValueOfKind<KindOf<P>> | undefined;

/** Every role's value. */
export type Readings = { readonly [P in RolePath]: Reading<P> };

/** A state as a number in the role's unit, or undefined. */
function numberOf(state: EntityStateLike | undefined, role: RoleSpec): number | undefined {
  return role.quantity === undefined ? numericValue(state) : convertedState(state, role.quantity);
}

/** A state as the role's value, by its kind. */
function valueOf(state: EntityStateLike | undefined, role: RoleSpec): number | string | boolean | undefined {
  switch (role.kind) {
    case 'number':
      return numberOf(state, role);
    case 'text':
      return state === undefined ||
        isUnavailable(state) ||
        ['unavailable', 'unknown'].includes(state.state.trim().toLowerCase())
        ? undefined
        : state.state.trim();
    case 'binary': {
      const text = state?.state.trim().toLowerCase();
      return text === 'on' ? true : text === 'off' ? false : undefined;
    }
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
    ROLES.map((role) => [role.path, valueOf(stateOf(states, entities[role.path]), role)]),
  ) as unknown as Readings;
}
