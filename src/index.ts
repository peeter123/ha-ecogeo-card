// The bundle's entry: registers the card (the card module defines its element once) and lists it in the
// dashboard's card picker. Loading the bundle a second time, for example under another resource URL, defines no
// element again and adds no second picker entry. Pattern from hrv-ventilation src/index.ts.
import { CARD_TAG } from './card/ecogeo-card';
import { CARD_PICKER } from './strings';

/** An entry of Home Assistant's card picker (`window.customCards`). */
export interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  /** The picker shows a live preview. */
  preview: boolean;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
}

export const CARD_ENTRY: CustomCardEntry = { type: CARD_TAG, ...CARD_PICKER, preview: false };

/** Adds the card to the card picker once, whatever else the list holds. */
export function registerCardPicker(target: { customCards?: CustomCardEntry[] } = window): void {
  const entries = (target.customCards ??= []);
  if (!entries.some((existing) => existing.type === CARD_ENTRY.type)) entries.push({ ...CARD_ENTRY });
}

registerCardPicker();
