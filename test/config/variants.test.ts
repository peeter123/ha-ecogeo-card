import { describe, expect, test } from 'vitest';
import { resolveConfig } from '../../src/config/resolve';
import { mergeFeatures, variantFeatures } from '../../src/config/variants';

const features = (config: Record<string, unknown>) => resolveConfig({ prefix: 'x', ...config }).features;

describe('variant presets', () => {
  test('variant 4 (the default): everything enabled', () => {
    expect(features({})).toEqual({ active_cooling: true, passive_cooling: true, htr: true, backup_heater: true });
    expect(features({ variant: 4 })).toEqual(variantFeatures(4));
  });

  test('variant 1: no cooling parts, HTR and backup heater enabled', () => {
    expect(features({ variant: 1 })).toEqual({
      active_cooling: false,
      passive_cooling: false,
      htr: true,
      backup_heater: true,
    });
  });

  test('variant 2: passive cooling only', () => {
    const resolved = features({ variant: 2 });
    expect([resolved.passive_cooling, resolved.active_cooling]).toEqual([true, false]);
  });

  test('variant 3: active cooling only', () => {
    const resolved = features({ variant: 3 });
    expect([resolved.active_cooling, resolved.passive_cooling]).toEqual([true, false]);
  });
});

describe('feature states override the preset', () => {
  test('unused part', () => {
    expect(features({ features: { passive_cooling: 'unused' } }).passive_cooling).toBe('unused');
  });

  test('removed part leaves the other parts at the preset', () => {
    expect(features({ variant: 4, features: { htr: false } })).toEqual({
      active_cooling: true,
      passive_cooling: true,
      htr: false,
      backup_heater: true,
    });
  });

  test('an override can enable a part the variant lacks', () => {
    expect(features({ variant: 1, features: { active_cooling: true } }).active_cooling).toBe(true);
    expect(mergeFeatures(1, { passive_cooling: 'unused' }).passive_cooling).toBe('unused');
  });
});
