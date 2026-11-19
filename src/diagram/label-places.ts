// The value labels' placements (refine-simplified-layout D1): where each label sits in an arrangement, as a function of the
// arrangement's zone constants. Labels.ts reads them from the arrangement; the
// texts, captions and visibility rules stay there. Positions are viewBox points with an alignment: `start` puts the label's
// left edge at x, `end` its right edge, `middle` centres it; y is the vertical centre. They sit where the drawing leaves
// room (checked on the emulator captures): the probe row's values below the discharge line, the compressor's stack inside
// the refrigerant loop, the source's values under the air unit and beside its ports and the ground loop's legs, the tank's
// values under the external tank or, for model C, inside tank 50 above its coil (refine-schematic-drawing D8b).
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

interface SimplifiedPlace {
  /** The place, from the zones and the point map of the cabinet. */
  at: (z: Zones, map: PointMap) => Placement;
  reason: string;
}

/**
 * The labels of the arrangement that are not at the frame's place under the maps (refine-simplified-layout D6),
 * each with its reason: places that the pipe-aware overlap check (dev/overlaps.ts) reported on a label's own pipes, caption or
 * neighbour once the pipes are counted. A place is a function of the arrangement's zones where it hangs on the source, so it
 * follows them.
 */
export const SIMPLIFIED_PLACES: Readonly<Record<string, SimplifiedPlace>> = {
  air_unit_out: {
    at: (z) => ({ x: z.airUnitWallX + 3, y: z.airPortY.top + portLabelDy(z), align: 'start' }),
    reason:
      'starts 3 units off the housing so that the outlet caption and its widest value end before the feed pipe at the threshold width',
  },
  dg1_demand: {
    at: (_z, map) => ({ x: map(320, 118)[0], y: 118, align: 'start' }),
    reason:
      'the demand text 5 units higher, clear of the cabinet top edge that its plate touches at the full place (y 123)',
  },
  fan_speed: {
    at: (z) => ({ x: z.airUnit.x + 9, y: z.airUnit.y + z.airUnit.height + 12, align: 'start' }),
    reason:
      'left-aligned 9 units inside the housing: the outside air value (about 105 units wide at 600 px) centred on the fan reaches the hybrid return pipe at x 6',
  },
  outside_temperature: {
    at: (z) => ({ x: z.airUnit.x + 9, y: z.airUnit.y + z.airUnit.height + 25, align: 'start' }),
    reason: 'under the fan value, on the same left edge',
  },
  ground_in: {
    at: (z) => ({ x: z.groundLoop.downX + 3, y: z.groundLineY.ground + 20, align: 'start' }),
    reason:
      'starts 3 units off the down leg (not 6): the legs sit 4 units further right than before, and the widest value must still end left of the cabinet',
  },
  ground_out: {
    at: (z) => ({ x: z.groundLoop.upX - 3, y: z.groundLineY.ground + 20, align: 'end' }),
    reason:
      'ends 3 units off the up leg (not 6) so that the widest value (-12.3, defrost) stays 2 px inside the drawing edge at 600 px',
  },
  hybrid_ground_out: {
    at: (z) => ({ x: z.groundLoop.upX - 3, y: z.groundLineY.hybrid + 20, align: 'end' }),
    reason:
      'the same as the ground loop: 3 units off the up leg, so that the widest value stays inside the drawing edge',
  },
  compressor_speed: {
    at: (_z, map) => ({ x: map(503, 308)[0], y: 308, align: 'middle' }),
    reason:
      'the stack of three rows is 14 units apart (12 in the frame), since the 8 px text of a 600 px card is taller than 12 units',
  },
  compressor_percentage: {
    at: (_z, map) => ({ x: map(503, 322)[0], y: 322, align: 'middle' }),
    reason: 'the middle row of the compressor stack, 14 units under the speed',
  },
  compressor_power: {
    at: (_z, map) => ({ x: map(503, 336)[0], y: 336, align: 'middle' }),
    reason: 'the bottom row of the compressor stack, 14 units under the percentage, still clear of the pipes below',
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
 */
export function labelPlacesFor(
  z: Zones,
  place: (x: number, y: number) => readonly [number, number] = (x, y) => [x, y],
): LabelPlaces {
  const { externalTank, internalTank, airUnit, airUnitWallX } = z;
  /** The external tank's values: centred under the tank, 22 units below its bottom. */
  const EXT_TANK_X = externalTank.x + externalTank.width / 2;
  const EXT_TANK_Y = externalTank.y + externalTank.height + 22;

  /** Model C's tank values: the row's centre line, 12 units under the tank's top (the strip above coil 51 is ~34 tall). */
  const INTERNAL_ROW_Y = internalTank.y + 12;
  const INTERNAL_CENTRE_X = internalTank.x + internalTank.width / 2;

  /** The air unit's fan and outside labels: the first 12 units under the housing, the second 13 below it. */
  const AIR_LABELS_Y = airUnit.y + airUnit.height + 12;
  /** The air unit's port labels: 6 units right of the housing's wall, 12 units under (top port) or above (bottom port) the port's pipe. */
  const PORT_LABEL_X = airUnitWallX + 6;
  const PORT_LABEL_DY = portLabelDy(z);
  /** The ground loop's labels: 20 units under the ground line, clear of its hatching. */
  const GROUND_LABEL_DY = 20;
  /** Every value label of the drawing. */
  const spec = makeSpec;
  const cab: typeof spec = (id, role, x, y, align, extra) => {
    const [px, py] = place(x, y);
    return spec(id, role, px, py, align, extra);
  };
  const specs: readonly LabelSpec[] = [
    // production: probes 33 and 34, pressure 38, pump 15, and the DG1 setpoint above connections 1/2
    cab('production_out', 'production.outlet_temperature', 237, 228, 'end', { item: 33 }),
    cab('production_in', 'production.return_temperature', 291, 247, 'middle', { item: 34 }),
    cab('production_pressure', 'production.pressure', 360, 537, 'end', { item: 38 }),
    cab('production_pump', 'production.pump', 396, 380, 'end', { item: 15 }),
    cab('dg1_setpoint', 'heating.setpoint', 291, 96, 'middle', { item: 1 }),
    cab('dg1_demand', 'heating.demand', 320, 123, 'start', { item: 1, demand: true }),
    // brine: probes 31 and 32, pressure 37, pump 16
    cab('brine_out', 'brine.outlet_temperature', 633, 247, 'start', { item: 31 }),
    cab('brine_in', 'brine.inlet_temperature', 697, 247, 'start', { item: 32 }),
    cab('brine_pressure', 'brine.pressure', 689, 459, 'start', { item: 37 }),
    cab('brine_pump', 'brine.pump', 676, 300, 'end', { item: 16 }),
    // refrigerant: temperatures 30 and 29 and pressures 36 and 35 below the discharge and suction lines, the compressor's
    // three values inside the loop, the expansion valve's, and the condensation (8) and evaporation (7) temperatures
    cab('discharge_temperature', 'compressor.discharge_temperature', 436, 262, 'start', { item: 30 }),
    cab('discharge_pressure', 'compressor.discharge_pressure', 480, 275, 'middle', { item: 36 }),
    cab('suction_temperature', 'compressor.suction_temperature', 528, 262, 'start', { item: 29 }),
    cab('suction_pressure', 'compressor.suction_pressure', 570, 275, 'middle', { item: 35 }),
    cab('compressor_speed', 'compressor.speed', 503, 307, 'middle', { item: 11 }),
    cab('compressor_percentage', 'compressor.percentage', 503, 319, 'middle', { item: 11 }),
    cab('compressor_power', 'compressor.power', 503, 331, 'middle', { item: 11 }),
    cab('condensation_temperature', 'refrigerant.condensation_temperature', 432, 437, 'middle', { item: 8 }),
    cab('evaporation_temperature', 'refrigerant.evaporation_temperature', 572, 437, 'middle', { item: 7 }),
    // air unit (also in the hybrid): the fan and the outside air under the housing, the brine In and Out beside the two
    // ports on the housing's right (refine-schematic-drawing D14). The label of the top port hangs under its pipe, that of the bottom port
    // sits on its pipe, so the two stay between the pipes and clear of the production labels at the cabinet. Air: In at the
    // bottom port, Out at the top one. Hybrid (entered at the top): only In, at the top port; the air unit's Out and the ground loop's In would be the same value on the link pipe, which carries no label.
    spec('fan_speed', 'source.fan_speed', z.airUnit.fanX, AIR_LABELS_Y, 'middle', {
      source: ['air', 'hybrid'],
      caption: VALUE_CAPTIONS.fan,
    }),
    spec('outside_temperature', 'source.outside_temperature', z.airUnit.fanX, AIR_LABELS_Y + 13, 'middle', {
      source: ['air', 'hybrid'],
      caption: VALUE_CAPTIONS.outside,
    }),
    spec('air_unit_in', 'brine.outlet_temperature', PORT_LABEL_X, z.airPortY.bottom - PORT_LABEL_DY, 'start', {
      source: ['air'],
      caption: VALUE_CAPTIONS.portIn,
    }),
    spec('air_unit_out', 'source.air_unit_outlet_temperature', PORT_LABEL_X, z.airPortY.top + PORT_LABEL_DY, 'start', {
      source: ['air'],
      caption: VALUE_CAPTIONS.portOut,
    }),
    spec('hybrid_air_unit_in', 'brine.outlet_temperature', PORT_LABEL_X, z.airPortY.top + PORT_LABEL_DY, 'start', {
      source: ['hybrid'],
      caption: VALUE_CAPTIONS.portIn,
    }),
    // ground loop (refine-schematic-drawing D14): In (the brine entering it) right of the down leg and Out (the brine leaving it) left of
    // the up leg, both just under the ground line; in the hybrid only Out
    spec(
      'ground_in',
      'brine.outlet_temperature',
      z.groundLoop.downX + 6,
      z.groundLineY.ground + GROUND_LABEL_DY,
      'start',
      {
        source: ['ground'],
        caption: VALUE_CAPTIONS.portIn,
      },
    ),
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
    // external tank: stacked under the tank (the arrangement's `externalTank`)
    spec('tank_external_temperature', 'dhw.temperature', EXT_TANK_X, EXT_TANK_Y, 'middle', {
      dhw: 'external',
      emphasis: true,
    }),
    spec('tank_external_setpoint', 'dhw.setpoint', EXT_TANK_X, EXT_TANK_Y + 15, 'middle', {
      dhw: 'external',
      caption: VALUE_CAPTIONS.setpoint,
    }),
    spec('tank_external_start_delta', 'dhw.start_delta', EXT_TANK_X, EXT_TANK_Y + 29, 'middle', {
      dhw: 'external',
      caption: VALUE_CAPTIONS.startDelta,
    }),
    spec('tank_external_demand', 'dhw.demand', EXT_TANK_X, EXT_TANK_Y + 43, 'middle', {
      dhw: 'external',
      demand: true,
    }),
    // model C: one row inside tank 50, in the strip above coil 51: three labels centred at one sixth, one half and five
    // sixths of the tank's width (even gaps), at the normal label size, with no background plate and with short
    // captions; the demand text goes on a second line under the row. The labels have a minimum font size, so on cards
    // narrower than about 560 px while the demand line shows (about 510 px for the three values alone) they grow relative to the drawing and start to touch.
    spec(
      'tank_internal_temperature',
      'dhw.temperature',
      z.internalTank.x + z.internalTank.width / 6,
      INTERNAL_ROW_Y,
      'middle',
      {
        dhw: 'internal',
        bare: true,
      },
    ),
    spec('tank_internal_setpoint', 'dhw.setpoint', INTERNAL_CENTRE_X, INTERNAL_ROW_Y, 'middle', {
      dhw: 'internal',
      caption: VALUE_CAPTIONS.setpointShort,
      bare: true,
    }),
    spec(
      'tank_internal_start_delta',
      'dhw.start_delta',
      z.internalTank.x + (z.internalTank.width * 5) / 6,
      INTERNAL_ROW_Y,
      'middle',
      {
        dhw: 'internal',
        caption: VALUE_CAPTIONS.startDeltaShort,
        bare: true,
      },
    ),
    spec('tank_internal_demand', 'dhw.demand', INTERNAL_CENTRE_X, INTERNAL_ROW_Y + 13, 'middle', {
      dhw: 'internal',
      demand: true,
      bare: true,
    }),
  ];
  return { specs };
}
