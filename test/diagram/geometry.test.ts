import { describe, expect, test } from 'vitest';
import type { CircuitId, Circuits } from '../../src/calc/circuits';
import {
  DETAIL_LEVELS,
  DHW_STORAGES,
  SOURCES,
  type Detail,
  type DhwStorage,
  type Model,
  type Source,
} from '../../src/config/options';
import type { RolePath } from '../../src/config/roles';
import { FEATURE_KEYS, type FeatureKey, type FeatureState, type Features } from '../../src/config/variants';
import {
  HOP,
  HTR_WATER_SEGMENT_IDS,
  MAX_CROSSINGS,
  crossingPoints,
  drawnComponents,
  drawnStorage,
  drawnSegments,
  gapsIn,
  helixExtent,
  helixHalves,
  isSegmentActive,
  onInternalTank,
  onPolyline,
  overlap,
  partState,
  pathData,
  portsOf,
  roundedPathData,
  routePoints,
  type DrawContext,
  type Point,
  arrangementFor,
  arrangementOf,
} from '../../src/diagram/geometry';

const fullArr = arrangementFor('full', 'full');
const AIR_PORT_Y = fullArr.airPortY;
const AIR_UNIT_WALL_X = fullArr.airUnitWallX;
const CABINET = fullArr.cabinet;
const GROUND_CAPTION = fullArr.groundCaption;
const GROUND_LINE_Y = fullArr.groundLineY;
const GROUND_LOOP = fullArr.groundLoop;
const COMPONENTS = fullArr.components;
const AIR_UNIT = fullArr.airUnit;
const CROSSINGS = fullArr.crossings;
const EXTERNAL_TANK = fullArr.externalTank;
const INTERNAL_TANK = fullArr.internalTank;
const SEGMENTS = fullArr.segments;
const viewBox = fullArr.viewBox;

const STATES: readonly FeatureState[] = [true, false, 'unused'];

/** Every combination of the four features, the two models, the DHW storages, the three sources and the two levels of detail. */
function contexts(): DrawContext[] {
  const result: DrawContext[] = [];
  const build = (index: number, features: Partial<Record<FeatureKey, FeatureState>>): void => {
    const key = FEATURE_KEYS[index];
    if (key === undefined) {
      for (const model of ['B', 'C'] as const) {
        for (const dhw of DHW_STORAGES) {
          for (const source of SOURCES) {
            for (const detail of DETAIL_LEVELS) {
              result.push({ model, dhw, source, detail, features: features as Features });
            }
          }
        }
      }
      return;
    }
    for (const state of STATES) build(index + 1, { ...features, [key]: state });
  };
  build(0, {});
  return result;
}

const ALL = contexts();
const full = (
  dhw: DhwStorage = 'external',
  source: Source = 'ground',
  detail: Detail = 'full',
  model: Model = dhw === 'internal' ? 'C' : 'B',
): DrawContext => ({
  model,
  dhw,
  source,
  detail,
  features: { active_cooling: true, passive_cooling: true, htr: true, backup_heater: true },
});
const label = (context: DrawContext): string =>
  `${context.detail} ${context.model} ${context.dhw} ${context.source} ${JSON.stringify(context.features)}`;
const items = (context: DrawContext): number[] => drawnComponents(context).map((entry) => entry.part.item);
const ids = (context: DrawContext): string[] => drawnSegments(context).map((entry) => entry.part.id);
const circuits = (valves2728: Circuits['valves2728'], active: readonly CircuitId[]): Circuits => ({
  valve26: 'production',
  valve14: 'normal',
  valves2728,
  active: new Set(active),
});
const segmentPoints = (id: string): readonly Point[] => SEGMENTS.find((segment) => segment.id === id)?.points ?? [];

/** Whether a polyline passes through the inside of a rectangle. */
const enters = (points: readonly Point[], rect: { x: number; y: number; width: number; height: number }): boolean =>
  points.slice(1).some((end, index) => {
    const start = points[index];
    if (start === undefined) return false;
    const [x0, x1] = [Math.min(start[0], end[0]), Math.max(start[0], end[0])];
    const [y0, y1] = [Math.min(start[1], end[1]), Math.max(start[1], end[1])];
    return x1 > rect.x && x0 < rect.x + rect.width && y1 > rect.y && y0 < rect.y + rect.height;
  });

describe('geometry data', () => {
  test('the viewBox and the cabinet fit the zones of add-schematic-card D5', () => {
    expect(viewBox).toEqual({ width: 1000, height: 620 });
    expect(CABINET.x).toBe(240);
    expect(CABINET.x + CABINET.width).toBe(760);
    expect(CABINET.y).toBe(130);
  });

  test('ports 1 to 6 sit on the top edge in the manual order', () => {
    const ports = COMPONENTS.filter((component) => component.kind === 'port' && component.item <= 6);
    expect(ports.map((port) => port.item)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(ports.every((port) => port.y === CABINET.y)).toBe(true);
    const xs = ports.map((port) => port.x);
    expect(xs).toEqual([...xs].sort((a, b) => a - b));
  });

  test('every component has an item number from 1 to 54', () => {
    for (const component of COMPONENTS) {
      expect(Number.isInteger(component.item) && component.item >= 1 && component.item <= 54).toBe(true);
    }
  });

  test('every segment has at least two points and a circuit, and ids are unique', () => {
    for (const segment of SEGMENTS) {
      expect(segment.points.length, segment.id).toBeGreaterThanOrEqual(2);
      expect(segment.circuit.length, segment.id).toBeGreaterThan(0);
    }
    expect(new Set(SEGMENTS.map((segment) => segment.id)).size).toBe(SEGMENTS.length);
  });

  test('the DG1 stubs of ports 1 and 2 end below the pipe run', () => {
    for (const id of ['p1_stub', 'p2_stub']) {
      const ys = segmentPoints(id).map((point) => point[1]);
      expect(ys.length).toBeGreaterThan(0);
      expect(Math.min(...ys)).toBeGreaterThan(110);
      expect(Math.max(...ys)).toBeLessThanOrEqual(CABINET.y);
    }
  });

  test('the production trunk serves DG1 and DHW, and the discharge line runs 11 to 9 to 14', () => {
    const trunk = SEGMENTS.find((segment) => segment.id === 'trunk');
    expect(trunk?.circuit).toEqual(['production_dg1', 'production_dhw']);
    const port = (item: number): Point[] => {
      const component = COMPONENTS.find((candidate) => candidate.item === item);
      return component === undefined ? [] : portsOf(component);
    };
    const discharge = segmentPoints('ref_discharge');
    expect(port(11)).toContainEqual(discharge[0]);
    expect(port(9)).toContainEqual(discharge.at(-1));
    expect(port(9)).toContainEqual(segmentPoints('ref_9_14')[0]);
    expect(port(14)).toContainEqual(segmentPoints('ref_9_14').at(-1));
  });

  test('isSegmentActive: a multi-circuit segment is active when any circuit is', () => {
    const trunk = { circuit: ['production_dg1', 'production_dhw'] } as const;
    expect(isSegmentActive(trunk, circuits('closed', ['production_dhw']))).toBe(true);
    expect(isSegmentActive(trunk, circuits('closed', ['brine']))).toBe(false);
  });

  test('isSegmentActive: the legs behind a closed arm of valves 27/28 are active only while the valves are closed', () => {
    for (const id of ['prod_27_in', 'br_feed7', 'brine_7_28']) {
      const segment = SEGMENTS.find((candidate) => candidate.id === id);
      if (segment === undefined) throw new Error(id);
      const active = segment.circuit;
      expect(isSegmentActive(segment, circuits('closed', active)), id).toBe(true);
      expect(isSegmentActive(segment, circuits('exchanger', active)), id).toBe(false);
    }
  });

  test.each([fullArr, arrangementFor('simplified', 'full')])(
    'every crossing lies strictly inside the cabinet and at least a hop from the corners of the pipe it breaks ($id)',
    (arr) => {
      const segmentPoints = (id: string): readonly Point[] =>
        arr.segments.find((segment) => segment.id === id)?.points ?? [];
      const CABINET = arr.cabinet;
      for (const { at, under } of arr.crossings) {
        expect(at[0] > CABINET.x && at[0] < CABINET.x + CABINET.width, under).toBe(true);
        expect(at[1] > CABINET.y && at[1] < CABINET.y + CABINET.height, under).toBe(true);
        const points = segmentPoints(under);
        points.slice(1).forEach((end, index) => {
          const start = points[index];
          if (start === undefined) return;
          const onPiece =
            (start[0] === end[0] &&
              at[0] === start[0] &&
              at[1] > Math.min(start[1], end[1]) &&
              at[1] < Math.max(start[1], end[1])) ||
            (start[1] === end[1] &&
              at[1] === start[1] &&
              at[0] > Math.min(start[0], end[0]) &&
              at[0] < Math.max(start[0], end[0]));
          if (!onPiece) return;
          const toStart = Math.abs(at[0] - start[0]) + Math.abs(at[1] - start[1]);
          const toEnd = Math.abs(at[0] - end[0]) + Math.abs(at[1] - end[1]);
          expect(Math.min(toStart, toEnd), under).toBeGreaterThanOrEqual(HOP);
        });
      }
    },
  );

  test('gapsIn: no gap when the pipe on top is not drawn', () => {
    const idsOf = (context: DrawContext): Set<string> => new Set(ids(context));
    expect(gapsIn(fullArr, 'p2_in', idsOf(full('external')))).toContainEqual([312, 172]);
    expect(gapsIn(fullArr, 'p2_in', idsOf(full('none')))).toEqual([]);
    expect(pathData(segmentPoints('p2_in'), gapsIn(fullArr, 'p2_in', idsOf(full('none'))))).toBe('M312 130 L312 198');
  });
});

describe('integrity in every configuration', () => {
  test.each(ALL.map((context) => [label(context), context] as const))('%s', (_name, context) => {
    const components = drawnComponents(context).map((entry) => entry.part);
    const segments = drawnSegments(context).map((entry) => entry.part);
    const ports = components.flatMap((component) => portsOf(component));

    // every segment endpoint touches a component port or another segment (or leaves through the top edge)
    for (const segment of segments) {
      for (const end of [segment.points[0], segment.points[segment.points.length - 1]]) {
        if (end === undefined) throw new Error('no point');
        const atPort = ports.some((port) => port[0] === end[0] && port[1] === end[1]);
        const onOther = segments.some(
          (other) =>
            other !== segment &&
            (other.shape === undefined
              ? onPolyline(end, other.points)
              : other.points.some((p) => p[0] === end[0] && p[1] === end[1])),
        );
        // a stub may end free above the top edge (DG1, the taps of model C) or on the integrated tank
        const stub =
          segment.stub === true &&
          (end[1] < arrangementOf(context).cabinet.y || onInternalTank(end, arrangementOf(context)));
        expect(atPort || onOther || stub, `${segment.id} at ${end.join(',')}`).toBe(true);
      }
    }

    // every port of a drawn component is touched by a drawn segment (the drain valve 53 and probe 54 touch the tank)
    for (const component of components) {
      for (const port of portsOf(component)) {
        const touched =
          segments.some((segment) => onPolyline(port, segment.points)) ||
          ([53, 54].includes(component.item) && onInternalTank(port, arrangementOf(context)));
        expect(touched, `item ${String(component.item)} port ${port.join(',')}`).toBe(true);
      }
    }

    // each probe's stem touches a pipe of its own temperature role
    const probeRoles: [number, RolePath][] = [
      [33, 'production.outlet_temperature'],
      [34, 'production.return_temperature'],
      [31, 'brine.outlet_temperature'],
      [32, 'brine.inlet_temperature'],
      [30, 'compressor.discharge_temperature'],
      [29, 'compressor.suction_temperature'],
    ];
    for (const [item, role] of probeRoles) {
      const probe = components.find((component) => component.item === item);
      const stem = probe === undefined ? undefined : portsOf(probe)[0];
      if (stem === undefined) throw new Error(`probe ${String(item)}`);
      expect(
        segments.some((segment) => segment.temperatureRole === role && onPolyline(stem, segment.points)),
        `probe ${String(item)}`,
      ).toBe(true);
    }

    // HTR water joins the DHW lines: pump 17's feed on the return, the riser on the supply
    const htrIn = segments.find((segment) => segment.id === 'htr_in');
    const riser = segments.find((segment) => segment.id === 'htr_riser');
    expect(htrIn === undefined, 'htr_in').toBe(riser === undefined);
    if (htrIn !== undefined && riser !== undefined) {
      const start = htrIn.points[0];
      const end = riser.points[riser.points.length - 1];
      if (start === undefined || end === undefined) throw new Error('no point');
      expect(segments.some((s) => s.id.startsWith('dhw_ret_') && onPolyline(start, s.points))).toBe(true);
      expect(segments.some((s) => s.id.startsWith('dhw_sup_') && onPolyline(end, s.points))).toBe(true);
    }

    // the source and DHW parts appear only for their config values
    const idsDrawn = new Set(segments.map((segment) => segment.id));
    const has = (prefix: string): boolean => [...idsDrawn].some((id) => id.startsWith(prefix));
    expect(has('src_air_'), 'air').toBe(context.source === 'air');
    expect(has('src_gnd_'), 'ground').toBe(context.source === 'ground');
    expect(has('src_hyb_'), 'hybrid').toBe(context.source === 'hybrid');
    expect(idsDrawn.has('src_out') && idsDrawn.has('src_in')).toBe(true);
    expect(has('dhw_ext_'), 'external').toBe(drawnStorage(context) === 'external');
    expect(has('tap_'), 'taps').toBe(drawnStorage(context) === 'internal');
    const drawnItems = components.map((component) => component.item);
    for (const item of [47, 48, 49, 50, 51, 52, 53, 54]) {
      const serviceOnly = item === 52 || item === 53;
      expect(drawnItems.includes(item), `item ${String(item)}`).toBe(
        drawnStorage(context) === 'internal' && (!serviceOnly || context.detail === 'full'),
      );
    }

    // the source and external DHW pipes stay above y 100 outside the cabinet (the circuit labels' glyphs reach about
    // y 104)
    for (const segment of segments.filter((s) => s.id.startsWith('src_') || s.id.startsWith('dhw_ext_'))) {
      for (const point of segment.points) {
        if (point[1] < arrangementOf(context).cabinet.y) expect(point[1], segment.id).toBeLessThanOrEqual(100);
      }
    }

    // only the coil lines enter the integrated tank (the taps end on its top wall), only the external coil pipes the external tank
    // and only the air coil pipes the air unit's housing
    const entering = (rect: { x: number; y: number; width: number; height: number }): string[] =>
      segments.filter((segment) => enters(routePoints(segment), rect)).map((segment) => segment.id);
    // (a tank that is not drawn is not checked)
    if (drawnStorage(context) === 'internal')
      expect(entering(arrangementOf(context).internalTank).sort()).toEqual(['dhw_ret_b', 'dhw_sup_b']);
    if (drawnStorage(context) === 'external') {
      expect(entering(arrangementOf(context).externalTank).sort()).toEqual([
        'dhw_ext_coil',
        'dhw_ext_in',
        'dhw_ext_out',
      ]);
    }
    if (context.source !== 'ground') {
      expect(entering(arrangementOf(context).airUnit).sort()).toEqual(
        context.source === 'air'
          ? ['src_air_coil', 'src_air_exit', 'src_air_feed']
          : ['src_hyb_coil', 'src_hyb_feed', 'src_hyb_link'],
      );
    }

    // no segments cross unless the crossing is declared (and every crossing lies inside the cabinet), and none run
    // along each other
    const declared = new Set(
      arrangementOf(context).crossings.map((crossing) => `${crossing.over}|${crossing.under}|${crossing.at.join(',')}`),
    );
    segments.forEach((first, index) => {
      for (const second of segments.slice(index + 1)) {
        for (const at of crossingPoints(routePoints(first), routePoints(second))) {
          const found =
            declared.has(`${first.id}|${second.id}|${at.join(',')}`) ||
            declared.has(`${second.id}|${first.id}|${at.join(',')}`);
          expect(found, `${first.id} x ${second.id} at ${at.join(',')}`).toBe(true);
          expect(
            at[0] > arrangementOf(context).cabinet.x &&
              at[0] < arrangementOf(context).cabinet.x + arrangementOf(context).cabinet.width &&
              at[1] > arrangementOf(context).cabinet.y,
            `${first.id} x ${second.id} outside the cabinet`,
          ).toBe(true);
        }
        expect(overlap(routePoints(first), routePoints(second)), `${first.id} along ${second.id}`).toBe(false);
      }
    });
  });

  test('every declared crossing is a real crossing', () => {
    for (const crossing of CROSSINGS) {
      const found = crossingPoints(segmentPoints(crossing.over), segmentPoints(crossing.under));
      expect(found, `${crossing.over} / ${crossing.under}`).toContainEqual(crossing.at);
    }
  });

  test('the crossings inside the cabinet stay at or below the manual figure (add-schematic-card D5)', () => {
    expect(MAX_CROSSINGS).toBe(15);
    expect(CROSSINGS.length).toBeLessThanOrEqual(MAX_CROSSINGS);
  });
});

describe('feature states', () => {
  const without = (key: FeatureKey): DrawContext => ({
    ...full(),
    features: { ...full().features, [key]: false },
  });
  const removed = (key: FeatureKey): number[] =>
    items(full())
      .filter((item) => !items(without(key)).includes(item))
      .sort((a, b) => a - b);

  test('a false feature removes its parts entirely', () => {
    expect(removed('active_cooling')).toEqual([14]);
    expect(removed('passive_cooling')).toEqual([10, 27, 28]);
    expect(removed('htr')).toEqual([9, 17, 22, 25]);
    expect(removed('backup_heater')).toEqual([44, 45]);
  });

  test('the pipes of a removed part go too, and a bypass takes their place', () => {
    expect(ids(without('passive_cooling'))).not.toContain('prod_10_in');
    expect(ids(without('passive_cooling'))).toContain('prod_bypass27');
    expect(ids(without('passive_cooling'))).toContain('brine_bypass28');
    expect(ids(without('htr'))).toContain('ref_discharge_direct');
    expect(ids(without('htr'))).not.toContain('htr_riser');
    expect(ids(without('active_cooling'))).toContain('ref_direct_suction');
    expect(ids(without('backup_heater'))).toContain('prod_bypass44');
  });

  test('an unused feature is drawn muted, its through pipes stay normal', () => {
    const context: DrawContext = { ...full(), features: { ...full().features, htr: 'unused' } };
    expect(partState({ feature: 'htr' }, context)).toBe('muted');
    expect(partState({ through: 'htr' }, context)).toBe('normal');
    expect(items(context)).toEqual(expect.arrayContaining([9, 17, 22, 25]));
  });

  test('without DHW storage there are no ports 5/6, no valve 26 and no HTR', () => {
    for (const item of [5, 6, 26, 9, 17, 22, 25]) expect(items(full('none'))).not.toContain(item);
    expect(ids(full('none'))).toContain('p1_direct');
    expect(ids(full('none'))).not.toContain('p1_up');
  });

  test('the internal tank of model C has no ports 5/6 and items 47 to 54', () => {
    expect(items(full('internal'))).not.toContain(5);
    expect(items(full('internal'))).not.toContain(6);
    expect(items(full('internal'))).toContain(26);
    for (const item of [47, 48, 49, 50, 51, 52, 53, 54]) expect(items(full('internal'))).toContain(item);
  });

  test('the segments that carry HTR water are the DHW lines outside the arm of valve 26 and the external tank pipes', () => {
    expect([...HTR_WATER_SEGMENT_IDS].sort()).toEqual([
      'dhw_ext_coil',
      'dhw_ext_in',
      'dhw_ext_out',
      'dhw_ret_b',
      'dhw_ret_c',
      'dhw_sup_b',
      'dhw_sup_c',
    ]);
    // every DHW line is in the list or is the arm of valve 26 (the production_dhw circuit), or an internal tap
    const dhwLines = SEGMENTS.filter((segment) => /^(dhw_sup_|dhw_ret_|dhw_ext_)/.test(segment.id));
    for (const segment of dhwLines) {
      expect(HTR_WATER_SEGMENT_IDS.includes(segment.id), segment.id).toBe(!segment.circuit.includes('production_dhw'));
    }
  });

  test('coil 51 and tank 50 sit on the integrated tank and the ends of the DHW lines', () => {
    const coil = COMPONENTS.find((component) => component.item === 51);
    const tank = COMPONENTS.find((component) => component.item === 50);
    if (coil === undefined || tank === undefined) throw new Error('no tank');
    expect(portsOf(coil)).toEqual([segmentPoints('dhw_sup_b').at(-1), segmentPoints('dhw_ret_b')[0]]);
    expect([tank.x, tank.y]).toEqual([
      INTERNAL_TANK.x + INTERNAL_TANK.width / 2,
      INTERNAL_TANK.y + INTERNAL_TANK.height / 2,
    ]);
    for (const port of portsOf(coil)) {
      expect(port[0]).toBeGreaterThan(INTERNAL_TANK.x);
      expect(port[1]).toBeGreaterThan(INTERNAL_TANK.y);
      expect(port[1]).toBeLessThan(INTERNAL_TANK.y + INTERNAL_TANK.height);
    }
  });

  test('the new pipes belong to their circuit and take their pump as speed role', () => {
    for (const segment of SEGMENTS.filter((s) => s.id.startsWith('src_'))) {
      expect(segment.circuit, segment.id).toEqual(['brine']);
      expect(segment.speedRole, segment.id).toBe('brine.pump');
    }
    for (const segment of SEGMENTS.filter((s) => s.id.startsWith('dhw_ext_'))) {
      expect(segment.circuit, segment.id).toEqual(['dhw_coil']);
      expect(segment.speedRole, segment.id).toBe('production.pump');
      expect(segment.dhw, segment.id).toBe('external');
    }
    for (const segment of SEGMENTS.filter((s) => s.id.startsWith('tap_'))) {
      expect(segment.stub, segment.id).toBe(true);
      expect(segment.temperatureRole, segment.id).toBe('dhw.temperature');
    }
  });

  test('the integrated tank sits under the top edge and above the probe row', () => {
    expect(INTERNAL_TANK.y).toBeGreaterThan(CABINET.y);
    expect(INTERNAL_TANK.y + INTERNAL_TANK.height).toBeLessThan(CABINET.y + 80);
  });

  test('the source pipes leave from ports 3 and 4 and the DHW pipes from ports 5 and 6', () => {
    const start = (id: string): Point | undefined => segmentPoints(id)[0];
    const end = (id: string): Point | undefined => segmentPoints(id).at(-1);
    expect(start('src_out')).toEqual([630, 130]);
    expect(end('src_in')).toEqual([690, 130]);
    expect(start('dhw_ext_in')).toEqual([722, 130]);
    expect(end('dhw_ext_out')).toEqual([748, 130]);
  });

  test('the source parts follow the source option', () => {
    const idsFor = (source: Source): string[] => ids(full('external', source)).filter((id) => id.startsWith('src_'));
    expect(idsFor('air')).toEqual(['src_out', 'src_in', 'src_air_feed', 'src_air_coil', 'src_air_exit']);
    expect(idsFor('ground')).toEqual([
      'src_out',
      'src_in',
      'src_gnd_feed',
      'src_gnd_down',
      'src_gnd_up',
      'src_gnd_exit',
    ]);
    expect(idsFor('hybrid')).toEqual([
      'src_out',
      'src_in',
      'src_hyb_feed',
      'src_hyb_coil',
      'src_hyb_link',
      'src_hyb_down',
      'src_hyb_up',
      'src_hyb_exit',
    ]);
  });
});

describe('pathData', () => {
  test('a polyline without gaps', () => {
    const points: Point[] = [
      [0, 0],
      [10, 0],
      [10, 10],
    ];
    expect(pathData(points)).toBe('M0 0 L10 0 L10 10');
  });

  test('a gap near the end of a piece is clamped to the piece', () => {
    const points: Point[] = [
      [0, 0],
      [20, 0],
    ];
    expect(pathData(points, [[17, 0]])).toBe(`M0 0 L${String(17 - HOP)} 0 M20 0 L20 0`);
  });

  test('a gap on each side of a crossing', () => {
    const points: Point[] = [
      [0, 0],
      [20, 0],
    ];
    expect(pathData(points, [[10, 0]])).toBe(`M0 0 L${String(10 - HOP)} 0 M${String(10 + HOP)} 0 L20 0`);
  });

  test('a thicker pipe asks for a wider gap (add-compact-layout D4)', () => {
    const points: Point[] = [
      [0, 0],
      [40, 0],
    ];
    expect(pathData(points, [[20, 0]], 2 * HOP)).toBe(
      `M0 0 L${String(20 - 2 * HOP)} 0 M${String(20 + 2 * HOP)} 0 L40 0`,
    );
  });
});

describe('helical coil and air coil (refine-schematic-drawing D5, D6)', () => {
  const coil = SEGMENTS.find((segment) => segment.id === 'dhw_ext_coil');
  const shape = coil?.shape;

  test('dhw_ext_coil is a helix of at least four turns whose two points are its ends on the pipes 5/6', () => {
    if (coil === undefined || shape === undefined) throw new Error('no helix');
    expect(shape.turns).toBeGreaterThanOrEqual(4);
    expect(coil.points).toHaveLength(2);
    expect(coil.points[0]).toEqual([shape.cx + shape.rx, shape.top]);
    expect(coil.points[1]).toEqual([shape.cx - shape.rx, shape.bottom]);
    expect(segmentPoints('dhw_ext_in').at(-1)).toEqual(coil.points[0]);
    expect(segmentPoints('dhw_ext_out')[0]).toEqual(coil.points[1]);
    // the coil sits in the lower part of the tank, inside its walls
    expect((shape.top + shape.bottom) / 2).toBeGreaterThan(EXTERNAL_TANK.y + EXTERNAL_TANK.height / 2);
    expect(shape.bottom).toBeLessThan(EXTERNAL_TANK.y + EXTERNAL_TANK.height - EXTERNAL_TANK.dome);
  });

  test('helixHalves alternates front (lower arcs) and back halves, two per turn, from the start to the end', () => {
    if (shape === undefined) throw new Error('no helix');
    const halves = helixHalves(shape);
    expect(halves).toHaveLength(Math.round(shape.turns * 2));
    expect(halves.map((half) => half.front)).toEqual(halves.map((_, index) => index % 2 === 0));
    expect(halves[0]?.d.startsWith(`M${String(shape.cx + shape.rx)} ${String(shape.top)} `)).toBe(true);
    expect(halves.at(-1)?.d.endsWith(`${String(shape.cx - shape.rx)} ${String(shape.bottom)}`)).toBe(true);
  });

  test('a helix is checked as the rectangle of its extent, other segments as their points', () => {
    if (coil === undefined || shape === undefined) throw new Error('no helix');
    const ring = routePoints(coil);
    // both end points lie on the box's edge
    for (const end of coil.points) expect(onPolyline(end, ring)).toBe(true);
    expect(routePoints({ points: segmentPoints('trunk') })).toEqual(segmentPoints('trunk'));
    // a pipe that cuts through the coil would be found
    expect(
      crossingPoints(ring, [
        [890, 150],
        [890, 250],
      ]).length,
    ).toBeGreaterThan(0);
  });

  test('every point of the drawn helix lies inside the box that stands for it', () => {
    if (shape === undefined || coil === undefined) throw new Error('no helix');
    const box = routePoints(coil);
    const [right, top] = box[0] ?? [0, 0];
    const [left, bottom] = box[2] ?? [0, 0];
    expect({ left, right, top, bottom }).toEqual(helixExtent(shape));
    expect(bottom).toBeGreaterThanOrEqual(shape.bottom);
    expect(top).toBeLessThanOrEqual(shape.top);
    for (const half of helixHalves(shape)) {
      const numbers = (half.d.match(/-?[\d.]+/g) ?? []).map(Number);
      expect(numbers).toHaveLength(8);
      // sample the Bezier independently of helixExtent
      for (let t = 0; t <= 1; t += 0.05) {
        const w = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3];
        const x = w.reduce((sum, weight, i) => sum + weight * (numbers[2 * i] ?? 0), 0);
        const y = w.reduce((sum, weight, i) => sum + weight * (numbers[2 * i + 1] ?? 0), 0);
        expect(x).toBeGreaterThanOrEqual(left);
        expect(x).toBeLessThanOrEqual(right);
        expect(y).toBeGreaterThanOrEqual(top);
        expect(y).toBeLessThanOrEqual(bottom);
      }
    }
  });

  test('no hop gap is declared in a helix or a rounded pipe', () => {
    for (const crossing of CROSSINGS) {
      const under = SEGMENTS.find((segment) => segment.id === crossing.under);
      expect(under?.shape, crossing.under).toBeUndefined();
      expect(under?.bend, crossing.under).toBeUndefined();
    }
  });

  test('roundedPathData rounds each corner with an arc and keeps the end points', () => {
    expect(
      roundedPathData(
        [
          [0, 0],
          [20, 0],
          [20, 18],
          [0, 18],
        ],
        9,
      ),
    ).toBe('M0 0 L11 0 A9 9 0 0 1 20 9 L20 9 A9 9 0 0 1 11 18 L0 18');
  });

  test('roundedPathData lets a corner use the whole first or last piece, so a half circle can be split in two', () => {
    // a quarter circle of radius 30 ends exactly on the last piece's end, which is only 30 long
    expect(
      roundedPathData(
        [
          [0, 0],
          [0, 100],
          [30, 100],
        ],
        30,
      ),
    ).toBe('M0 0 L0 70 A30 30 0 0 0 30 100 L30 100');
    // inner pieces are still shared between their two corners
    expect(
      roundedPathData(
        [
          [0, 0],
          [20, 0],
          [20, 10],
          [0, 10],
        ],
        9,
      ),
    ).toBe('M0 0 L15 0 A5 5 0 0 1 20 5 L20 5 A5 5 0 0 1 15 10 L0 10');
  });

  test('src_air_coil and src_hyb_coil have four passes, rounded bends and their fins lie inside the coil block', () => {
    const { coil: block, fins, passes } = AIR_UNIT;
    for (const id of ['src_air_coil', 'src_hyb_coil']) {
      const coil = SEGMENTS.find((segment) => segment.id === id);
      expect(coil?.bend, id).toBe(passes.step / 2);
      // the horizontal pieces are the passes: an even number, at least four, on the lines of AIR_UNIT.passes
      const points = coil?.points ?? [];
      const horizontal = points.slice(1).flatMap((end, index) => {
        const start = points[index];
        return start?.[1] === end[1] ? [end[1]] : [];
      });
      expect(horizontal.length % 2, id).toBe(0);
      expect(horizontal.length, id).toBeGreaterThanOrEqual(4);
      expect(horizontal.length, id).toBe(passes.count);
      expect(
        [...horizontal].sort((a, b) => a - b),
        id,
      ).toEqual(Array.from({ length: passes.count }, (_, index) => passes.y0 + index * passes.step));
      // the first and the last point are the ports, on the coil block's right side; the bends stay inside the block
      for (const end of [points[0], points.at(-1)]) expect(end?.[0], id).toBe(block.x + block.width);
      for (const point of points.slice(1, -1)) {
        expect(point[0], id).toBeGreaterThan(block.x);
        expect(point[0], id).toBeLessThan(block.x + block.width);
      }
      for (const point of points) {
        expect(point[1], id).toBeGreaterThan(block.y);
        expect(point[1], id).toBeLessThan(block.y + block.height);
      }
    }
    expect(fins.count).toBeGreaterThanOrEqual(12);
    const lastFin = fins.x + (fins.count - 1) * fins.step;
    expect(fins.x).toBeGreaterThan(block.x);
    expect(lastFin).toBeLessThan(block.x + block.width);
    expect(fins.y0).toBeGreaterThan(block.y);
    expect(fins.y1).toBeLessThan(block.y + block.height);
  });
});

describe('outer-loop source geometry (refine-schematic-drawing D11-D13)', () => {
  const first = (id: string): Point => {
    const point = segmentPoints(id)[0];
    if (point === undefined) throw new Error(id);
    return point;
  };
  const last = (id: string): Point => {
    const point = segmentPoints(id).at(-1);
    if (point === undefined) throw new Error(id);
    return point;
  };
  const role = (id: string): RolePath | undefined => SEGMENTS.find((segment) => segment.id === id)?.temperatureRole;

  test('Source aligned to the cabinet: the housing top and the ground line are on the cabinet top, the hybrid loop is below the unit', () => {
    expect(AIR_UNIT.y).toBe(CABINET.y);
    expect(GROUND_LINE_Y.ground).toBe(CABINET.y);
    // the ground loop's pipes start on the line; in the hybrid it is under the air unit's housing
    expect(first('src_gnd_down')[1]).toBe(GROUND_LINE_Y.ground);
    expect(last('src_gnd_up')[1]).toBe(GROUND_LINE_Y.ground);
    expect(GROUND_LINE_Y.hybrid).toBeGreaterThan(AIR_UNIT.y + AIR_UNIT.height);
    expect(first('src_hyb_down')[1]).toBe(GROUND_LINE_Y.hybrid);
    expect(last('src_hyb_up')[1]).toBe(GROUND_LINE_Y.hybrid);
    // the captions stay where they were relative to their device: above the housing, under the loop
    expect(AIR_UNIT.captionY).toBeLessThan(AIR_UNIT.y);
    for (const kind of ['ground', 'hybrid'] as const) {
      expect(GROUND_CAPTION.y[kind]).toBeGreaterThan(GROUND_LINE_Y[kind] + GROUND_LOOP.depth);
    }
    // everything stays inside the drawing
    expect(GROUND_CAPTION.y.hybrid).toBeLessThan(viewBox.height);
  });

  test('Single loop: one leg down, a half circle, one leg up, both at the ground line, with the roles of the legs', () => {
    const { downX, upX, depth } = GROUND_LOOP;
    const spacing = downX - upX;
    expect(spacing).toBeGreaterThan(0);
    const arc = (id: string): string => {
      const segment = SEGMENTS.find((candidate) => candidate.id === id);
      return roundedPathData(segment?.points ?? [], segment?.bend ?? 0);
    };
    const [r, middle] = [spacing / 2, (downX + upX) / 2];
    for (const [kind, lineY, down, up, downRole] of [
      ['ground', GROUND_LINE_Y.ground, 'src_gnd_down', 'src_gnd_up', 'brine.outlet_temperature'],
      ['hybrid', GROUND_LINE_Y.hybrid, 'src_hyb_down', 'src_hyb_up', 'source.air_unit_outlet_temperature'],
    ] as const) {
      const bottom = lineY + depth;
      // the down leg and the first quarter circle, then the second quarter circle and the up leg, meeting in the
      // middle of the bottom
      expect(segmentPoints(down), kind).toEqual([
        [downX, lineY],
        [downX, bottom],
        [middle, bottom],
      ]);
      expect(segmentPoints(up), kind).toEqual([
        [middle, bottom],
        [upX, bottom],
        [upX, lineY],
      ]);
      // the bend is half the legs' spacing: a half circle in all
      for (const id of [down, up]) expect(SEGMENTS.find((segment) => segment.id === id)?.bend, id).toBe(r);
      expect(arc(down), kind).toBe(
        `M${String(downX)} ${String(lineY)} L${String(downX)} ${String(bottom - r)} A${String(r)} ${String(r)} 0 0 1 ${String(middle)} ${String(bottom)} L${String(middle)} ${String(bottom)}`,
      );
      expect(arc(up), kind).toContain(`A${String(r)} ${String(r)} 0 0 1 ${String(upX)} ${String(bottom - r)}`);
      // the down leg carries the heat pump's brine outlet (the air unit's outlet in the hybrid), the up leg its brine inlet
      expect(role(down), kind).toBe(downRole);
      expect(role(up), kind).toBe('brine.inlet_temperature');
    }
    // the loop is one U: the feed ends on the down leg, the exit starts on the up leg
    expect(last('src_gnd_feed')).toEqual(first('src_gnd_down'));
    expect(last('src_gnd_up')).toEqual(first('src_gnd_exit'));
    expect(last('src_hyb_link')).toEqual(first('src_hyb_down'));
    expect(last('src_hyb_up')).toEqual(first('src_hyb_exit'));
  });

  test('no corner of the source pipes is a boundary between two segments (it would show a square notch)', () => {
    const source = SEGMENTS.filter((segment) => segment.id.startsWith('src_'));
    const direction = (from: Point, to: Point): string =>
      `${String(Math.sign(to[0] - from[0]))},${String(Math.sign(to[1] - from[1]))}`;
    let joints = 0;
    for (const first of source) {
      for (const second of source) {
        const [end, before] = [first.points.at(-1), first.points.at(-2)];
        const [start, after] = [second.points[0], second.points[1]];
        if (first === second || end === undefined || before === undefined || start === undefined || after === undefined)
          continue;
        if (end[0] !== start[0] || end[1] !== start[1]) continue;
        // segments of different sources are never drawn together
        if (
          first.source !== undefined &&
          second.source !== undefined &&
          !first.source.some((kind) => second.source?.includes(kind))
        )
          continue;
        joints += 1;
        expect(direction(before, end), `${first.id} to ${second.id}`).toBe(direction(start, after));
      }
    }
    expect(joints).toBeGreaterThan(10);
  });

  test('Air unit ports: both pipes meet the coil block and leave the housing on its right wall, without a hop', () => {
    const wall = AIR_UNIT_WALL_X;
    const portX = AIR_UNIT.coil.x + AIR_UNIT.coil.width;
    expect(portX).toBeLessThan(wall);
    // air: the feed enters the bottom pass and the exit leaves the top pass
    expect(last('src_air_feed')).toEqual([portX, AIR_PORT_Y.bottom]);
    expect(first('src_air_coil')).toEqual([portX, AIR_PORT_Y.bottom]);
    expect(last('src_air_coil')).toEqual([portX, AIR_PORT_Y.top]);
    expect(first('src_air_exit')).toEqual([portX, AIR_PORT_Y.top]);
    // hybrid: entered at the top pass, the link to the ground loop leaves from the outlet port, at the bottom
    expect(last('src_hyb_feed')).toEqual([portX, AIR_PORT_Y.top]);
    expect(first('src_hyb_coil')).toEqual([portX, AIR_PORT_Y.top]);
    expect(last('src_hyb_coil')).toEqual([portX, AIR_PORT_Y.bottom]);
    expect(first('src_hyb_link')).toEqual([portX, AIR_PORT_Y.bottom]);
    // every pipe at the housing crosses its right wall and stays right of the coil block
    for (const id of ['src_air_feed', 'src_air_exit', 'src_hyb_feed', 'src_hyb_link']) {
      const points = segmentPoints(id);
      const crossesWall = points.slice(1).some((end, index) => {
        const start = points[index];
        return start?.[1] === end[1] && Math.min(start[0], end[0]) < wall && Math.max(start[0], end[0]) > wall;
      });
      expect(crossesWall, id).toBe(true);
      expect(Math.min(...points.map((point) => point[0])), id).toBeGreaterThanOrEqual(portX);
    }
    // no pipe of the source needs a hop
    expect(
      CROSSINGS.filter((crossing) => crossing.over.startsWith('src_') || crossing.under.startsWith('src_')),
    ).toEqual([]);
    // air: the exit rises left of the feed's column (that is why it leaves the top pass)
    expect(last('src_air_exit')[0]).toBeLessThan(first('src_air_feed')[0]);
    expect(role('src_air_exit')).toBe('source.air_unit_outlet_temperature');
    expect(role('src_air_feed')).toBe('brine.outlet_temperature');
  });
});

describe('exchanger sides (refine-schematic-drawing D4)', () => {
  test('exchangers 7, 8, 9 and 10 have a left and a right side whose segments end on the side ports', () => {
    const exchangers = COMPONENTS.filter((component) => component.kind === 'exchanger');
    expect(exchangers.map((component) => component.item).sort((a, b) => a - b)).toEqual([7, 8, 9, 10]);
    for (const component of exchangers) {
      const sides = component.sides ?? [];
      expect(sides.map((entry) => entry.half).sort(), `item ${String(component.item)}`).toEqual(['left', 'right']);
      const span = component.size ?? 34;
      for (const entry of sides) {
        const x = component.x + (entry.half === 'left' ? -12 : 12);
        const top = entry.enters === 'top' ? entry.entering : entry.leaving;
        const bottom = entry.enters === 'top' ? entry.leaving : entry.entering;
        for (const [ids, y] of [
          [top, component.y - span],
          [bottom, component.y + span],
        ] as const) {
          for (const id of ids) {
            const segment = SEGMENTS.find((candidate) => candidate.id === id);
            if (segment === undefined) throw new Error(`no segment ${id}`);
            const ends = [segment.points[0], segment.points[segment.points.length - 1]];
            expect(
              ends.some((end) => end?.[0] === x && end[1] === y),
              `${id} ends at ${String(x)},${String(y)}`,
            ).toBe(true);
          }
        }
      }
    }
  });
});

describe('exchanger sides in every configuration', () => {
  test.each(ALL.map((context) => [label(context), context] as const))(
    '%s: each drawn side has one drawn entering and one drawn leaving segment',
    (_name, context) => {
      const drawnIds = new Set(drawnSegments(context).map((entry) => entry.part.id));
      for (const { part } of drawnComponents(context)) {
        for (const entry of part.sides ?? []) {
          const where = `item ${String(part.item)} ${entry.half}`;
          expect(
            entry.entering.filter((id) => drawnIds.has(id)),
            `${where} entering`,
          ).toHaveLength(1);
          expect(
            entry.leaving.filter((id) => drawnIds.has(id)),
            `${where} leaving`,
          ).toHaveLength(1);
        }
      }
    },
  );
});

describe('arrangementFor (refine-simplified-layout D1, D7)', () => {
  test('the compact layout draws the full arrangement at either level', () => {
    const full = arrangementFor('full', 'full');
    expect(full.id).toBe('full');
    expect(arrangementFor('simplified', 'compact')).toBe(full);
    expect(arrangementFor('full', 'compact')).toBe(full);
  });

  test('the simplified level in the full layout has its own arrangement', () => {
    expect(arrangementFor('simplified', 'full').id).toBe('simplified');
    expect(arrangementFor('simplified', 'full')).not.toBe(arrangementFor('full', 'full'));
  });

  test('it is a pure function: the same inputs give the same value', () => {
    for (const level of DETAIL_LEVELS) {
      for (const layout of ['full', 'compact'] as const) {
        expect(arrangementFor(level, layout)).toBe(arrangementFor(level, layout));
      }
    }
  });

  test('a draw context without an arrangement gets the full layout one of its detail level', () => {
    for (const detail of DETAIL_LEVELS) {
      expect(arrangementOf({ detail })).toBe(arrangementFor(detail, 'full'));
    }
  });

  test('a draw context with an arrangement keeps it', () => {
    const arrangement = arrangementFor('full', 'full');
    expect(arrangementOf({ detail: 'simplified', arrangement })).toBe(arrangement);
  });
});
