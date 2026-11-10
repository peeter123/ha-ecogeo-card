// Copied from hrv-ventilation src/lib/availability.ts, plus the -999 sentinel (design D8).
// When an entity has "no value": the rule the card applies before it shows or computes a figure.

/** The part of a Home Assistant state object these functions read. */
export interface StateLike {
  state: string;
}

// Only `unknown` and `unavailable`. Text states such as "n/a" are real values.
const UNAVAILABLE_STATES: ReadonlySet<string> = new Set(['unknown', 'unavailable']);
// The firmware reports -999.9 for a sensor that has no reading (an unconnected probe): any value at or below -999
// is no value.
const SENTINEL = -999;
// Plain decimal numbers as HA reports them ("21.4", "-3", "1e-3"), without padding. Number() alone would also
// accept "", " ", "0x10" and "Infinity".
const DECIMAL = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * A raw state string as a number, or undefined when it is not a plain finite decimal number. "-0" gives 0. The sentinel is
 * parsed like any number; isUnavailable and numericValue apply it.
 */
export function parseNumericState(text: string): number | undefined {
  if (!DECIMAL.test(text)) return undefined;
  const value = Number(text);
  return Number.isFinite(value) ? value + 0 : undefined;
}

/**
 * True when the entity is missing from Home Assistant, its state is `unknown` or `unavailable`, or its state is the
 * sensor sentinel (a number at or below -999).
 */
export function isUnavailable(stateObj: StateLike | undefined): boolean {
  if (stateObj === undefined || UNAVAILABLE_STATES.has(stateObj.state)) return true;
  const value = parseNumericState(stateObj.state);
  return value !== undefined && value <= SENTINEL;
}

/**
 * The state as a number, or undefined when the entity is missing, unknown, unavailable, the sensor sentinel (at or
 * below -999) or not numeric.
 */
export function numericValue(stateObj: StateLike | undefined): number | undefined {
  if (stateObj === undefined || isUnavailable(stateObj)) return undefined;
  return parseNumericState(stateObj.state);
}
