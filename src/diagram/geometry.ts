// The drawing's geometry as data (add-schematic-card D5): the viewBox, the ports on the top edge, every component and every pipe
// segment, laid out after the manual's B4 figure (manual-figure, section 3.1, page 34) and, for model C, figure C
// (items 47-54, the integrated tank). The topology and the item numbers are the figures'; the coordinates are re-laid
// out for legibility. Besides the cabinet's own pipes the segments include the pipes of the outer-loop source (left
// zone) and of the external DHW tank (right zone), and the stubs of connections 47-49. No Lit here: this file is
// data plus small pure helpers that the renderer and the integrity tests share.
//
// An `Arrangement` (arrangementFor) holds all of it for one detail level and layout; the numbers below describe the full
// arrangement. Layout in viewBox units (1000 x 620): source zone x 0-240, cabinet x 240-760, DHW zone x 790-1000, the pipe run
// above the cabinet y 0-110, the cabinet's top edge at y 130. Ports 1-6 sit on the top edge in the manual's order.
// Inside, from the top: the DHW supply (y 172) and return (y 198) lines of valve 26, the probe row, the discharge
// line of compressor 11 (y 250) through HTR exchanger 9 to inversion valve 14, condenser 8 and evaporator 7, the
// valve 27 / pump 15 / valve 28 row (y 416), exchanger 10 and, at the bottom, the vessels and drain valves.
//
// Pipe points run in the direction of the flow in heating (`direction` 1) so that the renderer can animate them.
import type { CircuitId, Circuits } from '../calc/circuits';
import type { Detail, DhwStorage, Model, Source } from '../config/options';
import type { RolePath } from '../config/roles';
import type { FeatureKey, Features } from '../config/variants';
import { COMPACT_PLACES, FULL_PLACES, SIMPLIFIED_PLACES, labelPlacesFor, type LabelPlaces } from './label-places';

/** A rectangle in viewBox units. */
interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The air unit's housing, fan, coil block, fins, slats and serpentine (see `FULL_ZONES`). */
export interface AirUnitShape {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fanX: number;
  readonly fanY: number;
  readonly fanRadius: number;
  readonly coil: Rect;
  readonly fins: {
    readonly x: number;
    readonly step: number;
    readonly count: number;
    readonly y0: number;
    readonly y1: number;
  };
  readonly slats: { readonly y0: number; readonly step: number; readonly count: number };
  readonly dividerY: number;
  readonly captionX: number;
  readonly captionY: number;
  readonly passes: {
    readonly y0: number;
    readonly step: number;
    readonly count: number;
    readonly left: number;
    readonly right: number;
  };
}

/**
 * The primary values of an arrangement's zones: the viewBox, the cabinet's outline, the integrated tank and its coil
 * (inside the cabinet), the external tank, the air unit, the ground loop and the pipe run above the cabinet.
 * `deriveZones` computes everything else that depends on them.
 */
interface ZoneBase {
  readonly viewBox: { readonly width: number; readonly height: number };
  /**
   * The uniform scale of the source and the external tank relative to the full arrangement (1 when left out): it sizes
   * the offsets `deriveZones` adds to them (the external coil, the hybrid's ground line) and the air unit's fan blades.
   */
  readonly scale?: number;
  /** The cabinet's outline and the zones around it. */
  readonly cabinet: Rect;
  /**
   * The integrated tank of model C (item 50), inside the cabinet under the top edge: coil 51 (its ports are where the DHW
   * lines of valve 26 end), probe 54 and drain valve 53 sit on or in it. The figure's tank is tall; this one is squat so
   * that it fits above the probe row.
   */
  readonly internalTank: Rect;
  /** Coil 51's centre (model C), inside tank 50; its port stubs reach back to the tank wall (symbols.ts). */
  readonly coil51: { readonly x: number; readonly y: number };
  /** The external tank right of the cabinet (not a manual item: the "DHW inter-accumulator" of ports 5/6). */
  readonly externalTank: Rect & { readonly dome: number };
  /**
   * The air unit's housing and the fan in it, left of the cabinet (not manual items). The housing's top is the
   * cabinet's top line (refine-schematic-drawing D11); everything else is placed from it. Both brine pipes leave through the housing's
   * right wall, the side facing the cabinet (refine-schematic-drawing D13).
   */
  readonly airUnit: AirUnitShape;
  /**
   * The ground loop (refine-schematic-drawing D12): a single vertical U. One leg goes down from the ground line (at `downX`), a half circle
   * forms the bottom and one leg comes back up (at `upX`), `depth` below the line at its lowest. The legs' spacing is the
   * bottom's diameter.
   */
  readonly groundLoop: { readonly downX: number; readonly upX: number; readonly depth: number };
  /** The ground line's horizontal extent in the source zone (the hatching ticks sit 6 units inside each end). */
  readonly groundLineX: { readonly start: number; readonly end: number };
  /** The pipe run above the cabinet: the y of port 3's and port 4's pipes, the x where they turn down or up to the source, and the column of the hybrid's return pipe. */
  readonly run: {
    readonly outY: number;
    readonly inY: number;
    readonly feedX: number;
    readonly returnX: number;
    readonly hybridReturnX: number;
  };
}

/** What `deriveZones` computes from a `ZoneBase`. */
export interface Zones extends ZoneBase {
  /** The housing's right wall, where both brine pipes leave the air unit. */
  readonly airUnitWallX: number;
  /** The y of the air unit's top and bottom brine ports (the first and last pass), on the coil block's right side. */
  readonly airPortY: { readonly top: number; readonly bottom: number };
  /** The x where the brine pipes meet the coil block's right edge (the ports of the first and last pass). */
  readonly coilPortX: number;
  /** The serpentine's U-bends: half the distance between two passes, so each bend is a half circle. */
  readonly airCoilBend: number;
  /** The ground loop's bottom: half the legs' spacing, so the bottom is a half circle. */
  readonly loopBend: number;
  /** The ground line (the surface) of the ground loop: on the cabinet's top line, or in the hybrid under the air unit. */
  readonly groundLineY: { readonly ground: number; readonly hybrid: number };
  /** Where the ground loop's caption sits (under the bottom of the loop). */
  readonly groundCaption: { readonly x: number; readonly y: { readonly ground: number; readonly hybrid: number } };
  /**
   * The external coil: its centre line is the tank's, and it sits in the lower part of the tank (the tank's top plus 62
   * and 146). `rx` is its half width, `port6X` the x of port 6's vertical inside the tank (14 units inside the left wall).
   */
  readonly externalCoil: {
    readonly cx: number;
    readonly top: number;
    readonly bottom: number;
    readonly rx: number;
    readonly port6X: number;
  };
  /**
   * Where port 3's line (`src_out`) hands over to the source, and where the exits hand over to port 4's line (`src_in`):
   * a few units along the straight run past the turn, so that no corner is a boundary between two segments (a butt-capped
   * boundary would show a square notch where the pipe turns).
   */
  readonly joinX: { readonly out: number; readonly in: number };
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** The values that depend on the primary ones: ports, line heights, the external coil, the joins of the pipe run. */
function deriveZones(base: ZoneBase): Zones {
  const { airUnit, groundLoop, externalTank, run, cabinet } = base;
  const k = base.scale ?? 1;
  const groundLineY = { ground: cabinet.y, hybrid: airUnit.y + airUnit.height + Math.round(70 * k) };
  return {
    ...base,
    airUnitWallX: airUnit.x + airUnit.width,
    airPortY: {
      top: airUnit.passes.y0,
      bottom: airUnit.passes.y0 + (airUnit.passes.count - 1) * airUnit.passes.step,
    },
    coilPortX: airUnit.coil.x + airUnit.coil.width,
    airCoilBend: airUnit.passes.step / 2,
    loopBend: (groundLoop.downX - groundLoop.upX) / 2,
    groundLineY,
    groundCaption: {
      x: (groundLoop.downX + groundLoop.upX) / 2,
      y: { ground: groundLineY.ground + groundLoop.depth + 28, hybrid: groundLineY.hybrid + groundLoop.depth + 28 },
    },
    externalCoil: {
      cx: externalTank.x + externalTank.width / 2,
      top: externalTank.y + Math.round(62 * k),
      bottom: externalTank.y + Math.round(146 * k),
      rx: Math.round(50 * k),
      port6X: externalTank.x + Math.round(14 * k),
    },
    joinX: { out: run.feedX + 8, in: run.returnX + 8 },
  };
}

/** Coil 51's ports in its local frame: supply first, return second. The symbol's port stubs end on their y values; the symbol keeps this size in every arrangement. */
export const COIL_LOCAL_PORTS: readonly [readonly [number, number], readonly [number, number]] = [
  [-75, -13],
  [-75, 13],
];

/** The outline of the external tank's body (straight walls, elliptical domed caps), as path data. */
export function externalTankBody({ externalTank }: Pick<ZoneBase, 'externalTank'>): string {
  const { x, y, width, height, dome } = externalTank;
  const rx = width / 2;
  return `M${String(x)} ${String(y + dome)} A${String(rx)} ${String(dome)} 0 0 1 ${String(x + width)} ${String(y + dome)} V${String(y + height - dome)} A${String(rx)} ${String(dome)} 0 0 1 ${String(x)} ${String(y + height - dome)} Z`;
}

const FULL_CABINET = { x: 240, y: 130, width: 520, height: 475 } as const;

/** The full arrangement's zones: the coordinates of the drawing since add-schematic-card. */
const FULL_ZONES: Zones = deriveZones({
  viewBox: { width: 1000, height: 620 },
  cabinet: FULL_CABINET,
  internalTank: { x: 408, y: 138, width: 182, height: 66 },
  coil51: { x: 495, y: 185 },
  externalTank: { x: 806, y: FULL_CABINET.y, width: 168, height: 180, dome: 14 },
  airUnit: {
    x: 26,
    y: FULL_CABINET.y,
    width: 124,
    height: 210,
    fanX: 88,
    fanY: FULL_CABINET.y + 162,
    fanRadius: 34,
    // the coil block's frame (the brine serpentine runs inside it, over the fins)
    coil: { x: 36, y: FULL_CABINET.y + 16, width: 104, height: 74 },
    // the coil's fins: the first x, the step, how many, and where they start and end
    fins: { x: 52, step: 6, count: 13, y0: FULL_CABINET.y + 20, y1: FULL_CABINET.y + 86 },
    // the slats of the housing's front, in the gutters left and right of the fan: the first y, the step and how many
    slats: { y0: FULL_CABINET.y + 134, step: 9, count: 8 },
    // where the fan section starts (a divider under the coil block) and where the caption sits
    dividerY: FULL_CABINET.y + 114,
    captionX: 88,
    captionY: FULL_CABINET.y - 8,
    // the serpentine: four passes (an even number, so that it enters and leaves on the right), 15 apart, bending at x `left` and `right`
    passes: { y0: FULL_CABINET.y + 30, step: 15, count: 4, left: 44, right: 132 },
  },
  groundLoop: { downX: 166, upX: 106, depth: 140 },
  groundLineX: { start: 8, end: 220 },
  run: { outY: 85, inY: 50, feedX: 226, returnX: 206, hybridReturnX: 12 },
});
export type Point = readonly [x: number, y: number];
export type Rotation = 0 | 90 | 180 | 270;

export type ComponentKind =
  | 'port'
  | 'pump'
  | 'valve3'
  | 'inversion_valve'
  | 'probe_t'
  | 'transducer_p'
  | 'pressure_switch'
  | 'thermostat'
  | 'exchanger'
  | 'compressor'
  | 'vessel'
  | 'safety_valve'
  | 'valve'
  | 'drain_valve'
  | 'resistor'
  | 'filter_dryer'
  | 'expansion_valve'
  | 'service_outlet'
  | 'tank'
  | 'coil';

/**
 * When a part is drawn. `feature`: unless that feature is `false`, muted when `unused`. `through` (segments only): a
 * pipe that passes through the part: drawn unless the feature is `false`, never muted by it. `bypass` (segments
 * only): the pipe that replaces the part, drawn only when the feature is `false`. `dhw`: only for that DHW storage
 * (`any` means external or internal, or the model's tank while it is `unused`; with `dhw: unused` the parts that
 * are specific to the model's tank, and those with `unusedMuted`, are drawn muted). `source`: only for those
 * outer-loop sources. HTR also needs DHW storage: with `dhw: none` it counts as `false`; with `unused` it follows
 * its feature. `detail: 'full'` (refine-schematic-drawing D1): a service or safety part, or a stub pipe that only
 * leads to one, drawn only at the `full` level of detail.
 */
export interface Visibility {
  feature?: FeatureKey;
  through?: FeatureKey;
  bypass?: FeatureKey;
  dhw?: 'any' | 'external' | 'internal' | 'none';
  /** Drawn muted while `dhw` is `unused`, though it also serves a tank in use (valve 26). */
  unusedMuted?: true;
  source?: readonly Source[];
  detail?: 'full';
}

/** Where an item number is written, relative to the component: dx, dy and the text anchor. */
export type Tag = readonly [dx: number, dy: number, anchor?: 'start' | 'middle' | 'end'];

/**
 * One side of a plate exchanger (refine-schematic-drawing D4): the half of the symbol it fills, the segments that enter and leave it
 * in normal flow (candidates: the first one that is drawn counts, as a bypass replaces a through pipe) and the end
 * the entering one is attached to. A `reversible` side runs the other way in active cooling.
 */
export interface ExchangerSide {
  half: 'left' | 'right';
  entering: readonly string[];
  leaving: readonly string[];
  enters: 'top' | 'bottom';
  reversible?: true;
}

export interface Component extends Pick<Visibility, 'feature' | 'dhw' | 'detail' | 'unusedMuted'> {
  /** The manual's item number, 1-54. */
  item: number;
  kind: ComponentKind;
  x: number;
  y: number;
  /** Where a probe's stem points (0 down, 90 left, 180 up, 270 right), or the turn of the symbol. */
  rotation: Rotation;
  /** An exchanger's half span between its top and bottom ports. */
  size?: number;
  /** An exchanger's two sides (manual items 7, 8, 9, 10), filled from the pipes that enter and leave them. */
  sides?: readonly ExchangerSide[];
  tag: Tag;
}

/**
 * A helical coil seen from the side (refine-schematic-drawing D5), drawn between two end points that sit on the pipes: it starts at
 * (cx + rx, top) and winds down `turns` turns (a half-turn counts as 0.5) to (cx - rx, bottom) when the number of
 * half-turns is odd. The pieces of its path are made by `helixHalves`.
 */
export interface HelixShape {
  kind: 'helix';
  cx: number;
  top: number;
  bottom: number;
  rx: number;
  turns: number;
}

export interface Segment extends Visibility {
  id: string;
  /** The circuits the pipe belongs to; it is active when any of them is. */
  circuit: readonly CircuitId[];
  points: readonly Point[];
  /** The role of the probe that colours the pipe; in active cooling `roleFor` in pipes.ts swaps the roles of 7/8. */
  temperatureRole: RolePath;
  /** The pump or compressor that sets the flow speed; none: a fixed speed when active (HTR) or no animation (stub). */
  speedRole?: RolePath;
  /** 1: the flow follows the points; -1: against them. */
  direction: 1 | -1;
  /** The pipe flows the other way in active cooling (the refrigerant legs between valve 14 and the expansion valve). */
  reversible?: boolean;
  /** A coil drawn as a helix; `points` then keep only its two end points. */
  shape?: HelixShape;
  /** The radius of the rounded corners of the pipe (the air coil's U-bends and the ground loop's bottom). */
  bend?: number;
  /** The base stroke ends in a round cap: it closes the seam where the ground loop's half circle is split in two segments. */
  roundEnd?: true;
  /** A dead-end tap (vessel, drain, safety valve): coloured, never animated. */
  stub?: boolean;
  /** The pipe carries water only in this position of valves 27/28 (the legs behind a closed arm). */
  onlyWhen?: { valves2728: Circuits['valves2728'] };
}

/** A place where two segments cross inside the cabinet, drawn as a hop: a small gap in `under`. */
export interface Crossing {
  over: string;
  under: string;
  at: Point;
}

const c = (
  item: number,
  kind: ComponentKind,
  x: number,
  y: number,
  rotation: Rotation,
  tag: Tag,
  extra: Partial<Pick<Component, 'feature' | 'dhw' | 'detail' | 'size' | 'sides' | 'unusedMuted'>> = {},
): Component => ({ item, kind, x, y, rotation, tag, ...extra });

/** Components. Items 1-6 are the ports on the top edge. */
const componentsFor = (z: Zones): readonly Component[] => [
  // ports, left to right in the manual's order
  c(1, 'port', 270, 130, 0, [-7, -8, 'end']),
  c(2, 'port', 312, 130, 0, [-7, -8, 'end']),
  c(3, 'port', 630, 130, 0, [-7, -8, 'end']),
  c(4, 'port', 690, 130, 0, [-7, -8, 'end']),
  c(5, 'port', 722, 130, 0, [-7, -8, 'end'], { dhw: 'external' }),
  c(6, 'port', 748, 130, 0, [-7, -8, 'end'], { dhw: 'external' }),
  // model C: tap water inlet, DHW outlet and recirculation of the integrated tank, on the top edge
  c(47, 'port', 440, 130, 0, [-7, -8, 'end'], { dhw: 'internal' }),
  c(48, 'port', 490, 130, 0, [-7, -8, 'end'], { dhw: 'internal' }),
  c(49, 'port', 540, 130, 0, [-7, -8, 'end'], { dhw: 'internal' }),
  // refrigerant circuit
  c(7, 'exchanger', 572, 382, 0, [-26, 6, 'end'], {
    size: 34,
    sides: [
      // refrigerant (left): expansion valve in at the bottom, suction line out at the top
      {
        half: 'left',
        entering: ['ref_12_7'],
        leaving: ['ref_7_14', 'ref_direct_suction'],
        enters: 'bottom',
        reversible: true,
      },
      // brine (right): from pump 16 in at the top, towards valve 28 out at the bottom
      { half: 'right', entering: ['br_feed7'], leaving: ['brine_7_28', 'brine_bypass28'], enters: 'top' },
    ],
  }),
  c(8, 'exchanger', 432, 382, 0, [-26, 6, 'end'], {
    size: 34,
    sides: [
      // production water (left): from pump 15 in at the bottom, towards resistor 44 out at the top
      { half: 'left', entering: ['prod_15_8'], leaving: ['prod_8_44'], enters: 'bottom' },
      // refrigerant (right): discharge in at the top, towards the expansion valve out at the bottom
      {
        half: 'right',
        entering: ['ref_14_8', 'ref_direct_8'],
        leaving: ['ref_8_13'],
        enters: 'top',
        reversible: true,
      },
    ],
  }),
  c(9, 'exchanger', 373, 273, 0, [26, -2, 'start'], {
    size: 23,
    feature: 'htr',
    sides: [
      // HTR water (left): from valve 22 in at the bottom, up the riser into the DHW supply out at the top
      { half: 'left', entering: ['htr_to_9'], leaving: ['htr_riser'], enters: 'bottom' },
      // refrigerant (right): the discharge line passes through, at the discharge temperature at both ends
      { half: 'right', entering: ['ref_discharge'], leaving: ['ref_9_14'], enters: 'top' },
    ],
  }),
  c(11, 'compressor', 510, 250, 0, [0, -26, 'middle']),
  c(12, 'expansion_valve', 527, 416, 0, [0, -14, 'middle']),
  c(13, 'filter_dryer', 487, 416, 0, [0, -14, 'middle']),
  c(14, 'inversion_valve', 430, 296, 0, [-16, 22, 'end'], { feature: 'active_cooling' }),
  c(29, 'probe_t', 542, 234, 0, [0, -14, 'middle']),
  c(30, 'probe_t', 430, 234, 0, [0, -14, 'middle']),
  c(35, 'transducer_p', 564, 234, 0, [0, -14, 'middle']),
  c(36, 'transducer_p', 474, 234, 0, [0, -14, 'middle']),
  c(39, 'pressure_switch', 586, 234, 0, [0, -14, 'middle'], { detail: 'full' }),
  c(40, 'pressure_switch', 452, 234, 0, [0, -14, 'middle'], { detail: 'full' }),
  c(41, 'service_outlet', 464, 406, 0, [0, 28, 'middle'], { detail: 'full' }),
  c(41, 'service_outlet', 620, 270, 90, [0, 14, 'middle'], { detail: 'full' }),
  // hydraulic circuits
  c(10, 'exchanger', 520, 470, 0, [28, 4, 'start'], {
    size: 22,
    feature: 'passive_cooling',
    sides: [
      // production water (left): in at the bottom, out at the top
      { half: 'left', entering: ['prod_10_in'], leaving: ['prod_10_out'], enters: 'bottom' },
      // brine (right): in at the top, out at the bottom
      { half: 'right', entering: ['br_10_in'], leaving: ['br_10_28'], enters: 'top' },
    ],
  }),
  c(15, 'pump', 385, 416, 0, [0, -19, 'middle']),
  c(16, 'pump', 690, 300, 90, [19, 4, 'start']),
  c(17, 'pump', 340, 226, 90, [-14, 4, 'end'], { feature: 'htr', dhw: 'any' }),
  c(18, 'vessel', 725, 520, 0, [-16, 4, 'end'], { detail: 'full' }),
  c(19, 'vessel', 368, 556, 0, [-16, 4, 'end'], { detail: 'full' }),
  c(20, 'safety_valve', 741, 440, 90, [0, -14, 'middle'], { detail: 'full' }),
  c(21, 'safety_valve', 384, 520, 90, [0, -14, 'middle'], { detail: 'full' }),
  c(22, 'valve', 340, 256, 0, [-10, 4, 'end'], { feature: 'htr', dhw: 'any' }),
  c(23, 'drain_valve', 630, 572, 0, [14, 4, 'start'], { detail: 'full' }),
  c(24, 'drain_valve', 404, 572, 0, [14, 4, 'start'], { detail: 'full' }),
  c(25, 'drain_valve', 340, 318, 0, [-10, 4, 'end'], { feature: 'htr', dhw: 'any' }),
  c(26, 'valve3', 270, 172, 270, [-14, 22, 'end'], { dhw: 'any', unusedMuted: true }),
  c(27, 'valve3', 350, 416, 0, [0, -24, 'middle'], { feature: 'passive_cooling' }),
  c(28, 'valve3', 610, 416, 0, [0, -24, 'middle'], { feature: 'passive_cooling' }),
  c(31, 'probe_t', 614, 228, 270, [0, -14, 'middle']),
  c(32, 'probe_t', 674, 228, 270, [0, -14, 'middle']),
  c(33, 'probe_t', 254, 228, 270, [0, -14, 'middle']),
  c(34, 'probe_t', 296, 228, 270, [0, -14, 'middle']),
  c(37, 'transducer_p', 709, 440, 270, [0, -14, 'middle']),
  c(38, 'transducer_p', 352, 520, 270, [0, -14, 'middle']),
  c(44, 'resistor', 270, 320, 90, [12, 6, 'start'], { feature: 'backup_heater' }),
  c(45, 'thermostat', 286, 282, 90, [0, -12, 'middle'], { feature: 'backup_heater' }),
  // model C's integrated tank (50) with its coil (51, ports where the DHW lines of valve 26 end), manual trap (52) on
  // the supply line, drain valve (53) and DHW probe (54), the last two on the tank wall
  c(
    50,
    'tank',
    z.internalTank.x + z.internalTank.width / 2,
    z.internalTank.y + z.internalTank.height / 2,
    0,
    [-96, -26, 'end'],
    {
      dhw: 'internal',
    },
  ),
  c(51, 'coil', z.coil51.x, z.coil51.y, 0, [-74, 3, 'middle'], { dhw: 'internal' }),
  c(52, 'service_outlet', 395, 162, 0, [-8, 4, 'end'], { dhw: 'internal', detail: 'full' }),
  c(53, 'drain_valve', 599, 196, 270, [0, -12, 'middle'], { dhw: 'internal', detail: 'full' }),
  c(54, 'probe_t', 574, 171, 270, [26, -11, 'start'], { dhw: 'internal' }),
];

/** Points from text: "x,y x,y ...". */
const parsePoints = (path: string): Point[] =>
  path.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return [x ?? 0, y ?? 0];
  });

/**
 * The air coil's points (refine-schematic-drawing D13): a serpentine of the passes of the arrangement's `airUnit.passes`. It starts at the right of the
 * top pass and, the number of passes being even, ends at the right of the bottom pass. `reverse` gives the other
 * direction: the air source is entered at the bottom, so that its exit on the top pass rises left of the feed.
 */
function coilPath(z: Zones, reverse: boolean): string {
  const { y0, step, count, left, right } = z.airUnit.passes;
  const points: Point[] = [[z.coilPortX, y0]];
  for (let index = 0; index < count; index += 1) {
    const y = y0 + index * step;
    if (index % 2 === 0) {
      if (index > 0) points.push([right, y]);
      points.push([left, y]);
    } else {
      points.push([left, y], index === count - 1 ? [z.coilPortX, y] : [right, y]);
    }
  }
  return (reverse ? points.reverse() : points).map(([x, y]) => `${String(x)},${String(y)}`).join(' ');
}

/**
 * One half of the ground loop's U from the ground line at `lineY` (refine-schematic-drawing D12): `down` is the leg down and the bottom's
 * first quarter circle, `up` the second quarter circle and the leg up. They meet in the middle of the bottom.
 */
function loopHalf(z: Zones, lineY: number, half: 'down' | 'up'): string {
  const { downX, upX, depth } = z.groundLoop;
  const [middleX, bottom] = [(downX + upX) / 2, lineY + depth];
  return half === 'down'
    ? `${String(downX)},${String(lineY)} ${String(downX)},${String(bottom)} ${String(middleX)},${String(bottom)}`
    : `${String(middleX)},${String(bottom)} ${String(upX)},${String(bottom)} ${String(upX)},${String(lineY)}`;
}

/** Points as text: "x,y x,y ...". */
const line = (...points: Point[]): string => points.map(([x, y]) => `${String(x)},${String(y)}`).join(' ');

const seg = (
  id: string,
  circuit: readonly CircuitId[],
  path: string,
  temperatureRole: RolePath,
  extra: Partial<Omit<Segment, 'id' | 'circuit' | 'points' | 'temperatureRole'>> = {},
): Segment => ({ id, circuit, points: parsePoints(path), temperatureRole, direction: 1, ...extra });

const DG1 = ['production_dg1'] as const;
const TRUNK = ['production_dg1', 'production_dhw'] as const;
const OUT = 'production.outlet_temperature';
const RET = 'production.return_temperature';
const PP = 'production.pump';
const BIN = 'brine.inlet_temperature';
const BOUT = 'brine.outlet_temperature';
const BP = 'brine.pump';
const DISCH = 'compressor.discharge_temperature';
const SUCT = 'compressor.suction_temperature';
const COND = 'refrigerant.condensation_temperature';
const EVAP = 'refrigerant.evaporation_temperature';
const CP = 'compressor.percentage';
const DHWT = 'dhw.temperature';
const AIRO = 'source.air_unit_outlet_temperature';

/**
 * The segments that carry HTR water when HTR is active and the DHW circuit is not (add-schematic-card D7): the DHW lines
 * between valve 26 / port 2 and the tank, outside the arm of valve 26 (which is `dhw_sup_a` and `dhw_ret_a`, excluded here), and the external
 * tank's pipes. pipes.ts colours them with the DHW temperature and animates them at the fixed HTR speed.
 */
export const HTR_WATER_SEGMENT_IDS: readonly string[] = [
  'dhw_sup_b',
  'dhw_sup_c',
  'dhw_ret_b',
  'dhw_ret_c',
  'dhw_ext_in',
  'dhw_ext_coil',
  'dhw_ext_out',
];

/** Pipe segments. The production trunk (return from ports 2/6 through 27, 15, 8, 44, 33 and 26) serves DG1 and DHW. */
const segmentsFor = (z: Zones): readonly Segment[] => [
  // production: ports 1 and 2 (the DG1 stubs end below the pipe run, y > 110)
  seg('p1_stub', DG1, '270,130 270,118', OUT, { stub: true }),
  seg('p2_stub', DG1, '312,118 312,130', RET, { stub: true }),
  seg('p1_up', DG1, '270,160 270,130', OUT, { dhw: 'any', speedRole: PP }),
  seg('p1_direct', DG1, '270,184 270,130', OUT, { dhw: 'none', speedRole: PP }),
  seg('p2_in', DG1, '312,130 312,198', RET, { speedRole: PP }),
  seg('prod_44_26', TRUNK, '270,292 270,184', OUT, { speedRole: PP }),
  seg('prod_bypass44', TRUNK, '270,348 270,292', OUT, { bypass: 'backup_heater', speedRole: PP }),
  seg('prod_8_44', TRUNK, '420,348 270,348', OUT, { speedRole: PP }),
  seg('prod_15_8', TRUNK, '397,416 420,416', RET, { speedRole: PP }),
  seg('trunk', TRUNK, '312,198 312,416', RET, { speedRole: PP }),
  seg('prod_27_in', TRUNK, '312,416 338,416', RET, {
    through: 'passive_cooling',
    speedRole: PP,
    onlyWhen: { valves2728: 'closed' },
  }),
  seg('prod_27_15', TRUNK, '362,416 373,416', RET, { through: 'passive_cooling', speedRole: PP }),
  seg('prod_bypass27', TRUNK, '312,416 373,416', RET, { bypass: 'passive_cooling', speedRole: PP }),
  // production through exchanger 10 (passive cooling and defrost)
  seg('prod_10_in', ['exchanger_10'], '312,416 312,492 508,492', RET, {
    feature: 'passive_cooling',
    speedRole: PP,
  }),
  seg('prod_10_out', ['exchanger_10'], '508,448 350,448 350,428', OUT, {
    feature: 'passive_cooling',
    speedRole: PP,
  }),
  // production taps as in the figure: vessel 19, transducer 38 and safety valve 21 on pump 15's suction, drain 24 after it
  seg('prod_tap_a', TRUNK, '368,416 368,520', RET, { stub: true }),
  seg('prod_tap_b', TRUNK, '368,520 368,544', RET, { stub: true, detail: 'full' }),
  seg('prod_drain', TRUNK, '404,416 404,563', RET, { stub: true, detail: 'full' }),
  // DHW lines of valve 26: supply to port 5, return from port 6 (or to and from the integrated tank of model C)
  seg('dhw_sup_a', ['production_dhw'], '282,172 361,172', OUT, { dhw: 'any', speedRole: PP }),
  seg('dhw_sup_b', ['dhw_coil'], '361,172 420,172', OUT, { dhw: 'any', speedRole: PP }),
  seg('dhw_sup_c', ['dhw_coil'], '420,172 722,172 722,130', OUT, { dhw: 'external', speedRole: PP }),
  seg('dhw_ret_c', ['dhw_coil'], '748,130 748,198 420,198', RET, { dhw: 'external', speedRole: PP }),
  seg('dhw_ret_b', ['dhw_coil'], '420,198 340,198', RET, { dhw: 'any', speedRole: PP }),
  seg('dhw_ret_a', ['production_dhw'], '340,198 312,198', RET, { dhw: 'any', speedRole: PP }),
  // HTR water: pump 17 takes from the DHW return, through valve 22 and exchanger 9, back into the DHW supply
  seg('htr_in', ['htr'], '340,198 340,214', DHWT, { feature: 'htr', dhw: 'any' }),
  seg('htr_pump', ['htr'], '340,238 340,247', DHWT, { feature: 'htr', dhw: 'any' }),
  seg('htr_to_9', ['htr'], '340,265 340,296 361,296', DHWT, { feature: 'htr', dhw: 'any' }),
  seg('htr_drain', ['htr'], '340,296 340,309', DHWT, { feature: 'htr', dhw: 'any', stub: true }),
  seg('htr_riser', ['htr'], '361,250 361,172', DHWT, { feature: 'htr', dhw: 'any' }),
  // DHW storage. External (ports 5/6, a tank with a coil right of the cabinet, the pipes rise into the run and go
  // right: 5 higher than 6, so that they do not cross).
  seg(
    'dhw_ext_in',
    ['dhw_coil'],
    `722,130 722,${String(z.run.inY)} ${String(z.externalCoil.cx + z.externalCoil.rx)},${String(z.run.inY)} ${String(z.externalCoil.cx + z.externalCoil.rx)},${String(z.externalCoil.top)}`,
    OUT,
    { dhw: 'external', speedRole: PP },
  ),
  seg(
    'dhw_ext_coil',
    ['dhw_coil'],
    `${String(z.externalCoil.cx + z.externalCoil.rx)},${String(z.externalCoil.top)} ${String(z.externalCoil.cx - z.externalCoil.rx)},${String(z.externalCoil.bottom)}`,
    OUT,
    {
      dhw: 'external',
      speedRole: PP,
      shape: {
        kind: 'helix',
        cx: z.externalCoil.cx,
        top: z.externalCoil.top,
        bottom: z.externalCoil.bottom,
        rx: z.externalCoil.rx,
        turns: 4.5,
      },
    },
  ),
  seg(
    'dhw_ext_out',
    ['dhw_coil'],
    `${String(z.externalCoil.cx - z.externalCoil.rx)},${String(z.externalCoil.bottom)} ${String(z.externalCoil.port6X)},${String(z.externalCoil.bottom)} ${String(z.externalCoil.port6X)},${String(z.run.outY)} 748,${String(z.run.outY)} 748,130`,
    RET,
    {
      dhw: 'external',
      speedRole: PP,
    },
  ),
  // Internal (model C, items 47-49 on the top edge): short stubs into the tank
  seg('tap_47', ['dhw_coil'], '440,118 440,138', DHWT, { dhw: 'internal', stub: true }),
  seg('tap_48', ['dhw_coil'], '490,138 490,118', DHWT, { dhw: 'internal', stub: true }),
  seg('tap_49', ['dhw_coil'], '540,118 540,138', DHWT, { dhw: 'internal', stub: true }),
  // Outer-loop source (left zone). Port 3 (brine out) rises to y 85 and runs left to x 226, port 4 (brine in) comes back
  // at y 50 from x 206: both stay above the DG1 stubs (y > 110) and the circuit labels, and port 4's pipe is the higher
  // one so that the two do not cross. Air unit (refine-schematic-drawing D13): the feed comes down the column x 226 to the bottom pass,
  // the exit leaves the top pass and rises at x 206 (left of the feed's column, so no pipe crosses another); both
  // leave the housing's right wall. Ground loop (refine-schematic-drawing D12): feed, one leg down with the bottom's first quarter
  // circle, the other quarter circle and the leg up, exit. Hybrid: the air unit is entered at its top pass, so that
  // the link to the ground loop can leave from the bottom pass without crossing the feed; the ground loop's exit
  // returns up along the housing's left side.
  seg('src_out', ['brine'], line([630, 130], [630, z.run.outY], [z.joinX.out, z.run.outY]), BOUT, { speedRole: BP }),
  seg('src_in', ['brine'], line([z.joinX.in, z.run.inY], [690, z.run.inY], [690, 130]), BIN, { speedRole: BP }),
  seg(
    'src_air_feed',
    ['brine'],
    line(
      [z.joinX.out, z.run.outY],
      [z.run.feedX, z.run.outY],
      [z.run.feedX, z.airPortY.bottom],
      [z.coilPortX, z.airPortY.bottom],
    ),
    BOUT,
    {
      source: ['air'],
      speedRole: BP,
    },
  ),
  seg('src_air_coil', ['brine'], coilPath(z, true), BOUT, { source: ['air'], speedRole: BP, bend: z.airCoilBend }),
  seg(
    'src_air_exit',
    ['brine'],
    line(
      [z.coilPortX, z.airPortY.top],
      [z.run.returnX, z.airPortY.top],
      [z.run.returnX, z.run.inY],
      [z.joinX.in, z.run.inY],
    ),
    AIRO,
    {
      source: ['air'],
      speedRole: BP,
    },
  ),
  seg(
    'src_gnd_feed',
    ['brine'],
    line([z.joinX.out, z.run.outY], [z.groundLoop.downX, z.run.outY], [z.groundLoop.downX, z.groundLineY.ground]),
    BOUT,
    {
      source: ['ground'],
      speedRole: BP,
    },
  ),
  seg('src_gnd_down', ['brine'], loopHalf(z, z.groundLineY.ground, 'down'), BOUT, {
    source: ['ground'],
    speedRole: BP,
    roundEnd: true,
    bend: z.loopBend,
  }),
  seg('src_gnd_up', ['brine'], loopHalf(z, z.groundLineY.ground, 'up'), BIN, {
    source: ['ground'],
    speedRole: BP,
    bend: z.loopBend,
  }),
  seg(
    'src_gnd_exit',
    ['brine'],
    line([z.groundLoop.upX, z.groundLineY.ground], [z.groundLoop.upX, z.run.inY], [z.joinX.in, z.run.inY]),
    BIN,
    {
      source: ['ground'],
      speedRole: BP,
    },
  ),
  seg(
    'src_hyb_feed',
    ['brine'],
    line(
      [z.joinX.out, z.run.outY],
      [z.run.feedX, z.run.outY],
      [z.run.feedX, z.airPortY.top],
      [z.coilPortX, z.airPortY.top],
    ),
    BOUT,
    {
      source: ['hybrid'],
      speedRole: BP,
    },
  ),
  seg('src_hyb_coil', ['brine'], coilPath(z, false), BOUT, { source: ['hybrid'], speedRole: BP, bend: z.airCoilBend }),
  seg(
    'src_hyb_link',
    ['brine'],
    line(
      [z.coilPortX, z.airPortY.bottom],
      [z.groundLoop.downX, z.airPortY.bottom],
      [z.groundLoop.downX, z.groundLineY.hybrid],
    ),
    AIRO,
    {
      source: ['hybrid'],
      speedRole: BP,
    },
  ),
  seg('src_hyb_down', ['brine'], loopHalf(z, z.groundLineY.hybrid, 'down'), AIRO, {
    source: ['hybrid'],
    speedRole: BP,
    roundEnd: true,
    bend: z.loopBend,
  }),
  seg('src_hyb_up', ['brine'], loopHalf(z, z.groundLineY.hybrid, 'up'), BIN, {
    source: ['hybrid'],
    speedRole: BP,
    bend: z.loopBend,
  }),
  seg(
    'src_hyb_exit',
    ['brine'],
    line(
      [z.groundLoop.upX, z.groundLineY.hybrid],
      [z.groundLoop.upX, z.groundLineY.hybrid - 15],
      [z.run.hybridReturnX, z.groundLineY.hybrid - 15],
      [z.run.hybridReturnX, z.run.inY],
      [z.joinX.in, z.run.inY],
    ),
    BIN,
    {
      source: ['hybrid'],
      speedRole: BP,
    },
  ),
  // refrigerant: discharge 11 -> 9 -> 14 -> 8 (heating), expansion 8 -> 13 -> 12 -> 7, suction 7 -> 14 -> 11
  seg('ref_discharge', ['refrigerant'], '496,250 385,250', DISCH, { through: 'htr', speedRole: CP }),
  seg('ref_9_14', ['refrigerant'], '385,296 416,296', DISCH, { through: 'htr', speedRole: CP }),
  seg('ref_discharge_direct', ['refrigerant'], '496,250 416,250 416,296', DISCH, {
    bypass: 'htr',
    speedRole: CP,
  }),
  seg('ref_14_8', ['refrigerant'], '444,306 444,348', DISCH, {
    through: 'active_cooling',
    reversible: true,
    speedRole: CP,
  }),
  seg('ref_7_14', ['refrigerant'], '560,348 560,296 444,296', SUCT, {
    through: 'active_cooling',
    reversible: true,
    speedRole: CP,
  }),
  seg('ref_suction', ['refrigerant'], '444,286 610,286 610,250 524,250', SUCT, {
    through: 'active_cooling',
    speedRole: CP,
  }),
  seg('ref_direct_8', ['refrigerant'], '416,296 444,296 444,348', DISCH, {
    bypass: 'active_cooling',
    speedRole: CP,
  }),
  seg('ref_direct_suction', ['refrigerant'], '560,348 560,286 610,286 610,250 524,250', SUCT, {
    bypass: 'active_cooling',
    speedRole: CP,
  }),
  seg('ref_8_13', ['refrigerant'], '444,416 473,416', COND, { reversible: true, speedRole: CP }),
  seg('ref_13_12', ['refrigerant'], '501,416 515,416', COND, { reversible: true, speedRole: CP }),
  seg('ref_12_7', ['refrigerant'], '539,416 560,416', EVAP, { reversible: true, speedRole: CP }),
  // brine: port 4 -> pump 16 -> evaporator 7 -> valve 28 -> port 3
  seg('ln4_a', ['brine'], '690,130 690,288', BIN, { speedRole: BP }),
  seg('ln4_b', ['brine'], '690,312 690,348', BIN, { speedRole: BP }),
  seg('br_feed7', ['brine'], '690,348 584,348', BIN, { speedRole: BP, onlyWhen: { valves2728: 'closed' } }),
  seg('brine_7_28', ['brine'], '584,416 598,416', BOUT, {
    through: 'passive_cooling',
    speedRole: BP,
    onlyWhen: { valves2728: 'closed' },
  }),
  seg('brine_28_ln3', ['brine'], '622,416 630,416', BOUT, { through: 'passive_cooling', speedRole: BP }),
  seg('brine_bypass28', ['brine'], '584,416 630,416', BOUT, { bypass: 'passive_cooling', speedRole: BP }),
  seg('ln3', ['brine'], '630,416 630,130', BOUT, { speedRole: BP }),
  // brine through exchanger 10 (passive cooling and defrost)
  seg('br_10_in', ['exchanger_10'], '690,348 690,448 532,448', BIN, {
    feature: 'passive_cooling',
    speedRole: BP,
  }),
  seg('br_10_28', ['exchanger_10'], '532,492 610,492 610,428', BOUT, {
    feature: 'passive_cooling',
    speedRole: BP,
  }),
  // brine taps as in the figure: vessel 18, transducer 37 and safety valve 20 on port 4's line before pump 16; drain 23 on port 3's line
  seg('brine_tap_a', ['brine'], '690,270 725,270 725,440', BIN, { stub: true }),
  seg('brine_tap_b', ['brine'], '725,440 725,508', BIN, { stub: true, detail: 'full' }),
  seg('brine_drain', ['brine'], '630,416 630,563', BOUT, { stub: true, detail: 'full' }),
];

/** The most crossings inside the cabinet (add-schematic-card D5): the manual's figure has 15 (14 hops and the return line behind resistor 44). */
export const MAX_CROSSINGS = 15;

/** The crossings inside the cabinet (add-schematic-card D5): this layout needs 14. */
const FULL_CROSSINGS: readonly Crossing[] = [
  { over: 'dhw_sup_a', under: 'p2_in', at: [312, 172] },
  { over: 'dhw_sup_c', under: 'ln3', at: [630, 172] },
  { over: 'dhw_sup_c', under: 'ln4_a', at: [690, 172] },
  { over: 'dhw_ret_c', under: 'ln3', at: [630, 198] },
  { over: 'dhw_ret_c', under: 'ln4_a', at: [690, 198] },
  { over: 'dhw_ret_b', under: 'htr_riser', at: [361, 198] },
  { over: 'trunk', under: 'prod_8_44', at: [312, 348] },
  { over: 'ln3', under: 'br_feed7', at: [630, 348] },
  { over: 'br_10_in', under: 'br_10_28', at: [610, 448] },
  { over: 'br_10_in', under: 'brine_drain', at: [630, 448] },
  { over: 'prod_10_out', under: 'prod_tap_a', at: [368, 448] },
  { over: 'prod_10_in', under: 'prod_tap_a', at: [368, 492] },
  { over: 'prod_10_out', under: 'prod_drain', at: [404, 448] },
  { over: 'prod_10_in', under: 'prod_drain', at: [404, 492] },
];

/** A circuit label under the top edge: the text key, where it sits and what it needs. */
export interface CircuitLabel extends Pick<Visibility, 'dhw'> {
  key: 'dg1' | 'outerLoop' | 'dhw';
  x: number;
  y: number;
}
const FULL_CIRCUIT_LABELS: readonly CircuitLabel[] = [
  { key: 'dg1', x: 291, y: 112 },
  { key: 'outerLoop', x: 660, y: 112 },
  { key: 'dhw', x: 776, y: 112, dhw: 'external' },
];

/** What decides which parts are drawn: the DHW storage, the source, the feature states and the level of detail. */
export interface DrawContext {
  /** The model: with `dhw: unused` it decides which tank is drawn (B external, C internal). */
  model: Model;
  dhw: DhwStorage;
  source: Source;
  features: Features;
  /** `simplified` leaves out the parts and stubs marked `detail: 'full'`. */
  detail: Detail;
  /** `false` leaves out the captions inside the drawing (the compact layout, add-compact-layout D2); undefined draws them. */
  captions?: boolean;
  /**
   * The arrangement drawn (refine-simplified-layout D1): every consumer reads the coordinates from it. The card sets it
   * from `arrangementFor`; left out, it is the one `arrangementFor(detail, 'full')` gives.
   */
  arrangement?: Arrangement;
}

/** Which arrangement a card shows. */
type ArrangementId = 'full' | 'simplified';

/** The layout the card shows now (card-config `layout`, resolved): compact or full. */
export type ShownLayout = 'compact' | 'full';

/**
 * One complete arrangement of the drawing (refine-simplified-layout D1): the viewBox, the cabinet and the zone constants
 * (`Zones`), the components, segments, crossings and circuit labels, and the value labels' placements with the
 * compact layout's places. Every consumer reads it from the draw context; none reads a module constant.
 */
export interface Arrangement extends Zones {
  readonly id: ArrangementId;
  readonly components: readonly Component[];
  readonly segments: readonly Segment[];
  readonly crossings: readonly Crossing[];
  readonly circuitLabels: readonly CircuitLabel[];
  readonly labels: LabelPlaces;
}

/** The source and tank pipes and the labels placed from the zones are generated from `zones`, so they follow its constants. */
function buildArrangement(id: ArrangementId, zones: Zones): Arrangement {
  return {
    ...zones,
    id,
    components: componentsFor(zones),
    segments: segmentsFor(zones),
    crossings: FULL_CROSSINGS,
    circuitLabels: FULL_CIRCUIT_LABELS,
    // the full arrangement is never drawn compact (D7): its labels have no compact places
    labels: {
      specs: labelPlacesFor(zones, {}).specs.map((spec) => {
        const place = FULL_PLACES[spec.id];
        return place === undefined
          ? spec
          : {
              ...spec,
              x: place.x,
              y: place.y,
              align: place.align,
              ...(place.caption === undefined ? {} : { caption: place.caption }),
            };
      }),
    },
  };
}

const FULL_ARRANGEMENT = buildArrangement('full', FULL_ZONES);

// The simplified arrangement (refine-simplified-layout D2, D3): the cabinet's contents are the full ones under a pair of
// monotone piecewise-linear maps, the source and the external tank are the same shapes at a uniform scale.

/** A monotone piecewise-linear map of one axis: breakpoints `[from, to]` in the full arrangement's units, ascending. Beyond the first and the last it keeps their offset (slope 1). */
type AxisMap = readonly (readonly [from: number, to: number])[];

export function mapAxis(map: AxisMap, value: number): number {
  const first = map[0];
  const last = map[map.length - 1];
  if (first === undefined || last === undefined) return value;
  if (value <= first[0]) return round2(value + first[1] - first[0]);
  if (value >= last[0]) return round2(value + last[1] - last[0]);
  const index = map.findIndex(([from]) => from > value);
  const [from0, to0] = map[index - 1] ?? first;
  const [from1, to1] = map[index] ?? last;
  return round2(to0 + ((value - from0) / (from1 - from0)) * (to1 - to0));
}

/**
 * The simplified cabinet's x map: the cabinet grows from 520 to 620 units (x 240-760 becomes 200-820). Slope 1 over every
 * span a component's ports cover (a symbol keeps its size, so the pipes that end on its ports must keep their distance):
 * the probe stems 254-270 and 296-312, valves 27/17/22/25/38/15 (338-397), the refrigerant row and tank 50's coil
 * (416-539), exchanger 7 with probes 35 and 54 (560-590), valve 28 and probe 31 (598-630), pump 16 and probe 32
 * (674-690), transducer 37 and port 5 (709-725) and port 6 (748). The 100 extra units go to the gaps between those spans:
 * the probe lane at the left (240-254 +4, 286-296 +12, 312-338 +10, 397-416 +8), the core (539-560 +10), and the brine
 * lane at the right (590-598 +4, 630-674 +30, 690-709 +8, 725-748 +6, 748-760 +8). Left of 240 and right of 760 the map
 * keeps its offset, so the labels outside the outline stay outside, and the source and tank zones are placed from their
 * own constants.
 */
export const SIMPLIFIED_MAP_X: AxisMap = [
  [240, 200],
  [254, 218],
  [286, 250],
  [296, 272],
  [312, 288],
  [338, 324],
  [397, 383],
  [416, 410],
  [539, 533],
  [560, 564],
  [590, 594],
  [598, 606],
  [630, 638],
  [674, 712],
  [690, 728],
  [709, 755],
  [725, 771],
  [748, 800],
  [760, 820],
];

/**
 * The simplified cabinet's y map: the identity from the top line down to the cut. Every drawn part of the full arrangement
 * lies above y 505 (exchanger 10's body is the lowest, to y 501); the band below it holds only parts the simplified level
 * leaves out (vessels, safety and drain valves), so the cabinet's bottom edge moves from y 605 up to y 530, and the viewBox
 * from 620 to 545. The rows inside need no stretch: the maps' room is in x, where the labels sit beside the pipes.
 */
export const SIMPLIFIED_MAP_Y: AxisMap = [
  [130, 130],
  [505, 505],
];

const simplifiedX = (x: number): number => mapAxis(SIMPLIFIED_MAP_X, x);
const simplifiedY = (y: number): number => mapAxis(SIMPLIFIED_MAP_Y, y);

/** The scale of the source and the external tank at the simplified level (refine-simplified-layout D3). */
export const SIMPLIFIED_ZONE_SCALE = 0.8;
const K = SIMPLIFIED_ZONE_SCALE;
/** A source zone value scaled about the viewBox's left edge (x) and about the cabinet's top line (y). */
const scaleX = (x: number): number => round2(x * K);
/**
 * The air unit sits 12 units left of where the scale puts it, so that the brine In and Out labels beside its ports (up to
 * 64 units wide) fit between its wall and the feed's column (x 190).
 */
const AIR_SHIFT = -12;
const airX = (x: number): number => round2(scaleX(x) + AIR_SHIFT);
const scaleY = (y: number): number => round2(FULL_CABINET.y + (y - FULL_CABINET.y) * K);

const SIMPLIFIED_CABINET: Rect = { x: 200, y: FULL_CABINET.y, width: 620, height: 400 };

const SIMPLIFIED_ZONES: Zones = deriveZones({
  viewBox: { width: 1000, height: SIMPLIFIED_CABINET.y + SIMPLIFIED_CABINET.height + 15 },
  scale: K,
  cabinet: SIMPLIFIED_CABINET,
  internalTank: {
    x: simplifiedX(FULL_ZONES.internalTank.x),
    y: FULL_ZONES.internalTank.y,
    width: round2(
      simplifiedX(FULL_ZONES.internalTank.x + FULL_ZONES.internalTank.width) - simplifiedX(FULL_ZONES.internalTank.x),
    ),
    height: FULL_ZONES.internalTank.height,
  },
  coil51: { x: simplifiedX(FULL_ZONES.coil51.x), y: FULL_ZONES.coil51.y },
  // the walls and the dome at the scale; the zone starts at x 840 and the tank is centred in it (to x 1000)
  externalTank: {
    x: 853,
    y: FULL_CABINET.y,
    width: Math.round(168 * K),
    height: Math.round(180 * K),
    dome: Math.round(14 * K),
  },
  airUnit: {
    x: airX(26),
    y: FULL_CABINET.y,
    width: scaleX(124),
    height: round2(210 * K),
    fanX: airX(88),
    fanY: scaleY(FULL_CABINET.y + 162),
    fanRadius: round2(34 * K),
    coil: { x: airX(36), y: scaleY(FULL_CABINET.y + 16), width: scaleX(104), height: round2(74 * K) },
    fins: {
      x: airX(52),
      step: round2(6 * K),
      count: 13,
      y0: scaleY(FULL_CABINET.y + 20),
      y1: scaleY(FULL_CABINET.y + 86),
    },
    slats: { y0: scaleY(FULL_CABINET.y + 134), step: round2(9 * K), count: 8 },
    dividerY: scaleY(FULL_CABINET.y + 114),
    captionX: airX(88),
    captionY: FULL_CABINET.y - 8,
    passes: { y0: scaleY(FULL_CABINET.y + 30), step: round2(15 * K), count: 4, left: airX(44), right: airX(132) },
  },
  // the legs 2.8 (down) and 0.8 (up) units left of the scale's (so that the Out value, up to 77 units wide, stays inside the drawing): the In label (up to 64 units wide) right of the down leg ends at the cabinet's edge
  groundLoop: { downX: 130, upX: 84, depth: round2(140 * K) },
  groundLineX: { start: scaleX(8), end: scaleX(220) },
  // the run above the cabinet keeps its heights; its columns sit right of the air unit's wall (x 108) with room for its port labels
  run: { outY: 85, inY: 50, feedX: 190, returnX: 172, hybridReturnX: 6 },
});

/**
 * The places of the simplified arrangement that are not the full arrangement's under the maps (refine-simplified-layout D2),
 * each with its reason. Pressure transducer 38 and its stub sit in the band the cabinet loses, so they move up, between
 * exchanger 10's two production lines (y 448 and 492) on pump 15's suction side; with them go the stub's crossing with the
 * line at y 492 and the label of the pressure.
 */
export const SIMPLIFIED_EXCEPTIONS: Readonly<Record<string, string>> = {
  'component 38':
    'in the cut band (y 520 of the full cabinet): on the production return side between the two lines of exchanger 10, y 470, stem pointing left',
  'segment prod_tap_a': 'ends at y 470 where transducer 38 now sits, instead of at y 520',
  'crossing prod_10_in x prod_tap_a': 'the stub no longer reaches the line at y 492',
  'label production_pressure': 'follows transducer 38: right of it',
};

/** Pressure transducer 38 in the simplified arrangement: on the stub's end (y), its stem pointing left. */
const TRANSDUCER_38_Y = 470;

function buildSimplifiedArrangement(): Arrangement {
  const zones = SIMPLIFIED_ZONES;
  const inCabinetX = (x: number): boolean => x >= FULL_CABINET.x && x <= FULL_CABINET.x + FULL_CABINET.width;
  // a point at the cabinet's columns is a cabinet point (the zones' own points lie left of x 240 and right of x 760)
  const mapPoint = ([x, y]: Point): Point => (inCabinetX(x) ? [simplifiedX(x), simplifiedY(y)] : [x, y]);
  const stubX = simplifiedX(368);
  const components = componentsFor(zones)
    .filter((part) => part.detail !== 'full')
    .map((part): Component => {
      if (part.item === 50 || part.item === 51) return part;
      if (part.item === 38) return { ...part, x: stubX + 16, y: TRANSDUCER_38_Y, rotation: 90 };
      return { ...part, x: simplifiedX(part.x), y: simplifiedY(part.y) };
    });
  const segments = segmentsFor(zones)
    .filter((part) => part.detail !== 'full')
    .map((part): Segment =>
      part.id === 'prod_tap_a'
        ? {
            ...part,
            points: [
              [stubX, simplifiedY(416)],
              [stubX, TRANSDUCER_38_Y],
            ],
          }
        : { ...part, points: part.points.map(mapPoint) },
    );
  const left = new Set(segments.map((part) => part.id));
  const crossings = FULL_CROSSINGS.filter(
    (crossing) =>
      left.has(crossing.over) &&
      left.has(crossing.under) &&
      !(crossing.over === 'prod_10_in' && crossing.under === 'prod_tap_a'),
  ).map((crossing): Crossing => ({ ...crossing, at: mapPoint(crossing.at) }));
  const labels = labelPlacesFor(zones, COMPACT_PLACES, (x, y) => [simplifiedX(x), simplifiedY(y)]);
  return {
    ...zones,
    id: 'simplified',
    components,
    segments,
    crossings,
    circuitLabels: FULL_CIRCUIT_LABELS.map((label) => ({ ...label, x: simplifiedX(label.x), y: simplifiedY(label.y) })),
    labels: {
      specs: labels.specs.map((spec) => {
        if (spec.id === 'production_pressure') {
          return { ...spec, x: stubX + 32, y: TRANSDUCER_38_Y, align: 'start' as const };
        }
        const place = SIMPLIFIED_PLACES[spec.id]?.at(zones, (x, y) => [simplifiedX(x), simplifiedY(y)]);
        return place === undefined ? spec : { ...spec, ...place };
      }),
    },
  };
}

const SIMPLIFIED_ARRANGEMENT = buildSimplifiedArrangement();

/**
 * The arrangement of a detail level in a shown layout: a pure function of the two. `full` draws the full arrangement,
 * `simplified` the simplified one. The compact layout draws the simplified detail level whatever `detail` says (add-compact-layout D3),
 * so it gets the simplified arrangement at either level (refine-simplified-layout D7); its places are COMPACT_PLACES.
 */
export function arrangementFor(level: Detail, layout: ShownLayout): Arrangement {
  if (layout === 'compact') return SIMPLIFIED_ARRANGEMENT;
  return level === 'full' ? FULL_ARRANGEMENT : SIMPLIFIED_ARRANGEMENT;
}

/**
 * The arrangement a draw context carries (or, without one, the full layout's arrangement of its detail level). A compact
 * render must pass its arrangement in the context (the card always does), since this fallback is a full layout's.
 */
export const arrangementOf = (context: Pick<DrawContext, 'arrangement' | 'detail'>): Arrangement =>
  context.arrangement ?? arrangementFor(context.detail, 'full');

export type PartState = 'normal' | 'muted' | 'hidden';

/** A feature's state as the drawing sees it: HTR needs DHW storage, so it counts as false without it. */
export const effectiveFeature = (context: DrawContext, key: FeatureKey): Features[FeatureKey] =>
  key === 'htr' && context.dhw === 'none' ? false : context.features[key];

/** The storage the drawing shows: the configured one, or for `unused` the model's own tank. */
export const drawnStorage = (context: Pick<DrawContext, 'model' | 'dhw'>): 'external' | 'internal' | 'none' =>
  context.dhw === 'unused' ? (context.model === 'C' ? 'internal' : 'external') : context.dhw;

const dhwFits = (rule: NonNullable<Visibility['dhw']>, context: Pick<DrawContext, 'model' | 'dhw'>): boolean => {
  const storage = drawnStorage(context);
  return rule === 'any' ? storage !== 'none' : rule === storage;
};

/** Whether a part is drawn normally, drawn muted (feature `unused`) or not drawn (see Visibility). */
export function partState(part: Visibility, context: DrawContext): PartState {
  if (part.detail === 'full' && context.detail !== 'full') return 'hidden';
  if (part.source !== undefined && !part.source.includes(context.source)) return 'hidden';
  if (part.dhw !== undefined && !dhwFits(part.dhw, context)) return 'hidden';
  if (part.bypass !== undefined && effectiveFeature(context, part.bypass) !== false) return 'hidden';
  if (part.through !== undefined && effectiveFeature(context, part.through) === false) return 'hidden';
  if (part.feature !== undefined) {
    const state = effectiveFeature(context, part.feature);
    if (state === false) return 'hidden';
    if (state === 'unused') return 'muted';
  }
  // An unused tank (dhw-storage spec): the tank's own parts are muted, whatever the features say.
  if (context.dhw === 'unused' && part.dhw !== undefined && (part.dhw !== 'any' || part.unusedMuted === true)) {
    return 'muted';
  }
  return 'normal';
}

export interface Drawn<T> {
  part: T;
  state: Exclude<PartState, 'hidden'>;
}

function drawn<T extends Visibility>(parts: readonly T[], context: DrawContext): Drawn<T>[] {
  return parts.flatMap((part) => {
    const state = partState(part, context);
    return state === 'hidden' ? [] : [{ part, state }];
  });
}

export const drawnComponents = (context: DrawContext): Drawn<Component>[] =>
  drawn(arrangementOf(context).components, context);
export const drawnSegments = (context: DrawContext): Drawn<Segment>[] =>
  drawn(arrangementOf(context).segments, context);

/** A segment is active when any of its circuits is and, if it has one, its valve position holds. */
export const isSegmentActive = (segment: Pick<Segment, 'circuit' | 'onlyWhen'>, circuits: Circuits): boolean =>
  (segment.onlyWhen === undefined || segment.onlyWhen.valves2728 === circuits.valves2728) &&
  segment.circuit.some((circuit) => circuits.active.has(circuit));

/** The hop of a crossing: the gap in the `under` segment is this many units on each side of the crossing. */
export const HOP = 7;

// Where the connectable ports of each symbol are, relative to its centre, before the rotation.
const STEM = {
  probe_t: 16,
  transducer_p: 16,
  pressure_switch: 16,
  thermostat: 16,
  safety_valve: 16,
  service_outlet: 10,
};

function localPorts(component: Component): readonly Point[] {
  switch (component.kind) {
    case 'port':
      return [[0, 0]];
    case 'pump':
    case 'expansion_valve':
      return [
        [-12, 0],
        [12, 0],
      ];
    case 'valve3':
      return [
        [-12, 0],
        [12, 0],
        [0, 12],
      ];
    case 'inversion_valve':
      return [
        [-14, 0],
        [14, -10],
        [14, 0],
        [14, 10],
      ];
    case 'probe_t':
    case 'transducer_p':
    case 'pressure_switch':
    case 'thermostat':
    case 'safety_valve':
    case 'service_outlet':
      return [[0, STEM[component.kind]]];
    case 'exchanger': {
      const span = component.size ?? 34;
      return [
        [-12, -span],
        [12, -span],
        [-12, span],
        [12, span],
      ];
    }
    case 'compressor':
    case 'filter_dryer':
      return [
        [-14, 0],
        [14, 0],
      ];
    case 'vessel':
      return [[0, -12]];
    case 'valve':
      return [
        [0, -9],
        [0, 9],
      ];
    case 'drain_valve':
      return [[0, -9]];
    case 'resistor':
      return [
        [-28, 0],
        [28, 0],
      ];
    case 'tank':
      return [];
    case 'coil':
      return COIL_LOCAL_PORTS;
  }
}

const rotate = ([x, y]: Point, rotation: Rotation): Point => {
  switch (rotation) {
    case 0:
      return [x, y];
    case 90:
      return [-y, x];
    case 180:
      return [-x, -y];
    case 270:
      return [y, -x];
  }
};

/** The connectable ports of a component, in viewBox coordinates. */
export function portsOf(component: Component): Point[] {
  return localPorts(component).map((port) => {
    const [dx, dy] = rotate(port, component.rotation);
    return [component.x + dx, component.y + dy];
  });
}

/** The half-turns of a helix, in order from its start: the lower arcs (front, solid) and the upper arcs (back, faint). */
export interface HelixHalf {
  front: boolean;
  d: string;
}

/** The opacity of the back halves of a helical coil (refine-schematic-drawing D5). */
export const HELIX_BACK_OPACITY = 0.35;

/** The cubic Bezier of one half-turn: start, two control points and end. */
type Cubic = readonly [Point, Point, Point, Point];

/**
 * The half-turns of a helix as cubic Beziers, each a half ellipse from one side of the coil to the other, going down
 * by an equal pitch: even ones pass in front (the lower arc), odd ones behind (the upper arc). The last half ends with
 * a horizontal tangent, so the pipe that leaves the coil there does not hook.
 */
function helixCubics(shape: HelixShape): { front: boolean; curve: Cubic }[] {
  const count = Math.max(1, Math.round(shape.turns * 2));
  const pitch = (shape.bottom - shape.top) / count;
  const bulge = (4 / 3) * Math.max(3, pitch);
  return Array.from({ length: count }, (_, index) => {
    const front = index % 2 === 0;
    const [from, to] = front ? [shape.cx + shape.rx, shape.cx - shape.rx] : [shape.cx - shape.rx, shape.cx + shape.rx];
    const y0 = shape.top + index * pitch;
    const y1 = y0 + pitch;
    const lift = front ? bulge : -bulge;
    const last = index === count - 1;
    const curve: Cubic = [
      [from, y0],
      [from, y0 + lift],
      last ? [to + (from - to) * 0.3, y1] : [to, y1 + lift],
      [to, y1],
    ];
    return { front, curve };
  });
}

/** The halves in drawing order: all back halves first (under), then all front halves, each in order from the start. */
export const helixDrawOrder = (halves: readonly HelixHalf[]): HelixHalf[] => [
  ...halves.filter((half) => !half.front),
  ...halves.filter((half) => half.front),
];

/** The half-turns of a helix, in order from its start: the lower arcs (front, solid) and the upper arcs (back, faint). */
export function helixHalves(shape: HelixShape): HelixHalf[] {
  const n = (value: number): string => String(Math.round(value * 100) / 100);
  return helixCubics(shape).map(({ front, curve: [p0, p1, p2, p3] }) => ({
    front,
    d: `M${n(p0[0])} ${n(p0[1])} C${n(p1[0])} ${n(p1[1])} ${n(p2[0])} ${n(p2[1])} ${n(p3[0])} ${n(p3[1])}`,
  }));
}

/** The box around the drawn curve of a helix, from sampling every half-turn (16 points each), rounded outward. */
export function helixExtent(shape: HelixShape): { left: number; right: number; top: number; bottom: number } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const { curve } of helixCubics(shape)) {
    for (let step = 0; step <= 16; step += 1) {
      const t = step / 16;
      const w = [(1 - t) ** 3, 3 * (1 - t) ** 2 * t, 3 * (1 - t) * t ** 2, t ** 3];
      xs.push(curve.reduce((sum, point, i) => sum + point[0] * (w[i] ?? 0), 0));
      ys.push(curve.reduce((sum, point, i) => sum + point[1] * (w[i] ?? 0), 0));
    }
  }
  return {
    left: Math.floor(Math.min(...xs)),
    right: Math.ceil(Math.max(...xs)),
    top: Math.floor(Math.min(...ys)),
    bottom: Math.ceil(Math.max(...ys)),
  };
}

/**
 * The points the integrity tests use for a segment: its own points, except for a helix, which stands for its coil as
 * the box around its drawn curve (`helixExtent`), so it is still checked against every other pipe, and the only overlap
 * left out is the coil's own, between its turns. Other pipes may end only on its two end points (a test checks it).
 */
export function routePoints(segment: Pick<Segment, 'points' | 'shape'>): readonly Point[] {
  const { shape } = segment;
  if (shape === undefined) return segment.points;
  const { left, right, top, bottom } = helixExtent(shape);
  return [
    [right, top],
    [left, top],
    [left, bottom],
    [right, bottom],
    [right, top],
  ];
}

/**
 * The path data of an orthogonal polyline with every corner rounded by `radius`. A corner takes at most half of an inner
 * piece next to it (the other half belongs to the corner at its other end) but all of the first or last piece, so that a
 * half circle can be split in two segments at its middle.
 */
export function roundedPathData(points: readonly Point[], radius: number): string {
  const first = pointAt(points, 0);
  const parts = [`M${String(first[0])} ${String(first[1])}`];
  for (let index = 1; index < points.length; index += 1) {
    const [prev, corner, next] = [pointAt(points, index - 1), pointAt(points, index), points[index + 1]];
    if (next === undefined) {
      parts.push(`L${String(corner[0])} ${String(corner[1])}`);
      break;
    }
    const inLength = Math.abs(corner[0] - prev[0]) + Math.abs(corner[1] - prev[1]);
    const outLength = Math.abs(next[0] - corner[0]) + Math.abs(next[1] - corner[1]);
    const r = Math.min(
      radius,
      index === 1 ? inLength : inLength / 2,
      index === points.length - 2 ? outLength : outLength / 2,
    );
    const [dx1, dy1] = [Math.sign(corner[0] - prev[0]), Math.sign(corner[1] - prev[1])];
    const [dx2, dy2] = [Math.sign(next[0] - corner[0]), Math.sign(next[1] - corner[1])];
    const sweep = dx1 * dy2 - dy1 * dx2 > 0 ? 1 : 0;
    parts.push(
      `L${String(corner[0] - dx1 * r)} ${String(corner[1] - dy1 * r)} A${String(r)} ${String(r)} 0 0 ${String(sweep)} ${String(corner[0] + dx2 * r)} ${String(corner[1] + dy2 * r)}`,
    );
  }
  return parts.join(' ');
}

const same = (a: Point, b: Point): boolean => a[0] === b[0] && a[1] === b[1];

/** The point at an index of a polyline. */
function pointAt(points: readonly Point[], index: number): Point {
  const point = points[index];
  if (point === undefined) throw new Error(`No point ${String(index)}`);
  return point;
}

/** The straight pieces of a polyline. */
const pieces = (points: readonly Point[]): [Point, Point][] =>
  points.slice(1).map((end, index): [Point, Point] => [pointAt(points, index), end]);

const between = (value: number, a: number, b: number): boolean => value >= Math.min(a, b) && value <= Math.max(a, b);
const strictlyBetween = (value: number, a: number, b: number): boolean =>
  value > Math.min(a, b) && value < Math.max(a, b);

/** Whether a point lies on a polyline (an endpoint or anywhere along it). */
export function onPolyline(point: Point, points: readonly Point[]): boolean {
  return pieces(points).some(
    ([a, b]) =>
      (a[0] === b[0] && point[0] === a[0] && between(point[1], a[1], b[1])) ||
      (a[1] === b[1] && point[1] === a[1] && between(point[0], a[0], b[0])),
  );
}

/** The crossings of two polylines: where a piece of one passes through the inside of a piece of the other. */
export function crossingPoints(first: readonly Point[], second: readonly Point[]): Point[] {
  const found: Point[] = [];
  for (const [a, b] of pieces(first)) {
    for (const [p, q] of pieces(second)) {
      const aVertical = a[0] === b[0];
      const pVertical = p[0] === q[0];
      if (aVertical === pVertical) continue;
      const [v1, v2, h1, h2] = aVertical ? [a, b, p, q] : [p, q, a, b];
      if (strictlyBetween(v1[0], h1[0], h2[0]) && strictlyBetween(h1[1], v1[1], v2[1])) found.push([v1[0], h1[1]]);
    }
  }
  return found;
}

/** Whether two polylines run along each other for some length. */
export function overlap(first: readonly Point[], second: readonly Point[]): boolean {
  return pieces(first).some(([a, b]) =>
    pieces(second).some(([p, q]) => {
      if (a[0] === b[0] && p[0] === q[0] && a[0] === p[0]) {
        return (
          Math.min(Math.max(a[1], b[1]), Math.max(p[1], q[1])) > Math.max(Math.min(a[1], b[1]), Math.min(p[1], q[1]))
        );
      }
      if (a[1] === b[1] && p[1] === q[1] && a[1] === p[1]) {
        return (
          Math.min(Math.max(a[0], b[0]), Math.max(p[0], q[0])) > Math.max(Math.min(a[0], b[0]), Math.min(p[0], q[0]))
        );
      }
      return false;
    }),
  );
}

/**
 * The SVG path data of a polyline, with a gap of `hop` (HOP unless a thicker pipe asks for more) on each side of every
 * given crossing point (the hop of a crossing, drawn in the `under` segment).
 */
export function pathData(points: readonly Point[], gaps: readonly Point[] = [], hop: number = HOP): string {
  const parts: string[] = [];
  let pen: Point | undefined;
  const lineTo = (target: Point): void => {
    parts.push(
      pen === undefined ? `M${String(target[0])} ${String(target[1])}` : `L${String(target[0])} ${String(target[1])}`,
    );
    pen = target;
  };
  const moveTo = (target: Point): void => {
    parts.push(`M${String(target[0])} ${String(target[1])}`);
    pen = target;
  };
  lineTo(pointAt(points, 0));
  for (const [a, b] of pieces(points)) {
    const dx = Math.sign(b[0] - a[0]);
    const dy = Math.sign(b[1] - a[1]);
    const length = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    const inside = gaps
      .filter((gap) => onPiece(gap, a, b) && !same(gap, a) && !same(gap, b))
      .sort(
        (g1, g2) => Math.abs(g1[0] - a[0]) + Math.abs(g1[1] - a[1]) - (Math.abs(g2[0] - a[0]) + Math.abs(g2[1] - a[1])),
      );
    for (const gap of inside) {
      const distance = Math.abs(gap[0] - a[0]) + Math.abs(gap[1] - a[1]);
      if (distance > hop) lineTo([gap[0] - dx * hop, gap[1] - dy * hop]);
      moveTo(length - distance > hop ? [gap[0] + dx * hop, gap[1] + dy * hop] : b);
    }
    lineTo(b);
  }
  return parts.join(' ');
}

const onPiece = (point: Point, a: Point, b: Point): boolean =>
  (a[0] === b[0] && point[0] === a[0] && between(point[1], a[1], b[1])) ||
  (a[1] === b[1] && point[1] === a[1] && between(point[0], a[0], b[0]));

/** Whether a point lies on the outline of the integrated tank (where its drain valve and probe connect). */
export const onInternalTank = ([x, y]: Point, { internalTank }: Pick<Zones, 'internalTank'>): boolean => {
  const { x: x0, y: y0, width, height } = internalTank;
  const inX = x >= x0 && x <= x0 + width;
  const inY = y >= y0 && y <= y0 + height;
  return (inY && (x === x0 || x === x0 + width)) || (inX && (y === y0 || y === y0 + height));
};

/** The crossing points that are drawn as a gap in this segment, given the segments that are drawn. */
export function gapsIn(
  arrangement: Pick<Arrangement, 'crossings'>,
  segmentId: string,
  drawnIds: ReadonlySet<string>,
): Point[] {
  return arrangement.crossings
    .filter((crossing) => crossing.under === segmentId && drawnIds.has(crossing.over) && drawnIds.has(crossing.under))
    .map((crossing) => crossing.at);
}
