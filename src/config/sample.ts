// The sample the card shows while its config sets neither a prefix nor an entity (the card picker, a fresh editor,
// a bare YAML card): states for every role of the table, in heating mode. Pattern from hrv-ventilation
// src/lib/sample.ts (made-up domain, so no installation id can appear or collide with a real entity); the values
// are this card's own.
//
// Provenance: rounded numbers from the heating snapshot of the live unit (2026-11-10): compressor 2803 rpm and
// 38.9 %, 786 W, condensation capacity 4712 W, COP 6.0, production 25.2 / 22.0 °C at 1.2 bar and pump 99.9 %,
// brine -2.8 / 0.5 °C at 1.2 bar and pump 100 %, suction 1.0 °C / 5.7 bar, discharge 52.5 °C / 16.4 bar,
// condensation 27.0 °C, evaporation -5.3 °C, superheat 6.2 K, EEV 58 %, DHW 52.1 °C (setpoint 58, start delta 8),
// outside 3.8 °C, air unit outlet 0.5 °C, fan 34.5 %, DG1 demand on, DHW demand off, winter on, alarm off.
// Not in the snapshot, plausible values consistent with it: the DG1 setpoint (35 °C), the evaporation capacity
// (3926 W: the condensation capacity less the compressor power), the compressor mode ("Balance", as seen live),
// the on/off text ("ON"), summer off and the bridge connection on.
import type { HassEntityState } from '../lib/hass';
import { ROLE_BY_PATH, ROLE_PATHS, type RolePath } from './roles';

/** The sample's entity id of a role path: `ecogeo_sample.<role>` with the dot written as an underscore. */
export const sampleEntityId = (role: RolePath): string => `ecogeo_sample.${role.replace('.', '_')}`;

// The unit is the role table's display unit, so every role has the unit its conversion expects.
const VALUES: Readonly<Record<RolePath, string>> = {
  'production.outlet_temperature': '25.2',
  'production.return_temperature': '22',
  'production.pressure': '1.2',
  'production.pump': '99.9',
  'brine.outlet_temperature': '-2.8',
  'brine.inlet_temperature': '0.5',
  'brine.pressure': '1.2',
  'brine.pump': '100',
  'compressor.speed': '2803',
  'compressor.percentage': '38.9',
  'compressor.power': '786',
  'compressor.suction_temperature': '1',
  'compressor.discharge_temperature': '52.5',
  'compressor.suction_pressure': '5.7',
  'compressor.discharge_pressure': '16.4',
  'compressor.mode': 'Balance',
  'refrigerant.condensation_temperature': '27',
  'refrigerant.evaporation_temperature': '-5.3',
  'refrigerant.superheat': '6.2',
  'refrigerant.expansion_valve': '58',
  'heating.capacity': '4712',
  'cooling.capacity': '3926',
  'heating.demand': 'on',
  'heating.setpoint': '35',
  'dhw.temperature': '52.1',
  'dhw.setpoint': '58',
  'dhw.start_delta': '8',
  'dhw.demand': 'off',
  'source.fan_speed': '34.5',
  'source.air_unit_outlet_temperature': '0.5',
  'source.outside_temperature': '3.8',
  'unit.on_off': 'ON',
  'unit.summer': 'off',
  'unit.winter': 'on',
  'unit.alarm': 'off',
  'unit.connection': 'on',
  'unit.cop': '6',
};

// The card reads no update time; one fixed time keeps the states stable.
const UPDATED = '2026-01-01T12:00:00Z';

/** The sample entity id of every role: what sample mode resolves the roles to. */
export const SAMPLE_ENTITIES: Readonly<Record<RolePath, string>> = Object.fromEntries(
  ROLE_PATHS.map((role) => [role, sampleEntityId(role)]),
) as Record<RolePath, string>;

/** The states of the sample entities, by entity id. */
export const SAMPLE_STATES: Readonly<Record<string, HassEntityState>> = Object.fromEntries(
  ROLE_PATHS.map((role) => {
    const unit = ROLE_BY_PATH.get(role)?.unit;
    const entityId = sampleEntityId(role);
    const state: HassEntityState = {
      entity_id: entityId,
      state: VALUES[role],
      last_updated: UPDATED,
      attributes: unit === undefined ? {} : { unit_of_measurement: unit },
    };
    return [entityId, state];
  }),
);
