// The drawing's geometry as data (design D5): the viewBox, the ports on the top edge, every component and every pipe
// segment, laid out after the manual's B4 figure (manual-figure, section 3.1, page 34) and, for model C, figure C
// (items 47-54, the integrated tank). The topology and the item numbers are the figures'; the coordinates are re-laid
// out for legibility. Besides the cabinet's own pipes the segments include the pipes of the outer-loop source (left
// zone) and of the external DHW tank (right zone), and the stubs of connections 47-49. No Lit here: this file is
// data plus small pure helpers that the renderer and the integrity tests share.
//
// Layout in viewBox units (1000 x 620): source zone x 0-210, cabinet x 240-760, DHW zone x 790-1000, the pipe run
// above the cabinet y 0-110, the cabinet's top edge at y 130. Ports 1-6 sit on the top edge in the manual's order.
// Inside, from the top: the DHW supply (y 172) and return (y 198) lines of valve 26, the probe row, the discharge
// line of compressor 11 (y 250) through HTR exchanger 9 to inversion valve 14, condenser 8 and evaporator 7, the
// valve 27 / pump 15 / valve 28 row (y 416), exchanger 10 and, at the bottom, the vessels and drain valves.
//
// Pipe points run in the direction of the flow in heating (`direction` 1) so that the renderer can animate them.
import type { CircuitId, Circuits } from '../calc/circuits';
import type { Detail, DhwStorage, Source } from '../config/options';
import type { RolePath } from '../config/roles';
import type { FeatureKey, Features } from '../config/variants';

export const viewBox = { width: 1000, height: 620 } as const;

/** The cabinet's outline and the zones around it. */
export const CABINET = { x: 240, y: 130, width: 520, height: 475 } as const;

/**
 * The integrated tank of model C (item 50), inside the cabinet under the top edge: coil 51 (its ports are where the DHW
 * lines of valve 26 end), probe 54 and drain valve 53 sit on or in it. The figure's tank is tall; this one is squat so
 * that it fits above the probe row.
 */
export const INTERNAL_TANK = { x: 408, y: 138, width: 182, height: 66 } as const;

/** The external tank right of the cabinet (not a manual item: the "DHW inter-accumulator" of ports 5/6). */
export const EXTERNAL_TANK = { x: 806, y: 150, width: 178, height: 180 } as const;

/** The air unit's housing and the fan in it, left of the cabinet (not manual items). */
export const AIR_UNIT = {
  x: 40,
  y: 120,
  width: 150,
  height: 180,
  fanX: 115,
  fanY: 250,
  fanRadius: 36,
  /** The coil's fins: the first x, the step, how many, and where they start and end. */
  fins: { x: 76, step: 12, count: 7, y0: 144, y1: 192 },
  /** Where the caption sits. */
  captionX: 95,
  captionY: 112,
} as const;

/** The ground line (the surface) of the ground loop: lower in the hybrid, under the air unit. */
export const GROUND_LINE_Y = { ground: 160, hybrid: 350 } as const;

/** Where the ground loop's caption sits (below the collector). */
export const GROUND_CAPTION = { x: 105, y: { ground: 320, hybrid: 510 } } as const;

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
 * (`any` means external or internal). `source`: only for those outer-loop sources. HTR also needs DHW storage: with
 * `dhw: none` it counts as `false`. `detail: 'full'` (design D1): a service or safety part, or a stub pipe that only
 * leads to one, drawn only at the `full` level of detail.
 */
export interface Visibility {
  feature?: FeatureKey;
  through?: FeatureKey;
  bypass?: FeatureKey;
  dhw?: 'any' | 'external' | 'internal' | 'none';
  source?: readonly Source[];
  detail?: 'full';
}

/** Where an item number is written, relative to the component: dx, dy and the text anchor. */
export type Tag = readonly [dx: number, dy: number, anchor?: 'start' | 'middle' | 'end'];

export interface Component extends Pick<Visibility, 'feature' | 'dhw' | 'detail'> {
  /** The manual's item number, 1-54. */
  item: number;
  kind: ComponentKind;
  x: number;
  y: number;
  /** Where a probe's stem points (0 down, 90 left, 180 up, 270 right), or the turn of the symbol. */
  rotation: Rotation;
  /** An exchanger's half span between its top and bottom ports. */
  size?: number;
  tag: Tag;
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
  extra: Partial<Pick<Component, 'feature' | 'dhw' | 'detail' | 'size'>> = {},
): Component => ({ item, kind, x, y, rotation, tag, ...extra });

/** Components. Items 1-6 are the ports on the top edge. */
export const COMPONENTS: readonly Component[] = [
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
  c(7, 'exchanger', 572, 382, 0, [-26, 6, 'end'], { size: 34 }),
  c(8, 'exchanger', 432, 382, 0, [-26, 6, 'end'], { size: 34 }),
  c(9, 'exchanger', 373, 273, 0, [26, -2, 'start'], { size: 23, feature: 'htr' }),
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
  c(10, 'exchanger', 520, 470, 0, [28, 4, 'start'], { size: 22, feature: 'passive_cooling' }),
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
  c(26, 'valve3', 270, 172, 270, [-14, 22, 'end'], { dhw: 'any' }),
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
    INTERNAL_TANK.x + INTERNAL_TANK.width / 2,
    INTERNAL_TANK.y + INTERNAL_TANK.height / 2,
    0,
    [-80, -17, 'start'],
    {
      dhw: 'internal',
    },
  ),
  c(51, 'coil', 495, 185, 0, [0, -25, 'middle'], { dhw: 'internal' }),
  c(52, 'service_outlet', 395, 162, 0, [-8, 4, 'end'], { dhw: 'internal', detail: 'full' }),
  c(53, 'drain_valve', 599, 196, 270, [0, -12, 'middle'], { dhw: 'internal', detail: 'full' }),
  c(54, 'probe_t', 574, 171, 270, [0, -14, 'middle'], { dhw: 'internal' }),
];

/** Points from text: "x,y x,y ...". */
const parsePoints = (path: string): Point[] =>
  path.split(' ').map((pair) => {
    const [x, y] = pair.split(',').map(Number);
    return [x ?? 0, y ?? 0];
  });

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
 * The segments that carry HTR water when HTR is active and the DHW circuit is not (design D7): the DHW lines
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
export const SEGMENTS: readonly Segment[] = [
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
  seg('dhw_ext_in', ['dhw_coil'], '722,130 722,50 940,50 940,190', OUT, { dhw: 'external', speedRole: PP }),
  seg('dhw_ext_coil', ['dhw_coil'], '940,190 840,190 840,235 940,235 940,280 840,280', OUT, {
    dhw: 'external',
    speedRole: PP,
  }),
  seg('dhw_ext_out', ['dhw_coil'], '840,280 820,280 820,85 748,85 748,130', RET, {
    dhw: 'external',
    speedRole: PP,
  }),
  // Internal (model C, items 47-49 on the top edge): short stubs into the tank
  seg('tap_47', ['dhw_coil'], '440,118 440,138', DHWT, { dhw: 'internal', stub: true }),
  seg('tap_48', ['dhw_coil'], '490,138 490,118', DHWT, { dhw: 'internal', stub: true }),
  seg('tap_49', ['dhw_coil'], '540,118 540,138', DHWT, { dhw: 'internal', stub: true }),
  // Outer-loop source (left zone). Port 3 (brine out) rises to y 85 and runs left, port 4 (brine in) comes back at
  // y 50: both stay above the DG1 stubs (y > 110) and the circuit labels, and port 4's pipe is the higher one so that
  // the two do not cross. Air unit: feed, coil rows, exit. Ground loop: feed, collector rows, exit.
  seg('src_out', ['brine'], '630,130 630,85 150,85', BOUT, { speedRole: BP }),
  seg('src_in', ['brine'], '20,50 690,50 690,130', BIN, { speedRole: BP }),
  seg('src_air_feed', ['brine'], '150,85 150,150', BOUT, { source: ['air', 'hybrid'], speedRole: BP }),
  seg('src_air_coil', ['brine'], '150,150 70,150 70,168 150,168 150,186 70,186', BOUT, {
    source: ['air', 'hybrid'],
    speedRole: BP,
  }),
  seg('src_air_exit', ['brine'], '70,186 20,186 20,50', AIRO, { source: ['air'], speedRole: BP }),
  seg('src_gnd_feed', ['brine'], '150,85 150,210', BOUT, { source: ['ground'], speedRole: BP }),
  seg('src_gnd_loop', ['brine'], '150,210 60,210 60,250 150,250 150,290 20,290', BOUT, {
    source: ['ground'],
    speedRole: BP,
  }),
  seg('src_gnd_exit', ['brine'], '20,290 20,50', BIN, { source: ['ground'], speedRole: BP }),
  // hybrid: the air unit's exit runs down to the ground loop, whose exit returns up to port 4
  seg('src_hyb_link', ['brine'], '70,186 29,186 29,390', AIRO, { source: ['hybrid'], speedRole: BP }),
  seg('src_hyb_loop', ['brine'], '29,390 150,390 150,420 60,420 60,450 150,450 150,480 20,480', AIRO, {
    source: ['hybrid'],
    speedRole: BP,
  }),
  seg('src_hyb_exit', ['brine'], '20,480 20,50', BIN, { source: ['hybrid'], speedRole: BP }),
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

/** The most crossings inside the cabinet (design D5): the manual's figure has 15 (14 hops and the return line behind resistor 44). */
export const MAX_CROSSINGS = 15;

/** The crossings inside the cabinet (design D5): this layout needs 14. */
export const CROSSINGS: readonly Crossing[] = [
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
export const CIRCUIT_LABELS: readonly CircuitLabel[] = [
  { key: 'dg1', x: 291, y: 112 },
  { key: 'outerLoop', x: 660, y: 112 },
  { key: 'dhw', x: 776, y: 112, dhw: 'external' },
];

/** What decides which parts are drawn: the DHW storage, the source, the feature states and the level of detail. */
export interface DrawContext {
  dhw: DhwStorage;
  source: Source;
  features: Features;
  /** `simplified` leaves out the parts and stubs marked `detail: 'full'`. */
  detail: Detail;
}

export type PartState = 'normal' | 'muted' | 'hidden';

/** A feature's state as the drawing sees it: HTR needs DHW storage, so it counts as false without it. */
export const effectiveFeature = (context: DrawContext, key: FeatureKey): Features[FeatureKey] =>
  key === 'htr' && context.dhw === 'none' ? false : context.features[key];

const dhwFits = (rule: NonNullable<Visibility['dhw']>, dhw: DhwStorage): boolean =>
  rule === 'any' ? dhw !== 'none' : rule === dhw;

/** Whether a part is drawn normally, drawn muted (feature `unused`) or not drawn (see Visibility). */
export function partState(part: Visibility, context: DrawContext): PartState {
  if (part.detail === 'full' && context.detail !== 'full') return 'hidden';
  if (part.source !== undefined && !part.source.includes(context.source)) return 'hidden';
  if (part.dhw !== undefined && !dhwFits(part.dhw, context.dhw)) return 'hidden';
  if (part.bypass !== undefined && effectiveFeature(context, part.bypass) !== false) return 'hidden';
  if (part.through !== undefined && effectiveFeature(context, part.through) === false) return 'hidden';
  if (part.feature !== undefined) {
    const state = effectiveFeature(context, part.feature);
    if (state === false) return 'hidden';
    if (state === 'unused') return 'muted';
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

export const drawnComponents = (context: DrawContext): Drawn<Component>[] => drawn(COMPONENTS, context);
export const drawnSegments = (context: DrawContext): Drawn<Segment>[] => drawn(SEGMENTS, context);

/** A segment is active when any of its circuits is and, if it has one, its valve position holds. */
export const isSegmentActive = (segment: Pick<Segment, 'circuit' | 'onlyWhen'>, circuits: Circuits): boolean =>
  (segment.onlyWhen === undefined || segment.onlyWhen.valves2728 === circuits.valves2728) &&
  segment.circuit.some((circuit) => circuits.active.has(circuit));

/** The hop of a crossing: the gap in the `under` segment is this many units on each side of the crossing. */
export const HOP = 5;

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
      return [
        [-75, -13],
        [-75, 13],
      ];
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
 * The SVG path data of a polyline, with a gap of HOP on each side of every given crossing point (the hop of a
 * crossing, drawn in the `under` segment).
 */
export function pathData(points: readonly Point[], gaps: readonly Point[] = []): string {
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
      if (distance > HOP) lineTo([gap[0] - dx * HOP, gap[1] - dy * HOP]);
      moveTo(length - distance > HOP ? [gap[0] + dx * HOP, gap[1] + dy * HOP] : b);
    }
    lineTo(b);
  }
  return parts.join(' ');
}

const onPiece = (point: Point, a: Point, b: Point): boolean =>
  (a[0] === b[0] && point[0] === a[0] && between(point[1], a[1], b[1])) ||
  (a[1] === b[1] && point[1] === a[1] && between(point[0], a[0], b[0]));

/** Whether a point lies on the outline of the integrated tank (where its drain valve and probe connect). */
export const onInternalTank = ([x, y]: Point): boolean => {
  const { x: x0, y: y0, width, height } = INTERNAL_TANK;
  const inX = x >= x0 && x <= x0 + width;
  const inY = y >= y0 && y <= y0 + height;
  return (inY && (x === x0 || x === x0 + width)) || (inX && (y === y0 || y === y0 + height));
};

/** The crossing points that are drawn as a gap in this segment, given the segments that are drawn. */
export function gapsIn(segmentId: string, drawnIds: ReadonlySet<string>): Point[] {
  return CROSSINGS.filter(
    (crossing) => crossing.under === segmentId && drawnIds.has(crossing.over) && drawnIds.has(crossing.under),
  ).map((crossing) => crossing.at);
}
