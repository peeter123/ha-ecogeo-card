// The drawing's width in a panel view (refine-simplified-layout D9, responsive-layout "Panel view fits the screen").
import { describe, expect, test } from 'vitest';
import {
  DEFAULT_HEADER_HEIGHT,
  FOOTER_ALLOWANCE,
  MIN_DRAWING_WIDTH,
  drawingWidth,
  type DrawingFit,
} from '../../src/lib/layout';

const SIMPLIFIED = { width: 1000, height: 545 };
const FULL = { width: 1000, height: 620 };
const fit = (changes: Partial<DrawingFit> = {}): DrawingFit => ({
  isPanel: true,
  cardWidth: 1280,
  windowHeight: 800,
  headerHeight: 56,
  viewBox: SIMPLIFIED,
  ...changes,
});

describe('drawingWidth', () => {
  test('panel off: the drawing fills the card whatever the window height', () => {
    expect(drawingWidth(fit({ isPanel: false }))).toBe(1280);
    expect(drawingWidth(fit({ isPanel: false, windowHeight: 300 }))).toBe(1280);
  });

  test('panel with a tall window: the card is the limit', () => {
    expect(drawingWidth(fit({ windowHeight: 1400 }))).toBe(1280);
    expect(drawingWidth(fit({ windowHeight: 1000, cardWidth: 1000 }))).toBe(1000);
  });

  test('panel with a short window: the height is the limit, from the arrangement ratio', () => {
    expect(drawingWidth(fit())).toBe(Math.floor(((800 - 56 - FOOTER_ALLOWANCE) * 1000) / 545));
    expect(drawingWidth(fit({ viewBox: FULL }))).toBe(Math.floor(((800 - 56 - FOOTER_ALLOWANCE) * 1000) / 620));
    expect(drawingWidth(fit({ windowHeight: 600 }))).toBe(Math.floor(((600 - 56 - FOOTER_ALLOWANCE) * 1000) / 545));
  });

  test('the drawing, the header and the footer allowance fill the window height at most', () => {
    for (const windowHeight of [500, 600, 700, 800, 900]) {
      const width = drawingWidth(fit({ windowHeight }));
      expect((width * SIMPLIFIED.height) / SIMPLIFIED.width + 56 + FOOTER_ALLOWANCE).toBeLessThanOrEqual(windowHeight);
    }
  });

  test('an unset --header-height counts as 56 px', () => {
    expect(DEFAULT_HEADER_HEIGHT).toBe(56);
    expect(drawingWidth(fit({ headerHeight: undefined }))).toBe(drawingWidth(fit({ headerHeight: 56 })));
    expect(drawingWidth(fit({ headerHeight: 0 }))).toBe(drawingWidth(fit({ headerHeight: 56 })));
    expect(drawingWidth(fit({ headerHeight: 96 }))).toBeLessThan(drawingWidth(fit({ headerHeight: 56 })));
  });

  test('the safe-area inset is added to the header (0 when unset)', () => {
    expect(drawingWidth(fit({ safeAreaTop: undefined }))).toBe(drawingWidth(fit()));
    expect(drawingWidth(fit({ safeAreaTop: 40 }))).toBe(Math.floor(((800 - 56 - 40 - FOOTER_ALLOWANCE) * 1000) / 545));
  });

  test('a window too short for anything legible gets the floor, never more than the card', () => {
    expect(MIN_DRAWING_WIDTH).toBe(320);
    expect(drawingWidth(fit({ windowHeight: 100 }))).toBe(MIN_DRAWING_WIDTH);
    expect(drawingWidth(fit({ windowHeight: 100, cardWidth: 200 }))).toBe(200);
  });

  test('an unknown card width is 0 (unknown); an unknown window height gives the card width', () => {
    expect(drawingWidth(fit({ cardWidth: 0 }))).toBe(0);
    expect(drawingWidth(fit({ cardWidth: undefined }))).toBe(0);
    expect(drawingWidth(fit({ windowHeight: 0 }))).toBe(1280);
  });

  test('the footer allowance holds two footer lines', () => {
    // two lines of about 20 px and 8 + 12 px of padding
    expect(FOOTER_ALLOWANCE).toBeGreaterThanOrEqual(2 * 20 + 8 + 12);
  });
});
