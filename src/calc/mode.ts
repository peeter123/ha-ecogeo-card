// The derived operating mode (add-schematic-card D4, operating-mode spec): one mode, the first whose condition holds, in the
// order off, defrost, dhw, active_cooling, heating, passive_cooling, standby. Pure; the inputs are named below.
// `unit.connection` is not an input: it only sets the offline indication (offline).
import type { Features } from '../config/variants';
import type { EntityStateLike } from '../lib/hass';
import type { Readings } from './readings';

const OFFLINE_STATES: readonly string[] = ['off', 'unavailable', 'unknown'];

export const MODES = ['off', 'defrost', 'dhw', 'active_cooling', 'heating', 'passive_cooling', 'standby'] as const;
export type Mode = (typeof MODES)[number];

/** The readings the mode derives from. */
export type ModeInputs = Pick<
  Readings,
  'unit.on_off' | 'compressor.mode' | 'compressor.speed' | 'dhw.demand' | 'unit.summer' | 'production.pump'
>;

const is = (text: string | undefined, expected: string): boolean => text?.trim().toLowerCase() === expected;

/** A speed above 0 counts as running; no value counts as not running. */
export const runs = (speed: number | undefined): boolean => speed !== undefined && speed > 0;

/**
 * The operating mode. Inputs: `unit.on_off`, `compressor.mode`, `compressor.speed`, `dhw.demand`, `unit.summer`,
 * `production.pump` and the `active_cooling` and `passive_cooling` feature states.
 * - `off` when the on/off state reads OFF (EMERGENCY is not off); `defrost` when the compressor mode reads Defrost
 *   (Balance is not defrost); both whatever the other values are.
 * - An unknown compressor speed is `standby`.
 * - Compressor running: `dhw` with DHW demand, else `active_cooling` in summer with active cooling `true`, else
 *   `heating`.
 * - Compressor stopped: `passive_cooling` in summer while the production pump runs and passive cooling is `true`,
 *   else `standby`.
 */
export function deriveMode(readings: ModeInputs, features: Pick<Features, 'active_cooling' | 'passive_cooling'>): Mode {
  if (is(readings['unit.on_off'], 'off')) return 'off';
  if (is(readings['compressor.mode'], 'defrost')) return 'defrost';
  const speed = readings['compressor.speed'];
  if (speed === undefined) return 'standby';
  const summer = readings['unit.summer'] === true;
  if (runs(speed)) {
    if (readings['dhw.demand'] === true) return 'dhw';
    if (summer && features.active_cooling === true) return 'active_cooling';
    return 'heating';
  }
  if (summer && runs(readings['production.pump']) && features.passive_cooling === true) return 'passive_cooling';
  return 'standby';
}

/**
 * The offline indication: the bridge connection entity (`unit.connection`) has a state that reads `off`,
 * `unavailable` or `unknown`. Without an entity, or while Home Assistant does not know it, there is no
 * indication. It never changes the mode.
 */
export function isOffline(connection: EntityStateLike | undefined): boolean {
  return connection !== undefined && OFFLINE_STATES.includes(connection.state.trim().toLowerCase());
}

/** The alarm is on. */
export const isAlarm = (alarm: boolean | undefined): boolean => alarm === true;
