// Copied from hrv-ventilation src/editor/fields.ts. Deviations: only the builders this card needs (choice, entity,
// color, number); the sensor, stream, list, boolean and section builders of the HRV cards are dropped; `choiceField`
// takes the choices and the default from this card's option table (src/config/options.ts), with an optional default
// of its own (the DHW storage's default depends on the model); `entityField` takes the role's domain.
// `colorField` is Home Assistant's `color_rgb` selector (hrv has a text selector); it reports [r, g, b], so
// `hexToRgb` and `rgbToHex` convert to and from the hex text the config holds. `numberField` is kept unused.
// Editor fields built from the option table and the role table.
import type { ChoiceOption, NumberOption } from '../lib/options';
import type { EditorField } from './schema';

/** An entity picker filtered to the given domain (or domains); `advanced` hides it while the switch is off. */
export const entityField = (
  name: string,
  domain: string | readonly string[],
  { advanced = false } = {},
): EditorField => ({
  name,
  selector: { entity: { domain } },
  ...(advanced ? { advanced } : {}),
});

/** A number field from an option table entry, with its range, step and default. */
export const numberField = (
  name: string,
  option: Pick<NumberOption, 'min' | 'max' | 'default'>,
  step: number,
  unit?: string,
): EditorField => ({
  name,
  default: option.default,
  selector: {
    number: {
      min: option.min,
      max: option.max,
      step,
      mode: 'box',
      ...(unit === undefined ? {} : { unit_of_measurement: unit }),
    },
  },
});

/** A colour as [red, green, blue], each 0 to 255. */
export type Rgb = readonly [number, number, number];

/** The channels of a hex colour (`#rgb` or `#rrggbb`, any case); undefined for any other text (a name, `var()`). */
export function hexToRgb(color: string): Rgb | undefined {
  const digits = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim())?.[1];
  if (digits === undefined) return undefined;
  const full = digits.length === 3 ? digits.replace(/./g, '$&$&') : digits;
  const channel = (at: number): number => Number.parseInt(full.slice(at, at + 2), 16);
  return [channel(0), channel(2), channel(4)];
}

/** True for what the colour selector reports: three channels. */
export const isRgb = (value: unknown): value is Rgb =>
  Array.isArray(value) &&
  value.length === 3 &&
  value.every((channel) => typeof channel === 'number' && Number.isFinite(channel));

/** The hex text (`#rrggbb`, lower case) of three channels, each rounded and held to 0 to 255. */
export const rgbToHex = (rgb: Rgb): string =>
  '#' +
  rgb
    .map((channel) =>
      Math.min(255, Math.max(0, Math.round(channel)))
        .toString(16)
        .padStart(2, '0'),
    )
    .join('');

/** A colour field: Home Assistant's colour selector, whose value is [r, g, b] (the caller converts to and from hex). */
export const colorField = (name: string): EditorField => ({ name, selector: { color_rgb: {} } });

/** A drop-down for a choice option, with a label per choice; `fallback` replaces the option's default. */
export const choiceField = (
  name: string,
  option: ChoiceOption,
  labels: Readonly<Record<string, string>>,
  fallback: string = option.default,
): EditorField => ({
  name,
  default: fallback,
  selector: {
    select: { mode: 'dropdown', options: option.choices.map((value) => ({ value, label: labels[value] ?? value })) },
  },
});
