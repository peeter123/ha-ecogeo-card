import { describe, expect, test } from 'vitest';
import { circuitsFor } from '../../src/calc/circuits';
import { deriveMode, isAlarm, isOffline } from '../../src/calc/mode';
import { readRoles } from '../../src/calc/readings';
import { ROLE_PATHS } from '../../src/config/roles';
import { resolveConfig } from '../../src/config/resolve';
import { mergeFeatures } from '../../src/config/variants';
import { DEMO_PREFIX, SCENARIO_NAMES, SCENARIOS, scenarioStates, type ScenarioName } from '../../dev/scenarios';

const config = resolveConfig({ type: 'custom:ecogeo-card', prefix: DEMO_PREFIX });
const features = mergeFeatures(4, {});

function derive(name: ScenarioName) {
  const states = scenarioStates(SCENARIOS[name].states);
  const readings = readRoles(
    Object.fromEntries(Object.entries(states).map(([id, s]) => [id, { entity_id: id, ...s }])),
    config.entities,
  );
  const connection = config.entities['unit.connection'];
  return {
    readings,
    mode: deriveMode(readings, features),
    offline: isOffline(connection === undefined ? undefined : states[connection]),
    alarm: isAlarm(readings['unit.alarm']),
    circuits: circuitsFor(deriveMode(readings, features), features, 'external', readings),
  };
}

describe('emulator scenarios', () => {
  test('there are eleven, each with a state for every role', () => {
    expect(SCENARIO_NAMES).toHaveLength(11);
    for (const name of SCENARIO_NAMES) {
      expect(Object.keys(SCENARIOS[name].states).sort(), name).toEqual([...ROLE_PATHS].sort());
    }
  });

  test('every entity id uses the demo prefix', () => {
    for (const id of Object.keys(scenarioStates(SCENARIOS.heating.states))) {
      expect(id).toMatch(new RegExp(`^(sensor|binary_sensor|number)\\.${DEMO_PREFIX}_`));
    }
  });

  test.each([
    ['off', 'off'],
    ['standby', 'standby'],
    ['heating', 'heating'],
    ['dhw', 'dhw'],
    ['active_cooling', 'active_cooling'],
    ['active_cooling_htr', 'active_cooling'],
    ['passive_cooling', 'passive_cooling'],
    ['defrost', 'defrost'],
    ['alarm_heating', 'heating'],
    ['offline', 'standby'],
    ['unavailable', 'standby'],
  ] as const)('%s derives mode %s', (name, mode) => {
    expect(derive(name).mode).toBe(mode);
    expect(SCENARIOS[name].mode).toBe(mode);
  });

  test('only the alarm scenario raises the alarm, only the offline scenario is offline', () => {
    for (const name of SCENARIO_NAMES) {
      expect(derive(name).alarm, name).toBe(name === 'alarm_heating');
      expect(derive(name).offline, name).toBe(name === 'offline');
    }
  });

  test('the HTR scenario has condensation capacity, the plain active cooling scenario has none', () => {
    expect(derive('active_cooling_htr').readings['heating.capacity']).toBeGreaterThan(0);
    expect(derive('active_cooling').readings['heating.capacity']).toBe(0);
  });

  test('the unavailable scenario has no sensor value', () => {
    const { readings } = derive('unavailable');
    expect(readings['compressor.speed']).toBeUndefined();
    expect(readings['production.outlet_temperature']).toBeUndefined();
  });

  test('valves and circuits follow the scenario', () => {
    const dhw = derive('dhw').circuits;
    expect(dhw.valve26).toBe('dhw');
    expect(dhw.active.has('production_dhw') && dhw.active.has('dhw_coil')).toBe(true);

    const htr = derive('active_cooling_htr').circuits;
    expect(htr.valve14).toBe('reversed');
    expect(htr.valve26).toBe('production');
    for (const id of ['htr', 'dhw_coil', 'brine'] as const) expect(htr.active.has(id), id).toBe(true);

    const defrost = derive('defrost').circuits;
    expect(defrost.valves2728).toBe('exchanger');
    expect(defrost.active.has('refrigerant')).toBe(false);
    for (const id of ['brine', 'production_dg1', 'exchanger_10'] as const)
      expect(defrost.active.has(id), id).toBe(true);

    expect(derive('active_cooling').circuits.active.has('htr')).toBe(false);
  });
});
