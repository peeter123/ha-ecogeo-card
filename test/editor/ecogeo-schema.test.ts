import { describe, expect, test } from 'vitest';
import {
  CHOICE_OPTIONS,
  DETAIL_OPTION,
  DHW_OPTION,
  EXCHANGER_FILL_OPTION,
  LAYOUT_OPTION,
  MODEL_OPTION,
  SOURCE_OPTION,
  TOP_LEVEL_OPTIONS,
} from '../../src/config/options';
import { FEATURE_KEYS, VARIANTS, variantFeatures } from '../../src/config/variants';
import { editorSchema } from '../../src/editor/ecogeo-schema';
import { choiceField, colorField, entityField, numberField } from '../../src/editor/fields';
import { fieldsWithPaths, isSection, type EditorField } from '../../src/editor/schema';
import { EDITOR } from '../../src/strings';

const paths = (config = {}): string[] => fieldsWithPaths(editorSchema(config)).map(({ path }) => path);
const field = (path: string, config = {}): EditorField | undefined =>
  fieldsWithPaths(editorSchema(config)).find((item) => item.path === path)?.field;
const optionValues = (item: EditorField | undefined): string[] => {
  const select = item?.selector['select'] as { options: { value: string }[] } | undefined;
  return select?.options.map((option) => option.value) ?? [];
};
const optionLabels = (item: EditorField | undefined): string[] => {
  const select = item?.selector['select'] as { options: { label: string }[] } | undefined;
  return select?.options.map((option) => option.label) ?? [];
};

describe('editorSchema', () => {
  test('the sections are Unit, Entities, Features and Appearance, in that order', () => {
    const sections = editorSchema({}).map((item) => (isSection(item) ? item.name : undefined));
    expect(sections).toEqual(['unit', 'entity_prefix', 'features', 'appearance']);
    for (const name of sections) expect(EDITOR.sections).toHaveProperty(name ?? '');
  });

  test('the fields, in order, with the features under their group', () => {
    expect(paths()).toEqual([
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
    ]);
  });

  test('every field has a label in the editor strings', () => {
    for (const { field: item } of fieldsWithPaths(editorSchema({}))) expect(EDITOR.fields).toHaveProperty(item.name);
  });

  test('the choice fields come from the option table: its choices and defaults, labelled from the strings', () => {
    const options = [
      ['model', MODEL_OPTION],
      ['source', SOURCE_OPTION],
      ['detail', DETAIL_OPTION],
      ['exchanger_fill', EXCHANGER_FILL_OPTION],
      ['layout', LAYOUT_OPTION],
    ] as const;
    for (const [path, option] of options) {
      expect(optionValues(field(path)), path).toEqual([...option.choices]);
      expect(field(path)?.default, path).toBe(option.default);
      const labels = EDITOR.choices[path] as Record<string, string>;
      expect(optionLabels(field(path)), path).toEqual(option.choices.map((choice) => labels[choice]));
    }
    // dhw is checked with the model's allowed storages below.
    expect(DHW_OPTION.choices).toEqual(expect.arrayContaining(optionValues(field('dhw'))));
  });

  test('the DHW storage shows the default of the model', () => {
    expect(field('dhw', {})?.default).toBe('external');
    expect(field('dhw', { model: 'B' })?.default).toBe('external');
    expect(field('dhw', { model: 'C' })?.default).toBe('internal');
  });

  test('the variant is a select of the allowed variants, with text form values written back as numbers, default 4', () => {
    const item = field('variant');
    expect(item?.default).toBe('4');
    expect(optionValues(item)).toEqual(VARIANTS.map(String));
    expect(optionLabels(item)).toEqual(VARIANTS.map((variant) => `Variant ${String(variant)}`));
    expect(item?.coded).toEqual(VARIANTS.map((variant) => [String(variant), variant]));
  });

  test('the DHW select offers only the storages the model allows', () => {
    expect(optionValues(field('dhw', { model: 'B' }))).toEqual(['external', 'none']);
    expect(optionValues(field('dhw', {}))).toEqual(['external', 'none']);
    expect(optionValues(field('dhw', { model: 'C' }))).toEqual(['internal', 'none']);
  });

  test('a DHW value the model does not allow is still in the select, so it shows', () => {
    expect(optionValues(field('dhw', { model: 'B', dhw: 'internal' }))).toEqual(['external', 'internal', 'none']);
    expect(optionValues(field('dhw', { model: 'C', dhw: 'external' }))).toEqual(['external', 'internal', 'none']);
    expect(optionValues(field('dhw', { model: 'C', dhw: 'bogus' }))).toEqual(['internal', 'none']);
  });

  test('every option of the option table has an editor field, apart from the explicit exceptions', () => {
    // Not options of the editor: the card type, the keys Home Assistant adds to any card, and the keys of task group 2.
    const exceptions = ['type', 'view_layout', 'layout_options', 'grid_options', 'visibility', 'entities', 'colors'];
    const roots = new Set(paths().map((path) => path.split('.')[0]));
    for (const option of TOP_LEVEL_OPTIONS.filter((key) => !exceptions.includes(key))) {
      expect(roots.has(option), option).toBe(true);
    }
    for (const option of CHOICE_OPTIONS) {
      expect(optionValues(field(option.path, {})).length, option.path).toBeGreaterThan(0);
    }
  });

  test('the prefix is a text box with no default', () => {
    expect(field('prefix')).toEqual({ name: 'prefix', selector: { text: {} } });
  });

  test.each(VARIANTS)('variant %i: the empty choice of each feature names the variant default', (variant) => {
    for (const key of FEATURE_KEYS) {
      const labels = optionLabels(field(`features.${key}`, { variant }));
      const preset =
        variantFeatures(variant)[key] === true ? EDITOR.featureChoices.presetOn : EDITOR.featureChoices.presetOff;
      expect(labels, key).toEqual([
        EDITOR.featureChoices.variantDefault(preset),
        EDITOR.featureChoices.on,
        EDITOR.featureChoices.off,
        EDITOR.featureChoices.unused,
      ]);
    }
  });

  test('the features use the variant of the config; an invalid variant falls back to the default variant', () => {
    expect(optionLabels(field('features.active_cooling', { variant: 1 }))[0]).toBe('Variant default: off');
    expect(optionLabels(field('features.active_cooling', { variant: 4 }))[0]).toBe('Variant default: on');
    expect(optionLabels(field('features.active_cooling', { variant: 9 }))[0]).toBe('Variant default: on');
  });

  test('a feature shows the variant default unless set, and maps its form values to true, false and unused', () => {
    const item = field('features.htr');
    expect(item?.default).toBe('default');
    expect(item?.coded).toEqual([
      ['default', undefined],
      ['true', true],
      ['false', false],
      ['unused', 'unused'],
    ]);
  });
});

describe('field builders', () => {
  test('choiceField, numberField, entityField and colorField build ha-form fields', () => {
    expect(choiceField('x', { kind: 'choice', path: 'x', default: 'a', choices: ['a', 'b'] }, { a: 'A' })).toEqual({
      name: 'x',
      default: 'a',
      selector: {
        select: {
          mode: 'dropdown',
          options: [
            { value: 'a', label: 'A' },
            { value: 'b', label: 'b' },
          ],
        },
      },
    });
    expect(numberField('n', { min: 1, max: 4, default: 4 }, 1, 'K')).toEqual({
      name: 'n',
      default: 4,
      selector: { number: { min: 1, max: 4, step: 1, mode: 'box', unit_of_measurement: 'K' } },
    });
    expect(entityField('e', 'sensor')).toEqual({ name: 'e', selector: { entity: { domain: 'sensor' } } });
    expect(entityField('e', ['sensor', 'number'], { advanced: true })).toMatchObject({ advanced: true });
    expect(colorField('c', '#fff')).toEqual({ name: 'c', default: '#fff', selector: { text: {} } });
  });
});
