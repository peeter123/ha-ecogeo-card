// The overlap check of the vertical threshold (add-compact-layout D6, D7), shared by scripts/measure-layout.mjs (which
// sets the threshold) and test/card/overlaps.browser.test.ts (which guards it), so that the two cannot drift. It
// reads real layout, so it runs in a browser. Boxes: a label's box is its element's box without the half-leading above
// and below its text (line-height minus font-size, halved), because rows that stack at a fixed pitch share that
// leading without their text touching. Components are the symbol groups, the DHW storage and the air unit; the ground
// loop's group box spans the empty ground below its line, where the label of its up leg sits on purpose, so its own
// marks (the line with its hatching) are checked one by one. The values inside tank 50 on model C
// (`bare` labels) sit on its body by design and are not compared with tank 50. Two boxes overlap when they share more
// than TOLERANCE px in both directions. Pipes are opt-in (refine-simplified-layout D4): measureCard with
// `{ pipes: true }` also samples every `path.pipe` along its rendered length at 1 px steps, each sample a square of the
// rendered stroke width, and takes the svg's box as the drawing's edge; overlapPairs then reports `label <id> x edge` for a
// label box that leaves it by more than TOLERANCE and `label <id> x pipe:<segment>` (the drawing has no in-drawing captions
// any more, rework-layouts "No in-drawing captions"). A hop is a gap in the path data (a moveto), so each subpath is sampled on its own
// and the gap yields no samples. The `bare` labels inside tank 50 ignore pipe samples that lie within tank 50's box.

/** Boxes that overlap by less than this many px in either direction only touch. */
export const TOLERANCE = 0.5;

/** The emulator page's font (dev/index.html repeats it): the label boxes depend on it, so the browser test applies it too. */
export const EMULATOR_FONT = { family: "Roboto, 'Segoe UI', system-ui, sans-serif", size: '14px' } as const;

/** The installations the check runs in, as emulator query strings: the label positions differ between them. */
export const INSTALLATIONS = [
  { name: 'ground-B', query: 'source=ground' },
  { name: 'air-B', query: 'source=air' },
  { name: 'hybrid-B', query: 'source=hybrid' },
  { name: 'ground-C-internal', query: 'source=ground&model=C&dhw=internal' },
  { name: 'air-C-internal', query: 'source=air&model=C&dhw=internal' },
  { name: 'ground-B-unused', query: 'source=ground&dhw=unused' },
  { name: 'air-C-unused', query: 'source=air&model=C&dhw=unused' },
] as const;

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export type LabelBox = Box & { id: string; bare: boolean };
export type PartBox = Box & { id: string; item: string | null };
/** The samples of one pipe: squares of the rendered stroke width, in px, along its rendered length. */
export interface PipeSamples {
  /** `pipe:<segment id>`; the halves of a helix share their segment's id. */
  id: string;
  squares: Box[];
}
export interface Measurement {
  labels: LabelBox[];
  /** Present when measured with `pipes: true`. */
  pipes?: PipeSamples[];
  parts: PartBox[];
  /** The drawing's svg box; present when measured with `pipes: true`. */
  drawing?: Box;
  /** The cabinet's outline (its rectangle, without the stroke). */
  cabinet: Box | undefined;
}

const box = (element: Element): Box => {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return { left, top, right, bottom };
};

/** The sampling step along a pipe, in px of rendered length. */
const PIPE_STEP = 1;

/** The samples of one `path.pipe`, one subpath at a time so that a hop's gap is not sampled. */
function samplePipe(path: SVGPathElement): Box[] {
  const matrix = path.getScreenCTM();
  if (matrix === null) return [];
  const scale = Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
  if (scale === 0) return [];
  // The square reaches half a stroke width past a butt cap at a pipe's end; that overshoot is accepted (D4).
  const half = (Number.parseFloat(getComputedStyle(path).strokeWidth) * scale) / 2;
  const subpaths = (path.getAttribute('d') ?? '').split(/(?=M)/).filter((part) => part.trim() !== '');
  const squares: Box[] = [];
  for (const d of subpaths) {
    const part = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    part.setAttribute('d', d);
    path.parentNode?.append(part);
    const length = part.getTotalLength();
    const step = PIPE_STEP / scale;
    for (let at = 0; at < length + step / 2; at += step) {
      const point = part.getPointAtLength(Math.min(at, length)).matrixTransform(matrix);
      squares.push({ left: point.x - half, right: point.x + half, top: point.y - half, bottom: point.y + half });
    }
    part.remove();
  }
  return squares;
}

/** The pipe samples of a card, one entry per `path.pipe`. */
function measurePipes(root: ParentNode): PipeSamples[] {
  return [...root.querySelectorAll<SVGPathElement>('path.pipe')].map((path) => ({
    id: `pipe:${path.closest('[data-segment]')?.getAttribute('data-segment') ?? '?'}`,
    squares: samplePipe(path),
  }));
}

/** The label and component boxes of a card's shadow root, in px; with `pipes`, also the pipe samples and the drawing's box. */
export function measureCard(root: ParentNode, options: { pipes?: boolean } = {}): Measurement {
  const labels = [...root.querySelectorAll('.label')].map((element) => {
    const style = getComputedStyle(element);
    const leading = (Number.parseFloat(style.lineHeight) - Number.parseFloat(style.fontSize)) / 2;
    const { left, top, right, bottom } = box(element);
    return {
      id: element.getAttribute('data-label') ?? '?',
      bare: element.classList.contains('bare'),
      left,
      right,
      top: top + leading,
      bottom: bottom - leading,
    };
  });
  const groups = [...root.querySelectorAll('g.symbol-group, g.dhw-storage, g.air-unit')];
  const groundMarks = [...root.querySelectorAll('g.ground-loop > path, g.ground-loop > text')];
  const parts = [...groups, ...groundMarks].map((element) => ({
    id: `${element.getAttribute('class')?.split(' ')[0] ?? 'g'}:${element.getAttribute('data-item') ?? element.getAttribute('data-dhw') ?? element.getAttribute('data-source') ?? ''}`,
    item: element.getAttribute('data-item'),
    ...box(element),
  }));
  const outline = root.querySelector('.cabinet > .outline');
  const cabinet = outline === null ? undefined : box(outline);
  if (options.pipes !== true) return { labels, parts, cabinet };
  const svg = root.querySelector('.diagram svg');
  return {
    labels,
    parts,
    cabinet,
    pipes: measurePipes(root),
    ...(svg === null ? {} : { drawing: box(svg) }),
  };
}

const overlaps = (a: Box, b: Box): boolean =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > TOLERANCE &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > TOLERANCE;

/** The overlapping pairs of a measurement, as texts. */
export function overlapPairs({ labels, parts, pipes = [], drawing, cabinet }: Measurement): string[] {
  const pairs: string[] = [];
  const tank50 = parts.find((part) => part.item === '50');
  const inside = (square: Box, outer: Box): boolean =>
    square.left >= outer.left &&
    square.right <= outer.right &&
    square.top >= outer.top &&
    square.bottom <= outer.bottom;
  const add = (pair: string): void => {
    if (!pairs.includes(pair)) pairs.push(pair);
  };
  for (const label of labels) {
    for (const pipe of pipes) {
      const ignored = label.bare && tank50 !== undefined ? tank50 : undefined;
      if (pipe.squares.some((s) => overlaps(s, label) && !(ignored !== undefined && inside(s, ignored)))) {
        add(`label ${label.id} x ${pipe.id}`);
      }
    }
  }
  // a label whose box leaves the drawing (the card's own edge) by more than the tolerance
  if (drawing !== undefined) {
    for (const label of labels) {
      if (
        drawing.left - label.left > TOLERANCE ||
        label.right - drawing.right > TOLERANCE ||
        drawing.top - label.top > TOLERANCE ||
        label.bottom - drawing.bottom > TOLERANCE
      )
        add(`label ${label.id} x edge`);
    }
  }
  // a label that crosses the cabinet's outline: partly inside it and partly outside (refine-simplified-layout D11)
  if (cabinet !== undefined) {
    for (const label of labels) {
      const within =
        label.left >= cabinet.left - TOLERANCE &&
        label.right <= cabinet.right + TOLERANCE &&
        label.top >= cabinet.top - TOLERANCE &&
        label.bottom <= cabinet.bottom + TOLERANCE;
      if (overlaps(label, cabinet) && !within) add(`label ${label.id} x cabinet`);
    }
  }
  labels.forEach((label, index) => {
    for (const other of labels.slice(index + 1)) {
      if (overlaps(label, other)) pairs.push(`label ${label.id} x label ${other.id}`);
    }
    for (const part of parts) {
      if (label.bare && part.item === '50') continue;
      if (overlaps(label, part)) pairs.push(`label ${label.id} x ${part.id}`);
    }
  });
  return pairs;
}

/**
 * The labels that sit inside a body and must stay inside it (rework-layouts D7): id to the item of the body (tank 50 of
 * model C). The bodies of the band (external tank, air unit, ground collector, emitter) join them in groups 5 and 6. Read by
 * scripts/search-places.mjs only.
 */
export const BODY_LABELS: Readonly<Record<string, string>> = {
  tank_internal_temperature: '50',
  tank_internal_demand: '50',
};

/** The Out and In values that read as a pair (refine-simplified-layout D7, group 5), production and brine; read by scripts/search-places.mjs only. */
export const OUT_IN_PAIRS: readonly (readonly [string, string])[] = [
  ['production_out', 'production_in'],
  ['brine_out', 'brine_in'],
];

/**
 * Whether an Out value and its In value read in order: the Out box lies left of the In box or, where the two overlap
 * horizontally (a column), above it. The Out probe is left of the In probe in both circuits, so left is the order of their
 * probes; a column keeps the pair together where there is no room beside it.
 */
export function inOrder(out: Box, inn: Box): boolean {
  if (out.right <= inn.left) return true;
  return Math.min(out.right, inn.right) - Math.max(out.left, inn.left) > 0 && out.bottom <= inn.top;
}
