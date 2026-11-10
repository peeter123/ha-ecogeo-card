// The variant presets (design D3): which cooling parts each of the manual's figures B1-B4 draws
// (manual-figure, section 3.1, page 34). HTR (9, 17, 22, 25) and the backup heater (44, 45) are in all four figures.

/** A feature state: present and in use, not present, or present but never used (drawn muted). */
export type FeatureState = true | false | 'unused';

/** The optional parts of the unit, by feature key. */
export const FEATURE_KEYS = ['active_cooling', 'passive_cooling', 'htr', 'backup_heater'] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type Features = Readonly<Record<FeatureKey, FeatureState>>;

/** The variants of the manual's figures. */
export const VARIANTS = [1, 2, 3, 4] as const;
export type Variant = (typeof VARIANTS)[number];

/** The preset of a variant: active cooling (item 14) and passive cooling (items 10, 27, 28) differ, the rest does not. */
export function variantFeatures(variant: Variant): Features {
  return {
    active_cooling: variant === 3 || variant === 4,
    passive_cooling: variant === 2 || variant === 4,
    htr: true,
    backup_heater: true,
  };
}

/** The preset with the overrides applied: a key set in `overrides` replaces that part only. */
export function mergeFeatures(
  variant: Variant,
  overrides: Readonly<Partial<Record<FeatureKey, FeatureState>>>,
): Features {
  return { ...variantFeatures(variant), ...overrides };
}
