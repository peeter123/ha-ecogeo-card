// Copied from the hrv-ventilation repo, src/diagram/labels.ts: `isCompact` (the `LayoutChoice` type is `Layout` in
// config/options.ts here). Deviations: the threshold constants, `COMPACT_BELOW` and `COMPACT_BELOW_FULL`, are this card's own
// (add-compact-layout D1, D6), and `isCompact` takes the configured detail level as a third parameter and compares the width
// with that level's threshold, `compactBelow(detail)` (refine-simplified-layout D11).
// `nextCompact`, `strokeWidths` and the other constants are this card's own, not from hrv-ventilation.
import type { Detail, Layout } from '../config/options';

/**
 * With `layout: auto`, cards narrower than this (px) get the compact layout at the simplified detail level. Measured on 2026-11-13 with
 * `npm run measure-layout` (scripts/measure-layout.mjs): the narrowest width on the 20 px grid from which the
 * full layout at the simplified detail level has no label that overlaps another label, a component, a pipe or a
 * caption in any emulator scenario (refine-simplified-layout D4, D6).
 */
export const COMPACT_BELOW = 600;

/**
 * The same threshold for `detail: full` (refine-simplified-layout D11). Measured on 2026-11-17 with
 * `npm run measure-layout -- --detail=full`: the narrowest width on the 20 px grid from which the full layout at the full
 * detail level (with FULL_PLACES) has no label that overlaps another label, a component, a pipe or a caption in any
 * emulator scenario, up to 800 px.
 */
export const COMPACT_BELOW_FULL = 640;

/** The width below which `layout: auto` goes compact at a detail level: `COMPACT_BELOW` (simplified) or `COMPACT_BELOW_FULL` (full). */
export function compactBelow(detail: Detail): number {
  return detail === 'full' ? COMPACT_BELOW_FULL : COMPACT_BELOW;
}

/**
 * True when the card shows the compact layout. With `auto` that depends on the card's width and the configured detail
 * level's threshold; an unknown width (before the first measurement, or 0 while the card is not displayed) gives the full layout.
 */
export function isCompact(layout: Layout, width: number | undefined, detail: Detail): boolean {
  if (layout !== 'auto') return layout === 'compact';
  return width !== undefined && width > 0 && width < compactBelow(detail);
}

/**
 * With `layout: auto`, a card that is already compact returns to full only at the detail level's threshold plus this many px
 * (add-compact-layout D1). Going compact still happens below the threshold. It keeps the layout from flipping back and
 * forth when a page scrollbar appears and disappears with the layout's height, which changes the width by about 15-17 px.
 */
export const COMPACT_HYSTERESIS = 24;

/**
 * The layout decision with hysteresis: like `isCompact`, but with `auto` a card that is `currentlyCompact` stays compact
 * until it is `COMPACT_HYSTERESIS` px wider than the detail level's threshold. An unknown width gives the full layout.
 */
export function nextCompact(
  layout: Layout,
  width: number | undefined,
  currentlyCompact: boolean,
  detail: Detail,
): boolean {
  if (layout !== 'auto') return layout === 'compact';
  if (width === undefined || !(width > 0)) return false;
  return width < compactBelow(detail) + (currentlyCompact ? COMPACT_HYSTERESIS : 0);
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

/** Home Assistant's header height in px, used when `--header-height` is unset (refine-simplified-layout D9). */
export const DEFAULT_HEADER_HEIGHT = 56;

/**
 * What a panel view keeps free below the drawing, in px: the footer and the card's padding. One footer line is about 20 px
 * with 8 + 12 px of padding, so 40 px; the footer wraps to two lines for the longer modes (Passive cooling) at
 * card widths of 600-620 px (the footer is as wide as the card), 60 px, and the allowance covers that case with a few px to spare. So the footer stays on screen even
 * when it wraps, and a one-line footer leaves up to 24 px of empty space under it (refine-simplified-layout D9).
 */
export const FOOTER_ALLOWANCE = 64;

/** The narrowest a panel's drawing is made, px: the narrowest width verified for the compact layout; a window too short for it gets this and scrolls (a floor, not a goal). */
export const MIN_DRAWING_WIDTH = 320;

/** The inputs of the drawing's width. */
export interface DrawingFit {
  /** True when Home Assistant shows the card in a panel view. */
  isPanel: boolean;
  /** The card's width in px; 0 or undefined while it is unknown. */
  cardWidth: number | undefined;
  /** The window's inner height in px. */
  windowHeight: number;
  /** Home Assistant's `--header-height` in px; undefined (or not a positive number) when unset. */
  headerHeight: number | undefined;
  /** Home Assistant's `--safe-area-inset-top` in px (a device's top inset, added to the header); undefined counts as 0. */
  safeAreaTop?: number | undefined;
  /** The viewBox of the arrangement the drawing uses. */
  viewBox: { width: number; height: number };
}

/**
 * The width of the drawing in px (refine-simplified-layout D9). Outside a panel view it is the card's width. In a panel view
 * it is the smaller of the card's width and the width at which the drawing, the footer allowance and the header (plus the safe-area inset) fill the
 * window's height: `(windowHeight - headerHeight - safeAreaTop - FOOTER_ALLOWANCE) * viewBox.width / viewBox.height`, rounded down to
 * whole px and at least `MIN_DRAWING_WIDTH` (but never wider than the card). An unknown card width gives 0 (unknown), which
 * `nextCompact` and `strokeWidths` treat as before the first measurement.
 */
export function drawingWidth(fit: DrawingFit): number {
  const { cardWidth, viewBox } = fit;
  if (cardWidth === undefined || !(cardWidth > 0)) return 0;
  if (!fit.isPanel || !(fit.windowHeight > 0)) return cardWidth;
  const header = fit.headerHeight !== undefined && fit.headerHeight > 0 ? fit.headerHeight : DEFAULT_HEADER_HEIGHT;
  const inset = fit.safeAreaTop !== undefined && fit.safeAreaTop > 0 ? fit.safeAreaTop : 0;
  const fitted = Math.floor(((fit.windowHeight - header - inset - FOOTER_ALLOWANCE) * viewBox.width) / viewBox.height);
  return Math.min(cardWidth, Math.max(fitted, MIN_DRAWING_WIDTH));
}
