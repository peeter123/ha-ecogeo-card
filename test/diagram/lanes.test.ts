// The cabinet's lanes (rework-layouts D1, schematic-drawing "Cabinet layout with value lanes"): no part's box enters a lane, a row
// lane is crossed only by vertical pipes and a column lane only by horizontal ones, in the frame the lists are authored in and
// in both arrangements under their maps, for every model, DHW storage, source and emitter.
import { describe, expect, test } from 'vitest';
import { DHW_STORAGES, EMITTERS, SOURCES } from '../../src/config/options';
import type { FeatureState, Features } from '../../src/config/variants';
import {
  COLUMN_LANES,
  FRAME,
  HORIZONTAL_MAP_X,
  HORIZONTAL_MAP_Y,
  ROW_LANES,
  arrangementOf,
  axisMapsOf,
  drawnComponents,
  drawnSegments,
  mapAxis,
  routePoints,
  type Component,
  type DrawContext,
  type AxisMap,
  type Lane,
  type Point,
  type Rect,
  type Segment,
  type ShownLayout,
} from '../../src/diagram/geometry';
import { BODY_LABELS, ROW_GROUPS } from '../../dev/overlaps';
import { strokeWidths } from '../../src/lib/layout';
import { apart, boxOf, type Box } from './boxes';

const featuresOf = (state: FeatureState): Features => ({
  active_cooling: state,
  passive_cooling: state,
  htr: state,
  backup_heater: state,
});

const CONTEXTS: DrawContext[] = (['B', 'C'] as const).flatMap((model) =>
  DHW_STORAGES.flatMap((dhw) =>
    SOURCES.flatMap((source) =>
      EMITTERS.flatMap((emitter) =>
        ([true, false, 'unused'] as const).map((state): DrawContext => ({
          model,
          dhw,
          source,
          emitter,
          features: featuresOf(state),
        })),
      ),
    ),
  ),
);

const laneBox = (lane: Lane, cabinet: Rect): Box =>
  lane.axis === 'row'
    ? { x0: cabinet.x, y0: lane.from, x1: cabinet.x + cabinet.width, y1: lane.to }
    : { x0: lane.from, y0: cabinet.y, x1: lane.to, y1: cabinet.y + cabinet.height };

/** The pieces of a pipe inside the cabinet that run across a lane the wrong way: along a row lane, or across a column lane. */
function violations(
  segment: Pick<Segment, 'id' | 'points' | 'shape'>,
  lane: Box,
  axis: Lane['axis'],
  top: number,
): string[] {
  const points: readonly Point[] = routePoints(segment);
  const found: string[] = [];
  points.slice(1).forEach(([x, y], index) => {
    const [x0, y0] = points[index] ?? [x, y];
    const horizontal = y0 === y && x0 !== x;
    const vertical = x0 === x && y0 !== y;
    if (axis === 'row' && horizontal && y > lane.y0 && y < lane.y1 && y > top)
      found.push(`${segment.id} runs along the row lane at y ${String(y)}`);
    if (axis === 'column' && vertical && x > lane.x0 && x < lane.x1 && Math.max(y0, y) > top)
      found.push(`${segment.id} runs along the column lane at x ${String(x)}`);
  });
  return found;
}

/** The parts' boxes that count as parts of the cabinet: the symbols and tank 50 (its coil and probe 54 lie inside it); not the connections' boxes above the top edge. */
function partBoxes(components: readonly Component[], tank: Rect, top: number): { item: number; box: Box }[] {
  return components.flatMap((part) => {
    if (part.item === 51) return [];
    const box: Box =
      part.item === 50 ? { x0: tank.x, y0: tank.y, x1: tank.x + tank.width, y1: tank.y + tank.height } : boxOf(part);
    return box.y1 <= top ? [] : [{ item: part.item, box }];
  });
}

describe('Lanes free of parts: the cabinet frame', () => {
  const cabinet = FRAME.zones.cabinet;
  test('the lanes are recorded, in order, inside the cabinet and with what they hold', () => {
    expect(ROW_LANES.length).toBeGreaterThan(0);
    expect(COLUMN_LANES.length).toBeGreaterThan(0);
    for (const [lanes, low, high] of [
      [ROW_LANES, cabinet.y, cabinet.y + cabinet.height],
      [COLUMN_LANES, cabinet.x, cabinet.x + cabinet.width],
    ] as const) {
      lanes.forEach((lane, index) => {
        expect(lane.from, lane.id).toBeGreaterThanOrEqual(low);
        expect(lane.to, lane.id).toBeLessThanOrEqual(high);
        expect(lane.to, lane.id).toBeGreaterThan(lane.from);
        expect(lane.holds.length, lane.id).toBeGreaterThan(10);
        expect(lane.from, lane.id).toBeGreaterThanOrEqual(lanes[index - 1]?.to ?? low);
      });
    }
  });

  test.each([...ROW_LANES, ...COLUMN_LANES].map((lane) => [lane.id, lane] as const))(
    '%s: no box, no pipe along it',
    (_id, lane) => {
      const box = laneBox(lane, cabinet);
      for (const { item, box: part } of partBoxes(FRAME.components, FRAME.zones.internalTank, cabinet.y)) {
        expect(apart(box, part), `item ${String(item)} enters ${lane.id}`).toBe(true);
      }
      const found = FRAME.segments.flatMap((segment) => violations(segment, box, lane.axis, cabinet.y));
      expect(found).toEqual([]);
    },
  );
});

describe('the lane check itself', () => {
  const cabinet = FRAME.zones.cabinet;
  test('sees a part in a row that is no lane and a pipe along a lane', () => {
    // y 100-124 is the probe row: probes 34, 31, 32 and pump 17 are in it
    const row = laneBox({ id: 'probe row', axis: 'row', from: 100, to: 124, holds: '' }, cabinet);
    const items = partBoxes(FRAME.components, FRAME.zones.internalTank, cabinet.y).filter(
      ({ box }) => !apart(row, box),
    );
    expect(items.map(({ item }) => item)).toEqual(expect.arrayContaining([17, 31, 32, 33, 34]));
    // the DHW supply line runs along y 42, the trunk down x 142
    const supply = FRAME.segments.find((segment) => segment.id === 'dhw_sup_a');
    const trunk = FRAME.segments.find((segment) => segment.id === 'trunk');
    if (supply === undefined || trunk === undefined) throw new Error('no segments');
    expect(violations(supply, { x0: 0, y0: 30, x1: 720, y1: 50 }, 'row', 0)).toHaveLength(1);
    expect(violations(trunk, { x0: 130, y0: 0, x1: 160, y1: 492 }, 'column', 0)).toHaveLength(1);
  });
});

const LAYOUTS: readonly ShownLayout[] = ['horizontal', 'vertical'];

describe.each(LAYOUTS)('Lanes free of parts: the %s arrangement', (layout) => {
  const lanes: readonly Lane[] = [...ROW_LANES, ...COLUMN_LANES];
  const mapped = (lane: Lane, maps: { x: AxisMap; y: AxisMap }): Lane =>
    lane.axis === 'row'
      ? { ...lane, from: mapAxis(maps.y, lane.from), to: mapAxis(maps.y, lane.to) }
      : { ...lane, from: mapAxis(maps.x, lane.from), to: mapAxis(maps.x, lane.to) };

  test.each(
    CONTEXTS.map(
      (context) =>
        [
          `${context.model} ${context.dhw} ${context.source} ${context.emitter ?? ''} ${String(context.features.htr)}`,
          context,
        ] as const,
    ),
  )('%s', (_name, context) => {
    const arrangement = arrangementOf(context, layout);
    const { cabinet } = arrangement;
    const components = drawnComponents({ ...context, arrangement }).map((entry) => entry.part);
    const segments = drawnSegments({ ...context, arrangement }).map((entry) => entry.part);
    const parts = partBoxes(components, arrangement.internalTank, cabinet.y);
    expect(parts.length).toBeGreaterThan(10);
    const maps = axisMapsOf(layout, arrangement.key);
    for (const lane of lanes.map((entry) => mapped(entry, maps))) {
      const box = laneBox(lane, cabinet);
      for (const { item, box: part } of parts) {
        expect(apart(box, part), `item ${String(item)} enters ${lane.id}`).toBe(true);
      }
      const found = segments.flatMap((segment) => violations(segment, box, lane.axis, cabinet.y));
      expect(found, lane.id).toEqual([]);
    }
  });
});

// design D1 "every value in the cabinet sits in a lane": each cabinet label lies in a row lane or a column lane (in the vertical layout the
// rotated values and the pump 15 value are checked as gap places below instead). A label counts as a
// cabinet label when it is not a body label (BODY_LABELS of dev/overlaps.ts: the values inside the emitter, the air unit, the
// collector, the external tank and tank 50, which sit in their bodies) and its anchor is inside the cabinet's outline (the DG1
// demand beside the stubs of connections 1/2 is above the top edge, in the band, and is exempt).
describe('Values in lanes', () => {
  /** The widest label box of each cabinet value at the vertical threshold, in units (the place search's "widest box" at 560 px, rounded up). */
  const SIZES: Readonly<Record<string, readonly [number, number]>> = {
    production_out: [92, 18],
    production_in: [81, 18],
    production_pressure: [61, 18],
    production_pump: [58, 18],
    brine_out: [92, 18],
    brine_in: [91, 18],
    brine_pressure: [61, 18],
    brine_pump: [68, 18],
    discharge_temperature: [63, 18],
    discharge_pressure: [71, 18],
    suction_temperature: [53, 18],
    suction_pressure: [61, 18],
    compressor_speed: [82, 18],
    expansion_valve: [43, 18],
  };
  const inCabinet = (spec: { id: string; y: number }, top: number): boolean =>
    BODY_LABELS[spec.id] === undefined && spec.y >= top;

  test('every cabinet label of the frame has its anchor in a lane', () => {
    const specs = FRAME.labels.specs.filter((spec) => inCabinet(spec, FRAME.zones.cabinet.y));
    expect(specs.map((spec) => spec.id).sort()).toEqual(Object.keys(SIZES).sort());
    for (const spec of specs) {
      const lane = [...ROW_LANES, ...COLUMN_LANES].find((entry) =>
        entry.axis === 'row' ? spec.y >= entry.from && spec.y <= entry.to : spec.x >= entry.from && spec.x <= entry.to,
      );
      expect(lane, spec.id).toBeDefined();
    }
  });

  // the vertical layout's values that stay horizontal and sit in the lanes, at the widest box of 320 px (the search's "widest box")
  const VERTICAL_SIZES: Readonly<Record<string, readonly [number, number]>> = {
    discharge_temperature: [82, 23],
    discharge_pressure: [92, 23],
    suction_temperature: [69, 23],
    suction_pressure: [79, 23],
    compressor_speed: [106, 23],
    expansion_valve: [56, 23],
  };

  test.each([
    ['without tank 50', { model: 'B', dhw: 'external', source: 'hybrid' }],
    ['with tank 50 (the stretched head)', { model: 'C', dhw: 'internal', source: 'ground' }],
  ] as const)(
    'every horizontal cabinet label of the vertical arrangement has its whole box in a lane, %s',
    (_name, context) => {
      const arrangement = arrangementOf(context, 'vertical');
      const maps = axisMapsOf('vertical', arrangement.key);
      const specs = arrangement.labels.specs.filter((spec) => VERTICAL_SIZES[spec.id] !== undefined);
      expect(specs.map((spec) => spec.id).sort()).toEqual(Object.keys(VERTICAL_SIZES).sort());
      const lanes = [...ROW_LANES, ...COLUMN_LANES].map((lane) =>
        lane.axis === 'row'
          ? { ...lane, from: mapAxis(maps.y, lane.from), to: mapAxis(maps.y, lane.to) }
          : { ...lane, from: mapAxis(maps.x, lane.from), to: mapAxis(maps.x, lane.to) },
      );
      for (const spec of specs) {
        const [width, height] = VERTICAL_SIZES[spec.id] ?? [0, 0];
        const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - width : spec.x - width / 2;
        const [top, bottom] = [spec.y - height / 2, spec.y + height / 2];
        const lane = lanes.find((entry) =>
          entry.axis === 'row'
            ? top >= entry.from && bottom <= entry.to
            : left >= entry.from && left + width <= entry.to,
        );
        expect(
          lane,
          `${spec.id} box ${String(left)}-${String(left + width)} x ${String(top)}-${String(bottom)}`,
        ).toBeDefined();
      }
    },
  );

  test('every cabinet label of the horizontal arrangement has its whole box in a lane', () => {
    const arrangement = arrangementOf({ model: 'B', dhw: 'external', source: 'hybrid' });
    const specs = arrangement.labels.specs.filter((spec) => inCabinet(spec, arrangement.cabinet.y));
    expect(specs.map((spec) => spec.id).sort()).toEqual(Object.keys(SIZES).sort());
    const lanes = [...ROW_LANES, ...COLUMN_LANES].map((lane) =>
      lane.axis === 'row'
        ? { ...lane, from: mapAxis(HORIZONTAL_MAP_Y, lane.from), to: mapAxis(HORIZONTAL_MAP_Y, lane.to) }
        : { ...lane, from: mapAxis(HORIZONTAL_MAP_X, lane.from), to: mapAxis(HORIZONTAL_MAP_X, lane.to) },
    );
    for (const spec of specs) {
      const [width, height] = SIZES[spec.id] ?? [0, 0];
      const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - width : spec.x - width / 2;
      const [top, bottom] = [spec.y - height / 2, spec.y + height / 2];
      const lane = lanes.find((entry) =>
        entry.axis === 'row' ? top >= entry.from && bottom <= entry.to : left >= entry.from && left + width <= entry.to,
      );
      expect(
        lane,
        `${spec.id} box ${String(left)}-${String(left + width)} x ${String(top)}-${String(bottom)}`,
      ).toBeDefined();
    }
  });
});

// schematic-drawing "Gap places in the vertical layout", responsive-layout "Rotated values in the vertical layout" and "Out and In side
// by side in the vertical layout": in the vertical layout the rotated values and the pump 15 value sit in gaps between vertical pipes
// beside their part, not in lanes through the cabinet. Each touches no part and no pipe (at the pipe width of a 320 px card) and lies
// within a bound distance of its part; the Out, In and pressure of a side form one row.
describe('Gap places in the vertical layout', () => {
  /** The widest box of each such value at 320 px, in units (the place search's "widest box"): width, then height; the turned ones are 23 wide. */
  const SIZES: Readonly<Record<string, readonly [number, number]>> = {
    production_out: [23, 120],
    production_in: [23, 105],
    production_pressure: [23, 79],
    brine_out: [23, 120],
    brine_in: [23, 119],
    brine_pressure: [23, 79],
    brine_pump: [23, 69],
    production_pump: [69, 23],
  };
  const PART: Readonly<Record<string, number>> = {
    production_out: 33,
    production_in: 34,
    production_pressure: 38,
    brine_out: 31,
    brine_in: 32,
    brine_pressure: 37,
    brine_pump: 16,
    production_pump: 15,
  };
  /** The most a value's box may be from its part's box, in units (the recorded places are 10 to 46 units from their part). */
  const MAX_GAP = 60;
  /** Half of a pipe's stroke at 320 px (`strokeWidths`), the stroke the search measures obstacles with. */
  const HALF_PIPE = strokeWidths(320, 740).pipe / 2;

  const boxOfSpec = (spec: { x: number; y: number; align: string; id: string }): Box => {
    const [width, height] = SIZES[spec.id] ?? [0, 0];
    const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - width : spec.x - width / 2;
    return { x0: left, y0: spec.y - height / 2, x1: left + width, y1: spec.y + height / 2 };
  };
  const gap = (a: Box, b: Box): number =>
    Math.hypot(Math.max(a.x0 - b.x1, b.x0 - a.x1, 0), Math.max(a.y0 - b.y1, b.y0 - a.y1, 0));

  test.each(
    CONTEXTS.filter((context) => context.features.htr === true).map(
      (context) => [`${context.model} ${context.dhw} ${context.source} ${context.emitter ?? ''}`, context] as const,
    ),
  )('%s: touching no part and no pipe, beside the part', (_name, context) => {
    const arrangement = arrangementOf(context, 'vertical');
    const drawn = { ...context, arrangement };
    const components = drawnComponents(drawn).map((entry) => entry.part);
    const parts = partBoxes(components, arrangement.internalTank, arrangement.cabinet.y);
    const pipes = drawnSegments(drawn)
      .map((entry) => entry.part)
      .filter((segment) => segment.shape === undefined);
    for (const spec of arrangement.labels.specs.filter((entry) => SIZES[entry.id] !== undefined)) {
      const box = boxOfSpec(spec);
      for (const { item, box: part } of parts) {
        expect(apart(box, part), `${spec.id} touches item ${String(item)}`).toBe(true);
      }
      for (const segment of pipes) {
        const points = routePoints(segment);
        points.slice(1).forEach(([x, y], index) => {
          const [x0, y0] = points[index] ?? [x, y];
          const piece: Box = {
            x0: Math.min(x0, x) - HALF_PIPE,
            y0: Math.min(y0, y) - HALF_PIPE,
            x1: Math.max(x0, x) + HALF_PIPE,
            y1: Math.max(y0, y) + HALF_PIPE,
          };
          expect(apart(box, piece), `${spec.id} touches pipe ${segment.id}`).toBe(true);
        });
      }
      const own = parts.find((entry) => entry.item === PART[spec.id]);
      if (own === undefined) continue;
      expect(gap(box, own.box), `${spec.id} beside item ${String(PART[spec.id])}`).toBeLessThanOrEqual(MAX_GAP);
    }
  });

  // responsive-layout "Horizontal values in the vertical layout": the pump 15 value is horizontal and sits above pump 15
  test.each(CONTEXTS.filter((context) => context.features.htr === true && context.features.backup_heater === true))(
    'the pump 15 value sits above pump 15, horizontal, overlapping it horizontally (%#)',
    (context) => {
      const arrangement = arrangementOf(context, 'vertical');
      const spec = arrangement.labels.specs.find((entry) => entry.id === 'production_pump');
      const pump = arrangement.components.find((part) => part.item === 15);
      if (spec === undefined || pump === undefined) throw new Error('no pump 15 value');
      expect(spec.rotate).toBeUndefined();
      const box = boxOfSpec(spec);
      const body = boxOf(pump);
      expect(box.y1, 'the box ends above the pump').toBeLessThanOrEqual(body.y0);
      expect(Math.min(box.x1, body.x1) - Math.max(box.x0, body.x0), 'and overlaps it horizontally').toBeGreaterThan(0);
    },
  );

  test('the rotated values are turned by -90 degrees, centred on their place; the pump 15 value and the rest are not', () => {
    const specs = arrangementOf({ model: 'B', dhw: 'external', source: 'hybrid' }, 'vertical').labels.specs;
    const turned = specs.filter((spec) => spec.rotate === -90).map((spec) => spec.id);
    expect(turned.sort()).toEqual(
      [
        'production_out',
        'production_in',
        'production_pressure',
        'brine_out',
        'brine_in',
        'brine_pressure',
        'brine_pump',
      ].sort(),
    );
    for (const spec of specs.filter((entry) => entry.rotate !== undefined)) expect(spec.align, spec.id).toBe('middle');
    expect(specs.find((spec) => spec.id === 'production_pump')?.rotate).toBeUndefined();
    // the horizontal layout turns nothing
    for (const key of [{}, { dhw: 'internal', model: 'C' }] as const)
      expect(
        arrangementOf({ model: 'B', dhw: 'external', source: 'air', ...key }, 'horizontal').labels.specs.filter(
          (spec) => spec.rotate !== undefined,
        ),
      ).toEqual([]);
  });

  test.each(ROW_GROUPS)(
    '%s, %s and %s form one row: in this order from left to right, Out and In at the same height',
    (...ids) => {
      for (const context of CONTEXTS.filter((entry) => entry.features.htr === true)) {
        const specs = arrangementOf(context, 'vertical').labels.specs;
        const boxes = ids.map((id) =>
          boxOfSpec(specs.find((spec) => spec.id === id) ?? { id, x: NaN, y: NaN, align: 'middle' }),
        );
        const [out, inn, pressure] = boxes;
        if (out === undefined || inn === undefined || pressure === undefined) throw new Error('no boxes');
        expect(out.x1, 'Out left of In').toBeLessThanOrEqual(inn.x0);
        expect(inn.x1, 'In left of the pressure').toBeLessThanOrEqual(pressure.x0);
        const within = (a: Box, b: Box): boolean => a.y0 >= b.y0 && a.y1 <= b.y1;
        expect(within(out, inn) || within(inn, out), 'Out and In share their vertical extent').toBe(true);
        expect(within(inn, pressure) || within(pressure, inn), 'the pressure shares it too').toBe(true);
      }
    },
  );
});
