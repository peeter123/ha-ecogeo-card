import { describe, expect, test } from 'vitest';
import { entityLeaves, setsAnyEntity } from '../../src/config/options';
import { isSampleMode, resolveConfig, resolveEntities } from '../../src/config/resolve';
import { ROLE_PATHS } from '../../src/config/roles';
import { SAMPLE_ENTITIES } from '../../src/config/sample';

describe('entity defaults from the prefix', () => {
  test('prefix only: the production outlet probe', () => {
    const resolved = resolveConfig({ prefix: 'demo_ecogeo' });
    expect(resolved.entities['production.outlet_temperature']).toBe('sensor.demo_ecogeo_production_out');
    expect(resolved.entities['dhw.demand']).toBe('binary_sensor.demo_ecogeo_dhw_demand');
    expect(resolved.entities['dhw.setpoint']).toBe('number.demo_ecogeo_dhw_setpoint');
    expect(resolved.sample).toBe(false);
  });

  test('the documented firmware default prefix', () => {
    expect(resolveConfig({ prefix: 'ecoforest_ecogeo' }).entities['production.outlet_temperature']).toBe(
      'sensor.ecoforest_ecogeo_production_out',
    );
  });

  test('every role resolves to an id of its domain and suffix', () => {
    const entities = resolveEntities({}, 'p');
    for (const role of ROLE_PATHS) expect(entities[role]).toMatch(/^(sensor|binary_sensor|number)\.p_[a-z0-9_]+$/);
  });

  test('a default entity that does not exist is not a configuration problem', () => {
    // resolution only builds ids; a role whose entity does not exist reads as no value (readings tests)
    expect(resolveConfig({ prefix: 'nothing_here' }).entities['unit.cop']).toBe('sensor.nothing_here_cop');
  });
});

describe('per-role overrides', () => {
  test('override one role, every other keeps its prefix default', () => {
    const resolved = resolveConfig({
      prefix: 'demo_ecogeo',
      entities: { dhw: { temperature: ' sensor.boiler_top ' } },
    });
    expect(resolved.entities['dhw.temperature']).toBe('sensor.boiler_top');
    expect(resolved.entities['dhw.setpoint']).toBe('number.demo_ecogeo_dhw_setpoint');
  });

  test('without a prefix a role without override has no entity', () => {
    const resolved = resolveConfig({ entities: { dhw: { temperature: 'sensor.boiler_top' } } });
    expect(resolved.entities['dhw.temperature']).toBe('sensor.boiler_top');
    expect(resolved.entities['dhw.setpoint']).toBeUndefined();
  });
});

describe('roles not present (none)', () => {
  const config = { prefix: 'ecoforest_ecogeo', entities: { source: { fan_speed: 'none' } } };

  test('Fan speed not present: no entity, no prefix default, the other roles keep theirs', () => {
    const resolved = resolveConfig(config);
    expect(resolved.entities['source.fan_speed']).toBeUndefined();
    expect(resolved.notPresent).toEqual(new Set(['source.fan_speed']));
    expect(resolved.entities['unit.cop']).toBe('sensor.ecoforest_ecogeo_cop');
    expect(resolved.sample).toBe(false);
  });

  test('None is not a sample config: it is an entity setting', () => {
    const config = { entities: { unit: { cop: 'none' } } };
    expect(isSampleMode(config)).toBe(false);
    const resolved = resolveConfig(config);
    expect(resolved.sample).toBe(false);
    expect(resolved.entities['unit.cop']).toBeUndefined();
    expect(resolved.entities['production.outlet_temperature']).toBeUndefined();
  });

  test('without none nothing is not present', () => {
    expect(resolveConfig({ prefix: 'p' }).notPresent.size).toBe(0);
    expect(resolveConfig({}).notPresent.size).toBe(0);
  });
});

describe('sample mode detection', () => {
  test('neither prefix nor entities: sample', () => {
    expect(isSampleMode({})).toBe(true);
    expect(isSampleMode({ type: 'custom:ecogeo-card', model: 'C', features: { htr: false } })).toBe(true);
    expect(isSampleMode({ prefix: '', entities: {} })).toBe(true);
    expect(isSampleMode({ entities: { dhw: { temperature: null } } })).toBe(true);
    expect(resolveConfig({}).entities).toEqual(SAMPLE_ENTITIES);
  });

  test('a prefix or any entity ends it', () => {
    expect(isSampleMode({ prefix: 'x' })).toBe(false);
    expect(isSampleMode({ entities: { unit: { cop: 'sensor.cop' } } })).toBe(false);
  });

  test('entityLeaves and setsAnyEntity walk nested groups', () => {
    expect(entityLeaves({ a: { b: 'x', c: { d: 1 } }, e: 'y' })).toEqual([
      ['a.b', 'x'],
      ['a.c.d', 1],
      ['e', 'y'],
    ]);
    expect(setsAnyEntity({ entities: { a: { b: 'x' } } })).toBe(true);
    expect(setsAnyEntity({})).toBe(false);
  });
});
