// Pipe rendering state (add-schematic-card D6, D7; temperature-coloring spec): for each drawn segment the colour, whether it is
// muted, whether its dash overlay runs, how fast and in which direction. Every function is pure; its inputs are the
// mode, the circuits (active circuits and valve positions), the readings and the colour stops.
// - Colour: the segment's temperature role (see `roleFor` for the mode-dependent ones) on the colour scale. Muted when
//   the circuit is inactive, the part is `unused` (not exchanger 10 with valves 27/28 in defrost), or the probe has
//   no value. The model C tap-water stubs 47/48/49 (manual items) are the exception: coloured by the DHW temperature
//   whenever the internal tank is drawn.
// - Animation: only on active, non-stub segments that are not muted by their feature and have a speed: the speed
//   role's %, or a fixed medium speed on HTR water; 0 % or no value is still. A segment whose probe is missing keeps
//   its animation (only its colour is muted), because the flow itself is known.
// - Direction: the geometry's direction, flipped in active cooling for the `reversible` refrigerant legs.
import type { Circuits } from '../calc/circuits';
import type { Mode } from '../calc/mode';
import type { Readings } from '../calc/readings';
import type { RolePath } from '../config/roles';
import { MUTED_COLOR, temperatureColor, type ColorStop } from './colors';
import { HTR_WATER_SEGMENT_IDS, isSegmentActive, type PartState, type Segment, type Visibility } from './geometry';

/** What the pipe state is derived from. */
export interface PipeView {
  mode: Mode;
  circuits: Circuits;
  readings: Readings;
  stops: readonly ColorStop[];
}

/** The seconds one dash period takes at a pump or compressor speed of 100 %. */
export const FLOW_SECONDS_AT_FULL = 1.2;
/** The fastest and the slowest dash period, whatever the speed. */
export const FLOW_SECONDS_MIN = 0.6;
export const FLOW_SECONDS_MAX = 8;
/** The fixed, medium period of the HTR water segments (pump 17 reports no speed). */
export const HTR_FLOW_SECONDS = 3;

/** The model C tap-water stubs (items 47, 48 and 49 on the top edge): never animated, coloured by the DHW temperature. */
export const TAP_WATER_SEGMENT_IDS: readonly string[] = ['tap_47', 'tap_48', 'tap_49'];

/**
 * The production legs from valve 27 to condenser 8: the pipe from valve 27 through pump 15 to the condenser, with the
 * taps on pump 15's suction and the drain after it (the same water). In passive cooling and defrost the compressor is
 * stopped, so the condenser does not change the water temperature and the legs take the outlet temperature (add-schematic-card D7).
 */
export const PRODUCTION_LEGS_27_TO_8: readonly string[] = [
  'prod_27_15',
  'prod_15_8',
  'prod_tap_a',
  'prod_tap_b',
  'prod_drain',
];

/** The dash period for a speed in %; undefined (still) at 0 % or without a value. */
export function flowDuration(speed: number | undefined): number | undefined {
  if (speed === undefined || !(speed > 0)) return undefined;
  return Math.min(FLOW_SECONDS_MAX, Math.max(FLOW_SECONDS_MIN, (FLOW_SECONDS_AT_FULL * 100) / speed));
}

/** The swap of the refrigerant temperature roles when the cycle is reversed: 7 works as the condenser, 8 as the evaporator. */
const SWAPPED: Readonly<Partial<Record<RolePath, RolePath>>> = {
  'compressor.discharge_temperature': 'compressor.suction_temperature',
  'compressor.suction_temperature': 'compressor.discharge_temperature',
  'refrigerant.condensation_temperature': 'refrigerant.evaporation_temperature',
  'refrigerant.evaporation_temperature': 'refrigerant.condensation_temperature',
};

/** True when the segment carries HTR water on the DHW lines: HTR is active and the production DHW circuit is not (add-schematic-card D7). */
export const carriesHtrWater = (segment: Pick<Segment, 'id'>, circuits: Circuits): boolean =>
  HTR_WATER_SEGMENT_IDS.includes(segment.id) && htrWaterActive(circuits);

/** HTR recovery: HTR is active and the production DHW circuit is not, so the DHW lines and coil carry HTR water. */
export const htrWaterActive = (circuits: Circuits): boolean =>
  circuits.active.has('htr') && !circuits.active.has('production_dhw');

/**
 * The temperature role that colours a segment, from its geometry role and the mode (add-schematic-card D7).
 * - HTR water on the DHW lines takes the DHW temperature.
 * - In active cooling the `reversible` refrigerant legs swap 7 and 8: discharge and suction, condensation and
 *   evaporation.
 * - In passive cooling and defrost the legs from valve 27 to condenser 8 take the production outlet temperature, but
 *   only while valves 27/28 are in the exchanger position (without exchanger 10 the water runs through the bypass).
 */
export function roleFor(
  segment: Pick<Segment, 'id' | 'temperatureRole' | 'reversible'>,
  view: Pick<PipeView, 'mode' | 'circuits'>,
): RolePath {
  if (carriesHtrWater(segment, view.circuits)) return 'dhw.temperature';
  if (segment.reversible === true && view.mode === 'active_cooling') {
    return SWAPPED[segment.temperatureRole] ?? segment.temperatureRole;
  }
  if (
    (view.mode === 'passive_cooling' || view.mode === 'defrost') &&
    view.circuits.valves2728 === 'exchanger' &&
    PRODUCTION_LEGS_27_TO_8.includes(segment.id)
  ) {
    return 'production.outlet_temperature';
  }
  return segment.temperatureRole;
}

/**
 * How a drawn part looks: the geometry's state, except that exchanger 10, valves 27/28 and their pipes (feature
 * `passive_cooling`) are not muted by `unused` in defrost, which uses them.
 */
export function shownState(
  part: Pick<Visibility, 'feature'>,
  state: Exclude<PartState, 'hidden'>,
  mode: Mode,
): Exclude<PartState, 'hidden'> {
  return state === 'muted' && mode === 'defrost' && part.feature === 'passive_cooling' ? 'normal' : state;
}

const numberOf = (readings: Readings, role: RolePath): number | undefined => {
  const value: unknown = readings[role];
  return typeof value === 'number' ? value : undefined;
};

export interface PipeState {
  /** A CSS colour: the scale's, or the muted colour. */
  color: string;
  muted: boolean;
  /** Whether the dash overlay runs. */
  animated: boolean;
  /** The dash period in seconds (`--flow-duration`); set when animated. */
  duration?: number;
  /** The dashes run against the geometry's points. */
  reversed: boolean;
}

/** The state of one drawn segment (its geometry state comes from geometry.ts `drawnSegments`). */
export function pipeState(segment: Segment, state: Exclude<PartState, 'hidden'>, view: PipeView): PipeState {
  const { mode, circuits, readings, stops } = view;
  const tap = TAP_WATER_SEGMENT_IDS.includes(segment.id);
  const shown = shownState(segment, state, mode);
  const active = tap || isSegmentActive(segment, circuits);
  const temperature = numberOf(readings, roleFor(segment, view));
  const muted = shown === 'muted' || !active || temperature === undefined;
  const reversed = (segment.direction === -1) !== (segment.reversible === true && mode === 'active_cooling');
  const base = { color: muted ? MUTED_COLOR : temperatureColor(temperature, stops), muted, reversed };
  if (!active || shown === 'muted' || segment.stub === true || tap) return { ...base, animated: false };
  const htr =
    carriesHtrWater(segment, circuits) || (segment.speedRole === undefined && segment.circuit.includes('htr'));
  const duration = htr
    ? HTR_FLOW_SECONDS
    : segment.speedRole === undefined
      ? undefined
      : flowDuration(numberOf(readings, segment.speedRole));
  return duration === undefined ? { ...base, animated: false } : { ...base, animated: true, duration };
}

/** The colour of the tank body: the DHW temperature on the scale, or the muted colour without it. */
export const tankColor = (view: Pick<PipeView, 'readings' | 'stops'>): string =>
  temperatureColor(numberOf(view.readings, 'dhw.temperature'), view.stops);

/**
 * The colour of coil 51 (model C): the colour of the water feeding it. The DHW temperature during HTR recovery, the
 * production outlet temperature while the production DHW circuit feeds it, muted otherwise. Never animated.
 */
export function coilColor(view: Pick<PipeView, 'circuits' | 'readings' | 'stops'>): string {
  const { circuits, readings, stops } = view;
  if (htrWaterActive(circuits)) return temperatureColor(numberOf(readings, 'dhw.temperature'), stops);
  return circuits.active.has('dhw_coil')
    ? temperatureColor(numberOf(readings, 'production.outlet_temperature'), stops)
    : MUTED_COLOR;
}
