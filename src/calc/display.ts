// How a reading is shown (add-schematic-card D6, live-values spec): the card formats every number itself, never through
// hass.formatEntityState, so the no-break space and the card's own units stay. The number goes through the copied
// `formatNumber` with Home Assistant's locale and no thousands separator ("2803 rpm"); the decimals are the entity's `display_precision` from the entity
// registry when it has one, else the role table's default; the role's own unit (K for a temperature difference, no unit
// for the COP) is joined by NBSP. Unit conversion (°F to °C, kW to W, a difference in °F back to K) and the sentinel are
// already done by readings.ts. Pure.
import { ROLE_BY_PATH, type RolePath, type RoleSpec } from '../config/roles';
import { formatNumber, type LocaleLike } from '../lib/format';
import { canConvert } from '../lib/units';
import { NBSP, ON_OFF_LABELS } from '../strings';

/** What formatting needs from `hass`: its locale and the entity registry (for the display precision). */
export interface DisplayContext {
  locale: LocaleLike | undefined;
  entities?: Readonly<Record<string, unknown>> | undefined;
  /** The states, for the entity's unit: a display precision only applies to a value in the role's own unit. */
  states?:
    Readonly<Record<string, { state?: string; attributes: Readonly<Record<string, unknown>> } | undefined>> | undefined;
}

/** The `display_precision` of an entity registry entry: a whole number from 0 to 20, or undefined. */
export function displayPrecision(entry: unknown): number | undefined {
  if (typeof entry !== 'object' || entry === null) return undefined;
  const precision = (entry as { display_precision?: unknown }).display_precision;
  return typeof precision === 'number' && Number.isInteger(precision) && precision >= 0 && precision <= 20
    ? precision
    : undefined;
}

/** The pump speeds show whole percentages whatever their entity's display precision (live-values "Locale and precision", design D14). */
const WHOLE_PERCENT_ROLES: ReadonlySet<RolePath> = new Set<RolePath>(['production.pump', 'brine.pump']);

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

/** The digits after the decimal point of a state text ("45.6" is 1, "2400" is 0), at most 20. */
export function decimalsInState(state: string | undefined): number {
  if (/e/i.test(state ?? '')) return 0;
  const match = /^\s*[-+]?\d*\.(\d+)/.exec(state ?? '');
  return Math.min(20, match?.[1]?.length ?? 0);
}

/** The entity's unit as Home Assistant reports it, trimmed; undefined when it has none. */
function entityUnitOf(entityId: string | undefined, context: DisplayContext): string | undefined {
  const unit = entityId === undefined ? undefined : context.states?.[entityId]?.attributes['unit_of_measurement'];
  return typeof unit === 'string' && unit.trim() !== '' ? unit.trim() : undefined;
}

/**
 * A reading as text. A number is the locale's number with the role's unit after a no-break space (the COP has no
 * unit); when the entity reports a unit the card cannot convert to the role's (Hz on the compressor speed, rpm on a
 * pump), it is the entity's number with the entity's own unit (add-entity-discovery D6). An on/off reading is "On" or
 * "Off". Undefined without a value. `entityId` is the entity the role resolved to, for its unit and display precision.
 */
export function formatReading(
  path: RolePath,
  value: number | boolean | undefined,
  entityId: string | undefined,
  context: DisplayContext,
): string | undefined {
  if (typeof value === 'boolean') return ON_OFF_LABELS[value ? 'on' : 'off'];
  const role = ROLE_BY_PATH.get(path);
  if (role === undefined || value === undefined || !Number.isFinite(value)) return undefined;
  const entityUnit = entityUnitOf(entityId, context);
  const own = sameUnit(role, entityUnit);
  const converts = role.quantity !== undefined && canConvert(role.quantity, entityUnit);
  // The entity's own unit is shown when it is neither the role's unit nor convertible to it; the role's unit and the entity's then fit the number.
  const passThrough = role.unit !== undefined && entityUnit !== undefined && !own && !converts;
  const precision =
    entityId === undefined || !(own || passThrough) ? undefined : displayPrecision(context.entities?.[entityId]);
  // A passed-through number keeps the decimals its state reports when the entity has no display precision.
  const decimals =
    WHOLE_PERCENT_ROLES.has(path) && !passThrough
      ? 0
      : passThrough && precision === undefined
        ? decimalsInState(entityId === undefined ? undefined : context.states?.[entityId]?.state)
        : decimalsOf(role, precision);
  const number = formatNumber(value, context.locale, decimals, false);
  const unit = passThrough ? entityUnit : role.unit;
  return unit === undefined ? number : `${number}${NBSP}${unit}`;
}
