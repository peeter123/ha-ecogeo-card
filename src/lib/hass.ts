// Copied from hrv-ventilation src/lib/hass.ts: the types and stateOf; formatState and the fan helper are dropped
// (labels use the card's own formatting, design D6), and the more-info event helper is added.
// The parts of Home Assistant's `hass` object the card uses. HA's frontend types are not published as a package,
// so the card declares what it reads. Fields are added here as the card starts to use them.

/** A state object as in `hass.states[entity_id]`. */
export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Readonly<Record<string, unknown>> & { unit_of_measurement?: string; friendly_name?: string };
  last_changed?: string;
  last_updated?: string;
}

/** The parts of a state object a value is read from (state and unit). */
export type EntityStateLike = Pick<HassEntityState, 'state' | 'attributes'>;

/** The `hass` object passed to the card. */
export interface HassLike {
  states: Readonly<Record<string, HassEntityState | undefined>>;
  /** Entity registry entries (display precision, name); HA builds new entry objects on every registry update. */
  entities?: Readonly<Record<string, unknown>>;
  /** Language and number format; replaced when the user changes them. */
  locale?: unknown;
  /** The UI language; older versions have it without `locale`. */
  language?: string;
  themes?: { darkMode?: boolean };
  /** Replaced when translations load. */
  localize?: unknown;
  /** HA's own state formatting (unit, precision, translated states); replaced when translations load. */
  formatEntityState?: (stateObj: HassEntityState) => string;
}

/** The state object of an entity, or undefined without an ID or while Home Assistant does not know the entity. */
export const stateOf = <S>(
  states: Readonly<Record<string, S | undefined>>,
  entityId: string | undefined,
): S | undefined => (entityId === undefined ? undefined : states[entityId]);

/** Asks Home Assistant to open the more-info dialog of an entity: the card's only interaction. */
export function fireMoreInfo(source: EventTarget, entityId: string): void {
  source.dispatchEvent(new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }));
}
