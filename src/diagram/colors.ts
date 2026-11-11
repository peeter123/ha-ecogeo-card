// The temperature colour scale (design D3, temperature-coloring spec): absolute stops, interpolated with CSS
// `color-mix(in srgb, ...)` and clamped at the end stops. The interpolation is copied from hrv-ventilation
// src/diagram/streams.ts (`mixColor`: percentage rounded to one decimal, the end colours returned as they are at 0 and
// 100 %, the rest as a color-mix of the warm into the cold colour). Deviation: hrv mixes between two colours on a
// relative position; this card finds the two neighbouring stops of an absolute temperature first, and a missing
// temperature gives the muted colour instead of grey.
import type { CardConfig } from '../lib/config';
import { valueAt } from '../lib/config';
import { invalidOptions } from '../lib/options';
import { CONFIG_ERRORS } from '../strings';

export interface ColorStop {
  temperature: number;
  color: string;
}

/**
 * Blue at -10 °C, light blue at 10 °C, pale blue at 20 °C, amber at 30 °C, orange at 50 °C and red at 70 °C; no green
 * (design D3). The pale blue keeps the srgb mix between light blue and amber from turning grey-green.
 */
export const DEFAULT_STOPS: readonly ColorStop[] = [
  { temperature: -10, color: '#1e5aa8' },
  { temperature: 10, color: '#5fa8e0' },
  { temperature: 20, color: '#8ecae6' },
  { temperature: 30, color: '#e8a317' },
  { temperature: 50, color: '#f2711c' },
  { temperature: 70, color: '#d7263d' },
];

export const MIN_STOPS = 2;
export const MAX_STOPS = 8;

/** The colour of a pipe or tank without a temperature, or of an inactive circuit. */
export const MUTED_COLOR = 'var(--disabled-text-color)';

const isGroup = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/** A CSS colour as the copied option check accepts it (hex, name, colour function or var()). */
const isCssColor = (value: unknown): value is string =>
  typeof value === 'string' &&
  invalidOptions({ color: value }, [{ kind: 'color', path: 'color', default: '' }]).length === 0;

/** The stops of a valid `colors` list, as typed values. */
const toStops = (list: readonly unknown[]): ColorStop[] =>
  list.map((item) => ({
    temperature: (item as { temperature: number }).temperature,
    color: (item as { color: string }).color.trim(),
  }));

/**
 * The problems of the `colors` option: it must be an ascending list (strictly) of 2 to 8 stops, each
 * `{ temperature, color }` with a finite temperature and a CSS colour. Left out (undefined or null) is valid.
 */
export function colorsErrors(config: CardConfig): string[] {
  const value = valueAt(config, 'colors');
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length < MIN_STOPS || value.length > MAX_STOPS) return [CONFIG_ERRORS.colors];
  const stops: unknown[] = value;
  const valid = stops.every(
    (stop) =>
      isGroup(stop) &&
      typeof stop['temperature'] === 'number' &&
      Number.isFinite(stop['temperature']) &&
      isCssColor(stop['color']),
  );
  if (!valid) return [CONFIG_ERRORS.colors];
  const temperatures = toStops(stops).map((stop) => stop.temperature);
  return temperatures.every((temperature, index) => index === 0 || temperature > (temperatures[index - 1] ?? 0))
    ? []
    : [CONFIG_ERRORS.colors];
}

/** The stops of the config: its `colors` list, or the default. Call after configErrors found no problem. */
export function stopsOf(config: CardConfig): readonly ColorStop[] {
  const value = valueAt(config, 'colors');
  return Array.isArray(value) && colorsErrors(config).length === 0 ? toStops(value as unknown[]) : DEFAULT_STOPS;
}

/**
 * The colour of a temperature on the scale: the end colours outside it, a `color-mix` of the two neighbouring stops
 * between them (the warmer stop's share rounded to 0.1 %), and the muted colour without a temperature. The scale
 * does not depend on any other temperature.
 */
export function temperatureColor(temperature: number | undefined, stops: readonly ColorStop[] = DEFAULT_STOPS): string {
  const first = stops[0];
  const last = stops[stops.length - 1];
  if (temperature === undefined || !Number.isFinite(temperature) || first === undefined || last === undefined) {
    return MUTED_COLOR;
  }
  if (temperature <= first.temperature) return first.color;
  if (temperature >= last.temperature) return last.color;
  const upper = stops.findIndex((stop) => stop.temperature >= temperature);
  const from = stops[upper - 1];
  const to = stops[upper];
  if (from === undefined || to === undefined) return last.color;
  const percent = Math.round(((temperature - from.temperature) / (to.temperature - from.temperature)) * 1000) / 10;
  if (percent <= 0) return from.color;
  if (percent >= 100) return to.color;
  return `color-mix(in srgb, ${to.color} ${String(percent)}%, ${from.color})`;
}
