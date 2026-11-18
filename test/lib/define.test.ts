// Copied from hrv-ventilation test/lib/define.test.ts
import { afterEach, describe, expect, test, vi } from 'vitest';
import { defineOnce } from '../../src/lib/define';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('defineOnce', () => {
  test('defines a tag once; defining the same class again is silent', () => {
    class First extends HTMLElement {}
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(defineOnce('ecogeo-define-test-a', First)).toBe(true);
    expect(defineOnce('ecogeo-define-test-a', First)).toBe(false);
    expect(customElements.get('ecogeo-define-test-a')).toBe(First);
    expect(warn).not.toHaveBeenCalled();
  });

  test('a second copy of a class keeps the first and warns', () => {
    class First extends HTMLElement {}
    class Second extends HTMLElement {}
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    defineOnce('ecogeo-define-test-b', First);
    let defined = true;
    expect(() => {
      defined = defineOnce('ecogeo-define-test-b', Second);
    }).not.toThrow();
    expect(defined).toBe(false);
    expect(customElements.get('ecogeo-define-test-b')).toBe(First);
    expect(warn).toHaveBeenCalledOnce();
  });
});
