import { describe, expect, test } from 'vitest';
import { readRoles } from '../../src/calc/readings';
import { resolveConfig } from '../../src/config/resolve';
import { deriveMode } from '../../src/calc/mode';
import { variantFeatures } from '../../src/config/variants';
import { states } from '../helpers';

const entities = resolveConfig({ prefix: 'demo_ecogeo' }).entities;
const id = (role: keyof typeof entities): string => entities[role] ?? '';
const read = (...entries: readonly (readonly [string, string, string?])[]) => readRoles(states(...entries), entities);

describe('numbers', () => {
  test('plain number, percent, bar and rpm', () => {
    const r = read(
      [id('production.pump'), '99.9', '%'],
      [id('production.pressure'), '1.2', 'bar'],
      [id('compressor.speed'), '2803', 'RPM'],
    );
    expect(r['production.pump']).toBe(99.9);
    expect(r['production.pressure']).toBe(1.2);
    expect(r['compressor.speed']).toBe(2803);
  });

  test('a unitless role (cop) reads without a unit', () => {
    expect(read([id('unit.cop'), '6.0'])['unit.cop']).toBe(6);
  });

  test('temperature in Fahrenheit converts to Celsius', () => {
    const r = read([id('production.outlet_temperature'), '77', '°F']);
    expect(r['production.outlet_temperature']).toBeCloseTo(25, 6);
  });

  test('power in kW converts to W', () => {
    expect(read([id('compressor.power'), '0.786', 'kW'])['compressor.power']).toBeCloseTo(786, 6);
  });

  test('a difference in Fahrenheit converts back to K', () => {
    expect(read([id('refrigerant.superheat'), '43.2', '°F'])['refrigerant.superheat']).toBeCloseTo(6.2, 1);
    expect(read([id('refrigerant.superheat'), '6.2', '°C'])['refrigerant.superheat']).toBeCloseTo(6.2, 6);
  });

  test('a temperature in an unsupported unit has no value', () => {
    expect(
      read([id('production.outlet_temperature'), '25', 'bananas'])['production.outlet_temperature'],
    ).toBeUndefined();
  });
});

describe('no value', () => {
  test.each(['unavailable', 'unknown', 'n/a', '', 'abc'])('state "%s" is no value', (value) => {
    const r = read([id('brine.pump'), value, '%'], [id('production.outlet_temperature'), value, '°C']);
    expect(r['brine.pump']).toBeUndefined();
    expect(r['production.outlet_temperature']).toBeUndefined();
  });

  test('the firmware sentinel is no value', () => {
    const r = read([id('brine.inlet_temperature'), '-999.900024414062', '°C']);
    expect(r['brine.inlet_temperature']).toBeUndefined();
  });

  test('a role without an entity, or an entity Home Assistant does not know, has no value', () => {
    const r = readRoles({}, { ...entities, 'dhw.temperature': undefined });
    expect(r['dhw.temperature']).toBeUndefined();
    expect(r['unit.cop']).toBeUndefined();
  });
});

describe('text and binary inputs', () => {
  test('text roles give the trimmed state; unavailable and unknown are no value', () => {
    expect(read([id('compressor.mode'), ' Balance '])['compressor.mode']).toBe('Balance');
    expect(read([id('unit.on_off'), 'EMERGENCY'])['unit.on_off']).toBe('EMERGENCY');
    expect(read([id('unit.on_off'), 'unavailable'])['unit.on_off']).toBeUndefined();
    expect(read([id('unit.on_off'), 'unknown'])['unit.on_off']).toBeUndefined();
  });

  test('binary roles: on is true, off is false, anything else is no value', () => {
    const r = read([id('dhw.demand'), 'on'], [id('unit.summer'), 'off'], [id('unit.winter'), 'unavailable']);
    expect(r['dhw.demand']).toBe(true);
    expect(r['unit.summer']).toBe(false);
    expect(r['unit.winter']).toBeUndefined();
    expect(read([id('unit.alarm'), 'ON'])['unit.alarm']).toBe(true);
  });
});

describe('unavailable text states, any case', () => {
  test.each(['Unavailable', 'UNKNOWN', 'unavailable'])('text role with state %s is no value', (value) => {
    expect(read([id('unit.on_off'), value])['unit.on_off']).toBeUndefined();
    expect(read([id('compressor.mode'), value])['compressor.mode']).toBeUndefined();
  });
});

describe('every input unavailable', () => {
  test('through the full read path the mode is standby', () => {
    const all = Object.values(entities).map((entityId) => [entityId ?? '', 'unavailable'] as const);
    const r = readRoles(states(...all), entities);
    expect(deriveMode(r, variantFeatures(4))).toBe('standby');
  });
});
