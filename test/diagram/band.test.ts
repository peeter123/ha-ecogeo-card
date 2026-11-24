// The band above the cabinet (rework-layouts D3, schematic-drawing "Band arrangement" and "Arrangement keeps the topology",
// outer-loop-source "Source above connections 3/4", dhw-storage "External tank above connections 5/6"): the slot plan,
// the order of the parts, the short joins with at most one jog, and the bodies in their slots for every source and DHW
// storage, in both layouts. The cabinet's own rules are in simplified.test.ts.
import { describe, expect, test } from 'vitest';
import '../../src/index';
import type { EcogeoCard } from '../../src/card/ecogeo-card';
import { EMITTERS, SOURCES } from '../../src/config/options';
import {
  BAND,
  arrangementFor,
  bandJogs,
  bandAssignment,
  bandGroupsOf,
  bandKeyOf,
  crossingPoints,
  jogSpans,
  planBand,
  sourceWidth,
  type BandKey,
  type Point,
  type Segment,
  type ShownLayout,
} from '../../src/diagram/geometry';

const LAYOUTS: readonly ShownLayout[] = ['horizontal', 'vertical'];

const KEYS: BandKey[] = SOURCES.flatMap((source) =>
  [true, false].flatMap((tank) => EMITTERS.map((emitter): BandKey => ({ source, tank, emitter }))),
);
const name = (layout: ShownLayout, key: BandKey): string => `${layout}: ${keyName(key)}`;
const keyName = (key: BandKey): string => `${key.source} ${key.tank ? 'with' : 'without'} tank, emitter ${key.emitter}`;

/** The segments of the band's pipes: the emitter's, the source's and the external tank's. */
const bandPipes = (segments: readonly Segment[]): Segment[] =>
  segments.filter(
    (segment) => segment.id.startsWith('src_') || segment.id.startsWith('dhw_ext_') || segment.id.startsWith('dg1_'),
  );

describe('planBand', () => {
  const bounds = { min: 10, max: 990 };
  test('each part is centred over its port pair where its width allows', () => {
    const slots = planBand(
      [
        { name: 'emitter', centre: 200, width: 100 },
        { name: 'source', centre: 500, width: 100 },
        { name: 'tank', centre: 800, width: 100 },
      ],
      bounds,
      24,
    );
    expect(slots).toEqual({
      emitter: { x0: 150, x1: 250 },
      source: { x0: 450, x1: 550 },
      tank: { x0: 750, x1: 850 },
    });
  });

  test('parts that would come closer than the gap move apart and keep their order', () => {
    const slots = planBand(
      [
        { name: 'source', centre: 500, width: 200 },
        { name: 'tank', centre: 560, width: 100 },
      ],
      bounds,
      24,
    );
    expect(slots.source?.x1 ?? 0).toBeLessThanOrEqual((slots.tank?.x0 ?? 0) - 24 + 1e-9);
    expect((slots.tank?.x0 ?? 0) - (slots.source?.x1 ?? 0)).toBeCloseTo(24);
    // the pair moves as one: the source left of its ports, the tank right of its own
    expect(slots.source?.x0 ?? 0).toBeLessThan(400);
    expect(slots.tank?.x0 ?? 0).toBeGreaterThan(510);
  });

  test('the bounds hold: a part at the edge is pushed in, and its neighbour gives way', () => {
    const slots = planBand(
      [
        { name: 'source', centre: 700, width: 300 },
        { name: 'tank', centre: 960, width: 160 },
      ],
      bounds,
      24,
    );
    expect(slots.tank?.x1).toBe(990);
    expect(slots.source?.x1 ?? 0).toBeLessThanOrEqual((slots.tank?.x0 ?? 0) - 24 + 1e-9);
  });

  test('an empty part (width 0) has no slot and gives its space to the others', () => {
    const items = [
      { name: 'emitter', centre: 200, width: 0 },
      { name: 'source', centre: 300, width: 400 },
      { name: 'tank', centre: 560, width: 100 },
    ] as const;
    const slots = planBand(items, bounds, 24);
    expect(slots.emitter).toBeUndefined();
    // with the emitter's slot empty the source may reach left over it
    const filled = planBand([{ name: 'emitter', centre: 200, width: 160 }, ...items.slice(1)], bounds, 24);
    expect(filled.emitter).toBeDefined();
    expect(slots.source?.x0 ?? 0).toBeLessThan(filled.source?.x0 ?? 0);
  });
});

describe.each(LAYOUTS.flatMap((layout) => KEYS.map((key) => [name(layout, key), layout, key] as const)))(
  'the band: %s',
  (_name, layout, key) => {
    const arrangement = arrangementFor(layout, key);
    const { cabinet, band, ports, slots } = arrangement;
    const top = cabinet.y;
    const levels = bandJogs(top, layout);

    test('the band lies above the cabinet with the join lane between: bodies stand on the band bottom', () => {
      expect(band.bottom).toBe(top - BAND.joinLane);
      expect(band.top).toBe(BAND.top);
      for (const shape of [arrangement.emitter, arrangement.airUnit, arrangement.collector, arrangement.externalTank]) {
        if (shape === undefined) continue;
        expect(shape.y + shape.height).toBe(band.bottom);
        expect(shape.y).toBeGreaterThanOrEqual(band.top);
      }
      // every jog is below the band and above the stubs of connections 47-49 (12 units over the top edge)
      for (const level of Object.values(levels)) {
        expect(level).toBeGreaterThan(band.bottom);
        expect(level).toBeLessThan(top - 12);
      }
    });

    test('band order: the emitter, the source and the tank, each in its slot, and nothing lies beside the cabinet', () => {
      const sourceSlot = slots.source;
      expect(sourceSlot).toBeDefined();
      if (key.emitter === 'none') {
        expect(slots.emitter).toBeUndefined();
        expect(arrangement.emitter).toBeUndefined();
      } else {
        expect(slots.emitter).toBeDefined();
        expect((slots.emitter?.x1 ?? 0) - (slots.emitter?.x0 ?? 0)).toBe(BAND.emitter.width);
        expect((slots.emitter?.x1 ?? 0) + BAND.gap).toBeLessThanOrEqual((sourceSlot?.x0 ?? 0) + 1e-9);
        expect(arrangement.emitter?.kind).toBe(key.emitter);
        expect(arrangement.emitter?.x).toBe(slots.emitter?.x0);
      }
      expect((sourceSlot?.x1 ?? 0) - (sourceSlot?.x0 ?? 0)).toBe(sourceWidth(key.source));
      if (key.tank) {
        expect(slots.tank).toBeDefined();
        expect((sourceSlot?.x1 ?? 0) + BAND.gap).toBeLessThanOrEqual((slots.tank?.x0 ?? 0) + 1e-9);
      } else {
        expect(slots.tank).toBeUndefined();
      }
      for (const slot of Object.values(slots)) {
        expect(slot.x0).toBeGreaterThanOrEqual(cabinet.x);
        expect(slot.x1).toBeLessThanOrEqual(cabinet.x + cabinet.width);
      }
      // the bodies sit in their slots: the air unit first, then the collector
      const { airUnit, collector, externalTank } = arrangement;
      if (key.source === 'air') expect(airUnit?.x).toBe(sourceSlot?.x0);
      if (key.source === 'ground') expect(collector?.x).toBe(sourceSlot?.x0);
      if (key.source === 'hybrid') {
        expect(airUnit?.x).toBe(sourceSlot?.x0);
        expect((airUnit?.x ?? 0) + BAND.air.width).toBeLessThan(collector?.x ?? 0);
        expect((collector?.x ?? 0) + BAND.collector.width).toBe(sourceSlot?.x1);
      }
      if (key.tank) expect(externalTank?.x).toBe(slots.tank?.x0);
      else expect(externalTank).toBeUndefined();
      if (key.source === 'air') expect(collector).toBeUndefined();
      if (key.source === 'ground') expect(airUnit).toBeUndefined();
    });

    test('ports 1 to 6 keep their order on the top edge and the ports of the band lie in the cabinet columns', () => {
      const xs = [ports[1], ports[2], ports[3], ports[4], ports[5], ports[6]];
      expect(xs).toEqual([...xs].sort((a, b) => a - b));
      for (const x of xs) {
        expect(x).toBeGreaterThan(cabinet.x);
        expect(x).toBeLessThan(cabinet.x + cabinet.width);
      }
    });

    test('short joins: each pipe rises straight from its port into the join lane, jogs at most once there, then rises into its part', () => {
      const pipes = new Map(bandPipes(arrangement.segments).map((segment) => [segment.id, segment.points] as const));
      const chains: [string, Point[]][] = [];
      const get = (id: string): Point[] => [...(pipes.get(id) ?? [])];
      const join = (...ids: string[]): Point[] =>
        ids.flatMap((id, index) => (index === 0 ? get(id) : get(id).slice(1)));
      const feed = { air: 'src_air_feed', ground: 'src_gnd_feed', hybrid: 'src_hyb_feed' }[key.source];
      const exit = { air: 'src_air_exit', ground: 'src_gnd_exit', hybrid: 'src_hyb_exit' }[key.source];
      chains.push(['port 3', join('src_out', feed)], ['port 4', join(exit, 'src_in')]);
      if (key.emitter !== 'none') chains.push(['port 1', get('dg1_sup')], ['port 2', get('dg1_ret')]);
      if (key.source === 'hybrid') chains.push(['link', get('src_hyb_link')]);
      if (key.tank) chains.push(['port 5', get('dhw_ext_in')], ['port 6', get('dhw_ext_out')]);
      for (const [what, points] of chains) {
        const pieces = points.slice(1).map((end, index) => [points[index] ?? end, end] as const);
        // the pipes of ports 3-6 start (or end) on the top edge with a vertical piece
        if (what !== 'link') {
          const port = what === 'port 2' || what === 'port 4' || what === 'port 6' ? pieces.at(-1) : pieces[0];
          expect(port?.[0][0], what).toBe(port?.[1][0]);
          expect(Math.max(port?.[0][1] ?? 0, port?.[1][1] ?? 0), what).toBe(top);
        }
        // the horizontal pieces that lie in the join lane: at most one
        const horizontal = pieces.filter(([from, to]) => from[1] === to[1] && from[1] > band.bottom);
        expect(horizontal.length, what).toBeLessThanOrEqual(1);
        for (const [from] of horizontal) expect(from[1], what).toBeLessThan(top);
        // nothing of the join runs above the cabinet's top edge or over the band's bodies: every point is in the lane or in the body it ends in
        for (const [x, y] of points) {
          expect(y, `${what} ${String(x)}`).toBeLessThanOrEqual(top);
          expect(y, `${what} ${String(x)}`).toBeGreaterThanOrEqual(band.top);
        }
      }
      // a pipe never passes another part's x range: the source's join pipes stay out of the tank's, and the tank's out of the source's
      if (key.tank && slots.tank !== undefined && slots.source !== undefined) {
        const reach = (ids: string[]): [number, number] => {
          const xs = ids.flatMap((id) =>
            get(id)
              .filter(([, y]) => y > band.bottom)
              .map(([x]) => x),
          );
          return [Math.min(...xs), Math.max(...xs)];
        };
        const [from, to] = reach([
          'src_out',
          feed,
          exit,
          'src_in',
          ...(key.source === 'hybrid' ? ['src_hyb_link'] : []),
        ]);
        expect(from).toBeGreaterThanOrEqual(Math.min(slots.source.x0, ports[3]) - 1);
        expect(to).toBeLessThanOrEqual(Math.max(slots.source.x1, ports[4]) + 1);
        // the vertical layout's tank slot covers port 4: the source's join rises under it, up to its own port, and no further
        if (layout === 'horizontal') expect(to).toBeLessThan(slots.tank.x0);
        else expect(to).toBeLessThanOrEqual(ports[4] + 1);
        const [tankFrom, tankTo] = reach(['dhw_ext_in', 'dhw_ext_out']);
        expect(tankFrom).toBeGreaterThan(slots.source.x1);
        expect(tankTo).toBeLessThanOrEqual(slots.tank.x1);
      }
    });

    test('no two pipes cross outside the cabinet: the band pipes cross nothing, and nothing crosses them', () => {
      const outside = bandPipes(arrangement.segments);
      const all = arrangement.segments.filter((segment) => segment.shape === undefined && segment.stub !== true);
      outside.forEach((one) => {
        for (const two of all) {
          if (one.id === two.id || one.shape !== undefined) continue;
          // pipes of a source that is not drawn together are skipped by the key: this arrangement only has this key's
          const found = crossingPoints(one.points, two.points).filter(([, y]) => y < top);
          expect(found, `${one.id} x ${two.id}`).toEqual([]);
        }
      });
    });
  },
);

/**
 * The pipes that do not run on the jog level, per layout and band key: the pipe, and the level it uses (1 is the second level,
 * 2 the third). The explicit lists keep the lifts from spreading silently (harmonize-band D3).
 */
const moved = (
  source: BandKey['source'],
  tank: boolean,
  pipes: Record<string, number>,
): Record<string, Record<string, number>> =>
  Object.fromEntries(EMITTERS.map((emitter) => [keyName({ source, tank, emitter }), pipes]));
const TANK_2 = { dhw_ext_in: 2, dhw_ext_out: 2 };
const MOVED: Record<ShownLayout, Record<string, Record<string, number>>> = {
  // port 3's and port 4's pipes of an air unit that sits left of its ports overlap; the hybrid's link passes port 3
  horizontal: {
    ...moved('air', true, { src_in: 1 }),
    ...moved('hybrid', true, { src_hyb_link: 1 }),
    ...moved('hybrid', false, { src_hyb_link: 1 }),
  },
  // the source's slot lies left of its ports, so port 4's pipe passes port 3's riser, and the tank's pipes pass port 4's
  vertical: {
    ...moved('air', true, { src_in: 1, ...TANK_2 }),
    ...moved('air', false, { src_in: 1 }),
    ...moved('ground', true, { src_in: 1, ...TANK_2 }),
    ...moved('hybrid', true, { src_hyb_link: 1, src_in: 1, ...TANK_2 }),
    ...moved('hybrid', false, { src_hyb_link: 1 }),
  },
};

/** The pipes of an arrangement that run on a level other than the jog level, with their level (1 or 2). */
const movedPipes = (layout: ShownLayout, key: BandKey): Record<string, number> => {
  const arrangement = arrangementFor(layout, key);
  const levels = bandJogs(arrangement.cabinet.y, layout);
  const moved: Record<string, number> = {};
  for (const span of jogSpans(arrangement).spans) {
    const index = [levels.jog, levels.second, levels.third].indexOf(span.level);
    if (index > 0) moved[span.pipe] = index;
  }
  return moved;
};

// harmonize-band D3, schematic-drawing "One jog level", scenario "One level where it fits".
describe('one jog level: one level where it fits', () => {
  test.each(EMITTERS.flatMap((emitter) => [true, false].map((tank) => [emitter, tank] as const)))(
    'horizontal ground, emitter %s, tank %s: every section on one height and no conflicts',
    (emitter, tank) => {
      const arrangement = arrangementFor('horizontal', { source: 'ground', tank, emitter });
      const { spans, conflicts } = jogSpans(arrangement);
      expect(spans.length).toBeGreaterThan(0);
      expect(new Set(spans.map((span) => span.level)).size).toBe(1);
      expect(conflicts).toEqual([]);
    },
  );
});

/** The number of pipes a level assignment lifts off the jog level: the tank's group is two pipes. */
const liftedCount = (assigned: Readonly<Record<string, number>>): number =>
  Object.entries(assigned).reduce((sum, [group, level]) => sum + (level > 0 ? (group === 'tank' ? 2 : 1) : 0), 0);

// scenario "Lowest levels": no conflicts, the lifted pipes are the listed ones, and no assignment lifting fewer pipes is free of conflicts.
describe.each(LAYOUTS)('one jog level: lowest levels, %s', (layout) => {
  test('every band key breaks no planarity, and the pipes off the jog level are exactly the listed ones', () => {
    const used: Record<string, Record<string, number>> = {};
    for (const key of KEYS) {
      expect(jogSpans(arrangementFor(layout, key)).conflicts, name(layout, key)).toEqual([]);
      const moved = movedPipes(layout, key);
      if (Object.keys(moved).length > 0) used[keyName(key)] = moved;
    }
    expect(used).toEqual(MOVED[layout]);
  });

  test('no assignment that lifts fewer pipes is free of conflicts', () => {
    for (const key of KEYS) {
      const lifted = Object.keys(movedPipes(layout, key)).length;
      if (lifted === 0) continue;
      const groups = bandGroupsOf(key);
      const total = 3 ** groups.length;
      for (let n = 0; n < total; n += 1) {
        const assigned = Object.fromEntries(groups.map((group, index) => [group, Math.floor(n / 3 ** index) % 3]));
        if (liftedCount(assigned) >= lifted) continue;
        const { segments, band } = bandAssignment(layout, key, assigned);
        expect(
          jogSpans({ segments, band }).conflicts.length,
          `${name(layout, key)} ${JSON.stringify(assigned)}`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe('the band key of a draw context', () => {
  test('the source, whether the external tank is drawn, and the emitter (underfloor unless set)', () => {
    expect(bandKeyOf({ model: 'B', dhw: 'external', source: 'air' })).toEqual({
      source: 'air',
      tank: true,
      emitter: 'underfloor',
      internal: false,
    });
    expect(bandKeyOf({ model: 'B', dhw: 'external', source: 'air', emitter: 'radiator' }).emitter).toBe('radiator');
    expect(bandKeyOf({ model: 'B', dhw: 'external', source: 'air', emitter: 'none' }).emitter).toBe('none');
    // an unused tank of model B is drawn (muted); model C draws its own inside the cabinet
    expect(bandKeyOf({ model: 'B', dhw: 'unused', source: 'ground' }).tank).toBe(true);
    expect(bandKeyOf({ model: 'C', dhw: 'unused', source: 'ground' }).tank).toBe(false);
    expect(bandKeyOf({ model: 'C', dhw: 'internal', source: 'hybrid' }).tank).toBe(false);
    expect(bandKeyOf({ model: 'B', dhw: 'none', source: 'hybrid' }).tank).toBe(false);
  });

  // schematic-drawing "One body height in the band": every body stands on the band's bottom edge and is as tall as the band
  test.each(LAYOUTS.flatMap((layout) => KEYS.map((key) => [name(layout, key), layout, key] as const)))(
    'one body height: %s',
    (_name, layout, key) => {
      const own = arrangementFor(layout, key);
      const heights = [own.emitter, own.airUnit, own.collector, own.externalTank]
        .filter((shape) => shape !== undefined)
        .map((shape) => shape.height);
      expect(heights.length).toBeGreaterThan(0);
      for (const height of heights) expect(height).toBe(BAND.height);
      expect(BAND.height).toBe(176);
    },
  );

  test('an empty tank slot gives its space away: the hybrid without a tank is centred over its ports, with the tank it moves left', () => {
    const [withTank, without] = [true, false].map((tank) =>
      arrangementFor('horizontal', { source: 'hybrid', tank, emitter: 'none' }),
    );
    const centre = (slot: { x0: number; x1: number } | undefined): number => ((slot?.x0 ?? 0) + (slot?.x1 ?? 0)) / 2;
    const ideal = ((without?.ports[3] ?? 0) + (without?.ports[4] ?? 0)) / 2;
    expect(centre(without?.slots.source)).toBeCloseTo(ideal);
    expect(centre(withTank?.slots.source)).toBeLessThan(ideal);
  });

  // schematic-drawing "One band style" (harmonize-band D1, D2)
  test('the widest band (hybrid, tank, emitter) fits the vertical layout with gaps of at least 24', () => {
    const own = arrangementFor('vertical', { source: 'hybrid', tank: true, emitter: 'underfloor' });
    const slots = [own.slots.emitter, own.slots.source, own.slots.tank];
    expect(BAND.emitter.width + sourceWidth('hybrid') + BAND.tank.width + 2 * BAND.gap).toBeLessThanOrEqual(720);
    for (const slot of slots) {
      expect(slot).toBeDefined();
      expect(slot?.x0 ?? -1).toBeGreaterThanOrEqual(own.cabinet.x);
      expect(slot?.x1 ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(own.cabinet.x + own.cabinet.width);
    }
    for (let index = 1; index < slots.length; index += 1) {
      expect((slots[index]?.x0 ?? 0) - (slots[index - 1]?.x1 ?? 0)).toBeGreaterThanOrEqual(BAND.gap - 1e-9);
    }
  });

  const STYLE_CASES = LAYOUTS.flatMap((layout) =>
    (
      [
        ['hybrid', 'underfloor', 3],
        ['hybrid', 'radiator', 3],
        ['air', 'radiator', 2],
        ['ground', 'underfloor', 2],
      ] as const
    ).map(
      ([source, emitter, bodies]) => [`${layout}: ${source} with ${emitter}`, layout, source, emitter, bodies] as const,
    ),
  );

  test.each(STYLE_CASES)(
    'every band body shares the class, the radius, has no divider and stands on the band bottom: %s',
    async (_name, layout, source, emitter, bodies) => {
      const card = document.createElement('ecogeo-card') as EcogeoCard;
      card.setConfig({ type: 'custom:ecogeo-card', model: 'B', dhw: 'external', source, emitter, layout });
      document.body.append(card);
      await card.updateComplete;
      const shadow = card.shadowRoot;
      if (shadow === null) throw new Error('no shadow root');
      const own = arrangementFor(layout, { source, tank: true, emitter });
      const rects = [
        ...shadow.querySelectorAll(
          'rect.emitter-outline, g[data-source="air"] > rect.source-outline, g[data-source="ground"] > rect.source-outline',
        ),
      ];
      expect(rects).toHaveLength(bodies);
      for (const rect of rects) {
        expect(rect.classList.contains('band-outline')).toBe(true);
        expect(Number(rect.getAttribute('rx'))).toBe(BAND.radius);
        const bottom = Number(rect.getAttribute('y')) + Number(rect.getAttribute('height'));
        if (rect.closest('g[data-source="air"]') === null) {
          // the emitter, the collector: flat along their width on the band's bottom edge
          expect(bottom).toBe(own.band.bottom);
        } else {
          // the air unit's case ends above the edge, and the bottoms of its two feet lie on it (harmonize-band D4)
          expect(bottom).toBeLessThan(own.band.bottom);
          const feet = [...(rect.closest('g[data-source="air"]')?.querySelectorAll('.air-foot') ?? [])];
          expect(feet).toHaveLength(2);
          for (const foot of feet) {
            expect(Number(foot.getAttribute('y')) + Number(foot.getAttribute('height'))).toBe(own.band.bottom);
            expect(Number(foot.getAttribute('y'))).toBe(bottom);
          }
        }
      }
      // the tank: the shared class, the same radius at its bottom corners, the outline reaching the band's bottom at both walls
      const tank = own.externalTank;
      if (tank === undefined) throw new Error('no tank');
      const body = shadow.querySelector('path.tank-body[data-dhw-tank="external"]');
      expect(body?.classList.contains('band-outline')).toBe(true);
      const d = body?.getAttribute('d') ?? '';
      const r = BAND.radius;
      const bottom = own.band.bottom;
      expect(d).toContain(
        `V${String(bottom - r)} A${String(r)} ${String(r)} 0 0 1 ${String(tank.x + tank.width - r)} ${String(bottom)} H${String(tank.x + r)} A${String(r)} ${String(r)} 0 0 1 ${String(tank.x)} ${String(bottom - r)}`,
      );
      expect(shadow.querySelector('[data-obstacle="air-divider"], [data-obstacle="emitter-divider"]')).toBeNull();
      expect(shadow.querySelector('.source-divider, .emitter-line')).toBeNull();
      card.remove();
    },
  );
});
