import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { arrangementFor } from '../../src/diagram/geometry';
import { fanDuration } from '../../src/diagram/source';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { states } from '../helpers';

import { airFaceY, airPortX, collectorPassYs } from '../../src/diagram/geometry';
import { AIR_UNIT_NAME, GROUND_COLLECTOR_NAME } from '../../src/strings';

// the coordinates below come from the arrangement of the card's band key (the cabinet frame's are in test/diagram/simplified.test.ts)
const arrangementOfSource = (source: 'air' | 'ground' | 'hybrid') =>
  arrangementFor('horizontal', { source, tank: true, emitter: 'none' });
const need = <T>(value: T | undefined): T => {
  if (value === undefined) throw new Error('not drawn');
  return value;
};

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
const segments = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-segment]')].map((element) => element.getAttribute('data-segment') ?? '');
const fan = (card: EcogeoCard): Element | null => root(card).querySelector('.fan-rotor');
/** The texts the source and tank parts of the SVG draw: none of the source's parts carries a caption (responsive-layout "No in-drawing captions"). */
const svgTexts = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('.source text, .dhw-storage text')].map((element) => element.textContent.trim());

const withFan = (speed: string, extra: readonly (readonly [string, string])[] = []): HassLike => ({
  states: states([`sensor.${P}_aerothermal_fan_speed`, speed], ...extra),
});

describe('outer-loop source', () => {
  test('every source has the pipes from ports 3 and 4 into the join lane', async () => {
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const card = await mount({ source });
      const arrangement = arrangementOfSource(source);
      const { ports, cabinet } = arrangement;
      expect(segments(card), source).toEqual(expect.arrayContaining(['src_out', 'src_in']));
      const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
      expect(d('src_out').startsWith(`M${String(ports[3])} ${String(cabinet.y)} L${String(ports[3])} `), source).toBe(
        true,
      );
      expect(d('src_in').endsWith(`L${String(ports[4])} ${String(cabinet.y)}`), source).toBe(true);
      card.remove();
    }
  });

  test('air: a housing with a coil and a fan, and no ground collector', async () => {
    const card = await mount({ source: 'air' });
    expect(root(card).querySelector('.air-unit')).not.toBeNull();
    expect(root(card).querySelector('.ground-collector')).toBeNull();
    expect(segments(card)).toEqual(expect.arrayContaining(['src_air_feed', 'src_air_coil', 'src_air_exit']));
    expect(svgTexts(card)).toEqual([]);
    card.remove();
  });

  test('Air unit with its value inside: a finned coil block crossed by the serpentine, a fan of blades in a ring, a free strip between them', async () => {
    for (const source of ['air', 'hybrid'] as const) {
      const card = await mount({ source });
      const unit = need(arrangementOfSource(source).airUnit);
      const rendered = root(card).querySelector('.air-unit');
      // the coil block with at least six horizontal fins, all inside it
      const block = rendered?.querySelector('[data-coil-block]');
      expect(block, source).not.toBeNull();
      const fins = [...(rendered?.querySelectorAll('.source-fin') ?? [])];
      expect(fins.length, source).toBe(unit.fins.count);
      expect(fins.length, source).toBeGreaterThanOrEqual(6);
      for (const fin of fins) {
        const y = Number(/^M[\d.]+ ([\d.]+) /.exec(fin.getAttribute('d') ?? '')?.[1]);
        expect(y).toBeGreaterThan(unit.coil.y);
        expect(y).toBeLessThan(unit.coil.y + unit.coil.height);
      }
      // the serpentine: an even number of vertical passes (at least four) joined by rounded U-bends, drawn over the fins, entering
      // and leaving on the coil block's bottom face
      const coilId = source === 'air' ? 'src_air_coil' : 'src_hyb_coil';
      const coil = root(card).querySelector(`path[data-segment="${coilId}"]`);
      const d = coil?.getAttribute('d') ?? '';
      const bends = d.match(/A/g)?.length ?? 0;
      expect(bends, source).toBe(unit.passes.count * 2 - 2);
      expect(unit.passes.count % 2, source).toBe(0);
      expect(unit.passes.count, source).toBeGreaterThanOrEqual(4);
      const { feed, exit } = airPortX(unit);
      expect(d.startsWith(`M${String(feed)} ${String(airFaceY(unit))}`), source).toBe(true);
      expect(d.endsWith(`L${String(exit)} ${String(airFaceY(unit))}`), source).toBe(true);
      expect(
        coil !== null && (fins[0]?.compareDocumentPosition(coil) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      // the fan: a ring, a hub and five blades, above the free strip, which lies above the coil block
      expect(rendered?.querySelectorAll('.fan-ring')).toHaveLength(1);
      expect(rendered?.querySelectorAll('.fan-hub')).toHaveLength(1);
      expect(rendered?.querySelectorAll('.fan-rotor .fan-blade')).toHaveLength(5);
      expect(unit.fan.cy + unit.fan.radius).toBeLessThan(unit.strip.y);
      expect(unit.strip.y + unit.strip.height).toBeLessThan(unit.coil.y);
      // the tooltips name the housing and the fan
      expect(rendered?.querySelector(':scope > title')?.textContent, source).toBe(AIR_UNIT_NAME);
      card.remove();
    }
  });

  test('ground: a ground collector, and no air unit or fan', async () => {
    const card = await mount({ source: 'ground' });
    expect(root(card).querySelector('.ground-collector')).not.toBeNull();
    expect(root(card).querySelector('.ground-collector > title')?.textContent).toBe(GROUND_COLLECTOR_NAME);
    expect(root(card).querySelector('.air-unit')).toBeNull();
    expect(fan(card)).toBeNull();
    expect(segments(card)).toEqual(
      expect.arrayContaining(['src_gnd_feed', 'src_gnd_down', 'src_gnd_up', 'src_gnd_exit']),
    );
    expect(segments(card).some((id) => id.startsWith('src_air_'))).toBe(false);
    expect(svgTexts(card)).toEqual([]);
    card.remove();
  });

  test('hybrid: the air unit and the ground collector side by side on one brine loop', async () => {
    const card = await mount({ source: 'hybrid' });
    expect(root(card).querySelector('.air-unit')).not.toBeNull();
    expect(root(card).querySelector('.ground-collector')).not.toBeNull();
    expect(svgTexts(card)).toEqual([]);
    expect(segments(card)).toEqual(
      expect.arrayContaining([
        'src_hyb_feed',
        'src_hyb_coil',
        'src_hyb_link',
        'src_hyb_down',
        'src_hyb_up',
        'src_hyb_exit',
      ]),
    );
    expect(segments(card).some((id) => id.startsWith('src_air_'))).toBe(false);
    expect(segments(card).filter((id) => id === 'src_out' || id === 'src_in')).toHaveLength(2);
    card.remove();
  });

  test('Ground collector: the strip is hatched along its top, the serpentine has four horizontal passes, both ends on the bottom face', async () => {
    for (const source of ['ground', 'hybrid'] as const) {
      const card = await mount({ source });
      const arrangement = arrangementOfSource(source);
      const collector = need(arrangement.collector);
      const kind = source === 'ground' ? 'gnd' : 'hyb';
      const body = root(card).querySelector('.ground-collector');
      // hatching: diagonal ticks along the top
      expect(body?.querySelectorAll('path.source-ground').length, source).toBeGreaterThan(8);
      expect(body?.querySelector('[data-obstacle="ground-hatch"]'), source).not.toBeNull();
      expect(body?.querySelector('[data-obstacle="ground-serpentine"]'), source).not.toBeNull();
      // the passes: the horizontal pieces of the two halves, at the passes' ys
      const horizontal = ['down', 'up'].flatMap((half) => {
        const points = need(arrangement.segments.find((entry) => entry.id === `src_${kind}_${half}`)).points;
        return points.slice(1).flatMap((end, index) => (points[index]?.[1] === end[1] ? [end[1]] : []));
      });
      expect(horizontal.length, source).toBeGreaterThanOrEqual(4);
      expect(
        [...new Set(horizontal)].sort((x, y) => x - y),
        source,
      ).toEqual(collectorPassYs(collector));
      // the down half's end is rounded, which closes the seam between the two halves
      expect(
        root(card).querySelector(`[data-segment="src_${kind}_down"]`)?.getAttribute('stroke-linecap'),
        source,
      ).toBe('round');
      expect(
        root(card).querySelector(`[data-segment="src_${kind}_up"]`)?.getAttribute('stroke-linecap'),
        source,
      ).toBeNull();
      card.remove();
    }
  });

  test('a running fan rotates, faster at a higher speed', async () => {
    const slow = await mount({ prefix: P, source: 'air' }, withFan('34.5'));
    const quick = await mount({ prefix: P, source: 'air' }, withFan('100'));
    expect(fan(slow)?.classList.contains('still')).toBe(false);
    expect(fan(slow)?.querySelectorAll('.fan-blade')).toHaveLength(5);
    const seconds = (card: EcogeoCard): number =>
      Number.parseFloat(/--fan-duration: ([\d.]+)s/.exec(fan(card)?.getAttribute('style') ?? '')?.[1] ?? '');
    expect(seconds(slow)).toBeGreaterThan(seconds(quick));
    slow.remove();
    quick.remove();
  });

  test('Fan speed not present: the fan does not rotate, though the default entity reads 34.5', async () => {
    const card = await mount(
      { prefix: P, source: 'air', entities: { source: { fan_speed: 'none' } } },
      withFan('34.5'),
    );
    expect(fan(card)?.classList.contains('still')).toBe(true);
    expect(fan(card)?.getAttribute('style') ?? '').not.toContain('--fan-duration');
    card.remove();
  });

  test('the fan is drawn still at 0 % and when the speed is unavailable', async () => {
    const zero = await mount({ prefix: P, source: 'air' }, withFan('0'));
    const unavailable = await mount({ prefix: P, source: 'air' }, withFan('unavailable'));
    const none = await mount({ prefix: P, source: 'air' }, { states: {} });
    for (const card of [zero, unavailable, none]) {
      expect(fan(card)?.classList.contains('still')).toBe(true);
      expect(fan(card)?.querySelectorAll('.fan-blade')).toHaveLength(5);
      expect(fan(card)?.getAttribute('style') ?? '').not.toContain('--fan-duration');
      card.remove();
    }
  });

  test('standby: the fan still turns when its own speed is above 0 %', async () => {
    const card = await mount({ prefix: P, source: 'air' }, withFan('20', [[`sensor.${P}_heatpump_on_off`, 'OFF']]));
    expect(fan(card)?.classList.contains('still')).toBe(false);
    card.remove();
  });

  test('the style sheet stops the fan under prefers-reduced-motion', () => {
    const text = [EcogeoCard.styles]
      .flat()
      .map((style) => ('cssText' in style ? style.cssText : ''))
      .join('\n');
    expect(text).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.fan-rotor\s*\{\s*animation: none/);
  });

  test('fanDuration: none at 0 % or without a value, shorter at higher speed, bounded', () => {
    expect(fanDuration(undefined)).toBeUndefined();
    expect(fanDuration(0)).toBeUndefined();
    expect(fanDuration(Number.NaN)).toBeUndefined();
    expect(fanDuration(100)).toBeCloseTo(1.2);
    expect(fanDuration(34.5)).toBeGreaterThan(fanDuration(100) ?? 0);
    expect(fanDuration(0.5)).toBe(6);
    expect(fanDuration(1000)).toBe(0.5);
  });
});

describe('fan speed in another unit', () => {
  test('fan speed in rpm: the fan rotates at the fixed medium speed and no fan speed label is shown', async () => {
    const hass: HassLike = {
      states: states([`sensor.${P}_aerothermal_fan_speed`, '900', 'rpm']),
    };
    const card = await mount({ prefix: P, source: 'air', layout: 'horizontal' }, hass);
    expect(fan(card)?.classList.contains('still')).toBe(false);
    expect(fan(card)?.getAttribute('style') ?? '').toContain('--fan-duration: 3s');
    expect(root(card).querySelector('[data-label="fan_speed"]')).toBeNull();
    card.remove();
  });

  test('fanDuration: true is the fixed medium speed, false is still', () => {
    expect(fanDuration(true)).toBe(3);
    expect(fanDuration(false)).toBeUndefined();
  });
});
