// The overlap check of the compact threshold (add-compact-layout D6, D7), shared by scripts/measure-layout.mjs (which
// sets the threshold) and test/card/overlaps.browser.test.ts (which guards it), so that the two cannot drift. It
// reads real layout, so it runs in a browser. Boxes: a label's box is its element's box without the half-leading above
// and below its text (line-height minus font-size, halved), because rows that stack at a fixed pitch share that
// leading without their text touching. Components are the symbol groups, the DHW storage and the air unit; the ground
// loop's group box spans the empty ground below its line, where the labels of its legs sit on purpose, so its own
// marks (the line with its hatching, and the caption) are checked one by one. The values inside tank 50 on model C
// (`bare` labels) sit on its body by design and are not compared with tank 50. Two boxes overlap when they share more
// than TOLERANCE px in both directions. Pipes are not checked.

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
] as const;

export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
export type LabelBox = Box & { id: string; bare: boolean };
export type PartBox = Box & { id: string; item: string | null };
export interface Measurement {
  labels: LabelBox[];
  parts: PartBox[];
}

const box = (element: Element): Box => {
  const { left, top, right, bottom } = element.getBoundingClientRect();
  return { left, top, right, bottom };
};

/** The label boxes and the component boxes of a card's shadow root, in px. */
export function measureCard(root: ParentNode): Measurement {
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
  return { labels, parts };
}

const overlaps = (a: Box, b: Box): boolean =>
  Math.min(a.right, b.right) - Math.max(a.left, b.left) > TOLERANCE &&
  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > TOLERANCE;

/** The overlapping pairs of a measurement, as texts. */
export function overlapPairs({ labels, parts }: Measurement): string[] {
  const pairs: string[] = [];
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
