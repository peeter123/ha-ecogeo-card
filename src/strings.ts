// Every text the card shows, in English, in one place so a later change can add languages.
// Texts with values are functions that take the numbers already formatted for the user's locale (lib/format.ts).
// Plain text only (no emoji). A number and its unit are always joined by NBSP, never a plain space, so a line
// never breaks between them (a test checks every template).
// The NBSP pattern is copied from hrv-ventilation src/strings.ts; the texts are this card's own.

/** A no-break space: keeps a number on one line with its unit, in every text below. */
export const NBSP = '\u00a0';

/** Shown, muted, for a value that is missing: unavailable, unknown, not a number or the firmware sentinel. */
export const NO_VALUE = '–';

/** The message setConfig throws for an option with an invalid value: what the option accepts. */
export const OPTIONS = {
  invalid: (option: string, accepts: string): string => `Invalid option ${option}: expected ${accepts}`,
  number: (min: string, max: string): string => `a number from ${min} to ${max}`,
  color: 'a CSS colour such as #db4437 or rgb(219, 68, 55)',
  boolean: 'true or false',
  object: 'a group of options',
  choice: (choices: readonly string[]): string => `one of ${choices.join(', ')}`,
  list: 'a list of texts',
} as const;

/** Names and descriptions in the dashboard's card picker. */
export const CARD_PICKER = {
  name: 'ecoGEO Schematic',
  description:
    'The internal schematic of an Ecoforest ecoGEO heat pump, with live values and pipes coloured by temperature.',
} as const;

/** The accessible name of the schematic drawing. */
export const SCHEMATIC_LABEL = 'ecoGEO heat pump schematic';

/** The card's own display units (add-schematic-card D2): joined to a number by NBSP. A difference is shown in K. */
export const UNITS = {
  celsius: '°C',
  kelvin: 'K',
  bar: 'bar',
  percent: '%',
  rpm: 'rpm',
  watt: 'W',
} as const;

/** The label of each derived operating mode (add-schematic-card D4). */
export const MODE_LABELS = {
  off: 'Off',
  defrost: 'Defrost',
  dhw: 'DHW',
  active_cooling: 'Active cooling',
  heating: 'Heating',
  passive_cooling: 'Passive cooling',
  standby: 'Standby',
} as const;

/** The indications beside the mode, and the note while the card shows sample values. */
export const INDICATIONS = {
  alarm: 'Alarm',
  offline: 'Offline',
  sampleValues: 'Sample values',
} as const;

/** Configuration errors setConfig throws; each names the option, so Home Assistant's error card shows which. */
export const CONFIG_ERRORS = {
  unknownOption: (option: string): string => `Unknown option ${option}`,
  unknownFeature: (feature: string, known: readonly string[]): string =>
    `Unknown feature ${feature}: expected one of ${known.join(', ')}`,
  unknownRole: (role: string): string => `Unknown entity role ${role}`,
  notEntityId: (role: string): string => `Invalid entity for ${role}: expected an entity id such as sensor.name`,
  featureState: (feature: string): string => `Invalid option features.${feature}: expected true, false or unused`,
  integer: (min: string, max: string): string => `a whole number from ${min} to ${max}`,
  prefix: 'a prefix of lowercase letters, digits and underscores',
  colors:
    'Invalid option colors: expected an ascending list of 2 to 8 stops, each { temperature, color } with a number and a CSS colour',
  dhwMismatch: (dhw: string, model: string): string =>
    `Invalid option dhw: ${dhw} does not fit model ${model}${dhw === 'none' && model === 'C' ? ' (model C always has its tank; use unused)' : ''}`,
} as const;

/** The labels of the circuits at the cabinet's top connections (manual items 1/2, 3/4 and 5/6). */
export const CIRCUIT_LABELS = {
  dg1: 'DG1',
  outerLoop: 'Outer loop',
  dhw: 'DHW',
} as const;

/** The captions of the outer-loop source parts (not manual items). */
export const SOURCE_LABELS = {
  air: 'Air unit',
  ground: 'Ground loop',
} as const;

/** The caption of the external DHW tank (not a manual item: ports 5/6 are the "DHW inter-accumulator"). */
export const DHW_LABELS = {
  externalTank: 'DHW tank',
  /** Shown beside the tank values only while the DHW demand is on. */
  demand: 'Demand',
} as const;

/** Shown at connections 1/2 only while the DG1 demand is on. */
export const HEATING_LABELS = { demand: 'Demand' } as const;

/** The small captions in front of a value label where its position alone would not say what it is. */
export const VALUE_CAPTIONS = {
  setpoint: 'Setpoint',
  startDelta: 'Start ΔT',
  /** Short captions of the row inside model C's tank 50 (refine-schematic-drawing D8b); the external tank keeps the full ones. */
  setpointShort: 'Set',
  startDeltaShort: 'ΔT',
  fan: 'Fan',
  outside: 'Outside',
  /** The source ports, from the device's point of view: In where the brine enters it, Out where it leaves. */
  portIn: 'In',
  portOut: 'Out',
  /** The compact layout's short caption of the DHW tank's temperature (add-compact-layout D8), so it is not read as a brine value. */
  dhw: 'DHW',
} as const;

/** The footer's captions and the texts of its season and on/off values. */
export const FOOTER_LABELS = {
  outside: 'Outside',
  cop: 'COP',
  condensation: 'Condensation',
  evaporation: 'Evaporation',
  summer: 'Summer',
  winter: 'Winter',
} as const;

/** The heat pump's on/off text (register 5058) by its lower-case state; any other state is shown as it is. */
export const ON_OFF_LABELS: Readonly<Record<string, string>> = {
  on: 'On',
  off: 'Off',
  emergency: 'Emergency',
};

/**
 * The names of the drawn components and connections by manual item (manual-figure, section 3.1 component list), the
 * tooltip and accessible name of each (see `componentLabel`). Items 42, 43 and 46 are not drawn and have no name.
 */
export const COMPONENT_NAMES: Readonly<Record<number, string>> = {
  1: 'Production outlet',
  2: 'Production return',
  3: 'Brine outlet',
  4: 'Brine inlet',
  5: 'DHW inter-accumulator outlet',
  6: 'DHW inter-accumulator inlet',
  7: 'Evaporator',
  8: 'Condenser',
  9: 'HTR system exchanger',
  10: 'Passive cooling / defrosting exchanger',
  11: 'Compressor',
  12: 'Electronic expansion valve',
  13: 'Filter dryer',
  14: 'Cycle inversion valve',
  15: 'Production circulator pump',
  16: 'Brine circulator pump',
  17: 'HTR circulator pump',
  18: 'Brine expansion vessel',
  19: 'Production expansion vessel',
  20: 'Brine safety valve',
  21: 'Production safety valve',
  22: 'HTR system retention valve',
  23: 'Brine drain valve',
  24: 'Production discharge valve',
  25: 'HTR system discharge valve',
  26: 'DHW valve',
  27: 'Passive cooling production valve',
  28: 'Passive cooling brine valve',
  29: 'Suction temperature probe',
  30: 'Discharge temperature probe',
  31: 'Brine outlet temperature probe',
  32: 'Brine inlet temperature probe',
  33: 'Production outlet temperature probe',
  34: 'Production return temperature probe',
  35: 'Suction pressure transducer',
  36: 'Discharge pressure transducer',
  37: 'Brine pressure transducer',
  38: 'Production pressure transducer',
  39: 'Suction mini-pressure switch',
  40: 'Discharge mini-pressure switch',
  41: 'Service outlet',
  44: 'Outlet resistor',
  45: 'Safety thermostat',
  47: 'Tap water inlet',
  48: 'DHW outlet',
  49: 'DHW recirculation',
  50: 'DHW tank',
  51: 'DHW coil',
  52: 'Manual trap',
  53: 'Tank drain valve',
  54: 'DHW temperature probe',
};

/** The tooltip and accessible name of a component: its name with the manual item in parentheses; empty without a name. */
export const componentLabel = (item: number): string => {
  const name = COMPONENT_NAMES[item];
  return name === undefined ? '' : `${name} (${String(item)})`;
};

/** The tooltip and accessible name of the air unit's fan (not a manual item); the external tank's is `DHW_LABELS.externalTank`. */
export const AIR_UNIT_FAN_NAME = 'Air unit fan';

/** The visual editor's texts (add-card-editor): section and field labels, choice labels and the notes. */
export const EDITOR = {
  noForm: "The editor needs Home Assistant's form element, which is not available yet. Use the code editor instead.",
  sections: {
    unit: 'Unit',
    entity_prefix: 'Entities',
    features: 'Features',
    appearance: 'Appearance',
    entities: 'Advanced entities',
  },
  fields: {
    model: 'Model',
    variant: 'Variant',
    source: 'Outer-loop source',
    dhw: 'DHW storage',
    prefix: 'Entity prefix',
    passive_cooling: 'Passive cooling',
    active_cooling: 'Active cooling',
    htr: 'HTR',
    backup_heater: 'Backup heater',
    detail: 'Detail level',
    exchanger_fill: 'Exchanger fill',
    layout: 'Layout',
  },
  /** The label of the "Advanced settings" switch. */
  advanced: 'Advanced settings',
  /** The title of each group of entity pickers, by the role group (the first part of the role path). */
  roleGroups: {
    production: 'Production circuit',
    brine: 'Brine circuit',
    compressor: 'Compressor',
    refrigerant: 'Refrigerant circuit',
    heating: 'Heating',
    cooling: 'Cooling',
    dhw: 'Domestic hot water',
    source: 'Outer-loop source',
    unit: 'Unit status',
  },
  /** The label of each entity picker, by the role name (the last part of the role path). */
  roles: {
    outlet_temperature: 'Outlet temperature',
    return_temperature: 'Return temperature',
    inlet_temperature: 'Inlet temperature',
    pressure: 'Pressure',
    pump: 'Pump speed',
    speed: 'Speed',
    percentage: 'Capacity percentage',
    power: 'Power consumption',
    suction_temperature: 'Suction temperature',
    discharge_temperature: 'Discharge temperature',
    suction_pressure: 'Suction pressure',
    discharge_pressure: 'Discharge pressure',
    mode: 'Operation mode',
    condensation_temperature: 'Condensation temperature',
    evaporation_temperature: 'Evaporation temperature',
    superheat: 'Superheat',
    expansion_valve: 'Expansion valve position',
    capacity: 'Capacity',
    demand: 'Demand',
    setpoint: 'Setpoint',
    temperature: 'Temperature',
    start_delta: 'Start difference',
    fan_speed: 'Fan speed',
    air_unit_outlet_temperature: 'Air unit outlet temperature',
    outside_temperature: 'Outside temperature',
    on_off: 'On or off',
    summer: 'Summer mode',
    winter: 'Winter mode',
    alarm: 'Alarm',
    connection: 'Connection',
    cop: 'COP',
  },
  /** The labels of a colour stop row; `n` counts from 1. */
  colorRow: {
    temperature: (n: number): string => `Colour stop ${String(n)}: temperature`,
    color: (n: number): string => `Colour stop ${String(n)}: colour`,
  },
  /** The labels of the choices of each choice option, by the option's value. */
  choices: {
    model: { B: 'Model B', C: 'Model C' },
    variant: { '1': 'Variant 1', '2': 'Variant 2', '3': 'Variant 3', '4': 'Variant 4' },
    source: { air: 'Air unit', ground: 'Ground loop', hybrid: 'Air unit and ground loop' },
    dhw: { external: 'External tank', internal: 'Internal tank', unused: 'Tank not in use', none: 'None' },
    detail: { simplified: 'Simplified', full: 'Full' },
    exchanger_fill: { gradient: 'Gradient', none: 'None' },
    layout: { auto: 'Auto (by width)', full: 'Full', compact: 'Compact' },
  },
  /** The choices of a feature: the empty one names what the variant does, so leaving it empty is a clear choice. */
  featureChoices: {
    on: 'On',
    off: 'Off',
    unused: 'Unused (drawn muted)',
    /** The state of the variant's preset, as it reads after "Variant default:". */
    presetOn: 'on',
    presetOff: 'off',
    presetUnused: 'unused',
    variantDefault: (state: string): string => `Variant default: ${state}`,
  },
} as const;
