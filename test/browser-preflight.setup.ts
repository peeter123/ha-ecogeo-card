// Setup file of the browser project (rework-layouts D11): measures the reference strings in the running browser and
// stops the run with one clear message when text is laid out with whole-pixel advances (see text-preflight.ts).
import { beforeAll } from 'vitest';
import { REFERENCE_SIZE, REFERENCE_TEXTS, smoothingProblem } from './text-preflight';

// The font of the browser tests (EMULATOR_FONT in dev/overlaps.ts).
const FAMILY = "Roboto, 'Segoe UI', system-ui, sans-serif";

beforeAll(async () => {
  // Roboto is a locally installed font, so this does not load or verify it; the verdict does not depend on the font.
  await document.fonts.load(`${String(REFERENCE_SIZE)}px Roboto`);
  await document.fonts.ready;
  const widths = REFERENCE_TEXTS.map((text) => {
    const span = document.createElement('span');
    span.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${String(REFERENCE_SIZE)}px ${FAMILY}`;
    span.textContent = text;
    document.body.append(span);
    const width = span.getBoundingClientRect().width;
    span.remove();
    return width;
  });
  const isChromium = /Chrom(e|ium)\//.test(navigator.userAgent);
  const isWindows = navigator.userAgent.includes('Windows');
  const problem = smoothingProblem(isChromium, isWindows, widths);
  if (problem !== null) throw new Error(`${problem} (measured ${widths.map(String).join(' and ')} px)`);
});
