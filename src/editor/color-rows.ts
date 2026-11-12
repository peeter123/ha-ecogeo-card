// The colour stop rows of the editor (add-card-editor D4). `ha-form` has no list-of-objects selector, so the stops are
// shown as flat fields `colors_<i>_temperature` and `colors_<i>_color` (one row per stop plus an empty row) and
// folded back into `colors` when the form reports a change; the rows themselves are an editor-local draft in typed
// order (D4). No counterpart in hrv-ventilation.
import { DEFAULT_STOPS, type ColorStop } from '../diagram/colors';
import type { CardConfig } from '../lib/config';
import { valueAt } from '../lib/config';
import { UNITS } from '../strings';
import { colorField, hexToRgb, isRgb, rgbToHex, type Rgb } from './fields';
import type { EditorField } from './schema';

/** The colour of a stop whose temperature was typed before a colour was picked. */
export const NEW_STOP_COLOR = '#9e9e9e';

const ROW_NAME = /^colors_(\d+)_(temperature|color)$/;

/** The row index and part of a colour row field name, or undefined for any other name. */
export function colorRowOf(name: string): { index: number; part: 'temperature' | 'color' } | undefined {
  const match = ROW_NAME.exec(name);
  return match?.[1] === undefined ? undefined : { index: Number(match[1]), part: match[2] as 'temperature' | 'color' };
}

/** A row as shown: a stop with either part possibly missing (a malformed config). */
interface Row {
  temperature?: number;
  color?: string;
}

/** The rows of a config: its `colors` items (whatever they hold), or the default stops when it has none. */
function rowsOf(config: CardConfig): Row[] {
  const value = valueAt(config, 'colors');
  if (!Array.isArray(value)) return DEFAULT_STOPS.map((stop) => ({ ...stop }));
  return (value as unknown[]).map((item): Row => {
    const stop = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    const { temperature, color } = stop;
    return {
      ...(typeof temperature === 'number' ? { temperature } : {}),
      ...(typeof color === 'string' ? { color } : {}),
    };
  });
}

/** The neutral colour as the selector shows it, so the native colour input never shows black on an empty row. */
const NEUTRAL_RGB: Rgb = hexToRgb(NEW_STOP_COLOR) ?? [158, 158, 158];

/**
 * One row of the draft the editor keeps while the form is open. `ha-form` reports every keystroke, so the rows keep
 * the order they were typed in and stay in place (a row whose temperature is cleared stays visible with its colour);
 * only the list written to `colors` is sorted and filtered (D4). `orig` is the config's colour text for the row,
 * kept while the selector still shows the same colour or could not show it at all.
 */
export interface DraftRow {
  temperature?: number;
  color?: Rgb;
  orig?: string;
}

const emptyRow = (): DraftRow => ({ color: NEUTRAL_RGB });

/** Exactly one trailing row without a temperature: added after a filled last row, collapsed when there are two. */
export function withTrailingEmptyRow(rows: readonly DraftRow[]): DraftRow[] {
  const kept = [...rows];
  while (
    kept.length >= 2 &&
    kept[kept.length - 1]?.temperature === undefined &&
    kept[kept.length - 2]?.temperature === undefined
  ) {
    kept.pop();
  }
  return kept.at(-1)?.temperature === undefined && kept.length > 0 ? kept : [...kept, emptyRow()];
}

/** The draft of a config: one row per stop (the default stops when it has none) and the empty row. */
export function draftOf(config: CardConfig): DraftRow[] {
  return withTrailingEmptyRow(
    rowsOf(config).map(({ temperature, color }): DraftRow => {
      const rgb = color === undefined ? undefined : hexToRgb(color);
      return {
        ...(temperature === undefined ? {} : { temperature }),
        ...(rgb === undefined ? {} : { color: rgb }),
        ...(color === undefined ? {} : { orig: color }),
      };
    }),
  );
}

/** The fields of `count` rows. */
export function colorRowFields(count: number): EditorField[] {
  const indexes = Array.from({ length: count }, (_, index) => index);
  return indexes.flatMap((index): EditorField[] => [
    {
      name: `colors_${String(index)}_temperature`,
      selector: { number: { step: 'any', mode: 'box', unit_of_measurement: UNITS.celsius } },
    },
    colorField(`colors_${String(index)}_color`),
  ]);
}

/** The form values of the draft. A colour the selector cannot show (a name, `var()`) is left empty. */
export function colorRowData(draft: readonly DraftRow[]): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  draft.forEach(({ temperature, color }, index) => {
    if (temperature !== undefined) data[`colors_${String(index)}_temperature`] = temperature;
    if (color !== undefined) data[`colors_${String(index)}_color`] = [...color];
  });
  return data;
}

/** What `splitColorRows` finds: the row values by index, and the reported data without the row keys. */
export interface SplitRows {
  rows: Map<number, { temperature?: unknown; color?: unknown }>;
  rest: CardConfig;
}

/** Separates the row fields from the rest of what the form reported, so they never reach the config as keys. */
export function splitColorRows(reported: CardConfig): SplitRows {
  const rows: SplitRows['rows'] = new Map();
  const rest: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(reported)) {
    const row = colorRowOf(key);
    if (row === undefined) rest[key] = value;
    else rows.set(row.index, { ...rows.get(row.index), [row.part]: value });
  }
  return { rows, rest };
}

const sameRgb = (a: readonly number[], b: readonly number[]): boolean => a.every((channel, at) => channel === b[at]);

/** The temperature of a row: a finite number or a numeric text; anything else (empty, cleared) is no temperature. */
function temperatureOf(value: unknown): number | undefined {
  const number = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  return typeof number === 'number' && Number.isFinite(number) ? number : undefined;
}

/**
 * The colour a row stands for. What the config already had for that row is kept as written when the selector still
 * shows the same colour (`#FFF` stays `#FFF`) or could not show it at all (a colour name); otherwise the picked colour
 * as hex, or the neutral colour while none is picked.
 */
function colorOf(reported: unknown, before: string | undefined): string {
  const shown = before === undefined ? undefined : hexToRgb(before);
  if (!isRgb(reported)) return before !== undefined && shown === undefined ? before : NEW_STOP_COLOR;
  return before !== undefined && shown && sameRgb(shown, reported) ? before : rgbToHex(reported);
}

/** The draft after the form reported `rows`: every shown row is read back in place, then the trailing row is kept. */
export function updateDraft(draft: readonly DraftRow[], rows: SplitRows['rows']): DraftRow[] {
  const count = Math.max(draft.length, ...[...rows.keys()].map((index) => index + 1));
  return withTrailingEmptyRow(
    Array.from({ length: count }, (_, index): DraftRow => {
      const reported = rows.get(index);
      const temperature = temperatureOf(reported?.temperature);
      const color = reported !== undefined && isRgb(reported.color) ? reported.color : undefined;
      const orig = draft[index]?.orig;
      return {
        ...(temperature === undefined ? {} : { temperature }),
        ...(color === undefined ? {} : { color }),
        ...(orig === undefined ? {} : { orig }),
      };
    }),
  );
}

const sameStops = (a: readonly Row[], b: readonly Row[]): boolean =>
  a.length === b.length &&
  a.every((stop, at) => stop.temperature === b[at]?.temperature && stop.color === b[at]?.color);

const isDefault = (stops: readonly ColorStop[]): boolean =>
  stops.length === DEFAULT_STOPS.length &&
  stops.every((stop, at) => {
    const base = DEFAULT_STOPS[at];
    return stop.temperature === base?.temperature && stop.color.toLowerCase() === base.color;
  });

/**
 * The `colors` value to save from the draft: `'keep'` when it is what the config already has (nothing to write, so
 * a config round trips exactly; also a non-array `colors` while the rows are still the defaults), `undefined` when
 * it equals the default stops (the key is removed), otherwise the stops sorted by temperature. A row without a
 * temperature is dropped.
 */
export function foldDraft(draft: readonly DraftRow[], current: CardConfig): ColorStop[] | undefined | 'keep' {
  const stops = draft
    .flatMap(({ temperature, color, orig }): ColorStop[] =>
      temperature === undefined ? [] : [{ temperature, color: colorOf(color, orig) }],
    )
    .sort((a, b) => a.temperature - b.temperature);
  const colors = valueAt(current, 'colors');
  if (Array.isArray(colors) && sameStops(stops, rowsOf(current))) return 'keep';
  if (!isDefault(stops)) return stops;
  return colors !== undefined && !Array.isArray(colors) ? 'keep' : undefined;
}

/** A copy of the config with `colors` set (in place when it exists, else last) or, for `undefined`, removed. */
export function withColors(config: CardConfig, colors: ColorStop[] | undefined): CardConfig {
  if (colors === undefined) return Object.fromEntries(Object.entries(config).filter(([key]) => key !== 'colors'));
  return { ...config, colors };
}
