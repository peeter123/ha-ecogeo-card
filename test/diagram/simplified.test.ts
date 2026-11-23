// The arrangement (refine-simplified-layout D2, D3, rework-layouts D1-D3): the cabinet's contents under the monotone maps
// (compared with the cabinet frame, `FRAME`), and every topology rule checked on it, in both layouts, for every source, DHW
// storage and model. The band above the cabinet (slots, bodies, join lane) is checked in band.test.ts.
import { describe, expect, test } from 'vitest';
import { apart, boxOf, type Box } from './boxes';
import { DHW_STORAGES, EMITTERS, SOURCES } from '../../src/config/options';
import { HORIZONTAL_PLACES, LABEL_FONT_K, PAIR_ROW_GAP } from '../../src/diagram/label-places';
import { VERTICAL_BELOW } from '../../src/lib/layout';
import type { FeatureState, Features } from '../../src/config/variants';
import {
  MAX_CROSSINGS,
  BAND,
  sourceWidth,
  HORIZONTAL_MAP_X,
  HORIZONTAL_MAP_Y,
  HORIZONTAL_LANE_EXTRA,
  HORIZONTAL_LANE_SHRINK,
  ROW_LANES,
  FRAME,
  arrangementFor,
  arrangementOf,
  arrangementWithPlaces,
  crossingPoints,
  drawnComponents,
  drawnSegments,
  drawnStorage,
  mapAxis,
  onPolyline,
  overlap,
  portsOf,
  routePoints,
  type Component,
  type DrawContext,
  type Point,
  type ShownLayout,
} from '../../src/diagram/geometry';

/** The cabinet frame the arrangement is mapped from. */
const frame = FRAME;
const simplified = arrangementFor('horizontal');

const LAYOUTS: readonly ShownLayout[] = ['horizontal', 'vertical'];
/** A context drawn in a layout's arrangement. */
const inLayout = (context: DrawContext, layout: ShownLayout): DrawContext => ({
  ...context,
  arrangement: arrangementOf(context, layout),
});

const featuresOf = (state: FeatureState): Features => ({
  active_cooling: state,
  passive_cooling: state,
  htr: state,
  backup_heater: state,
});

/** Every source, DHW storage and model, with every feature true, false and unused. */
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
const name = (context: DrawContext): string =>
  `${context.model} ${context.dhw} ${context.source} emitter ${context.emitter ?? ''} features ${String(context.features.htr)}`;

/** The reference context of the "No empty band" scenario: variant 4 with every feature true. */
const VARIANT_4: DrawContext = {
  model: 'B',
  dhw: 'external',
  source: 'ground',
  features: featuresOf(true),
};

const portOf = (context: DrawContext, item: number): Point => {
  const part = drawnComponents(context).find((entry) => entry.part.item === item)?.part;
  const port = part === undefined ? undefined : portsOf(part)[0];
  if (port === undefined) throw new Error(`no port ${String(item)}`);
  return port;
};
const pointsOf = (context: DrawContext, id: string): readonly Point[] => {
  const points = drawnSegments(context).find((entry) => entry.part.id === id)?.part.points;
  if (points === undefined) throw new Error(`no segment ${id}`);
  return points;
};
const first = (context: DrawContext, id: string): Point => pointsOf(context, id)[0] ?? [NaN, NaN];
const last = (context: DrawContext, id: string): Point => pointsOf(context, id).at(-1) ?? [NaN, NaN];

describe('arrangementFor: the simplified arrangement', () => {
  test('Cabinet fills the drawing: the cabinet spans the viewBox plus a small margin, under the band', () => {
    expect(simplified.id).toBe('horizontal');
    expect(simplified.viewBox.width).toBe(1000);
    expect(simplified.cabinet.width).toBeGreaterThan(frame.zones.cabinet.width);
    expect(simplified.cabinet.width).toBe(980);
    expect(simplified.cabinet.x).toBeLessThanOrEqual(12);
    expect(simplified.viewBox.width - (simplified.cabinet.x + simplified.cabinet.width)).toBeLessThanOrEqual(12);
    // the cabinet's top edge is the band's height and the join lane under the top margin
    expect(simplified.cabinet.y).toBe(BAND.top + BAND.height + BAND.joinLane);
    expect(simplified.cabinet.height).toBe(502);
    expect(simplified.viewBox.height).toBe(simplified.cabinet.y + simplified.cabinet.height + 15);
    // the band's height is added, the cabinet is cut: the drawing is still much wider than tall
    expect(simplified.viewBox.height / simplified.viewBox.width).toBeLessThan(0.76);
  });

  test('the frame is the cabinet frame: 720 units wide, the width of the widest band, with its top edge at y 0', () => {
    expect(frame.zones.viewBox).toEqual({ width: 720, height: 520 });
    expect(frame.zones.cabinet).toEqual({ x: 0, y: 0, width: 720, height: 520 });
    // the widest band: emitter 200, hybrid source 312, external tank 160 and two gaps of 24
    expect(BAND.emitter.width + sourceWidth('hybrid') + BAND.tank.width + 2 * BAND.gap).toBe(720);
  });

  test("the maps are monotone, ascending and start the cabinet where the frame's does", () => {
    // the x map only stretches: the column lanes widen by HORIZONTAL_LANE_EXTRA, every column of parts keeps slope 1
    HORIZONTAL_MAP_X.slice(1).forEach(([from, to], index) => {
      const [from0, to0] = HORIZONTAL_MAP_X[index] ?? [0, 0];
      expect(from).toBeGreaterThan(from0);
      expect(to - to0).toBeGreaterThanOrEqual(from - from0);
    });
    // the y map has slope 1 except over the row lanes it narrows (HORIZONTAL_LANE_SHRINK)
    HORIZONTAL_MAP_Y.slice(1).forEach(([from, to], index) => {
      const [from0, to0] = HORIZONTAL_MAP_Y[index] ?? [0, 0];
      expect(from).toBeGreaterThan(from0);
      const lane = ROW_LANES.find((entry) => entry.from === from0 && entry.to === from);
      expect(to - to0, `y ${String(from0)}-${String(from)}`).toBe(
        from - from0 + (lane === undefined ? 0 : (HORIZONTAL_LANE_SHRINK[lane.id] ?? 0)),
      );
    });
    expect(Object.values(HORIZONTAL_LANE_EXTRA).reduce((sum, extra) => sum + extra, 0)).toBe(260);
    expect(mapAxis(HORIZONTAL_MAP_X, frame.zones.cabinet.x)).toBe(simplified.cabinet.x);
    expect(mapAxis(HORIZONTAL_MAP_X, frame.zones.cabinet.x + frame.zones.cabinet.width)).toBe(
      simplified.cabinet.x + simplified.cabinet.width,
    );
    for (let x = 200; x < 800; x += 7)
      expect(mapAxis(HORIZONTAL_MAP_X, x + 1)).toBeGreaterThan(mapAxis(HORIZONTAL_MAP_X, x));
  });

  test('every symbol keeps its size: each pair of ports of a component is as far apart as in the frame', () => {
    for (const part of simplified.components) {
      const twin = frame.components.find((candidate) => candidate.item === part.item && candidate.kind === part.kind);
      if (twin === undefined || part.item === 50) continue;
      const [a, b] = [portsOf(part), portsOf(twin)];
      expect(a.length).toBe(b.length);
      const relative = (ports: Point[]): Point[] =>
        ports.map(([x, y]) => [x - (ports[0]?.[0] ?? 0), y - (ports[0]?.[1] ?? 0)]);
      expect(relative(a), `item ${String(part.item)}`).toEqual(relative(b));
    }
  });

  test('the labels with a place of their own have a reason, are in the arrangement and sit where the table says', () => {
    // at the threshold every label's default place is free (the search's paste output is empty), so the table has no entry; an
    // entry, when the drawing needs one again, is checked here: it has a reason and the arrangement uses its place
    expect(Object.keys(HORIZONTAL_PLACES)).toEqual([]);
    const bare = arrangementFor('horizontal', { ...simplified.key, emitter: 'none' });
    for (const [id, place] of Object.entries(HORIZONTAL_PLACES)) {
      expect(place.reason.length, id).toBeGreaterThan(20);
      const spec = [simplified, bare].flatMap((own) => own.labels.specs).find((label) => label.id === id);
      expect(spec, id).toBeDefined();
      expect({ x: spec?.x, y: spec?.y, align: spec?.align }, id).toEqual(
        place.at(simplified, (x, y) => [mapAxis(HORIZONTAL_MAP_X, x), mapAxis(HORIZONTAL_MAP_Y, y)]),
      );
    }
  });

  test("every cabinet point is the frame's point under the maps", () => {
    const fx = (x: number): number => mapAxis(HORIZONTAL_MAP_X, x);
    const fy = (y: number): number => mapAxis(HORIZONTAL_MAP_Y, y);
    for (const part of simplified.components) {
      if (part.item === 50 || part.item === 51) continue;
      const twin = frame.components.find((candidate) => candidate.item === part.item && candidate.kind === part.kind);
      expect(twin, `item ${String(part.item)}`).toBeDefined();
      expect([part.x, part.y], `item ${String(part.item)}`).toEqual([fx(twin?.x ?? NaN), fy(twin?.y ?? NaN)]);
    }
    for (const segment of simplified.segments) {
      // the band's pipes are authored in the arrangement's units (band.test.ts), not mapped from the frame
      if (segment.id.startsWith('src_') || segment.id.startsWith('dhw_ext_') || segment.id.startsWith('dg1_')) continue;
      const twin = frame.segments.find((candidate) => candidate.id === segment.id);
      expect(twin, segment.id).toBeDefined();
      expect(segment.points, segment.id).toEqual((twin?.points ?? []).map(([x, y]) => [fx(x), fy(y)]));
    }
    const kept = simplified.crossings;
    for (const crossing of frame.crossings) {
      const twin = kept.find((candidate) => candidate.over === crossing.over && candidate.under === crossing.under);
      if (twin === undefined) continue;
      expect(twin.at).toEqual([fx(crossing.at[0]), fy(crossing.at[1])]);
    }
    const cabinetLabels = [
      'production_out',
      'production_in',
      'production_pump',
      'brine_out',
      'brine_in',
      'brine_pressure',
      'brine_pump',
      'discharge_temperature',
      'discharge_pressure',
      'suction_temperature',
      'suction_pressure',
      'compressor_speed',
      'expansion_valve',
    ];
    // the labels with a place of their own (HORIZONTAL_PLACES) are checked above
    for (const id of cabinetLabels.filter((label) => HORIZONTAL_PLACES[label] === undefined)) {
      const [a, b] = [
        // the maps start from the frame's default places
        frame.labels.specs.find((spec) => spec.id === id),
        simplified.labels.specs.find((spec) => spec.id === id),
      ];
      expect([b?.x, b?.y], id).toEqual([fx(a?.x ?? NaN), fy(a?.y ?? NaN)]);
      expect(b?.align, id).toBe(a?.align);
    }
  });

  test('every crossing is between two segments of the arrangement', () => {
    const ids = new Set(simplified.segments.map((segment) => segment.id));
    for (const crossing of simplified.crossings) {
      expect(ids.has(crossing.over) && ids.has(crossing.under)).toBe(true);
    }
  });
});

describe.each(LAYOUTS)('the invariants of the cabinet on the %s arrangement', (layout) => {
  const v4 = inLayout(VARIANT_4, layout);
  test.each(CONTEXTS.map((context) => [name(context), inLayout(context, layout)] as const))('%s', (_name, context) => {
    const arrangement = arrangementOf(context);
    const { cabinet } = arrangement;
    const components = drawnComponents(context).map((entry) => entry.part);
    const segments = drawnSegments(context).map((entry) => entry.part);

    // every part lies inside its zone: the cabinet's parts inside the outline, the source and the tank in their zones
    const bottom = cabinet.y + cabinet.height;
    for (const part of components) {
      const box = boxOf(part);
      expect(box.x0, `item ${String(part.item)}`).toBeGreaterThanOrEqual(cabinet.x);
      expect(box.x1, `item ${String(part.item)}`).toBeLessThanOrEqual(cabinet.x + cabinet.width);
      expect(box.y1, `item ${String(part.item)}`).toBeLessThanOrEqual(bottom);
      expect(box.y0, `item ${String(part.item)}`).toBeGreaterThanOrEqual(
        part.kind === 'port' ? cabinet.y - 6 : cabinet.y,
      );
    }
    // the band's bodies lie inside the band (above the cabinet's top edge) and above the cabinet's columns: nothing is drawn beside the cabinet
    const bodies = [
      ...(context.emitter === 'none' ? [] : [['emitter', arrangement.emitter] as const]),
      ...(context.source === 'ground' ? [] : [['air unit', arrangement.airUnit] as const]),
      ...(context.source === 'air' ? [] : [['collector', arrangement.collector] as const]),
      ...(drawnStorage(context) === 'external' ? [['tank', arrangement.externalTank] as const] : []),
    ].map(([what, shape]) => {
      if (shape === undefined) throw new Error(`no ${what}`);
      return { what, x0: shape.x, y0: shape.y, x1: shape.x + shape.width, y1: shape.y + shape.height };
    });
    for (const body of bodies) {
      expect(body.y0, body.what).toBeGreaterThanOrEqual(arrangement.band.top);
      expect(body.y1, body.what).toBeLessThanOrEqual(arrangement.band.bottom);
      expect(body.x0, body.what).toBeGreaterThanOrEqual(cabinet.x);
      expect(body.x1, body.what).toBeLessThanOrEqual(cabinet.x + cabinet.width);
    }
    bodies.forEach((body, index) => {
      for (const other of bodies.slice(index + 1))
        expect(
          apart({ x0: body.x0, y0: body.y0, x1: body.x1, y1: body.y1 }, other),
          `${body.what} and ${other.what} overlap`,
        ).toBe(true);
    });
    for (const segment of segments) {
      for (const point of segment.points) {
        expect(point[0], segment.id).toBeGreaterThanOrEqual(0);
        expect(point[0], segment.id).toBeLessThanOrEqual(arrangement.viewBox.width);
        expect(point[1], segment.id).toBeLessThanOrEqual(bottom);
      }
    }

    // no two parts overlap (the integrated tank holds its coil and probe 54, so it and the coil are left out)
    const solid = components.filter((part) => part.kind !== 'port' && part.item !== 50 && part.item !== 51);
    solid.forEach((part, index) => {
      for (const other of solid.slice(index + 1)) {
        expect(apart(boxOf(part), boxOf(other)), `items ${String(part.item)} and ${String(other.item)} overlap`).toBe(
          true,
        );
      }
    });

    // ports 1-6 left to right on the top edge, in the manual's order
    const ports = components.filter((part) => part.kind === 'port' && part.item <= 6);
    expect(
      ports.map((part) => part.item),
      'port order',
    ).toEqual(
      context.dhw === 'external' || (context.dhw === 'unused' && context.model === 'B')
        ? [1, 2, 3, 4, 5, 6]
        : [1, 2, 3, 4],
    );
    for (const port of ports) expect(port.y).toBe(cabinet.y);
    const xs = ports.map((port) => port.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));

    // every crossing is inside the cabinet and a declared hop; none runs along another pipe; at most the manual's count
    const declared = new Set(
      arrangement.crossings.map((crossing) => `${crossing.over}|${crossing.under}|${crossing.at.join(',')}`),
    );
    segments.forEach((one, index) => {
      for (const two of segments.slice(index + 1)) {
        for (const at of crossingPoints(routePoints(one), routePoints(two))) {
          expect(
            declared.has(`${one.id}|${two.id}|${at.join(',')}`) || declared.has(`${two.id}|${one.id}|${at.join(',')}`),
            `${one.id} x ${two.id} at ${at.join(',')} is not a hop`,
          ).toBe(true);
          expect(
            at[0] > cabinet.x && at[0] < cabinet.x + cabinet.width && at[1] > cabinet.y,
            `${one.id} x ${two.id} outside the cabinet`,
          ).toBe(true);
        }
        expect(overlap(routePoints(one), routePoints(two)), `${one.id} along ${two.id}`).toBe(false);
      }
    });
    expect(arrangement.crossings.length).toBeLessThanOrEqual(MAX_CROSSINGS);
    for (const crossing of arrangement.crossings) {
      expect(crossing.at[0] > cabinet.x && crossing.at[0] < cabinet.x + cabinet.width).toBe(true);
      expect(crossing.at[1] > cabinet.y && crossing.at[1] < bottom).toBe(true);
    }
  });

  test('every declared crossing is a real crossing of the pipes', () => {
    const own = arrangementFor(layout);
    for (const crossing of own.crossings) {
      const over = own.segments.find((segment) => segment.id === crossing.over);
      const under = own.segments.find((segment) => segment.id === crossing.under);
      if (over === undefined || under === undefined) throw new Error('no segment');
      expect(crossingPoints(over.points, under.points), `${crossing.over} / ${crossing.under}`).toContainEqual(
        crossing.at,
      );
    }
  });

  test('HTR placement: exchanger 9 is on the discharge line between compressor 11 and valve 14, its water joins the DHW lines', () => {
    const context = { ...v4 };
    const ids = new Set(drawnSegments(context).map((entry) => entry.part.id));
    for (const item of [9, 17, 22])
      expect(drawnComponents(context).some((entry) => entry.part.item === item)).toBe(true);
    const port = (item: number, index: number): Point => {
      const part = drawnComponents(context).find((entry) => entry.part.item === item)?.part;
      const found = part === undefined ? undefined : portsOf(part)[index];
      if (found === undefined) throw new Error(`item ${String(item)}`);
      return found;
    };
    expect(first(context, 'ref_discharge')).toEqual(port(11, 0));
    expect(last(context, 'ref_discharge')).toEqual(port(9, 1));
    expect(first(context, 'ref_9_14')).toEqual(port(9, 3));
    expect(ids.has('ref_9_14')).toBe(true);
    expect(last(context, 'ref_9_14')).toEqual(port(14, 0));
    // the water lines join the DHW lines of ports 5/6
    const dhw = (prefix: string): Point[][] =>
      drawnSegments(context)
        .filter((entry) => entry.part.id.startsWith(prefix))
        .map((entry) => [...entry.part.points]);
    expect(dhw('dhw_ret_').some((points) => onPolyline(first(context, 'htr_in'), points))).toBe(true);
    expect(dhw('dhw_sup_').some((points) => onPolyline(last(context, 'htr_riser'), points))).toBe(true);
  });

  test('Probe placement: each probe sits on the line of its own temperature', () => {
    const context = { ...v4 };
    const roles: [number, string][] = [
      [33, 'production.outlet_temperature'],
      [34, 'production.return_temperature'],
      [31, 'brine.outlet_temperature'],
      [32, 'brine.inlet_temperature'],
      [30, 'compressor.discharge_temperature'],
      [29, 'compressor.suction_temperature'],
    ];
    for (const [item, role] of roles) {
      const stem = portOf(context, item);
      expect(
        drawnSegments(context).some(
          (entry) => entry.part.temperatureRole === role && onPolyline(stem, entry.part.points),
        ),
        `probe ${String(item)}`,
      ).toBe(true);
    }
  });

  test('No empty band: the lowest drawn part or pipe in the cabinet is at most 40 units over the bottom edge', () => {
    const { cabinet } = arrangementFor(layout);
    const bottom = cabinet.y + cabinet.height;
    const lowestPart = Math.max(...drawnComponents(v4).map((entry) => boxOf(entry.part).y1));
    const lowestPipe = Math.max(...drawnSegments(v4).flatMap((entry) => entry.part.points.map((point) => point[1])));
    const lowest = Math.max(lowestPart, lowestPipe);
    expect(lowest).toBeLessThanOrEqual(bottom);
    expect(bottom - lowest).toBeLessThanOrEqual(40);
  });

  // rework-layouts D6: the transducers on their lines and the probe pairs
  const PAIRS: readonly { name: string; items: readonly [number, number]; gap: number }[] = [
    { name: 'production return', items: [34, 38], gap: 28 },
    { name: 'brine inlet', items: [32, 37], gap: 28 },
    { name: 'discharge', items: [30, 36], gap: 22 },
    { name: 'suction', items: [29, 35], gap: 22 },
  ];
  const partOf = (context: DrawContext, item: number): Component => {
    const part = drawnComponents(context).find((entry) => entry.part.item === item)?.part;
    if (part === undefined) throw new Error(`no part ${String(item)}`);
    return part;
  };

  test.each(PAIRS)('Transducers and pairs: $name items share one pipe with no part between them', ({ items, gap }) => {
    for (const context of CONTEXTS.map((entry) => inLayout(entry, layout))) {
      const [one, two] = items.map((item) => partOf(context, item));
      if (one === undefined || two === undefined) throw new Error('no pair');
      const [portOne, portTwo] = [portsOf(one)[0], portsOf(two)[0]];
      if (portOne === undefined || portTwo === undefined) throw new Error('no ports');
      // both stems end on the same drawn pipe: no stub leads to either of them
      const shared = drawnSegments(context).filter(
        (entry) => onPolyline(portOne, entry.part.points) && onPolyline(portTwo, entry.part.points),
      );
      expect(shared.length, `${name(context)} ${String(items)}`).toBeGreaterThan(0);
      expect(shared.every((entry) => entry.part.stub !== true)).toBe(true);
      // the two bodies are the frame's distance apart, along the line, and nothing else is drawn between them
      const apartBy = Math.hypot(one.x - two.x, one.y - two.y);
      expect(apartBy).toBeGreaterThanOrEqual(gap);
      expect(apartBy).toBeLessThanOrEqual(gap + 10);
      const between: Box = {
        x0: Math.min(one.x, two.x),
        y0: Math.min(one.y, two.y),
        x1: Math.max(one.x, two.x),
        y1: Math.max(one.y, two.y),
      };
      for (const { part } of drawnComponents(context)) {
        if (part.item === one.item || part.item === two.item) continue;
        const box = boxOf(part);
        const meets = !(box.x1 <= between.x0 || between.x1 <= box.x0 || box.y1 < between.y0 || between.y1 < box.y0);
        expect(meets, `item ${String(part.item)} between ${String(items)}`).toBe(false);
      }
    }
  });

  test('Transducers 38 and 37 sit directly under probes 34 and 32, on their risers', () => {
    for (const [under, over] of [
      [38, 34],
      [37, 32],
    ] as const) {
      const [lower, upper] = [partOf(v4, under), partOf(v4, over)];
      expect(lower.x, String(under)).toBe(upper.x);
      expect(lower.rotation).toBe(upper.rotation);
      expect(lower.y).toBeGreaterThan(upper.y);
      expect(lower.y - upper.y).toBeLessThan(40);
    }
    expect(drawnSegments(v4).map((entry) => entry.part.id)).not.toContain('prod_tap_a');
    expect(drawnSegments(v4).map((entry) => entry.part.id)).not.toContain('brine_tap_a');
  });

  test('Discharge pair: transducer 36 is 22 units from probe 30, like the suction pair', () => {
    const [probe, transducer] = [30, 36].map((item) => frame.components.find((part) => part.item === item));
    expect((transducer?.x ?? 0) - (probe?.x ?? 0)).toBe(22);
    const [suctionProbe, suctionTransducer] = [29, 35].map((item) =>
      frame.components.find((part) => part.item === item),
    );
    expect((suctionTransducer?.x ?? 0) - (suctionProbe?.x ?? 0)).toBe(22);
  });

  test('Probe pair values: each pair is one two-row block, the temperature over the pressure, under the pair', () => {
    for (const [pair, temperature, pressure] of [
      [30, 'discharge_temperature', 'discharge_pressure'],
      [29, 'suction_temperature', 'suction_pressure'],
    ] as const) {
      const own = arrangementFor(layout);
      const top = own.labels.specs.find((spec) => spec.id === temperature);
      const bottom = own.labels.specs.find((spec) => spec.id === pressure);
      if (top === undefined || bottom === undefined) throw new Error('no labels');
      expect(bottom.align, String(pair)).toBe(top.align);
      expect(bottom.x, String(pair)).toBe(top.x);
      // the row pitch follows the label height at the layout's narrowest verified width (PAIR_ROW_GAP)
      expect(bottom.y - top.y, String(pair)).toBe(PAIR_ROW_GAP[layout]);
      expect(top.y, String(pair)).toBeGreaterThan(partOf(v4, pair).y);
      // the block is under or next to its pair: its anchor lies within the pair's span, padded by 30 units
      const pairItems = pair === 30 ? [30, 36] : [29, 35];
      const xs = pairItems.map((item) => partOf(v4, item).x);
      expect(top.x, String(pair)).toBeGreaterThanOrEqual(Math.min(...xs) - 30);
      expect(top.x, String(pair)).toBeLessThanOrEqual(Math.max(...xs) + 30);
    }
  });
});

// live-values "Hydraulic values", rework-layouts: the production Out, In and pressure sit beside probes 33, 34 and transducer 38, the brine
// Out beside probe 31, with no other part between them. The place search moves a label to the nearest free place, so
// without this bound it could drift across another part.
describe('values beside their probes', () => {
  /** The widest label box of each value at the vertical threshold, 560 px (the place search's "widest box", rounded up), in units. */
  const SIZES: Record<string, [number, number]> = {
    production_out: [92, 18],
    production_in: [81, 18],
    production_pressure: [61, 18],
    brine_out: [92, 18],
  };
  const BESIDE: readonly (readonly [string, number])[] = [
    ['production_out', 33],
    ['production_in', 34],
    ['production_pressure', 38],
    ['brine_out', 31],
  ];
  /** The largest gap between a label's box and its part's box, in units (the search's places lie 6 to 13 units away). */
  const MAX_GAP = 24;
  const partOf = (context: DrawContext, item: number): Component => {
    const found = drawnComponents(context).find((entry) => entry.part.item === item)?.part;
    if (found === undefined) throw new Error(`no part ${String(item)}`);
    return found;
  };

  test.each(BESIDE)('%s is beside item %i, close, with no other part between', (id, item) => {
    const spec = simplified.labels.specs.find((entry) => entry.id === id);
    const size = SIZES[id];
    if (spec === undefined || size === undefined) throw new Error(id);
    const [width, height] = size;
    const left = spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - width : spec.x - width / 2;
    const label: Box = { x0: left, y0: spec.y - height / 2, x1: left + width, y1: spec.y + height / 2 };
    for (const context of CONTEXTS) {
      const part = partOf(context, item);
      const target = boxOf(part);
      // beside: the boxes' vertical ranges overlap and the horizontal gap is small
      const gap = Math.max(target.x0 - label.x1, label.x0 - target.x1, 0);
      expect(gap, `${name(context)} ${id}`).toBeLessThanOrEqual(MAX_GAP);
      expect(Math.min(label.y1, target.y1) - Math.max(label.y0, target.y0), `${name(context)} ${id}`).toBeGreaterThan(
        0,
      );
      // no other drawn component's box meets the rectangle that spans both
      const hull: Box = {
        x0: Math.min(label.x0, target.x0),
        y0: Math.min(label.y0, target.y0),
        x1: Math.max(label.x1, target.x1),
        y1: Math.max(label.y1, target.y1),
      };
      for (const { part: other } of drawnComponents(context)) {
        if (other.item === item || other.kind === 'port') continue;
        expect(apart(boxOf(other), hull), `${name(context)} ${id}: item ${String(other.item)} between`).toBe(true);
      }
    }
  });
});

describe('pressure values beside their transducers on wider cards', () => {
  // The label boxes are fixed in px while the drawing scales, so at 1000 px a label is VERTICAL_BELOW/1000 of its width at the
  // threshold in units. A start-aligned place that is 6 units from its transducer at the threshold drifts away from it as the card widens.
  const WIDTHS = [VERTICAL_BELOW, 1000] as const;
  const WIDEST_AT_THRESHOLD: Record<string, number> = { production_pressure: 61, brine_pressure: 61 };
  test.each([
    ['production_pressure', 38],
    ['brine_pressure', 37],
  ] as const)('%s stays within 8 units of transducer %i at the threshold and at 1000 px', (id, item) => {
    const spec = simplified.labels.specs.find((entry) => entry.id === id);
    const target = boxOf(
      (() => {
        const found = drawnComponents(VARIANT_4).find((entry) => entry.part.item === item)?.part;
        if (found === undefined) throw new Error('no part');
        return found;
      })(),
    );
    if (spec === undefined) throw new Error(id);
    for (const width of WIDTHS) {
      // a label's font is max(10 px, k cqw): the same px up to the width where k cqw passes 10 px, then growing with the card
      const font = (px: number): number => Math.max(10, (LABEL_FONT_K.horizontal * px) / 100);
      const labelWidth =
        (((WIDEST_AT_THRESHOLD[id] ?? 0) * VERTICAL_BELOW) / width) * (font(width) / font(VERTICAL_BELOW));
      const left =
        spec.align === 'start' ? spec.x : spec.align === 'end' ? spec.x - labelWidth : spec.x - labelWidth / 2;
      const gap = Math.max(target.x0 - (left + labelWidth), left - target.x1, 0);
      expect(gap, `${id} at ${String(width)} px`).toBeLessThanOrEqual(8);
    }
  });
});

// design D1: a part keeps its neighbours as well as its order. Thermostat 45 is resistor 44's safety thermostat, so it stands
// next to it on riser 1, on the same pipe, with no other part between them.
describe.each(LAYOUTS)('Thermostat 45 next to resistor 44, %s layout', (layout) => {
  test.each(CONTEXTS.map((context) => [name(context), inLayout(context, layout)] as const))('%s', (_name, context) => {
    const drawn = drawnComponents(context).map((entry) => entry.part);
    const [resistor, thermostat] = [44, 45].map((item) => drawn.find((part) => part.item === item));
    if (context.features.backup_heater === false) {
      expect(resistor).toBeUndefined();
      expect(thermostat).toBeUndefined();
      return;
    }
    if (resistor === undefined || thermostat === undefined) throw new Error('no resistor or thermostat');
    const [a, b] = [boxOf(resistor), boxOf(thermostat)];
    // the thermostat's stem ends on the pipe that carries the resistor's top port
    const stem = portsOf(thermostat)[0];
    const top = portsOf(resistor)[0];
    if (stem === undefined || top === undefined) throw new Error('no ports');
    expect(
      drawnSegments(context).some((entry) => onPolyline(stem, entry.part.points) && onPolyline(top, entry.part.points)),
    ).toBe(true);
    // close: less than 20 units between the two boxes along the riser
    expect(Math.max(a.y0 - b.y1, b.y0 - a.y1)).toBeLessThan(20);
    // no other part meets the box that spans both
    const hull: Box = {
      x0: Math.min(a.x0, b.x0),
      y0: Math.min(a.y0, b.y0),
      x1: Math.max(a.x1, b.x1),
      y1: Math.max(a.y1, b.y1),
    };
    for (const part of drawn) {
      if (part.item === 44 || part.item === 45 || part.kind === 'port') continue;
      expect(apart(boxOf(part), hull), `item ${String(part.item)} between 44 and 45`).toBe(true);
    }
  });
});

// The place table's override path (buildArrangement): a synthetic entry replaces the spec's place and keeps the rest of the spec.
describe('A recorded place overrides the default place', () => {
  test('x, y and anchor come from the entry; the id, role, item and caption stay', () => {
    const before = simplified.labels.specs.find((spec) => spec.id === 'production_out');
    const places = {
      production_out: {
        at: () => ({ x: 123, y: 456, align: 'middle' as const }),
        reason: 'a synthetic place for the test',
      },
    };
    const own = arrangementWithPlaces(places);
    const after = own.labels.specs.find((spec) => spec.id === 'production_out');
    expect({ x: after?.x, y: after?.y, align: after?.align }).toEqual({ x: 123, y: 456, align: 'middle' });
    expect({ ...after, x: 0, y: 0, align: 'start' }).toEqual({ ...before, x: 0, y: 0, align: 'start' });
    // every other label is untouched
    expect(own.labels.specs.filter((spec) => spec.id !== 'production_out')).toEqual(
      simplified.labels.specs.filter((spec) => spec.id !== 'production_out'),
    );
  });
});
