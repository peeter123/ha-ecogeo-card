import { describe, expect, test } from 'vitest';
import { absentOptionalRoles, readRoles } from '../../src/calc/readings';
import { SAMPLE_STATES } from '../../src/config/sample';
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

describe('on/off states from any domain', () => {
  const bound = (role: keyof typeof entities, entityId: string, value: string, unit?: string) =>
    readRoles(states([entityId, value, unit]), { ...entities, [role]: entityId });

  test.each([
    ['on', true],
    ['TRUE', true],
    [' Yes ', true],
    ['1', true],
    ['off', false],
    ['False', false],
    ['no', false],
    ['0', false],
  ])('demand as a number or text: "%s" is %s', (value, expected) => {
    expect(bound('dhw.demand', 'sensor.demand_code', value)['dhw.demand']).toBe(expected);
  });

  test.each(['2', 'unavailable', 'maybe', ''])('"%s" on a binary role is no value', (value) => {
    expect(bound('dhw.demand', 'sensor.demand_code', value)['dhw.demand']).toBeUndefined();
  });

  test('summer from a switch', () => {
    expect(bound('unit.summer', 'switch.summer_mode', 'on')['unit.summer']).toBe(true);
  });

  test('pump as on/off', () => {
    expect(bound('production.pump', 'binary_sensor.pump', 'on')['production.pump']).toBe(true);
    expect(bound('brine.pump', 'input_boolean.pump', 'off')['brine.pump']).toBe(false);
  });

  test('the compressor speed from an on/off entity', () => {
    expect(bound('compressor.speed', 'switch.compressor', 'on')['compressor.speed']).toBe(true);
  });

  test('on/off and compressor mode roles bound to on/off entities give booleans', () => {
    expect(bound('unit.on_off', 'switch.heat_pump', 'off')['unit.on_off']).toBe(false);
    expect(bound('compressor.mode', 'binary_sensor.defrost', 'on')['compressor.mode']).toBe(true);
    expect(bound('compressor.mode', 'binary_sensor.defrost', 'unavailable')['compressor.mode']).toBeUndefined();
  });

  test('a sensor reading 1 on a text role stays text', () => {
    expect(bound('compressor.mode', 'sensor.mode_code', '1')['compressor.mode']).toBe('1');
    expect(bound('unit.on_off', 'sensor.state_code', '0')['unit.on_off']).toBe('0');
  });

  test('a role that takes no on/off entity does not read one as a number', () => {
    expect(bound('production.outlet_temperature', 'switch.x', 'on')['production.outlet_temperature']).toBeUndefined();
  });
});

describe('pressure units', () => {
  test('kPa converts to bar', () => {
    expect(read([id('production.pressure'), '150', 'kPa'])['production.pressure']).toBeCloseTo(1.5, 6);
  });

  test('an unconvertible or missing pressure unit keeps the entity number', () => {
    expect(read([id('production.pressure'), '2.2', 'atm'])['production.pressure']).toBe(2.2);
    expect(read([id('production.pressure'), '2.2'])['production.pressure']).toBe(2.2);
  });
});

describe('optional roles without an entity (add-htr-state D3)', () => {
  const absent = (
    config: Parameters<typeof resolveConfig>[0],
    ...entries: readonly (readonly [string, string, string?])[]
  ) => {
    const resolved = resolveConfig(config);
    return absentOptionalRoles(states(...entries), resolved.entities, resolved.defaulted);
  };
  const dg1 = 'sensor.demo_ecogeo_heating_power_dg1';

  test('Older firmware: the default entities are not in hass.states', () => {
    expect([...absent({ prefix: 'demo_ecogeo' })].sort()).toEqual(
      ['dhw.power', 'heating.power', 'htr.active', 'htr.power', 'unit.system_cop'].sort(),
    );
  });

  test('the default entity exists: the role has an entity', () => {
    expect(absent({ prefix: 'demo_ecogeo' }, [dg1, '4000', 'W']).has('heating.power')).toBe(false);
  });

  test('Set to none: no entity even when the default exists', () => {
    const config = { prefix: 'demo_ecogeo', entities: { unit: { system_cop: 'none' } } };
    expect(absent(config, ['sensor.demo_ecogeo_system_cop_display', '5.1']).has('unit.system_cop')).toBe(true);
  });

  test('Explicit entity that does not exist: kept, no fallback, reads no value', () => {
    const config = { prefix: 'demo_ecogeo', entities: { heating: { power: 'sensor.typo' } } };
    expect(absent(config).has('heating.power')).toBe(false);
    expect(readRoles(states(), resolveConfig(config).entities)['heating.power']).toBeUndefined();
  });

  test('Default entity unavailable: kept, reads no value', () => {
    const config = { prefix: 'demo_ecogeo' };
    const id = 'sensor.demo_ecogeo_heating_power_dhw';
    expect(absent(config, [id, 'unavailable']).has('dhw.power')).toBe(false);
    expect(absent(config, [id, 'unknown']).has('dhw.power')).toBe(false);
    expect(readRoles(states([id, 'unavailable']), resolveConfig(config).entities)['dhw.power']).toBeUndefined();
  });

  test('No prefix: an unset optional role has no entity, a set one keeps it', () => {
    const roles = absent({ entities: { heating: { power: 'sensor.mine' } } });
    expect(roles.has('htr.power')).toBe(true);
    expect(roles.has('heating.power')).toBe(false);
  });

  test('sample mode: no optional role is absent', () => {
    const resolved = resolveConfig({ type: 'custom:ecogeo-card' });
    expect(absentOptionalRoles(SAMPLE_STATES, resolved.entities, resolved.defaulted).size).toBe(0);
  });
});
