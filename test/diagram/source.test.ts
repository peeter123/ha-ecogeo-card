import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { arrangementFor } from '../../src/diagram/geometry';
import { fanDuration } from '../../src/diagram/source';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { SOURCE_LABELS } from '../../src/strings';
import { states } from '../helpers';

// the literal coordinates below are the full arrangement's (the simplified one has its own, test/diagram/simplified.test.ts)
const full = arrangementFor('full', 'full');
const AIR_PORT_Y = full.airPortY;
const AIR_UNIT = full.airUnit;
const CABINET = full.cabinet;
const GROUND_CAPTION = full.groundCaption;
const GROUND_LINE_Y = full.groundLineY;
const GROUND_LOOP = full.groundLoop;

const P = 'demo_ecogeo';

async function mount(config: CardConfig = {}, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', detail: 'full', ...config });
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
      // the serpentine: an even number of passes (at least four) joined by rounded U-bends, drawn after (over) the fins,
      // entering and leaving on the coil block's right side
      const coilId = source === 'air' ? 'src_air_coil' : 'src_hyb_coil';
      const coil = root(card).querySelector(`path[data-segment="${coilId}"]`);
      const d = coil?.getAttribute('d') ?? '';
      const bends = d.match(/A/g)?.length ?? 0;
      expect(bends, source).toBe(AIR_UNIT.passes.count * 2 - 2);
      const passes = bends / 2 + 1;
      expect(passes % 2, source).toBe(0);
      expect(passes, source).toBeGreaterThanOrEqual(4);
      const portX = AIR_UNIT.coil.x + AIR_UNIT.coil.width;
      const [top, bottom] = [AIR_PORT_Y.top, AIR_PORT_Y.bottom];
      const [from, to] = source === 'air' ? [bottom, top] : [top, bottom];
      expect(d.startsWith(`M${String(portX)} ${String(from)}`), source).toBe(true);
      expect(d.endsWith(`L${String(portX)} ${String(to)}`), source).toBe(true);
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
    expect(segments(card)).toEqual(
      expect.arrayContaining(['src_gnd_feed', 'src_gnd_down', 'src_gnd_up', 'src_gnd_exit']),
    );
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

  test('Source aligned to the cabinet: the housing top (air, hybrid) and the ground line (ground) sit on the cabinet top line', async () => {
    for (const source of ['air', 'ground', 'hybrid'] as const) {
      const card = await mount({ source });
      const housing = root(card).querySelector('.air-unit .source-outline');
      const line = root(card).querySelector('.ground-loop path.source-ground');
      if (source === 'ground') {
        expect(housing).toBeNull();
        expect(line?.getAttribute('d')).toBe(`M8 ${String(CABINET.y)} H220`);
      } else {
        expect(Number(housing?.getAttribute('y')), source).toBe(CABINET.y);
        if (source === 'hybrid') {
          // the ground loop moves down with the air unit: its line is under the housing
          expect(line?.getAttribute('d')).toBe(`M8 ${String(GROUND_LINE_Y.hybrid)} H220`);
          expect(GROUND_LINE_Y.hybrid).toBeGreaterThan(CABINET.y + AIR_UNIT.height);
        }
      }
      // the captions keep their places: the air unit's above its housing, the ground loop's under its loop
      const texts = [...root(card).querySelectorAll('.source-caption')];
      for (const text of texts) {
        const y = Number(text.getAttribute('y'));
        if (text.textContent.trim() === SOURCE_LABELS.air) expect(y, source).toBeLessThan(CABINET.y);
        else expect(y, source).toBe(GROUND_CAPTION.y[source === 'hybrid' ? 'hybrid' : 'ground']);
      }
      card.remove();
    }
  });

  test('Single loop: the ground loop is one U with a half-circle bottom, its two legs on the ground line', async () => {
    for (const source of ['ground', 'hybrid'] as const) {
      const card = await mount({ source });
      const kind = source === 'ground' ? 'gnd' : 'hyb';
      const lineY = GROUND_LINE_Y[source];
      const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
      const r = (GROUND_LOOP.downX - GROUND_LOOP.upX) / 2;
      // one arc per half: together the half circle, whose radius is half the legs' spacing
      expect(d(`src_${kind}_down`).match(/A/g), source).toHaveLength(1);
      expect(d(`src_${kind}_up`).match(/A/g), source).toHaveLength(1);
      expect(d(`src_${kind}_down`), source).toContain(`A${String(r)} ${String(r)} `);
      expect(d(`src_${kind}_down`).startsWith(`M${String(GROUND_LOOP.downX)} ${String(lineY)}`), source).toBe(true);
      expect(d(`src_${kind}_up`).endsWith(`L${String(GROUND_LOOP.upX)} ${String(lineY)}`), source).toBe(true);
      // the down half ends in a round cap, which closes the seam between the two halves
      expect(
        root(card).querySelector(`[data-segment="src_${kind}_down"]`)?.getAttribute('stroke-linecap'),
        source,
      ).toBe('round');
      expect(
        root(card).querySelector(`[data-segment="src_${kind}_up"]`)?.getAttribute('stroke-linecap'),
        source,
      ).toBeNull();
      // no collector rows any more: only the two halves are drawn for the loop
      expect(
        [...root(card).querySelectorAll('[data-segment]')].filter((e) =>
          (e.getAttribute('data-segment') ?? '').includes('loop'),
        ),
      ).toHaveLength(0);
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

  test('Fan speed not present: no fan speed label and the fan does not rotate, though the default entity reads 34.5', async () => {
    const card = await mount(
      { prefix: P, source: 'air', entities: { source: { fan_speed: 'none' } } },
      withFan('34.5'),
    );
    expect(root(card).querySelector('[data-label="fan_speed"]')).toBeNull();
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
  test('fan speed in rpm: the fan rotates at the fixed medium speed and the label reads 900 rpm', async () => {
    const hass: HassLike = {
      states: states([`sensor.${P}_aerothermal_fan_speed`, '900', 'rpm']),
    };
    const card = await mount({ prefix: P, source: 'air', layout: 'full' }, hass);
    expect(fan(card)?.classList.contains('still')).toBe(false);
    expect(fan(card)?.getAttribute('style') ?? '').toContain('--fan-duration: 3s');
    expect(root(card).querySelector('[data-label="fan_speed"] .value')?.textContent.trim()).toBe('900 rpm');
    card.remove();
  });

  test('fanDuration: true is the fixed medium speed, false is still', () => {
    expect(fanDuration(true)).toBe(3);
    expect(fanDuration(false)).toBeUndefined();
  });
});
