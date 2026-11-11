// Adapted from hrv-ventilation test/lib/units.test.ts: temperature and power, plus the difference rule.
import { describe, expect, test } from 'vitest';
import { convertedState, toCalcUnit } from '../../src/lib/units';

describe('toCalcUnit', () => {
  test('68 °F is 20 °C', () => {
    expect(toCalcUnit('temperature', 68, '°F')).toBeCloseTo(20, 10);
  });

  test('temperature in °C is unchanged', () => {
    expect(toCalcUnit('temperature', 21.4, '°C')).toBe(21.4);
  });

  test('power in kW converts to W, power in W is unchanged', () => {
    expect(toCalcUnit('power', 1.25, 'kW')).toBe(1250);
    expect(toCalcUnit('power', 900, 'W')).toBe(900);
  });

  test('unsupported units and a missing unit have no value', () => {
    expect(toCalcUnit('temperature', 293.15, 'K')).toBeUndefined();
    expect(toCalcUnit('power', 1, 'MW')).toBeUndefined();
    expect(toCalcUnit('temperature', 21, undefined)).toBeUndefined();
    expect(toCalcUnit('power', 40, '')).toBeUndefined();
  });

  test('names of object prototype members are not units', () => {
    for (const unit of ['constructor', 'toString', 'valueOf', '__proto__', 'hasOwnProperty']) {
      expect(toCalcUnit('power', 230, unit)).toBeUndefined();
    }
  });

  test('ASCII and single-character spellings of the same units, and surrounding spaces, are accepted', () => {
    expect(toCalcUnit('temperature', 21, '℃')).toBe(21);
    expect(toCalcUnit('temperature', 68, '℉')).toBeCloseTo(20, 10);
    expect(toCalcUnit('temperature', 21, 'ºC')).toBe(21);
    expect(toCalcUnit('temperature', 68, 'ºF')).toBeCloseTo(20, 10);
    expect(toCalcUnit('temperature', 21, ' °C ')).toBe(21);
    expect(toCalcUnit('power', 1, 'KW')).toBe(1000);
  });

  test('a value that is not a finite number has no value, whatever the unit', () => {
    expect(toCalcUnit('temperature', Number.NaN, '°F')).toBeUndefined();
    expect(toCalcUnit('power', Number.POSITIVE_INFINITY, 'W')).toBeUndefined();
  });

  test('a unit of another quantity does not convert', () => {
    expect(toCalcUnit('temperature', 55, '%')).toBeUndefined();
    expect(toCalcUnit('power', 21, '°C')).toBeUndefined();
  });
});

describe('differences (add-schematic-card D8)', () => {
  test('a difference in K or °C is unchanged', () => {
    expect(toCalcUnit('difference', 5, 'K')).toBe(5);
    expect(toCalcUnit('difference', 5, '°C')).toBe(5);
  });

  test('a difference Home Assistant converted to °F is converted back with the absolute formula, in K', () => {
    // 5 K shown by HA as 5 * 9/5 + 32 = 41 °F.
    expect(toCalcUnit('difference', 41, '°F')).toBeCloseTo(5, 10);
    // Not the difference formula (x * 5/9), which would give 22.8.
    expect(toCalcUnit('difference', 41, '°F')).not.toBeCloseTo(22.8, 1);
  });

  test('other units have no value', () => {
    expect(toCalcUnit('difference', 5, 'W')).toBeUndefined();
  });
});

describe('convertedState', () => {
  test('converts a state by its unit_of_measurement', () => {
    const state = { state: '68', attributes: { unit_of_measurement: '°F' } };
    expect(convertedState(state, 'temperature')).toBeCloseTo(20, 10);
  });

  test('a missing, unavailable or sentinel state has no value', () => {
    const attributes = { unit_of_measurement: '°C' };
    expect(convertedState(undefined, 'temperature')).toBeUndefined();
    expect(convertedState({ state: 'unavailable', attributes }, 'temperature')).toBeUndefined();
    expect(convertedState({ state: '-999.9', attributes }, 'temperature')).toBeUndefined();
  });
});
