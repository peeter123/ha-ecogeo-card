// The colour stop rows (add-card-editor D4, task 2.2): the rows shown, folded back into `colors`, and the hex conversion.
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { DEFAULT_STOPS } from '../../src/diagram/colors';
import { NEW_STOP_COLOR } from '../../src/editor/color-rows';
import { hexToRgb, isRgb, rgbToHex } from '../../src/editor/fields';
import { fieldsWithPaths } from '../../src/editor/schema';
import type { CardConfig } from '../../src/lib/config';
import { CONFIG_ERRORS, EDITOR } from '../../src/strings';
import { cleared, openEditor, StubForm, type Opened } from './harness';

beforeAll(async () => {
  customElements.define('ha-form', StubForm);
  await import('../../src/editor/ecogeo-card-editor');
});

afterEach(() => {
  document.body.innerHTML = '';
});

const BASE = { type: 'custom:ecogeo-card' };
const CUSTOM = [
  { temperature: 0, color: '#1565c0' },
  { temperature: 60, color: '#c62828' },
];
const rowNames = (form: StubForm): string[] =>
  fieldsWithPaths(form.schema)
    .map(({ path }) => path)
    .filter((path) => path.startsWith('colors_'));
const hasColorKeys = (config: CardConfig): boolean => Object.keys(config).some((key) => key.startsWith('colors_'));
const errorOf = (editor: Opened['editor']): string | undefined =>
  editor.shadowRoot?.querySelector('.error')?.textContent ?? undefined;

/** The form values of rows that spell out the given stops. */
const rows = (stops: readonly { temperature: number; color: string }[]): Record<string, unknown> =>
  Object.fromEntries(
    stops.flatMap((stop, i): [string, unknown][] => [
      [`colors_${String(i)}_temperature`, stop.temperature],
      [`colors_${String(i)}_color`, hexToRgb(stop.color)],
    ]),
  );
/** The data the form reports with its rows replaced. */
const withRows = ({ form }: Opened, replacement: Record<string, unknown>): Record<string, unknown> => ({
  ...Object.fromEntries(Object.entries(form.data).filter(([key]) => !key.startsWith('colors_'))),
  ...replacement,
});

describe('hex conversion', () => {
  test('hexToRgb reads #rrggbb and #rgb in any case, and nothing else', () => {
    expect(hexToRgb('#1e5aa8')).toEqual([30, 90, 168]);
    expect(hexToRgb('#1E5AA8')).toEqual([30, 90, 168]);
    expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
    expect(hexToRgb('#0a0')).toEqual([0, 170, 0]);
    for (const text of ['blue', 'var(--accent-color)', '#12', '#12345', '#gggggg', 'rgb(1,2,3)', '']) {
      expect(hexToRgb(text), text).toBeUndefined();
    }
  });

  test('rgbToHex writes lower case #rrggbb, rounds and holds channels to 0 to 255', () => {
    expect(rgbToHex([30, 90, 168])).toBe('#1e5aa8');
    expect(rgbToHex([0, 0, 0])).toBe('#000000');
    expect(rgbToHex([255.4, 127.6, -3])).toBe('#ff8000');
    expect(rgbToHex([300, 0, 5])).toBe('#ff0005');
  });

  test('the two are inverse for every default stop, and isRgb accepts three numbers only', () => {
    for (const stop of DEFAULT_STOPS) expect(rgbToHex(hexToRgb(stop.color) ?? [0, 0, 0])).toBe(stop.color);
    expect(isRgb([1, 2, 3])).toBe(true);
    for (const value of [[1, 2], [1, 2, 3, 4], 'x', undefined, [1, 'a', 3]]) expect(isRgb(value)).toBe(false);
  });
});

describe('colour rows shown', () => {
  test('without colors the rows are the default stops plus an empty row, with a colour selector and a number box in degrees C', async () => {
    const { form } = await openEditor(BASE);
    expect(rowNames(form)).toHaveLength((DEFAULT_STOPS.length + 1) * 2);
    expect(form.data).toMatchObject(rows(DEFAULT_STOPS));
    expect(form.data).not.toHaveProperty('colors_6_temperature');
    const fields = new Map(fieldsWithPaths(form.schema).map(({ field, path }) => [path, field]));
    expect(fields.get('colors_0_color')?.selector).toEqual({ color_rgb: {} });
    expect(fields.get('colors_0_temperature')?.selector).toMatchObject({
      number: { unit_of_measurement: '°C', mode: 'box' },
    });
  });

  test('a configured list shows one row per stop plus an empty one', async () => {
    const { form } = await openEditor({ ...BASE, colors: CUSTOM });
    expect(rowNames(form)).toEqual([
      'colors_0_temperature',
      'colors_0_color',
      'colors_1_temperature',
      'colors_1_color',
      'colors_2_temperature',
      'colors_2_color',
    ]);
    expect(form.data).toMatchObject(rows(CUSTOM));
  });

  test('the rows are labelled by their number', async () => {
    const { form } = await openEditor(BASE);
    expect(form.computeLabel?.({ name: 'colors_2_temperature' })).toBe(EDITOR.colorRow.temperature(3));
    expect(form.computeLabel?.({ name: 'colors_2_color' })).toBe(EDITOR.colorRow.color(3));
  });
});

/** Types one keystroke: the form reports the data with the row's temperature replaced; waits for the render. */
async function type(opened: Opened, row: number, value: number | undefined): Promise<void> {
  opened.form.change({ ...opened.form.data, [`colors_${String(row)}_temperature`]: value });
  await opened.editor.updateComplete;
}

describe('colour rows typed one keystroke at a time', () => {
  test('typing 4 then 40 into the empty row, then picking a colour, keeps the row in place', async () => {
    const opened = await openEditor(BASE);
    await type(opened, 6, 4);
    // 4 sorts to the second place of colors, but the row stays at index 6 and a new empty row appears below it.
    expect(opened.form.data['colors_6_temperature']).toBe(4);
    expect(opened.form.data['colors_0_temperature']).toBe(-10);
    expect(opened.form.data['colors_7_color']).toEqual([158, 158, 158]);
    expect((opened.saved.at(-1)?.['colors'] as { temperature: number }[])[1]).toEqual({
      temperature: 4,
      color: NEW_STOP_COLOR,
    });
    await type(opened, 6, 40);
    expect(opened.form.data['colors_6_temperature']).toBe(40);
    expect(rowNames(opened.form)).toHaveLength(16);
    opened.form.change({ ...opened.form.data, colors_6_color: [128, 0, 128] });
    await opened.editor.updateComplete;
    expect(opened.form.data['colors_6_temperature']).toBe(40);
    expect(opened.form.data['colors_6_color']).toEqual([128, 0, 128]);
    expect(opened.saved.at(-1)).toStrictEqual({
      ...BASE,
      colors: [
        ...DEFAULT_STOPS.filter((stop) => stop.temperature < 40),
        { temperature: 40, color: '#800080' },
        ...DEFAULT_STOPS.filter((stop) => stop.temperature > 40),
      ],
    });
    expect(opened.saved.every((config) => !hasColorKeys(config))).toBe(true);
  });

  test('editing 30 to 3 to 35 does not move the row', async () => {
    const opened = await openEditor(BASE);
    await type(opened, 3, 3);
    expect(opened.form.data['colors_3_temperature']).toBe(3);
    expect(opened.form.data['colors_3_color']).toEqual(hexToRgb('#e8a317'));
    await type(opened, 3, 35);
    expect(opened.form.data['colors_3_temperature']).toBe(35);
    expect(opened.form.data['colors_3_color']).toEqual(hexToRgb('#e8a317'));
    expect(opened.saved.at(-1)?.['colors']).toEqual([
      ...DEFAULT_STOPS.filter((stop) => stop.temperature < 30),
      { temperature: 35, color: '#e8a317' },
      ...DEFAULT_STOPS.filter((stop) => stop.temperature > 30),
    ]);
  });

  test('clearing a temperature keeps the row visible with its colour and drops it from colors; retyping restores it', async () => {
    const opened = await openEditor(BASE);
    await type(opened, 2, undefined);
    expect(opened.form.data).not.toHaveProperty('colors_2_temperature');
    expect(opened.form.data['colors_2_color']).toEqual(hexToRgb('#8ecae6'));
    expect(opened.form.data['colors_3_temperature']).toBe(30);
    expect((opened.saved.at(-1)?.['colors'] as unknown[]).length).toBe(DEFAULT_STOPS.length - 1);
    await type(opened, 2, 2);
    await type(opened, 2, 20);
    expect(opened.saved.at(-1)).toStrictEqual(BASE);
  });

  test('colors arriving from outside rebuilds the rows, while the editor own config handed back does not', async () => {
    const opened = await openEditor(BASE);
    await type(opened, 6, 40);
    opened.editor.setConfig(opened.saved.at(-1) ?? {});
    await opened.editor.updateComplete;
    expect(opened.form.data['colors_6_temperature']).toBe(40);
    opened.editor.setConfig({ ...BASE, colors: CUSTOM });
    await opened.editor.updateComplete;
    expect(rowNames(opened.form)).toHaveLength(6);
    expect(opened.form.data).toMatchObject(rows(CUSTOM));
    expect(opened.form.data['colors_2_color']).toEqual([158, 158, 158]);
  });

  test('a row without a temperature does not count as cleared, so the row fields never stay emptied', async () => {
    const opened = await openEditor({ ...BASE, source: 'air' });
    opened.form.change({ ...opened.form.data, layout: 'full' });
    expect(opened.saved).toStrictEqual([{ ...BASE, source: 'air', layout: 'full' }]);
  });
});

describe('colour rows written', () => {
  test('a non-array colors is kept while the rows are the defaults, and replaced once a row changes', async () => {
    for (const colors of [null, { temperature: 1 }, 'x']) {
      const opened = await openEditor({ ...BASE, colors });
      opened.form.change({ ...opened.form.data, source: 'air' });
      expect(opened.saved, JSON.stringify(colors)).toStrictEqual([{ ...BASE, colors, source: 'air' }]);
      opened.form.change({ ...opened.form.data, colors_0_temperature: -20 });
      expect((opened.saved.at(-1)?.['colors'] as unknown[]).length).toBe(DEFAULT_STOPS.length);
    }
  });

  test('card-editor "Add a stop": 40 and a purple colour in the empty row give the defaults plus the new stop, ascending', async () => {
    const opened = await openEditor(BASE);
    opened.form.change({ ...opened.form.data, colors_6_temperature: 40, colors_6_color: [128, 0, 128] });
    expect(opened.saved).toStrictEqual([
      {
        ...BASE,
        colors: [
          ...DEFAULT_STOPS.filter((stop) => stop.temperature < 40),
          { temperature: 40, color: '#800080' },
          ...DEFAULT_STOPS.filter((stop) => stop.temperature > 40),
        ],
      },
    ]);
    expect(hasColorKeys(opened.saved[0] ?? {})).toBe(false);
  });

  test('after a stop is added the form shows it in order and a new empty row', async () => {
    const opened = await openEditor(BASE);
    opened.form.change({ ...opened.form.data, colors_6_temperature: 40, colors_6_color: [128, 0, 128] });
    await opened.editor.updateComplete;
    expect(rowNames(opened.form)).toHaveLength(8 * 2);
    // The rows keep the order typed: the new stop stays in the row it was typed in.
    expect(opened.form.data['colors_6_temperature']).toBe(40);
    expect(opened.form.data['colors_6_color']).toEqual([128, 0, 128]);
    expect(opened.form.data).not.toHaveProperty('colors_7_temperature');
    expect(opened.form.data['colors_7_color']).toEqual([158, 158, 158]);
  });

  test('a temperature typed before a colour is picked gets the neutral colour', async () => {
    const opened = await openEditor(BASE);
    opened.form.change({ ...opened.form.data, colors_6_temperature: 40 });
    expect((opened.saved[0]?.['colors'] as { color: string }[])[4]?.color).toBe(NEW_STOP_COLOR);
  });

  test('card-editor "Back to default": rows edited back to the default stops remove colors', async () => {
    const opened = await openEditor({ ...BASE, source: 'air', colors: CUSTOM });
    opened.form.change(withRows(opened, rows(DEFAULT_STOPS)));
    expect(opened.saved).toStrictEqual([{ ...BASE, source: 'air' }]);
    expect(opened.saved[0]).not.toHaveProperty('colors');
  });

  test('removing the added stop again leaves no colors key', async () => {
    const opened = await openEditor(BASE);
    opened.form.change({ ...opened.form.data, colors_6_temperature: 40, colors_6_color: [128, 0, 128] });
    await opened.editor.updateComplete;
    opened.form.change(cleared(opened.form.data, 'colors_6_temperature'));
    expect(opened.saved.at(-1)).toStrictEqual(BASE);
  });

  test('rows are written in ascending temperature order, with their colours', async () => {
    const opened = await openEditor({ ...BASE, colors: CUSTOM });
    opened.form.change({ ...opened.form.data, colors_0_temperature: 80 });
    expect(opened.saved).toStrictEqual([
      {
        ...BASE,
        colors: [
          { temperature: 60, color: '#c62828' },
          { temperature: 80, color: '#1565c0' },
        ],
      },
    ]);
  });

  test('a row without a temperature is dropped, whether cleared or empty', async () => {
    const three = [CUSTOM[0], { temperature: 30, color: '#e8a317' }, CUSTOM[1]];
    const opened = await openEditor({ ...BASE, colors: three });
    opened.form.change(cleared(opened.form.data, 'colors_1_temperature'));
    expect(opened.saved.at(-1)?.['colors']).toEqual(CUSTOM);
    const again = await openEditor({ ...BASE, colors: three });
    again.form.change({ ...again.form.data, colors_1_temperature: '' });
    expect(again.saved.at(-1)?.['colors']).toEqual(CUSTOM);
    expect(hasColorKeys(again.saved.at(-1) ?? {})).toBe(false);
  });

  test('other fields change without touching a configured list, and no row key reaches the config', async () => {
    const opened = await openEditor({ ...BASE, colors: CUSTOM });
    opened.form.change({ ...opened.form.data, source: 'air' });
    expect(opened.saved).toStrictEqual([{ ...BASE, colors: CUSTOM, source: 'air' }]);
    expect(hasColorKeys(opened.saved[0] ?? {})).toBe(false);
  });

  test('a list of one stop is written and the card error is shown in the editor', async () => {
    const opened = await openEditor({ ...BASE, colors: CUSTOM });
    opened.form.change(cleared(opened.form.data, 'colors_1_temperature'));
    await opened.editor.updateComplete;
    expect(opened.saved.at(-1)?.['colors']).toEqual([CUSTOM[0]]);
    expect(errorOf(opened.editor)).toContain(CONFIG_ERRORS.colors);
  });

  test('two equal temperatures and nine stops show the error too, and a valid list clears it', async () => {
    const opened = await openEditor({ ...BASE, colors: CUSTOM });
    opened.form.change({ ...opened.form.data, colors_1_temperature: 0 });
    await opened.editor.updateComplete;
    expect(errorOf(opened.editor)).toContain(CONFIG_ERRORS.colors);
    opened.form.change({ ...opened.form.data, colors_1_temperature: 60 });
    await opened.editor.updateComplete;
    expect(errorOf(opened.editor)).toBeUndefined();
    const many = Array.from({ length: 9 }, (_, i) => ({ temperature: i * 10, color: '#112233' }));
    const nine = await openEditor({ ...BASE, colors: many });
    expect(errorOf(nine.editor)).toContain(CONFIG_ERRORS.colors);
  });

  test('card-editor "Round trip": configs with colors are saved unchanged, colour spelling included', async () => {
    const configs: CardConfig[] = [
      { ...BASE, colors: CUSTOM },
      { ...BASE, colors: DEFAULT_STOPS.map((stop) => ({ ...stop })) },
      {
        ...BASE,
        colors: [
          { temperature: -5, color: '#FFF' },
          { temperature: 25.5, color: 'blue' },
          { temperature: 40, color: 'var(--accent-color)' },
          { temperature: 90, color: '#C62828' },
        ],
      },
      { ...BASE, colors: [CUSTOM[0]] },
    ];
    for (const config of configs) {
      const { form, saved } = await openEditor(config);
      form.change(structuredClone(form.data));
      expect(saved, JSON.stringify(config)).toStrictEqual([config]);
    }
  });
});
