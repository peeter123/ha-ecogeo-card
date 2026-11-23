// A tap on the underfloor spiral must reach the emitter's button: the runs are pipes drawn above the body, so they take no
// pointer events and the hit lands on the body's hit area.
import { afterEach, describe, expect, test } from 'vitest';
import '../../dev/ha-stubs';
import '../../src/index';
import { MockHass } from '../../dev/mock-hass';
import { SCENARIOS, scenarioStates } from '../../dev/scenarios';
import type { EcogeoCard } from '../../src/card/ecogeo-card';

afterEach(() => {
  document.body.replaceChildren();
});

describe('Underfloor spiral tap', () => {
  test.each([360, 1000])('at %i px a point on each run hits the emitter', async (width) => {
    const wrapper = document.createElement('div');
    wrapper.style.width = `${String(width)}px`;
    const card = document.createElement('ecogeo-card') as EcogeoCard;
    card.setConfig({ type: 'custom:ecogeo-card', prefix: 'demo_ecogeo', emitter: 'underfloor' });
    card.hass = new MockHass().build(scenarioStates(SCENARIOS.heating.states), false);
    wrapper.append(card);
    document.body.append(wrapper);
    await card.updateComplete;
    await expect.poll(() => card.width).toBe(width);
    await card.updateComplete;
    const root = card.shadowRoot;
    if (root === null) throw new Error('no shadow root');
    for (const id of ['dg1_loop_in', 'dg1_loop_out']) {
      const path = root.querySelector<SVGPathElement>(`path.pipe[data-segment="${id}"]`);
      if (path === null) throw new Error(`no run ${id}`);
      const matrix = path.getScreenCTM();
      if (matrix === null) throw new Error('no screen matrix');
      // the middle of the run: on a straight part of the spiral, a few turns in from the outline
      const point = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(matrix);
      const hit = root.elementFromPoint(point.x, point.y);
      expect(hit, id).not.toBeNull();
      expect(hit?.closest('g.emitter'), id).not.toBeNull();
    }
  });
});
