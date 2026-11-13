// The overlap check of the compact threshold (add-compact-layout D6, D7), shared by scripts/measure-layout.mjs (which
// sets the threshold) and test/card/overlaps.browser.test.ts (which guards it), so that the two cannot drift. It
// reads real layout, so it runs in a browser. Boxes: a label's box is its element's box without the half-leading above
// and below its text (line-height minus font-size, halved), because rows that stack at a fixed pitch share that
// leading without their text touching. Components are the symbol groups, the DHW storage and the air unit; the ground
// loop's group box spans the empty ground below its line, where the labels of its legs sit on purpose, so its own
// marks (the line with its hatching, and the caption) are checked one by one. The values inside tank 50 on model C
// (`bare` labels) sit on its body by design and are not compared with tank 50. Two boxes overlap when they share more
// than TOLERANCE px in both directions. Pipes and captions are opt-in (refine-simplified-layout D4): measureCard with
// `{ pipes: true }` also samples every `path.pipe` along its rendered length at 1 px steps, each sample a square of the
// rendered stroke width, and boxes the `text.circuit-label`, `text.source-caption` and `text.tank-caption` elements like
// labels; overlapPairs then reports `label <id> x pipe:<segment>`, `caption:<text> x label <id>` and
// `caption:<text> x pipe:<segment>`. A hop is a gap in the path data (a moveto), so each subpath is sampled on its own
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
export type Caption = Box & { id: string; grouped: boolean };
export interface Measurement {
  labels: LabelBox[];
  /** Present when measured with `pipes: true`. */
  pipes?: PipeSamples[];
  /** The captions inside the drawing, boxed like labels; present when measured with `pipes: true`. */
  captions?: Caption[];
  parts: PartBox[];
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

/** The captions, boxed like labels: the em box of the text, centred on its rendered box. */
function measureCaptions(root: ParentNode): Caption[] {
  return [...root.querySelectorAll('text.circuit-label, text.source-caption, text.tank-caption')].map((element) => {
    const { left, right, top, bottom } = box(element);
    // The computed font size is in user units: scale it to drawn px.
    const matrix = (element as SVGGraphicsElement).getScreenCTM();
    const scale = matrix === null ? 1 : Math.sqrt(Math.abs(matrix.a * matrix.d - matrix.b * matrix.c));
    const size = Number.parseFloat(getComputedStyle(element).fontSize) * scale;
    const middle = (top + bottom) / 2;
    return {
      id: `caption:${element.textContent.trim()}`,
      // Inside a part's group (ground loop, air unit, tank): already checked against labels as that part.
      grouped: element.closest('g.ground-loop, g.air-unit, g.dhw-storage') !== null,
      left,
      right,
      top: middle - size / 2,
      bottom: middle + size / 2,
    };
  });
}

/** The label and component boxes of a card's shadow root, in px; with `pipes`, also the pipe samples and the captions. */
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
  return { labels, parts, cabinet, pipes: measurePipes(root), captions: measureCaptions(root) };
}

const overlaps = (a: Box, b: Box): boolean =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > TOLERANCE &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > TOLERANCE;

/** The overlapping pairs of a measurement, as texts. */
export function overlapPairs({ labels, parts, pipes = [], captions = [] }: Measurement): string[] {
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
  for (const caption of captions) {
    if (!caption.grouped)
      for (const label of labels) if (overlaps(caption, label)) add(`${caption.id} x label ${label.id}`);
    for (const pipe of pipes) if (pipe.squares.some((s) => overlaps(s, caption))) add(`${caption.id} x ${pipe.id}`);
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
 * The side of the cabinet outline a value label stays on in the compact layout (add-compact-layout D8): the labels of
 * the production and brine circuits, the compressor and the integrated tank 50 inside it, those of the source and of the
 * external DHW tank outside it. Only the key labels, which are the ones the compact layout shows.
 */
export const LABEL_SIDES: Readonly<Record<string, 'inside' | 'outside'>> = {
  production_out: 'inside',
  production_in: 'inside',
  brine_out: 'inside',
  brine_in: 'inside',
  compressor_speed: 'inside',
  tank_internal_temperature: 'inside',
  tank_external_temperature: 'outside',
  air_unit_out: 'outside',
  ground_out: 'outside',
  hybrid_ground_out: 'outside',
};

/** The labels that are not on their side of the cabinet outline, as texts: an inside label must lie within it, an outside one clear of it. */
export function sidePairs({ labels, cabinet }: Measurement): string[] {
  if (cabinet === undefined) return ['no cabinet outline'];
  return labels.flatMap((label) => {
    const side = LABEL_SIDES[label.id];
    if (side === undefined) return [];
    const within =
      label.left >= cabinet.left - TOLERANCE &&
      label.right <= cabinet.right + TOLERANCE &&
      label.top >= cabinet.top - TOLERANCE &&
      label.bottom <= cabinet.bottom + TOLERANCE;
    if (side === 'inside') return within ? [] : [`label ${label.id} is not inside the cabinet`];
    return overlaps(label, cabinet) ? [`label ${label.id} is not outside the cabinet`] : [];
  });
}
