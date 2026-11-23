import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import { arrangementFor } from '../../src/diagram/geometry';
import { fanDuration } from '../../src/diagram/source';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { states } from '../helpers';

import { BAND, airFaceY, airPortX } from '../../src/diagram/geometry';
import { DEFAULT_STROKES } from '../../src/lib/layout';
import { AIR_UNIT_NAME, GROUND_COLLECTOR_NAME, NO_VALUE } from '../../src/strings';

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

  test('air: a case with a coil panel and a fan, and no ground collector', async () => {
    const card = await mount({ source: 'air' });
    expect(root(card).querySelector('.air-unit')).not.toBeNull();
    expect(root(card).querySelector('.ground-collector')).toBeNull();
    expect(segments(card)).toEqual(expect.arrayContaining(['src_air_feed', 'src_air_coil', 'src_air_exit']));
    expect(svgTexts(card)).toEqual([]);
    card.remove();
  });

  test('Air unit drawing: a case on two feet, a finned coil panel crossed by four passes, a guarded fan right of it', async () => {
    for (const source of ['air', 'hybrid'] as const) {
      const card = await mount({ source });
      const own = arrangementOfSource(source);
      const unit = need(own.airUnit);
      const rendered = root(card).querySelector('.air-unit');
      // the case on two feet: the feet stand on the band's bottom edge and clear of the brine pipes' columns
      const feet = [...(rendered?.querySelectorAll('.air-foot') ?? [])];
      expect(feet, source).toHaveLength(2);
      const { feed, exit } = airPortX(unit);
      for (const foot of feet) {
        const [x, width] = [Number(foot.getAttribute('x')), Number(foot.getAttribute('width'))];
        expect(Number(foot.getAttribute('y')) + Number(foot.getAttribute('height')), source).toBe(own.band.bottom);
        for (const column of [feed, exit]) {
          expect(column < x - 2 || column > x + width + 2, `${source} ${String(column)}`).toBe(true);
        }
      }
      // the coil panel with at least six horizontal fins, all inside it
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
      // and leaving on the coil panel's bottom face
      const coilId = source === 'air' ? 'src_air_coil' : 'src_hyb_coil';
      const coil = root(card).querySelector(`path[data-segment="${coilId}"]`);
      const d = coil?.getAttribute('d') ?? '';
      const bends = d.match(/A/g)?.length ?? 0;
      expect(bends, source).toBe(unit.passes.count * 2 - 2);
      expect(unit.passes.count % 2, source).toBe(0);
      expect(unit.passes.count, source).toBeGreaterThanOrEqual(4);
      expect(d.startsWith(`M${String(feed)} ${String(airFaceY(unit))}`), source).toBe(true);
      expect(d.endsWith(`L${String(exit)} ${String(airFaceY(unit))}`), source).toBe(true);
      expect(
        coil !== null && (fins[0]?.compareDocumentPosition(coil) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      // the fan: a ring, a hub and five rotating blades, right of the coil panel, with the static guard over them: three rings and
      // an X of four spokes, outside the rotor
      expect(unit.fan.cx - unit.fan.radius, source).toBeGreaterThan(unit.coil.x + unit.coil.width);
      expect(rendered?.querySelectorAll('.fan-ring')).toHaveLength(1);
      expect(rendered?.querySelectorAll('.fan-hub')).toHaveLength(1);
      expect(rendered?.querySelectorAll('.fan-rotor .fan-blade')).toHaveLength(5);
      const rings = [...(rendered?.querySelectorAll('.fan-guard-ring') ?? [])];
      const spokes = [...(rendered?.querySelectorAll('.fan-spoke') ?? [])];
      expect(rings, source).toHaveLength(3);
      expect(spokes, source).toHaveLength(4);
      expect(new Set(rings.map((ring) => ring.getAttribute('r'))).size, source).toBe(3);
      for (const ring of rings) {
        expect(Number(ring.getAttribute('r')), source).toBeLessThan(unit.fan.radius);
        expect(ring.closest('.fan-rotor'), source).toBeNull();
      }
      for (const spoke of spokes) expect(spoke.closest('.fan-rotor'), source).toBeNull();
      // the guard is drawn after the blades, so it lies over them
      const rotor = rendered?.querySelector('.fan-rotor');
      const first = rings[0];
      expect(
        rotor !== null && rotor !== undefined && first !== undefined
          ? rotor.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING
          : 0,
        source,
      ).toBeTruthy();
      // the tooltips name the case and the fan
      expect(rendered?.querySelector(':scope > title')?.textContent, source).toBe(AIR_UNIT_NAME);
      card.remove();
    }
  });

  const NB = ' ';
  const valueText = (card: EcogeoCard, id: string): string | undefined =>
    root(card).querySelector(`.label[data-label="${id}"] .value`)?.textContent.trim();
  const airHass = (speed: string, unit?: string): HassLike => ({
    locale: { language: 'en', number_format: 'language' },
    states: states(
      [`sensor.${P}_outside_temperature`, '8.4', '°C'],
      [`sensor.${P}_brine_temperature_air_unit_outlet`, '5.7', '°C'],
      unit === undefined
        ? [`sensor.${P}_aerothermal_fan_speed`, speed]
        : [`sensor.${P}_aerothermal_fan_speed`, speed, unit],
    ),
  });

  test('Air unit values inside: the outside temperature above the fan, the fan speed below it, the Out beside the exit pass, all bare', async () => {
    const card = await mount({ prefix: P, source: 'air' }, airHass('45.2', '%'));
    const own = arrangementOfSource('air');
    const unit = need(own.airUnit);
    expect(valueText(card, 'outside_temperature')).toBe(`8.4${NB}°C`);
    expect(valueText(card, 'fan_speed')).toBe(`45${NB}%`);
    expect(valueText(card, 'air_unit_out')).toBe(`5.7${NB}°C`);
    const spec = (id: string) => need(own.labels.specs.find((item) => item.id === id));
    // above the fan, below it, and right of the coil panel at the case's bottom
    expect(spec('outside_temperature').x).toBe(unit.fan.cx);
    expect(spec('outside_temperature').y).toBeLessThan(unit.fan.cy - unit.fan.radius);
    expect(spec('fan_speed').x).toBe(unit.fan.cx);
    expect(spec('fan_speed').y).toBeGreaterThan(unit.fan.cy + unit.fan.radius);
    expect(spec('air_unit_out').x).toBeGreaterThan(unit.coil.x + unit.coil.width);
    expect(spec('air_unit_out').y).toBeGreaterThan(unit.fan.cy + unit.fan.radius);
    for (const id of ['outside_temperature', 'fan_speed', 'air_unit_out']) {
      const element = root(card).querySelector(`.label[data-label="${id}"]`);
      expect(element?.classList.contains('bare'), id).toBe(true);
      expect(element?.querySelector('.caption'), id).toBeNull();
    }
    expect(root(card).querySelector('.label[data-label="air_unit_in"]')).toBeNull();
    card.remove();
  });

  test('Running fan: the fan rotates and the speed shows as a whole percent below it', async () => {
    const card = await mount({ prefix: P, source: 'air' }, airHass('34.5', '%'));
    expect(fan(card)?.classList.contains('still')).toBe(false);
    expect(valueText(card, 'fan_speed')).toBe(`35${NB}%`);
    card.remove();
  });

  test('Hybrid: the air unit shows the outside temperature and the fan speed and no Out', async () => {
    const card = await mount({ prefix: P, source: 'hybrid' }, airHass('45.2', '%'));
    expect(valueText(card, 'outside_temperature')).toBe(`8.4${NB}°C`);
    expect(valueText(card, 'fan_speed')).toBe(`45${NB}%`);
    expect(root(card).querySelector('.label[data-label="air_unit_out"]')).toBeNull();
    card.remove();
  });

  test('ground: the collector shows no outside temperature or fan speed', async () => {
    const card = await mount({ prefix: P, source: 'ground' }, airHass('45.2', '%'));
    expect(root(card).querySelector('.label[data-label="outside_temperature"]')).toBeNull();
    expect(root(card).querySelector('.label[data-label="fan_speed"]')).toBeNull();
    card.remove();
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

  test('Collector drawing: hatched top, two U-loops in series hanging from it, a riser on each side, both ends on the bottom face', async () => {
    for (const source of ['ground', 'hybrid'] as const) {
      const card = await mount({ source });
      const arrangement = arrangementOfSource(source);
      const collector = need(arrangement.collector);
      const kind = source === 'ground' ? 'gnd' : 'hyb';
      const body = root(card).querySelector('.ground-collector');
      // hatching: diagonal ticks along the top
      expect(body?.querySelectorAll('path.source-ground').length, source).toBeGreaterThan(8);
      expect(body?.querySelector('[data-obstacle="ground-hatch"]'), source).not.toBeNull();
      expect(body?.querySelector('[data-obstacle="ground-probe"]'), source).not.toBeNull();
      const face = collector.y + collector.height;
      const half = (name: string) =>
        need(arrangement.segments.find((entry) => entry.id === `src_${kind}_${name}`)).points;
      const down = half('down');
      const up = half('up');
      const [a1, a2, b1, b2] = collector.legs;
      // the feed riser rises on the left from the bottom face to the header just under the hatching
      expect(down[0]).toEqual([collector.feedX, face]);
      expect(down[1]).toEqual([collector.feedX, collector.headerY]);
      expect(collector.headerY).toBeGreaterThan(collector.hatch.y + collector.hatch.height);
      // two U-loops hang from the header: each has two vertical legs that go down to the bends and back up
      const legXs = [...down, ...up].flatMap((point, index, all) => {
        const next = all[index + 1];
        const vertical = next?.[0] === point[0] && next[1] !== point[1];
        return vertical && point[0] !== collector.feedX && point[0] !== collector.returnX ? [point[0]] : [];
      });
      expect(
        legXs.sort((x, y) => x - y),
        source,
      ).toEqual([a1, a2, b1, b2]);
      expect(a1 < a2 && a2 < b1 && b1 < b2, source).toBe(true);
      expect(collector.feedX).toBeLessThan(a1);
      expect(collector.returnX).toBeGreaterThan(b2);
      const bends = [...down, ...up].filter((point) => point[1] === collector.bendY);
      expect(
        bends.map((point) => point[0]),
        source,
      ).toEqual([a1, a2, b1, b2]);
      // the return riser drops down the right side to the bottom face
      expect(up.at(-2)).toEqual([collector.returnX, collector.headerY]);
      expect(up.at(-1)).toEqual([collector.returnX, face]);
      // the two halves meet in the top link between the loops, and the first half's end is rounded (it closes the seam)
      expect(down.at(-1), source).toEqual(up[0]);
      expect(
        root(card).querySelector(`[data-segment="src_${kind}_down"]`)?.getAttribute('stroke-linecap'),
        source,
      ).toBe('round');
      expect(
        root(card).querySelector(`[data-segment="src_${kind}_up"]`)?.getAttribute('stroke-linecap'),
        source,
      ).toBeNull();
      // the Out box sits below the bends, between the risers
      expect(collector.out.y).toBeGreaterThan(collector.bendY);
      expect(collector.out.x).toBeGreaterThan(collector.feedX);
      expect(collector.out.x + collector.out.width).toBe(collector.returnX - 1.5 * DEFAULT_STROKES.pipe);
      card.remove();
    }
  });

  test('Collector drawing: narrow loops with a wide gap between them, risers a margin and half a pipe inside the walls', () => {
    for (const source of ['ground', 'hybrid'] as const) {
      const collector = need(arrangementOfSource(source).collector);
      const [a1, a2, b1, b2] = collector.legs;
      const loop = a2 - a1;
      expect(b2 - b1, source).toBe(loop);
      expect(b1 - a2, source).toBeGreaterThan(loop);
      expect(a1 - collector.feedX, source).toBeGreaterThanOrEqual(loop);
      expect(collector.returnX - b2, source).toBeGreaterThanOrEqual(loop);
      expect(collector.feedX - collector.x, source).toBe(BAND.margin + DEFAULT_STROKES.pipe / 2);
      expect(collector.x + collector.width - collector.returnX, source).toBe(BAND.margin + DEFAULT_STROKES.pipe / 2);
    }
  });

  test('Collector colours: the first half takes the brine outlet (the air outlet in the hybrid), the second half and the exit the brine inlet', () => {
    const colours = (source: 'ground' | 'hybrid') =>
      Object.fromEntries(arrangementOfSource(source).segments.map((entry) => [entry.id, entry.temperatureRole]));
    const ground = colours('ground');
    expect(ground['src_gnd_down']).toBe('brine.outlet_temperature');
    expect(ground['src_gnd_up']).toBe('brine.inlet_temperature');
    expect(ground['src_gnd_exit']).toBe('brine.inlet_temperature');
    const hybrid = colours('hybrid');
    expect(hybrid['src_hyb_down']).toBe('source.air_unit_outlet_temperature');
    expect(hybrid['src_hyb_up']).toBe('brine.inlet_temperature');
    expect(hybrid['src_hyb_exit']).toBe('brine.inlet_temperature');
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
    // the value below the fan: "0 %" at 0, the dash while the speed is unavailable or has no entity state
    expect(valueText(zero, 'fan_speed')).toBe(`0${NB}%`);
    expect(valueText(unavailable, 'fan_speed')).toBe(NO_VALUE);
    expect(valueText(none, 'fan_speed')).toBe(NO_VALUE);
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
  test('Fan speed in rpm: the fan rotates at the fixed medium speed and the speed shows with its unit', async () => {
    const hass: HassLike = {
      states: states([`sensor.${P}_aerothermal_fan_speed`, '900', 'rpm']),
    };
    const card = await mount({ prefix: P, source: 'air', layout: 'horizontal' }, hass);
    expect(fan(card)?.classList.contains('still')).toBe(false);
    expect(fan(card)?.getAttribute('style') ?? '').toContain('--fan-duration: 3s');
    expect(root(card).querySelector('.label[data-label="fan_speed"] .value')?.textContent.trim()).toBe('900 rpm');
    card.remove();
  });

  test('fanDuration: true is the fixed medium speed, false is still', () => {
    expect(fanDuration(true)).toBe(3);
    expect(fanDuration(false)).toBeUndefined();
  });
});
