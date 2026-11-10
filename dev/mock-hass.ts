// Adapted from hrv-ventilation dev/mock-hass.ts. A mock `hass` for the preview page: no entities yet (the
// scenarios arrive with the emulator task group). A state object is replaced only when its value changes, as Home
// Assistant does, so the card's re-render rule is exercised too.
import type { HassEntityState, HassLike } from '../src/lib/hass';

const LOCALE = { language: 'en', number_format: 'language' };

export class MockHass {
  private states: Record<string, HassEntityState> = {};

  /** A `hass` with the given states (none by default); unchanged states keep their object. */
  build(readings: Readonly<Record<string, Omit<HassEntityState, 'entity_id'>>> = {}, darkMode = false): HassLike {
    const next: Record<string, HassEntityState> = {};
    for (const [entityId, reading] of Object.entries(readings)) {
      const previous = this.states[entityId];
      const same =
        previous?.state === reading.state && JSON.stringify(previous.attributes) === JSON.stringify(reading.attributes);
      next[entityId] = previous && same ? previous : { entity_id: entityId, ...reading };
    }
    this.states = next;
    return { states: next, locale: LOCALE, language: 'en', themes: { darkMode } };
  }
}
