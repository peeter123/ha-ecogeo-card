// Adapted from hrv-ventilation test/editor/hrv-card-editor.test.ts: the editor is opened with a stand-in ha-form that
// keeps what the editor passes and can emit value-changed. The scenario names are those of the card-editor spec.
import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import type { EcogeoCardEditor } from '../../src/editor/ecogeo-card-editor';
import { fieldsWithPaths, type EditorSchema, type FormSchema } from '../../src/editor/schema';
import { CONFIG_ERRORS, EDITOR } from '../../src/strings';
import { configOf, defaultState } from '../../dev/url-state';
import { SCENARIO_NAMES } from '../../dev/scenarios';
import { DHW_STORAGES, MODELS, SOURCES } from '../../src/config/options';
import { FEATURE_KEYS, VARIANTS } from '../../src/config/variants';
import { DEFAULT_STOPS } from '../../src/diagram/colors';
import { hexToRgb } from '../../src/editor/fields';
import { CHOICE_SCHEMA } from './fixtures';
import { StubForm } from './harness';

/** The names of the colour row fields of `count` rows. */
const rowFields = (count: number): string[] =>
  Array.from({ length: count }, (_, i) => [`colors_${String(i)}_temperature`, `colors_${String(i)}_color`]).flat();

/** What the form shows for the default colour stops (the colours as [r, g, b]). */
const DEFAULT_ROW_DATA: Record<string, unknown> = Object.fromEntries(
  DEFAULT_STOPS.flatMap((stop, i): [string, unknown][] => [
    [`colors_${String(i)}_temperature`, stop.temperature],
    [`colors_${String(i)}_color`, hexToRgb(stop.color)],
  ]).concat([[`colors_${String(DEFAULT_STOPS.length)}_color`, [158, 158, 158]]]),
);

beforeAll(async () => {
  customElements.define('ha-form', StubForm);
  await import('../../src/editor/ecogeo-card-editor');
});

afterEach(() => {
  document.body.innerHTML = '';
});

async function openEditor(
  config: CardConfig,
  schemaFor?: (config: CardConfig) => EditorSchema,
): Promise<{ editor: EcogeoCardEditor; form: StubForm }> {
  const editor = document.createElement('ecogeo-card-editor');
  if (schemaFor) editor.schemaFor = schemaFor;
  editor.setConfig(config);
  document.body.append(editor);
  await editor.updateComplete;
  const form = editor.shadowRoot?.querySelector<StubForm>('ha-form:not(.switch)');
  if (!form) throw new Error('editor did not render a form');
  return { editor, form };
}

/** The configs the editor reports through config-changed. */
function collectSaved(editor: EcogeoCardEditor): CardConfig[] {
  const saved: CardConfig[] = [];
  editor.addEventListener('config-changed', (event) => {
    saved.push((event as CustomEvent<{ config: CardConfig }>).detail.config);
  });
  return saved;
}

/** What ha-form reports when the user clears a field: the data with `undefined` at the dotted path. */
function cleared(data: Record<string, unknown>, path: string): Record<string, unknown> {
  const [key, ...rest] = path.split('.') as [string, ...string[]];
  if (rest.length === 0) return { ...data, [key]: undefined };
  return { ...data, [key]: cleared(data[key] as Record<string, unknown>, rest.join('.')) };
}

const fieldNames = (schema: FormSchema): string[] => fieldsWithPaths(schema).map(({ path }) => path);

const ALL_OPTIONS: CardConfig = {
  type: 'custom:ecogeo-card',
  model: 'C',
  variant: 2,
  source: 'hybrid',
  dhw: 'internal',
  prefix: 'demo_ecogeo',
  features: { active_cooling: true, passive_cooling: false, htr: false, backup_heater: 'unused' },
  detail: 'full',
  exchanger_fill: 'none',
  layout: 'compact',
  colors: [
    { temperature: 0, color: '#1565c0' },
    { temperature: 60, color: '#c62828' },
  ],
  entities: { dhw: { temperature: 'sensor.boiler_top' } },
  view_layout: { column: 2 },
  grid_options: { columns: 12 },
  visibility: [{ condition: 'screen', media_query: '(min-width: 600px)' }],
};

describe('ecogeo-card-editor existing config', () => {
  test('card-editor "Existing config opens": every field shows the value of the config, other features the variant default', async () => {
    const config = {
      type: 'custom:ecogeo-card',
      model: 'B',
      variant: '4',
      source: 'air',
      dhw: 'external',
      prefix: 'demo_ecogeo',
      features: { passive_cooling: 'unused' },
    };
    const { form } = await openEditor(config);
    expect(form.data).toEqual({
      type: 'custom:ecogeo-card',
      model: 'B',
      variant: '4',
      source: 'air',
      dhw: 'external',
      prefix: 'demo_ecogeo',
      features: { passive_cooling: 'unused', active_cooling: 'default', htr: 'default', backup_heater: 'default' },
      detail: 'simplified',
      exchanger_fill: 'gradient',
      layout: 'auto',
      ...DEFAULT_ROW_DATA,
    });
    expect(fieldNames(form.schema)).toEqual([
      'model',
      'variant',
      'source',
      'dhw',
      'prefix',
      'features.passive_cooling',
      'features.active_cooling',
      'features.htr',
      'features.backup_heater',
      'detail',
      'exchanger_fill',
      'layout',
      ...rowFields(DEFAULT_STOPS.length + 1),
    ]);
  });

  test('a field the config leaves out shows its default, and the model sets the DHW default', async () => {
    const { form } = await openEditor({ type: 'custom:ecogeo-card' });
    expect(form.data).toMatchObject({ model: 'B', variant: '4', source: 'ground', dhw: 'external' });
    const { form: second } = await openEditor({ model: 'C' });
    expect(second.data).toMatchObject({ model: 'C', dhw: 'internal' });
  });

  test('explicit feature values are shown as text and saved as booleans', async () => {
    const config = { features: { htr: false, backup_heater: true, active_cooling: 'unused' } };
    const { editor, form } = await openEditor(config);
    expect(form.data['features']).toEqual({
      htr: 'false',
      backup_heater: 'true',
      active_cooling: 'unused',
      passive_cooling: 'default',
    });
    const saved = collectSaved(editor);
    form.change({ ...form.data, features: { ...(form.data['features'] as object), passive_cooling: 'true' } });
    expect(saved).toEqual([{ features: { ...config.features, passive_cooling: true } }]);
  });

  test('the feature choices come from the variant of the config, also after the variant changes', async () => {
    const { editor, form } = await openEditor({ variant: 1 });
    const label = (): string | undefined => {
      const group = form.schema.find((item) => item.name === 'features');
      const first = group && 'schema' in group ? group.schema[0] : undefined;
      const select = (first && 'selector' in first ? first.selector['select'] : undefined) as
        { options: { label: string }[] } | undefined;
      return select?.options[0]?.label;
    };
    expect(label()).toBe(EDITOR.featureChoices.variantDefault(EDITOR.featureChoices.presetOff));
    form.change({ ...form.data, variant: '2' });
    await editor.updateComplete;
    expect(label()).toBe(EDITOR.featureChoices.variantDefault(EDITOR.featureChoices.presetOn));
  });
});

describe('ecogeo-card-editor writes', () => {
  test('card-editor "Clear the variant": a cleared variant removes the key, and stays empty', async () => {
    const config = { type: 'custom:ecogeo-card', variant: 3 };
    const { editor, form } = await openEditor(config);
    const saved = collectSaved(editor);
    expect(form.data).toMatchObject({ variant: '3' });
    form.change(cleared(form.data, 'variant'));
    await editor.updateComplete;
    expect(saved).toStrictEqual([{ type: 'custom:ecogeo-card' }]);
    expect(saved[0]).not.toHaveProperty('variant');
    expect(form.data).not.toHaveProperty('variant');
    form.change({ ...form.data, variant: '2' });
    expect(saved.at(-1)).toStrictEqual({ type: 'custom:ecogeo-card', variant: 2 });
  });

  test('card-editor "Unshown keys kept": changing the source keeps grid_options and the other unshown keys', async () => {
    const config = {
      type: 'custom:ecogeo-card',
      grid_options: { columns: 12, rows: 'auto' },
      view_layout: { position: 'sidebar' },
      colors: [
        { temperature: 0, color: 'blue' },
        { temperature: 50, color: 'red' },
      ],
      entities: { dhw: { temperature: 'sensor.boiler_top' } },
    };
    const { editor, form } = await openEditor(config);
    const saved = collectSaved(editor);
    form.change({ ...form.data, source: 'air' });
    expect(saved).toStrictEqual([{ ...config, source: 'air' }]);
  });

  test('a value equal to its default is not written, and a default shown for another field is never written', async () => {
    const { editor, form } = await openEditor({ type: 'custom:ecogeo-card' });
    const saved = collectSaved(editor);
    form.change({ ...form.data, prefix: 'my_unit' });
    expect(saved).toStrictEqual([{ type: 'custom:ecogeo-card', prefix: 'my_unit' }]);
    await editor.updateComplete;
    form.change({ ...form.data, source: 'ground', layout: 'auto' });
    expect(saved.at(-1)).toStrictEqual({ type: 'custom:ecogeo-card', prefix: 'my_unit' });
    form.change({ ...form.data, source: 'air' });
    expect(saved.at(-1)).toStrictEqual({ type: 'custom:ecogeo-card', prefix: 'my_unit', source: 'air' });
  });

  test('a cleared prefix (an empty text or undefined) removes the key', async () => {
    const { editor, form } = await openEditor({ prefix: 'abc' });
    const saved = collectSaved(editor);
    form.change({ ...form.data, prefix: '' });
    form.change(cleared(form.data, 'prefix'));
    expect(saved).toStrictEqual([{}, {}]);
  });

  test('the variant default choice of a feature removes the key, and an emptied features group is pruned', async () => {
    const { editor, form } = await openEditor({ features: { htr: false }, grid_options: { columns: 6 } });
    const saved = collectSaved(editor);
    form.change({ ...form.data, features: { ...(form.data['features'] as object), htr: 'default' } });
    expect(saved).toStrictEqual([{ grid_options: { columns: 6 } }]);
    expect(saved[0]).not.toHaveProperty('features');
  });

  test('a feature set to true or false is written as that boolean', async () => {
    const { editor, form } = await openEditor({});
    const saved = collectSaved(editor);
    form.change({ ...form.data, features: { ...(form.data['features'] as object), passive_cooling: 'false' } });
    expect(saved).toStrictEqual([{ features: { passive_cooling: false } }]);
  });

  test('changing the model changes the DHW default without writing it', async () => {
    const { editor, form } = await openEditor({ type: 'custom:ecogeo-card' });
    const saved = collectSaved(editor);
    form.change({ ...form.data, model: 'C' });
    await editor.updateComplete;
    expect(saved).toStrictEqual([{ type: 'custom:ecogeo-card', model: 'C' }]);
    expect(form.data).toMatchObject({ model: 'C', dhw: 'internal' });
  });

  test('value-changed from the form does not escape the editor', async () => {
    const { form } = await openEditor({});
    const escaped: Event[] = [];
    document.body.addEventListener('value-changed', (event) => escaped.push(event));
    form.change({});
    expect(escaped).toEqual([]);
  });

  test('config-changed bubbles out of the editor', async () => {
    const { editor, form } = await openEditor({});
    const heard: Event[] = [];
    document.body.addEventListener('config-changed', (event) => heard.push(event));
    form.change({ ...form.data, source: 'air' });
    expect(heard).toHaveLength(1);
    expect(editor.isConnected).toBe(true);
  });

  test('the form keeps the same schema object across hass updates and unrelated edits, so open sections stay open', async () => {
    const { editor, form } = await openEditor({ type: 'custom:ecogeo-card' });
    const schema = form.schema;
    editor.hass = { states: {} };
    await editor.updateComplete;
    form.change({ ...form.data, prefix: 'abc' });
    await editor.updateComplete;
    editor.setConfig({ prefix: 'abc', source: 'air' });
    await editor.updateComplete;
    expect(form.schema).toBe(schema);
  });

  test('a cleared field stays empty until the config is set from outside', async () => {
    const { editor, form } = await openEditor({ source: 'air' });
    form.change(cleared(form.data, 'source'));
    await editor.updateComplete;
    expect(form.data).not.toHaveProperty('source');
    editor.setConfig({});
    await editor.updateComplete;
    expect(form.data).not.toHaveProperty('source');
    editor.setConfig({ layout: 'full' });
    await editor.updateComplete;
    expect(form.data).toMatchObject({ source: 'ground', layout: 'full' });
  });

  test('labels come from the section title or the editor strings', async () => {
    const { form } = await openEditor({});
    expect(form.computeLabel?.({ type: 'expandable', name: 'unit', schema: [] })).toBe(EDITOR.sections.unit);
    expect(form.computeLabel?.({ type: 'expandable', name: 'x', title: 'Own title', schema: [] })).toBe('Own title');
    expect(form.computeLabel?.({ name: 'dhw' })).toBe(EDITOR.fields.dhw);
    expect(form.computeLabel?.({ name: 'unknown_field' })).toBe('unknown_field');
  });

  test('another schema builder can be used (the generic helpers are tested with the hrv fixtures)', async () => {
    const { form } = await openEditor({ type: 'x' }, () => CHOICE_SCHEMA);
    expect(form.data).toEqual({ type: 'x', exchanger_type: 'erv', calculation: { mode: 'auto' } });
  });
});

describe('ecogeo-card-editor configuration error', () => {
  test('the error of the card is shown above the form, and gone for a valid config', async () => {
    const { editor, form } = await openEditor({ model: 'B', dhw: 'internal' });
    const error = (): string | undefined => editor.shadowRoot?.querySelector('.error')?.textContent.trim();
    expect(error()).toBe(CONFIG_ERRORS.dhwMismatch('internal', 'B'));
    const nodes = [...(editor.shadowRoot?.children ?? [])].map((node) => node.localName);
    expect(nodes.indexOf('p')).toBeLessThan(nodes.indexOf('ha-form'));
    expect(form.isConnected).toBe(true);
    form.change({ ...form.data, dhw: 'external' });
    await editor.updateComplete;
    expect(error()).toBeUndefined();
  });

  test('every problem of the config is listed', async () => {
    const { editor } = await openEditor({ variant: 7, source: 'sun' });
    const error = editor.shadowRoot?.querySelector('.error')?.textContent;
    expect(error).toContain('variant');
    expect(error).toContain('source');
  });
});

describe('ecogeo-card-editor round trip', () => {
  /** Opens the config, lets the form report exactly what it shows and returns what the editor saved. */
  async function roundTrip(config: CardConfig): Promise<CardConfig[]> {
    const { editor, form } = await openEditor(config);
    const saved = collectSaved(editor);
    form.change(structuredClone(form.data));
    return saved;
  }

  test.each(SCENARIO_NAMES)(
    'card-editor "Round trip": the config of the emulator scenario %s is saved unchanged',
    async (scenario) => {
      const config = configOf({ ...defaultState(), scenario });
      expect(await roundTrip(config)).toStrictEqual([config]);
    },
  );

  test('card-editor "Round trip": every emulator installation (model, source, DHW, variant, features) is saved unchanged', async () => {
    const choices = ['default', 'true', 'false', 'unused'] as const;
    let count = 0;
    for (const model of MODELS) {
      for (const dhw of ['default', ...DHW_STORAGES] as const) {
        for (const variant of VARIANTS) {
          for (const source of SOURCES) {
            const features = Object.fromEntries(
              FEATURE_KEYS.map((key, index) => [key, choices[(variant + index + count) % choices.length]]),
            ) as ReturnType<typeof defaultState>['features'];
            const config = configOf({ ...defaultState(), model, dhw, variant, source, features });
            expect(await roundTrip(config), JSON.stringify(config)).toStrictEqual([config]);
            count++;
          }
        }
      }
    }
    expect(count).toBe(2 * 4 * 4 * 3);
  });

  test('card-editor "Round trip": every variant is saved unchanged, as a number', async () => {
    for (const variant of VARIANTS) {
      const config = { type: 'custom:ecogeo-card', variant };
      expect(await roundTrip(config), String(variant)).toStrictEqual([config]);
    }
  });

  test('card-editor "Round trip": the order of the keys is kept, also inside features', async () => {
    const config = {
      type: 'custom:ecogeo-card',
      source: 'air',
      features: { htr: false, passive_cooling: 'unused', backup_heater: true },
      layout: 'full',
      prefix: 'demo_ecogeo',
    };
    const [saved] = await roundTrip(config);
    expect(JSON.stringify(saved)).toBe(JSON.stringify(config));
  });

  test('a value the editor cannot represent is normalised on the first edit: prefix "" and a features key without a value', async () => {
    const { editor, form } = await openEditor({ prefix: '', features: null });
    expect(editor.shadowRoot?.querySelector('.error')).toBeNull();
    const saved = collectSaved(editor);
    form.change(structuredClone(form.data));
    expect(saved).toStrictEqual([{}]);
  });

  test('card-editor "Round trip": a config with every option set is saved unchanged', async () => {
    expect(await roundTrip(ALL_OPTIONS)).toStrictEqual([ALL_OPTIONS]);
  });

  test('card-editor "Round trip": minimal configs, an explicit default and empty groups are saved unchanged', async () => {
    const configs: CardConfig[] = [
      {},
      { type: 'custom:ecogeo-card' },
      { type: 'custom:ecogeo-card', model: 'B', variant: 4, source: 'ground', layout: 'auto' },
      { type: 'custom:ecogeo-card', features: {}, entities: {} },
      { type: 'custom:ecogeo-card', features: { htr: true } },
    ];
    for (const config of configs) expect(await roundTrip(config), JSON.stringify(config)).toStrictEqual([config]);
  });
});

describe('ecogeo-card-editor is read-only towards Home Assistant', () => {
  test('card-editor "No service calls": changing any field fires config-changed and calls nothing on hass', async () => {
    const calls = {
      callService: vi.fn(),
      callWS: vi.fn(),
      callApi: vi.fn(),
      fireEvent: vi.fn(),
    };
    const hass = { states: {}, ...calls } as unknown as HassLike;
    const { editor, form } = await openEditor({ type: 'custom:ecogeo-card' });
    editor.hass = hass;
    await editor.updateComplete;
    const saved = collectSaved(editor);
    form.change({ ...form.data, model: 'C' });
    form.change({ ...form.data, source: 'air' });
    form.change({ ...form.data, features: { htr: 'false' } });
    form.change(cleared(form.data, 'layout'));
    expect(saved).toHaveLength(4);
    for (const call of Object.values(calls)) expect(call).not.toHaveBeenCalled();
  });
});
