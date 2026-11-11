// Adapted from hrv-ventilation test/nbsp.ts
import { DISPLAY_UNITS } from '../src/config/roles';

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The units a number is joined to by a no-break space: the role table's display units, plus kW and °F. */
export const NUMBER_UNITS: readonly string[] = [...new Set([...DISPLAY_UNITS, 'kW', '°F'])];

/** A regex source matching one of the units, longest first. */
export const unitPattern = [...NUMBER_UNITS]
  .sort((a, b) => b.length - a.length)
  .map(escape)
  .join('|');

/** A text as the card writes it: a no-break space between each number and its unit (the role table's display units). */
export const nb = (text: string): string => text.replace(new RegExp(`(\\d|–) (${unitPattern})`, 'g'), '$1 $2');
