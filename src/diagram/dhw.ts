// The DHW storage (design D5, D7; dhw-storage spec): an external tank with a coil right of the cabinet (model B,
// connections 5 "DHW inter-accumulator outlet" and 6 "inlet"), the integrated tank of model C, or none.
//
// - External: this file draws the tank body and its caption. The pipes from ports 5/6 (up into the run and right to
//   the zone) and the coil inside the tank are segments in geometry.ts (dhw_ext_in, dhw_ext_coil, dhw_ext_out), so
//   group 6 colours and animates them like every other pipe. The tank is not a manual item.
// - Internal (model C): items 50 (tank), 51 (coil), 52 (manual trap), 53 (drain valve), 54 (DHW probe) and the
//   connections 47/48/49 are components in geometry.ts, drawn by the cabinet with the symbols of symbols.ts.
// - None: nothing is drawn (no tank, no pipes, no ports 5/6, no valve 26).
//
// The tank body hook for group 6 (design D7: the body takes the DHW temperature on the card's colour scale): both
// tank bodies are a `.tank-body` rect with a `data-dhw-tank` attribute, filled from the custom property
// `--dhw-tank-color` (no fill while it is not set). A muted body (DHW temperature unavailable) gets the muted colour
// through the same property. The values (temperature, setpoint, start delta-T, demand) go under the external tank
// (x 806-984, y 340-420), and inside the cabinet at the top for the internal one, in group 6.
import { css, svg, type SVGTemplateResult } from 'lit';
import { DHW_LABELS } from '../strings';
import { EXTERNAL_TANK, type DrawContext } from './geometry';

export const dhwStyles = css`
  .tank-body {
    stroke: var(--primary-text-color);
    stroke-width: 2;
  }
  .tank-caption {
    fill: var(--secondary-text-color);
    font-size: 11px;
  }
`;

/** The DHW storage outside the cabinet: the external tank's body and caption; the other storages draw nothing here. */
export function renderDhw(context: DrawContext): SVGTemplateResult {
  if (context.dhw !== 'external') return svg``;
  const { x, y, width, height } = EXTERNAL_TANK;
  return svg`<g class="dhw-storage" data-dhw="external">
    <rect class="tank-body" data-dhw-tank="external" x=${x} y=${y} width=${width} height=${height} rx="22" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />
    <text class="tank-caption" x=${x + width / 2} y=${y - 6} text-anchor="middle">${DHW_LABELS.externalTank}</text>
  </g>`;
}
