// Valve positions and active circuits (add-schematic-card D4, operating-mode spec): pure functions of the derived mode, the
// feature states, the DHW storage and the readings. Rendering reads only these outputs.
import type { DhwStorage } from '../config/options';
import type { Features } from '../config/variants';
import type { Mode } from './mode';
import { runs } from './mode';
import type { Readings } from './readings';

export const CIRCUIT_IDS = [
  'refrigerant',
  'brine',
  'production_dg1',
  'production_dhw',
  'dhw_coil',
  'exchanger_10',
  'htr',
] as const;
export type CircuitId = (typeof CIRCUIT_IDS)[number];

export interface Circuits {
  /** Valve 26: towards ports 5/6 (`dhw`) or ports 1/2 (`production`). */
  valve26: 'production' | 'dhw';
  /** Valve 14: reversed in active cooling only. */
  valve14: 'normal' | 'reversed';
  /** Valves 27/28: through exchanger 10 in passive cooling and defrost, when the part is drawn. */
  valves2728: 'closed' | 'exchanger';
  /** The active circuits; every other circuit is muted. */
  active: ReadonlySet<CircuitId>;
}

/** The readings the circuits derive from. */
export type CircuitInputs = Pick<Readings, 'brine.pump' | 'heating.capacity' | 'htr.active'>;

/**
 * Whether HTR recovery runs: HTR is `true`, there is DHW storage in use and `htr.active` is on, or, when that role has
 * no entity, the condensation capacity is above 0 W in active_cooling (used in heating and active_cooling only).
 */
function htrRecovering(
  mode: Mode,
  htr: Features['htr'],
  hasDhw: boolean,
  readings: CircuitInputs,
  htrActivePresent: boolean,
): boolean {
  if (htr !== true || !hasDhw) return false;
  if (htrActivePresent) return readings['htr.active'] === true;
  return mode === 'active_cooling' && (readings['heating.capacity'] ?? 0) > 0;
}

/** The circuits a mode activates before the brine pump limit, in this order, which the active set keeps (it is visible in the markup). */
function circuitsOfMode(mode: Mode, hasDhw: boolean, htrRuns: boolean, exchanger10: boolean): CircuitId[] {
  switch (mode) {
    case 'heating':
    case 'active_cooling':
      return ['refrigerant', 'brine', 'production_dg1', ...(htrRuns ? (['htr', 'dhw_coil'] as const) : [])];
    case 'dhw':
      return ['refrigerant', 'brine', ...(hasDhw ? (['production_dhw', 'dhw_coil'] as const) : [])];
    case 'passive_cooling':
    case 'defrost':
      return ['brine', 'production_dg1', ...(exchanger10 ? (['exchanger_10'] as const) : [])];
    case 'off':
    case 'standby':
      return [];
  }
}

/**
 * Valve positions and active circuits for a mode. Inputs: the mode, `htr`, `passive_cooling` (exchanger 10 with
 * valves 27/28), the DHW storage, `brine.pump`, `htr.active` (item 9) with whether that role has an entity, and
 * `heating.capacity` (the condensation capacity, only for the fallback).
 * - heating: refrigerant, brine, production_dg1. dhw: refrigerant, brine, production_dhw, dhw_coil (without DHW
 *   storage in use there is no DHW loop). active_cooling: the same as heating. In heating and active_cooling, htr and
 *   dhw_coil are added when HTR is `true`, there is DHW storage in use (external or internal; not none or unused) and
 *   `htr.active` is on (off, unknown and unavailable leave them out). When `htr.active` has no entity
 *   (`htrActivePresent` false), the condensation capacity above 0 W decides instead, in active_cooling only. The role
 *   is ignored in every other mode: in dhw it stays on for 25-30 s after DHW demand starts. passive_cooling and
 *   defrost: brine, production_dg1 and exchanger_10 (not when passive cooling is `false`; `unused` still takes part in
 *   defrost). off and standby: none.
 * - The brine circuit is active only while the brine pump runs, unless the brine pump role is `none` (`brinePumpPresent`
 *   false): then the mode alone decides.
 * - Valve 26 points to ports 1/2 in every mode but dhw (also in defrost and HTR recovery).
 */
export function circuitsFor(
  mode: Mode,
  features: Pick<Features, 'htr' | 'passive_cooling'>,
  dhw: DhwStorage,
  readings: CircuitInputs,
  /** False when the brine pump role is `none`: with no pump to read, the brine circuit is not limited by it. */
  brinePumpPresent: boolean,
  /** False when the `htr.active` role has no entity (an optional role, see `absentOptionalRoles`): the fallback rule applies. */
  htrActivePresent: boolean,
): Circuits {
  const exchanger10 = features.passive_cooling !== false;
  const hasDhw = dhw === 'external' || dhw === 'internal';
  const htrRuns = htrRecovering(mode, features.htr, hasDhw, readings, htrActivePresent);
  const active = new Set<CircuitId>(circuitsOfMode(mode, hasDhw, htrRuns, exchanger10));
  if (brinePumpPresent && !runs(readings['brine.pump'])) active.delete('brine');
  const viaExchanger = (mode === 'passive_cooling' || mode === 'defrost') && exchanger10;
  return {
    valve26: mode === 'dhw' ? 'dhw' : 'production',
    valve14: mode === 'active_cooling' ? 'reversed' : 'normal',
    valves2728: viaExchanger ? 'exchanger' : 'closed',
    active,
  };
}
