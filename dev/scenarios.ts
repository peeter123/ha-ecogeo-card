// The emulator's scenarios (add-schematic-card D9, dev-emulator spec): eleven complete state maps by role path, resolved to
// entity ids through the fixed demo prefix `demo_ecogeo`, so no installation id appears. The heating scenario is the
// card's sample (src/config/sample.ts: rounded numbers from a live heating snapshot); every other scenario is that
// map with the values that differ, so each one still gives every role a state.
import type { Mode } from '../src/calc/mode';
import { ROLE_BY_PATH, ROLE_PATHS, defaultEntityId, type RolePath } from '../src/config/roles';
import { SAMPLE_STATES, sampleEntityId } from '../src/config/sample';
import type { HassEntityState } from '../src/lib/hass';

/** The prefix every scenario resolves its roles through. */
export const DEMO_PREFIX = 'demo_ecogeo';

export const SCENARIO_NAMES = [
  'off',
  'standby',
  'heating',
  'dhw',
  'active_cooling',
  'active_cooling_htr',
  'passive_cooling',
  'defrost',
  'alarm_heating',
  'offline',
  'unavailable',
] as const;
export type ScenarioName = (typeof SCENARIO_NAMES)[number];

/** A scenario's state of every role, as the text of the entity's state. */
export type StateMap = Readonly<Record<RolePath, string>>;

export interface Scenario {
  label: string;
  /** The mode the card derives for it (the offline and unavailable scenarios derive standby). */
  mode: Mode;
  states: StateMap;
}

const HEATING: StateMap = Object.fromEntries(
  ROLE_PATHS.map((path) => [path, SAMPLE_STATES[sampleEntityId(path)]?.state ?? 'unavailable']),
) as StateMap;

/** The heating map with the given roles changed: a full state map again. */
const heating = (changes: Partial<Record<RolePath, string>>): StateMap => ({ ...HEATING, ...changes });

/** A map in which every role but the given ones reads `unavailable`. */
const allUnavailable = (keep: Partial<Record<RolePath, string>>): StateMap =>
  ({
    ...Object.fromEntries(ROLE_PATHS.map((path) => [path, 'unavailable'])),
    ...keep,
  }) as StateMap;

/** The compressor stopped: no speed, power or capacity, and no demand. Temperatures settle towards the ambient. */
const STOPPED: Partial<Record<RolePath, string>> = {
  'compressor.speed': '0',
  'compressor.percentage': '0',
  'compressor.power': '0',
  'compressor.mode': 'None',
  'heating.capacity': '0',
  'cooling.capacity': '0',
  'heating.demand': 'off',
  'unit.cop': '0',
  'production.pump': '0',
  'brine.pump': '0',
  'production.outlet_temperature': '24.5',
  'production.return_temperature': '24.2',
  'brine.outlet_temperature': '7.8',
  'brine.inlet_temperature': '7.9',
  'compressor.suction_temperature': '9.5',
  'compressor.discharge_temperature': '21',
  'compressor.suction_pressure': '8.9',
  'compressor.discharge_pressure': '9',
  'refrigerant.condensation_temperature': '24',
  'refrigerant.evaporation_temperature': '24',
  'refrigerant.superheat': '0',
  'refrigerant.expansion_valve': '0',
  'source.fan_speed': '0',
};

/** Summer: the cooling modes' season flags and a warm outside. */
const SUMMER: Partial<Record<RolePath, string>> = {
  'unit.summer': 'on',
  'unit.winter': 'off',
  'heating.demand': 'off',
  'source.outside_temperature': '29',
};

/** Active cooling: the reversed circuit takes heat from the production side and rejects it to the outer loop. */
const ACTIVE_COOLING: Partial<Record<RolePath, string>> = {
  ...SUMMER,
  'compressor.speed': '2400',
  'compressor.percentage': '33.3',
  'compressor.power': '690',
  'compressor.mode': 'Balance',
  'production.outlet_temperature': '12',
  'production.return_temperature': '16.5',
  'brine.outlet_temperature': '33',
  'brine.inlet_temperature': '28.5',
  'compressor.suction_temperature': '8',
  'compressor.discharge_temperature': '68',
  'compressor.suction_pressure': '8.4',
  'compressor.discharge_pressure': '21',
  'refrigerant.condensation_temperature': '40',
  'refrigerant.evaporation_temperature': '5',
  'refrigerant.superheat': '3',
  'refrigerant.expansion_valve': '52',
  'cooling.capacity': '3900',
  'source.air_unit_outlet_temperature': '28.5',
  'unit.cop': '5.6',
  'source.fan_speed': '70',
};

export const SCENARIOS: Readonly<Record<ScenarioName, Scenario>> = {
  off: { label: 'Off', mode: 'off', states: heating({ ...STOPPED, 'unit.on_off': 'OFF' }) },
  standby: { label: 'Standby', mode: 'standby', states: heating(STOPPED) },
  heating: { label: 'Heating', mode: 'heating', states: HEATING },
  dhw: {
    label: 'DHW',
    mode: 'dhw',
    states: heating({
      'dhw.demand': 'on',
      'heating.demand': 'off',
      'dhw.temperature': '48.2',
      'compressor.speed': '3600',
      'compressor.percentage': '50',
      'compressor.power': '1450',
      'production.outlet_temperature': '56',
      'production.return_temperature': '49',
      'compressor.discharge_temperature': '78',
      'compressor.discharge_pressure': '24',
      'refrigerant.condensation_temperature': '55',
      'heating.capacity': '5300',
      'cooling.capacity': '3850',
      'unit.cop': '3.7',
    }),
  },
  active_cooling: {
    label: 'Active cooling (all heat to the outer loop)',
    mode: 'active_cooling',
    states: heating({ ...ACTIVE_COOLING, 'heating.capacity': '0' }),
  },
  active_cooling_htr: {
    label: 'Active cooling with HTR recovery',
    mode: 'active_cooling',
    states: heating({ ...ACTIVE_COOLING, 'heating.capacity': '1200', 'dhw.temperature': '47' }),
  },
  passive_cooling: {
    label: 'Passive cooling',
    mode: 'passive_cooling',
    states: heating({
      ...STOPPED,
      ...SUMMER,
      'production.pump': '60',
      'brine.pump': '80',
      'production.outlet_temperature': '17',
      'production.return_temperature': '19.5',
      'brine.outlet_temperature': '14',
      'brine.inlet_temperature': '12',
      'source.air_unit_outlet_temperature': '12',
    }),
  },
  defrost: {
    label: 'Defrost',
    mode: 'defrost',
    states: heating({
      ...STOPPED,
      'compressor.mode': 'Defrost',
      'production.pump': '99.9',
      'brine.pump': '100',
      'production.outlet_temperature': '18',
      'production.return_temperature': '24',
      'brine.outlet_temperature': '9',
      'brine.inlet_temperature': '-12.3',
      'source.outside_temperature': '-14',
      'source.air_unit_outlet_temperature': '-12.3',
    }),
  },
  alarm_heating: { label: 'Alarm while heating', mode: 'heating', states: heating({ 'unit.alarm': 'on' }) },
  offline: {
    label: 'Bridge offline',
    mode: 'standby',
    states: allUnavailable({ 'unit.connection': 'off' }),
  },
  unavailable: {
    label: 'Sensors unavailable',
    mode: 'standby',
    // The bridge is up and the unit is on, but every sensor reads unavailable.
    states: allUnavailable({
      'unit.connection': 'on',
      'unit.on_off': 'ON',
      'unit.alarm': 'off',
      'compressor.mode': 'Unavailable',
    }),
  },
};

export const isScenarioName = (value: string | null): value is ScenarioName =>
  SCENARIO_NAMES.some((name) => name === value);

/** The states of a scenario by entity id under the demo prefix, with each role's display unit as the unit. */
export function scenarioStates(states: StateMap): Record<string, Omit<HassEntityState, 'entity_id'>> {
  return Object.fromEntries(
    ROLE_PATHS.map((path) => {
      const role = ROLE_BY_PATH.get(path);
      if (role === undefined) throw new Error(`no role ${path}`);
      const unit = role.unit;
      return [
        defaultEntityId(role, DEMO_PREFIX),
        {
          state: states[path],
          attributes: unit === undefined ? {} : { unit_of_measurement: unit },
        },
      ];
    }),
  );
}
