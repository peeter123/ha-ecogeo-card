// Adapted from hrv-ventilation test/editor/schema.test.ts: the same checks of the copied helpers, with this card's
// additions (coded selects, empty texts, empty groups) in place of the blank text lists.
import { describe, expect, test } from 'vitest';
import {
  clearedPaths,
  fromFormData,
  hasAdvancedValue,
  toFormData,
  visibleSchema,
  withoutEmptyGroups,
  withoutEmptyTexts,
  withoutShownDefaults,
  withoutUndefined,
  withShownDefaults,
  type EditorSchema,
  type FormSchema,
} from '../../src/editor/schema';
import { BASIC_CONFIG, CHOICE_SCHEMA, CODED_SCHEMA, SCHEMA } from './fixtures';

const names = (schema: FormSchema): unknown[] =>
  schema.map((item) => ('schema' in item ? { [item.name]: item.schema.map((field) => field.name) } : item.name));

describe('visibleSchema', () => {
  test('with the switch off, advanced fields are left out and a section with only advanced fields disappears', () => {
    expect(names(visibleSchema(SCHEMA, false))).toEqual([{ outdoor: ['temperature', 'humidity'] }, 'bypass_position']);
  });

  test('with the switch on, advanced fields appear in their own section', () => {
    expect(names(visibleSchema(SCHEMA, true))).toEqual([
      { outdoor: ['temperature', 'humidity', 'absolute_humidity'] },
      { calculation: ['smoothing', 'air_density'] },
      'bypass_position',
      'min_scale',
    ]);
  });

  test('the editor-only advanced mark is not passed to ha-form; required, selector and default are', () => {
    const [outdoor, calculation] = visibleSchema(SCHEMA, true);
    const fields = outdoor && 'schema' in outdoor ? outdoor.schema : [];
    expect(fields.every((field) => !('advanced' in field))).toBe(true);
    expect(fields[0]).toEqual({ name: 'temperature', required: true, selector: { entity: { domain: 'sensor' } } });
    expect(calculation && 'schema' in calculation ? calculation.schema[0]?.default : undefined).toBe(10);
  });

  test('sections keep their type, name and title', () => {
    const [outdoor] = visibleSchema(SCHEMA, false);
    expect(outdoor).toMatchObject({ type: 'expandable', name: 'outdoor', title: 'Outdoor air' });
  });
});

describe('hasAdvancedValue', () => {
  test('basic values never count, and an advanced value counts only when it differs from its default', () => {
    expect(hasAdvancedValue(SCHEMA, BASIC_CONFIG)).toBe(false);
    expect(hasAdvancedValue(SCHEMA, { ...BASIC_CONFIG, calculation: { smoothing: 5 } })).toBe(true);
    expect(hasAdvancedValue(SCHEMA, { ...BASIC_CONFIG, calculation: { smoothing: 10, air_density: 1.2 } })).toBe(false);
    expect(hasAdvancedValue(SCHEMA, { ...BASIC_CONFIG, calculation: { smoothing: '10' } })).toBe(false);
    expect(hasAdvancedValue(SCHEMA, { ...BASIC_CONFIG, bypass_position: 'sensor.bypass' })).toBe(false);
  });
});

describe('shown defaults', () => {
  test('withShownDefaults fills in unset fields, also inside a section, and keeps the config it was given', () => {
    const config = { type: 'custom:x' };
    expect(withShownDefaults(CHOICE_SCHEMA, config)).toEqual({
      type: 'custom:x',
      exchanger_type: 'erv',
      calculation: { mode: 'auto' },
    });
    expect(config).toEqual({ type: 'custom:x' });
    expect(withShownDefaults(CHOICE_SCHEMA, { exchanger_type: 'hrv', calculation: { mode: 'fixed' } })).toEqual({
      exchanger_type: 'hrv',
      calculation: { mode: 'fixed' },
    });
  });

  test('withShownDefaults returns the config itself when no field has a default to add', () => {
    expect(withShownDefaults(visibleSchema(SCHEMA, false), BASIC_CONFIG)).toBe(BASIC_CONFIG);
  });

  test('withShownDefaults leaves out the fields the user just cleared', () => {
    expect(withShownDefaults(CHOICE_SCHEMA, {}, new Set(['exchanger_type']))).toEqual({
      calculation: { mode: 'auto' },
    });
  });

  test('withoutShownDefaults drops a default the config did not have, and an emptied section with it', () => {
    const current = { type: 'custom:x' };
    const shown = withShownDefaults(CHOICE_SCHEMA, current);
    expect(withoutShownDefaults(CHOICE_SCHEMA, current, { ...shown, other: 1 })).toEqual({
      type: 'custom:x',
      other: 1,
    });
  });

  test('withoutShownDefaults keeps a changed value, and a default the config already had', () => {
    expect(withoutShownDefaults(CHOICE_SCHEMA, { type: 'x' }, { type: 'x', exchanger_type: 'hrv' })).toEqual({
      type: 'x',
      exchanger_type: 'hrv',
    });
    const set = { exchanger_type: 'erv', calculation: { mode: 'auto' } };
    expect(withoutShownDefaults(CHOICE_SCHEMA, set, { ...set })).toEqual(set);
  });

  test('withoutShownDefaults keeps the other keys of a section that was in the config', () => {
    const current = { calculation: { other: 1 } };
    const changed = { calculation: { other: 2, mode: 'auto' } };
    expect(withoutShownDefaults(CHOICE_SCHEMA, current, changed)).toEqual({ calculation: { other: 2 } });
  });

  test('withoutShownDefaults keeps a section the config already had, even when it ends up empty', () => {
    const current = { type: 'x', calculation: {} };
    const shown = withShownDefaults(CHOICE_SCHEMA, current);
    expect(shown).toMatchObject({ calculation: { mode: 'auto' } });
    expect(withoutShownDefaults(CHOICE_SCHEMA, current, { ...shown, other: 1 })).toEqual({
      type: 'x',
      other: 1,
      calculation: {},
    });
  });

  test('withoutShownDefaults removes only the levels the defaults created in a nested path', () => {
    const nested: EditorSchema = [{ type: 'expandable', name: 'a', schema: [{ name: 'b', default: 1, selector: {} }] }];
    expect(withoutShownDefaults(nested, { a: {} }, { a: { b: 1 } })).toEqual({ a: {} });
    expect(withoutShownDefaults(nested, {}, { a: { b: 1 } })).toEqual({});
  });
});

describe('cleared fields', () => {
  test('clearedPaths lists the fields that were shown and are now unset', () => {
    const shown = { exchanger_type: 'erv', calculation: { mode: 'auto' } };
    expect(clearedPaths(CHOICE_SCHEMA, shown, { calculation: { mode: 'auto' } })).toEqual(['exchanger_type']);
  });

  test('withoutUndefined removes undefined values, also inside sections, and returns the value itself when none', () => {
    expect(withoutUndefined({ a: undefined, b: { c: undefined, d: 1 } })).toEqual({ b: { d: 1 } });
    const clean = { a: 1 };
    expect(withoutUndefined(clean)).toBe(clean);
  });

  test('withoutEmptyTexts removes an empty text box value but keeps other values', () => {
    expect(withoutEmptyTexts(CODED_SCHEMA, { prefix: '', other: '' })).toEqual({ other: '' });
    expect(withoutEmptyTexts(CODED_SCHEMA, { prefix: 'abc' })).toEqual({ prefix: 'abc' });
  });
});

describe('coded selects', () => {
  test('toFormData shows the config value as its form value and leaves other values alone', () => {
    expect(toFormData(CODED_SCHEMA, { features: { htr: false }, other: true })).toEqual({
      features: { htr: 'false' },
      other: true,
    });
    expect(toFormData(CODED_SCHEMA, { features: { htr: 'unused' } })).toEqual({ features: { htr: 'unused' } });
    expect(toFormData(CODED_SCHEMA, { features: { htr: true } })).toEqual({ features: { htr: 'true' } });
  });

  test('fromFormData turns form values back into config values, and the unset choice removes the key', () => {
    expect(fromFormData(CODED_SCHEMA, { features: { htr: 'true' } }, {})).toEqual({ features: { htr: true } });
    expect(fromFormData(CODED_SCHEMA, { features: { htr: 'false' } }, {})).toEqual({ features: { htr: false } });
    expect(fromFormData(CODED_SCHEMA, { features: { htr: 'unused' } }, {})).toEqual({ features: { htr: 'unused' } });
    expect(fromFormData(CODED_SCHEMA, { features: { htr: 'default' }, x: 1 }, {})).toEqual({ x: 1 });
  });

  test('fromFormData keeps a group the original config had', () => {
    expect(fromFormData(CODED_SCHEMA, { features: { htr: 'default' } }, { features: { htr: false } })).toEqual({
      features: {},
    });
  });
});

describe('withoutEmptyGroups', () => {
  test('removes an empty group, but not a group with keys or one that was empty before', () => {
    expect(withoutEmptyGroups({ a: 1, features: {} }, { features: { htr: false } }, ['features'])).toEqual({ a: 1 });
    expect(withoutEmptyGroups({ features: { htr: true } }, {}, ['features'])).toEqual({ features: { htr: true } });
    expect(withoutEmptyGroups({ features: {} }, { features: {} }, ['features'])).toEqual({ features: {} });
    expect(withoutEmptyGroups({ other: {} }, {}, ['features'])).toEqual({ other: {} });
  });
});
