// The cabinet's lanes (rework-layouts D1, schematic-drawing "Cabinet layout with value lanes"): no part's box enters a lane, a row
// lane is crossed only by vertical pipes and a column lane only by horizontal ones, in the frame the lists are authored in and
// in the horizontal arrangement under its maps, for every model, DHW storage, source and emitter.
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
  drawnComponents,
  drawnSegments,
  mapAxis,
  routePoints,
  type Component,
  type DrawContext,
  type Lane,
  type Point,
  type Rect,
  type Segment,
} from '../../src/diagram/geometry';
import { BODY_LABELS } from '../../dev/overlaps';
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

describe('Lanes free of parts: the horizontal arrangement', () => {
  const lanes: readonly Lane[] = [...ROW_LANES, ...COLUMN_LANES];
  const mapped = (lane: Lane): Lane =>
    lane.axis === 'row'
      ? { ...lane, from: mapAxis(HORIZONTAL_MAP_Y, lane.from), to: mapAxis(HORIZONTAL_MAP_Y, lane.to) }
      : { ...lane, from: mapAxis(HORIZONTAL_MAP_X, lane.from), to: mapAxis(HORIZONTAL_MAP_X, lane.to) };

  test.each(
    CONTEXTS.map(
      (context) =>
        [
          `${context.model} ${context.dhw} ${context.source} ${context.emitter ?? ''} ${String(context.features.htr)}`,
          context,
        ] as const,
    ),
  )('%s', (_name, context) => {
    const arrangement = arrangementOf(context);
    const { cabinet } = arrangement;
    const components = drawnComponents(context).map((entry) => entry.part);
    const segments = drawnSegments(context).map((entry) => entry.part);
    const parts = partBoxes(components, arrangement.internalTank, cabinet.y);
    expect(parts.length).toBeGreaterThan(10);
    for (const lane of lanes.map(mapped)) {
      const box = laneBox(lane, cabinet);
      for (const { item, box: part } of parts) {
        expect(apart(box, part), `item ${String(item)} enters ${lane.id}`).toBe(true);
      }
      const found = segments.flatMap((segment) => violations(segment, box, lane.axis, cabinet.y));
      expect(found, lane.id).toEqual([]);
    }
  });
});

// design D1 "every value in the cabinet sits in a lane": each cabinet label lies in a row lane or a column lane. A label counts as a
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
    superheat: [46, 18],
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
