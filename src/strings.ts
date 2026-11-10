// Every text the card shows, in English, in one place so a later change can add languages.
// Texts with values are functions that take the numbers already formatted for the user's locale (lib/format.ts).
// Plain text only (no emoji). A number and its unit are always joined by NBSP, never a plain space, so a line
// never breaks between them (a test checks every template).
// The NBSP pattern is copied from hrv-ventilation src/strings.ts; the texts are this card's own.

/** A no-break space: keeps a number on one line with its unit, in every text below. */
export const NBSP = '\u00a0';

/** Shown for a figure whose inputs have no value. */
export const NO_VALUE = 'n/a';

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
