// The marker of an obstacle inside a drawn body (rework-layouts D4), shared by the bodies of the band: an invisible box that
// the overlap check and the place search (dev/overlaps.ts) count as a part of its own, so that a label inside the body keeps
// clear of its coil, fan, hatching, serpentine, divider or columns.
import { svg, type SVGTemplateResult } from 'lit';

/** An invisible box that registers an obstacle inside a body for the overlap check (dev/overlaps.ts). */
export const obstacle = (
  name: string,
  rect: { x: number; y: number; width: number; height: number },
): SVGTemplateResult =>
  svg`<rect class="obstacle" data-obstacle=${name} x=${rect.x} y=${rect.y} width=${rect.width} height=${rect.height} fill="none" stroke="none" />`;
