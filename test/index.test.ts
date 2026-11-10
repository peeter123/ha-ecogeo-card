import { describe, expect, test } from 'vitest';
import { CARD_ENTRY, registerCardPicker, type CustomCardEntry } from '../src/index';

describe('the bundle entry', () => {
  test('registers the ecogeo-card element and its picker entry', () => {
    expect(customElements.get('ecogeo-card')).toBeDefined();
    expect(window.customCards?.some((entry) => entry.type === 'ecogeo-card')).toBe(true);
  });

  test('the picker entry shows a live preview of the schematic', () => {
    expect(CARD_ENTRY.preview).toBe(true);
  });

  test('adds the picker entry once, next to other cards', () => {
    const target: { customCards?: CustomCardEntry[] } = {
      customCards: [{ type: 'x', name: 'x', description: '', preview: false }],
    };
    registerCardPicker(target);
    registerCardPicker(target);
    expect(target.customCards?.map((entry) => entry.type)).toEqual(['x', CARD_ENTRY.type]);
  });
});
