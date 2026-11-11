import { describe, expect, test } from 'vitest';
import { configErrors, defaultDhw } from '../../src/config/options';
import { resolveConfig } from '../../src/config/resolve';

const errors = (config: Record<string, unknown>): string[] => configErrors({ type: 'custom:ecogeo-card', ...config });

describe('card type and options', () => {
  test('minimal valid config: model B, variant 4, ground source, external DHW', () => {
    const config = { type: 'custom:ecogeo-card', prefix: 'ecoforest_ecogeo' };
    expect(configErrors(config)).toEqual([]);
    const resolved = resolveConfig(config);
    expect([resolved.model, resolved.variant, resolved.source, resolved.dhw]).toEqual(['B', 4, 'ground', 'external']);
    expect(resolved.detail).toBe('simplified');
    expect(resolved.exchangerFill).toBe('gradient');
  });

  test('invalid detail names the option and its allowed values', () => {
    const [message, ...rest] = errors({ detail: 'minimal' });
    expect(rest).toEqual([]);
    expect(message).toContain('detail');
    expect(message).toContain('simplified, full');
  });

  test('detail full is valid and resolves', () => {
    expect(errors({ detail: 'full' })).toEqual([]);
    expect(resolveConfig({ detail: 'full' }).detail).toBe('full');
  });

  test('invalid option value names the option and its allowed values', () => {
    const [message, ...rest] = errors({ model: 'D' });
    expect(rest).toEqual([]);
    expect(message).toContain('model');
    expect(message).toContain('B, C');
  });

  test.each([
    ['source', 'sea', 'air, ground, hybrid'],
    ['dhw', 'tank', 'external, internal, none'],
  ])('invalid %s', (option, value, allowed) => {
    const [message] = errors({ [option]: value });
    expect(message).toContain(option);
    expect(message).toContain(allowed);
  });

  test.each([0, 5, 2.5, '4', true])('invalid variant %s', (variant) => {
    const [message] = errors({ variant });
    expect(message).toContain('variant');
  });

  test.each([1, 2, 3, 4])('valid variant %s', (variant) => {
    expect(errors({ variant })).toEqual([]);
  });

  test('unknown option names it', () => {
    const [message, ...rest] = errors({ colour: 'red' });
    expect(rest).toEqual([]);
    expect(message).toContain('colour');
  });

  test('the type, the colors option and the keys Home Assistant adds are known', () => {
    expect(
      errors({
        colors: [
          { temperature: 0, color: 'blue' },
          { temperature: 50, color: 'red' },
        ],
        view_layout: {},
        grid_options: {},
        layout_options: {},
        visibility: [],
      }),
    ).toEqual([]);
  });

  test('prefix must be an object id prefix; blank counts as left out', () => {
    expect(errors({ prefix: 'Bad Prefix' })[0]).toContain('prefix');
    expect(errors({ prefix: 5 })[0]).toContain('prefix');
    expect(errors({ prefix: '' })).toEqual([]);
    expect(errors({ prefix: null, model: null })).toEqual([]);
  });

  test('a group option that is not a group is an error', () => {
    expect(errors({ features: 'htr' })[0]).toContain('features');
    expect(errors({ entities: ['sensor.x'] })[0]).toContain('entities');
  });
});

describe('DHW default follows the model', () => {
  test('model C without dhw is internal, model B is external', () => {
    expect(resolveConfig({ model: 'C' }).dhw).toBe('internal');
    expect(resolveConfig({ model: 'B' }).dhw).toBe('external');
    expect(defaultDhw('C')).toBe('internal');
  });

  test('model B with dhw internal is an error naming dhw', () => {
    const [message] = errors({ model: 'B', dhw: 'internal' });
    expect(message).toContain('dhw');
  });

  test('model C with dhw external is an error naming dhw', () => {
    expect(errors({ model: 'C', dhw: 'external' })[0]).toContain('dhw');
  });

  test('none fits both models; the matching storage is valid', () => {
    expect(errors({ model: 'B', dhw: 'none' })).toEqual([]);
    expect(errors({ model: 'C', dhw: 'none' })).toEqual([]);
    expect(errors({ model: 'C', dhw: 'internal' })).toEqual([]);
    expect(errors({ model: 'B', dhw: 'external' })).toEqual([]);
  });

  test('an invalid source does not hide a model/dhw mismatch', () => {
    const found = errors({ source: 'sea', model: 'B', dhw: 'internal' });
    expect(found).toHaveLength(2);
    expect(found.some((m) => m.includes('source'))).toBe(true);
    expect(found.some((m) => m.includes('dhw'))).toBe(true);
  });

  test('an invalid model does not also report a mismatch', () => {
    expect(errors({ model: 'D', dhw: 'internal' })).toHaveLength(1);
  });
});

describe('feature states', () => {
  test('unknown feature names it', () => {
    const [message, ...rest] = errors({ features: { solar: true } });
    expect(rest).toEqual([]);
    expect(message).toContain('solar');
  });

  test('true, false and unused are valid; anything else names the feature', () => {
    expect(errors({ features: { htr: true, passive_cooling: false, active_cooling: 'unused' } })).toEqual([]);
    expect(errors({ features: { htr: 'maybe' } })[0]).toContain('htr');
    expect(errors({ features: { htr: 1 } })[0]).toContain('htr');
  });
});

describe('entity roles', () => {
  test('unknown role names its path', () => {
    const [message, ...rest] = errors({ entities: { production: { flow: 'sensor.x' } } });
    expect(rest).toEqual([]);
    expect(message).toContain('production.flow');
  });

  test('a value that is not an entity id names the role', () => {
    const [message, ...rest] = errors({ entities: { dhw: { temperature: 52 } } });
    expect(rest).toEqual([]);
    expect(message).toContain('dhw.temperature');
    expect(errors({ entities: { dhw: { temperature: 'boiler top' } } })[0]).toContain('dhw.temperature');
  });

  test('a valid override and a blank value are accepted', () => {
    expect(errors({ prefix: 'x', entities: { dhw: { temperature: 'sensor.boiler_top', setpoint: null } } })).toEqual(
      [],
    );
  });

  test('a group name alone is not a role', () => {
    expect(errors({ entities: { dhw: 'sensor.x' } })[0]).toContain('dhw');
  });

  test('a null or blank entities group or role counts as left out', () => {
    expect(errors({ entities: { dhw: null } })).toEqual([]);
    expect(errors({ entities: { dhw: { temperature: '' } } })).toEqual([]);
  });
});
