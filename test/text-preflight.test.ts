import { describe, expect, test } from 'vitest';
import { SMOOTHING_MESSAGE, smoothingProblem } from './text-preflight';

describe('browser text preflight', () => {
  test('whole widths in Chromium fail with the font smoothing message', () => {
    expect(smoothingProblem(true, true, [58, 120])).toBe(SMOOTHING_MESSAGE);
    expect(SMOOTHING_MESSAGE).toMatch(/font smoothing/);
    expect(SMOOTHING_MESSAGE).toMatch(/remote desktop \(RDP\)/);
    expect(SMOOTHING_MESSAGE).toMatch(/allow font smoothing:i:1/);
  });

  test('a fractional width in Chromium passes', () => {
    expect(smoothingProblem(true, true, [56.04, 118.7])).toBeNull();
    expect(smoothingProblem(true, true, [58, 118.7])).toBeNull();
  });

  test('Chromium on Linux passes with whole widths', () => {
    expect(smoothingProblem(true, false, [58, 120])).toBeNull();
  });

  test('other engines pass even with whole widths', () => {
    expect(smoothingProblem(false, true, [58, 120])).toBeNull();
  });
});
