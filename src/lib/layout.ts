// Copied from the hrv-ventilation repo, src/diagram/labels.ts: `isCompact` (the `LayoutChoice` type is `Layout` in
// config/options.ts here). Deviation: the threshold constant, `COMPACT_BELOW`, is this card's own (add-compact-layout D1, D6).
import type { Layout } from '../config/options';

/**
 * With `layout: auto`, cards narrower than this (px) get the compact layout. Measured on 2026-11-11 with
 * `npm run measure-layout` (scripts/measure-layout.mjs): the narrowest width on the 20 px grid from which the
 * full layout at the simplified detail level has no overlapping labels in any emulator scenario.
 */
export const COMPACT_BELOW = 700;

/**
 * True when the card shows the compact layout. With `auto` that depends on the card's width; an unknown width
 * (before the first measurement, or 0 while the card is not displayed) gives the full layout.
 */
export function isCompact(layout: Layout, width: number | undefined): boolean {
  if (layout !== 'auto') return layout === 'compact';
  return width !== undefined && width > 0 && width < COMPACT_BELOW;
}
