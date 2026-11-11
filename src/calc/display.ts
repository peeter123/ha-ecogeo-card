// How a reading is shown (design D6, live-values spec): the card formats every number itself, never through
// hass.formatEntityState, so the no-break space and the card's own units stay. The number goes through the copied
// `formatNumber` with Home Assistant's locale and no thousands separator ("2803 rpm"); the decimals are the entity's `display_precision` from the entity
// registry when it has one, else the role table's default; the role's own unit (K for a temperature difference, no unit
// for the COP) is joined by NBSP. Unit conversion (°F to °C, kW to W, a difference in °F back to K) and the sentinel are
// already done by readings.ts. Pure.
import { ROLE_BY_PATH, type RolePath, type RoleSpec } from '../config/roles';
import { formatNumber, type LocaleLike } from '../lib/format';
import { NBSP } from '../strings';

/** What formatting needs from `hass`: its locale and the entity registry (for the display precision). */
export interface DisplayContext {
  locale: LocaleLike | undefined;
  entities?: Readonly<Record<string, unknown>> | undefined;
  /** The states, for the entity's unit: a display precision only applies to a value in the role's own unit. */
  states?: Readonly<Record<string, { attributes: Readonly<Record<string, unknown>> } | undefined>> | undefined;
}

/** The `display_precision` of an entity registry entry: a whole number from 0 to 20, or undefined. */
export function displayPrecision(entry: unknown): number | undefined {
  if (typeof entry !== 'object' || entry === null) return undefined;
  const precision = (entry as { display_precision?: unknown }).display_precision;
  return typeof precision === 'number' && Number.isInteger(precision) && precision >= 0 && precision <= 20
    ? precision
    : undefined;
}

/** The decimals of a role: the entity's display precision when it has one, else the role table's default. */
export const decimalsOf = (role: RoleSpec, precision: number | undefined): number => precision ?? role.decimals ?? 0;

/**
 * True when the entity reports the role's own display unit (case and spelling aside), so its display precision fits
 * the shown number. A converted value (kW shown as W, °F as °C, a difference in °F as K) does not, and neither does a
 * role without a unit when the entity has one. A difference in °C is the same number as in K, so it matches. An entity without a unit counts as matching a role without one.
 */
function sameUnit(role: RoleSpec, entityUnit: unknown): boolean {
  const own =
    typeof entityUnit === 'string' ? entityUnit.trim().replaceAll('º', '°').normalize('NFKC').toLowerCase() : '';
  const expected = (role.unit ?? '').toLowerCase();
  // a temperature difference in °C is the same number as in K, so its precision fits
  return own === expected || (role.quantity === 'difference' && own === '°c');
}

/**
 * A number reading as text: the locale's number with the role's unit after a no-break space (the COP has no unit).
 * Undefined without a value. `entityId` is the entity the role resolved to, for its display precision.
 */
export function formatReading(
  path: RolePath,
  value: number | undefined,
  entityId: string | undefined,
  context: DisplayContext,
): string | undefined {
  const role = ROLE_BY_PATH.get(path);
  if (role === undefined || value === undefined || !Number.isFinite(value)) return undefined;
  const precision =
    entityId === undefined || !sameUnit(role, context.states?.[entityId]?.attributes['unit_of_measurement'])
      ? undefined
      : displayPrecision(context.entities?.[entityId]);
  const number = formatNumber(value, context.locale, decimalsOf(role, precision), false);
  return role.unit === undefined ? number : `${number}${NBSP}${role.unit}`;
}
