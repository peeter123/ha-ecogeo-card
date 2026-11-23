// The drawing's geometry as data (add-schematic-card D5, rework-layouts D1-D3): the viewBox, the ports on the top edge, every
// component and every pipe segment, laid out after the manual's B4 figure (manual-figure, section 3.1, page 34) and, for
// model C, figure C (items 47-54, the integrated tank). The topology and the item numbers are the figures'; the coordinates
// are re-laid out for legibility. Besides the cabinet's own pipes the segments include the pipes of the outer-loop source and of
// the external DHW tank, which lie in the band above the cabinet, and the stubs of connections 47-49. No Lit here: this file is
// data plus small pure helpers that the renderer and the integrity tests share.
//
// The cabinet's component and segment lists are authored once, in the cabinet frame (rework-layouts D1): 720 units wide and 520
// tall, its top edge at y 0, the parts in rows and columns with lanes between them (`ROW_LANES`, `COLUMN_LANES`, where the cabinet's
// values sit). The frame keeps the figures' topology (the port order, the order of the parts along every pipe, the probe and HTR
// placements, the pairs, the transducers on their lines, the crossings as hops) and the item numbers, not their coordinates. The
// two drawn arrangements (`arrangementFor`: the horizontal layout's and the vertical one's) map the
// frame to their own units (rework-layouts D2). Only the parts the drawing shows are in the lists: the service and safety parts of
// the figure (items 18-21, 23-25, 39-41, 52, 53) are not drawn. Ports 1-6 sit on the cabinet's top edge in the manual's order.
// Inside, from the top: the DHW supply and return lines of valve 26, the probe row, the compressor row with the discharge line
// that runs along it and down through HTR exchanger 9 to inversion valve 14, condenser 8 and evaporator 7, the valve 27 / pump 15 /
// valve 28 row and exchanger 10 (the rows and their y are on `ROW`).
//
// Above the cabinet lies the band (rework-layouts D3): a strip with three slots, left to right the emitter (over ports 1/2),
// the outer-loop source (over 3/4) and the external DHW tank (over 5/6), and, between the band and the cabinet's top edge,
// the join lane that holds the short pipes from the ports into the parts. None of the band's parts is a manual item: the
// manual's figures stop at the connections; the air unit, the ground collector, the external tank and the emitter are the
// card's own drawings of what the connections lead to (the tank is the "DHW inter-accumulator" of ports 5/6, the emitter
// is the heating installation on ports 1/2, outside the unit).
//
// Pipe points run in the direction of the flow in heating (`direction` 1) so that the renderer can animate them.
import type { CircuitId, Circuits } from '../calc/circuits';
import type { DhwStorage, Emitter, Model, Source } from '../config/options';
import type { RolePath } from '../config/roles';
import type { FeatureKey, Features } from '../config/variants';
import {
  HORIZONTAL_PLACES,
  VERTICAL_PLACES,
  labelPlacesFor,
  type LabelPlaces,
  type PlaceOverride,
} from './label-places';

/** A rectangle in viewBox units. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/**
 * The air unit (not a manual item): the front view of an outdoor unit (harmonize-band D4), a case on two feet. Its coil panel
 * stands on the left, with the horizontal fins and the brine serpentine of vertical passes, which enters and leaves on the
 * panel's bottom face (`passes.x0` and the last pass), so that both pipes arrive from the join lane below. The fan is right of
 * it, behind a static guard; the three values (the outside temperature above the fan, the fan speed below it, the Out beside
 * the exit pass) sit in the obstacle-free boxes of `values`.
 */
export interface AirUnitShape extends Rect {
  readonly fan: { readonly cx: number; readonly cy: number; readonly radius: number };
  /** The case: the body's outline, from the top down to the height of the feet above the band's bottom edge. */
  readonly body: Rect;
  /** The two feet under the case; their bottoms lie on the band's bottom edge, clear of the brine pipes' columns. */
  readonly feet: readonly Rect[];
  /** The coil panel's frame; its bottom edge is the face the brine pipes use. */
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
  /** The free boxes of the three values: the outside temperature above the fan, the fan speed below it, the Out beside the exit pass. */
  readonly values: { readonly outside: Rect; readonly speed: Rect; readonly out: Rect };
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

/**
 * The heat emitter on connections 1/2 (rework-layouts D5; not a manual item: it is outside the unit): an underfloor loop (a
 * bifilar spiral in a floor body) or a radiator (a panel with vertical columns). The supply pipe runs from connection 1 to
 * `inlet` and the return pipe from `outlet` to connection 2, rising through the body's bottom face at `feedX` and `exitX`.
 */
export interface EmitterShape extends Rect {
  readonly kind: Exclude<Emitter, 'none'>;
  /** The x of the supply and return pipes on the bottom face. */
  readonly feedX: number;
  readonly exitX: number;
  /** Where the supply pipe ends (the spiral's start on the bottom face, the radiator's top left) and the return pipe starts (the spiral's end on the bottom face, the radiator's bottom right). */
  readonly inlet: Point;
  readonly outlet: Point;
  /** The spiral's inward run, from the inlet to the middle of its reversal (empty for a radiator): the supply colour. */
  readonly loopIn: readonly Point[];
  /** The spiral's outward run, from the middle of its reversal to the outlet (empty for a radiator): the return colour. */
  readonly loopOut: readonly Point[];
  /** The distance between adjacent runs of the spiral, twice the radius of its bends (0 for a radiator). */
  readonly pitch: number;
  /** The radiator's columns (empty for an underfloor loop). */
  readonly columns: readonly Rect[];
}

/** The external tank's cylinder: a domed top, straight walls and a flat bottom. */
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

/** What decides the band's slots: the source, whether the external tank is drawn and the emitter (an empty slot gives its space away). */
export interface BandKey {
  readonly source: Source;
  readonly tank: boolean;
  /** The emitter: its kind, or `none` for no emitter (an empty slot; the stubs of connections 1/2). */
  readonly emitter: Emitter;
  /** Whether tank 50 is drawn (model C with internal storage, muted or not): only then does the vertical y map stretch its head. */
  readonly internal?: boolean;
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
  /**
   * How much lower the cabinet's parts lie than in the arrangement without tank 50's head stretch (`VERTICAL_TANK_HEAD`): 0, or
   * the stretch in the vertical layout where tank 50 is drawn. A recorded place of the vertical layout is a place of the arrangement
   * without the stretch; `PlaceOverride.at` adds this to reach the same spot beside its part with the stretch.
   */
  readonly headShift: number;
}

/** The band's parts, placed for one `BandKey`. */
export interface BandZones {
  readonly key: BandKey;
  /** The band: its top and its bottom, where every body's bottom edge lies. The join lane runs from the bottom to the cabinet's top edge. */
  readonly band: { readonly top: number; readonly bottom: number };
  /** The x of connections 1-6 on the cabinet's top edge. */
  readonly ports: Readonly<Record<1 | 2 | 3 | 4 | 5 | 6, number>>;
  /** The slots that are filled (a slot of an absent part is not there). */
  readonly slots: Readonly<Partial<Record<BandSlotName, Slot>>>;
  readonly emitter?: EmitterShape;
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
  height: 176,
  /** The top of the band, below the viewBox's top margin. */
  top: 6,
  /** The join lane between the band's bottom and the cabinet's top edge. */
  joinLane: 56,
  /** The smallest gap between two slots. */
  gap: 24,
  /** The style every body shares (harmonize-band D1): the corner radius of its outline, and the inset of its inner parts. */
  radius: 6,
  margin: 8,
  air: { width: 190, height: 176 },
  collector: { width: 120, height: 176 },
  /** The gap between the air unit and the collector of the hybrid. */
  hybridGap: 12,
  tank: { width: 160, height: 176, dome: 14 },
  /** The emitter's body: both kinds share the slot's width; the bottom pipes rise 34 units inside each side. */
  emitter: { width: 180, height: 176 },
} as const;

/**
 * The jogs' distances above the cabinet's top edge, per layout: port 3's pipe jogs lowest, port 4's above it, the hybrid's link
 * highest, so a vertical never meets a horizontal. The horizontal layout stretches the cabinet so that port 4 (x 827) lies left of
 * the tank's slot and the tank's jog (28) is free to be lower than port 4's. In the vertical layout the frame is not stretched: the
 * widest band fills the 720 units, the tank's slot (x 570-730) covers port 4 (x 607), and the tank's pipe from port 5 runs left to its
 * coil's inlet (x 600) over port 4's riser, so the tank's jog (40) lies above port 4's (34): port 4's riser ends below it and
 * the two pipes do not cross. Both stay below the link (46) and above the stubs of connections 47-49 (12).
 */
export const BAND_JOGS: Readonly<Record<ShownLayout, { out: number; in: number; link: number; tank: number }>> = {
  horizontal: { out: 22, in: 34, link: 46, tank: 28 },
  vertical: { out: 22, in: 34, link: 46, tank: 40 },
};

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

/** The height of the air unit's feet, which is also the gap between its case and the band's bottom edge. */
const AIR_FOOT_HEIGHT = 8;

/** The air fan's ring radius (harmonize-band D4: about 40; the first fallback is 34). */
const AIR_FAN_RADIUS = 40;

/** The air unit placed with its left edge at `x0` and its bottom edge at `bottom`. */
export function airUnitShape(x0: number, bottom: number): AirUnitShape {
  const { width, height } = BAND.air;
  const y = bottom - height;
  const m = BAND.margin;
  // the panel starts under the outside temperature, which is wider than the fan at its widest ("-12.3 °C" at 320 px)
  const coil: Rect = { x: x0 + m, y: y + 36, width: 64, height: 120 };
  const fanX = x0 + width * 0.62;
  const fanY = y + 74;
  const valueWidth = 128;
  return {
    x: x0,
    y,
    width,
    height,
    fan: { cx: fanX, cy: fanY, radius: AIR_FAN_RADIUS },
    // the case ends one foot's height above the band's bottom edge (the brine pipes cross the gap into the coil panel's bottom
    // face); the feet stand on that edge, under the coil panel and under the fan, clear of the pipe columns
    body: { x: x0, y, width, height: height - AIR_FOOT_HEIGHT },
    feet: [x0 + 24, x0 + 138].map((x) => ({ x, y: bottom - AIR_FOOT_HEIGHT, width: 24, height: AIR_FOOT_HEIGHT })),
    coil,
    fins: { x0: coil.x + 4, x1: coil.x + coil.width - 4, y0: coil.y + 10, step: 10, count: 11 },
    passes: { x0: coil.x + 10, step: 14, count: 4, top: coil.y + 14, bottom: coil.y + 100 },
    values: {
      outside: { x: fanX - valueWidth / 2, y: y + 4, width: valueWidth, height: 28 },
      speed: { x: fanX - valueWidth / 2, y: fanY + AIR_FAN_RADIUS + 2, width: valueWidth, height: 24 },
      out: { x: coil.x + coil.width + 6, y: y + 140, width: width - 2 * m - coil.width - 6, height: 24 },
    },
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
    strip: { x: x0 + BAND.margin, y: y + 18, width: width - 2 * BAND.margin, height: 24 },
    serpentine: { x: x0 + BAND.margin, y: y + 48, width: width - 2 * BAND.margin, height: height - 48 },
    passes: { y0: y + 54, step: 30, count: 4, left: x0 + 34, right: x0 + width - 14 },
    feedX: x0 + 14,
  };
}

/** The stub length of connections 1/2 without an emitter. */
export const STUB_LENGTH = 12;

/** The spiral's pitch (heating-emitter: at least 12 units, so the turns stay apart at 320 px) and its number of inward turns. */
const UNDERFLOOR = { pitch: 14, turns: 3 } as const;
const RADIATOR = { count: 6, width: 10, gap: 8, top: 52, bottom: 168, inletY: 62, outletY: 158 } as const;

/**
 * The underfloor spiral (heating-emitter "Underfloor loop drawing"): a rectangular bifilar spiral inside the body, at the band's
 * margin. Both ends are on the bottom face, side by side at the body's centre, one pitch apart. The inward run turns left along
 * the bottom and then winds clockwise towards the centre, each turn one pair of pitches inside the last. The outward run lies one
 * pitch inside it (the same corners, inset by the pitch), so adjacent runs alternate between the two. In the last turn the inward
 * run's top reaches over to the reversal, where the outward run, one pitch below it, starts back: the two meet in a half circle
 * (every bend takes half the pitch as its radius). The runs are split at the middle of that half circle.
 */
function underfloorLoop(x0: number, y: number): { loopIn: Point[]; loopOut: Point[]; feedX: number; exitX: number } {
  const { width, height } = BAND.emitter;
  const pitch = UNDERFLOOR.pitch;
  const face = y + height;
  const turn = (k: number): { l: number; r: number; t: number; b: number } => ({
    l: x0 + BAND.margin + 2 * pitch * k,
    r: x0 + width - BAND.margin - 2 * pitch * k,
    t: y + BAND.margin + 2 * pitch * k,
    b: face - BAND.margin - 2 * pitch * k,
  });
  const feedX = x0 + width / 2 - pitch / 2;
  const exitX = x0 + width / 2 + pitch / 2;
  const inward: Point[] = [
    [feedX, face],
    [feedX, turn(0).b],
  ];
  const outward: Point[] = [
    [exitX, face],
    [exitX, turn(0).b - pitch],
  ];
  for (let k = 0; k < UNDERFLOOR.turns; k += 1) {
    const now = turn(k);
    inward.push([now.l, now.b], [now.l, now.t], [now.r, now.t]);
    outward.push([now.l + pitch, now.b - pitch], [now.l + pitch, now.t + pitch]);
    if (k < UNDERFLOOR.turns - 1) {
      const next = turn(k + 1);
      inward.push([now.r, next.b]);
      outward.push([now.r - pitch, now.t + pitch], [now.r - pitch, next.b - pitch]);
    } else {
      outward.push([now.r, now.t + pitch]);
    }
  }
  const last = turn(UNDERFLOOR.turns - 1);
  const reversal: Point = [last.r, last.t + pitch / 2];
  return { loopIn: [...inward, reversal], loopOut: [reversal, ...outward.reverse()], feedX, exitX };
}

/** The emitter placed with its left edge at `x0` and its bottom edge at `bottom`. */
export function emitterShape(kind: EmitterShape['kind'], x0: number, bottom: number): EmitterShape {
  const { width, height } = BAND.emitter;
  const y = bottom - height;
  const base = { kind, x: x0, y, width, height } as const;
  if (kind === 'underfloor') {
    const { loopIn, loopOut, feedX, exitX } = underfloorLoop(x0, y);
    return {
      ...base,
      feedX,
      exitX,
      inlet: [feedX, bottom],
      outlet: [exitX, bottom],
      loopIn,
      loopOut,
      pitch: UNDERFLOOR.pitch,
      columns: [],
    };
  }
  const feedX = x0 + 34;
  const exitX = x0 + width - 34;
  const span = RADIATOR.count * RADIATOR.width + (RADIATOR.count - 1) * RADIATOR.gap;
  const first = x0 + (width - span) / 2;
  const columns = Array.from({ length: RADIATOR.count }, (_, index): Rect => ({
    x: first + index * (RADIATOR.width + RADIATOR.gap),
    y: y + RADIATOR.top,
    width: RADIATOR.width,
    height: RADIATOR.bottom - RADIATOR.top,
  }));
  return {
    ...base,
    feedX,
    exitX,
    inlet: [first, y + RADIATOR.inletY],
    outlet: [first + span, y + RADIATOR.outletY],
    loopIn: [],
    loopOut: [],
    pitch: 0,
    columns,
  };
}

/** The x of the air unit's brine pipes on its coil panel's bottom face: the feed (first pass) and the exit (last pass). */
export const airPortX = (unit: AirUnitShape): { feed: number; exit: number } => ({
  feed: unit.passes.x0,
  exit: unit.passes.x0 + (unit.passes.count - 1) * unit.passes.step,
});

/** The y of the air unit's brine face, the coil panel's bottom edge. */
export const airFaceY = (unit: AirUnitShape): number => unit.coil.y + unit.coil.height;

/** The y of the collector's passes, in order. */
export const collectorPassYs = (collector: CollectorShape): number[] =>
  Array.from({ length: collector.passes.count }, (_, index) => collector.passes.y0 + index * collector.passes.step);

/** The outline of the external tank's body (domed top, straight walls, flat bottom), as path data. */
export function externalTankBody({ externalTank }: Pick<BandZones, 'externalTank'>): string {
  if (externalTank === undefined) return '';
  const { x, y, width, height, dome } = externalTank;
  const rx = width / 2;
  const r = BAND.radius;
  const bottom = y + height;
  // the domed top, straight walls, and a flat bottom on the band's bottom edge with corners of the band radius
  return `M${String(x)} ${String(y + dome)} A${String(rx)} ${String(dome)} 0 0 1 ${String(x + width)} ${String(y + dome)} V${String(bottom - r)} A${String(r)} ${String(r)} 0 0 1 ${String(x + width - r)} ${String(bottom)} H${String(x + r)} A${String(r)} ${String(r)} 0 0 1 ${String(x)} ${String(bottom - r)} Z`;
}

/** Coil 51's ports in its local frame: supply first, return second. The symbol's port stubs end on their y values; the symbol keeps this size in every arrangement. */
export const COIL_LOCAL_PORTS: readonly [readonly [number, number], readonly [number, number]] = [
  [-75, -13],
  [-75, 13],
];

/** The cabinet frame (rework-layouts D1): the cabinet is 720 units wide, the width of the widest band, and 520 units tall, its top edge at y 0. */
const FRAME_CABINET = { x: 0, y: 0, width: 720, height: 520 } as const;

/**
 * The cabinet frame's zones: the coordinates the cabinet's component and segment lists are authored in (rework-layouts D1). The
 * topology and the item numbers are the manual's figures (B4 and C); the coordinates are the card's own, because the figures'
 * parts leave no y range free in every column. The arrangements derive from it by axis maps (D2) and `FRAME` lets the tests
 * compare the two. Model C's tank 50 spans the one free stretch of columns wide enough for it (x 358-532, between the lanes at
 * 318-358 and 542-572).
 */
const FRAME_ZONES: CabinetZones = {
  viewBox: { width: 720, height: 520 },
  cabinet: FRAME_CABINET,
  internalTank: { x: 358, y: 8, width: 174, height: 66 },
  coil51: { x: 439, y: 55 },
  headShift: 0,
};

/**
 * One lane of the cabinet frame (schematic-drawing "Cabinet layout with value lanes"): a strip across the whole cabinet that no
 * part's box enters. A row lane (`axis: 'row'`, a y range) is crossed only by vertical pipes, a column lane (`axis: 'column'`, an
 * x range) only by horizontal ones. `holds` says which values sit in it and why it has its width.
 */
export interface Lane {
  readonly id: string;
  readonly axis: 'row' | 'column';
  readonly from: number;
  readonly to: number;
  readonly holds: string;
}

/**
 * The rows of the frame, top to bottom (y from the cabinet's top edge): A the DHW lines with valve 26 and, for model C, tank 50
 * (8-74); B the probe row with pump 17 (100-124), probes 33, 34, 31, 32 at y 112, the transducers 38 and 37, valve 22 and the
 * compressor row at y 142 with the probe pairs above their lines (117-156); D the exchangers 9, 8, 7 with valve 14, thermostat
 * 45 (y 254) above resistor 44, pump 16 and the production and brine row at y 396 (228-408); F exchanger 10 (444-506). Between
 * the rows lie the row lanes.
 */
export const ROW_LANES: readonly Lane[] = [
  {
    id: 'above-probes',
    axis: 'row',
    from: 76,
    to: 100,
    holds:
      'nothing in either layout: the room between the hot-water lines of row A and the probe row (the horizontal layout narrows it, the vertical layout leaves it as it is)',
  },
  {
    id: 'under-compressor-row',
    axis: 'row',
    from: 156,
    to: 228,
    holds:
      'the discharge and suction blocks (temperature over pressure, two rows) under their pairs 30/36 and 29/35, the compressor speed in a third row under 11, in both layouts (the vertical layout heightens the lane for the three rows)',
  },
  {
    id: 'under-valve-row',
    axis: 'row',
    from: 408,
    to: 444,
    holds: 'the expansion valve opening alone, centred under valve 12 (one row, in both layouts)',
  },
];

/**
 * The columns of the frame: the lanes between the columns of parts. Each is free of parts from the top edge to the bottom; the
 * horizontal arrangement widens them (`HORIZONTAL_MAP_X`).
 */
export const COLUMN_LANES: readonly Lane[] = [
  {
    id: 'left-edge',
    axis: 'column',
    from: 0,
    to: 40,
    holds: "the production outlet value, left of probe 33 (thermostat 45 stands in probe 33's column, lower down)",
  },
  {
    id: 'riser-1',
    axis: 'column',
    from: 77,
    to: 117,
    holds:
      'the production return value and pressure, between valve 26 / riser 1 and probes 34 and 38 (right-aligned to their bodies)',
  },
  {
    id: 'trunk',
    axis: 'column',
    from: 142,
    to: 160,
    holds: 'nothing: the gap between the trunk and the heat-recovery column',
  },
  {
    id: 'before-exchanger-8',
    axis: 'column',
    from: 229,
    to: 269,
    holds: 'the value of pump 15, right of the pump, between the heat-recovery column and exchanger 8 / tank 50',
  },
  {
    id: 'riser-3',
    axis: 'column',
    from: 542,
    to: 572,
    holds: 'the brine outlet value right of riser 3, the brine pressure left of transducer 37 and the value of pump 16',
  },
  { id: 'riser-4', axis: 'column', from: 609, to: 667, holds: 'the brine inlet value, right of riser 4 and pump 16' },
];

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
  /** The radius of the rounded corners of the pipe (the air coil's U-bends and the ground collector's bottom). */
  bend?: number;
  /** The base stroke ends in a round cap: it closes the seam where the ground collector's half circle is split in two segments. */
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

/**
 * The frame's vertical centre line (rework-layouts D1, decided by the user 2026-11-20): compressor 11, filter dryer 13 and exchanger
 * 10 are centred on it, so they read as the middle of the drawing. The horizontal x map keeps it the cabinet's centre (`HORIZONTAL_LANE_EXTRA`).
 */
export const CENTRE = FRAME_CABINET.width / 2;

/**
 * The columns of the cabinet frame (x from the cabinet's left edge) that carry parts and risers. Four risers carry the pipes up to
 * the connections: riser 1 (connection 1, valve 26, resistor 44), riser 2 (connection 2, the production trunk), riser 3
 * (connection 3, the brine outlet) and riser 4 (connection 4, the brine inlet).
 */
const COL = {
  /** The bodies of probe 33 and thermostat 45 (their stems end on riser 1). */
  body1: 49,
  riser1: 65,
  /** The bodies of probes 34 and 38 (their stems end on riser 2). */
  body2: 126,
  riser2: 142,
  /** The HTR water column: pump 17, and valve 22. */
  htr: 172,
  /** Where the HTR water leaves exchanger 9 upwards into the DHW supply line. */
  htrRiser: 193,
  valve27: 182,
  hx9: 205,
  pump15: 217,
  hx8: 289,
  valve14: 287,
  probe30: 287,
  transducer36: 309,
  /** Compressor 11 and filter dryer 13 share a column. */
  compressor: CENTRE,
  probe29: 410,
  transducer35: 432,
  valve12: 412,
  hx10: CENTRE,
  hx7: 457,
  /** The suction line's riser into the compressor row. */
  suction: 495,
  valve28: 522,
  probe31: 526,
  riser3: 542,
  /** The bodies of probe 32 and transducer 37 (their stems end on riser 4). */
  body4: 581,
  riser4: 597,
  port5: 667,
  port6: 707,
  /** Model C's stubs 47-49 on the top edge. */
  tap47: 392,
  tap48: 445,
  tap49: 498,
} as const;

/** The rows of the cabinet frame (y from the cabinet's top edge). */
const ROW = {
  /** The DHW supply and return lines of valve 26. */
  dhwSup: 42,
  dhwRet: 68,
  /** The probe row: probes 33, 34, 31, 32 and pump 17. */
  probe: 112,
  /** The probe pairs 30/36 and 29/35 (their stems end on the compressor row's line). */
  pair: 126,
  /** The transducers 38 and 37, valve 22 and the compressor row: compressor 11, discharge and suction lines. */
  trans: 142,
  /** Exchanger 9's top and bottom ports (the discharge enters at the top, leaves into valve 14 at the bottom) and its centre. */
  hx9Top: 237,
  hx9: 260,
  hx9Bottom: 283,
  /** Valve 14's centre: its left port is on the row of exchanger 9's bottom port. */
  valve14: 283,
  /** Pump 16 on riser 4 and resistor 44 on riser 1. */
  pump16: 298,
  resistor: 300,
  /** Thermostat 45, resistor 44's safety thermostat: on riser 1 right above the resistor, no part between them. */
  thermostat: 254,
  /** The top ports of exchangers 8 and 7, their centre, and the row of their bottom ports (the production and brine lines). */
  hxTop: 328,
  hx: 362,
  line: 396,
  /** Exchanger 10: top ports, centre, bottom ports. */
  hx10Top: 453,
  hx10: 475,
  hx10Bottom: 497,
} as const;

/** Model C's coil ports: the DHW lines of valve 26 end here (coil 51's supply and return ports, symbols.ts). */
const COIL_PORT_X = FRAME_ZONES.coil51.x - 75;

/** Components. Items 1-6 are the ports on the top edge. */
const componentsFor = (z: CabinetZones): readonly Component[] => [
  // ports, left to right in the manual's order
  c(1, 'port', COL.riser1, 0, 0),
  c(2, 'port', COL.riser2, 0, 0),
  c(3, 'port', COL.riser3, 0, 0),
  c(4, 'port', COL.riser4, 0, 0),
  c(5, 'port', COL.port5, 0, 0, { dhw: 'external' }),
  c(6, 'port', COL.port6, 0, 0, { dhw: 'external' }),
  // model C: tap water inlet, DHW outlet and recirculation of the integrated tank, on the top edge
  c(47, 'port', COL.tap47, 0, 0, { dhw: 'internal' }),
  c(48, 'port', COL.tap48, 0, 0, { dhw: 'internal' }),
  c(49, 'port', COL.tap49, 0, 0, { dhw: 'internal' }),
  // refrigerant circuit
  c(7, 'exchanger', COL.hx7, ROW.hx, 0, {
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
  c(8, 'exchanger', COL.hx8, ROW.hx, 0, {
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
  c(9, 'exchanger', COL.hx9, ROW.hx9, 0, {
    size: 23,
    feature: 'htr',
    sides: [
      // HTR water (left): from valve 22 in at the bottom, up the riser into the DHW supply out at the top
      { half: 'left', entering: ['htr_to_9'], leaving: ['htr_riser'], enters: 'bottom' },
      // refrigerant (right): the discharge line passes through, at the discharge temperature at both ends
      { half: 'right', entering: ['ref_discharge'], leaving: ['ref_9_14'], enters: 'top' },
    ],
  }),
  c(11, 'compressor', COL.compressor, ROW.trans, 0),
  c(12, 'expansion_valve', COL.valve12, ROW.line, 0),
  c(13, 'filter_dryer', COL.compressor, ROW.line, 0),
  c(14, 'inversion_valve', COL.valve14, ROW.valve14, 0, { feature: 'active_cooling' }),
  c(29, 'probe_t', COL.probe29, ROW.pair, 0),
  c(30, 'probe_t', COL.probe30, ROW.pair, 0),
  c(35, 'transducer_p', COL.transducer35, ROW.pair, 0),
  c(36, 'transducer_p', COL.transducer36, ROW.pair, 0),
  // hydraulic circuits
  c(10, 'exchanger', COL.hx10, ROW.hx10, 0, {
    size: 22,
    feature: 'passive_cooling',
    sides: [
      // production water (left): in at the bottom, out at the top
      { half: 'left', entering: ['prod_10_in'], leaving: ['prod_10_out'], enters: 'bottom' },
      // brine (right): in at the top, out at the bottom
      { half: 'right', entering: ['br_10_in'], leaving: ['br_10_28'], enters: 'top' },
    ],
  }),
  c(15, 'pump', COL.pump15, ROW.line, 0),
  c(16, 'pump', COL.riser4, ROW.pump16, 90),
  c(17, 'pump', COL.htr, ROW.probe, 90, { feature: 'htr', dhw: 'any' }),
  c(22, 'valve', COL.htr, ROW.trans, 0, { feature: 'htr', dhw: 'any' }),
  c(26, 'valve3', COL.riser1, ROW.dhwSup, 270, { dhw: 'any', unusedMuted: true }),
  c(27, 'valve3', COL.valve27, ROW.line, 0, { feature: 'passive_cooling' }),
  c(28, 'valve3', COL.valve28, ROW.line, 0, { feature: 'passive_cooling' }),
  c(31, 'probe_t', COL.probe31, ROW.probe, 270),
  c(32, 'probe_t', COL.body4, ROW.probe, 270),
  c(33, 'probe_t', COL.body1, ROW.probe, 270),
  c(34, 'probe_t', COL.body2, ROW.probe, 270),
  c(37, 'transducer_p', COL.body4, ROW.trans, 270),
  c(38, 'transducer_p', COL.body2, ROW.trans, 270),
  c(44, 'resistor', COL.riser1, ROW.resistor, 90, { feature: 'backup_heater' }),
  // thermostat 45 sits left of riser 1, in probe 33's column, right above resistor 44 (its stem ends on the riser)
  c(45, 'thermostat', COL.body1, ROW.thermostat, 270, { feature: 'backup_heater' }),
  // model C's integrated tank (50) with its coil (51, ports where the DHW lines of valve 26 end) and DHW probe (54) on
  // the tank wall
  c(50, 'tank', z.internalTank.x + z.internalTank.width / 2, z.internalTank.y + z.internalTank.height / 2, 0, {
    dhw: 'internal',
  }),
  c(51, 'coil', z.coil51.x, z.coil51.y, 0, { dhw: 'internal' }),
  // (in frame coordinates: the arrangement maps this one, unlike 50 and 51)
  c(54, 'probe_t', FRAME_ZONES.internalTank.x + FRAME_ZONES.internalTank.width - 16, 41, 270, { dhw: 'internal' }),
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
const cabinetSegments = (): readonly Segment[] => {
  const { riser1: r1, riser2: r2, riser3: r3, riser4: r4 } = COL;
  const { dhwSup, dhwRet, line: rowLine } = ROW;
  const hx8Left = COL.hx8 - 12;
  const hx8Right = COL.hx8 + 12;
  const hx7Left = COL.hx7 - 12;
  const hx7Right = COL.hx7 + 12;
  const hx9Left = COL.hx9 - 12;
  const hx9Right = COL.hx9 + 12;
  const hx10Left = COL.hx10 - 12;
  const hx10Right = COL.hx10 + 12;
  const compLeft = COL.compressor - 14;
  const compRight = COL.compressor + 14;
  const valve14Left = COL.valve14 - 14;
  const valve14Right = COL.valve14 + 14;
  const p = (...pairs: readonly (readonly [number, number])[]): string => line(...pairs);
  return [
    // production: ports 1 and 2 (their emitter or stubs are in the band, `bandSegments`)
    seg('p1_up', DG1, p([r1, dhwSup - 12], [r1, 0]), OUT, { dhw: 'any', speedRole: PP }),
    seg('p1_direct', DG1, p([r1, dhwSup + 12], [r1, 0]), OUT, { dhw: 'none', speedRole: PP }),
    seg('p2_in', DG1, p([r2, 0], [r2, dhwRet]), RET, { speedRole: PP }),
    seg('prod_44_26', TRUNK, p([r1, ROW.resistor - 28], [r1, dhwSup + 12]), OUT, { speedRole: PP }),
    seg('prod_bypass44', TRUNK, p([r1, ROW.hxTop], [r1, ROW.resistor - 28]), OUT, {
      bypass: 'backup_heater',
      speedRole: PP,
    }),
    seg('prod_8_44', TRUNK, p([hx8Left, ROW.hxTop], [r1, ROW.hxTop]), OUT, { speedRole: PP }),
    seg('prod_15_8', TRUNK, p([COL.pump15 + 12, rowLine], [hx8Left, rowLine]), RET, { speedRole: PP }),
    seg('trunk', TRUNK, p([r2, dhwRet], [r2, rowLine]), RET, { speedRole: PP }),
    seg('prod_27_in', TRUNK, p([r2, rowLine], [COL.valve27 - 12, rowLine]), RET, {
      through: 'passive_cooling',
      speedRole: PP,
      onlyWhen: { valves2728: 'closed' },
    }),
    seg('prod_27_15', TRUNK, p([COL.valve27 + 12, rowLine], [COL.pump15 - 12, rowLine]), RET, {
      through: 'passive_cooling',
      speedRole: PP,
    }),
    seg('prod_bypass27', TRUNK, p([r2, rowLine], [COL.pump15 - 12, rowLine]), RET, {
      bypass: 'passive_cooling',
      speedRole: PP,
    }),
    // production through exchanger 10 (passive cooling and defrost)
    seg('prod_10_in', ['exchanger_10'], p([r2, rowLine], [r2, ROW.hx10Bottom], [hx10Left, ROW.hx10Bottom]), RET, {
      feature: 'passive_cooling',
      speedRole: PP,
    }),
    seg(
      'prod_10_out',
      ['exchanger_10'],
      p([hx10Left, ROW.hx10Top], [COL.valve27, ROW.hx10Top], [COL.valve27, rowLine + 12]),
      OUT,
      {
        feature: 'passive_cooling',
        speedRole: PP,
      },
    ),
    // DHW lines of valve 26: supply to port 5, return from port 6 (or to and from the integrated tank of model C)
    seg('dhw_sup_a', ['production_dhw'], p([r1 + 12, dhwSup], [COL.htrRiser, dhwSup]), OUT, {
      dhw: 'any',
      speedRole: PP,
    }),
    seg('dhw_sup_b', ['dhw_coil'], p([COL.htrRiser, dhwSup], [COIL_PORT_X, dhwSup]), OUT, {
      dhw: 'any',
      speedRole: PP,
    }),
    seg('dhw_sup_c', ['dhw_coil'], p([COIL_PORT_X, dhwSup], [COL.port5, dhwSup], [COL.port5, 0]), OUT, {
      dhw: 'external',
      speedRole: PP,
    }),
    seg('dhw_ret_c', ['dhw_coil'], p([COL.port6, 0], [COL.port6, dhwRet], [COIL_PORT_X, dhwRet]), RET, {
      dhw: 'external',
      speedRole: PP,
    }),
    seg('dhw_ret_b', ['dhw_coil'], p([COIL_PORT_X, dhwRet], [COL.htr, dhwRet]), RET, { dhw: 'any', speedRole: PP }),
    seg('dhw_ret_a', ['production_dhw'], p([COL.htr, dhwRet], [r2, dhwRet]), RET, { dhw: 'any', speedRole: PP }),
    // HTR water: pump 17 takes from the DHW return, through valve 22 and exchanger 9, back into the DHW supply
    seg('htr_in', ['htr'], p([COL.htr, dhwRet], [COL.htr, ROW.probe - 12]), DHWT, { feature: 'htr', dhw: 'any' }),
    seg('htr_pump', ['htr'], p([COL.htr, ROW.probe + 12], [COL.htr, ROW.trans - 9]), DHWT, {
      feature: 'htr',
      dhw: 'any',
    }),
    seg('htr_to_9', ['htr'], p([COL.htr, ROW.trans + 9], [COL.htr, ROW.hx9Bottom], [hx9Left, ROW.hx9Bottom]), DHWT, {
      feature: 'htr',
      dhw: 'any',
    }),
    seg('htr_riser', ['htr'], p([hx9Left, ROW.hx9Top], [hx9Left, dhwSup]), DHWT, { feature: 'htr', dhw: 'any' }),
    // Internal (model C, items 47-49 on the top edge): short stubs into the tank
    seg('tap_47', ['dhw_coil'], p([COL.tap47, -12], [COL.tap47, FRAME_ZONES.internalTank.y]), DHWT, {
      dhw: 'internal',
      stub: true,
    }),
    seg('tap_48', ['dhw_coil'], p([COL.tap48, FRAME_ZONES.internalTank.y], [COL.tap48, -12]), DHWT, {
      dhw: 'internal',
      stub: true,
    }),
    seg('tap_49', ['dhw_coil'], p([COL.tap49, -12], [COL.tap49, FRAME_ZONES.internalTank.y]), DHWT, {
      dhw: 'internal',
      stub: true,
    }),
    // refrigerant: discharge 11 -> 9 -> 14 -> 8 (heating), expansion 8 -> 13 -> 12 -> 7, suction 7 -> 14 -> 11. The discharge
    // line runs left along the compressor row and down into exchanger 9's top port.
    seg(
      'ref_discharge',
      ['refrigerant'],
      p([compLeft, ROW.trans], [hx9Right, ROW.trans], [hx9Right, ROW.hx9Top]),
      DISCH,
      {
        through: 'htr',
        speedRole: CP,
      },
    ),
    seg('ref_9_14', ['refrigerant'], p([hx9Right, ROW.hx9Bottom], [valve14Left, ROW.valve14]), DISCH, {
      through: 'htr',
      speedRole: CP,
    }),
    seg(
      'ref_discharge_direct',
      ['refrigerant'],
      p([compLeft, ROW.trans], [valve14Left, ROW.trans], [valve14Left, ROW.valve14]),
      DISCH,
      {
        bypass: 'htr',
        speedRole: CP,
      },
    ),
    seg('ref_14_8', ['refrigerant'], p([valve14Right, ROW.valve14 + 10], [hx8Right, ROW.hxTop]), DISCH, {
      through: 'active_cooling',
      reversible: true,
      speedRole: CP,
    }),
    seg(
      'ref_7_14',
      ['refrigerant'],
      p([hx7Left, ROW.hxTop], [hx7Left, ROW.valve14], [valve14Right, ROW.valve14]),
      SUCT,
      {
        through: 'active_cooling',
        reversible: true,
        speedRole: CP,
      },
    ),
    seg(
      'ref_suction',
      ['refrigerant'],
      p(
        [valve14Right, ROW.valve14 - 10],
        [COL.suction, ROW.valve14 - 10],
        [COL.suction, ROW.trans],
        [compRight, ROW.trans],
      ),
      SUCT,
      {
        through: 'active_cooling',
        speedRole: CP,
      },
    ),
    seg(
      'ref_direct_8',
      ['refrigerant'],
      p([valve14Left, ROW.valve14], [valve14Right, ROW.valve14], [hx8Right, ROW.hxTop]),
      DISCH,
      {
        bypass: 'active_cooling',
        speedRole: CP,
      },
    ),
    seg(
      'ref_direct_suction',
      ['refrigerant'],
      p(
        [hx7Left, ROW.hxTop],
        [hx7Left, ROW.valve14 - 10],
        [COL.suction, ROW.valve14 - 10],
        [COL.suction, ROW.trans],
        [compRight, ROW.trans],
      ),
      SUCT,
      {
        bypass: 'active_cooling',
        speedRole: CP,
      },
    ),
    seg('ref_8_13', ['refrigerant'], p([hx8Right, rowLine], [COL.compressor - 14, rowLine]), COND, {
      reversible: true,
      speedRole: CP,
    }),
    seg('ref_13_12', ['refrigerant'], p([COL.compressor + 14, rowLine], [COL.valve12 - 12, rowLine]), COND, {
      reversible: true,
      speedRole: CP,
    }),
    seg('ref_12_7', ['refrigerant'], p([COL.valve12 + 12, rowLine], [hx7Left, rowLine]), EVAP, {
      reversible: true,
      speedRole: CP,
    }),
    // brine: port 4 -> pump 16 -> evaporator 7 -> valve 28 -> port 3
    seg('ln4_a', ['brine'], p([r4, 0], [r4, ROW.pump16 - 12]), BIN, { speedRole: BP }),
    seg('ln4_b', ['brine'], p([r4, ROW.pump16 + 12], [r4, ROW.hxTop]), BIN, { speedRole: BP }),
    seg('br_feed7', ['brine'], p([r4, ROW.hxTop], [hx7Right, ROW.hxTop]), BIN, {
      speedRole: BP,
      onlyWhen: { valves2728: 'closed' },
    }),
    seg('brine_7_28', ['brine'], p([hx7Right, rowLine], [COL.valve28 - 12, rowLine]), BOUT, {
      through: 'passive_cooling',
      speedRole: BP,
      onlyWhen: { valves2728: 'closed' },
    }),
    seg('brine_28_ln3', ['brine'], p([COL.valve28 + 12, rowLine], [r3, rowLine]), BOUT, {
      through: 'passive_cooling',
      speedRole: BP,
    }),
    seg('brine_bypass28', ['brine'], p([hx7Right, rowLine], [r3, rowLine]), BOUT, {
      bypass: 'passive_cooling',
      speedRole: BP,
    }),
    seg('ln3', ['brine'], p([r3, rowLine], [r3, 0]), BOUT, { speedRole: BP }),
    // brine through exchanger 10 (passive cooling and defrost)
    seg('br_10_in', ['exchanger_10'], p([r4, ROW.hxTop], [r4, ROW.hx10Top], [hx10Right, ROW.hx10Top]), BIN, {
      feature: 'passive_cooling',
      speedRole: BP,
    }),
    seg(
      'br_10_28',
      ['exchanger_10'],
      p([hx10Right, ROW.hx10Bottom], [COL.valve28, ROW.hx10Bottom], [COL.valve28, rowLine + 12]),
      BOUT,
      {
        feature: 'passive_cooling',
        speedRole: BP,
      },
    ),
  ];
};

/** The most crossings inside the cabinet (add-schematic-card D5): the manual's figure has 15 (14 hops and the return line behind resistor 44). */
export const MAX_CROSSINGS = 15;

/** The crossings inside the cabinet (add-schematic-card D5): this layout needs 9. */
const CROSSINGS: readonly Crossing[] = [
  { over: 'dhw_sup_a', under: 'p2_in', at: [COL.riser2, ROW.dhwSup] },
  { over: 'dhw_sup_c', under: 'ln3', at: [COL.riser3, ROW.dhwSup] },
  { over: 'dhw_sup_c', under: 'ln4_a', at: [COL.riser4, ROW.dhwSup] },
  { over: 'dhw_ret_c', under: 'ln3', at: [COL.riser3, ROW.dhwRet] },
  { over: 'dhw_ret_c', under: 'ln4_a', at: [COL.riser4, ROW.dhwRet] },
  { over: 'dhw_ret_b', under: 'htr_riser', at: [COL.hx9 - 12, ROW.dhwRet] },
  { over: 'trunk', under: 'prod_8_44', at: [COL.riser2, ROW.hxTop] },
  { over: 'ln3', under: 'br_feed7', at: [COL.riser3, ROW.hxTop] },
  { over: 'br_10_in', under: 'br_10_28', at: [COL.valve28, ROW.hx10Top] },
];

/**
 * The air coil's points: a serpentine of the vertical passes of the unit's `passes`. It starts on the coil panel's bottom face
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
 * The jogs' heights keep the pipes apart (`BAND_JOGS`): port 3's pipe jogs lowest, port 4's above it, the hybrid's link
 * highest, so a vertical never meets a horizontal. The external tank is joined with a mirrored helix: port 5 (the
 * left one) reaches the coil's upper left end through the column left of the coil, port 6 the coil's lower right end through
 * the column right of it, so the two do not cross. The air unit and the collector are entered and left on their bottom faces.
 */
function bandSegments(z: Zones, layout: ShownLayout): readonly Segment[] {
  const { ports, cabinet, key } = z;
  const top = cabinet.y;
  const tank = z.externalCoil;
  const level = bandJogs(top, layout);
  const segments: Segment[] = [];
  const { emitter } = z;
  if (emitter === undefined) {
    // no emitter: connections 1 and 2 end in short dead-end stubs (coloured, never animated)
    segments.push(
      seg('p1_stub', DG1, line([ports[1], top], [ports[1], top - STUB_LENGTH]), OUT, { stub: true }),
      seg('p2_stub', DG1, line([ports[2], top - STUB_LENGTH], [ports[2], top]), RET, { stub: true }),
    );
  } else {
    // the emitter: the supply from connection 1 to its inlet (production outlet 33), the return from its outlet to connection 2
    // (production return 34), both rising through the body's bottom face. The underfloor spiral between them is two segments,
    // the inward run in the supply colour (33) and the outward run in the return colour (34), both with the DG1 circuit's flow.
    const face = emitter.y + emitter.height;
    segments.push(
      seg(
        'dg1_sup',
        DG1,
        line(
          ...route(
            [ports[1], top],
            [ports[1], level.out],
            [emitter.feedX, level.out],
            [emitter.feedX, face],
            [emitter.feedX, emitter.inlet[1]],
            emitter.inlet,
          ),
        ),
        OUT,
        { speedRole: PP },
      ),
      ...(emitter.kind === 'underfloor'
        ? [
            seg('dg1_loop_in', DG1, line(...emitter.loopIn), OUT, { speedRole: PP, bend: emitter.pitch / 2 }),
            seg('dg1_loop_out', DG1, line(...emitter.loopOut), RET, { speedRole: PP, bend: emitter.pitch / 2 }),
          ]
        : []),
      seg(
        'dg1_ret',
        DG1,
        line(
          ...route(
            emitter.outlet,
            [emitter.exitX, emitter.outlet[1]],
            [emitter.exitX, face],
            [emitter.exitX, level.out],
            [ports[2], level.out],
            [ports[2], top],
          ),
        ),
        RET,
        { speedRole: PP },
      ),
    );
  }
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
  /** The heat emitter on connections 1/2; the default (underfloor) when left out. */
  emitter?: Emitter;
  features: Features;
  /**
   * The arrangement drawn (refine-simplified-layout D1): every consumer reads the coordinates from it. The card sets it
   * from `arrangementFor`; left out, it is the one `arrangementFor('horizontal', bandKeyOf(context))` gives.
   */
  arrangement?: Arrangement;
}

/** The layout the card shows now (card-config `layout`, resolved): horizontal or vertical. */
export type ShownLayout = 'horizontal' | 'vertical';

/** Which arrangement a card shows. */
type ArrangementId = ShownLayout;

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
export type AxisMap = readonly (readonly [from: number, to: number])[];

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
 * A map that stretches (or shrinks) the lanes of the cabinet frame by `change[lane.id]` units and keeps slope 1 everywhere else
 * (rework-layouts D2): a symbol keeps its size and the parts in a column keep their distances, only the lanes between them grow.
 * `origin` is where the frame's coordinate 0 lands.
 */
function laneMap(
  lanes: readonly Lane[],
  change: Readonly<Record<string, number>>,
  origin: number,
  length: number,
): AxisMap {
  const knots: [number, number][] = [];
  const push = (from: number, to: number): void => {
    if (knots[knots.length - 1]?.[0] === from) knots.pop();
    knots.push([from, to]);
  };
  let added = 0;
  push(0, origin);
  for (const lane of lanes) {
    const delta = change[lane.id] ?? 0;
    if (delta === 0) continue;
    push(lane.from, origin + lane.from + added);
    added += delta;
    push(lane.to, origin + lane.to + added);
  }
  push(length, origin + length + added);
  return knots;
}

/**
 * The extra width the horizontal layout gives each column lane (units added to the lane's frame width; the lanes not listed keep
 * theirs). The cabinet grows from 720 to 980 units (x 0-720 becomes 10-990), so it fills the drawing's width. The lanes are the ones
 * that hold values beside their parts (`COLUMN_LANES`). The widening is balanced about the frame's centre line (`CENTRE`, x 360), so
 * compressor 11 and exchanger 10 stay centred in the stretched cabinet (the frame's x 360 lands on the drawing's x 500): 130 in the lanes
 * left of it (62 left of probe 33 for production Out, 46 between riser 1 and probes 34/38 for production In and the pressure, 22 right
 * of pump 15 for its value) and 130 in the lanes right of it (84 between riser 3 and probes 32/37 for brine Out, the pressure and the
 * pump 16 value, 46 right of riser 4 for brine In); 260 in all. The widths are what the widest values at the threshold need (the place
 * search's "widest box"), and the lanes before riser 4 take at most 220 so that port 4 (x 827) stays left of the tank's slot (x 830-990),
 * as in the band's tests. The parts keep their size and every column of parts keeps its slope 1.
 */
export const HORIZONTAL_LANE_EXTRA: Readonly<Record<string, number>> = {
  'left-edge': 62,
  'riser-1': 46,
  'before-exchanger-8': 22,
  'riser-3': 84,
  'riser-4': 46,
};

/** The horizontal layout's x map: `HORIZONTAL_LANE_EXTRA` over the column lanes. */
export const HORIZONTAL_MAP_X: AxisMap = laneMap(COLUMN_LANES, HORIZONTAL_LANE_EXTRA, 10, FRAME_CABINET.width);

/**
 * The horizontal layout's y changes: the row lanes that hold no value in this layout narrow (the one above the probe row, which
 * holds none, by 10 units), so the drawing stays wide. The lane under the compressor row keeps its 44 units for the pair
 * blocks and the compressor speed, the one under the valve row its 36 for the opening.
 */
export const HORIZONTAL_LANE_SHRINK: Readonly<Record<string, number>> = { 'above-probes': -18 };

/**
 * The horizontal layout's y map: the lane changes of `HORIZONTAL_LANE_SHRINK`, and a shift that puts the cabinet's top edge
 * under the band (the band's height plus the join lane).
 */
export const HORIZONTAL_MAP_Y: AxisMap = laneMap(
  ROW_LANES,
  HORIZONTAL_LANE_SHRINK,
  BAND.top + BAND.height + BAND.joinLane,
  FRAME_CABINET.height,
);

/**
 * The vertical layout's x map: the identity, the cabinet at x 10-730 (rework-layouts D2). The frame is 720 units wide, the width
 * of the widest band (the emitter 180, the hybrid source 322, the tank 160 and two gaps of 24), so the vertical layout needs no
 * x stretch. Its viewBox is 740 wide (the cabinet and a margin of 10 at each side), not the horizontal layout's 1000: every
 * unit renders `width / 740` px, which `strokeWidths` and the label fonts (`LABEL_FONT_K`) take into account.
 */
export const VERTICAL_MAP_X: AxisMap = laneMap(COLUMN_LANES, {}, 10, FRAME_CABINET.width);

/**
 * The vertical layout's y changes: what each row lane gains so that the cabinet's values get rows of their own at 320 px, where
 * a label's box is 10 px = 23 units tall (found with `npm run search-places -- --layout=vertical --width=320`, in Chromium and
 * WebKit; `VERTICAL_LANE_REASONS` says why each lane has its height). The lane over the probe row (76-100) and the one under the valve
 * row (408-444) gain nothing: the opening needs one row of 36 units there, and the lane over the probe row
 * holds no value.
 */
export const VERTICAL_LANE_EXTRA: Readonly<Record<string, number>> = {
  'under-compressor-row': 24,
};

/** Why each row lane has the height `VERTICAL_LANE_EXTRA` gives it. */
export const VERTICAL_LANE_REASONS: Readonly<Record<string, string>> = {
  'under-compressor-row':
    'three rows of values (the pair blocks and the compressor speed) at a 32 unit pitch, the label height at 320 px with its margin (PAIR_ROW_GAP), need 96 units plus the margin to the lane edges; the frame lane is 72, so 24 more put every block, with 2 px of margin, at the pair it belongs to in Chromium and WebKit',
};

/** The vertical layout's y map: `VERTICAL_LANE_EXTRA` over the row lanes, the cabinet's top edge under the band. */
export const VERTICAL_MAP_Y: AxisMap = laneMap(
  ROW_LANES,
  VERTICAL_LANE_EXTRA,
  BAND.top + BAND.height + BAND.joinLane,
  FRAME_CABINET.height,
);

/**
 * The head of tank 50 in the vertical layout: the frame's y 10-24 holds only tank 50's wall (its top is at y 8) and vertical pipes
 * (the stubs 47-49, the risers of connections 1/2): no symbol, and the DHW lines, valve 26, coil 51 and probe 54 start below
 * it. The vertical y map adds 28 units there, the place search's current result at 320 px, so the temperature sits above coil 51 (rework-layouts D2). It is
 * not a value lane: it is the one y-map breakpoint inside a body, and it applies only where tank 50 is drawn
 * (`BandKey.internal`): elsewhere the range holds only vertical pipes, and growing it would leave an empty strip.
 */
export const VERTICAL_TANK_HEAD = { from: 10, to: 24, extra: 28 } as const;

/** The vertical y map where tank 50 is drawn: `VERTICAL_MAP_Y` with the head stretched. */
export const VERTICAL_MAP_Y_TANK50: AxisMap = laneMap(
  [
    { id: 'tank-head', axis: 'row', from: VERTICAL_TANK_HEAD.from, to: VERTICAL_TANK_HEAD.to, holds: 'tank 50 head' },
    ...ROW_LANES,
  ],
  { ...VERTICAL_LANE_EXTRA, 'tank-head': VERTICAL_TANK_HEAD.extra },
  BAND.top + BAND.height + BAND.joinLane,
  FRAME_CABINET.height,
);

/** The two maps of a layout. */
const MAPS: Readonly<Record<ShownLayout, { x: AxisMap; y: AxisMap }>> = {
  horizontal: { x: HORIZONTAL_MAP_X, y: HORIZONTAL_MAP_Y },
  vertical: { x: VERTICAL_MAP_X, y: VERTICAL_MAP_Y },
};

/** The axis maps a layout and band key draw with: the vertical layout stretches tank 50's head only where tank 50 is drawn. */
export const axisMapsOf = (layout: ShownLayout, key: Pick<BandKey, 'internal'> = {}): { x: AxisMap; y: AxisMap } => ({
  x: MAPS[layout].x,
  y: layout === 'vertical' && key.internal === true ? VERTICAL_MAP_Y_TANK50 : MAPS[layout].y,
});

/** The frame's coordinates under a layout's maps; `internal`: tank 50 is drawn, so the vertical layout stretches its head. */
const mapperOf = (
  layout: ShownLayout,
  internal = false,
): { mapX: (x: number) => number; mapY: (y: number) => number } => {
  const maps = MAPS[layout];
  const y = layout === 'vertical' && internal ? VERTICAL_MAP_Y_TANK50 : maps.y;
  return { mapX: (x) => mapAxis(maps.x, x), mapY: (v) => mapAxis(y, v) };
};

/** The heights of the horizontal jogs in the join lane of a layout, from the cabinet's top edge. */
export const bandJogs = (
  top: number,
  layout: ShownLayout = 'horizontal',
): { out: number; in: number; link: number; tank: number } => {
  const jog = BAND_JOGS[layout];
  return { out: top - jog.out, in: top - jog.in, link: top - jog.link, tank: top - jog.tank };
};

/** The emitter a context without one draws: the option's default. */
const DEFAULT_EMITTER: Emitter = 'underfloor';

/** The band's key for a draw context: the source, whether the external tank is drawn, and the emitter. */
export const bandKeyOf = (context: Pick<DrawContext, 'model' | 'dhw' | 'source' | 'emitter'>): BandKey => ({
  source: context.source,
  tank: drawnStorage(context) === 'external',
  emitter: context.emitter ?? DEFAULT_EMITTER,
  internal: drawnStorage(context) === 'internal',
});

/** The widest band: the hybrid source with the tank and the emitter; `arrangementFor` without a key. */
const WIDEST_KEY: BandKey = { source: 'hybrid', tank: true, emitter: DEFAULT_EMITTER };

/** The cabinet's zones under a layout's maps: the viewBox is the cabinet plus a margin of 10 units at the right and 15 below. */
const CABINET_ZONES: Readonly<Record<string, CabinetZones>> = (() => {
  const zonesOf = (layout: ShownLayout, internal: boolean): CabinetZones => {
    const { mapX, mapY } = mapperOf(layout, internal);
    const cabinet: Rect = {
      x: mapX(FRAME_CABINET.x),
      y: mapY(FRAME_CABINET.y),
      width: mapX(FRAME_CABINET.x + FRAME_CABINET.width) - mapX(FRAME_CABINET.x),
      height: mapY(FRAME_CABINET.y + FRAME_CABINET.height) - mapY(FRAME_CABINET.y),
    };
    const tank = FRAME_ZONES.internalTank;
    return {
      viewBox: { width: cabinet.x + cabinet.width + 10, height: cabinet.y + cabinet.height + 15 },
      cabinet,
      internalTank: {
        x: mapX(tank.x),
        y: mapY(tank.y),
        width: round2(mapX(tank.x + tank.width) - mapX(tank.x)),
        height: round2(mapY(tank.y + tank.height) - mapY(tank.y)),
      },
      // coil 51's supply port is where the mapped DHW line of valve 26 ends, whatever the maps stretch in between
      coil51: { x: mapX(FRAME_ZONES.coil51.x - 75) + 75, y: mapY(FRAME_ZONES.coil51.y) },
      headShift: round2(mapY(FRAME_CABINET.height) - mapAxis(MAPS[layout].y, FRAME_CABINET.height)),
    };
  };
  return {
    horizontal: zonesOf('horizontal', false),
    vertical: zonesOf('vertical', false),
    'vertical|internal': zonesOf('vertical', true),
    'horizontal|internal': zonesOf('horizontal', true),
  };
})();

const zonesFor = (layout: ShownLayout, key: BandKey): CabinetZones => {
  const zones = CABINET_ZONES[key.internal === true ? `${layout}|internal` : layout];
  if (zones === undefined) throw new Error('no cabinet zones');
  return zones;
};

/** The band's parts placed for a key: the slots from the ports (rework-layouts D3), the bodies in them. */
function bandZonesFor(layout: ShownLayout, key: BandKey, cabinet: CabinetZones): BandZones {
  const { mapX } = mapperOf(layout, key.internal === true);
  const top = cabinet.cabinet.y;
  const bottom = top - BAND.joinLane;
  const ports = {
    1: mapX(COL.riser1),
    2: mapX(COL.riser2),
    3: mapX(COL.riser3),
    4: mapX(COL.riser4),
    5: mapX(COL.port5),
    6: mapX(COL.port6),
  } as const;
  const slots = planBand(
    [
      { name: 'emitter', centre: (ports[1] + ports[2]) / 2, width: key.emitter === 'none' ? 0 : BAND.emitter.width },
      { name: 'source', centre: (ports[3] + ports[4]) / 2, width: sourceWidth(key.source) },
      { name: 'tank', centre: (ports[5] + ports[6]) / 2, width: key.tank ? BAND.tank.width : 0 },
    ],
    { min: cabinet.cabinet.x, max: cabinet.cabinet.x + cabinet.cabinet.width },
    BAND.gap,
  );
  const source = slots.source;
  const emitterSlot = slots.emitter;
  const emitter =
    key.emitter === 'none' || emitterSlot === undefined ? undefined : emitterShape(key.emitter, emitterSlot.x0, bottom);
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
          top: tankShape.y + 90,
          bottom: tankShape.y + 152,
          rx: 38,
          inX: tankShape.x + tankShape.width / 2 - 38 - 12,
          outX: tankShape.x + tankShape.width / 2 + 38 + 12,
        };
  return {
    key,
    band: { top: bottom - BAND.height, bottom },
    ports,
    slots,
    ...(emitter === undefined ? {} : { emitter }),
    ...(air === undefined ? {} : { airUnit: air }),
    ...(collector === undefined ? {} : { collector }),
    ...(tankShape === undefined ? {} : { externalTank: tankShape }),
    ...(coil === undefined ? {} : { externalCoil: coil }),
  };
}

const ARRANGEMENTS = new Map<string, Arrangement>();

/** The recorded label places of each layout. */
const PLACES: Readonly<Record<ShownLayout, Readonly<Record<string, PlaceOverride>>>> = {
  horizontal: HORIZONTAL_PLACES,
  vertical: VERTICAL_PLACES,
};

function buildArrangement(
  layout: ShownLayout,
  key: BandKey,
  places: Readonly<Record<string, PlaceOverride>> = PLACES[layout],
): Arrangement {
  const { mapX, mapY } = mapperOf(layout, key.internal === true);
  const zones: Zones = { ...zonesFor(layout, key), ...bandZonesFor(layout, key, zonesFor(layout, key)) };
  const place = (x: number, y: number): readonly [number, number] => [mapX(x), mapY(y)];
  const components = componentsFor(zones).map((part): Component => {
    if (part.item === 50 || part.item === 51) return part;
    return { ...part, x: mapX(part.x), y: mapY(part.y) };
  });
  const cabinet = cabinetSegments().map((part): Segment => ({
    ...part,
    points: part.points.map(([x, y]): Point => [mapX(x), mapY(y)]),
  }));
  const segments = [...cabinet, ...bandSegments(zones, layout)];
  const crossings = CROSSINGS.map((crossing): Crossing => ({
    ...crossing,
    at: place(crossing.at[0], crossing.at[1]),
  }));
  const labels = labelPlacesFor(zones, place, layout);
  return {
    ...zones,
    id: layout,
    components,
    segments,
    crossings,
    labels: {
      specs: labels.specs.map((spec) => {
        const own = places[spec.id]?.at(zones, place);
        return own === undefined ? spec : { ...spec, ...own };
      }),
    },
  };
}

/**
 * The cabinet frame the arrangement is mapped from (rework-layouts D1): its zones, the cabinet's lists, crossings and
 * default label places. Not drawn by any layout; the tests of the maps (test/diagram/simplified.test.ts) compare the arrangement with it.
 */
export const FRAME = {
  zones: FRAME_ZONES,
  components: componentsFor(FRAME_ZONES),
  segments: cabinetSegments(),
  crossings: CROSSINGS,
  labels: labelPlacesFor(FRAME_ZONES),
};

/** The arrangement of a layout and band key with another place table than the layout's own (not cached): for the tests of the override path. */
export const arrangementWithPlaces = (
  places: Readonly<Record<string, PlaceOverride>>,
  key: BandKey = WIDEST_KEY,
  layout: ShownLayout = 'horizontal',
): Arrangement => buildArrangement(layout, key, places);

/**
 * The arrangement of a shown layout and band key: a pure function of them (rework-layouts D2, D3), built once per layout and key.
 * Without a key, the widest band's.
 */
export function arrangementFor(layout: ShownLayout, key: BandKey = WIDEST_KEY): Arrangement {
  const id = `${layout}|${key.source}|${String(key.tank)}|${key.emitter}|${String(key.internal === true)}`;
  const known = ARRANGEMENTS.get(id);
  if (known !== undefined) return known;
  const built = buildArrangement(layout, key);
  ARRANGEMENTS.set(id, built);
  return built;
}

/**
 * The labels' places of a layout before its place table (`HORIZONTAL_PLACES`, `VERTICAL_PLACES`) applies: the default places under the maps. The place search
 * (scripts/search-places.mjs) measures each label's distance from these, never from a recorded place, so a rerun does not
 * depend on the table it replaces.
 */
export function defaultLabelPlaces(layout: ShownLayout, key: BandKey = WIDEST_KEY): LabelPlaces {
  const { mapX, mapY } = mapperOf(layout, key.internal === true);
  const cabinet = zonesFor(layout, key);
  return labelPlacesFor({ ...cabinet, ...bandZonesFor(layout, key, cabinet) }, (x, y) => [mapX(x), mapY(y)], layout);
}

/** The arrangement a draw context carries, or, without one, the `layout`'s (the horizontal one's by default) for its band key. */
export const arrangementOf = (
  context: Partial<Pick<DrawContext, 'arrangement' | 'model' | 'dhw' | 'source' | 'emitter'>>,
  layout: ShownLayout = 'horizontal',
): Arrangement =>
  context.arrangement ??
  (context.model === undefined || context.dhw === undefined || context.source === undefined
    ? arrangementFor(layout)
    : arrangementFor(
        layout,
        bandKeyOf({ model: context.model, dhw: context.dhw, source: context.source, emitter: context.emitter }),
      ));

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
