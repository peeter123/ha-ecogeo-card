// The flow dash overlay must animate smoothly in every engine: Chromium does not interpolate a unitless calc() in
// a keyframe (it jumps from the start straight to the end of the period, which looks identical), so the keyframe
// carries a length. Sampled deterministically by seeking the animation and reading the computed dash offset.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

afterEach(() => {
  document.body.replaceChildren();
});

async function show(width: number): Promise<ShadowRoot> {
  const wrapper = document.createElement('div');
  wrapper.style.width = `${String(width)}px`;
  const card = document.createElement('ecogeo-card') as EcogeoCard;
  card.setConfig({ type: 'custom:ecogeo-card', prefix: 'demo_ecogeo', source: 'air' });
  card.hass = new MockHass().build(scenarioStates(SCENARIOS.heating.states), false);
  wrapper.append(card);
  document.body.append(wrapper);
  await card.updateComplete;
  await expect.poll(() => card.width).toBe(width);
  await card.updateComplete;
  const root = card.shadowRoot;
  if (root === null) throw new Error('no shadow root');
  return root;
}

describe('Flow animation', () => {
  test.each([360, 1000])(
    'at %i px the dash offset of an animated flow passes through intermediate values',
    async (width) => {
      const root = await show(width);
      const flows = [...root.querySelectorAll<SVGPathElement>('path.flow:not(.reversed)')];
      expect(flows.length).toBeGreaterThan(0);
      const path = flows[0];
      if (path === undefined) throw new Error('no flow path');
      const animation = path.getAnimations()[0];
      if (animation === undefined) throw new Error('flow path is not animated');
      const duration = Number(animation.effect?.getTiming().duration);
      expect(duration).toBeGreaterThan(0);
      animation.pause();
      const offsetAt = (fraction: number): number => {
        animation.currentTime = fraction * duration;
        // Chromium serializes a computed calc() as `calc(-4.6px)`.
        return Number.parseFloat(/-?\d+(?:\.\d+)?/.exec(getComputedStyle(path).strokeDashoffset)?.[0] ?? 'NaN');
      };
      const start = offsetAt(0);
      const samples = [0.25, 0.5, 0.75].map(offsetAt);
      const period = Math.abs(offsetAt(0.999));
      expect(start).toBe(0);
      // The loop is seamless only if the end offset is one dash period: dash plus gap, 7 pipe widths.
      const pipeWidth = Number.parseFloat(path.ownerSVGElement?.style.getPropertyValue('--pipe-width') ?? '');
      expect(pipeWidth).toBeGreaterThan(0);
      // Chromium serializes calc() entries as `calc(18px)`, so take every number in the value.
      const dashes = (getComputedStyle(path).strokeDasharray.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
      expect(dashes.reduce((sum, part) => sum + part, 0)).toBeCloseTo(7 * pipeWidth, 1);
      expect(period).toBeCloseTo(7 * pipeWidth * 0.999, 1);
      for (const value of samples) {
        expect(Math.abs(value)).toBeGreaterThan(0);
        expect(Math.abs(value)).toBeLessThan(period);
      }
      expect(Math.abs(samples[0] ?? 0)).toBeLessThan(Math.abs(samples[1] ?? 0));
      expect(Math.abs(samples[1] ?? 0)).toBeLessThan(Math.abs(samples[2] ?? 0));
    },
  );
});
