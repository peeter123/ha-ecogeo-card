import { describe, expect, test } from 'vitest';
import { resolveConfig } from '../../src/config/resolve';
import { configErrors } from '../../src/config/options';
import { colorsErrors, DEFAULT_STOPS, MUTED_COLOR, stopsOf, temperatureColor } from '../../src/diagram/colors';

describe('temperature scale (temperature-coloring spec)', () => {
  test('the default stops are -10 blue, 20 green, 45 orange, 70 red', () => {
    expect(DEFAULT_STOPS).toEqual([
      { temperature: -10, color: '#1e88e5' },
      { temperature: 20, color: '#43a047' },
      { temperature: 45, color: '#fb8c00' },
      { temperature: 70, color: '#e53935' },
    ]);
  });

  test('a stop temperature has exactly the stop colour', () => {
    expect(temperatureColor(20)).toBe('#43a047');
    expect(temperatureColor(-10)).toBe('#1e88e5');
    expect(temperatureColor(70)).toBe('#e53935');
  });

  test('cold brine: -2.8 degrees mixes blue and green, closer to blue', () => {
    // 7.2 of 30 degrees is 24 % of the way from blue to green
    expect(temperatureColor(-2.8)).toBe('color-mix(in srgb, #43a047 24%, #1e88e5)');
  });

  test('between the stops the warmer stop gets its share, rounded to 0.1 %', () => {
    expect(temperatureColor(32.5)).toBe('color-mix(in srgb, #fb8c00 50%, #43a047)');
    expect(temperatureColor(25.2)).toBe('color-mix(in srgb, #fb8c00 20.8%, #43a047)');
  });

  test('out of range: the nearest end colour, 95 degrees is the 70 degree colour', () => {
    expect(temperatureColor(95)).toBe('#e53935');
    expect(temperatureColor(-40)).toBe('#1e88e5');
  });

  test('custom stops are used and also clamp at their ends', () => {
    const stops = [
      { temperature: 0, color: 'navy' },
      { temperature: 100, color: 'rgb(255, 0, 0)' },
    ];
    expect(temperatureColor(50, stops)).toBe('color-mix(in srgb, rgb(255, 0, 0) 50%, navy)');
    expect(temperatureColor(150, stops)).toBe('rgb(255, 0, 0)');
    expect(temperatureColor(-5, stops)).toBe('navy');
  });

  test('no temperature gives the muted colour', () => {
    expect(temperatureColor(undefined)).toBe(MUTED_COLOR);
    expect(temperatureColor(Number.NaN)).toBe(MUTED_COLOR);
    expect(MUTED_COLOR).toBe('var(--disabled-text-color)');
  });
});

describe('colors option', () => {
  const stop = (temperature: unknown, color: unknown): unknown => ({ temperature, color });

  test('left out, null or a valid list is accepted', () => {
    expect(colorsErrors({})).toEqual([]);
    expect(colorsErrors({ colors: null })).toEqual([]);
    expect(colorsErrors({ colors: [stop(0, '#000'), stop(10, 'var(--x)')] })).toEqual([]);
    expect(colorsErrors({ colors: Array.from({ length: 8 }, (_, index) => stop(index, 'red')) })).toEqual([]);
  });

  test.each([
    ['not a list', 'red'],
    ['an object', { temperature: 1, color: 'red' }],
    ['an empty list', []],
    ['one stop', [stop(0, 'red')]],
    ['nine stops', Array.from({ length: 9 }, (_, index) => stop(index, 'red'))],
    ['a stop that is not an object', [stop(0, 'red'), 5]],
    ['a temperature that is not a number', [stop(0, 'red'), stop('10', 'blue')]],
    ['an infinite temperature', [stop(0, 'red'), stop(Infinity, 'blue')]],
    ['a colour that is not a colour', [stop(0, 'red'), stop(10, 'not a colour;')]],
    ['a missing colour', [stop(0, 'red'), { temperature: 10 }]],
    ['stops that are not ascending', [stop(10, 'red'), stop(0, 'blue')]],
    ['equal temperatures', [stop(10, 'red'), stop(10, 'blue')]],
  ])('%s is a configuration error', (_name, colors) => {
    expect(colorsErrors({ colors })).toHaveLength(1);
    expect(configErrors({ colors })[0]).toContain('colors');
  });

  test('the resolved config carries the stops: the option or the default', () => {
    const colors = [stop(0, 'navy'), stop(100, 'red')];
    expect(resolveConfig({ colors }).colors).toEqual([
      { temperature: 0, color: 'navy' },
      { temperature: 100, color: 'red' },
    ]);
    expect(resolveConfig({}).colors).toEqual(DEFAULT_STOPS);
    expect(stopsOf({ colors: 'bad' })).toEqual(DEFAULT_STOPS);
  });
});
