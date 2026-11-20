// The value labels' placements (refine-simplified-layout D1, rework-layouts D7): where each of the 19 values sits in an
// arrangement, as a function of the arrangement's zone constants. Labels.ts reads them from the arrangement; the
// texts, captions and visibility rules stay there. Positions are viewBox points with an alignment: `start` puts the label's
// left edge at x, `end` its right edge, `middle` centres it; y is the vertical centre. They sit where the drawing leaves
// room, and on no pipe (found with `npm run search-places`, checked by the overlap browser tests), every cabinet value in a lane
// of the cabinet frame beside its part: the probes' and pumps' values in the column lanes, the pair blocks, the compressor's speed
// and the superheat and opening in the row lanes under their rows. The values of the band's bodies (the DG1 demand inside the emitter, the source's Out, the DHW values) inside their bodies, and, for
// model C, inside tank 50 above its coil. The bodies' labels are functions of the zones: they follow their body.
import type { RolePath } from '../config/roles';
import { VERTICAL_BELOW } from '../lib/layout';
import { VALUE_CAPTIONS } from '../strings';
import type { BandZones, CabinetZones, ShownLayout, Visibility, Zones } from './geometry';

/**
 * The label font factor of each layout (rework-layouts D8): a label's font is `max(10px, k cqw)`, where 1 cqw is 10 viewBox units
 * on the drawing. In the horizontal layout the factor is 1.3: the font is the 10 px floor up to a 770 px card and grows with the
 * drawing above it (13 px at 1000 px), so above the threshold a label is never taller in viewBox units than at the 10 px floor
 * there. The vertical layout's factor is set with its arrangement (until then it draws the horizontal one and uses the same).
 */
export const LABEL_FONT_K: Readonly<Record<ShownLayout, number>> = { horizontal: 1.3, vertical: 1.3 };

/** The label font size of a layout, as the CSS value. */
export const labelFontSize = (layout: ShownLayout): string => `max(10px, ${String(LABEL_FONT_K[layout])}cqw)`;

/** The height of a label's box at the 10 px font floor (line height 1.2), in px. */
export const LABEL_LINE_PX = 12;

/**
 * The row pitch of a two-row block (a probe pair's temperature over its pressure), in viewBox units: the label height at the
 * threshold, where the 10 px floor makes a label tallest in units, plus a unit (WebKit's boxes are a unit taller), rounded up
 * to the place search's 4-unit grid, so the two rows never overlap at any width (rework-layouts D7). The search script
 * reads it too (dev/overlaps.ts `PAIR_ROW_GAP`).
 */
export const PAIR_ROW_GAP = Math.ceil(((LABEL_LINE_PX * 1000) / VERTICAL_BELOW + 1) / 4) * 4;

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

export interface PlaceOverride {
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
export const HORIZONTAL_PLACES: Readonly<Record<string, PlaceOverride>> = {};

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
 * The rows of the external tank's values: 42 and 68 units under its top edge, centred on it, 26 apart so that the rows keep the
 * search's 2 px margin at the threshold, where the 10 px floor makes a label tallest in units, and in WebKit too (its boxes are a
 * unit taller). The rim of the top cap reaches 28 units under the top edge, the coil starts 84 under it.
 */
const TANK_TEMPERATURE_DY = 42;
const TANK_DEMAND_DY = 68;

/**
 * The labels of the band's bodies, placed from the zones (rework-layouts D4): the DG1 demand in the strip at the top of the
 * emitter, the source's Out in the free strip of the air
 * unit (between the fan and the coil block) or of the collector (between the hatching and the serpentine), and the DHW
 * temperature and demand in the upper part of the external tank, bare on its tinted body. A body that is not in the zones'
 * band key has no label; the hybrid shows only its collector's Out.
 */
function bodySpecs(z: Partial<BandZones>): LabelSpec[] {
  const specs: LabelSpec[] = [];
  const { airUnit, collector, externalTank, emitter } = z;
  if (emitter !== undefined) {
    const [x, y] = centre(emitter.strip);
    specs.push(makeSpec('emitter_demand', 'heating.demand', x, y, 'middle', { item: 1, demand: true }));
  }
  if (airUnit !== undefined && z.key?.source === 'air') {
    const [x, y] = centre(airUnit.strip);
    specs.push(
      makeSpec('air_unit_out', 'source.air_unit_outlet_temperature', x, y, 'middle', {
        source: ['air'],
      }),
    );
  }
  if (collector !== undefined && z.key?.source !== undefined && z.key.source !== 'air') {
    const [x, y] = centre(collector.strip);
    const hybrid = z.key.source === 'hybrid';
    specs.push(
      makeSpec(hybrid ? 'hybrid_ground_out' : 'ground_out', 'brine.inlet_temperature', x, y, 'middle', {
        source: [hybrid ? 'hybrid' : 'ground'],
      }),
    );
  }
  if (externalTank !== undefined) {
    const x = externalTank.x + externalTank.width / 2;
    specs.push(
      makeSpec('tank_external_temperature', 'dhw.temperature', x, externalTank.y + TANK_TEMPERATURE_DY, 'middle', {
        dhw: 'external',
        emphasis: true,
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
   * Model C's tank values: one row in the strip above coil 51 (about 30 units tall), 16 units under the tank's top: the temperature
   * ends 70 units from the left wall (so its left edge is about 7 units in) and the demand, 4 units higher, ends 150 units from it,
   * 24 units short of the right wall, where probe 54 sits. Both are end-aligned, the places the search finds free at 560 px.
   */
  const INTERNAL_ROW_Y = internalTank.y + 16;
  const spec = makeSpec;
  const cab: typeof spec = (id, role, x, y, align, extra) => {
    const [px, py] = place(x, y);
    return spec(id, role, px, py, align, extra);
  };
  const specs: readonly LabelSpec[] = [
    // production: probes 33 and 34 (Out, In) in the lanes beside them (left of probe 33, between riser 1 and probe 34), pressure 38 under the
    // return value, pump 15's value right of the pump (above its pipe), and the DG1 demand beside connection 2's stub
    cab('production_out', 'production.outlet_temperature', 38, 112, 'end', {
      item: 33,
      caption: VALUE_CAPTIONS.portOut,
    }),
    cab('production_in', 'production.return_temperature', 115, 112, 'end', {
      item: 34,
      caption: VALUE_CAPTIONS.portIn,
    }),
    cab('production_pressure', 'production.pressure', 115, 142, 'end', { item: 38 }),
    cab('production_pump', 'production.pump', 229, 370, 'start', { item: 15 }),
    ...(z.key === undefined || z.key.emitter === 'none'
      ? [cab('dg1_demand', 'heating.demand', 150, -14, 'start', { item: 1, demand: true })]
      : []),
    // brine: probe 31 (Out) right of riser 3, probe 32 (In) right of riser 4, pressure 37 left of its body, pump 16's value left of the pump
    cab('brine_out', 'brine.outlet_temperature', 544, 112, 'start', { item: 31, caption: VALUE_CAPTIONS.portOut }),
    cab('brine_in', 'brine.inlet_temperature', 609, 112, 'start', { item: 32, caption: VALUE_CAPTIONS.portIn }),
    cab('brine_pressure', 'brine.pressure', 570, 142, 'end', { item: 37 }),
    cab('brine_pump', 'brine.pump', 570, 298, 'end', { item: 16 }),
    // refrigerant: each pair's temperature (30, 29) over its pressure (36, 35) as one two-row block in the row lane under the pair, the
    // compressor's speed in a third row under it, and the expansion valve's superheat and opening beside each other under valve 12
    cab('discharge_temperature', 'compressor.discharge_temperature', 283, 167, 'start', { item: 30 }),
    cab('discharge_pressure', 'compressor.discharge_pressure', 283, 167 + PAIR_ROW_GAP, 'start', { item: 36 }),
    cab('suction_temperature', 'compressor.suction_temperature', 401, 167, 'start', { item: 29 }),
    cab('suction_pressure', 'compressor.suction_pressure', 401, 167 + PAIR_ROW_GAP, 'start', { item: 35 }),
    cab('compressor_speed', 'compressor.speed', 372, 167 + 2 * PAIR_ROW_GAP, 'middle', { item: 11 }),
    cab('superheat', 'refrigerant.superheat', 408, 426, 'end', { item: 12 }),
    cab('expansion_valve', 'refrigerant.expansion_valve', 416, 426, 'start', { item: 12 }),
    // the band's bodies: the source's Out and the external tank's values (bodySpecs)
    ...bodySpecs(z),
    // model C: the DHW temperature and, right of it in the same row, the demand, inside tank 50 in the strip above coil 51,
    // with no background plate
    spec('tank_internal_temperature', 'dhw.temperature', internalTank.x + 70, INTERNAL_ROW_Y, 'end', {
      dhw: 'internal',
      bare: true,
    }),
    spec('tank_internal_demand', 'dhw.demand', internalTank.x + 150, INTERNAL_ROW_Y - 4, 'end', {
      dhw: 'internal',
      demand: true,
      bare: true,
    }),
  ];
  return { specs };
}
