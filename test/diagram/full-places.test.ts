// FULL_PLACES (refine-simplified-layout D11): every entry has a reason, names a label of the full arrangement and is where
// the table says; the simplified arrangement does not take them.
import { describe, expect, test } from 'vitest';
import { arrangementFor } from '../../src/diagram/geometry';
import { FULL_PLACES, labelPlacesFor } from '../../src/diagram/label-places';

describe('FULL_PLACES', () => {
  const full = arrangementFor('full', 'full');
  const simplified = arrangementFor('simplified', 'full');

  test('the labels with a place of their own have a reason, are in the arrangement and sit where the table says', () => {
    expect(Object.keys(FULL_PLACES).length).toBeGreaterThan(0);
    for (const [id, place] of Object.entries(FULL_PLACES)) {
      expect(place.reason.length, id).toBeGreaterThan(20);
      const spec = full.labels.specs.find((label) => label.id === id);
      expect(spec, id).toBeDefined();
      // an entry with a caption sets it; one without keeps the label's own caption from labelPlacesFor
      const base = labelPlacesFor(full, {}).specs.find((label) => label.id === id);
      expect({ x: spec?.x, y: spec?.y, align: spec?.align, caption: spec?.caption }, id).toEqual({
        x: place.x,
        y: place.y,
        align: place.align,
        caption: place.caption ?? base?.caption,
      });
      if (place.caption === undefined) expect(spec?.caption, id).toBe(base?.caption);
    }
  });

  test('the simplified and compact arrangements ignore the table', () => {
    const compact = arrangementFor('full', 'compact');
    expect(compact).toBe(simplified);
    for (const id of ['production_in', 'compressor_speed', 'brine_pump']) {
      const [a, b] = [full, simplified].map((arr) => arr.labels.specs.find((label) => label.id === id));
      expect([a?.x, a?.y]).not.toEqual([b?.x, b?.y]);
    }
  });

  test('every reason names the label it moves by an item number or a part', () => {
    for (const [id, place] of Object.entries(FULL_PLACES)) expect(place.reason, id).toMatch(/\d/);
  });
});
