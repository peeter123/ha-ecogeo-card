// The role table (add-schematic-card D2): every value the card reads, as a config path, with the firmware entity it defaults
// to, how it is read and how it is shown. The single source of domain, suffix, unit kind, display unit, default
// decimals and manual item. Entity names and units are firmware-entity (esphome-ecoforest-ecogeo, packages/*.yml);
// item numbers are manual-figure (section 3.1).
import type { Quantity } from '../lib/units';
import { UNITS } from '../strings';

/** How a role's state is read: a number, a text (such as the compressor operation mode) or an on/off state. */
export type RoleKind = 'number' | 'text' | 'binary';

export interface RoleSpec {
  /** The config path, `group.name`: `entities: { group: { name: <entity id> } }`. */
  path: string;
  domain: 'sensor' | 'binary_sensor' | 'number';
  /** The firmware's object id after `<prefix>_`. */
  suffix: string;
  kind: RoleKind;
  /** What the entity's unit converts to (°F to °C, kW to W); a role without it is read as the plain number. */
  quantity?: Quantity;
  /** The card's own display unit; none for the COP, text and binary roles. */
  unit?: string;
  /** Default decimals, when the entity has no display precision. */
  decimals?: number;
  /** The manual item the value belongs to, or where it is shown. */
  item: string;
}

const t = UNITS.celsius;

/* prettier-ignore */
export const ROLES = [
  { path: 'production.outlet_temperature', domain: 'sensor', suffix: 'production_out', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '33' },
  { path: 'production.return_temperature', domain: 'sensor', suffix: 'production_in', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '34' },
  { path: 'production.pressure', domain: 'sensor', suffix: 'pressure_production', kind: 'number', unit: UNITS.bar, decimals: 1, item: '38' },
  { path: 'production.pump', domain: 'sensor', suffix: 'production_pump', kind: 'number', unit: UNITS.percent, decimals: 1, item: '15' },
  { path: 'brine.outlet_temperature', domain: 'sensor', suffix: 'brine_out', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '31' },
  { path: 'brine.inlet_temperature', domain: 'sensor', suffix: 'brine_in', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '32' },
  { path: 'brine.pressure', domain: 'sensor', suffix: 'pressure_brine', kind: 'number', unit: UNITS.bar, decimals: 1, item: '37' },
  { path: 'brine.pump', domain: 'sensor', suffix: 'brine_pump', kind: 'number', unit: UNITS.percent, decimals: 1, item: '16' },
  { path: 'compressor.speed', domain: 'sensor', suffix: 'compressor_rpm', kind: 'number', unit: UNITS.rpm, decimals: 0, item: '11' },
  { path: 'compressor.percentage', domain: 'sensor', suffix: 'compressor_percentage', kind: 'number', unit: UNITS.percent, decimals: 1, item: '11' },
  { path: 'compressor.power', domain: 'sensor', suffix: 'power_consumption', kind: 'number', quantity: 'power', unit: UNITS.watt, decimals: 0, item: '11' },
  { path: 'compressor.suction_temperature', domain: 'sensor', suffix: 'compressor_suction_temperature', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '29' },
  { path: 'compressor.discharge_temperature', domain: 'sensor', suffix: 'compressor_discharge_temperature', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '30' },
  { path: 'compressor.suction_pressure', domain: 'sensor', suffix: 'compressor_suction_pressure', kind: 'number', unit: UNITS.bar, decimals: 1, item: '35' },
  { path: 'compressor.discharge_pressure', domain: 'sensor', suffix: 'compressor_discharge_pressure', kind: 'number', unit: UNITS.bar, decimals: 1, item: '36' },
  { path: 'compressor.mode', domain: 'sensor', suffix: 'compressor_operation_mode', kind: 'text', item: '11' },
  { path: 'refrigerant.condensation_temperature', domain: 'sensor', suffix: 'condensation_temperature', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '8' },
  { path: 'refrigerant.evaporation_temperature', domain: 'sensor', suffix: 'evaporation_temperature', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '7' },
  { path: 'refrigerant.superheat', domain: 'sensor', suffix: 'superheat', kind: 'number', quantity: 'difference', unit: UNITS.kelvin, decimals: 1, item: '12' },
  { path: 'refrigerant.expansion_valve', domain: 'sensor', suffix: 'expansion_valve_position', kind: 'number', unit: UNITS.percent, decimals: 0, item: '12' },
  { path: 'heating.capacity', domain: 'sensor', suffix: 'condensation_capacity', kind: 'number', quantity: 'power', unit: UNITS.watt, decimals: 0, item: '8' },
  { path: 'cooling.capacity', domain: 'sensor', suffix: 'evaporation_capacity', kind: 'number', quantity: 'power', unit: UNITS.watt, decimals: 0, item: '7' },
  { path: 'heating.demand', domain: 'binary_sensor', suffix: 'dg1_demand', kind: 'binary', item: '1/2' },
  { path: 'heating.setpoint', domain: 'sensor', suffix: 'heating_dg1_setpoint', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: '1/2' },
  { path: 'dhw.temperature', domain: 'sensor', suffix: 'dhw_temperature', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: 'tank (54 on C)' },
  { path: 'dhw.setpoint', domain: 'number', suffix: 'dhw_setpoint', kind: 'number', quantity: 'temperature', unit: t, decimals: 0, item: 'tank' },
  { path: 'dhw.start_delta', domain: 'number', suffix: 'delta_t_start_dhw', kind: 'number', quantity: 'difference', unit: UNITS.kelvin, decimals: 0, item: 'tank' },
  { path: 'dhw.demand', domain: 'binary_sensor', suffix: 'dhw_demand', kind: 'binary', item: '26' },
  { path: 'source.fan_speed', domain: 'sensor', suffix: 'aerothermal_fan_speed', kind: 'number', unit: UNITS.percent, decimals: 1, item: 'air unit' },
  { path: 'source.air_unit_outlet_temperature', domain: 'sensor', suffix: 'brine_temperature_air_unit_outlet', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: 'air unit' },
  { path: 'source.outside_temperature', domain: 'sensor', suffix: 'outside_temperature', kind: 'number', quantity: 'temperature', unit: t, decimals: 1, item: 'air unit / footer' },
  { path: 'unit.on_off', domain: 'sensor', suffix: 'heatpump_on_off', kind: 'text', item: 'footer' },
  { path: 'unit.summer', domain: 'binary_sensor', suffix: 'summer', kind: 'binary', item: 'footer' },
  { path: 'unit.winter', domain: 'binary_sensor', suffix: 'winter', kind: 'binary', item: 'footer' },
  { path: 'unit.alarm', domain: 'binary_sensor', suffix: 'alarm', kind: 'binary', item: 'footer' },
  { path: 'unit.connection', domain: 'binary_sensor', suffix: 'status', kind: 'binary', item: 'footer' },
  { path: 'unit.cop', domain: 'sensor', suffix: 'cop', kind: 'number', decimals: 1, item: 'footer' },
] as const satisfies readonly RoleSpec[];

/** Every entity role of the card, as a config path. */
export type RolePath = (typeof ROLES)[number]['path'];
type RoleOf<P extends RolePath> = Extract<(typeof ROLES)[number], { path: P }>;
/** The kind of a role. */
export type KindOf<P extends RolePath> = RoleOf<P>['kind'];

/** The role's spec by path. */
export const ROLE_BY_PATH: ReadonlyMap<string, RoleSpec> = new Map(ROLES.map((role) => [role.path, role]));

/** The role paths, in table order. */
export const ROLE_PATHS: readonly RolePath[] = ROLES.map((role) => role.path);

/** True when the text is a role path of the table. */
export const isRolePath = (path: string): path is RolePath => ROLE_BY_PATH.has(path);

/** The display units of the table (°C, K, bar, %, rpm, W): what a number is joined to by NBSP. */
export const DISPLAY_UNITS: readonly string[] = [
  ...new Set(ROLES.flatMap((role): string[] => ('unit' in role ? [role.unit] : []))),
];

/** The entity id of the role under a prefix: `<domain>.<prefix>_<suffix>`. */
export const defaultEntityId = (role: RoleSpec, prefix: string): string => `${role.domain}.${prefix}_${role.suffix}`;
