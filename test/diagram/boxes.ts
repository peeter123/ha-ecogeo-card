// A symbol's drawn extent as a box in viewBox units (from symbols.ts), shared by the tests that check where parts lie.
import type { Component, Point } from '../../src/diagram/geometry';

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A symbol's drawn extent in its own frame (before the turn), from symbols.ts. */
export function localBox(part: Component): [number, number, number, number] {
  switch (part.kind) {
    case 'pump':
      return [-12, -12, 12, 12];
    case 'valve3':
      return [-12, -21, 12, 12];
    case 'inversion_valve':
    case 'compressor':
      return [-14, -14, 14, 14];
    case 'probe_t':
    case 'transducer_p':
      return [-9, -9, 9, 16];
    case 'thermostat':
      return [-7, -7, 7, 16];
    case 'exchanger': {
      const span = (part.size ?? 34) + 9;
      return [-20, -span, 20, span];
    }
    case 'valve':
    case 'drain_valve':
      return [-6, -9, 6, 9];
    case 'resistor':
      return [-28, -6, 28, 6];
    case 'filter_dryer':
      return [-14, -5, 14, 5];
    case 'expansion_valve':
      return [-12, -6, 12, 6];
    case 'port':
      return [-5, -6, 5, 0];
    default:
      return [0, 0, 0, 0];
  }
}

export function boxOf(part: Component): Box {
  const [a, b, c, d] = localBox(part);
  const corners = (
    [
      [a, b],
      [c, d],
    ] as const
  ).map(([x, y]): Point => {
    switch (part.rotation) {
      case 0:
        return [x, y];
      case 90:
        return [-y, x];
      case 180:
        return [-x, -y];
      case 270:
        return [y, -x];
    }
  });
  const xs = corners.map((corner) => corner[0] + part.x);
  const ys = corners.map((corner) => corner[1] + part.y);
  return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}

export const apart = (u: Box, v: Box): boolean => u.x1 <= v.x0 || v.x1 <= u.x0 || u.y1 <= v.y0 || v.y1 <= u.y0;
