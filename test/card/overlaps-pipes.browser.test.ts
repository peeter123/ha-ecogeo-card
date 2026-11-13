// The pipe and caption part of the overlap check (refine-simplified-layout D4): a label moved onto a pipe and one moved
// onto a caption are reported as exactly those pairs, a card without such an overlap reports none, and a hop's gap
// yields no pipe samples. Real layout, so Chromium and WebKit.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { EMULATOR_FONT, TOLERANCE, measureCard, overlapPairs } from '../../dev/overlaps';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIO_NAMES, SCENARIOS } from '../../dev/scenarios';
import { NAMINGS, namingStates, registryOf } from '../../dev/foreign';
import { configOf, parseState } from '../../dev/url-state';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

afterEach(() => {
  document.body.replaceChildren();
});

async function render(query: string, width = 900): Promise<ShadowRoot> {
  const name = SCENARIO_NAMES[0];
  const state = parseState(`?scenario=${name}&${query}&layout=full&detail=simplified`);
  const wrapper = document.createElement('div');
  wrapper.style.fontFamily = EMULATOR_FONT.family;
  wrapper.style.fontSize = EMULATOR_FONT.size;
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig(configOf(state));
  const naming = NAMINGS[0];
  card.hass = new MockHass().build(namingStates(naming, SCENARIOS[name].states), false, registryOf(naming));
  wrapper.append(card);
  document.body.append(wrapper);
  await card.updateComplete;
  await document.fonts.ready;
  if (!card.shadowRoot) throw new Error('no shadow root');
  return card.shadowRoot;
}

/** Takes a label out of the flow and puts the centre of its box on a page point. */
function moveOnto(label: HTMLElement, x: number, y: number): void {
  label.style.position = 'fixed';
  label.style.left = '0px';
  label.style.top = '0px';
  const { left, top, right, bottom } = label.getBoundingClientRect();
  label.style.left = `${String(x - (left + right) / 2)}px`;
  label.style.top = `${String(y - (top + bottom) / 2)}px`;
}

const pairs = (root: ShadowRoot): string[] => overlapPairs(measureCard(root, { pipes: true }));

/** The page point halfway along a straight pipe segment. */
function midpoint(root: ShadowRoot, segment: string): [number, number] {
  const path = root.querySelector<SVGPathElement>(`path.pipe[data-segment="${segment}"]`);
  if (!path) throw new Error(`no pipe ${segment}`);
  const point = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM() ?? undefined);
  return [point.x, point.y];
}

const added = (root: ShadowRoot, before: string[]): string[] => pairs(root).filter((pair) => !before.includes(pair));

describe('Pipe and caption overlaps', () => {
  test('a clean card reports no pipe or caption pair', async () => {
    const root = await render('source=ground');
    expect(pairs(root).filter((pair) => pair.includes('pipe:') || pair.startsWith('caption:'))).toEqual([]);
  });

  test('a label moved onto a pipe is reported with that pipe, and only that', async () => {
    const root = await render('source=ground');
    const label = root.querySelector<HTMLElement>('.label[data-label="compressor_speed"]');
    if (!label) throw new Error('no label');
    const before = pairs(root);
    const [x, y] = midpoint(root, 'src_out');
    moveOnto(label, x, y);
    expect(added(root, before)).toEqual(['label compressor_speed x pipe:src_out']);
  });

  test('a label moved onto a caption is reported with that caption, and only that', async () => {
    const root = await render('source=ground');
    const label = root.querySelector<HTMLElement>('.label[data-label="compressor_speed"]');
    const caption = root.querySelector('text.circuit-label');
    if (!label || !caption) throw new Error('no label or caption');
    const before = pairs(root);
    const { left, right, top, bottom } = caption.getBoundingClientRect();
    moveOnto(label, (left + right) / 2, (top + bottom) / 2);
    expect(added(root, before)).toEqual([`caption:${caption.textContent.trim()} x label compressor_speed`]);
  });

  test('a caption moved onto a pipe is reported with that pipe', async () => {
    const root = await render('source=ground');
    const caption = root.querySelector<SVGTextElement>('text.circuit-label');
    if (!caption) throw new Error('no caption');
    const before = pairs(root);
    const rect = caption.getBoundingClientRect();
    const [x, y] = midpoint(root, 'src_out');
    const matrix = caption.getScreenCTM();
    const scale = matrix === null ? 1 : matrix.a;
    caption.setAttribute(
      'transform',
      `translate(${String((x - (rect.left + rect.right) / 2) / scale)} ${String((y - (rect.top + rect.bottom) / 2) / scale)})`,
    );
    expect(added(root, before)).toContain(`caption:${caption.textContent.trim()} x pipe:src_out`);
  });

  test('a caption box is no taller than its rendered text', async () => {
    for (const width of [400, 900]) {
      const root = await render('source=ground', width);
      const captions = measureCard(root, { pipes: true }).captions ?? [];
      expect(captions.length).toBeGreaterThan(0);
      const rendered = [...root.querySelectorAll('text.circuit-label, text.source-caption, text.tank-caption')];
      captions.forEach((caption, index) => {
        const rect = rendered[index]?.getBoundingClientRect();
        expect(caption.bottom - caption.top).toBeLessThanOrEqual((rect?.height ?? 0) + 0.5);
      });
    }
  });

  test('the gap of a hop yields no sample', async () => {
    const root = await render('source=ground');
    const hop = [...root.querySelectorAll<SVGPathElement>('path.pipe')].find((path) =>
      /M.*M/.test(path.getAttribute('d') ?? ''),
    );
    if (!hop) throw new Error('no pipe with a hop');
    const matrix = hop.getScreenCTM();
    if (matrix === null) throw new Error('no CTM');
    const [first, second] = (hop.getAttribute('d') ?? '').split(/(?=M)/);
    const end = (d: string, atEnd: boolean): [number, number] => {
      const part = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      part.setAttribute('d', d);
      hop.parentNode?.append(part);
      const point = part.getPointAtLength(atEnd ? part.getTotalLength() : 0).matrixTransform(matrix);
      part.remove();
      return [point.x, point.y];
    };
    const [x1, y1] = end(first ?? '', true);
    const [x2, y2] = end(second ?? '', false);
    const [x, y] = [(x1 + x2) / 2, (y1 + y2) / 2];
    const id = `pipe:${hop.closest('[data-segment]')?.getAttribute('data-segment') ?? ''}`;
    const squares = measureCard(root, { pipes: true }).pipes?.find((pipe) => pipe.id === id)?.squares ?? [];
    expect(squares.length).toBeGreaterThan(0);
    expect(
      squares.some(
        (s) => Math.min(x - s.left, s.right - x) > TOLERANCE && Math.min(y - s.top, s.bottom - y) > TOLERANCE,
      ),
    ).toBe(false);
  });
});
