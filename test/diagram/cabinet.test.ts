import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { type Point, arrangementFor } from '../../src/diagram/geometry';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { MODE_LABELS } from '../../src/strings';
import { states } from '../helpers';

// the default config draws the simplified level
const horizontal = arrangementFor('horizontal');
const COMPONENTS = horizontal.components;
const SEGMENTS = horizontal.segments;

const P = 'demo_ecogeo';

async function mount(config: CardConfig = {}, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  if (hass !== undefined) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const items = (card: EcogeoCard): number[] =>
  [...root(card).querySelectorAll('[data-item]')].map((element) => Number(element.getAttribute('data-item')));
const segments = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-segment]')].map((element) => element.getAttribute('data-segment') ?? '');
const group = (card: EcogeoCard, item: number): Element | null =>
  root(card).querySelector(`[data-item="${String(item)}"]`);

const heatingHass = (...extra: readonly (readonly [string, string, string?])[]): HassLike => ({
  states: states(
    [`sensor.${P}_heatpump_on_off`, 'ON'],
    [`sensor.${P}_compressor_rpm`, '2800'],
    [`sensor.${P}_brine_pump`, '60'],
    ...extra,
  ),
});

describe('cabinet drawing', () => {
  test.each([
    ['model B', { model: 'B' }],
    ['model C', { model: 'C' }],
    ['no HTR (direct discharge)', { model: 'B', features: { htr: false } }],
  ] as const)(
    'compressor symbol (%s): a circle and two straight converging lines, wide at the suction pipe, narrow at the discharge pipe',
    async (_name, config) => {
      type Pt = readonly [number, number];
      const card = await mount(config);
      const symbol = group(card, 11)?.querySelector('.symbol.compressor');
      expect(symbol?.querySelector('circle')?.getAttribute('r')).toBe('14');
      expect(symbol?.querySelector('.compressor-lines')?.getAttribute('d')).not.toContain('A');
      const rotation = Number(/rotate\((-?[\d.]+)\)/.exec(symbol?.getAttribute('transform') ?? '')?.[1]);
      // each line is one straight segment "M x y L x y": its start on the circle and its end
      const d = symbol?.querySelector('.compressor-lines')?.getAttribute('d') ?? '';
      const lines = [...d.matchAll(/M\s*(-?[\d.]+)\s+(-?[\d.]+)\s*L\s*(-?[\d.]+)\s+(-?[\d.]+)/g)].map(
        (match): { from: Pt; to: Pt } => ({
          from: [Number(match[1]), Number(match[2])],
          to: [Number(match[3]), Number(match[4])],
        }),
      );
      expect(lines).toHaveLength(2);
      const [first, second] = lines;
      if (first === undefined || second === undefined) throw new Error('no lines');
      for (const line of lines) {
        expect(Math.hypot(...line.from)).toBeCloseTo(14, 0);
        expect(Math.hypot(...line.to)).toBeLessThanOrEqual(14);
      }
      const gap = (u: Pt, v: Pt): number => Math.hypot(u[0] - v[0], u[1] - v[1]);
      expect(gap(first.to, second.to)).toBeLessThan(gap(first.from, second.from));
      // turned by the symbol's rotation: the wide end faces the suction pipe, the narrow end the discharge pipe
      const turn = (point: Pt): Pt => {
        const angle = (rotation * Math.PI) / 180;
        return [
          point[0] * Math.cos(angle) - point[1] * Math.sin(angle),
          point[0] * Math.sin(angle) + point[1] * Math.cos(angle),
        ];
      };
      const mid = (u: Pt, v: Pt): Pt => [(u[0] + v[0]) / 2, (u[1] + v[1]) / 2];
      const wide = turn(mid(first.from, second.from));
      const narrow = turn(mid(first.to, second.to));
      const compressor = COMPONENTS.find((component) => component.item === 11);
      if (compressor === undefined) throw new Error('no compressor');
      const away = (point: Point): Pt => [point[0] - compressor.x, point[1] - compressor.y];
      const dot = (u: Pt, v: Pt): number => u[0] * v[0] + u[1] * v[1];
      const near = (point: Pt): boolean => Math.hypot(...point) <= 15;
      const roleEnds = (role: string, which: 'first' | 'last'): Pt[] =>
        SEGMENTS.filter((segment) => drawn.has(segment.id) && segment.temperatureRole === role).flatMap((segment) => {
          const end = which === 'first' ? segment.points[0] : segment.points.at(-1);
          return end !== undefined && near(away(end)) ? [away(end)] : [];
        });
      const drawn = new Set(segments(card));
      const suction = roleEnds('compressor.suction_temperature', 'last');
      const discharge = roleEnds('compressor.discharge_temperature', 'first');
      expect(suction.length).toBeGreaterThan(0);
      expect(discharge.length).toBeGreaterThan(0);
      for (const end of suction) expect(dot(end, wide)).toBeGreaterThan(0);
      for (const end of discharge) expect(dot(end, narrow)).toBeGreaterThan(0);
      // the two parts outside the lines are filled solid in the outline colour (currentColor, which the theme's
      // outline variable sets), each closed on the circle; the lines and the part between them are unchanged
      const fills = [...(symbol?.querySelectorAll('.compressor-fill') ?? [])];
      expect(fills).toHaveLength(2);
      for (const shape of fills) {
        expect(shape.getAttribute('fill')).toBe('currentColor');
        // each shape starts where a line starts on the circle and ends on the circle through an arc of the circle's radius
        expect(shape.getAttribute('d')).toMatch(/^M9 -?10.7 L-13.73 -?2.75 A14 14 0 0 [01] 9 -?10.7 Z$/);
      }
      expect(symbol?.querySelector('.compressor-lines')?.getAttribute('d')).toBe('M9 -10.7 L-13 -3 M9 10.7 L-13 3');
      // the title, aria label and tap stay on the group (component-info)
      expect(group(card, 11)?.querySelector('title')).not.toBeNull();
      expect(group(card, 11)?.getAttribute('aria-label')).toBeTruthy();
      card.remove();
    },
  );

  test('port order: 1 to 6 left to right', async () => {
    const card = await mount({ model: 'B', dhw: 'external' });
    const ports = [...root(card).querySelectorAll('[data-kind="port"]')];
    expect(ports.map((port) => Number(port.getAttribute('data-item')))).toEqual([1, 2, 3, 4, 5, 6]);
    const xs = ports.map((port) =>
      Number(
        port
          .querySelector('g')
          ?.getAttribute('transform')
          ?.match(/translate\((\S+)/)?.[1],
      ),
    );
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
    card.remove();
  });

  test('no component carries an item number as text', async () => {
    const card = await mount({ variant: 4 });
    expect(root(card).querySelectorAll('[data-item]').length).toBeGreaterThan(0);
    expect(root(card).querySelectorAll('[data-item] text:not(.glyph)')).toHaveLength(0);
    card.remove();
  });

  test('variant 4 with every feature true draws the refrigerant and hydraulic items, and none of the service and safety parts', async () => {
    const card = await mount({ variant: 4 });
    const drawn = new Set(items(card));
    for (const item of [7, 8, 11, 12, 13, 14, 29, 30, 35, 36]) expect(drawn.has(item), String(item)).toBe(true);
    for (const item of [9, 10, 15, 16, 17, 22, 25, 26, 27, 28, 31, 32, 33, 34, 37, 38, 44, 45]) {
      expect(drawn.has(item), String(item)).toBe(true);
    }
    for (const item of [18, 19, 20, 21, 23, 24, 39, 40, 41]) expect(drawn.has(item), String(item)).toBe(false);
    card.remove();
  });

  test('every declared crossing breaks the pipe under it', async () => {
    const card = await mount({ variant: 4, dhw: 'external' });
    const path = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
    const CROSSINGS = arrangementFor('horizontal').crossings;
    const unders = [...new Set(CROSSINGS.map((crossing) => crossing.under))];
    for (const id of unders) {
      const wanted = CROSSINGS.filter((crossing) => crossing.under === id).length;
      expect(path(id).split('M').length - 1, id).toBe(wanted + 1);
    }
    card.remove();
  });

  test('no DHW: ports 5 and 6 and valve 26 are not drawn, ports 1/2 connect to the production circuit', async () => {
    const card = await mount({ dhw: 'none' });
    for (const item of [5, 6, 26]) expect(items(card)).not.toContain(item);
    expect(items(card)).toEqual(expect.arrayContaining([1, 2, 3, 4]));
    expect(segments(card)).toContain('p1_direct');
    card.remove();
  });

  test('without passive cooling: exchanger 10 and valves 27/28 are not drawn and the circuits bypass them', async () => {
    const card = await mount({ features: { passive_cooling: false } });
    for (const item of [10, 27, 28]) expect(items(card)).not.toContain(item);
    expect(segments(card)).toEqual(expect.arrayContaining(['prod_bypass27', 'brine_bypass28']));
    expect(segments(card)).not.toContain('prod_10_in');
    card.remove();
  });

  test('unused HTR: exchanger 9, pump 17 and valves 22/25 are drawn muted', async () => {
    const card = await mount({ features: { htr: 'unused' } });
    for (const item of [9, 17, 22, 25]) expect(group(card, item)?.classList.contains('muted'), String(item)).toBe(true);
    expect(group(card, 11)?.classList.contains('muted')).toBe(false);
    const muted = (selector: string): boolean[] =>
      [...root(card).querySelectorAll(selector)].map((path) => path.classList.contains('muted'));
    expect(muted('[data-segment^="htr_"]')).toEqual([true, true, true, true, true]);
    expect(muted('[data-segment="ref_discharge"], [data-segment="ref_9_14"]')).toEqual([false, false]);
    card.remove();
  });

  test('model C: connections 1 to 4 and the tank connections 47 to 49, and the tank inside the cabinet', async () => {
    const card = await mount({ model: 'C' });
    expect(
      [...root(card).querySelectorAll('[data-kind="port"]')].map((port) => Number(port.getAttribute('data-item'))),
    ).toEqual([1, 2, 3, 4, 47, 48, 49]);
    expect(group(card, 50)).not.toBeNull();
    expect(items(card)).toContain(26);
    card.remove();
  });

  test('valve positions follow the circuits: valve 26 towards the DHW lines in DHW mode', async () => {
    const heating = await mount({ prefix: P }, heatingHass());
    const dhw = await mount({ prefix: P }, heatingHass([`binary_sensor.${P}_dhw_demand`, 'on']));
    const open = (card: EcogeoCard): (string | null)[] =>
      [...(group(card, 26)?.querySelectorAll('g > path[fill]') ?? [])]
        .slice(0, 3)
        .map((path) => path.getAttribute('fill'));
    expect(open(heating)).toEqual(['currentColor', 'currentColor', 'none']);
    expect(open(dhw)).toEqual(['currentColor', 'none', 'currentColor']);
    heating.remove();
    dhw.remove();
  });

  test('valves 27/28 open to exchanger 10 in passive cooling', async () => {
    const passive = await mount(
      { prefix: P },
      {
        states: states(
          [`sensor.${P}_heatpump_on_off`, 'ON'],
          [`sensor.${P}_compressor_rpm`, '0'],
          [`sensor.${P}_production_pump`, '50'],
          [`binary_sensor.${P}_summer`, 'on'],
        ),
      },
    );
    const arms = (item: number): (string | null)[] =>
      [...(group(passive, item)?.querySelectorAll('g > path[fill]') ?? [])]
        .slice(0, 3)
        .map((path) => path.getAttribute('fill'));
    expect(arms(27)).toEqual(['none', 'currentColor', 'currentColor']);
    expect(arms(28)).toEqual(['none', 'currentColor', 'currentColor']);
    passive.remove();
  });

  test('valve 14 is drawn reversed in active cooling only', async () => {
    const hass = (summer: boolean): HassLike => ({
      states: states(
        [`sensor.${P}_heatpump_on_off`, 'ON'],
        [`sensor.${P}_compressor_rpm`, '2800'],
        [`binary_sensor.${P}_summer`, summer ? 'on' : 'off'],
      ),
    });
    const heating = await mount({ prefix: P }, hass(false));
    const cooling = await mount({ prefix: P }, hass(true));
    expect(group(heating, 14)?.innerHTML).not.toContain('M14 10 H5');
    expect(group(cooling, 14)?.innerHTML).toContain('M14 10 H5');
    heating.remove();
    cooling.remove();
  });

  test('the mode label shows Defrost during defrost', async () => {
    const card = await mount(
      { prefix: P },
      {
        states: states(
          [`sensor.${P}_heatpump_on_off`, 'ON'],
          [`sensor.${P}_compressor_operation_mode`, 'Defrost'],
          [`sensor.${P}_compressor_rpm`, '2000'],
        ),
      },
    );
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe(MODE_LABELS.defrost);
    card.remove();
  });

  test('no img element and no background-image anywhere in the drawing', async () => {
    const card = await mount();
    expect(root(card).querySelector('img')).toBeNull();
    const html = root(card).innerHTML;
    expect(html).not.toContain('background-image');
    expect(html).not.toContain('<image');
    const styles = [EcogeoCard.styles].flat().map((style) => ('cssText' in style ? style.cssText : ''));
    for (const css of styles) {
      expect(css).not.toContain('background-image');
      expect(css).not.toContain('url(');
    }
    card.remove();
  });
});
