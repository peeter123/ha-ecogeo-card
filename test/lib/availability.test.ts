// Copied from hrv-ventilation test/lib/availability.test.ts, plus the -999 sentinel tests.
import { describe, expect, test } from 'vitest';
import { isUnavailable, numericValue, parseNumericState } from '../../src/lib/availability';

describe('isUnavailable', () => {
  test('a missing entity is unavailable', () => {
    expect(isUnavailable(undefined)).toBe(true);
  });

  test('unknown and unavailable states are unavailable', () => {
    expect(isUnavailable({ state: 'unknown' })).toBe(true);
    expect(isUnavailable({ state: 'unavailable' })).toBe(true);
  });

  test('numeric and text states are available, including "n/a" (a real text state)', () => {
    expect(isUnavailable({ state: '21.4' })).toBe(false);
    expect(isUnavailable({ state: 'Auto' })).toBe(false);
    expect(isUnavailable({ state: 'n/a' })).toBe(false);
  });
});

describe('the -999 sentinel', () => {
  test('a value at or below -999 is unavailable', () => {
    for (const state of ['-999', '-999.9', '-1000', '-1e4']) expect(isUnavailable({ state }), state).toBe(true);
  });

  test('a value just above -999 is a real value', () => {
    expect(isUnavailable({ state: '-998.9' })).toBe(false);
    expect(isUnavailable({ state: '-40' })).toBe(false);
  });

  test('numericValue gives no value for the sentinel', () => {
    expect(numericValue({ state: '-999.9' })).toBeUndefined();
    expect(numericValue({ state: '-998' })).toBe(-998);
  });

  test('parseNumericState alone still parses it', () => {
    expect(parseNumericState('-999.9')).toBe(-999.9);
  });
});

describe('parseNumericState', () => {
  test('non-numeric strings have no value', () => {
    const texts = ['unknown', 'unavailable', 'Auto', 'n/a', '', ' ', '12abc', '0x10', 'Infinity', 'NaN', '1,5', '.'];
    for (const text of texts) expect(parseNumericState(text), text).toBeUndefined();
  });

  test('padded numbers have no value, as in Home Assistant', () => {
    for (const text of [' 230', '230 ', '230\n', ' 230']) expect(parseNumericState(text), text).toBeUndefined();
  });

  test('a number that overflows to Infinity has no value', () => {
    expect(parseNumericState('1e999')).toBeUndefined();
    expect(parseNumericState('-1e999')).toBeUndefined();
  });

  test('numbers are parsed', () => {
    expect(parseNumericState('21.4000007629395')).toBe(21.4000007629395);
    expect(parseNumericState('0')).toBe(0);
    expect(parseNumericState('0.0')).toBe(0);
    expect(parseNumericState('-3.5')).toBe(-3.5);
    expect(parseNumericState('+2')).toBe(2);
    expect(parseNumericState('.5')).toBe(0.5);
    expect(parseNumericState('5.')).toBe(5);
    expect(parseNumericState('1e-3')).toBe(0.001);
  });

  test('"-0" gives 0, not -0', () => {
    expect(Object.is(parseNumericState('-0'), 0)).toBe(true);
    expect(Object.is(parseNumericState('-0.0'), 0)).toBe(true);
  });
});

describe('numericValue', () => {
  test('missing, unknown and unavailable have no value', () => {
    expect(numericValue(undefined)).toBeUndefined();
    expect(numericValue({ state: 'unknown' })).toBeUndefined();
    expect(numericValue({ state: 'unavailable' })).toBeUndefined();
  });

  test('non-numeric states have no value', () => {
    expect(numericValue({ state: 'Auto' })).toBeUndefined();
    expect(numericValue({ state: 'n/a' })).toBeUndefined();
  });

  test('numeric states are parsed', () => {
    expect(numericValue({ state: '230' })).toBe(230);
    expect(numericValue({ state: '-3.5' })).toBe(-3.5);
  });
});
