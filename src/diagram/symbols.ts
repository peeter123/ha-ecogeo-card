// The SVG symbols of the drawing (design D6): one function per kind of component, each returning a group centred on
// the origin and turned by the component's rotation. Strokes use `currentColor`, so the caller sets the colour (the
// theme's text colour, or the muted colour) through CSS. The shapes follow the manual's symbols (section 3.1) in a
// simplified form. The letters of probes and switches stay upright whatever the rotation.
import { nothing, svg, type SVGTemplateResult } from 'lit';
import { HELIX_BACK_OPACITY, INTERNAL_TANK, helixHalves, type ComponentKind, type Rotation } from './geometry';

/** The ports of a three-way valve in its own frame: left, right and down (valve 26 is turned to put them up, down and right). */
export type ValvePort = 'l' | 'r' | 'd';

export interface SymbolOptions {
  rotation?: Rotation;
  /** An exchanger's half span between its top and bottom ports. */
  size?: number;
  /** A three-way valve: the ports that are open to each other. */
  open?: readonly ValvePort[];
  /** An inversion valve: the position (reversed in active cooling). */
  reversed?: boolean;
  /** An exchanger: the paint of its left and right half (a `url(#gradient)` or a colour), drawn under the plates and ports. */
  fills?: { left: string; right: string };
}

/** The opacity of an exchanger's side fill: low enough that the plate lines and ports stay readable (design D4). */
export const EXCHANGER_FILL_OPACITY = 0.55;

/** The rounded half of an exchanger body, inside its outline (x from -20 to 0 for the left half, 0 to 20 for the right). */
function exchangerHalf(half: 'left' | 'right', span: number, paint: string): SVGTemplateResult {
  const top = -span - 9;
  const bottom = span + 9;
  const d =
    half === 'left'
      ? `M0 ${String(top)} H-16 A4 4 0 0 0 -20 ${String(top + 4)} V${String(bottom - 4)} A4 4 0 0 0 -16 ${String(bottom)} H0 Z`
      : `M0 ${String(top)} H16 A4 4 0 0 1 20 ${String(top + 4)} V${String(bottom - 4)} A4 4 0 0 1 16 ${String(bottom)} H0 Z`;
  return svg`<path class="exchanger-fill" data-half=${half} d=${d} fill=${paint} fill-opacity=${EXCHANGER_FILL_OPACITY} stroke="none" />`;
}

/** The letter of a probe or switch, upright whatever the symbol's rotation. */
const letter = (text: string, rotation: Rotation): SVGTemplateResult =>
  svg`<text class="glyph" text-anchor="middle" dominant-baseline="central" font-size="9" fill="currentColor" stroke="none" transform="rotate(${-rotation})">${text}</text>`;

/**
 * Coil 51 (model C): the helix of design D5, lying on its side (axis along x, turned 90 degrees), smaller than the external one. Both
 * ends sit at its left: the supply starts the helix, the return drops 4 units below the loops and runs straight back to the second port.
 */
function helixCoil(): SVGTemplateResult {
  const halves = helixHalves({ kind: 'helix', cx: 2, top: -60, bottom: 60, rx: 11, turns: 5.5 });
  return svg`<g transform="matrix(0 -1 1 0 0 0)">${halves.map((half) => svg`<path data-half=${half.front ? 'front' : 'back'} d=${half.d} opacity=${half.front ? nothing : HELIX_BACK_OPACITY} />`)}</g><path d="M-75 -13 H-60 M60 9 V13 H-75" />`;
}

const stem = (length: number, from: number): SVGTemplateResult => svg`<path d="M0 ${from} V${length}" />`;

/** A triangle of a three-way valve, filled when its arm is open. */
const arm = (points: string, filled: boolean): SVGTemplateResult =>
  svg`<path d="${points}" fill=${filled ? 'currentColor' : 'none'} />`;

function body(kind: ComponentKind, options: SymbolOptions): SVGTemplateResult {
  const rotation = options.rotation ?? 0;
  switch (kind) {
    case 'pump':
      return svg`<circle r="12" /><path d="M-5 -7 V7 L8 0 Z" fill="currentColor" />`;
    case 'valve3': {
      const open = options.open ?? ['l', 'r'];
      return svg`${arm('M-12 -6 V6 L0 0 Z', open.includes('l'))}${arm('M12 -6 V6 L0 0 Z', open.includes('r'))}${arm('M-6 12 H6 L0 0 Z', open.includes('d'))}<rect x="-4" y="-21" width="8" height="8" /><path d="M0 -13 V-8" />`;
    }
    case 'inversion_valve':
      return svg`<rect x="-10" y="-14" width="20" height="28" rx="3" /><path d="M-14 0 H-10 M10 -10 H14 M10 0 H14 M10 10 H14" />${
        options.reversed === true
          ? svg`<path d="M-14 0 H14 M14 10 H5 V-10 H14" />`
          : svg`<path d="M-14 0 H-5 V10 H14 M14 0 H5 V-10 H14" />`
      }`;
    case 'probe_t':
      return svg`<circle r="9" />${stem(16, 9)}${letter('T', rotation)}`;
    case 'transducer_p':
      return svg`<circle r="9" />${stem(16, 9)}${letter('P', rotation)}`;
    case 'pressure_switch':
      return svg`<rect x="-7" y="-7" width="14" height="14" />${stem(16, 7)}${letter('P', rotation)}`;
    case 'thermostat':
      return svg`<rect x="-7" y="-7" width="14" height="14" />${stem(16, 7)}${letter('T', rotation)}`;
    case 'exchanger': {
      const span = options.size ?? 34;
      const fills = options.fills;
      return svg`${fills === undefined ? nothing : svg`${exchangerHalf('left', span, fills.left)}${exchangerHalf('right', span, fills.right)}`}<rect x="-20" y="${-span - 9}" width="40" height="${2 * span + 18}" rx="4" /><path d="M-12 ${-span} V${span} M12 ${-span} V${span}" /><circle cx="-12" cy="${-span}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${-span}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="-12" cy="${span}" r="3.5" fill="var(--card-background-color, transparent)" /><circle cx="12" cy="${span}" r="3.5" fill="var(--card-background-color, transparent)" />`;
    }
    case 'compressor':
      return svg`<circle r="14" /><path d="M0 -8 A8 8 0 1 0 8 0 M0 -8 L6 -4" />`;
    case 'vessel':
      return svg`<circle r="12" /><path d="M-12 2 H12" />`;
    case 'safety_valve':
      return svg`<path d="M0 16 V6 M-6 6 H6 L0 -4 Z M0 -4 L-3 -7 L3 -10 L0 -13" />`;
    case 'valve':
      return svg`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
    case 'drain_valve':
      return svg`<path d="M-6 -9 H6 L0 0 Z M-6 9 H6 L0 0 Z" />`;
    case 'resistor':
      return svg`<rect x="-28" y="-6" width="56" height="12" rx="2" /><path d="M-18 -6 V6 M18 -6 V6" />`;
    case 'filter_dryer':
      return svg`<rect x="-14" y="-5" width="28" height="10" rx="5" />`;
    case 'expansion_valve':
      return svg`<path d="M-12 -6 V6 L0 0 L12 -6 V6 L0 0 Z" />`;
    case 'service_outlet':
      return svg`<rect x="-3" y="-3" width="6" height="6" />${stem(10, 3)}`;
    case 'port':
      return svg`<rect x="-5" y="-6" width="10" height="6" />`;
    case 'tank':
      // the integrated tank (50): its body takes the DHW temperature colour through --dhw-tank-color
      return svg`<rect class="tank-body" data-dhw-tank="internal" x=${-INTERNAL_TANK.width / 2} y=${-INTERNAL_TANK.height / 2} width=${INTERNAL_TANK.width} height=${INTERNAL_TANK.height} rx="14" fill="var(--dhw-tank-color, none)" fill-opacity="0.25" />`;
    case 'coil':
      // the coil (51): a helix on its side with both ports at its left end
      return helixCoil();
  }
}

/** The symbol of a component kind as an SVG group, centred on (0, 0) and turned by `rotation`. */
export function symbol(kind: ComponentKind, options: SymbolOptions = {}): SVGTemplateResult {
  const rotation = options.rotation ?? 0;
  return svg`<g class="symbol ${kind}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${rotation})">${body(kind, options)}</g>`;
}
