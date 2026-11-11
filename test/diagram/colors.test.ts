import { describe, expect, test } from 'vitest';
import { resolveConfig } from '../../src/config/resolve';
import { configErrors } from '../../src/config/options';
import { colorsErrors, DEFAULT_STOPS, MUTED_COLOR, stopsOf, temperatureColor } from '../../src/diagram/colors';

describe('temperature scale (temperature-coloring spec)', () => {
  test('the default stops are -10 blue, 10 light blue, 20 pale blue, 30 amber, 50 orange, 70 red', () => {
    expect(DEFAULT_STOPS).toEqual([
      { temperature: -10, color: '#1e5aa8' },
      { temperature: 10, color: '#5fa8e0' },
      { temperature: 20, color: '#8ecae6' },
      { temperature: 30, color: '#e8a317' },
      { temperature: 50, color: '#f2711c' },
      { temperature: 70, color: '#d7263d' },
    ]);
  });

  test('no green by default: no default stop has a hue between 75 and 165 degrees', () => {
    const hue = (hex: string): number => {
      const [r = 0, g = 0, b = 0] = [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16) / 255);
      const max = Math.max(r, g, b);
      const delta = max - Math.min(r, g, b);
      if (delta === 0) return 0;
      const sector = max === r ? ((g - b) / delta + 6) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      return sector * 60;
    };
    const hues = DEFAULT_STOPS.map((stop) => hue(stop.color));
    // about 214, 206, 199, 40, 24 and 352 degrees (design D3)
    expect(hues.map(Math.round)).toEqual([214, 206, 199, 40, 24, 352]);
    for (const value of hues) expect(value < 75 || value > 165, String(value)).toBe(true);
    expect(resolveConfig({}).colors).toBe(DEFAULT_STOPS);
  });

  test('no green by default anywhere on the scale: no 1 K sample is a saturated colour with a hue of 75 to 165', () => {
    const rgb = (hex: string): number[] => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
    // the colour of a scale value as srgb components: a stop, or the color-mix(in srgb) of two stops as the browser does it
    const components = (css: string): number[] => {
      const mix = /^color-mix\(in srgb, (#\w+) ([\d.]+)%, (#\w+)\)$/.exec(css);
      if (mix === null) return rgb(css);
      const share = Number(mix[2]) / 100;
      const [to, from] = [rgb(mix[1] ?? ''), rgb(mix[3] ?? '')];
      return from.map((value, index) => value * (1 - share) + (to[index] ?? 0) * share);
    };
    const hslOf = ([r = 0, g = 0, b = 0]: number[]): { hue: number; saturation: number } => {
      const [x, y, z] = [r, g, b].map((value) => value / 255);
      const max = Math.max(x ?? 0, y ?? 0, z ?? 0);
      const min = Math.min(x ?? 0, y ?? 0, z ?? 0);
      const delta = max - min;
      if (delta === 0) return { hue: 0, saturation: 0 };
      const lightness = (max + min) / 2;
      const saturation = delta / (1 - Math.abs(2 * lightness - 1));
      const sector =
        max === x
          ? (((y ?? 0) - (z ?? 0)) / delta + 6) % 6
          : max === y
            ? ((z ?? 0) - (x ?? 0)) / delta + 2
            : ((x ?? 0) - (y ?? 0)) / delta + 4;
      return { hue: sector * 60, saturation };
    };
    for (let temperature = -10; temperature <= 70; temperature += 1) {
      const { hue, saturation } = hslOf(components(temperatureColor(temperature)));
      expect(
        hue < 75 || hue > 165 || saturation <= 0.2,
        `${String(temperature)} degrees: hue ${String(hue)}, saturation ${String(saturation)}`,
      ).toBe(true);
    }
  });

  test('a stop temperature has exactly the stop colour', () => {
    expect(temperatureColor(30)).toBe('#e8a317');
    expect(temperatureColor(-10)).toBe('#1e5aa8');
    expect(temperatureColor(70)).toBe('#d7263d');
  });

  test('cold brine: -2.8 degrees mixes blue and light blue, closer to blue', () => {
    // 7.2 of 20 degrees is 36 % of the way from blue to light blue
    expect(temperatureColor(-2.8)).toBe('color-mix(in srgb, #5fa8e0 36%, #1e5aa8)');
  });

  test('between the stops the warmer stop gets its share, rounded to 0.1 %', () => {
    expect(temperatureColor(25)).toBe('color-mix(in srgb, #e8a317 50%, #8ecae6)');
    expect(temperatureColor(25.2)).toBe('color-mix(in srgb, #e8a317 52%, #8ecae6)');
    expect(temperatureColor(20)).toBe('#8ecae6');
  });

  test('out of range: the nearest end colour, 95 degrees is the 70 degree colour', () => {
    expect(temperatureColor(95)).toBe('#d7263d');
    expect(temperatureColor(-40)).toBe('#1e5aa8');
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
