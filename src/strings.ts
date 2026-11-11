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

/** The card's own display units (design D2): joined to a number by NBSP. A difference is shown in K. */
export const UNITS = {
  celsius: '°C',
  kelvin: 'K',
  bar: 'bar',
  percent: '%',
  rpm: 'rpm',
  watt: 'W',
} as const;

/** The label of each derived operating mode (design D4). */
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
  dhwMismatch: (dhw: string, model: string): string => `Invalid option dhw: ${dhw} does not fit model ${model}`,
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
  fan: 'Fan',
  outside: 'Outside',
  airOutlet: 'Outlet',
  groundIn: 'In',
  groundOut: 'Out',
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
