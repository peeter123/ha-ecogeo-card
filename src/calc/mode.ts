// The derived operating mode (add-schematic-card D4, operating-mode spec): one mode, the first whose condition holds, in the
// order off, defrost, dhw, active_cooling, heating, passive_cooling, standby. Pure; the inputs are named below.
// `unit.connection` is not an input: it only sets the offline indication (offline).
import { DEFAULT_STATES, type StateLists } from '../config/states';
import type { Features } from '../config/variants';
import type { EntityStateLike } from '../lib/hass';
import { isUnavailable } from '../lib/availability';
import { onOffOf, type Readings } from './readings';

export const MODES = ['off', 'defrost', 'dhw', 'active_cooling', 'heating', 'passive_cooling', 'standby'] as const;
export type Mode = (typeof MODES)[number];

/** The readings the mode derives from. */
export type ModeInputs = Pick<
  Readings,
  | 'unit.on_off'
  | 'compressor.mode'
  | 'compressor.speed'
  | 'compressor.percentage'
  | 'compressor.power'
  | 'dhw.demand'
  | 'unit.summer'
  | 'production.pump'
>;

/** The compressor power above which it counts as running: below it is the standby draw of the electronics and a crankcase heater (derived). */
export const RUNNING_POWER = 100;

const matches = (value: string | boolean | undefined, list: readonly string[]): boolean =>
  typeof value === 'string' && list.some((text) => text.trim().toLowerCase() === value.trim().toLowerCase());

/** A speed above 0 counts as running, and so does an on/off entity that reads on; no value counts as not running. */
export const runs = (speed: number | boolean | undefined): boolean =>
  speed === true || (typeof speed === 'number' && speed > 0);

/**
 * Whether the compressor runs, from the first of these that has a value: the speed (above 0, or on), the percentage
 * (above 0), the power (above 100 W). Undefined when none has a value (add-entity-discovery D5).
 */
export function compressorRuns(
  readings: Pick<ModeInputs, 'compressor.speed' | 'compressor.percentage' | 'compressor.power'>,
): boolean | undefined {
  const speed = readings['compressor.speed'];
  if (speed !== undefined) return runs(speed);
  const percentage = readings['compressor.percentage'];
  if (percentage !== undefined) return percentage > 0;
  const power = readings['compressor.power'];
  return power === undefined ? undefined : power > RUNNING_POWER;
}

/**
 * The operating mode. Inputs: `unit.on_off`, `compressor.mode`, `compressor.speed`, `compressor.percentage`,
 * `compressor.power`, `dhw.demand`, `unit.summer`, `production.pump`, the `states` lists and the `active_cooling` and
 * `passive_cooling` feature states.
 * - `off` when the on/off state matches `states.off` (default OFF; EMERGENCY is not off) or its on/off entity reads
 *   off; `defrost` when the compressor mode matches `states.defrost` (default Defrost; Balance is not defrost) or its
 *   on/off entity reads on; both whatever the other values are.
 * - Compressor running (compressorRuns): `dhw` with DHW demand, else `active_cooling` in summer with active cooling
 *   `true`, else `heating`. An unknown running state is `standby`.
 * - Compressor stopped: `passive_cooling` in summer while the production pump runs and passive cooling is `true`,
 *   else `standby`.
 */
export function deriveMode(
  readings: ModeInputs,
  features: Pick<Features, 'active_cooling' | 'passive_cooling'>,
  states: StateLists = DEFAULT_STATES,
): Mode {
  const onOff = readings['unit.on_off'];
  if (onOff === false || matches(onOff, states.off)) return 'off';
  const compressorMode = readings['compressor.mode'];
  if (compressorMode === true || matches(compressorMode, states.defrost)) return 'defrost';
  const running = compressorRuns(readings);
  if (running === undefined) return 'standby';
  const summer = readings['unit.summer'] === true;
  if (running) {
    if (readings['dhw.demand'] === true) return 'dhw';
    if (summer && features.active_cooling === true) return 'active_cooling';
    return 'heating';
  }
  if (summer && runs(readings['production.pump']) && features.passive_cooling === true) return 'passive_cooling';
  return 'standby';
}

/**
 * The offline indication: the bridge connection entity (`unit.connection`) reads off (`off`, `false`, `no`, `0`) or
 * is `unavailable` or `unknown`. Without an entity, or while Home Assistant does not know it, there is no
 * indication. It never changes the mode.
 */
export function isOffline(connection: EntityStateLike | undefined): boolean {
  return (
    connection !== undefined &&
    (onOffOf(connection) === false || isUnavailable({ state: connection.state.trim().toLowerCase() }))
  );
}

/** The alarm is on. */
export const isAlarm = (alarm: boolean | undefined): boolean => alarm === true;
