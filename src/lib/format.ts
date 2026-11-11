// Copied from hrv-ventilation src/lib/format.ts. Deviations: `formatNumber` takes a `grouping` flag (default on, as in
// hrv) that the card turns off, so "2803 rpm" and "4712 W" read as the live-values spec writes them; and a value that is
// not finite gives the no-value dash instead of "n/a".
// Formats every number a label shows with the user's Home Assistant locale (design D6): the magnitude in the
// locale's format, a negative value with a "−" (minus sign) in front. The unit is not added here; calc/display.ts
// joins the role's unit to the number with NBSP.
import type { HassLike } from './hass';
import { NO_VALUE } from '../strings';

/** The parts of `hass.locale` used here. */
export interface LocaleLike {
  language?: string;
  /**
   * Home Assistant's number format setting: `language`, `system`, `comma_decimal`, `decimal_comma`,
   * `quote_decimal`, `space_comma` or `none`. A string, so a value from a newer version falls back to the language.
   */
  number_format?: string;
}

const MINUS = '−';

/** The locale settings of a `hass` object; older versions only have `hass.language`. */
export function localeFromHass(hass: Pick<HassLike, 'locale' | 'language'> | undefined): LocaleLike {
  const locale = hass?.locale;
  if (typeof locale === 'object' && locale !== null) return locale;
  return hass?.language === undefined ? {} : { language: hass.language };
}

// The same mapping as Home Assistant's frontend: each setting picks a locale whose separators it describes.
// `none` is plain digits with a "." decimal and no grouping.
function localesFor(locale: LocaleLike): string[] | undefined {
  switch (locale.number_format) {
    case 'comma_decimal':
      return ['en-US', 'en'];
    case 'decimal_comma':
      return ['de', 'es', 'it'];
    case 'quote_decimal':
      return ['de-CH'];
    case 'space_comma':
      return ['fr', 'sv', 'cs'];
    case 'none':
      return ['en-US'];
    case 'system':
      return undefined;
    default:
      return locale.language === undefined ? undefined : [locale.language];
  }
}

const formatters = new Map<string, Intl.NumberFormat>();

function formatterFor(locale: LocaleLike, decimals: number, groups: boolean): Intl.NumberFormat {
  const locales = localesFor(locale);
  const grouping = groups && locale.number_format !== 'none';
  const key = `${locales?.join(',') ?? ''}|${String(decimals)}|${String(grouping)}`;
  let formatter = formatters.get(key);
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(locales, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: grouping,
    });
    formatters.set(key, formatter);
  }
  return formatter;
}

/**
 * The value formatted with the locale, rounded to `decimals` (0 to 20, default 0: watts are shown whole). A
 * value that rounds to zero has no sign; `grouping` false leaves out the thousands separator; a value that is not a finite number gives the no-value dash (deviation from hrv: its "n/a"). Without a locale the
 * browser's default is used.
 */
export function formatNumber(value: number, locale: LocaleLike | undefined, decimals = 0, grouping = true): string {
  if (!Number.isFinite(value)) return NO_VALUE;
  const digits = Number.isFinite(decimals) ? Math.min(20, Math.max(0, Math.trunc(decimals))) : 0;
  // A value that rounds to zero is formatted as 0, so no engine writes "-0".
  const shown = Math.abs(value) < 0.5 / 10 ** digits ? 0 : value;
  return formatterFor(locale ?? {}, digits, grouping)
    .formatToParts(shown)
    .map((part) => (part.type === 'minusSign' ? MINUS : part.value))
    .join('');
}
