// Copied from hrv-ventilation src/editor/fields.ts. Deviations: only the builders this card needs (choice, entity,
// color, number); the sensor, stream, list, boolean and section builders of the HRV cards are dropped; `choiceField`
// takes the choices and the default from this card's option table (src/config/options.ts), with an optional default
// of its own (the DHW storage's default depends on the model); `entityField` takes the role's domain.
// `colorField` is hrv's text-selector version; task 2.2 replaces it with the colour selector (hex conversion).
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

/** A colour field with the option's default. */
export const colorField = (name: string, fallback: string): EditorField => ({
  name,
  default: fallback,
  selector: { text: {} },
});

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
