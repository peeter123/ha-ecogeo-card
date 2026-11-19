// The arrangement (refine-simplified-layout D2, D3, rework-layouts D1, D2): its own zone constants for the source and the
// external tank, the cabinet's contents under the monotone maps (compared with the manual-figure frame, `FRAME`), and every
// topology rule checked on it for every source, DHW storage and model.
import { describe, expect, test } from 'vitest';
import { DHW_STORAGES, SOURCES } from '../../src/config/options';
import { HORIZONTAL_PLACES } from '../../src/diagram/label-places';
import type { FeatureState, Features } from '../../src/config/variants';
import {
  MAX_CROSSINGS,
  SIMPLIFIED_EXCEPTIONS,
  SIMPLIFIED_MAP_X,
  SIMPLIFIED_MAP_Y,
  SIMPLIFIED_ZONE_SCALE,
  FRAME,
  arrangementFor,
  crossingPoints,
  drawnComponents,
  drawnSegments,
  mapAxis,
  onPolyline,
  overlap,
  portsOf,
  routePoints,
  type Component,
  type DrawContext,
  type Point,
} from '../../src/diagram/geometry';

/** The manual-figure frame the arrangement is mapped from. */
const frame = FRAME;
const simplified = arrangementFor('horizontal');

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
      ([true, false, 'unused'] as const).map((state): DrawContext => ({
        model,
        dhw,
        source,
        features: featuresOf(state),
      })),
    ),
  ),
);
const name = (context: DrawContext): string =>
  `${context.model} ${context.dhw} ${context.source} features ${String(context.features.htr)}`;

/** The reference context of the "No empty band" scenario: variant 4 with every feature true. */
const VARIANT_4: DrawContext = {
  model: 'B',
  dhw: 'external',
  source: 'ground',
  features: featuresOf(true),
};

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A symbol's drawn extent in its own frame (before the turn), from symbols.ts. */
function localBox(part: Component): [number, number, number, number] {
  switch (part.kind) {
    case 'pump':
      return [-12, -12, 12, 12];
    case 'valve3':
      return [-12, -21, 12, 12];
    case 'inversion_valve':
    case 'compressor':
      return [-14, -14, 14, 14];
    case 'probe_t':
    case 'transducer_p':
      return [-9, -9, 9, 16];
    case 'thermostat':
      return [-7, -7, 7, 16];
    case 'exchanger': {
      const span = (part.size ?? 34) + 9;
      return [-20, -span, 20, span];
    }
    case 'valve':
    case 'drain_valve':
      return [-6, -9, 6, 9];
    case 'resistor':
      return [-28, -6, 28, 6];
    case 'filter_dryer':
      return [-14, -5, 14, 5];
    case 'expansion_valve':
      return [-12, -6, 12, 6];
    case 'port':
      return [-5, -6, 5, 0];
    default:
      return [0, 0, 0, 0];
  }
}

function boxOf(part: Component): Box {
  const [a, b, c, d] = localBox(part);
  const corners = (
    [
      [a, b],
      [c, d],
    ] as const
  ).map(([x, y]): Point => {
    switch (part.rotation) {
      case 0:
        return [x, y];
      case 90:
        return [-y, x];
      case 180:
        return [-x, -y];
      case 270:
        return [y, -x];
    }
  });
  const xs = corners.map((corner) => corner[0] + part.x);
  const ys = corners.map((corner) => corner[1] + part.y);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

const apart = (u: Box, v: Box): boolean => u.x1 <= v.x0 || v.x1 <= u.x0 || u.y1 <= v.y0 || v.y1 <= u.y0;

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
  test('Wider, shorter cabinet: a wider and less tall cabinet and a wider drawing', () => {
    expect(simplified.id).toBe('horizontal');
    expect(simplified.viewBox.width).toBe(1000);
    expect(simplified.cabinet.width).toBeGreaterThan(frame.zones.cabinet.width);
    expect(simplified.cabinet.width).toBe(620);
    expect(simplified.cabinet.height).toBeLessThan(frame.zones.cabinet.height);
    expect(simplified.viewBox.height / simplified.viewBox.width).toBeLessThan(
      frame.zones.viewBox.height / frame.zones.viewBox.width,
    );
    expect(simplified.cabinet.y).toBe(frame.zones.cabinet.y);
  });

  test("the frame is the manual figure's: the coordinates of add-schematic-card", () => {
    expect(frame.zones.viewBox).toEqual({ width: 1000, height: 620 });
    expect(frame.zones.cabinet).toEqual({ x: 240, y: 130, width: 520, height: 475 });
  });

  test("the maps are monotone, ascending and start the cabinet where the frame's does", () => {
    for (const map of [SIMPLIFIED_MAP_X, SIMPLIFIED_MAP_Y]) {
      map.slice(1).forEach(([from, to], index) => {
        const [from0, to0] = map[index] ?? [0, 0];
        expect(from).toBeGreaterThan(from0);
        // only stretch: no interval gets shorter
        expect(to - to0).toBeGreaterThanOrEqual(from - from0);
      });
    }
    expect(mapAxis(SIMPLIFIED_MAP_X, frame.zones.cabinet.x)).toBe(simplified.cabinet.x);
    expect(mapAxis(SIMPLIFIED_MAP_X, frame.zones.cabinet.x + frame.zones.cabinet.width)).toBe(
      simplified.cabinet.x + simplified.cabinet.width,
    );
    for (let x = 200; x < 800; x += 7)
      expect(mapAxis(SIMPLIFIED_MAP_X, x + 1)).toBeGreaterThan(mapAxis(SIMPLIFIED_MAP_X, x));
  });

  test('every symbol keeps its size: each pair of ports of a component is as far apart as in the frame', () => {
    for (const part of simplified.components) {
      const twin = frame.components.find((candidate) => candidate.item === part.item && candidate.kind === part.kind);
      if (twin === undefined || part.item === 50) continue;
      const [a, b] = [portsOf(part), portsOf(twin)];
      expect(a.length).toBe(b.length);
      const relative = (ports: Point[]): Point[] =>
        ports.map(([x, y]) => [x - (ports[0]?.[0] ?? 0), y - (ports[0]?.[1] ?? 0)]);
      // item 38 is the named exception: it is turned
      if (part.item !== 38) expect(relative(a), `item ${String(part.item)}`).toEqual(relative(b));
    }
  });

  test('the labels with a place of their own have a reason, are in the arrangement and sit where the table says', () => {
    const ids = Object.keys(HORIZONTAL_PLACES);
    expect(ids.length).toBeGreaterThan(0);
    for (const [id, place] of Object.entries(HORIZONTAL_PLACES)) {
      expect(place.reason.length, id).toBeGreaterThan(20);
      const spec = simplified.labels.specs.find((label) => label.id === id);
      expect(spec, id).toBeDefined();
      expect({ x: spec?.x, y: spec?.y, align: spec?.align }, id).toEqual(
        place.at(simplified, (x, y) => [mapAxis(SIMPLIFIED_MAP_X, x), mapAxis(SIMPLIFIED_MAP_Y, y)]),
      );
    }
  });

  test('the exceptions to the maps are named with a reason', () => {
    expect(Object.keys(SIMPLIFIED_EXCEPTIONS).sort()).toEqual([
      'component 38',
      'label production_pressure',
      'segment prod_tap_a',
    ]);
    for (const reason of Object.values(SIMPLIFIED_EXCEPTIONS)) expect(reason.length).toBeGreaterThan(10);
  });

  test("every cabinet point is the frame's point under the maps, except the named exceptions", () => {
    const fx = (x: number): number => mapAxis(SIMPLIFIED_MAP_X, x);
    const fy = (y: number): number => mapAxis(SIMPLIFIED_MAP_Y, y);
    const inCabinet = (x: number): boolean =>
      x >= frame.zones.cabinet.x && x <= frame.zones.cabinet.x + frame.zones.cabinet.width;
    for (const part of simplified.components) {
      if (part.item === 50 || part.item === 51 || part.item === 38) continue;
      const twin = frame.components.find((candidate) => candidate.item === part.item && candidate.kind === part.kind);
      expect(twin, `item ${String(part.item)}`).toBeDefined();
      expect([part.x, part.y], `item ${String(part.item)}`).toEqual([fx(twin?.x ?? NaN), fy(twin?.y ?? NaN)]);
    }
    for (const segment of simplified.segments) {
      if (segment.id === 'prod_tap_a') continue;
      const twin = frame.segments.find((candidate) => candidate.id === segment.id);
      expect(twin, segment.id).toBeDefined();
      if (segment.id.startsWith('src_') || segment.id.startsWith('dhw_ext_')) {
        // zone pipes: only their points at the cabinet's columns are mapped
        segment.points.forEach((point, index) => {
          const original = twin?.points[index];
          if (original !== undefined && inCabinet(original[0])) {
            expect(point, `${segment.id}[${String(index)}]`).toEqual([fx(original[0]), fy(original[1])]);
          }
        });
        continue;
      }
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
      'dg1_demand',
      'brine_out',
      'brine_in',
      'brine_pressure',
      'brine_pump',
      'discharge_temperature',
      'discharge_pressure',
      'suction_temperature',
      'suction_pressure',
      'compressor_speed',
      'superheat',
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

  test('no point of the source and tank pipes lies in the cabinet columns, except the pipes of ports 3 to 6', () => {
    const columns = simplified.components
      .filter((part) => part.kind === 'port' && part.item >= 3 && part.item <= 6)
      .map((part) => part.x);
    for (const segment of simplified.segments) {
      if (!segment.id.startsWith('src_') && !segment.id.startsWith('dhw_ext_')) continue;
      for (const [x] of segment.points) {
        if (x >= simplified.cabinet.x && x <= simplified.cabinet.x + simplified.cabinet.width)
          expect(columns, `${segment.id} at x ${String(x)}`).toContain(x);
      }
    }
    expect(simplified.externalTank.x).toBeGreaterThan(760);
    expect(simplified.airUnit.x + simplified.airUnit.width).toBeLessThan(240);
  });

  test('every crossing is between two segments of the arrangement', () => {
    const ids = new Set(simplified.segments.map((segment) => segment.id));
    for (const crossing of simplified.crossings) {
      expect(ids.has(crossing.over) && ids.has(crossing.under)).toBe(true);
    }
  });
});

describe('the source and the external tank (outer-loop-source, dhw-storage on the simplified arrangement)', () => {
  test('Source aligned to the cabinet: the housing top and the ground line are on the cabinet top line', () => {
    expect(simplified.airUnit.y).toBe(simplified.cabinet.y);
    expect(simplified.groundLineY.ground).toBe(simplified.cabinet.y);
    expect(simplified.groundLineY.hybrid).toBeGreaterThan(simplified.airUnit.y + simplified.airUnit.height);
    for (const source of SOURCES) {
      const context = { ...VARIANT_4, source };
      if (source === 'ground') {
        expect(first(context, 'src_gnd_down')[1]).toBe(simplified.cabinet.y);
        expect(last(context, 'src_gnd_up')[1]).toBe(simplified.cabinet.y);
      }
    }
  });

  test('the tank: its dome apex is on the cabinet top line and its centre line is the coil', () => {
    const { externalTank, cabinet, externalCoil } = simplified;
    expect(externalTank.y).toBe(cabinet.y);
    expect(externalTank.x + externalTank.width / 2).toBe(externalCoil.cx);
    expect(externalCoil.top).toBeGreaterThan(externalTank.y + externalTank.height / 3);
    expect(externalCoil.bottom).toBeLessThan(externalTank.y + externalTank.height - externalTank.dome);
  });

  test('the source zone ends at about x 190, the tank zone starts at about x 840, with the cabinet between', () => {
    const { airUnit, airUnitWallX, groundLineX, run, cabinet, externalTank } = simplified;
    expect(airUnit.x).toBeGreaterThan(0);
    expect(Math.max(airUnitWallX, groundLineX.end, run.feedX)).toBeLessThanOrEqual(190);
    expect(cabinet.x).toBeGreaterThan(190);
    expect(cabinet.x + cabinet.width).toBeLessThan(840);
    expect(externalTank.x).toBeGreaterThanOrEqual(840);
    expect(externalTank.x + externalTank.width).toBeLessThanOrEqual(1000);
    for (const source of SOURCES) {
      const context = { ...VARIANT_4, source };
      for (const { part } of drawnSegments(context).filter((entry) => entry.part.id.startsWith('src_'))) {
        // the run's two long pipes start at ports 3 and 4 in the cabinet; the rest of the source stays left of it
        if (part.id === 'src_out' || part.id === 'src_in') continue;
        for (const point of part.points) expect(point[0], part.id).toBeLessThan(simplified.cabinet.x);
      }
    }
  });

  test("the source and the tank are the frame's at a uniform scale of about 0.8", () => {
    expect(SIMPLIFIED_ZONE_SCALE).toBe(0.8);
    const ratio = (a: number, b: number): number => a / b;
    const full = frame.zones;
    expect(ratio(simplified.airUnit.width, full.airUnit.width)).toBeCloseTo(0.8, 1);
    expect(ratio(simplified.airUnit.height, full.airUnit.height)).toBeCloseTo(0.8, 1);
    expect(ratio(simplified.airUnit.fanRadius, full.airUnit.fanRadius)).toBeCloseTo(0.8, 1);
    expect(ratio(simplified.groundLoop.depth, full.groundLoop.depth)).toBeCloseTo(0.8, 1);
    expect(
      ratio(simplified.groundLoop.downX - simplified.groundLoop.upX, full.groundLoop.downX - full.groundLoop.upX),
    ).toBeCloseTo(0.8, 1);
    expect(ratio(simplified.externalTank.width, full.externalTank.width)).toBeCloseTo(0.8, 1);
    expect(ratio(simplified.externalTank.height, full.externalTank.height)).toBeCloseTo(0.8, 1);
    expect(ratio(simplified.externalCoil.rx, full.externalCoil.rx)).toBeCloseTo(0.8, 1);
  });

  test.each(
    CONTEXTS.filter((context) => context.features.htr === true).map((context) => [name(context), context] as const),
  )('the source and tank pipes meet their ports: %s', (_name, context) => {
    expect(first(context, 'src_out')).toEqual(portOf(context, 3));
    expect(last(context, 'src_in')).toEqual(portOf(context, 4));
    const feed = { air: 'src_air_feed', ground: 'src_gnd_feed', hybrid: 'src_hyb_feed' }[context.source];
    const exit = { air: 'src_air_exit', ground: 'src_gnd_exit', hybrid: 'src_hyb_exit' }[context.source];
    expect(first(context, feed)).toEqual(last(context, 'src_out'));
    expect(last(context, exit)).toEqual(first(context, 'src_in'));
    if (context.dhw === 'external' || (context.dhw === 'unused' && context.model === 'B')) {
      expect(first(context, 'dhw_ext_in')).toEqual(portOf(context, 5));
      expect(last(context, 'dhw_ext_out')).toEqual(portOf(context, 6));
      expect(last(context, 'dhw_ext_in')).toEqual(first(context, 'dhw_ext_coil'));
      expect(last(context, 'dhw_ext_coil')).toEqual(first(context, 'dhw_ext_out'));
    }
  });
});

describe('the invariants of the full level on the simplified arrangement', () => {
  test.each(CONTEXTS.map((context) => [name(context), context] as const))('%s', (_name, context) => {
    const arrangement = simplified;
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
    if (context.source !== 'ground') {
      const { x, y, width, height } = arrangement.airUnit;
      expect(x).toBeGreaterThan(0);
      expect(x + width).toBeLessThan(cabinet.x);
      expect(y + height).toBeLessThan(arrangement.viewBox.height);
    }
    if (context.source !== 'air') {
      const { downX, upX, depth } = arrangement.groundLoop;
      const lineY = arrangement.groundLineY[context.source === 'hybrid' ? 'hybrid' : 'ground'];
      expect(Math.min(upX - arrangement.loopBend, arrangement.groundLineX.start)).toBeGreaterThanOrEqual(0);
      expect(Math.max(downX, arrangement.groundLineX.end)).toBeLessThan(cabinet.x);
      expect(lineY + depth).toBeLessThan(arrangement.viewBox.height);
    }
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

  test('every declared crossing is a real crossing of the simplified pipes', () => {
    for (const crossing of simplified.crossings) {
      const over = simplified.segments.find((segment) => segment.id === crossing.over);
      const under = simplified.segments.find((segment) => segment.id === crossing.under);
      if (over === undefined || under === undefined) throw new Error('no segment');
      expect(crossingPoints(over.points, under.points), `${crossing.over} / ${crossing.under}`).toContainEqual(
        crossing.at,
      );
    }
  });

  test('HTR placement: exchanger 9 is on the discharge line between compressor 11 and valve 14, its water joins the DHW lines', () => {
    const context = { ...VARIANT_4 };
    const ids = new Set(drawnSegments(context).map((entry) => entry.part.id));
    for (const item of [9, 17, 22, 25])
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
    const context = { ...VARIANT_4 };
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
    const { cabinet } = simplified;
    const bottom = cabinet.y + cabinet.height;
    const lowestPart = Math.max(...drawnComponents(VARIANT_4).map((entry) => boxOf(entry.part).y1));
    const lowestPipe = Math.max(
      ...drawnSegments(VARIANT_4).flatMap((entry) => entry.part.points.map((point) => point[1])),
    );
    const lowest = Math.max(lowestPart, lowestPipe);
    expect(lowest).toBeLessThanOrEqual(bottom);
    expect(bottom - lowest).toBeLessThanOrEqual(40);
  });

  test('Pressure 38 inside the cabinet: the transducer and its stub, on the production return side', () => {
    const { cabinet } = simplified;
    const context = { ...VARIANT_4 };
    const part = drawnComponents(context).find((entry) => entry.part.item === 38)?.part;
    if (part === undefined) throw new Error('no transducer 38');
    const box = boxOf(part);
    expect(box.x0).toBeGreaterThan(cabinet.x);
    expect(box.x1).toBeLessThan(cabinet.x + cabinet.width);
    expect(box.y1).toBeLessThan(cabinet.y + cabinet.height);
    // the production return side: the left half, with the trunk (pump 15's suction)
    expect(part.x).toBeLessThan(cabinet.x + cabinet.width / 2);
    for (const point of pointsOf(context, 'prod_tap_a')) {
      expect(point[1]).toBeLessThan(cabinet.y + cabinet.height);
      expect(point[0]).toBeLessThan(cabinet.x + cabinet.width / 2);
    }
    // its stem is on the stub's end
    expect(portsOf(part)[0]).toEqual(last(context, 'prod_tap_a'));
  });
});
