import { describe, expect, test } from 'vitest';
import { deriveMode } from '../../src/calc/mode';
import { readRoles } from '../../src/calc/readings';
import { statesOf } from '../../src/config/options';
import { resolveConfig } from '../../src/config/resolve';
import { OPTIONAL_ROLE_PATHS, ROLE_PATHS } from '../../src/config/roles';
import { mergeFeatures } from '../../src/config/variants';
import {
  FOREIGN_BINDING,
  FOREIGN_EMPTY,
  FOREIGN_NONE,
  FOREIGN_UNBOUND,
  firmwareRegistry,
  foreignEntitiesConfig,
  foreignRegistry,
  foreignStates,
  namingStates,
} from '../../dev/foreign';
import { SCENARIO_NAMES, SCENARIOS, scenarioStates } from '../../dev/scenarios';
import { configOf, defaultState } from '../../dev/url-state';

const features = mergeFeatures(4, {});

function readings(naming: 'firmware' | 'foreign', name: (typeof SCENARIO_NAMES)[number]) {
  const config = configOf({ ...defaultState(), naming });
  const resolved = resolveConfig(config);
  const states = namingStates(naming, SCENARIOS[name].states);
  const read = readRoles(
    Object.fromEntries(Object.entries(states).map(([id, s]) => [id, { entity_id: id, ...s }])),
    resolved.entities,
  );
  return { read, mode: deriveMode(read, features, statesOf(config)) };
}

describe('foreign naming mock', () => {
  test.each(SCENARIO_NAMES)('%s derives the same mode as the firmware naming', (name) => {
    expect(readings('foreign', name).mode).toBe(SCENARIOS[name].mode);
    expect(readings('foreign', name).mode).toBe(readings('firmware', name).mode);
  });

  test('every role is bound, `none` or an unbound optional role, ids are not firmware ids, and the none roles have no entity', () => {
    for (const path of ROLE_PATHS) {
      const bound = FOREIGN_BINDING[path];
      expect(bound === undefined, path).toBe(FOREIGN_EMPTY.includes(path));
      if (bound !== undefined) expect(bound, path).toMatch(/^(sensor|binary_sensor|number|switch)\.wp_\d+$/);
    }
    expect(new Set(Object.values(FOREIGN_BINDING)).size).toBe(Object.keys(FOREIGN_BINDING).length);
  });

  // dev-emulator "Foreign naming leaves optional roles unbound" (the rule moved out of "Foreign naming")
  test('add-htr-state "Foreign naming": no optional role is bound or written, and unit.cop is bound', () => {
    for (const path of OPTIONAL_ROLE_PATHS) {
      expect(FOREIGN_BINDING[path], path).toBeUndefined();
      expect(FOREIGN_NONE, path).not.toContain(path);
    }
    expect(FOREIGN_UNBOUND).toEqual(OPTIONAL_ROLE_PATHS);
    expect(FOREIGN_BINDING['unit.cop']).toBe('sensor.wp_35');
    expect(FOREIGN_NONE).not.toContain('unit.cop');
    const entities = foreignEntitiesConfig();
    const flat = Object.fromEntries(
      Object.entries(entities).flatMap(([group, roles]) =>
        Object.entries(roles).map(([name, id]) => [`${group}.${name}`, id]),
      ),
    );
    for (const path of OPTIONAL_ROLE_PATHS) expect(flat, path).not.toHaveProperty(path);
    expect(flat['unit.cop']).toBe(FOREIGN_BINDING['unit.cop']);
    expect(flat['source.fan_speed']).toBe('none');
  });

  test('the foreign COP entity carries the scenario register COP, in Dutch', () => {
    const cop = foreignStates(SCENARIOS.heating.states)[FOREIGN_BINDING['unit.cop'] ?? ''];
    expect(cop?.state).toBe(SCENARIOS.heating.states['unit.cop']);
    expect(cop?.attributes.friendly_name).toMatch(/[Rr]endement/);
  });

  test('values are converted: kPa, Hz, an enum mode and a switch', () => {
    const heating = foreignStates(SCENARIOS.heating.states);
    const firmware = scenarioStates(SCENARIOS.heating.states);
    const pressure = heating[FOREIGN_BINDING['compressor.discharge_pressure'] ?? ''];
    expect(pressure?.attributes.unit_of_measurement).toBe('kPa');
    expect(Number(pressure?.state)).toBeCloseTo(
      Number(firmware['sensor.demo_ecogeo_compressor_discharge_pressure']?.state) * 100,
    );
    const speed = heating[FOREIGN_BINDING['compressor.speed'] ?? ''];
    expect(speed?.attributes.unit_of_measurement).toBe('Hz');
    const mode = heating[FOREIGN_BINDING['compressor.mode'] ?? ''];
    expect(mode?.attributes['options']).toEqual(['Uit', 'Verwarmen', 'Tapwater', 'Ontdooien']);
    expect(mode?.attributes['device_class']).toBe('enum');
    expect(mode?.state).toBe('Verwarmen');
    expect(FOREIGN_BINDING['unit.on_off']).toMatch(/^switch\./);
    expect(foreignStates(SCENARIOS.dhw.states)[FOREIGN_BINDING['compressor.mode'] ?? '']?.state).toBe('Tapwater');
    expect(foreignStates(SCENARIOS.defrost.states)[FOREIGN_BINDING['compressor.mode'] ?? '']?.state).toBe('Ontdooien');
    expect(foreignStates(SCENARIOS.off.states)[FOREIGN_BINDING['unit.on_off'] ?? '']?.state).toBe('off');
  });

  test('the registries have one device per naming; the foreign one has unrelated entities no role binds', () => {
    const foreign = foreignRegistry();
    const firmware = firmwareRegistry();
    expect(Object.keys(foreign.devices)).toHaveLength(1);
    expect(Object.keys(firmware.devices)).toHaveLength(1);
    const bound = new Set(Object.values(FOREIGN_BINDING));
    const unrelated = Object.keys(foreign.entities).filter((id) => !bound.has(id));
    expect(unrelated.length).toBeGreaterThanOrEqual(1);
    for (const id of Object.keys(foreignStates(SCENARIOS.heating.states)))
      expect(foreign.entities[id], id).toBeDefined();
    for (const id of Object.keys(scenarioStates(SCENARIOS.heating.states)))
      expect(firmware.entities[id], id).toBeDefined();
    expect(Object.values(foreign.entities).every((e) => e.platform === 'knx')).toBe(true);
    expect(Object.values(firmware.entities).every((e) => e.platform === 'esphome')).toBe(true);
  });

  test('the none roles read no value on the foreign naming', () => {
    const { read } = readings('foreign', 'heating');
    for (const path of FOREIGN_EMPTY) expect(read[path], path).toBeUndefined();
  });
});
