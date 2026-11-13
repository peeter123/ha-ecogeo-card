// The state values that mean off and defrost (the `states` option, card-config; add-entity-discovery D4).
import { DEFAULT_STATE_VALUES } from '../strings';

/** The state values that mean off and defrost. */
export interface StateLists {
  off: readonly string[];
  defrost: readonly string[];
}

/** The defaults of the `states` option: the firmware's texts. */
export const DEFAULT_STATES: StateLists = DEFAULT_STATE_VALUES;
