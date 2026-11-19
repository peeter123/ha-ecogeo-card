// The value labels' placements (refine-simplified-layout D1, rework-layouts D7): where each of the 19 values sits in an
// arrangement, as a function of the arrangement's zone constants. Labels.ts reads them from the arrangement; the
// texts, captions and visibility rules stay there. Positions are viewBox points with an alignment: `start` puts the label's
// left edge at x, `end` its right edge, `middle` centres it; y is the vertical centre. They sit where the drawing leaves
// room, and on no pipe (found with `npm run search-places`, checked by the overlap browser tests): the probe row's values
// below the discharge line, the compressor's speed inside the refrigerant loop, the expansion valve's pair left of the
// evaporator, the source's Out beside its port or its ground loop's up leg, the DHW values under the external tank or,
// for model C, inside tank 50 above its coil (refine-schematic-drawing D8b).
import type { RolePath } from '../config/roles';
import { VALUE_CAPTIONS } from '../strings';
import type { Visibility, Zones } from './geometry';

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
  /** No background plate: the label sits on a tinted body (the values inside tank 50). */
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
 * the 2 px margin, meets (the search prints it under "Default place meets"). Every entry is a constant place; group 5
 * places the labels of the new bodies from the zones. No label sits on a pipe. The other labels keep their default place,
 * which the search finds free at 680 px, the vertical threshold: at 660 px the external tank's temperature and demand
 * meet in 6 cases and the search moves production Out to x 124 to keep it left of In, so the threshold is 680 px.
 */
export const HORIZONTAL_PLACES: Readonly<Record<string, PlaceOverride>> = {
  production_in: {
    at: () => ({ x: 320, y: 160, align: 'middle' }),
    reason:
      'at its default place beside probe 34 the box, with its 2 px margin, meets pipes prod_44_26 and trunk in all 140 cases that show it (search at 680 px); the nearest free place is inside the cabinet under the DG1 stubs, to the right of the production outlet value so the pair reads in order',
  },
  brine_pump: {
    at: () => ({ x: 724, y: 280, align: 'end' }),
    reason:
      "its default place meets pump 16's symbol in all 168 cases (search at 680 px); this is the nearest place clear of the pump and the brine pipes",
  },
  discharge_temperature: {
    at: () => ({ x: 408, y: 260, align: 'start' }),
    reason:
      'its default place meets the discharge pressure label in 140 cases (search at 680 px); starts at x 408, the nearest free place',
  },
  discharge_pressure: {
    at: () => ({ x: 452, y: 276, align: 'start' }),
    reason:
      'its default place meets the discharge temperature label in 140 cases (search at 680 px); starts at x 452 under it, the nearest free place',
  },
  suction_temperature: {
    at: () => ({ x: 540, y: 272, align: 'end' }),
    reason:
      'its default place meets the suction pressure label in 140 cases (search at 680 px); ends at x 540, the nearest free place',
  },
  suction_pressure: {
    at: () => ({ x: 556, y: 276, align: 'start' }),
    reason:
      'its default place meets the suction temperature label in 140 cases (search at 680 px); starts at x 556 under it, the nearest free place',
  },
  superheat: {
    at: () => ({ x: 536, y: 376, align: 'end' }),
    reason:
      "its default place meets the valve opening's label in all 168 cases (search at 680 px); ends at x 536, left of evaporator 7, the nearest free place",
  },
  expansion_valve: {
    at: () => ({ x: 536, y: 392, align: 'end' }),
    reason:
      "its default place meets the superheat's label in all 168 cases (search at 680 px); ends at x 536, 16 units under the superheat",
  },
  tank_internal_demand: {
    at: () => ({ x: 520, y: 164, align: 'end' }),
    reason:
      'inside tank 50 the default rows, 13 units apart, meet in 4 cases (search at 680 px) now that the temperature carries its caption; ends at x 520 under the temperature, the nearest place inside the tank that keeps both rows apart',
  },
};

/** The distance of an air unit port label from its port's pipe: 12 units at the arrangement's scale. */
const portLabelDy = (z: Zones): number => Math.round(12 * (z.scale ?? 1) * 100) / 100;

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

/**
 * The placements of an arrangement: each label's place computed from its zones. `place` maps a
 * point of the frame's cabinet to the arrangement's own: the labels at the cabinet's
 * components go through it, the ones placed from the zones (source, external tank, tank 50) do not.
 * The 19 values of live-values "Values on the drawing": production out and in, brine out and in, the two pressures, the
 * two pumps, the discharge and suction pairs, the compressor speed, the superheat and the expansion valve opening, the
 * source's Out, the DHW temperature and the DG1 and DHW demand.
 */
export function labelPlacesFor(
  z: Zones,
  place: (x: number, y: number) => readonly [number, number] = (x, y) => [x, y],
): LabelPlaces {
  const { externalTank, internalTank, airUnitWallX } = z;
  /** The external tank's values: centred under the tank, 22 units below its bottom, the demand 15 units under that. */
  const EXT_TANK_X = externalTank.x + externalTank.width / 2;
  const EXT_TANK_Y = externalTank.y + externalTank.height + 22;

  /** Model C's tank values: the row's centre line, 12 units under the tank's top (the strip above coil 51 is ~34 tall). */
  const INTERNAL_ROW_Y = internalTank.y + 12;
  const INTERNAL_CENTRE_X = internalTank.x + internalTank.width / 2;

  /** The air unit's Out label: 6 units right of the housing's wall, 12 units under the top port's pipe. */
  const PORT_LABEL_X = airUnitWallX + 6;
  const PORT_LABEL_DY = portLabelDy(z);
  /** The ground loop's Out label: 20 units under the ground line, clear of its hatching. */
  const GROUND_LABEL_DY = 20;
  /** Every value label of the drawing. */
  const spec = makeSpec;
  const cab: typeof spec = (id, role, x, y, align, extra) => {
    const [px, py] = place(x, y);
    return spec(id, role, px, py, align, extra);
  };
  const specs: readonly LabelSpec[] = [
    // production: probes 33 and 34 (Out, In), pressure 38, pump 15, and the DG1 demand above connections 1/2
    cab('production_out', 'production.outlet_temperature', 237, 228, 'end', {
      item: 33,
      caption: VALUE_CAPTIONS.portOut,
    }),
    cab('production_in', 'production.return_temperature', 291, 247, 'middle', {
      item: 34,
      caption: VALUE_CAPTIONS.portIn,
    }),
    cab('production_pressure', 'production.pressure', 360, 537, 'end', { item: 38 }),
    cab('production_pump', 'production.pump', 396, 380, 'end', { item: 15 }),
    cab('dg1_demand', 'heating.demand', 320, 123, 'start', { item: 1, demand: true }),
    // brine: probes 31 and 32 (Out, In), pressure 37, pump 16
    cab('brine_out', 'brine.outlet_temperature', 633, 247, 'start', { item: 31, caption: VALUE_CAPTIONS.portOut }),
    cab('brine_in', 'brine.inlet_temperature', 697, 247, 'start', { item: 32, caption: VALUE_CAPTIONS.portIn }),
    cab('brine_pressure', 'brine.pressure', 689, 459, 'start', { item: 37 }),
    cab('brine_pump', 'brine.pump', 676, 300, 'end', { item: 16 }),
    // refrigerant: temperatures 30 and 29 and pressures 36 and 35 below the discharge and suction lines, the compressor's
    // speed inside the loop, and the expansion valve's opening and superheat beside valve 12
    cab('discharge_temperature', 'compressor.discharge_temperature', 436, 262, 'start', { item: 30 }),
    cab('discharge_pressure', 'compressor.discharge_pressure', 480, 275, 'middle', { item: 36 }),
    cab('suction_temperature', 'compressor.suction_temperature', 528, 262, 'start', { item: 29 }),
    cab('suction_pressure', 'compressor.suction_pressure', 570, 275, 'middle', { item: 35 }),
    cab('compressor_speed', 'compressor.speed', 503, 307, 'middle', { item: 11 }),
    cab('superheat', 'refrigerant.superheat', 527, 376, 'middle', { item: 12 }),
    cab('expansion_valve', 'refrigerant.expansion_valve', 527, 388, 'middle', { item: 12 }),
    // source: the Out of the air unit (beside its top port), of the ground loop (left of its up leg) or, in the hybrid, of
    // its ground loop only (the air unit shows no value and the link pipe carries no label)
    spec('air_unit_out', 'source.air_unit_outlet_temperature', PORT_LABEL_X, z.airPortY.top + PORT_LABEL_DY, 'start', {
      source: ['air'],
      caption: VALUE_CAPTIONS.portOut,
    }),
    spec('ground_out', 'brine.inlet_temperature', z.groundLoop.upX - 6, z.groundLineY.ground + GROUND_LABEL_DY, 'end', {
      source: ['ground'],
      caption: VALUE_CAPTIONS.portOut,
    }),
    spec(
      'hybrid_ground_out',
      'brine.inlet_temperature',
      z.groundLoop.upX - 6,
      z.groundLineY.hybrid + GROUND_LABEL_DY,
      'end',
      {
        source: ['hybrid'],
        caption: VALUE_CAPTIONS.portOut,
      },
    ),
    // external tank: the DHW temperature and the demand under the tank (the arrangement's `externalTank`)
    spec('tank_external_temperature', 'dhw.temperature', EXT_TANK_X, EXT_TANK_Y, 'middle', {
      dhw: 'external',
      emphasis: true,
      caption: VALUE_CAPTIONS.dhw,
    }),
    spec('tank_external_demand', 'dhw.demand', EXT_TANK_X, EXT_TANK_Y + 15, 'middle', {
      dhw: 'external',
      demand: true,
    }),
    // model C: the DHW temperature and, under it, the demand, inside tank 50 in the strip above coil 51, with no
    // background plate
    spec('tank_internal_temperature', 'dhw.temperature', INTERNAL_CENTRE_X, INTERNAL_ROW_Y, 'middle', {
      dhw: 'internal',
      caption: VALUE_CAPTIONS.dhw,
      bare: true,
    }),
    spec('tank_internal_demand', 'dhw.demand', INTERNAL_CENTRE_X, INTERNAL_ROW_Y + 13, 'middle', {
      dhw: 'internal',
      demand: true,
      bare: true,
    }),
  ];
  return { specs };
}
