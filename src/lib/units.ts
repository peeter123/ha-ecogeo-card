// Copied from hrv-ventilation src/lib/units.ts: temperature and power only (the flow and humidity conversions are
// dropped), plus the difference rule of design D8.
// Converts a numeric state into the unit the card uses, based on the entity's unit_of_measurement.
// Units the card does not know count as no value (undefined), so a figure is never computed from a wrong unit.
import { numericValue } from './availability';
import type { EntityStateLike } from './hass';

/** The kinds of input the card takes, each with the one unit it calculates in. */
export type Quantity =
  | 'temperature' // °C
  | 'difference' // K, a temperature difference (superheat, start delta-T)
  | 'power'; // W

/** card value = (value + offset) * scale */
interface Conversion {
  scale: number;
  offset?: number;
}

const SAME: Conversion = { scale: 1 };
const FAHRENHEIT: Conversion = { scale: 5 / 9, offset: -32 };
const KILOWATTS: Conversion = { scale: 1000 };

// One key per unit, in the normalised form below. Maps, so a unit like "constructor" is not found on a prototype.
// A difference: Home Assistant converts a difference sensor's value as if it were an absolute temperature, so a
// state in °F went through x * 9/5 + 32. The same absolute formula converts it back, which gives the value in K
// (a difference of 1 K is 1 °C). A state in °C or K is already the difference.
const CONVERSIONS: Record<Quantity, ReadonlyMap<string, Conversion>> = {
  temperature: new Map([
    ['°c', SAME],
    ['°f', FAHRENHEIT],
  ]),
  difference: new Map([
    ['k', SAME],
    ['°c', SAME],
    ['°f', FAHRENHEIT],
  ]),
  power: new Map([
    ['w', SAME],
    ['kw', KILOWATTS],
  ]),
};

/**
 * The unit as a lookup key: trimmed, NFKC-normalised (folds "℃" to "°C"), the ordinal indicator "º" read as a
 * degree sign, lower case. So the spellings template and MQTT sensors use find the same unit.
 */
function unitKey(unit: string): string {
  return unit.trim().replaceAll('º', '°').normalize('NFKC').toLowerCase(); // º before NFKC, which makes it "o"
}

/**
 * A state object's value in the card unit of `quantity`, or undefined while it has no value or its unit is not
 * supported.
 */
export function convertedState(state: EntityStateLike | undefined, quantity: Quantity): number | undefined {
  const value = numericValue(state);
  return value === undefined ? undefined : toCalcUnit(quantity, value, state?.attributes.unit_of_measurement);
}

/**
 * Converts `value` in `unit` to the card unit of `quantity`; undefined when the unit is not supported or the
 * value is not a finite number.
 */
export function toCalcUnit(quantity: Quantity, value: number, unit: string | undefined): number | undefined {
  if (!Number.isFinite(value) || unit === undefined) return undefined;
  const conversion = CONVERSIONS[quantity].get(unitKey(unit));
  return conversion ? (value + (conversion.offset ?? 0)) * conversion.scale : undefined;
}
