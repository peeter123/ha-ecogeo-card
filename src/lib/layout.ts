// Copied from the hrv-ventilation repo, src/diagram/labels.ts: `isCompact` (the `LayoutChoice` type is `Layout` in
// config/options.ts here). Deviation: the threshold constant, `COMPACT_BELOW`, is this card's own (add-compact-layout D1, D6).
// `nextCompact`, `strokeWidths` and the other constants are this card's own, not from hrv-ventilation.
import type { Layout } from '../config/options';

/**
 * With `layout: auto`, cards narrower than this (px) get the compact layout. Measured on 2026-11-13 with
 * `npm run measure-layout` (scripts/measure-layout.mjs): the narrowest width on the 20 px grid from which the
 * full layout at the simplified detail level has no label that overlaps another label, a component, a pipe or a
 * caption in any emulator scenario (refine-simplified-layout D4, D6).
 */
export const COMPACT_BELOW = 600;

/**
 * True when the card shows the compact layout. With `auto` that depends on the card's width; an unknown width
 * (before the first measurement, or 0 while the card is not displayed) gives the full layout.
 */
export function isCompact(layout: Layout, width: number | undefined): boolean {
  if (layout !== 'auto') return layout === 'compact';
  return width !== undefined && width > 0 && width < COMPACT_BELOW;
}

/**
 * With `layout: auto`, a card that is already compact returns to full only at `COMPACT_BELOW` plus this many px
 * (add-compact-layout D1). Going compact still happens below `COMPACT_BELOW`. It keeps the layout from flipping back and
 * forth when a page scrollbar appears and disappears with the layout's height, which changes the width by about 15-17 px.
 */
export const COMPACT_HYSTERESIS = 24;

/**
 * The layout decision with hysteresis: like `isCompact`, but with `auto` a card that is `currentlyCompact` stays compact
 * until it is `COMPACT_HYSTERESIS` px wider than `COMPACT_BELOW`. An unknown width gives the full layout.
 */
export function nextCompact(layout: Layout, width: number | undefined, currentlyCompact: boolean): boolean {
  if (layout !== 'auto') return layout === 'compact';
  if (width === undefined || !(width > 0)) return false;
  return width < COMPACT_BELOW + (currentlyCompact ? COMPACT_HYSTERESIS : 0);
}

/** The stroke widths of the drawing's pipes and outlines, in drawing units (add-compact-layout D4). */
export interface StrokeWidths {
  pipe: number;
  outline: number;
}

/** The widths the drawing is designed with (they apply from a card width of 1000 * 2 / 3 px up, and while the width is unknown). */
export const DEFAULT_STROKES: StrokeWidths = { pipe: 3, outline: 2 };

/** The thinnest a pipe and an outline may render, in px. */
const MIN_PIPE_PX = 2;
const MIN_OUTLINE_PX = 1.25;

/** Rounds up to 0.1, so the rendered minimum is still met after rounding (the epsilon absorbs float noise). */
const ceilTenth = (value: number): number => Math.ceil(value * 10 - 1e-9) / 10;

/**
 * The stroke widths in drawing units for a card `width` px wide: `scale = width / 1000`, pipe `max(3, 2 / scale)` and
 * outline `max(2, 1.25 / scale)`, rounded up to 0.1. An unknown width (undefined or 0) gives the designed widths.
 */
export function strokeWidths(width: number | undefined): StrokeWidths {
  if (width === undefined || !(width > 0)) return DEFAULT_STROKES;
  const scale = width / 1000;
  return {
    pipe: Math.max(DEFAULT_STROKES.pipe, ceilTenth(MIN_PIPE_PX / scale)),
    outline: Math.max(DEFAULT_STROKES.outline, ceilTenth(MIN_OUTLINE_PX / scale)),
  };
}
