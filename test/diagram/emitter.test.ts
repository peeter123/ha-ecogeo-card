// The heat emitter (rework-layouts D5; heating-emitter spec): where it is drawn, the underfloor passes and the radiator's
// columns, that it follows the DG1 production circuit (heating, DHW, passive cooling), its colours from supply to return, the
// radiator without a fill, and the DG1 demand on it.
import { describe, expect, test } from 'vitest';
import '../../src/index';
import { EcogeoCard } from '../../src/card/ecogeo-card';
import type { RolePath } from '../../src/config/roles';
import { temperatureColor } from '../../src/diagram/colors';
import { BAND, arrangementFor, crossingPoints, type EmitterShape, type Point } from '../../src/diagram/geometry';
import { MUTED_COLOR } from '../../src/diagram/colors';
import type { CardConfig } from '../../src/lib/config';
import type { HassLike } from '../../src/lib/hass';
import { DEMO_PREFIX, SCENARIOS, scenarioStates, type ScenarioName } from '../../dev/scenarios';

/** A card on the states of an emulator scenario with some roles overridden. */
async function mount(
  config: CardConfig = {},
  scenario: ScenarioName = 'heating',
  override: Partial<Record<RolePath, string>> = {},
): Promise<EcogeoCard> {
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: DEMO_PREFIX, ...config });
  const states = scenarioStates({ ...SCENARIOS[scenario].states, ...override });
  const hass: HassLike = {
    states: Object.fromEntries(Object.entries(states).map(([id, state]) => [id, { entity_id: id, ...state }])),
  };
  card.hass = hass;
  document.body.append(card);
  await card.updateComplete;
  return card;
}

const root = (card: EcogeoCard): ShadowRoot => {
  if (card.shadowRoot === null) throw new Error('no shadow root');
  return card.shadowRoot;
};
const emitterOf = (card: EcogeoCard): Element => {
  const element = root(card).querySelector('g.emitter');
  if (element === null) throw new Error('no emitter drawn');
  return element;
};
const pipe = (card: EcogeoCard, id: string): Element => {
  const element = root(card).querySelector(`path.pipe[data-segment="${id}"]`);
  if (element === null) throw new Error(`no pipe ${id}`);
  return element;
};
const flow = (card: EcogeoCard, id: string): Element | null => root(card).querySelector(`path.flow[data-flow="${id}"]`);
const strokeOf = (element: Element): string => /stroke:\s*([^;]+)/.exec(element.getAttribute('style') ?? '')?.[1] ?? '';

/** The two stops of the emitter's gradient: supply colour, return colour. */
function stops(card: EcogeoCard): { start: string; end: string; y1: number; y2: number; muted: string | null } {
  const gradient = root(card).querySelector('g.emitter linearGradient');
  if (gradient === null) throw new Error('no emitter gradient');
  const [start, end] = [...gradient.querySelectorAll('stop')].map(
    (stop) => /stop-color:\s*(.+?);?$/.exec(stop.getAttribute('style') ?? '')?.[1] ?? '',
  );
  return {
    start: start ?? '',
    end: end ?? '',
    y1: Number(gradient.getAttribute('y1')),
    y2: Number(gradient.getAttribute('y2')),
    muted: gradient.getAttribute('data-muted'),
  };
}

/** The emitter of the arrangement under a ground source with the external tank. */
function shapeOf(kind: 'underfloor' | 'radiator'): EmitterShape {
  const shape = arrangementFor('horizontal', { source: 'ground', tank: true, emitter: kind }).emitter;
  if (shape === undefined) throw new Error('no emitter');
  return shape;
}

const BOTH = { 'production.outlet_temperature': '35', 'production.return_temperature': '30' } as const;
const HOT = temperatureColor(35);
const COLD = temperatureColor(30);

describe('heating-emitter "Emitter above connections 1/2"', () => {
  test('default emitter: an underfloor loop above connections 1 and 2, joined to both, no pipe crossing outside the cabinet', () => {
    const arrangement = arrangementFor('horizontal', { source: 'ground', tank: true, emitter: 'underfloor' });
    const { emitter, cabinet, ports } = arrangement;
    expect(emitter?.kind).toBe('underfloor');
    if (emitter === undefined) return;
    // above the cabinet, in the first slot of the band, over ports 1 and 2
    expect(emitter.y + emitter.height).toBe(arrangement.band.bottom);
    expect(emitter.x).toBeLessThan(ports[1]);
    expect(emitter.x + emitter.width).toBeGreaterThan(ports[2]);
    expect(emitter.x + emitter.width + BAND.gap).toBeLessThanOrEqual(
      arrangement.airUnit?.x ?? arrangement.collector?.x ?? Infinity,
    );
    // joined to both ports
    const sup = arrangement.segments.find((segment) => segment.id === 'dg1_sup');
    const ret = arrangement.segments.find((segment) => segment.id === 'dg1_ret');
    expect(sup?.points[0]).toEqual([ports[1], cabinet.y]);
    expect(sup?.points.at(-1)).toEqual(emitter.inlet);
    expect(ret?.points[0]).toEqual(emitter.outlet);
    expect(ret?.points.at(-1)).toEqual([ports[2], cabinet.y]);
    // no pipe crosses another outside the cabinet
    const pipes = arrangement.segments.filter((segment) => segment.shape === undefined && segment.stub !== true);
    pipes.forEach((one, index) => {
      for (const two of pipes.slice(index + 1)) {
        const found = crossingPoints(one.points, two.points).filter(([, y]) => y < cabinet.y);
        expect(found, `${one.id} x ${two.id}`).toEqual([]);
      }
    });
    // the spiral's runs cross neither connection pipe
    for (const segment of pipes.filter((one) => !one.id.startsWith('dg1_loop'))) {
      expect(crossingPoints(emitter.loopIn, segment.points), segment.id).toEqual([]);
      expect(crossingPoints(emitter.loopOut, segment.points), segment.id).toEqual([]);
    }
  });

  test('no emitter: nothing drawn, connections 1 and 2 end in short stubs above the cabinet', async () => {
    const card = await mount({ emitter: 'none' });
    expect(root(card).querySelector('g.emitter')).toBeNull();
    expect(pipe(card, 'p1_stub')).toBeDefined();
    expect(pipe(card, 'p2_stub')).toBeDefined();
    expect(root(card).querySelector('[data-segment="dg1_sup"]')).toBeNull();
    expect(root(card).querySelector('[data-segment="dg1_ret"]')).toBeNull();
    card.remove();
  });

  test('the emitter drawn: no stubs, the supply and return pipes in their place', async () => {
    for (const emitter of ['underfloor', 'radiator'] as const) {
      const card = await mount({ emitter });
      expect(root(card).querySelector('[data-segment="p1_stub"]')).toBeNull();
      expect(root(card).querySelector('[data-segment="p2_stub"]')).toBeNull();
      pipe(card, 'dg1_sup');
      pipe(card, 'dg1_ret');
      card.remove();
    }
  });

  test('the emitter is outside the unit and cites no manual item', async () => {
    const card = await mount({ emitter: 'underfloor' });
    const element = emitterOf(card);
    expect(element.hasAttribute('data-item')).toBe(false);
    expect(element.querySelector('title')?.textContent).toBe('Underfloor heating');
    card.remove();
  });
});

/** The two runs of the underfloor spiral as one path, from the inlet to the outlet. */
const spiralOf = (shape: EmitterShape): Point[] => [...shape.loopIn, ...shape.loopOut.slice(1)];

/** The distance of a point from a segment. */
function distance(point: Point, from: Point, to: Point): number {
  const [px, py] = point;
  const [ax, ay] = from;
  const [bx, by] = to;
  const length = (bx - ax) ** 2 + (by - ay) ** 2;
  const t = length === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * (bx - ax) + (py - ay) * (by - ay)) / length));
  return Math.hypot(px - (ax + t * (bx - ax)), py - (ay + t * (by - ay)));
}

describe('heating-emitter "Underfloor loop drawing"', () => {
  test('a bifilar spiral of two or three inward turns, a pitch of at least 12, both ends on the bottom face', async () => {
    const card = await mount({ emitter: 'underfloor' });
    const shape = shapeOf('underfloor');
    const face = shape.y + shape.height;
    // the inward run: up the feed, then four corners per turn (left, top left, top right, down to the next turn) and the
    // reversal; so its vertices number 2 + 3 * turns + (turns - 1) + 1 = 4 * turns + 2
    const turns = (shape.loopIn.length - 2) / 4;
    expect(Number.isInteger(turns)).toBe(true);
    expect(turns).toBeGreaterThanOrEqual(2);
    expect(turns).toBeLessThanOrEqual(3);
    expect(shape.pitch).toBeGreaterThanOrEqual(12);
    // inside the body's rectangle, at the band's margin
    for (const [x, y] of spiralOf(shape).slice(1, -1)) {
      expect(x).toBeGreaterThanOrEqual(shape.x + BAND.margin);
      expect(x).toBeLessThanOrEqual(shape.x + shape.width - BAND.margin);
      expect(y).toBeGreaterThanOrEqual(shape.y + BAND.margin);
      expect(y).toBeLessThanOrEqual(face - BAND.margin);
    }
    // both ends on the bottom face, where the supply and return pipes meet them
    expect(shape.inlet).toEqual([shape.feedX, face]);
    expect(shape.outlet).toEqual([shape.exitX, face]);
    expect(shape.loopIn[0]).toEqual(shape.inlet);
    expect(shape.loopOut.at(-1)).toEqual(shape.outlet);
    expect(shape.loopIn.at(-1)).toEqual(shape.loopOut[0]);
    // drawn as two pipe segments with rounded bends, and the rectangle
    for (const id of ['dg1_loop_in', 'dg1_loop_out']) {
      expect(pipe(card, id).getAttribute('d') ?? '', id).toMatch(/A/);
    }
    expect(root(card).querySelector('g.emitter rect.emitter-outline')).not.toBeNull();
    const sup = arrangementFor('horizontal', { source: 'ground', tank: true, emitter: 'underfloor' }).segments.find(
      (segment) => segment.id === 'dg1_sup',
    );
    expect(sup?.points.at(-1)).toEqual(shape.inlet);
    card.remove();
  });

  test('the spiral does not cross itself and its runs stay a pitch apart', () => {
    const shape = shapeOf('underfloor');
    expect(crossingPoints(shape.loopIn, shape.loopOut)).toEqual([]);
    for (const run of [shape.loopIn, shape.loopOut]) {
      for (let one = 0; one < run.length - 1; one += 1) {
        for (let two = one + 2; two < run.length - 1; two += 1) {
          expect(
            crossingPoints(run.slice(one, one + 2), run.slice(two, two + 2)),
            `${String(one)} x ${String(two)}`,
          ).toEqual([]);
        }
      }
    }
    // a vertex of one run is a pitch from every segment of the other, bar those at the shared reversal
    const reversal = shape.loopIn.at(-1);
    const apart = (these: readonly Point[], others: readonly Point[]): void => {
      for (const point of these) {
        for (let index = 0; index < others.length - 1; index += 1) {
          const from = others[index];
          const to = others[index + 1];
          if (from === undefined || to === undefined || from === reversal || to === reversal) continue;
          expect(distance(point, from, to)).toBeGreaterThanOrEqual(shape.pitch - 1e-9);
        }
      }
    };
    apart(shape.loopIn.slice(0, -1), shape.loopOut.slice(1));
    apart(shape.loopOut.slice(1), shape.loopIn.slice(0, -1));
  });
});

describe('heating-emitter "Radiator drawing"', () => {
  test('a body with at least four vertical columns, the supply at the top on one side and the return at the bottom on the other', async () => {
    const card = await mount({ emitter: 'radiator' });
    const shape = shapeOf('radiator');
    expect(root(card).querySelectorAll('g.emitter rect.emitter-column').length).toBeGreaterThanOrEqual(4);
    expect(shape.columns.length).toBeGreaterThanOrEqual(4);
    for (const column of shape.columns) expect(column.height).toBeGreaterThan(column.width);
    const middle = shape.x + shape.width / 2;
    const middleY = shape.y + shape.height / 2;
    expect(shape.inlet[0]).toBeLessThan(middle);
    expect(shape.inlet[1]).toBeLessThan(middleY);
    expect(shape.outlet[0]).toBeGreaterThan(middle);
    expect(shape.outlet[1]).toBeGreaterThan(middleY);
    expect(emitterOf(card).querySelector('title')?.textContent).toBe('Radiator');
    expect(root(card).querySelector('path[data-emitter-loop]')).toBeNull();
    card.remove();
  });
});

describe('heating-emitter "Emitter follows the DG1 production circuit"', () => {
  test('heating: the supply has the 35.0 degrees colour, the return the 30.0 degrees colour, and the flow is animated', async () => {
    for (const emitter of ['underfloor', 'radiator'] as const) {
      const card = await mount({ emitter }, 'heating', BOTH);
      expect(strokeOf(pipe(card, 'dg1_sup')), emitter).toBe(HOT);
      expect(strokeOf(pipe(card, 'dg1_ret')), emitter).toBe(COLD);
      expect(flow(card, 'dg1_sup'), emitter).not.toBeNull();
      expect(flow(card, 'dg1_ret'), emitter).not.toBeNull();
      expect(emitterOf(card).classList.contains('muted'), emitter).toBe(false);
      if (emitter === 'underfloor') {
        expect(flow(card, 'dg1_loop_in')).not.toBeNull();
        expect(flow(card, 'dg1_loop_out')).not.toBeNull();
        // the flow runs in from the feed on the bottom face and back out from the reversal in the centre
        const shape = shapeOf('underfloor');
        const start = (id: string): number[] =>
          (flow(card, id)?.getAttribute('d') ?? '')
            .split(/[^0-9.-]+/)
            .filter(Boolean)
            .slice(0, 2)
            .map(Number);
        expect(start('dg1_loop_in')).toEqual([...shape.inlet]);
        expect(start('dg1_loop_out')).toEqual([...(shape.loopOut[0] ?? [])]);
      }
      card.remove();
    }
  });

  test('DHW mode: the emitter and its pipes are muted and not animated', async () => {
    for (const emitter of ['underfloor', 'radiator'] as const) {
      const card = await mount({ emitter }, 'dhw', BOTH);
      expect(pipe(card, 'dg1_sup').classList.contains('muted'), emitter).toBe(true);
      expect(pipe(card, 'dg1_ret').classList.contains('muted'), emitter).toBe(true);
      expect(emitterOf(card).classList.contains('muted'), emitter).toBe(true);
      expect(flow(card, 'dg1_sup'), emitter).toBeNull();
      expect(flow(card, 'dg1_ret'), emitter).toBeNull();
      expect(flow(card, 'dg1_loop_in'), emitter).toBeNull();
      expect(flow(card, 'dg1_loop_out'), emitter).toBeNull();
      if (emitter === 'underfloor') {
        expect(pipe(card, 'dg1_loop_in').classList.contains('muted')).toBe(true);
        expect(pipe(card, 'dg1_loop_out').classList.contains('muted')).toBe(true);
      } else {
        expect(stops(card), emitter).toMatchObject({ start: MUTED_COLOR, end: MUTED_COLOR, muted: 'true' });
      }
      card.remove();
    }
  });

  test('passive cooling: the emitter and its pipes are coloured by the production temperatures and animated', async () => {
    for (const emitter of ['underfloor', 'radiator'] as const) {
      const card = await mount({ emitter }, 'passive_cooling', BOTH);
      expect(strokeOf(pipe(card, 'dg1_sup')), emitter).toBe(HOT);
      expect(strokeOf(pipe(card, 'dg1_ret')), emitter).toBe(COLD);
      expect(flow(card, 'dg1_sup'), emitter).not.toBeNull();
      expect(flow(card, 'dg1_ret'), emitter).not.toBeNull();
      expect(emitterOf(card).classList.contains('muted'), emitter).toBe(false);
      card.remove();
    }
  });
});

describe('heating-emitter "Emitter colours from supply to return"', () => {
  test('underfloor: the inward run has the 35.0 degrees colour, the outward run the 30.0 degrees colour, no gradient', async () => {
    const card = await mount({ emitter: 'underfloor' }, 'heating', BOTH);
    expect(strokeOf(pipe(card, 'dg1_loop_in'))).toBe(HOT);
    expect(strokeOf(pipe(card, 'dg1_loop_out'))).toBe(COLD);
    expect(root(card).querySelector('g.emitter linearGradient')).toBeNull();
    card.remove();
  });

  test('underfloor: exchanger_fill none changes nothing in the runs', async () => {
    const card = await mount({ emitter: 'underfloor', exchanger_fill: 'none' }, 'heating', BOTH);
    expect(strokeOf(pipe(card, 'dg1_loop_in'))).toBe(HOT);
    expect(strokeOf(pipe(card, 'dg1_loop_out'))).toBe(COLD);
    card.remove();
  });

  test('radiator: the body is filled from the supply colour at the top to the return colour at the bottom', async () => {
    const card = await mount({ emitter: 'radiator' }, 'heating', BOTH);
    const shape = shapeOf('radiator');
    const gradient = stops(card);
    expect(gradient).toMatchObject({ start: HOT, end: COLD, y1: shape.y, y2: shape.y + shape.height });
    const fill = root(card).querySelector('g.emitter rect.emitter-outline')?.getAttribute('fill') ?? '';
    const id = /^url\(#(.+)\)$/.exec(fill)?.[1] ?? '';
    expect(root(card).querySelector(`g.emitter linearGradient[id="${id}"]`)).not.toBeNull();
    card.remove();
  });

  test('radiator without fill: no fill on the body, its outline and pipes drawn as with a fill', async () => {
    const withFill = await mount({ emitter: 'radiator' }, 'heating', BOTH);
    const bare = await mount({ emitter: 'radiator', exchanger_fill: 'none' }, 'heating', BOTH);
    const body = (card: EcogeoCard): Element | null => root(card).querySelector('g.emitter rect.emitter-outline');
    expect(body(bare)?.getAttribute('fill')).toBe('none');
    expect(body(withFill)?.getAttribute('fill')).toMatch(/^url\(#/);
    // the outline, the columns and the pipes are the same
    expect(body(bare)?.getAttribute('class')).toBe(body(withFill)?.getAttribute('class'));
    expect(root(bare).querySelectorAll('g.emitter rect.emitter-column')).toHaveLength(
      root(withFill).querySelectorAll('g.emitter rect.emitter-column').length,
    );
    expect(strokeOf(pipe(bare, 'dg1_sup'))).toBe(HOT);
    expect(strokeOf(pipe(bare, 'dg1_ret'))).toBe(COLD);
    expect(flow(bare, 'dg1_sup')).not.toBeNull();
    withFill.remove();
    bare.remove();
  });

  test('a missing production probe mutes its pipe and the gradient takes the muted colour at that end', async () => {
    const card = await mount({ emitter: 'radiator' }, 'heating', { 'production.return_temperature': 'unavailable' });
    expect(pipe(card, 'dg1_ret').classList.contains('muted')).toBe(true);
    expect(stops(card)).toMatchObject({
      start: expect.not.stringMatching(/^var\(--disabled/) as string,
      end: MUTED_COLOR,
    });
    card.remove();
  });
});
