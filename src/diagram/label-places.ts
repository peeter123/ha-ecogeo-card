// The value labels' placements (refine-simplified-layout D1, rework-layouts D7): where each of the 19 values sits in an
// arrangement, as a function of the arrangement's zone constants. Labels.ts reads them from the arrangement; the
// texts, captions and visibility rules stay there. Positions are viewBox points with an alignment: `start` puts the label's
// left edge at x, `end` its right edge, `middle` centres it; y is the vertical centre. They sit where the drawing leaves
// room, and on no pipe (found with `npm run search-places`, checked by the overlap browser tests): the probes' values in the
// lanes beside them, the compressor's speed inside the refrigerant loop, the expansion valve's pair left of the evaporator,
// the values of the band's bodies (the source's Out, the DHW values) inside their bodies, and, for model C, inside tank 50
// above its coil. The bodies' labels are functions of the zones: they follow their body.
import type { RolePath } from '../config/roles';
import { VALUE_CAPTIONS } from '../strings';
import type { BandZones, CabinetZones, Visibility, Zones } from './geometry';

export type Align = 'start' | 'middle' | 'end';

export interface LabelSpec extends Pick<Visibility, 'dhw' | 'source'> {
  /** A unique id, also the `data-label` of the element. */
  id: string;
  role: RolePath;
  /** The manual item the value belongs to; 1 stands for connections 1/2. */
  item?: number;
  x: number;
  y: number;
  align: Align;
  /** A small text in front of the value, where its position alone would not say what it is. */
  caption?: string;
  /** The label shows "Demand" while the (binary) role is on, and nothing otherwise. */
  demand?: true;
  /** Larger text: the tank temperature. */
  emphasis?: true;
  /** No background plate: the label sits on a tinted body (the external tank's values, the values inside tank 50). */
  bare?: true;
}

/** A label's place: a viewBox point and the alignment of the label to it. */
export interface Placement {
  x: number;
  y: number;
  align: Align;
}

/** Maps a point of the frame's cabinet to the arrangement's own. */
type PointMap = (x: number, y: number) => readonly [number, number];

interface PlaceOverride {
  /** The place, from the zones and the point map of the cabinet. */
  at: (z: Zones, map: PointMap) => Placement;
  reason: string;
}

/**
 * The labels of the horizontal arrangement whose default place (the frame's place under the maps, or the zone's) fails
 * and that `npm run search-places -- --layout=horizontal` moved, each with its reason: what the default place's box, with
 * the 2 px margin, meets (the search prints it under "Default place meets"). Every entry is a constant place; the labels
 * of the band's bodies are placed from the zones. No label sits on a pipe.
 */
export const HORIZONTAL_PLACES: Readonly<Record<string, PlaceOverride>> = {
  production_out: {
    at: () => ({ x: 104, y: 328, align: 'end' }),
    reason:
      "at its default place the box, with its 2 px margin, meets probe 33's symbol (240 cases; the default ends exactly at the body's left edge); the nearest free place ends 6 units left of the body, in the lane the x map opens between the cabinet's edge and the probe (search at 560 px, Chromium)",
  },
  production_in: {
    at: () => ({ x: 236, y: 328, align: 'end' }),
    reason:
      "at its default place the box meets probe 34's symbol (240 cases); the nearest free place ends 6 units left of the body, in the lane between riser 270 and probes 34 and 38, right of the outlet value in reading order (search at 560 px, Chromium)",
  },
  production_pressure: {
    at: () => ({ x: 236, y: 356, align: 'end' }),
    reason:
      "at its default place the box meets transducer 38's symbol (240 cases); the nearest free place ends 6 units left of the body at 560 px; end-aligned at x 236, under the return value, so that it stays beside the transducer on wider cards (search at 560 px, Chromium, which keeps the default place's alignment for the pressure labels)",
  },
  brine_in: {
    at: () => ({ x: 776, y: 328, align: 'start' }),
    reason:
      'at its default place the box meets pipe ln4_a (240 cases: the default starts 3 units right of the riser); the nearest free place starts 5 units right of the riser, beside probe 32 (search at 560 px, Chromium)',
  },
  brine_pressure: {
    at: () => ({ x: 740, y: 356, align: 'end' }),
    reason:
      "at its default place the box meets transducer 37's symbol (240 cases); the nearest free place ends 6 units left of the body at 560 px; end-aligned at x 740 so that it stays beside the transducer on wider cards (search at 560 px, Chromium, which keeps the default place's alignment for the pressure labels)",
  },
  dg1_demand: {
    at: () => ({ x: 336, y: 220, align: 'end' }),
    reason:
      "at its default place, right of connection 2's stub, the box crosses the cabinet's top edge in 60 cases (search at 560 px, Chromium); the nearest free place is the same height 5 units up, right-aligned at x 336",
  },
};

const makeSpec = (
  id: string,
  role: RolePath,
  x: number,
  y: number,
  align: Align,
  extra: Partial<Omit<LabelSpec, 'id' | 'role' | 'x' | 'y' | 'align'>> = {},
): LabelSpec => ({ id, role, x, y, align, ...extra });

/** The value labels' places in an arrangement. */
export interface LabelPlaces {
  specs: readonly LabelSpec[];
}

/** The centre of a rectangle. */
const centre = (rect: { x: number; y: number; width: number; height: number }): [number, number] => [
  rect.x + rect.width / 2,
  rect.y + rect.height / 2,
];

/**
 * The rows of the external tank's values: 38 and 56 units under its top edge, centred on it. The rim of the top cap reaches 28
 * units under the top edge, the coil starts 78 under it.
 */
const TANK_TEMPERATURE_DY = 38;
const TANK_DEMAND_DY = 56;

/**
 * The labels of the band's bodies, placed from the zones (rework-layouts D4): the source's Out in the free strip of the air
 * unit (between the fan and the coil block) or of the collector (between the hatching and the serpentine), and the DHW
 * temperature and demand in the upper part of the external tank, bare on its tinted body. A body that is not in the zones'
 * band key has no label; the hybrid shows only its collector's Out.
 */
function bodySpecs(z: Partial<BandZones>): LabelSpec[] {
  const specs: LabelSpec[] = [];
  const { airUnit, collector, externalTank } = z;
  if (airUnit !== undefined && z.key?.source === 'air') {
    const [x, y] = centre(airUnit.strip);
    specs.push(
      makeSpec('air_unit_out', 'source.air_unit_outlet_temperature', x, y, 'middle', {
        source: ['air'],
        caption: VALUE_CAPTIONS.portOut,
      }),
    );
  }
  if (collector !== undefined && z.key?.source !== undefined && z.key.source !== 'air') {
    const [x, y] = centre(collector.strip);
    const hybrid = z.key.source === 'hybrid';
    specs.push(
      makeSpec(hybrid ? 'hybrid_ground_out' : 'ground_out', 'brine.inlet_temperature', x, y, 'middle', {
        source: [hybrid ? 'hybrid' : 'ground'],
        caption: VALUE_CAPTIONS.portOut,
      }),
    );
  }
  if (externalTank !== undefined) {
    const x = externalTank.x + externalTank.width / 2;
    specs.push(
      makeSpec('tank_external_temperature', 'dhw.temperature', x, externalTank.y + TANK_TEMPERATURE_DY, 'middle', {
        dhw: 'external',
        emphasis: true,
        caption: VALUE_CAPTIONS.dhw,
        bare: true,
      }),
      makeSpec('tank_external_demand', 'dhw.demand', x, externalTank.y + TANK_DEMAND_DY, 'middle', {
        dhw: 'external',
        demand: true,
        bare: true,
      }),
    );
  }
  return specs;
}

/**
 * The placements of an arrangement: each label's place computed from its zones. `place` maps a
 * point of the frame's cabinet to the arrangement's own: the labels at the cabinet's
 * components go through it, the ones placed from the zones (the band's bodies, tank 50) do not.
 * The 19 values of live-values "Values on the drawing": production out and in, brine out and in, the two pressures, the
 * two pumps, the discharge and suction pairs, the compressor speed, the superheat and the expansion valve opening, the
 * source's Out, the DHW temperature and the DG1 and DHW demand.
 */
export function labelPlacesFor(
  z: CabinetZones & Partial<BandZones>,
  place: (x: number, y: number) => readonly [number, number] = (x, y) => [x, y],
): LabelPlaces {
  const { internalTank } = z;
  /**
   * Model C's tank values: one row in the strip above coil 51 (about 30 units tall), 16 units under the tank's top, the temperature
   * at the left wall (10 units in) and the demand right of it, ending 40 units short of the right wall (probe 54 sits on it).
   */
  const INTERNAL_ROW_Y = internalTank.y + 16;
  const spec = makeSpec;
  const cab: typeof spec = (id, role, x, y, align, extra) => {
    const [px, py] = place(x, y);
    return spec(id, role, px, py, align, extra);
  };
  const specs: readonly LabelSpec[] = [
    // production: probes 33 and 34 (Out, In) in the lanes beside them, pressure 38 left of its body under 34, pump 15, and the DG1 demand above connections 1/2
    cab('production_out', 'production.outlet_temperature', 245, 228, 'end', {
      item: 33,
      caption: VALUE_CAPTIONS.portOut,
    }),
    cab('production_in', 'production.return_temperature', 287, 228, 'end', {
      item: 34,
      caption: VALUE_CAPTIONS.portIn,
    }),
    cab('production_pressure', 'production.pressure', 287, 256, 'end', { item: 38 }),
    cab('production_pump', 'production.pump', 396, 380, 'end', { item: 15 }),
    cab('dg1_demand', 'heating.demand', 320, 123, 'start', { item: 1, demand: true }),
    // brine: probe 31 (Out) right of its riser, probe 32 (In) right of its riser, pressure 37 left of its body, pump 16
    cab('brine_out', 'brine.outlet_temperature', 632, 228, 'start', { item: 31, caption: VALUE_CAPTIONS.portOut }),
    cab('brine_in', 'brine.inlet_temperature', 691, 228, 'start', { item: 32, caption: VALUE_CAPTIONS.portIn }),
    cab('brine_pressure', 'brine.pressure', 665, 256, 'end', { item: 37 }),
    cab('brine_pump', 'brine.pump', 675, 300, 'end', { item: 16 }),
    // refrigerant: each pair's temperature (30, 29) over its pressure (36, 35) as one two-row block under the pair (16 units between the rows), the compressor's
    // speed inside the loop, and the expansion valve's opening and superheat beside valve 12
    cab('discharge_temperature', 'compressor.discharge_temperature', 450, 260, 'start', { item: 30 }),
    cab('discharge_pressure', 'compressor.discharge_pressure', 450, 276, 'start', { item: 36 }),
    cab('suction_temperature', 'compressor.suction_temperature', 572, 260, 'end', { item: 29 }),
    cab('suction_pressure', 'compressor.suction_pressure', 572, 276, 'end', { item: 35 }),
    cab('compressor_speed', 'compressor.speed', 503, 307, 'middle', { item: 11 }),
    cab('superheat', 'refrigerant.superheat', 527, 374, 'middle', { item: 12 }),
    cab('expansion_valve', 'refrigerant.expansion_valve', 527, 390, 'middle', { item: 12 }),
    // the band's bodies: the source's Out and the external tank's values (bodySpecs)
    ...bodySpecs(z),
    // model C: the DHW temperature and, right of it in the same row, the demand, inside tank 50 in the strip above coil 51,
    // with no background plate
    spec('tank_internal_temperature', 'dhw.temperature', internalTank.x + 10, INTERNAL_ROW_Y, 'start', {
      dhw: 'internal',
      caption: VALUE_CAPTIONS.dhw,
      bare: true,
    }),
    spec('tank_internal_demand', 'dhw.demand', internalTank.x + internalTank.width - 40, INTERNAL_ROW_Y, 'end', {
      dhw: 'internal',
      demand: true,
      bare: true,
    }),
  ];
  return { specs };
}
