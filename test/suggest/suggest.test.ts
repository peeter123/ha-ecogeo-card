import { describe, expect, test } from 'vitest';
import {
  FIRMWARE_DEVICE_ID,
  FOREIGN_BINDING,
  FOREIGN_DEVICE_ID,
  FOREIGN_NONE,
  firmwareRegistry,
  foreignRegistry,
  namingStates,
} from '../../dev/foreign';
import { SCENARIOS } from '../../dev/scenarios';
import { DIRECTION_WORDS, KEYWORDS } from '../../src/config/keywords';
import { ROLES, ROLE_PATHS, defaultEntityId, type RolePath } from '../../src/config/roles';
import type { HassDevice, HassEntityRegistryEntry, HassEntityState } from '../../src/lib/hass';
import { inferPrefix, suggestEntities, tokens } from '../../src/suggest/suggest';

interface Registry {
  entities: Record<string, HassEntityRegistryEntry>;
  devices: Record<string, HassDevice>;
}
type States = Record<string, HassEntityState>;

const toStates = (readings: ReturnType<typeof namingStates>): States =>
  Object.fromEntries(Object.entries(readings).map(([id, s]) => [id, { entity_id: id, ...s }]));

const flat = (entities: Record<string, unknown>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(entities).flatMap(([group, inner]) =>
      Object.entries(inner as Record<string, string>).map(([name, id]) => [`${group}.${name}`, id]),
    ),
  );

const run = (states: States, registry: Registry, deviceId: string, config: Record<string, unknown> = {}) =>
  suggestEntities({ states, entities: registry.entities, devices: registry.devices, deviceId, config });

const firmware = () => ({
  states: toStates(namingStates('firmware', SCENARIOS.heating.states)),
  registry: firmwareRegistry(),
});
const foreign = () => ({
  states: toStates(namingStates('foreign', SCENARIOS.heating.states)),
  registry: foreignRegistry(),
});

/** A small device of `sensor` entities: [object id, friendly name, unit]. */
function device(items: readonly (readonly [string, string, string | undefined])[], deviceName = 'Heat pump') {
  const states: States = {};
  const entities: Record<string, HassEntityRegistryEntry> = {};
  for (const [id, name, unit] of items) {
    const entityId = `sensor.${id}`;
    states[entityId] = {
      entity_id: entityId,
      state: '12',
      attributes: { friendly_name: name, ...(unit === undefined ? {} : { unit_of_measurement: unit }) },
    };
    entities[entityId] = { entity_id: entityId, device_id: 'dev' };
  }
  return { states, registry: { entities, devices: { dev: { id: 'dev', name: deviceName } } } as Registry };
}

describe('role table additions', () => {
  test('every role accepts domains and has keywords', () => {
    for (const role of ROLES) {
      expect(role.accepts.length, role.path).toBeGreaterThan(0);
      expect(KEYWORDS[role.path].subject.length, role.path).toBeGreaterThan(0);
      expect(KEYWORDS[role.path].role.length, role.path).toBeGreaterThan(0);
    }
    expect(Object.keys(KEYWORDS).sort()).toEqual([...ROLE_PATHS].sort());
  });

  test('accepted domains follow the kind of role', () => {
    const accepts = (path: RolePath) => ROLES.find((r) => r.path === path)?.accepts;
    expect(accepts('production.outlet_temperature')).toEqual(['sensor', 'number', 'input_number']);
    expect(accepts('production.pump')).toContain('switch');
    expect(accepts('compressor.speed')).toContain('input_boolean');
    expect(accepts('unit.alarm')).toEqual(['binary_sensor', 'switch', 'input_boolean', 'sensor']);
    expect(accepts('compressor.mode')).toContain('select');
  });

  test('the paired probes have a direction', () => {
    const directions = Object.fromEntries(ROLES.flatMap((r) => ('direction' in r ? [[r.item, r.direction]] : [])));
    expect(directions).toEqual({
      '29': 'in',
      '30': 'out',
      '31': 'out',
      '32': 'in',
      '33': 'out',
      '34': 'in',
      '35': 'in',
      '36': 'out',
    });
  });

  test('keywords cover English, Dutch, Spanish and German', () => {
    const all = Object.values(KEYWORDS).flatMap((k) => [...k.subject, ...k.role]);
    for (const word of [
      'brine',
      'bron',
      'captacion',
      'sole',
      'druk',
      'presion',
      'druck',
      'temperatuur',
      'temperatura',
    ]) {
      expect(all, word).toContain(word);
    }
    for (const word of ['return', 'retour', 'entrada', 'ruecklauf', 'supply', 'aanvoer', 'salida', 'vorlauf']) {
      expect([...DIRECTION_WORDS.in, ...DIRECTION_WORDS.out], word).toContain(word);
    }
  });
});

describe('helpers', () => {
  test('prefix is the common start cut after the last underscore', () => {
    expect(inferPrefix(['hp_a_production_out', 'hp_a_brine_in'])).toBe('hp_a_');
    expect(inferPrefix(['wp_1', 'wp_diag_1'])).toBe('wp_');
    expect(inferPrefix(['one', 'two'])).toBe('');
  });

  test('tokens are folded and split on non-letters', () => {
    expect(tokens('Rücklauf-Temperatur 2')).toEqual(['rucklauf', 'temperatur']);
  });
});

describe('suggestions', () => {
  test('firmware device: every role bound to its firmware entity', () => {
    const { states, registry } = firmware();
    const result = run(states, registry, FIRMWARE_DEVICE_ID);
    const expected = Object.fromEntries(ROLES.map((r) => [r.path, defaultEntityId(r, 'demo_ecogeo')]));
    expect(flat(result.entities)).toEqual(expected);
    expect(result.report.filled).toHaveLength(ROLES.length);
    expect(result.report.empty).toEqual([]);
  });

  test('Renamed device', () => {
    const { states, registry } = device(
      ROLES.map((r) => [`hp_basement_${r.suffix}`, r.suffix, 'unit' in r ? r.unit : undefined]),
    );
    const result = run(states, registry, 'dev');
    expect(flat(result.entities)['production.outlet_temperature']).toBe('sensor.hp_basement_production_out');
  });

  test('foreign device: every role bound as the fixture intends, none roles empty, extras untouched', () => {
    const { states, registry } = foreign();
    const result = run(states, registry, FOREIGN_DEVICE_ID);
    expect(flat(result.entities)).toEqual(FOREIGN_BINDING);
    expect([...result.report.empty].sort()).toEqual([...FOREIGN_NONE].sort());
    expect(Object.values(flat(result.entities))).not.toContain('sensor.wp_diag_1');
    expect(Object.values(flat(result.entities))).not.toContain('sensor.wp_diag_2');
  });

  test('Foreign names', () => {
    const { states, registry } = device([
      ['knx_1_2_3', 'Brine outlet temperature', '°C'],
      ['knx_1_2_4', 'Brine inlet temperature', '°C'],
    ]);
    const bound = flat(run(states, registry, 'dev').entities);
    expect(bound['brine.outlet_temperature']).toBe('sensor.knx_1_2_3');
    expect(bound['brine.inlet_temperature']).toBe('sensor.knx_1_2_4');
  });

  test('Unit must fit', () => {
    const { states, registry } = device([['knx_1', 'Production pressure', '%']]);
    const result = run(states, registry, 'dev');
    expect(flat(result.entities)['production.pressure']).toBeUndefined();
    expect(result.report.empty).toContain('production.pressure');
  });

  test('pressure in kPa fits', () => {
    const { states, registry } = device([['knx_1', 'Production pressure', 'kPa']]);
    expect(flat(run(states, registry, 'dev').entities)['production.pressure']).toBe('sensor.knx_1');
  });

  test('Tie left empty', () => {
    const { states, registry } = device([
      ['knx_1', 'Production supply temperature', '°C'],
      ['knx_2', 'Production supply temperature', '°C'],
    ]);
    const result = run(states, registry, 'dev');
    expect(flat(result.entities)['production.outlet_temperature']).toBeUndefined();
    expect(result.report.empty).toContain('production.outlet_temperature');
  });

  test('the opposite direction excludes a candidate', () => {
    const { states, registry } = device([['knx_1', 'Brine inlet temperature', '°C']]);
    expect(flat(run(states, registry, 'dev').entities)['brine.outlet_temperature']).toBeUndefined();
  });

  test('a weak match stays empty', () => {
    const { states, registry } = device([['knx_1', 'Supply temperature', '°C']]);
    expect(run(states, registry, 'dev').report.filled).toEqual([]);
  });

  test('a setpoint is not a measurement, and a setpoint role needs one', () => {
    const { states, registry } = device([
      ['knx_1', 'Tapwater gewenste temperatuur', '°C'],
      ['knx_2', 'Tapwater temperatuur', '°C'],
    ]);
    const bound = flat(run(states, registry, 'dev').entities);
    expect(bound['dhw.setpoint']).toBe('sensor.knx_1');
    expect(bound['dhw.temperature']).toBe('sensor.knx_2');
  });

  test('Own choice kept', () => {
    const { states, registry } = firmware();
    states['sensor.boiler_top'] = { entity_id: 'sensor.boiler_top', state: '50', attributes: {} };
    const config = { entities: { dhw: { temperature: 'sensor.boiler_top' } } };
    const result = run(states, registry, FIRMWARE_DEVICE_ID, config);
    const bound = flat(result.entities);
    expect(bound['dhw.temperature']).toBe('sensor.boiler_top');
    expect(result.report.filled).not.toContain('dhw.temperature');
    expect(result.report.empty).not.toContain('dhw.temperature');
  });

  test('none roles are untouched and not reported empty', () => {
    const { states, registry } = firmware();
    const result = run(states, registry, FIRMWARE_DEVICE_ID, { entities: { source: { fan_speed: 'none' } } });
    expect(flat(result.entities)['source.fan_speed']).toBe('none');
    expect(result.report.filled).not.toContain('source.fan_speed');
    expect(result.report.empty).not.toContain('source.fan_speed');
  });

  test('Broken binding replaced', () => {
    const { states, registry } = firmware();
    const config = { entities: { brine: { inlet_temperature: 'sensor.old_name' } } };
    const result = run(states, registry, FIRMWARE_DEVICE_ID, config);
    expect(flat(result.entities)['brine.inlet_temperature']).toBe('sensor.demo_ecogeo_brine_in');
  });

  test('each entity is used for one role at most', () => {
    for (const { states, registry, id } of [
      { ...firmware(), id: FIRMWARE_DEVICE_ID },
      { ...foreign(), id: FOREIGN_DEVICE_ID },
    ]) {
      const ids = Object.values(flat(run(states, registry, id).entities));
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  test('an entity bound by a kept role is not offered to another', () => {
    const { states, registry } = firmware();
    const config = { entities: { brine: { inlet_temperature: 'sensor.demo_ecogeo_brine_out' } } };
    const bound = flat(run(states, registry, FIRMWARE_DEVICE_ID, config).entities);
    expect(Object.values(bound).filter((id) => id === 'sensor.demo_ecogeo_brine_out')).toHaveLength(1);
  });

  test('the config is merged and not changed', () => {
    const { states, registry } = firmware();
    const config = { entities: { dhw: { temperature: 'sensor.old' } }, prefix: 'x' };
    const before = JSON.stringify(config);
    const result = run(states, registry, FIRMWARE_DEVICE_ID, config);
    expect(JSON.stringify(config)).toBe(before);
    expect(flat(result.entities)['dhw.temperature']).toBe('sensor.demo_ecogeo_dhw_temperature');
  });

  test('Report', () => {
    const { states, registry } = foreign();
    const result = run(states, registry, FOREIGN_DEVICE_ID);
    expect(result.report.filled).toHaveLength(ROLES.length - FOREIGN_NONE.length);
    expect(result.report.empty).toEqual(expect.arrayContaining([...FOREIGN_NONE]));
    expect(result.report.empty).toHaveLength(FOREIGN_NONE.length);
  });
});

describe('group 4 review', () => {
  const bound = (items: Parameters<typeof device>[0], config: Record<string, unknown> = {}, name?: string) => {
    const { states, registry } = device(items, name);
    return flat(run(states, registry, 'dev', config).entities);
  };

  test('a counter with a unit is not a mode', () => {
    const result = bound([
      ['knx_1', 'Compressor operating hours', 'h'],
      ['knx_2', 'Compressor operation mode', undefined],
    ]);
    expect(result['compressor.mode']).toBe('sensor.knx_2');
    expect(Object.values(result)).not.toContain('sensor.knx_1');
  });

  test('heating circuit words bind the production roles', () => {
    expect(
      bound([
        ['a_1', 'Heating flow temperature', '°C'],
        ['a_2', 'Heating return temperature', '°C'],
      ]),
    ).toMatchObject({ 'production.outlet_temperature': 'sensor.a_1', 'production.return_temperature': 'sensor.a_2' });
    expect(
      bound([
        ['a_1', 'Heizkreis Vorlauftemperatur', '°C'],
        ['a_2', 'Heizkreis Rücklauftemperatur', '°C'],
      ]),
    ).toMatchObject({ 'production.outlet_temperature': 'sensor.a_1', 'production.return_temperature': 'sensor.a_2' });
    expect(bound([['a_1', 'Verwarming aanvoertemperatuur', '°C']])['production.outlet_temperature']).toBe('sensor.a_1');
    expect(bound([['a_1', 'Heating pump', '%']])['production.pump']).toBe('sensor.a_1');
  });

  test('a paired role needs a direction word', () => {
    const result = bound([['knx_1', 'Brine temperature', '°C']]);
    expect(result['brine.outlet_temperature']).toBeUndefined();
    expect(result['brine.inlet_temperature']).toBeUndefined();
  });

  test('suction and discharge words carry a direction', () => {
    const result = bound([
      ['a_1', 'Zuiggastemperatuur', '°C'],
      ['a_2', 'Persgastemperatuur', '°C'],
    ]);
    expect(result).toMatchObject({
      'compressor.suction_temperature': 'sensor.a_1',
      'compressor.discharge_temperature': 'sensor.a_2',
    });
  });

  test('Prefix binding kept', () => {
    const a = firmware();
    const b = foreign();
    const states = { ...a.states, ...b.states };
    const registry = {
      entities: { ...a.registry.entities, ...b.registry.entities },
      devices: { ...a.registry.devices, ...b.registry.devices },
    };
    const result = run(states, registry, FOREIGN_DEVICE_ID, { prefix: 'demo_ecogeo' });
    expect(flat(result.entities)).toEqual({});
    expect(result.report.filled).toEqual([]);
  });

  test('a prefix that resolves to nothing leaves the roles open', () => {
    const { states, registry } = foreign();
    const result = run(states, registry, FOREIGN_DEVICE_ID, { prefix: 'nothing_here' });
    expect(flat(result.entities)).toEqual(FOREIGN_BINDING);
  });

  test('Tie left empty, with a control', () => {
    const one = bound([['knx_1', 'Production supply temperature', '°C']]);
    expect(one['production.outlet_temperature']).toBe('sensor.knx_1');
    const two = bound([
      ['knx_1', 'Production supply temperature', '°C'],
      ['knx_2', 'Production supply temperature', '°C'],
    ]);
    expect(two['production.outlet_temperature']).toBeUndefined();
  });

  test('Weak match left empty', () => {
    expect(bound([['knx_1', 'Supply temperature', '°C']])['production.outlet_temperature']).toBeUndefined();
  });

  test('a buffer tank is not the hot water', () => {
    expect(bound([['knx_1', 'Buffer tank temperature', '°C']])['dhw.temperature']).toBeUndefined();
  });

  test('a set temperature is the setpoint', () => {
    for (const [setName, realName] of [
      ['DHW set temperature', 'DHW temperature'],
      ['Ingestelde tapwatertemperatuur', 'Tapwatertemperatuur'],
    ] as const) {
      const result = bound([
        ['knx_1', setName, '°C'],
        ['knx_2', realName, '°C'],
      ]);
      expect(result['dhw.setpoint'], setName).toBe('sensor.knx_1');
      expect(result['dhw.temperature'], setName).toBe('sensor.knx_2');
    }
  });

  test('an indoor unit is not the air unit', () => {
    expect(
      bound([['knx_1', 'Indoor unit outlet temperature', '°C']])['source.air_unit_outlet_temperature'],
    ).toBeUndefined();
  });

  test('the device name is stripped from the friendly name', () => {
    const result = bound([['knx_1', 'Warmtepomp Productie modulatie', '%']], {}, 'Warmtepomp');
    expect(result['production.pump']).toBeUndefined();
  });

  test('the tie check ignores an entity taken by a stronger role', () => {
    const result = bound([
      ['x_brine_out', 'Production supply temperature', '°C'],
      ['x_1', 'Production supply temperature', '°C'],
    ]);
    expect(result['brine.outlet_temperature']).toBe('sensor.x_brine_out');
    expect(result['production.outlet_temperature']).toBe('sensor.x_1');
  });

  test('a binary role takes a suffix match only from an on/off domain', () => {
    const { states, registry } = device([['x_wifi_status', 'Wifi status', undefined]]);
    expect(flat(run(states, registry, 'dev').entities)['unit.connection']).toBeUndefined();
  });
});

describe('return flow', () => {
  const bound = (items: Parameters<typeof device>[0]) => {
    const { states, registry } = device(items);
    return flat(run(states, registry, 'dev').entities);
  };

  test('flow and return flow bind outlet and return', () => {
    expect(
      bound([
        ['a_1', 'Heating flow temperature', '°C'],
        ['a_2', 'Heating return flow temperature', '°C'],
      ]),
    ).toMatchObject({ 'production.outlet_temperature': 'sensor.a_1', 'production.return_temperature': 'sensor.a_2' });
  });

  test('a lone brine return flow is the inlet', () => {
    const result = bound([['a_1', 'Brine return flow temperature', '°C']]);
    expect(result['brine.inlet_temperature']).toBe('sensor.a_1');
    expect(result['brine.outlet_temperature']).toBeUndefined();
  });
});

describe('inflow', () => {
  test('an inflow is an inlet', () => {
    const { states, registry } = device([['a_1', 'Inflow temperature brine', '°C']]);
    const bound = flat(run(states, registry, 'dev').entities);
    expect(bound['brine.inlet_temperature']).toBe('sensor.a_1');
    expect(bound['brine.outlet_temperature']).toBeUndefined();
  });
});
