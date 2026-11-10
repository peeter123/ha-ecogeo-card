import { describe, expect, test } from 'vitest';
import { deriveMode } from '../../src/calc/mode';
import { readRoles } from '../../src/calc/readings';
import { resolveConfig } from '../../src/config/resolve';
import { ROLE_PATHS } from '../../src/config/roles';
import { SAMPLE_STATES, sampleEntityId } from '../../src/config/sample';

describe('sample values for an empty config', () => {
  const resolved = resolveConfig({ type: 'custom:ecogeo-card' });

  test('every role has a sample entity and a sample state', () => {
    expect(resolved.sample).toBe(true);
    for (const role of ROLE_PATHS) {
      const id = resolved.entities[role];
      expect(id).toBe(sampleEntityId(role));
      expect(SAMPLE_STATES[id ?? '']).toBeDefined();
    }
  });

  test('no sample id looks like a real installation entity', () => {
    for (const id of Object.keys(SAMPLE_STATES)) expect(id).toMatch(/^ecogeo_sample\./);
  });

  test('every role reads a value, and the sample is a heating day', () => {
    const readings = readRoles(SAMPLE_STATES, resolved.entities);
    for (const role of ROLE_PATHS) expect(readings[role], role).not.toBeUndefined();
    expect(deriveMode(readings, resolved.features)).toBe('heating');
    expect(readings['compressor.speed']).toBe(2803);
    expect(readings['refrigerant.superheat']).toBe(6.2);
  });
});

describe('no mixing', () => {
  test('one override and no prefix: every other role shows no value, never a sample value', () => {
    const config = resolveConfig({ entities: { dhw: { temperature: 'sensor.boiler_top' } } });
    expect(config.sample).toBe(false);
    const readings = readRoles(SAMPLE_STATES, config.entities);
    for (const role of ROLE_PATHS) expect(readings[role], role).toBeUndefined();
  });

  test('a prefix alone uses no sample value either', () => {
    const config = resolveConfig({ prefix: 'demo_ecogeo' });
    const readings = readRoles(SAMPLE_STATES, config.entities);
    expect(Object.values(readings).every((value) => value === undefined)).toBe(true);
  });
});
