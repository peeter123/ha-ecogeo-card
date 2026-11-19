// The drawing's geometry as data (add-schematic-card D5, rework-layouts D1-D3): the viewBox, the ports on the top edge, every
// component and every pipe segment, laid out after the manual's B4 figure (manual-figure, section 3.1, page 34) and, for
// model C, figure C (items 47-54, the integrated tank). The topology and the item numbers are the figures'; the coordinates
// are re-laid out for legibility. Besides the cabinet's own pipes the segments include the pipes of the outer-loop source and of
// the external DHW tank, which lie in the band above the cabinet, and the stubs of connections 47-49. No Lit here: this file is
// data plus small pure helpers that the renderer and the integrity tests share.
//
// The cabinet's component and segment lists are authored in the manual-figure frame (cabinet x 240-760, y 130-605); the one
// drawn arrangement (`arrangementFor`, the horizontal layout's; the vertical layout shares it until its own is built) maps
// them to its own units (rework-layouts D1, D2). Only the parts the drawing shows are in the lists: the service and safety
// parts of the figure (items 18-21, 23, 24, 39-41, 52, 53) are not drawn. Ports 1-6 sit on the cabinet's top edge in the
// manual's order. Inside, from the top: the DHW supply (y 172) and return (y 198) lines of valve 26, the probe row, the
// discharge line of compressor 11 (y 250) through HTR exchanger 9 to inversion valve 14, condenser 8 and evaporator 7, the
// valve 27 / pump 15 / valve 28 row (y 416) and exchanger 10.
//
// Above the cabinet lies the band (rework-layouts D3): a strip with three slots, left to right the emitter (over ports 1/2),
// the outer-loop source (over 3/4) and the external DHW tank (over 5/6), and, between the band and the cabinet's top edge,
// the join lane that holds the short pipes from the ports into the parts. None of the band's parts is a manual item: the
// manual's figures stop at the connections; the air unit, the ground collector and the external tank are the card's own
// drawings of what the connections lead to (the tank is the "DHW inter-accumulator" of ports 5/6).
//
// Pipe points run in the direction of the flow in heating (`direction` 1) so that the renderer can animate them.
import type { CircuitId, Circuits } from '../calc/circuits';
import type { DhwStorage, Model, Source } from '../config/options';
import type { RolePath } from '../config/roles';
import type { FeatureKey, Features } from '../config/variants';
import { HORIZONTAL_PLACES, labelPlacesFor, type LabelPlaces } from './label-places';

/** A rectangle in viewBox units. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The air unit (not a manual item): a housing with the fan in its upper part, a strip for the Out value under the fan and the
 * coil block at the bottom, facing the cabinet. The brine serpentine runs in vertical passes across the coil's horizontal
 * fins and enters and leaves on the coil block's bottom face (`passes.x0` and the last pass), so that both pipes arrive from
 * the join lane below.
 */
export interface AirUnitShape extends Rect {
  readonly fan: { readonly cx: number; readonly cy: number; readonly radius: number };
  /** The divider between the fan section and the value strip. */
  readonly dividerY: number;
  /** The free strip between the fan and the coil block, where the Out value sits. */
  readonly strip: Rect;
  /** The coil block's frame; its bottom edge is the face the brine pipes use. */
  readonly coil: Rect;
  readonly fins: {
    readonly x0: number;
    readonly x1: number;
    readonly y0: number;
    readonly step: number;
    readonly count: number;
  };
  /** The serpentine: the x of the first pass, the pass spacing, the (even) number of passes, and the y of its top and bottom bends. */
  readonly passes: {
    readonly x0: number;
    readonly step: number;
    readonly count: number;
    readonly top: number;
    readonly bottom: number;
  };
}

/**
 * The ground collector (not a manual item): a strip of ground, hatched along its top edge (the surface), with a flat
 * serpentine of horizontal passes in its lower part and the Out value in the strip between the hatching and the serpentine.
 * The brine enters on the left at `feedX`, runs through the passes and leaves at `passes.left`; both ends are on the bottom face.
 */
export interface CollectorShape extends Rect {
  readonly hatch: Rect;
  /** The free strip between the hatching and the serpentine, where the Out value sits. */
  readonly strip: Rect;
  /** The box around the serpentine and its feed riser. */
  readonly serpentine: Rect;
  /** The passes: the y of the first, the spacing, the (even) number, and the x of the left and right bends. */
  readonly passes: {
    readonly y0: number;
    readonly step: number;
    readonly count: number;
    readonly left: number;
    readonly right: number;
  };
  /** The x of the feed riser, left of the serpentine. */
  readonly feedX: number;
}

/** The external tank's cylinder with its elliptical domed caps. */
export type TankShape = Rect & { readonly dome: number };

/**
 * The external coil: its centre line is the tank's, and it sits in the tank's lower part (the upper part holds the values).
 * `inX` and `outX` are the columns of the pipes that enter the tank, left and right of the coil, so that they run beside it.
 */
export interface ExternalCoil {
  readonly cx: number;
  readonly top: number;
  readonly bottom: number;
  readonly rx: number;
  readonly inX: number;
  readonly outX: number;
}

/** What decides the band's slots: the source, and whether the external tank and the emitter are drawn (an empty slot gives its space away). */
export interface BandKey {
  readonly source: Source;
  readonly tank: boolean;
  readonly emitter: boolean;
}

export type BandSlotName = 'emitter' | 'source' | 'tank';

/** A slot's horizontal extent in the band. */
export interface Slot {
  readonly x0: number;
  readonly x1: number;
}

/** The cabinet-side zones: the viewBox, the outline and the integrated tank of model C with its coil, all in the arrangement's units. */
export interface CabinetZones {
  readonly viewBox: { readonly width: number; readonly height: number };
  /** The cabinet's outline. */
  readonly cabinet: Rect;
  /**
   * The integrated tank of model C (item 50), inside the cabinet under the top edge: coil 51 (its ports are where the DHW
   * lines of valve 26 end), probe 54 sits on or in it. The figure's tank is tall; this one is squat so
   * that it fits above the probe row.
   */
  readonly internalTank: Rect;
  /** Coil 51's centre (model C), inside tank 50; its port stubs reach back to the tank wall (symbols.ts). */
  readonly coil51: { readonly x: number; readonly y: number };
}

/** The band's parts, placed for one `BandKey`. */
export interface BandZones {
  readonly key: BandKey;
  /** The band: its top and its bottom, where every body's bottom edge lies. The join lane runs from the bottom to the cabinet's top edge. */
  readonly band: { readonly top: number; readonly bottom: number };
  /** The x of connections 3-6 on the cabinet's top edge. */
  readonly ports: Readonly<Record<3 | 4 | 5 | 6, number>>;
  /** The slots that are filled (a slot of an absent part is not there). */
  readonly slots: Readonly<Partial<Record<BandSlotName, Slot>>>;
  readonly airUnit?: AirUnitShape;
  readonly collector?: CollectorShape;
  readonly externalTank?: TankShape;
  readonly externalCoil?: ExternalCoil;
}

/** What `arrangementFor` gives: the cabinet's zones and the band's. */
export type Zones = CabinetZones & BandZones;

/** The band's sizes in viewBox units (rework-layouts D3, D4). */
export const BAND = {
  /** The bodies' height: the tallest (the tank's); every body's bottom edge is the band's bottom. */
  height: 170,
  /** The top of the band, below the viewBox's top margin. */
  top: 6,
  /** The join lane between the band's bottom and the cabinet's top edge. */
  joinLane: 56,
  /** The smallest gap between two slots. */
  gap: 24,
  air: { width: 130, height: 168 },
  collector: { width: 170, height: 112 },
  /** The gap between the air unit and the collector of the hybrid. */
  hybridGap: 12,
  tank: { width: 160, height: 170, dome: 14 },
  /** The emitter's width; 0 while the emitter is not drawn (its slot is empty and gives its space away). */
  emitterWidth: 0 as number,
  /** The jogs' distances above the cabinet's top edge. */
  jog: { out: 22, in: 34, link: 46, tank: 28 },
} as const;

/** The width of the source's body (the air unit, the collector, or both side by side). */
export const sourceWidth = (source: Source): number =>
  source === 'air'
    ? BAND.air.width
    : source === 'ground'
      ? BAND.collector.width
      : BAND.air.width + BAND.hybridGap + BAND.collector.width;

/** One part to place in the band: its slot, the x it would centre on (over its ports) and its width (0: not drawn). */
export interface BandItem {
  readonly name: BandSlotName;
  readonly centre: number;
  readonly width: number;
}

/**
 * The slots of the band (rework-layouts D3): each part is centred over its port pair where its width allows; where two parts
 * would come closer than `gap`, or leave the bounds, the parts move the least that restores the order, the gaps and the
 * bounds (neighbours that meet share the move: the cluster centres on the mean of its parts' ideal places). A part of
 * width 0 is empty: it has no slot and gives its space to the others. Pure.
 */
export function planBand(
  items: readonly BandItem[],
  bounds: { readonly min: number; readonly max: number },
  gap: number,
): Partial<Record<BandSlotName, Slot>> {
  interface Cluster {
    members: { item: BandItem; offset: number }[];
    width: number;
    /** The sum over the members of (ideal left edge - offset): its mean is the cluster's ideal left edge. */
    total: number;
    x0: number;
  }
  const place = (cluster: Cluster): number =>
    Math.min(Math.max(cluster.total / cluster.members.length, bounds.min), bounds.max - cluster.width);
  const clusters: Cluster[] = [];
  for (const item of items.filter((entry) => entry.width > 0)) {
    let current: Cluster = {
      members: [{ item, offset: 0 }],
      width: item.width,
      total: item.centre - item.width / 2,
      x0: 0,
    };
    current.x0 = place(current);
    for (;;) {
      const previous = clusters[clusters.length - 1];
      if (previous === undefined || previous.x0 + previous.width + gap <= current.x0) break;
      clusters.pop();
      const shift = previous.width + gap;
      current = {
        members: [
          ...previous.members,
          ...current.members.map((member) => ({ ...member, offset: member.offset + shift })),
        ],
        width: previous.width + gap + current.width,
        total: previous.total + current.total - current.members.length * shift,
        x0: 0,
      };
      current.x0 = place(current);
    }
    clusters.push(current);
  }
  return Object.fromEntries(
    clusters.flatMap((cluster) =>
      cluster.members.map(({ item, offset }) => [
        item.name,
        { x0: round2(cluster.x0 + offset), x1: round2(cluster.x0 + offset + item.width) },
      ]),
    ),
  );
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

/** The air unit placed with its left edge at `x0` and its bottom edge at `bottom`. */
export function airUnitShape(x0: number, bottom: number): AirUnitShape {
  const { width, height } = BAND.air;
  const y = bottom - height;
  const coil: Rect = { x: x0 + 10, y: y + 102, width: 110, height: 58 };
  return {
    x: x0,
    y,
    width,
    height,
    fan: { cx: x0 + width / 2, cy: y + 36, radius: 28 },
    dividerY: y + 70,
    strip: { x: x0 + 8, y: y + 74, width: width - 16, height: 24 },
    coil,
    fins: { x0: coil.x + 4, x1: coil.x + coil.width - 4, y0: coil.y + 8, step: 8, count: 6 },
    passes: { x0: x0 + 32, step: 22, count: 4, top: coil.y + 12, bottom: coil.y + 46 },
  };
}

/** The collector placed with its left edge at `x0` and its bottom edge at `bottom`. */
export function collectorShape(x0: number, bottom: number): CollectorShape {
  const { width, height } = BAND.collector;
  const y = bottom - height;
  return {
    x: x0,
    y,
    width,
    height,
    hatch: { x: x0, y, width, height: 14 },
    strip: { x: x0 + 8, y: y + 18, width: width - 16, height: 24 },
    serpentine: { x: x0 + 8, y: y + 48, width: width - 16, height: height - 48 },
    passes: { y0: y + 54, step: 14, count: 4, left: x0 + 34, right: x0 + width - 14 },
    feedX: x0 + 14,
  };
}

/** The x of the air unit's brine pipes on its coil block's bottom face: the feed (first pass) and the exit (last pass). */
export const airPortX = (unit: AirUnitShape): { feed: number; exit: number } => ({
  feed: unit.passes.x0,
  exit: unit.passes.x0 + (unit.passes.count - 1) * unit.passes.step,
});

/** The y of the air unit's brine face, the coil block's bottom edge. */
export const airFaceY = (unit: AirUnitShape): number => unit.coil.y + unit.coil.height;

/** The y of the collector's passes, in order. */
export const collectorPassYs = (collector: CollectorShape): number[] =>
  Array.from({ length: collector.passes.count }, (_, index) => collector.passes.y0 + index * collector.passes.step);

/** The outline of the external tank's body (straight walls, elliptical domed caps), as path data. */
export function externalTankBody({ externalTank }: Pick<BandZones, 'externalTank'>): string {
  if (externalTank === undefined) return '';
  const { x, y, width, height, dome } = externalTank;
  const rx = width / 2;
  return `M${String(x)} ${String(y + dome)} A${String(rx)} ${String(dome)} 0 0 1 ${String(x + width)} ${String(y + dome)} V${String(y + height - dome)} A${String(rx)} ${String(dome)} 0 0 1 ${String(x)} ${String(y + height - dome)} Z`;
}

/** Coil 51's ports in its local frame: supply first, return second. The symbol's port stubs end on their y values; the symbol keeps this size in every arrangement. */
export const COIL_LOCAL_PORTS: readonly [readonly [number, number], readonly [number, number]] = [
  [-75, -13],
  [-75, 13],
];

/** The manual-figure frame's cabinet; the maps of the arrangement start from it. */
const FRAME_CABINET = { x: 240, y: 130, width: 520, height: 475 } as const;

/**
 * The manual-figure frame's zones: the coordinates the cabinet's component and segment lists are authored in (add-schematic-card D5).
 * Not drawn (rework-layouts D1): the arrangement's own zones derive from them, and `FRAME` lets the tests compare the two.
 */
const FRAME_ZONES: CabinetZones = {
  viewBox: { width: 1000, height: 620 },
  cabinet: FRAME_CABINET,
  internalTank: { x: 408, y: 138, width: 182, height: 66 },
  coil51: { x: 495, y: 185 },
};

export type Point = readonly [x: number, y: number];
export type Rotation = 0 | 90 | 180 | 270;

export type ComponentKind =
  | 'port'
  | 'pump'
  | 'valve3'
  | 'inversion_valve'
  | 'probe_t'
  | 'transducer_p'
  | 'thermostat'
  | 'exchanger'
  | 'compressor'
  | 'valve'
  | 'drain_valve'
  | 'resistor'
  | 'filter_dryer'
  | 'expansion_valve'
  | 'tank'
  | 'coil';

/**
 * When a part is drawn. `feature`: unless that feature is `false`, muted when `unused`. `through` (segments only): a
 * pipe that passes through the part: drawn unless the feature is `false`, never muted by it. `bypass` (segments
 * only): the pipe that replaces the part, drawn only when the feature is `false`. `dhw`: only for that DHW storage
 * (`any` means external or internal, or the model's tank while it is `unused`; with `dhw: unused` the parts that
 * are specific to the model's tank, and those with `unusedMuted`, are drawn muted). `source`: only for those
 * outer-loop sources. HTR also needs DHW storage: with `dhw: none` it counts as `false`; with `unused` it follows
 * its feature.
 */
export interface Visibility {
  feature?: FeatureKey;
  through?: FeatureKey;
  bypass?: FeatureKey;
  dhw?: 'any' | 'external' | 'internal' | 'none';
  /** Drawn muted while `dhw` is `unused`, though it also serves a tank in use (valve 26). */
  unusedMuted?: true;
  source?: readonly Source[];
}

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

export interface Component extends Pick<Visibility, 'feature' | 'dhw' | 'unusedMuted'> {
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
  /** Starts at the left end (cx - rx) and ends at the right one, instead of the other way round. */
  mirror?: true;
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
  /** A dead end (the DG1 and HTR stubs, the model C tap-water stubs): coloured, never animated. */
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
  extra: Partial<Pick<Component, 'feature' | 'dhw' | 'size' | 'sides' | 'unusedMuted'>> = {},
): Component => ({ item, kind, x, y, rotation, ...extra });

/** Components. Items 1-6 are the ports on the top edge. */
const componentsFor = (z: CabinetZones): readonly Component[] => [
  // ports, left to right in the manual's order
  c(1, 'port', 270, 130, 0),
  c(2, 'port', 312, 130, 0),
  c(3, 'port', 630, 130, 0),
  c(4, 'port', 690, 130, 0),
  c(5, 'port', 722, 130, 0, { dhw: 'external' }),
  c(6, 'port', 748, 130, 0, { dhw: 'external' }),
  // model C: tap water inlet, DHW outlet and recirculation of the integrated tank, on the top edge
  c(47, 'port', 440, 130, 0, { dhw: 'internal' }),
  c(48, 'port', 490, 130, 0, { dhw: 'internal' }),
  c(49, 'port', 540, 130, 0, { dhw: 'internal' }),
  // refrigerant circuit
  c(7, 'exchanger', 572, 382, 0, {
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
  c(8, 'exchanger', 432, 382, 0, {
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
  c(9, 'exchanger', 373, 273, 0, {
    size: 23,
    feature: 'htr',
    sides: [
      // HTR water (left): from valve 22 in at the bottom, up the riser into the DHW supply out at the top
      { half: 'left', entering: ['htr_to_9'], leaving: ['htr_riser'], enters: 'bottom' },
      // refrigerant (right): the discharge line passes through, at the discharge temperature at both ends
      { half: 'right', entering: ['ref_discharge'], leaving: ['ref_9_14'], enters: 'top' },
    ],
  }),
  c(11, 'compressor', 510, 250, 0),
  c(12, 'expansion_valve', 527, 416, 0),
  c(13, 'filter_dryer', 487, 416, 0),
  c(14, 'inversion_valve', 430, 296, 0, { feature: 'active_cooling' }),
  c(29, 'probe_t', 542, 234, 0),
  c(30, 'probe_t', 430, 234, 0),
  c(35, 'transducer_p', 564, 234, 0),
  c(36, 'transducer_p', 452, 234, 0),
  // hydraulic circuits
  c(10, 'exchanger', 520, 470, 0, {
    size: 22,
    feature: 'passive_cooling',
    sides: [
      // production water (left): in at the bottom, out at the top
      { half: 'left', entering: ['prod_10_in'], leaving: ['prod_10_out'], enters: 'bottom' },
      // brine (right): in at the top, out at the bottom
      { half: 'right', entering: ['br_10_in'], leaving: ['br_10_28'], enters: 'top' },
    ],
  }),
  c(15, 'pump', 385, 416, 0),
  c(16, 'pump', 690, 300, 90),
  c(17, 'pump', 340, 226, 90, { feature: 'htr', dhw: 'any' }),
  c(22, 'valve', 340, 256, 0, { feature: 'htr', dhw: 'any' }),
  c(25, 'drain_valve', 340, 318, 0, { feature: 'htr', dhw: 'any' }),
  c(26, 'valve3', 270, 172, 270, { dhw: 'any', unusedMuted: true }),
  c(27, 'valve3', 350, 416, 0, { feature: 'passive_cooling' }),
  c(28, 'valve3', 610, 416, 0, { feature: 'passive_cooling' }),
  c(31, 'probe_t', 614, 228, 270),
  c(32, 'probe_t', 674, 228, 270),
  c(33, 'probe_t', 254, 228, 270),
  c(34, 'probe_t', 296, 228, 270),
  c(37, 'transducer_p', 674, 256, 270),
  c(38, 'transducer_p', 296, 256, 270),
  c(44, 'resistor', 270, 320, 90, { feature: 'backup_heater' }),
  c(45, 'thermostat', 286, 282, 90, { feature: 'backup_heater' }),
  // model C's integrated tank (50) with its coil (51, ports where the DHW lines of valve 26 end) and DHW probe (54) on
  // the tank wall
  c(50, 'tank', z.internalTank.x + z.internalTank.width / 2, z.internalTank.y + z.internalTank.height / 2, 0, {
    dhw: 'internal',
  }),
  c(51, 'coil', z.coil51.x, z.coil51.y, 0, { dhw: 'internal' }),
  c(54, 'probe_t', 574, 171, 270, { dhw: 'internal' }),
];

/** Points from text: "x,y x,y ...". */
const parsePoints = (path: string): Point[] =>
  path.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return [x ?? 0, y ?? 0];
  });

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

/** The cabinet's pipe segments (the band's are `bandSegments`). The production trunk (return from ports 2/6 through 27, 15, 8, 44, 33 and 26) serves DG1 and DHW. */
const cabinetSegments = (): readonly Segment[] => [
  // production: ports 1 and 2 (the DG1 stubs are 12 units long)
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
  // Internal (model C, items 47-49 on the top edge): short stubs into the tank
  seg('tap_47', ['dhw_coil'], '440,118 440,138', DHWT, { dhw: 'internal', stub: true }),
  seg('tap_48', ['dhw_coil'], '490,138 490,118', DHWT, { dhw: 'internal', stub: true }),
  seg('tap_49', ['dhw_coil'], '540,118 540,138', DHWT, { dhw: 'internal', stub: true }),
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
];

/** The most crossings inside the cabinet (add-schematic-card D5): the manual's figure has 15 (14 hops and the return line behind resistor 44). */
export const MAX_CROSSINGS = 15;

/** The crossings inside the cabinet (add-schematic-card D5): this layout needs 9. */
const CROSSINGS: readonly Crossing[] = [
  { over: 'dhw_sup_a', under: 'p2_in', at: [312, 172] },
  { over: 'dhw_sup_c', under: 'ln3', at: [630, 172] },
  { over: 'dhw_sup_c', under: 'ln4_a', at: [690, 172] },
  { over: 'dhw_ret_c', under: 'ln3', at: [630, 198] },
  { over: 'dhw_ret_c', under: 'ln4_a', at: [690, 198] },
  { over: 'dhw_ret_b', under: 'htr_riser', at: [361, 198] },
  { over: 'trunk', under: 'prod_8_44', at: [312, 348] },
  { over: 'ln3', under: 'br_feed7', at: [630, 348] },
  { over: 'br_10_in', under: 'br_10_28', at: [610, 448] },
];

/**
 * The air coil's points: a serpentine of the vertical passes of the unit's `passes`. It starts on the coil block's bottom face
 * at the first pass, rises, bends over at the top into the next pass, comes down and so on; the number of passes being even,
 * it ends on the bottom face at the last pass.
 */
function airCoilPoints(unit: AirUnitShape): Point[] {
  const { x0, step, count, top, bottom } = unit.passes;
  const face = airFaceY(unit);
  const points: Point[] = [[x0, face]];
  for (let index = 0; index < count; index += 1) {
    const x = x0 + index * step;
    const last = index === count - 1;
    if (index % 2 === 0) {
      points.push([x, top]);
      if (!last) points.push([x + step, top]);
    } else {
      points.push(last ? [x, face] : [x, bottom]);
      if (!last) points.push([x + step, bottom]);
    }
  }
  return points;
}

/** The pieces of the collector's serpentine as point lists: the first half, the second half, the exit's start. */
function collectorPoints(collector: CollectorShape): { down: Point[]; up: Point[] } {
  const { left, right } = collector.passes;
  const [y1, y2, y3, y4] = collectorPassYs(collector);
  if (y1 === undefined || y2 === undefined || y3 === undefined || y4 === undefined) throw new Error('four passes');
  const face = collector.y + collector.height;
  const middle = (y2 + y3) / 2;
  return {
    down: [
      [collector.feedX, face],
      [collector.feedX, y1],
      [right, y1],
      [right, y2],
      [left, y2],
      [left, middle],
    ],
    up: [
      [left, middle],
      [left, y3],
      [right, y3],
      [right, y4],
      [left, y4],
    ],
  };
}

/** A polyline without repeated points (a jog of length 0 leaves none). */
const route = (...points: Point[]): Point[] =>
  points.filter((point, index) => index === 0 || !same(point, points[index - 1] ?? point));

/**
 * The pipes of the band (rework-layouts D3): the external tank's and the source's, each rising from its port in the join lane,
 * with at most one horizontal jog, into its part. Authored in the arrangement's own units from the zones.
 *
 * The jogs' heights keep the pipes apart: port 3's pipe jogs lowest (`jog.out`), port 4's above it (`jog.in`), the hybrid's link
 * highest (`jog.link`), so a vertical never meets a horizontal. The external tank is joined with a mirrored helix: port 5 (the
 * left one) reaches the coil's upper left end through the column left of the coil, port 6 the coil's lower right end through
 * the column right of it, so the two do not cross. The air unit and the collector are entered and left on their bottom faces.
 */
function bandSegments(z: Zones): readonly Segment[] {
  const { ports, cabinet, key } = z;
  const top = cabinet.y;
  const tank = z.externalCoil;
  const level = bandJogs(top);
  const segments: Segment[] = [];
  if (key.tank && tank !== undefined) {
    const start: Point = [tank.cx - tank.rx, tank.top];
    const end: Point = [tank.cx + tank.rx, tank.bottom];
    segments.push(
      seg(
        'dhw_ext_in',
        ['dhw_coil'],
        line(...route([ports[5], top], [ports[5], level.tank], [tank.inX, level.tank], [tank.inX, tank.top], start)),
        OUT,
        {
          dhw: 'external',
          speedRole: PP,
        },
      ),
      seg('dhw_ext_coil', ['dhw_coil'], line(start, end), OUT, {
        dhw: 'external',
        speedRole: PP,
        shape: {
          kind: 'helix',
          cx: tank.cx,
          top: tank.top,
          bottom: tank.bottom,
          rx: tank.rx,
          turns: 4.5,
          mirror: true,
        },
      }),
      seg(
        'dhw_ext_out',
        ['dhw_coil'],
        line(...route(end, [tank.outX, tank.bottom], [tank.outX, level.tank], [ports[6], level.tank], [ports[6], top])),
        RET,
        {
          dhw: 'external',
          speedRole: PP,
        },
      ),
    );
  }
  // the source: port 3 (brine out) rises to its jog and on into the part, the part's exit comes down to port 4's jog (brine in)
  segments.push(
    seg('src_out', ['brine'], line([ports[3], top], [ports[3], level.out]), BOUT, { speedRole: BP }),
    seg('src_in', ['brine'], line([ports[4], level.in], [ports[4], top]), BIN, { speedRole: BP }),
  );
  const { airUnit: air, collector } = z;
  const from3 = (x: number, faceY: number): string => line(...route([ports[3], level.out], [x, level.out], [x, faceY]));
  const to4 = (x: number, fromY: number): string => line(...route([x, fromY], [x, level.in], [ports[4], level.in]));
  if (key.source === 'air' && air !== undefined) {
    const { feed, exit } = airPortX(air);
    segments.push(
      seg('src_air_feed', ['brine'], from3(feed, airFaceY(air)), BOUT, { source: ['air'], speedRole: BP }),
      seg('src_air_coil', ['brine'], line(...airCoilPoints(air)), BOUT, {
        source: ['air'],
        speedRole: BP,
        bend: air.passes.step / 2,
      }),
      seg('src_air_exit', ['brine'], to4(exit, airFaceY(air)), AIRO, { source: ['air'], speedRole: BP }),
    );
  }
  if (key.source === 'ground' && collector !== undefined) {
    const { down, up } = collectorPoints(collector);
    const bend = collector.passes.step / 2;
    segments.push(
      seg('src_gnd_feed', ['brine'], from3(collector.feedX, collector.y + collector.height), BOUT, {
        source: ['ground'],
        speedRole: BP,
      }),
      seg('src_gnd_down', ['brine'], line(...down), BOUT, { source: ['ground'], speedRole: BP, roundEnd: true, bend }),
      seg('src_gnd_up', ['brine'], line(...up), BIN, { source: ['ground'], speedRole: BP, bend }),
      seg('src_gnd_exit', ['brine'], to4(collector.passes.left, collectorPassYs(collector)[3] ?? 0), BIN, {
        source: ['ground'],
        speedRole: BP,
      }),
    );
  }
  if (key.source === 'hybrid' && air !== undefined && collector !== undefined) {
    const { feed, exit } = airPortX(air);
    const { down, up } = collectorPoints(collector);
    const bend = collector.passes.step / 2;
    segments.push(
      seg('src_hyb_feed', ['brine'], from3(feed, airFaceY(air)), BOUT, { source: ['hybrid'], speedRole: BP }),
      seg('src_hyb_coil', ['brine'], line(...airCoilPoints(air)), BOUT, {
        source: ['hybrid'],
        speedRole: BP,
        bend: air.passes.step / 2,
      }),
      seg(
        'src_hyb_link',
        ['brine'],
        line(
          [exit, airFaceY(air)],
          [exit, level.link],
          [collector.feedX, level.link],
          [collector.feedX, collector.y + collector.height],
        ),
        AIRO,
        { source: ['hybrid'], speedRole: BP },
      ),
      seg('src_hyb_down', ['brine'], line(...down), AIRO, { source: ['hybrid'], speedRole: BP, roundEnd: true, bend }),
      seg('src_hyb_up', ['brine'], line(...up), BIN, { source: ['hybrid'], speedRole: BP, bend }),
      seg('src_hyb_exit', ['brine'], to4(collector.passes.left, collectorPassYs(collector)[3] ?? 0), BIN, {
        source: ['hybrid'],
        speedRole: BP,
      }),
    );
  }
  return segments;
}

/** What decides which parts are drawn: the DHW storage, the source and the feature states. */
export interface DrawContext {
  /** The model: with `dhw: unused` it decides which tank is drawn (B external, C internal). */
  model: Model;
  dhw: DhwStorage;
  source: Source;
  features: Features;
  /**
   * The arrangement drawn (refine-simplified-layout D1): every consumer reads the coordinates from it. The card sets it
   * from `arrangementFor`; left out, it is the one `arrangementFor('horizontal', bandKeyOf(context))` gives.
   */
  arrangement?: Arrangement;
}

/** Which arrangement a card shows. */
type ArrangementId = 'horizontal';

/** The layout the card shows now (card-config `layout`, resolved): horizontal or vertical. */
export type ShownLayout = 'horizontal' | 'vertical';

/**
 * One complete arrangement of the drawing (refine-simplified-layout D1): the viewBox, the cabinet and the zone constants
 * (`Zones`), the components, segments, crossings and the value labels' placements. Every consumer reads it from the draw context; none reads a module constant.
 */
export type Arrangement = Zones & {
  readonly id: ArrangementId;
  readonly components: readonly Component[];
  readonly segments: readonly Segment[];
  readonly crossings: readonly Crossing[];
  readonly labels: LabelPlaces;
};

// The arrangement (rework-layouts D2, D3): the cabinet's contents are the frame's under a pair of monotone piecewise-linear
// maps, the band above it is placed from the maps' ports.

/** A monotone piecewise-linear map of one axis: breakpoints `[from, to]` in the frame's units, ascending. Beyond the first and the last it keeps their offset (slope 1). */
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
 * The horizontal layout's x map (rework-layouts D2): the cabinet grows from 520 to 980 units (x 240-760 becomes 10-990), so it
 * fills the drawing's width, and the room goes to the lanes between the slope-1 spans, where the values sit beside their probes
 * and pipes. Slope 1 over every span a symbol's ports cover (a symbol keeps its size, so the pipes that end on its ports keep
 * their distance): the probe 33 body and stem (245-270), thermostat 45 (270-286), probes 34/38 and their stems (287-312), the
 * valves, pumps and exchangers of the HTR column (312-397), the refrigerant row (416-452 and 473-539, around the stretch
 * below), exchanger 7 with probes 35 and 54 (560-590), valve 28 and probe 31 (598-630), probe 32 and pump 16 with their stems
 * (665-690). The 460 extra units go to:
 * - 240-245, +95: production Out beside probe 33, left of its body (probe 33 is left of riser 270).
 * - 286-287, +90: production In and the production pressure left of probes 34 and 38, between riser 270 and their bodies; the
 *   thermostat at 286 keeps its stem on the riser, so the lane starts right of it.
 * - 312-338, +10: the lane before the HTR column.
 * - 397-416, +8: the lane before exchanger 8, as before.
 * - 452-473, +24: the lane between transducer 36 and filter dryer 13 / compressor 11 (only pipes cross it), so that the
 *   discharge value block (temperature over pressure, up to 50 units wide at the threshold) clears the compressor.
 * - 539-560, +10: the core of the refrigerant circuit, as before.
 * - 590-598, +4: as before.
 * - 630-665, +70: brine Out and the brine pressure and pump values, right of riser 630, left of probes 32 and 37.
 * - 690-722, +77 and 722-748, +14 and 748-760, +58: ports 5 and 6 and the right edge: they take the external tank's slot
 *   (width 160) to the right of the source's, so that the hybrid source and the tank fit side by side in the band, and the
 *   lane right of the brine inlet riser holds the brine In value.
 * Left of 240 and right of 760 the map keeps its offset.
 */
export const HORIZONTAL_MAP_X: AxisMap = [
  [240, 10],
  [245, 110],
  [286, 151],
  [287, 242],
  [312, 267],
  [338, 303],
  [397, 362],
  [416, 389],
  [452, 425],
  [473, 470],
  [496, 493],
  [539, 536],
  [560, 567],
  [590, 597],
  [598, 609],
  [630, 641],
  [665, 746],
  [690, 771],
  [722, 880],
  [748, 920],
  [760, 990],
];

/**
 * The horizontal layout's y map: a shift that puts the cabinet's top edge under the band (the band's height plus the join lane),
 * with no stretch. Every drawn part of the frame lies above y 505 (exchanger 10's body is the lowest, to y 501); the part of the
 * frame below it held only parts that are no longer drawn (vessels, safety and drain valves), so the cabinet's bottom edge moves
 * from y 605 up to y 530, and the viewBox's height follows. The rows inside need no stretch: the maps' room is in x, where the
 * labels sit beside the pipes.
 */
export const HORIZONTAL_MAP_Y: AxisMap = [
  [130, BAND.top + BAND.height + BAND.joinLane],
  [505, BAND.top + BAND.height + BAND.joinLane + 375],
];

const mapX = (x: number): number => mapAxis(HORIZONTAL_MAP_X, x);
const mapY = (y: number): number => mapAxis(HORIZONTAL_MAP_Y, y);

/** The heights of the horizontal jogs in the join lane, from the cabinet's top edge. */
export const bandJogs = (top: number): { out: number; in: number; link: number; tank: number } => ({
  out: top - BAND.jog.out,
  in: top - BAND.jog.in,
  link: top - BAND.jog.link,
  tank: top - BAND.jog.tank,
});

/** The band's key for a draw context: the source, whether the external tank is drawn, and whether the emitter is. */
export const bandKeyOf = (context: Pick<DrawContext, 'model' | 'dhw' | 'source'>): BandKey => ({
  source: context.source,
  tank: drawnStorage(context) === 'external',
  emitter: BAND.emitterWidth > 0,
});

/** The widest band: the hybrid source with the tank and the emitter; `arrangementFor` without a key. */
const WIDEST_KEY: BandKey = { source: 'hybrid', tank: true, emitter: BAND.emitterWidth > 0 };

const CABINET_ZONES: CabinetZones = (() => {
  const cabinet: Rect = {
    x: mapX(FRAME_CABINET.x),
    y: mapY(FRAME_CABINET.y),
    width: mapX(FRAME_CABINET.x + FRAME_CABINET.width) - mapX(FRAME_CABINET.x),
    // the cabinet's bottom edge: the frame's 605 moves up to 530 (see HORIZONTAL_MAP_Y)
    height: 400,
  };
  const tank = FRAME_ZONES.internalTank;
  return {
    viewBox: { width: 1000, height: cabinet.y + cabinet.height + 15 },
    cabinet,
    internalTank: {
      x: mapX(tank.x),
      y: mapY(tank.y),
      width: round2(mapX(tank.x + tank.width) - mapX(tank.x)),
      height: tank.height,
    },
    // coil 51's supply port is where the mapped DHW line of valve 26 ends (frame x 420), whatever the maps stretch in between
    coil51: { x: mapX(FRAME_ZONES.coil51.x - 75) + 75, y: mapY(FRAME_ZONES.coil51.y) },
  };
})();

/** The band's parts placed for a key: the slots from the ports (rework-layouts D3), the bodies in them. */
function bandZonesFor(key: BandKey, cabinet: CabinetZones): BandZones {
  const top = cabinet.cabinet.y;
  const bottom = top - BAND.joinLane;
  const ports = { 3: mapX(630), 4: mapX(690), 5: mapX(722), 6: mapX(748) } as const;
  const slots = planBand(
    [
      { name: 'emitter', centre: (mapX(270) + mapX(312)) / 2, width: key.emitter ? BAND.emitterWidth : 0 },
      { name: 'source', centre: (ports[3] + ports[4]) / 2, width: sourceWidth(key.source) },
      { name: 'tank', centre: (ports[5] + ports[6]) / 2, width: key.tank ? BAND.tank.width : 0 },
    ],
    { min: cabinet.cabinet.x, max: cabinet.cabinet.x + cabinet.cabinet.width },
    BAND.gap,
  );
  const source = slots.source;
  const air = key.source === 'ground' || source === undefined ? undefined : airUnitShape(source.x0, bottom);
  const collectorX =
    source === undefined ? 0 : key.source === 'hybrid' ? source.x0 + BAND.air.width + BAND.hybridGap : source.x0;
  const collector = key.source === 'air' || source === undefined ? undefined : collectorShape(collectorX, bottom);
  const tankSlot = slots.tank;
  const tankShape: TankShape | undefined =
    tankSlot === undefined
      ? undefined
      : {
          x: tankSlot.x0,
          y: bottom - BAND.tank.height,
          width: BAND.tank.width,
          height: BAND.tank.height,
          dome: BAND.tank.dome,
        };
  const coil: ExternalCoil | undefined =
    tankShape === undefined
      ? undefined
      : {
          cx: tankShape.x + tankShape.width / 2,
          top: tankShape.y + 78,
          bottom: tankShape.y + 140,
          rx: 38,
          inX: tankShape.x + tankShape.width / 2 - 38 - 12,
          outX: tankShape.x + tankShape.width / 2 + 38 + 12,
        };
  return {
    key,
    band: { top: bottom - BAND.height, bottom },
    ports,
    slots,
    ...(air === undefined ? {} : { airUnit: air }),
    ...(collector === undefined ? {} : { collector }),
    ...(tankShape === undefined ? {} : { externalTank: tankShape }),
    ...(coil === undefined ? {} : { externalCoil: coil }),
  };
}

const ARRANGEMENTS = new Map<string, Arrangement>();

function buildArrangement(key: BandKey): Arrangement {
  const zones: Zones = { ...CABINET_ZONES, ...bandZonesFor(key, CABINET_ZONES) };
  const place = (x: number, y: number): readonly [number, number] => [mapX(x), mapY(y)];
  const components = componentsFor(zones).map((part): Component => {
    if (part.item === 50 || part.item === 51) return part;
    return { ...part, x: mapX(part.x), y: mapY(part.y) };
  });
  const cabinet = cabinetSegments().map((part): Segment => ({
    ...part,
    points: part.points.map(([x, y]): Point => [mapX(x), mapY(y)]),
  }));
  const segments = [...cabinet, ...bandSegments(zones)];
  const crossings = CROSSINGS.map((crossing): Crossing => ({
    ...crossing,
    at: place(crossing.at[0], crossing.at[1]),
  }));
  const labels = labelPlacesFor(zones, place);
  return {
    ...zones,
    id: 'horizontal',
    components,
    segments,
    crossings,
    labels: {
      specs: labels.specs.map((spec) => {
        const own = HORIZONTAL_PLACES[spec.id]?.at(zones, place);
        return own === undefined ? spec : { ...spec, ...own };
      }),
    },
  };
}

/**
 * The manual-figure frame the arrangement is mapped from (rework-layouts D1): its zones, the cabinet's lists, crossings and
 * default label places. Not drawn by any layout; the tests of the maps (test/diagram/simplified.test.ts) compare the arrangement with it.
 */
export const FRAME = {
  zones: FRAME_ZONES,
  components: componentsFor(FRAME_ZONES),
  segments: cabinetSegments(),
  crossings: CROSSINGS,
  labels: labelPlacesFor(FRAME_ZONES),
};

/**
 * The arrangement of a shown layout and band key: a pure function of them (rework-layouts D2, D3), built once per key. Until the
 * vertical arrangement is built (the vertical arrangement), both layouts draw the same one. Without a key, the widest band's.
 */
export function arrangementFor(layout: ShownLayout, key: BandKey = WIDEST_KEY): Arrangement {
  // until the vertical arrangement is built both layouts share it
  const id = `${layout === 'vertical' ? 'horizontal' : layout}|${key.source}|${String(key.tank)}|${String(key.emitter)}`;
  const known = ARRANGEMENTS.get(id);
  if (known !== undefined) return known;
  const built = buildArrangement(key);
  ARRANGEMENTS.set(id, built);
  return built;
}

/**
 * The labels' places of a layout before `HORIZONTAL_PLACES` applies: the default places under the maps. The place search
 * (scripts/search-places.mjs) measures each label's distance from these, never from a recorded place, so a rerun does not
 * depend on the table it replaces.
 */
export function defaultLabelPlaces(layout: ShownLayout): LabelPlaces {
  switch (layout) {
    case 'horizontal':
    case 'vertical':
      return labelPlacesFor({ ...CABINET_ZONES, ...bandZonesFor(WIDEST_KEY, CABINET_ZONES) }, (x, y) => [
        mapX(x),
        mapY(y),
      ]);
  }
}

/** The arrangement a draw context carries, or, without one, the horizontal layout's for its band key. */
export const arrangementOf = (
  context: Partial<Pick<DrawContext, 'arrangement' | 'model' | 'dhw' | 'source'>>,
): Arrangement =>
  context.arrangement ??
  (context.model === undefined || context.dhw === undefined || context.source === undefined
    ? arrangementFor('horizontal')
    : arrangementFor('horizontal', bandKeyOf({ model: context.model, dhw: context.dhw, source: context.source })));

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
  thermostat: 16,
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
    case 'thermostat':
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
    const [rightEnd, leftEnd] =
      shape.mirror === true ? [shape.cx - shape.rx, shape.cx + shape.rx] : [shape.cx + shape.rx, shape.cx - shape.rx];
    const [from, to] = front ? [rightEnd, leftEnd] : [leftEnd, rightEnd];
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
