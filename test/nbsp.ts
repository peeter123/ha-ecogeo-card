// Adapted from hrv-ventilation test/nbsp.ts
/** A text as the card writes it: a no-break space between each number and its unit (W, kW, K, bar, rpm, %, °C). */
export const nb = (text: string): string => text.replace(/(\d|n\/a) (W|kW|K|bar|rpm|%|°C)/g, '$1\u00a0$2');
