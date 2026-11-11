import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { AIR_UNIT } from '../../src/diagram/geometry';
import { fanDuration } from '../../src/diagram/source';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { SOURCE_LABELS } from '../../src/strings';
import { states } from '../helpers';

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
const captions = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('.source-caption')].map((element) => element.textContent.trim());

const withFan = (speed: string, extra: readonly (readonly [string, string])[] = []): HassLike => ({
  states: states([`sensor.${P}_aerothermal_fan_speed`, speed], ...extra),
});

describe('outer-loop source', () => {
  test('every source has the pipes from ports 3 and 4 above the DG1 stubs', async () => {
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const card = await mount({ source });
      expect(segments(card), source).toEqual(expect.arrayContaining(['src_out', 'src_in']));
      const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
      expect(d('src_out').startsWith('M630 130 L630 85'), source).toBe(true);
      expect(d('src_in').endsWith('L690 130'), source).toBe(true);
      card.remove();
    }
  });

  test('air: a housing with a coil and a fan, and no ground loop', async () => {
    const card = await mount({ source: 'air' });
    expect(root(card).querySelector('.air-unit')).not.toBeNull();
    expect(root(card).querySelector('.ground-loop')).toBeNull();
    expect(segments(card)).toEqual(expect.arrayContaining(['src_air_feed', 'src_air_coil', 'src_air_exit']));
    expect(captions(card)).toEqual([SOURCE_LABELS.air]);
    card.remove();
  });

  test('air unit drawing: a slatted housing, a finned coil block crossed by the serpentine, a fan of blades in a ring', async () => {
    for (const source of ['air', 'hybrid'] as const) {
      const card = await mount({ source });
      const unit = root(card).querySelector('.air-unit');
      // slatted front, and a coil block with at least twelve fins
      expect(unit?.querySelectorAll('[data-slat]').length, source).toBe(AIR_UNIT.slats.count);
      const block = unit?.querySelector('[data-coil-block]');
      expect(block, source).not.toBeNull();
      const fins = [...(unit?.querySelectorAll('.source-fin') ?? [])];
      expect(fins.length, source).toBe(AIR_UNIT.fins.count);
      expect(fins.length, source).toBeGreaterThanOrEqual(12);
      const blockX = Number(block?.getAttribute('x'));
      const blockRight = blockX + Number(block?.getAttribute('width'));
      for (const fin of fins) {
        const x = Number(/^M([\d.]+) /.exec(fin.getAttribute('d') ?? '')?.[1]);
        expect(x).toBeGreaterThan(blockX);
        expect(x).toBeLessThan(blockRight);
      }
      // the serpentine: three passes joined by rounded U-bends, drawn after (over) the fins
      const coil = root(card).querySelector('path[data-segment="src_air_coil"]');
      const d = coil?.getAttribute('d') ?? '';
      expect(d.match(/ L/g)?.length, source).toBeGreaterThanOrEqual(3);
      expect(d.match(/A/g), source).toHaveLength(4);
      expect(d.startsWith('M150 150'), source).toBe(true);
      expect(d.endsWith('L70 186'), source).toBe(true);
      expect(
        coil !== null && (fins[0]?.compareDocumentPosition(coil) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      // the fan: a ring, a hub and five blades
      expect(unit?.querySelectorAll('.fan-ring')).toHaveLength(1);
      expect(unit?.querySelectorAll('.fan-hub')).toHaveLength(1);
      expect(unit?.querySelectorAll('.fan-rotor .fan-blade')).toHaveLength(5);
      card.remove();
    }
  });

  test('ground: a ground loop, and no air unit or fan', async () => {
    const card = await mount({ source: 'ground' });
    expect(root(card).querySelector('.ground-loop')).not.toBeNull();
    expect(root(card).querySelector('.air-unit')).toBeNull();
    expect(fan(card)).toBeNull();
    expect(segments(card)).toEqual(expect.arrayContaining(['src_gnd_feed', 'src_gnd_loop', 'src_gnd_exit']));
    expect(segments(card).some((id) => id.startsWith('src_air_'))).toBe(false);
    expect(captions(card)).toEqual([SOURCE_LABELS.ground]);
    card.remove();
  });

  test('hybrid: the air unit and the ground loop on one brine loop, each with its caption', async () => {
    const card = await mount({ source: 'hybrid' });
    expect(root(card).querySelector('.air-unit')).not.toBeNull();
    expect(root(card).querySelector('.ground-loop')).not.toBeNull();
    expect(captions(card)).toEqual([SOURCE_LABELS.air, SOURCE_LABELS.ground]);
    expect(segments(card)).toEqual(
      expect.arrayContaining(['src_air_coil', 'src_hyb_link', 'src_hyb_loop', 'src_hyb_exit']),
    );
    expect(segments(card).filter((id) => id === 'src_out' || id === 'src_in')).toHaveLength(2);
    card.remove();
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
