// The emulator's second mock source (add-entity-discovery D11): a heat pump integrated by hand through another
// integration, as a user of a KNX or Modbus bridge would have it. Other entity ids (`wp_<n>`), Dutch friendly names,
// pressures in kPa, the compressor speed in Hz, an enum compressor mode with Dutch values, a switch for on/off, and
// two roles the installation does not have (`none`) and the five optional roles left unbound. The scenarios' values are mapped onto these entities, so every
// scenario works with both namings. Exported for the suggestion tests: the fixture and the screenshots are one
// source. The ids and names are invented; nothing here comes from a live installation.
import { OPTIONAL_ROLE_PATHS, ROLE_BY_PATH, ROLE_PATHS, defaultEntityId, type RolePath } from '../src/config/roles';
import type { HassDevice, HassEntityRegistryEntry, HassEntityState } from '../src/lib/hass';
import { DEMO_PREFIX, scenarioStates, type StateMap } from './scenarios';

/** The emulator's naming control (URL `naming=`): the firmware's entity names, or another integration's. */
export const NAMINGS = ['firmware', 'foreign'] as const;
export type Naming = (typeof NAMINGS)[number];

/** A state object without its id, as the mock takes them. */
export type MockReading = Omit<HassEntityState, 'entity_id'>;

/** What `hass.entities` and `hass.devices` hold for a naming. */
export interface MockRegistry {
  entities: Readonly<Record<string, HassEntityRegistryEntry>>;
  devices: Readonly<Record<string, HassDevice>>;
}

interface ForeignEntity {
  /** The object id after the domain. */
  id: string;
  /** The friendly name, in Dutch. */
  name: string;
  /** The entity's unit when it differs from the role's display unit. */
  unit?: string;
  deviceClass?: string;
}

/** The roles the foreign installation has no entity for and the config sets to `none`. */
export const FOREIGN_NONE: readonly RolePath[] = ['source.fan_speed', 'heating.setpoint'];

/**
 * The optional roles (add-htr-state D3) the foreign installation leaves unbound: the config writes nothing for them, so
 * the card shows their fallbacks (the condensation capacity as DG1 or DHW, the register COP, no HTR item).
 */
export const FOREIGN_UNBOUND: readonly RolePath[] = OPTIONAL_ROLE_PATHS;

/** Every role the foreign naming has no entity for: the `none` roles and the unbound optional ones. */
export const FOREIGN_EMPTY: readonly RolePath[] = [...FOREIGN_NONE, ...FOREIGN_UNBOUND];

/** The `states` option of the foreign naming: its enum value for defrost (off is the switch, read as a boolean). */
export const FOREIGN_STATES = { defrost: ['Ontdooien'] } as const;

/** The compressor modes of the foreign enum sensor (`attributes.options`). */
export const FOREIGN_MODE_OPTIONS = ['Uit', 'Verwarmen', 'Tapwater', 'Ontdooien'] as const;

export const FOREIGN_DEVICE_NAME = 'Warmtepomp woning';

/**
 * The entities whose friendly name starts with the device name, as Home Assistant builds it for entities with
 * `has_entity_name` (their registry name is the bare one); the others are named in full, with no registry name.
 */
const WITH_DEVICE_NAME = new Set([
  'wp_1',
  'wp_4',
  'wp_5',
  'wp_8',
  'wp_9',
  'wp_11',
  'wp_16',
  'wp_17',
  'wp_21',
  'wp_24',
  'wp_27',
  'wp_30',
  'wp_31',
  'wp_33',
]);

const friendlyName = (entity: { id: string; name: string }): string =>
  WITH_DEVICE_NAME.has(entity.id) ? `${FOREIGN_DEVICE_NAME} ${entity.name}` : entity.name;

/* prettier-ignore */
const FOREIGN: Readonly<Partial<Record<RolePath, ForeignEntity>>> = {
  'production.outlet_temperature': { id: 'wp_1', name: 'Productie aanvoertemperatuur', deviceClass: 'temperature' },
  'production.return_temperature': { id: 'wp_2', name: 'Productie retourtemperatuur', deviceClass: 'temperature' },
  'production.pressure': { id: 'wp_3', name: 'Druk productie', unit: 'kPa', deviceClass: 'pressure' },
  'production.pump': { id: 'wp_4', name: 'Pomp productie' },
  'brine.outlet_temperature': { id: 'wp_5', name: 'Bron uitgaande temperatuur', deviceClass: 'temperature' },
  'brine.inlet_temperature': { id: 'wp_6', name: 'Bron ingaande temperatuur', deviceClass: 'temperature' },
  'brine.pressure': { id: 'wp_7', name: 'Druk bron', unit: 'kPa', deviceClass: 'pressure' },
  'brine.pump': { id: 'wp_8', name: 'Pomp bron' },
  'compressor.speed': { id: 'wp_9', name: 'Compressor toerental', unit: 'Hz', deviceClass: 'frequency' },
  'compressor.percentage': { id: 'wp_10', name: 'Compressor belasting' },
  'compressor.power': { id: 'wp_11', name: 'Opgenomen vermogen', deviceClass: 'power' },
  'compressor.suction_temperature': { id: 'wp_12', name: 'Zuiggastemperatuur compressor', deviceClass: 'temperature' },
  'compressor.discharge_temperature': { id: 'wp_13', name: 'Persgastemperatuur compressor', deviceClass: 'temperature' },
  'compressor.suction_pressure': { id: 'wp_14', name: 'Zuigdruk compressor', unit: 'kPa', deviceClass: 'pressure' },
  'compressor.discharge_pressure': { id: 'wp_15', name: 'Persdruk compressor', unit: 'kPa', deviceClass: 'pressure' },
  'compressor.mode': { id: 'wp_16', name: 'Compressor bedrijfsmodus', deviceClass: 'enum' },
  'refrigerant.condensation_temperature': { id: 'wp_17', name: 'Condensatietemperatuur', deviceClass: 'temperature' },
  'refrigerant.evaporation_temperature': { id: 'wp_18', name: 'Verdampingstemperatuur', deviceClass: 'temperature' },
  'refrigerant.superheat': { id: 'wp_19', name: 'Oververhitting' },
  'refrigerant.expansion_valve': { id: 'wp_20', name: 'Expansieventiel stand' },
  'heating.capacity': { id: 'wp_21', name: 'Condensatievermogen', deviceClass: 'power' },
  'cooling.capacity': { id: 'wp_22', name: 'Verdampingsvermogen', deviceClass: 'power' },
  'heating.demand': { id: 'wp_23', name: 'Vraag verwarming' },
  'dhw.temperature': { id: 'wp_24', name: 'Tapwatertemperatuur', deviceClass: 'temperature' },
  'dhw.setpoint': { id: 'wp_25', name: 'Tapwater gewenste temperatuur', deviceClass: 'temperature' },
  'dhw.start_delta': { id: 'wp_26', name: 'Tapwater verschil om te starten' },
  'dhw.demand': { id: 'wp_27', name: 'Vraag tapwater' },
  'source.air_unit_outlet_temperature': { id: 'wp_28', name: 'Luchtunit uitlaattemperatuur', deviceClass: 'temperature' },
  'source.outside_temperature': { id: 'wp_29', name: 'Buitentemperatuur', deviceClass: 'temperature' },
  'unit.on_off': { id: 'wp_30', name: 'Aan of uit' },
  'unit.summer': { id: 'wp_31', name: 'Zomerbedrijf' },
  'unit.winter': { id: 'wp_32', name: 'Winterbedrijf' },
  'unit.alarm': { id: 'wp_33', name: 'Storing' },
  'unit.cop': { id: 'wp_35', name: 'Rendement warmtepomp' },
  'unit.connection': { id: 'wp_34', name: 'Verbinding warmtepomp', deviceClass: 'connectivity' },
};

/** Entities of the foreign device that no role takes: a suggestion must leave them alone. */
const FOREIGN_EXTRA: readonly {
  entityId: string;
  name: string;
  state: string;
  unit?: string;
  deviceClass?: string;
}[] = [
  {
    entityId: 'sensor.wp_diag_1',
    name: 'Wifi signaalsterkte',
    state: '-61',
    unit: 'dBm',
    deviceClass: 'signal_strength',
  },
  { entityId: 'sensor.wp_diag_2', name: 'Firmwareversie', state: '2.4.1' },
];

export const FOREIGN_DEVICE_ID = 'dev_wp_woning';
export const FIRMWARE_DEVICE_ID = 'dev_ecogeo_demo';

const roleOf = (path: RolePath) => {
  const role = ROLE_BY_PATH.get(path);
  if (role === undefined) throw new Error(`no role ${path}`);
  return role;
};

/** The entity id of the role in the foreign naming, or undefined for a `none` role. The on/off state is a switch. */
export function foreignEntityId(path: RolePath): string | undefined {
  const entity = FOREIGN[path];
  return entity === undefined ? undefined : `${path === 'unit.on_off' ? 'switch' : roleOf(path).domain}.${entity.id}`;
}

/** The roles the foreign naming binds, with their entity ids: the intended result of a suggestion. */
export const FOREIGN_BINDING: Readonly<Partial<Record<RolePath, string>>> = Object.fromEntries(
  ROLE_PATHS.flatMap((path) => {
    const id = foreignEntityId(path);
    return id === undefined ? [] : [[path, id]];
  }),
);

/** The `entities` config of the foreign naming: every bound role by id, every `none` role `none`, the optional roles left out. */
export function foreignEntitiesConfig(): Record<string, Record<string, string>> {
  const groups: Record<string, Record<string, string>> = {};
  for (const path of ROLE_PATHS) {
    const [group = '', name = ''] = path.split('.');
    const bound = FOREIGN_BINDING[path];
    if (bound !== undefined || !FOREIGN_UNBOUND.includes(path)) (groups[group] ??= {})[name] = bound ?? 'none';
  }
  return groups;
}

/** A number as the state text, without float noise. */
const text = (value: number, decimals: number): string => String(Math.round(value * 10 ** decimals) / 10 ** decimals);

/** The converted number as text, or the value itself when it is not a number. */
function whenNumeric(value: string, convert: (number: number) => string): string {
  const number = Number(value);
  return value.trim() !== '' && Number.isFinite(number) ? convert(number) : value;
}

/** The on/off text of the foreign switch: on and off in any case, anything else as it is. */
function foreignOnOff(value: string): string {
  const lower = value.trim().toLowerCase();
  return lower === 'off' || lower === 'on' ? lower : value;
}

/**
 * The foreign naming's compressor mode text. The enum has the four values of D11 and no cooling value: active cooling
 * maps to Verwarmen (the card does not show the mode text).
 */
function foreignMode(value: string, states: StateMap): string {
  if (['unavailable', 'unknown'].includes(value.trim().toLowerCase())) return value.trim().toLowerCase();
  if (value === 'Defrost') return 'Ontdooien';
  if (value === 'None') return 'Uit';
  return states['dhw.demand'] === 'on' ? 'Tapwater' : 'Verwarmen';
}

/** Converts a scenario's value (firmware units and texts) to the foreign entity's. */
function foreignValue(path: RolePath, value: string, states: StateMap): string {
  switch (path) {
    case 'production.pressure':
    case 'brine.pressure':
    case 'compressor.suction_pressure':
    case 'compressor.discharge_pressure':
      return whenNumeric(value, (number) => text(number * 100, 0)); // bar to kPa
    case 'compressor.speed':
      return whenNumeric(value, (number) => text(number / 60, 1)); // rpm to Hz
    case 'unit.on_off':
      return foreignOnOff(value);
    case 'compressor.mode':
      return foreignMode(value, states);
    default:
      return value;
  }
}

/** The foreign entities' states of a scenario's state map, by entity id; the `none` roles have none. */
export function foreignStates(states: StateMap): Record<string, MockReading> {
  const readings: Record<string, MockReading> = {};
  for (const path of ROLE_PATHS) {
    const entity = FOREIGN[path];
    const id = foreignEntityId(path);
    if (entity === undefined || id === undefined) continue;
    const unit = entity.unit ?? roleOf(path).unit;
    readings[id] = {
      state: foreignValue(path, states[path], states),
      attributes: {
        friendly_name: friendlyName(entity),
        ...(unit === undefined || path === 'unit.on_off' ? {} : { unit_of_measurement: unit }),
        ...(entity.deviceClass === undefined ? {} : { device_class: entity.deviceClass }),
        ...(path === 'compressor.mode' ? { options: [...FOREIGN_MODE_OPTIONS] } : {}),
      },
    };
  }
  for (const extra of FOREIGN_EXTRA) {
    readings[extra.entityId] = {
      state: extra.state,
      attributes: {
        friendly_name: extra.name,
        ...(extra.unit === undefined ? {} : { unit_of_measurement: extra.unit }),
        ...(extra.deviceClass === undefined ? {} : { device_class: extra.deviceClass }),
      },
    };
  }
  return readings;
}

/** The states of a scenario's state map under a naming, by entity id. */
export const namingStates = (naming: Naming, states: StateMap): Record<string, MockReading> =>
  naming === 'foreign' ? foreignStates(states) : scenarioStates(states);

/** The registry of the foreign naming: one KNX device with the bound entities and two unrelated ones. */
export function foreignRegistry(): MockRegistry {
  const entries: HassEntityRegistryEntry[] = [
    ...ROLE_PATHS.flatMap((path) => {
      const id = foreignEntityId(path);
      return id === undefined
        ? []
        : [
            {
              entity_id: id,
              device_id: FOREIGN_DEVICE_ID,
              platform: 'knx',
              ...(WITH_DEVICE_NAME.has(FOREIGN[path]?.id ?? '') ? { name: FOREIGN[path]?.name } : {}),
            },
          ];
    }),
    ...FOREIGN_EXTRA.map((extra) => ({
      entity_id: extra.entityId,
      device_id: FOREIGN_DEVICE_ID,
      platform: 'knx',
      entity_category: 'diagnostic',
    })),
  ];
  return {
    entities: Object.fromEntries(entries.map((entry) => [entry.entity_id, entry])),
    devices: { [FOREIGN_DEVICE_ID]: { id: FOREIGN_DEVICE_ID, name: FOREIGN_DEVICE_NAME } },
  };
}

/** The bare entity name of a firmware suffix, as an ESPHome display entry carries it: `production_out` is "Production out". */
const bareName = (suffix: string): string => suffix.charAt(0).toUpperCase() + suffix.slice(1).replaceAll('_', ' ');

/** The registry of the firmware naming: one ESPHome device holding every role's entity. */
export function firmwareRegistry(): MockRegistry {
  const entries: HassEntityRegistryEntry[] = ROLE_PATHS.map((path) => ({
    entity_id: defaultEntityId(roleOf(path), DEMO_PREFIX),
    device_id: FIRMWARE_DEVICE_ID,
    platform: 'esphome',
    name: bareName(roleOf(path).suffix),
  }));
  return {
    entities: Object.fromEntries(entries.map((entry) => [entry.entity_id, entry])),
    devices: { [FIRMWARE_DEVICE_ID]: { id: FIRMWARE_DEVICE_ID, name: 'Ecoforest ecoGEO' } },
  };
}

/** The registry of a naming. */
export const registryOf = (naming: Naming): MockRegistry =>
  naming === 'foreign' ? foreignRegistry() : firmwareRegistry();
