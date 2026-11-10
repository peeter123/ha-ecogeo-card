// Adapted from hrv-ventilation test/strings.test.ts: the checks that UI text lives in strings.ts, that no text has
// an emoji, and that a number and its unit are joined by a no-break space; the hrv-specific text tests are dropped.
/// <reference types="vite/client" />
import { describe, expect, test } from 'vitest';
import * as strings from '../src/strings';
import { NBSP, NO_VALUE } from '../src/strings';
import { nb, unitPattern } from './nbsp';

// Every source file except strings.ts, as text.
const sources = import.meta.glob<string>(['../src/**/*.ts', '!../src/strings.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

// A marker for template parameters: the fixed parts of each text are what is left between markers.
const MARK = '\u0000';

/** Every text in strings.ts, with each template filled in with MARK for its parameters. */
function filledTexts(): string[] {
  const texts: string[] = [];
  const visit = (value: unknown): void => {
    if (typeof value === 'string') {
      texts.push(value);
    } else if (typeof value === 'function') {
      const fn = value as (...args: unknown[]) => unknown;
      try {
        const result = fn(...Array<unknown>(Math.max(fn.length, 1)).fill(MARK));
        if (typeof result === 'string') texts.push(result);
      } catch {
        // a template that needs other arguments is covered by its own test
      }
    } else if (typeof value === 'object' && value !== null) {
      Object.values(value).forEach(visit);
    }
  };
  visit(strings);
  return texts;
}

/** Every text in strings.ts, and every fixed fragment of its templates. */
function uiTexts(): string[] {
  const texts = filledTexts().flatMap((text) => text.split(MARK));
  // Keep texts a card could not contain by accident: with a space, or capitalised, and with three letters or more.
  const kept = texts
    .map((text) => text.trim())
    .filter((text) => /[A-Za-z].*[A-Za-z].*[A-Za-z]/.test(text) && (/\s/.test(text) || /^[A-Z]/.test(text)));
  return [...new Set([...kept, NO_VALUE])];
}

const escape = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Comments are not UI text. Line comments only after a line start or whitespace, so URLs in strings survive.
const withoutComments = (source: string): string =>
  source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1');
// UI text can only be in string literals ('...', "...", `...` with its templates); identifiers are not text.
const STRING_LITERAL = /'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g;
const literals = (code: string): string => (code.match(STRING_LITERAL) ?? []).join('\n');

describe('UI text lives in strings.ts', () => {
  const texts = uiTexts();

  test('there are sources to check and texts to look for', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(0);
    expect(texts).toContain('ecoGEO Schematic');
    expect(texts).toContain(NO_VALUE);
  });

  test.each(Object.entries(sources))('%s contains no text from strings.ts', (_path, source) => {
    const code = literals(withoutComments(source));
    const found = texts.filter((text) => new RegExp(`(?<![\\w])${escape(text)}(?![\\w])`).test(code));
    expect(found).toEqual([]);
  });

  test('the check finds a hard-coded text, in a string or a template, but not in comments or identifiers', () => {
    const source = "const title = 'ecoGEO Schematic'; // a comment about a Plain Text is fine";
    const found = texts.filter((text) => literals(withoutComments(source)).includes(text));
    expect(found).toContain('ecoGEO Schematic');
    expect(literals('type Layout = string; let Recovered = 1;')).toBe('');
  });
});

describe('texts', () => {
  test('the no-value text', () => {
    expect(NO_VALUE).toBe('n/a');
  });

  test('the no-break space is U+00A0', () => {
    expect(NBSP).toBe('\u00a0');
    expect(nb('12 W')).toBe('12\u00a0W');
  });

  test('a no-break space joins every number to its unit, in every text', () => {
    const units = new RegExp(`(\\d|${MARK}|n/a)(\\s)(${unitPattern})(?!\\p{L})`, 'gu');
    const joins = filledTexts().flatMap((text) => [...text.matchAll(units)].map((match) => match[2]));
    expect(joins.every((space) => space === '\u00a0')).toBe(true);
  });

  test('no text has an emoji', () => {
    for (const text of filledTexts()) expect(text, text).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
