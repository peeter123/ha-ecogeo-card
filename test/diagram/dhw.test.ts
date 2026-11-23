import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import type { CardConfig } from '../../src/lib/config';
import type { HassEntityState, HassLike } from '../../src/lib/hass';
import { COIL_51_SHAPE } from '../../src/diagram/symbols';
import { helixHalves } from '../../src/diagram/geometry';
import { bandJogs, externalTankBody, helixExtent, arrangementFor } from '../../src/diagram/geometry';
import { cabinetStyles } from '../../src/diagram/cabinet';
import {
  COIL_MUTED_LIGHT,
  DEFAULT_STOPS,
  MUTED_COLOR,
  coilMutedColor,
  temperatureColor,
} from '../../src/diagram/colors';
import { DEMO_PREFIX, SCENARIOS, scenarioStates } from '../../dev/scenarios';

// the coordinates below come from the arrangement (the cabinet frame's are in test/diagram/simplified.test.ts)
const horizontal = arrangementFor('horizontal', { source: 'ground', tank: true, emitter: 'none' });
const CABINET = horizontal.cabinet;
const COMPONENTS = horizontal.components;
const EXTERNAL_TANK = horizontal.externalTank ?? {
  x: Number.NaN,
  y: Number.NaN,
  width: Number.NaN,
  height: Number.NaN,
  dome: Number.NaN,
};
const INTERNAL_TANK = horizontal.internalTank;
const SEGMENTS = horizontal.segments;
const portX = (item: number): number => COMPONENTS.find((component) => component.item === item)?.x ?? Number.NaN;
const COIL = SEGMENTS.find((segment) => segment.id === 'dhw_ext_coil')?.shape;
if (COIL === undefined) throw new Error('no external coil');
/** The coil's two ends: where it meets the pipes from ports 5 and 6. */
const COIL_START = `${String(COIL.cx - COIL.rx)} ${String(COIL.top)}`;
const COIL_END = `${String(COIL.cx + COIL.rx)} ${String(COIL.bottom)}`;
const LABEL_SPECS = horizontal.labels.specs;

async function mount(config: CardConfig = {}, hass?: HassLike): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', ...config });
  if (hass !== undefined) card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const hot: HassLike = {
  states: Object.fromEntries(
    Object.entries(scenarioStates(SCENARIOS.dhw.states)).map(([id, value]) => [id, { entity_id: id, ...value }]),
  ),
};

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const items = (card: EcogeoCard): number[] =>
  [...root(card).querySelectorAll('[data-item]')].map((element) => Number(element.getAttribute('data-item')));
const segments = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-segment]')].map((element) => element.getAttribute('data-segment') ?? '');
const tanks = (card: EcogeoCard): string[] =>
  [...root(card).querySelectorAll('[data-dhw-tank]')].map((element) => element.getAttribute('data-dhw-tank') ?? '');

describe('DHW storage', () => {
  test('external: a tank with a coil above ports 5 and 6, joined to them', async () => {
    const card = await mount({ model: 'B', dhw: 'external' });
    expect(tanks(card)).toEqual(['external']);
    expect(segments(card)).toEqual(expect.arrayContaining(['dhw_ext_in', 'dhw_ext_coil', 'dhw_ext_out']));
    expect(items(card)).toEqual(expect.arrayContaining([5, 6, 26]));
    const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
    expect(
      d('dhw_ext_in').startsWith(
        `M${String(portX(5))} ${String(CABINET.y)} L${String(portX(5))} ${String(bandJogs(CABINET.y).tank)}`,
      ),
    ).toBe(true);
    expect(d('dhw_ext_out').endsWith(`L${String(portX(6))} ${String(CABINET.y)}`)).toBe(true);
    expect(items(card).some((item) => item >= 47)).toBe(false);
    card.remove();
  });

  test('external tank: a rounded cylinder (straight walls, domed caps) whose body keeps the DHW colour hook', async () => {
    const card = await mount({ model: 'B', dhw: 'external' });
    const body = root(card).querySelector('path.tank-body[data-dhw-tank="external"]');
    expect(body?.getAttribute('fill')).toContain('--dhw-tank-color');
    const d = body?.getAttribute('d') ?? '';
    expect(d).toBe(externalTankBody(horizontal));
    expect(d).toMatch(/^M\d+ \d+ A80 14 0 0 1 /);
    expect(root(card).querySelector('.dhw-storage .tank-rim')).not.toBeNull();
    card.remove();
  });

  test('helical coil: at least four turns, front halves solid, back halves faint, flow on the front halves only', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, hot);
    const halves = [...root(card).querySelectorAll('[data-segment="dhw_ext_coil"] path[data-half]')];
    const front = halves.filter((half) => half.getAttribute('data-half') === 'front');
    const back = halves.filter((half) => half.getAttribute('data-half') === 'back');
    expect(halves.length).toBeGreaterThanOrEqual(8);
    expect(front.length + back.length).toBe(halves.length);
    expect(front.length).toBeGreaterThanOrEqual(4);
    expect(back.length).toBeGreaterThanOrEqual(4);
    for (const half of front) expect(half.hasAttribute('opacity')).toBe(false);
    for (const half of back) expect(Number(half.getAttribute('opacity'))).toBeLessThan(0.5);
    // same colour on every half, and the pipes' base stroke
    expect(new Set(halves.map((half) => half.getAttribute('style'))).size).toBe(1);
    expect(halves.every((half) => half.classList.contains('pipe'))).toBe(true);
    // the dash overlay follows the front halves only
    const flow = root(card).querySelector('[data-flow="dhw_ext_coil"]');
    expect(flow).not.toBeNull();
    expect((flow?.getAttribute('d') ?? '').match(/M/g)).toHaveLength(front.length);
    for (const half of front) expect(flow?.getAttribute('d')).toContain(half.getAttribute('d'));
    for (const half of back) expect(flow?.getAttribute('d')).not.toContain(half.getAttribute('d'));
    // its ends meet the pipes from ports 5 and 6
    const d = (id: string): string => root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('d') ?? '';
    expect(d('dhw_ext_in').endsWith(`L${COIL_START}`)).toBe(true);
    expect(front[0]?.getAttribute('d')?.startsWith(`M${COIL_START}`)).toBe(true);
    expect(front.at(-1)?.getAttribute('d')?.endsWith(COIL_END)).toBe(true);
    // clean joints (refine-schematic-drawing D8a): every back half is drawn before every front half; backs have butt caps, fronts round
    const lastBack = halves.map((half) => half.getAttribute('data-half')).lastIndexOf('back');
    const firstFront = halves.map((half) => half.getAttribute('data-half')).indexOf('front');
    expect(lastBack).toBeLessThan(firstFront);
    for (const half of back) expect(half.getAttribute('stroke-linecap')).toBe('butt');
    for (const half of front) expect(half.getAttribute('stroke-linecap')).toBe('round');
    expect(d('dhw_ext_out').startsWith(`M${COIL_END}`)).toBe(true);
    card.remove();
  });

  test('helical coil: muted without a flow, no overlay', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, { states: {} });
    expect(root(card).querySelector('[data-flow="dhw_ext_coil"]')).toBeNull();
    const halves = [...root(card).querySelectorAll('[data-segment="dhw_ext_coil"] path[data-half]')];
    expect(halves.length).toBeGreaterThanOrEqual(8);
    expect(halves.every((half) => half.classList.contains('muted'))).toBe(true);
    card.remove();
  });

  test('tank geometry: centred on the coil, the whole tank above the cabinet on the band, coil and pipes inside', async () => {
    const card = await mount({ model: 'B', dhw: 'external' });
    const shape = SEGMENTS.find((segment) => segment.id === 'dhw_ext_coil')?.shape;
    if (shape === undefined) throw new Error('no helix');
    expect(shape.kind).toBe('helix');
    // the tank's centre line is the coil's centre line
    expect(EXTERNAL_TANK.x + EXTERNAL_TANK.width / 2).toBe(shape.cx);
    expect(EXTERNAL_TANK).toMatchObject({ width: 160, height: 176 });
    // the whole tank lies above the cabinet's top edge, its bottom on the band's bottom edge
    expect(EXTERNAL_TANK.y + EXTERNAL_TANK.height).toBe(horizontal.band.bottom);
    expect(horizontal.band.bottom).toBeLessThan(CABINET.y);
    // the dome apex (the path's top: its start y minus the dome rise) is the tank's top
    const d = root(card).querySelector('path.tank-body[data-dhw-tank="external"]')?.getAttribute('d') ?? '';
    const [, startY] = /^M\d+ (\d+)/.exec(d) ?? [];
    expect(Number(startY) - EXTERNAL_TANK.dome).toBe(EXTERNAL_TANK.y);
    // the coil's curve stays inside the tank, in its lower part, and the pipes beside it run in columns left and right of it
    const extent = helixExtent(shape);
    expect(extent.left).toBeGreaterThan(EXTERNAL_TANK.x);
    expect(extent.right).toBeLessThan(EXTERNAL_TANK.x + EXTERNAL_TANK.width);
    expect(extent.top).toBeGreaterThan(EXTERNAL_TANK.y + EXTERNAL_TANK.height / 3);
    expect(extent.bottom).toBeLessThan(EXTERNAL_TANK.y + EXTERNAL_TANK.height - EXTERNAL_TANK.dome);
    const coil = horizontal.externalCoil;
    expect(coil?.inX).toBeLessThan(extent.left);
    expect(coil?.outX).toBeGreaterThan(extent.right);
    // the value labels sit inside the tank's upper part (above the coil), centred on it, bare on the tinted body
    const specs = LABEL_SPECS.filter((spec) => spec.id.startsWith('tank_external'));
    expect(specs.map((spec) => spec.id).sort()).toEqual(['tank_external_temperature']);
    for (const spec of specs) {
      expect(spec.x).toBe(EXTERNAL_TANK.x + EXTERNAL_TANK.width / 2);
      expect(spec.y).toBeGreaterThan(EXTERNAL_TANK.y + EXTERNAL_TANK.dome);
      expect(spec.y).toBeLessThan(extent.top - 6);
      expect(spec.align).toBe('middle');
      expect(spec.bare).toBe(true);
    }
    card.remove();
  });

  test('idle coil in the light theme: a grey darker than the muted pipe colour; dark keeps the muted colour', async () => {
    const light = await mount({ model: 'B', dhw: 'external' }, { states: {}, themes: { darkMode: false } });
    const dark = await mount({ model: 'B', dhw: 'external' }, { states: {}, themes: { darkMode: true } });
    const property = (card: EcogeoCard): string =>
      /--ecogeo-coil-muted: ([^;]+)/.exec(root(card).querySelector('svg')?.getAttribute('style') ?? '')?.[1] ?? '';
    expect(property(light)).toBe(COIL_MUTED_LIGHT);
    expect(property(light)).not.toBe(MUTED_COLOR);
    // HA's default light disabled text colour is #bdbdbd (189): the coil grey is darker
    const level = Number.parseInt(property(light).slice(1, 3), 16);
    expect(property(light)).toMatch(/^#[0-9a-f]{6}$/);
    expect(level).toBeLessThan(0xbd);
    expect(property(dark)).toBe(MUTED_COLOR);
    expect(coilMutedColor(true)).toBe(MUTED_COLOR);
    // the muted helix strokes take that property
    const css = cabinetStyles.cssText.replace(/\s+/g, ' ');
    expect(css).toContain('.helix .pipe.muted { stroke: var(--ecogeo-coil-muted, var(--disabled-text-color)); }');
    // every muted half carries the muted class, so the rule applies to it; the back halves keep their faint opacity
    const halves = [...root(light).querySelectorAll('[data-segment="dhw_ext_coil"] path[data-half]')];
    expect(halves.every((half) => half.classList.contains('muted'))).toBe(true);
    expect(
      halves
        .filter((half) => half.getAttribute('data-half') === 'back')
        .every((half) => half.getAttribute('opacity') === '0.35'),
    ).toBe(true);
    light.remove();
    dark.remove();
  });

  test('idle coil 51 (model C) takes the coil grey; an active one keeps its temperature colour', async () => {
    const states = (name: 'heating' | 'dhw'): HassLike => ({
      states: Object.fromEntries(
        Object.entries(scenarioStates(SCENARIOS[name].states)).map(([id, value]) => [id, { entity_id: id, ...value }]),
      ),
      themes: { darkMode: false },
    });
    const heating = await mount({ prefix: DEMO_PREFIX, model: 'C' }, states('heating'));
    expect(root(heating).querySelector('[data-item="51"]')?.getAttribute('style')).toContain('--ecogeo-coil-muted');
    heating.remove();
    const dhw = await mount({ prefix: DEMO_PREFIX, model: 'C' }, states('dhw'));
    const style = root(dhw).querySelector('[data-item="51"]')?.getAttribute('style') ?? '';
    expect(style).not.toContain('--ecogeo-coil-muted');
    expect(style).not.toContain('--disabled-text-color');
    dhw.remove();
  });

  test('idle coil pipes: the part inside the tank is redrawn in the coil grey, clipped to the tank body', async () => {
    const light = { states: {}, themes: { darkMode: false } };
    const idle = await mount({ model: 'B', dhw: 'external' }, light);
    const overlays = [...root(idle).querySelectorAll('path.pipe-inside')];
    expect(overlays.map((overlay) => overlay.getAttribute('data-inside')).sort()).toEqual([
      'dhw_ext_in',
      'dhw_ext_out',
    ]);
    const clip = root(idle).querySelector('clipPath[data-tank-clip]');
    expect(clip?.id).toMatch(/-tank-clip$/);
    // the clip is the tank body's shape
    expect(clip?.querySelector('path')?.getAttribute('d')).toBe(
      root(idle).querySelector('path.tank-body[data-dhw-tank="external"]')?.getAttribute('d'),
    );
    for (const overlay of overlays) {
      expect(overlay.getAttribute('clip-path')).toBe(`url(#${clip?.id ?? ''})`);
      // same path as the pipe itself, so the grey changes only at the tank wall
      const pipe = root(idle).querySelector(`path.pipe[data-segment="${overlay.getAttribute('data-inside') ?? ''}"]`);
      expect(overlay.getAttribute('d')).toBe(pipe?.getAttribute('d'));
    }
    // the stroke is the coil's grey
    expect(cabinetStyles.cssText.replace(/\s+/g, ' ')).toContain(
      '.pipe-inside { fill: none; stroke: var(--ecogeo-coil-muted, var(--disabled-text-color));',
    );
    // two cards in one DOM: distinct clip ids
    const other = await mount({ model: 'B', dhw: 'external' }, light);
    expect(root(other).querySelector('clipPath[data-tank-clip]')?.id).not.toBe(clip?.id);
    other.remove();
    idle.remove();
    // no overlay while the pipes are active, and none without an external tank
    const active = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, hot);
    expect(root(active).querySelector('path.pipe-inside')).toBeNull();
    active.remove();
    const internal = await mount({ model: 'C' }, light);
    expect(root(internal).querySelector('path.pipe-inside')).toBeNull();
    expect(root(internal).querySelector('clipPath[data-tank-clip]')).toBeNull();
    internal.remove();
  });

  test('model C: coil 51 is drawn as a helix of the same kind (front solid, back faint)', async () => {
    const card = await mount({ model: 'C' });
    const coil = root(card).querySelector('[data-item="51"] .symbol.coil');
    const paths = [...(coil?.querySelectorAll('path[data-half]') ?? [])];
    const faint = paths.filter((path) => path.getAttribute('data-half') === 'back');
    const solid = paths.filter((path) => path.getAttribute('data-half') === 'front');
    expect(solid).toHaveLength(8);
    expect(faint).toHaveLength(7);
    // clean joints (refine-schematic-drawing D8a): backs first with butt caps, fronts on top with round caps
    const order = paths.map((path) => path.getAttribute('data-half'));
    expect(order.lastIndexOf('back')).toBeLessThan(order.indexOf('front'));
    for (const path of faint) expect(path.getAttribute('stroke-linecap')).toBe('butt');
    for (const path of solid) expect(path.getAttribute('stroke-linecap')).toBe('round');
    for (const path of solid) expect(path.hasAttribute('opacity')).toBe(false);
    for (const path of faint) expect(path.hasAttribute('opacity')).toBe(true);
    expect(root(card).querySelector('[data-item="52"]')).toBeNull();
    expect(root(card).querySelector('[data-item="53"]')).toBeNull();
    card.remove();
  });

  test('coil 51: closely pitched, round turns that fit tank 50 without touching probe 54', () => {
    const shape = COIL_51_SHAPE;
    // measure the front halves from their drawn paths: the range of each along the axis (the second coordinate)
    const axisRange = (d: string): { min: number; max: number } => {
      const [, y0 = 0, , y1 = 0, , y2 = 0, , y3 = 0] = (d.match(/-?[\d.]+/g) ?? []).map(Number);
      const ys = Array.from({ length: 33 }, (_, i) => {
        const t = i / 32;
        return (1 - t) ** 3 * y0 + 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3 * y3;
      });
      return { min: Math.min(...ys), max: Math.max(...ys) };
    };
    const front = helixHalves(shape)
      .filter((half) => half.front)
      .map((half) => axisRange(half.d));
    expect(front.length).toBeGreaterThanOrEqual(6);
    // adjacent front halves: about one stroke width (2) between their edges, so the centre lines are 2 + 2 apart at most
    for (let i = 1; i < front.length; i += 1) {
      const gap = (front[i]?.min ?? 0) - (front[i - 1]?.max ?? 0) - 2;
      expect(gap).toBeGreaterThan(0.5);
      expect(gap).toBeLessThanOrEqual(2.5);
    }
    // round: every front half bulges along the axis by over a third of the half height (the major radius)
    for (const range of front) expect(range.max - range.min).toBeGreaterThanOrEqual(shape.rx / 3);
    // the drawn curve (turned 90 degrees: the axis, shape y, lies along x; shape x is the height) stays inside
    // tank 50, clear of probe 54's circle (r 9)
    const extent = helixExtent(shape);
    const centre = COMPONENTS.find((component) => component.item === 51);
    const probe = COMPONENTS.find((component) => component.item === 54);
    if (centre === undefined || probe === undefined) throw new Error('no coil 51 or probe 54');
    const tank = INTERNAL_TANK;
    expect(centre.x + extent.bottom + 2).toBeLessThan(probe.x - 9);
    expect(centre.x + extent.bottom + 2).toBeLessThan(tank.x + tank.width);
    expect(centre.y + Math.max(extent.right - shape.cx, shape.cx - extent.left) + 2).toBeLessThan(tank.y + tank.height);
    expect(centre.y - Math.max(extent.right - shape.cx, shape.cx - extent.left) - 2).toBeGreaterThan(tank.y);
  });

  test('coil 51 port stubs reach the wall of tank 50, so the pipes change tone at the wall only', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'C' }, hot);
    const coil = root(card).querySelector('[data-item="51"]');
    const stubs = [...(coil?.querySelectorAll('path:not([data-half])') ?? [])].map(
      (path) => path.getAttribute('d') ?? '',
    );
    expect(stubs).toHaveLength(1);
    const left = [...(stubs[0] ?? '').matchAll(/(?:M|H)\s*(-?[\d.]+)/g)].map((match) => Number(match[1]));
    const centre = COMPONENTS.find((component) => component.item === 51);
    if (centre === undefined) throw new Error('no coil 51');
    // the leftmost x of the port path, in viewBox coordinates, is just inside the wall
    expect(centre.x + Math.min(...left)).toBe(INTERNAL_TANK.x + 2);
    card.remove();
  });

  test('internal (model C): tank 50 with coil 51, probe 54 and stubs 47 to 49, no trap 52 and no drain valve 53', async () => {
    const card = await mount({ model: 'C' });
    expect(items(card)).toEqual(expect.arrayContaining([47, 48, 49, 50, 51, 54, 26]));
    expect(items(card)).not.toContain(52);
    expect(items(card)).not.toContain(53);
    expect(items(card)).not.toContain(5);
    expect(items(card)).not.toContain(6);
    expect(tanks(card)).toEqual(['internal']);
    expect(segments(card)).toEqual(expect.arrayContaining(['tap_47', 'tap_48', 'tap_49']));
    expect(segments(card).some((id) => id.startsWith('dhw_ext_'))).toBe(false);
    expect(root(card).querySelector('.dhw-storage')).toBeNull();
    expect(root(card).querySelectorAll('[data-item] text:not(.glyph)')).toHaveLength(0);
    card.remove();
  });

  // model C always has its tank: dhw none is a configuration error there (card-config), so only model B here
  test('none: no tank, no DHW pipes, no ports 5 and 6, no valve 26 and no tank items', async () => {
    const card = await mount({ model: 'B', dhw: 'none' });
    expect(tanks(card)).toEqual([]);
    expect(root(card).querySelector('.dhw-storage')).toBeNull();
    for (const item of [5, 6, 26, 47, 48, 49, 50, 51, 52, 53, 54]) expect(items(card)).not.toContain(item);
    expect(segments(card).filter((id) => /^(dhw_|tap_)/.test(id))).toEqual([]);
    card.remove();
  });

  test('both tank bodies carry the hook for the DHW temperature colour', async () => {
    for (const model of ['B', 'C'] as const) {
      const card = await mount({ model });
      expect(root(card).querySelector('.tank-body')?.getAttribute('fill')).toContain('--dhw-tank-color');
      card.remove();
    }
  });
});

// dhw-storage "Unused DHW storage" (add-card-editor D6): the model's tank drawn muted, with no values.
describe('unused DHW storage', () => {
  const symbol = (card: EcogeoCard, item: number): Element | null =>
    root(card).querySelector(`g.symbol-group[data-item="${String(item)}"]`);
  const pipe = (card: EcogeoCard, id: string): Element | null =>
    root(card).querySelector(`path.pipe[data-segment="${id}"]`);
  const tankStyle = (card: EcogeoCard): string => root(card).querySelector('svg')?.getAttribute('style') ?? '';
  const hassOfScenario = (name: keyof typeof SCENARIOS): HassLike => ({
    states: Object.fromEntries(
      Object.entries(scenarioStates(SCENARIOS[name].states)).map(([id, value]) => [id, { entity_id: id, ...value }]),
    ),
  });

  // dhw-storage "Unused external tank"
  test('model B unused: the external tank, coil, pipes, ports 5 and 6 and valve 26 drawn muted, no values, nothing flows', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'unused' }, hassOfScenario('dhw'));
    expect(tanks(card)).toEqual(['external']);
    expect(root(card).querySelector('.dhw-storage')).not.toBeNull();
    expect(tankStyle(card)).toContain(`--dhw-tank-color: ${MUTED_COLOR}`);
    expect(items(card)).toEqual(expect.arrayContaining([5, 6, 26]));
    for (const item of [5, 6, 26]) expect(symbol(card, item)?.classList.contains('muted'), String(item)).toBe(true);
    for (const id of ['dhw_ext_in', 'dhw_ext_out']) expect(pipe(card, id)?.classList.contains('muted'), id).toBe(true);
    expect(root(card).querySelector('[data-segment="dhw_ext_coil"]')?.classList.contains('muted')).toBe(true);
    expect(root(card).querySelectorAll('[data-flow^="dhw_"], [data-flow^="tap_"]')).toHaveLength(0);
    expect(root(card).querySelectorAll('.label[data-label^="tank_"], [data-label^="tank_"]')).toHaveLength(0);
    card.remove();
  });

  // dhw-storage "Unused internal tank"
  test('model C unused: tank 50, coil 51 and the stubs drawn muted inside the cabinet, no values', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'C', dhw: 'unused' }, hassOfScenario('dhw'));
    expect(tanks(card)).toEqual(['internal']);
    expect(tankStyle(card)).toContain(`--dhw-tank-color: ${MUTED_COLOR}`);
    for (const item of [26, 47, 48, 49, 50, 51, 54]) {
      expect(symbol(card, item)?.classList.contains('muted'), String(item)).toBe(true);
    }
    for (const id of ['tap_47', 'tap_48', 'tap_49']) expect(pipe(card, id)?.classList.contains('muted'), id).toBe(true);
    expect(root(card).querySelector('.dhw-storage')).toBeNull();
    expect(segments(card).some((id) => id.startsWith('dhw_ext_'))).toBe(false);
    expect(root(card).querySelectorAll('[data-flow^="dhw_"], [data-flow^="tap_"]')).toHaveLength(0);
    expect(root(card).querySelectorAll('[data-label^="tank_"]')).toHaveLength(0);
    card.remove();
  });

  test('the unused tank has the same parts as the tank in use, only muted (both models)', async () => {
    for (const [model, dhw] of [
      ['B', 'external'],
      ['C', 'internal'],
    ] as const) {
      const inUse = await mount({ model, dhw });
      const unused = await mount({ model, dhw: 'unused' });
      expect(items(unused)).toEqual(items(inUse));
      expect(segments(unused)).toEqual(segments(inUse));
      inUse.remove();
      unused.remove();
    }
  });

  // dhw-storage "HTR kept with an unused tank"
  test('model C unused with HTR true: exchanger 9, pump 17 and valve 22 are drawn, as with internal', async () => {
    const unused = await mount({ model: 'C', dhw: 'unused', features: { htr: true } });
    const internal = await mount({ model: 'C', dhw: 'internal', features: { htr: true } });
    for (const item of [9, 17, 22]) expect(items(unused), String(item)).toContain(item);
    expect(items(unused)).toEqual(items(internal));
    // the HTR parts follow HTR, not the tank: they are not muted by the unused tank
    expect(symbol(unused, 9)?.classList.contains('muted')).toBe(false);
    expect(symbol(unused, 17)?.classList.contains('muted')).toBe(false);
    unused.remove();
    internal.remove();
  });

  test('HTR false or unused is followed with an unused tank; the discharge line routes as with a tank in use', async () => {
    const off = await mount({ model: 'C', dhw: 'unused', features: { htr: false } });
    expect(items(off)).not.toContain(17);
    const muted = await mount({ model: 'C', dhw: 'unused', features: { htr: 'unused' } });
    expect(symbol(muted, 17)?.classList.contains('muted')).toBe(true);
    expect(segments(off)).toContain('p1_up');
    expect(segments(off)).not.toContain('p1_direct');
    off.remove();
    muted.remove();
  });

  // dhw-storage "DHW mode with an unused tank"
  test('DHW mode with an unused tank: the label says DHW, tank, coil and DHW pipes stay muted', async () => {
    for (const model of ['B', 'C'] as const) {
      const card = await mount({ prefix: DEMO_PREFIX, model, dhw: 'unused' }, hassOfScenario('dhw'));
      expect(root(card).querySelector('.mode')?.textContent.trim()).toBe('DHW');
      for (const id of segments(card).filter((s) => /^(dhw_|tap_)/.test(s))) {
        expect(
          root(card)
            .querySelector(`path.pipe[data-segment="${id}"], g.helix[data-segment="${id}"]`)
            ?.classList.contains('muted'),
          id,
        ).toBe(true);
      }
      expect(root(card).querySelectorAll('[data-flow^="dhw_"], [data-flow^="tap_"]')).toHaveLength(0);
      card.remove();
    }
  });

  // dhw-storage "HTR recovery while heating"
  test('heating with HTR recovery: the DHW loop is coloured with the DHW temperature and animated, valve 26 to ports 1/2', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, hassOfScenario('heating_htr'));
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe('Heating');
    const hot = temperatureColor(46, DEFAULT_STOPS);
    for (const id of ['dhw_ext_in', 'dhw_ext_coil', 'dhw_ext_out']) {
      expect(root(card).querySelector(`[data-segment="${id}"]`)?.getAttribute('style'), id).toContain(hot);
      expect(root(card).querySelector(`[data-flow="${id}"]`), id).not.toBeNull();
    }
    expect(root(card).querySelector('[data-segment="dhw_sup_a"]')?.classList.contains('muted')).toBe(true);
    card.remove();
  });

  test('heating with HTR recovery on model C: coil 51 takes the DHW temperature and is never animated', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'C', dhw: 'internal' }, hassOfScenario('heating_htr'));
    expect(root(card).querySelector('[data-item="51"]')?.getAttribute('style')).toContain(
      temperatureColor(46, DEFAULT_STOPS),
    );
    expect(root(card).querySelectorAll('[data-flow="coil_51"]')).toHaveLength(0);
    card.remove();
  });

  test('HTR recovery with an unused tank does not animate the DHW pipes or the coil', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'C', dhw: 'unused' }, hassOfScenario('active_cooling_htr'));
    expect(root(card).querySelectorAll('[data-flow^="dhw_"], [data-flow^="htr_"], [data-flow^="tap_"]')).toHaveLength(
      0,
    );
    card.remove();
  });
});

// operating-mode "HTR recovery": the card passes whether `htr.active` has an entity (card-config "Optional roles")
describe('HTR recovery without the HTR state entity', () => {
  const HTR_ENTITY = `binary_sensor.${DEMO_PREFIX}_htr_active`;
  const hassWith = (htr: 'absent' | 'unavailable'): HassLike => {
    // active cooling, condensation capacity 1200 W
    const others = Object.entries(scenarioStates(SCENARIOS.active_cooling_htr.states))
      .filter(([id]) => id !== HTR_ENTITY)
      .map(([id, value]): [string, HassEntityState] => [id, { entity_id: id, ...value }]);
    if (htr === 'unavailable')
      others.push([HTR_ENTITY, { entity_id: HTR_ENTITY, state: 'unavailable', attributes: {} }]);
    return { states: Object.fromEntries(others) };
  };
  const flows = (card: EcogeoCard): number =>
    root(card).querySelectorAll('[data-flow^="htr_"], [data-flow^="dhw_ext"]').length;

  test('no entity: the condensation capacity rule shows the HTR segments and the DHW coil active', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, hassWith('absent'));
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe('Active cooling');
    expect(root(card).querySelector('[data-flow="htr_riser"]')).not.toBeNull();
    expect(root(card).querySelector('[data-flow="dhw_ext_coil"]')).not.toBeNull();
    card.remove();
  });

  test('the entity present but unavailable: HTR idle, no fallback because of a state', async () => {
    const card = await mount({ prefix: DEMO_PREFIX, model: 'B', dhw: 'external' }, hassWith('unavailable'));
    expect(root(card).querySelector('.mode')?.textContent.trim()).toBe('Active cooling');
    expect(flows(card)).toBe(0);
    expect(root(card).querySelector('[data-segment="htr_riser"]')?.classList.contains('muted')).toBe(true);
    card.remove();
  });
});
