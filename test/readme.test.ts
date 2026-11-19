import { describe, expect, test } from 'vitest';
import { FEATURE_KEYS, variantFeatures, VARIANTS } from '../src/config/variants';
import { TOP_LEVEL_OPTIONS } from '../src/config/options';
import { VERTICAL_BELOW, VERTICAL_HYSTERESIS } from '../src/lib/layout';
import { ROLES } from '../src/config/roles';
import { EDITOR, MODE_LABELS } from '../src/strings';
import { README, rowCells, section, tableNames } from './readme';

// Options Home Assistant adds to every card, and `type`: not documented as options of this card.
const NOT_OPTIONS = new Set(['type', 'view_layout', 'layout_options', 'grid_options', 'visibility']);

describe('README configuration reference', () => {
  test('the README has the configuration section', () => {
    expect(README).toContain('\n## Configuration\n');
  });

  test('every option of the code is in the options table, and the table has no other', () => {
    const documented = tableNames(section('### Options'));
    const expected = TOP_LEVEL_OPTIONS.filter((option) => !NOT_OPTIONS.has(option));
    expect([...documented].sort()).toEqual([...expected].sort());
  });

  test('every feature is in the features table with the preset of each variant', () => {
    const text = section('### Features');
    expect([...tableNames(text)].sort()).toEqual([...FEATURE_KEYS].sort());
    for (const key of FEATURE_KEYS) {
      const cells = rowCells(text, key);
      VARIANTS.forEach((variant, index) => {
        expect(cells[2 + index], `${key} variant ${String(variant)}`).toBe(
          `\`${String(variantFeatures(variant)[key])}\``,
        );
      });
    }
  });

  test('every role is in the roles table with its default entity, unit and item', () => {
    const text = section('### Roles');
    expect([...tableNames(text)].sort()).toEqual(ROLES.map((role) => role.path).sort());
    for (const role of ROLES) {
      const cells = rowCells(text, role.path);
      expect(cells[1], role.path).toBe(`\`${role.domain}.<prefix>_${role.suffix}\``);
      expect(cells[3], role.path).toBe(role.item);
      if ('unit' in role) expect(cells[2], role.path).toContain(role.unit);
      if ('decimals' in role) expect(cells[2], role.path).toContain(`${String(role.decimals)} dec.`);
    }
  });

  test('every mode label is named in the operating mode paragraph', () => {
    const text = section('### Operating mode').replace(/\s+/g, ' ');
    for (const label of Object.values(MODE_LABELS)) expect(text, label).toContain(label);
  });

  test('the README names the vertical threshold and the width where the card returns to horizontal', () => {
    const text = README.replace(/\s+/g, ' ');
    expect(text).toContain(`from ${String(VERTICAL_BELOW)} px wide`);
    expect(text).toContain(`narrower than ${String(VERTICAL_BELOW)} px`);
    expect(text).toContain(`only at ${String(VERTICAL_BELOW + VERTICAL_HYSTERESIS)} px`);
  });

  test('the README documents the layout values and no detail option', () => {
    const text = section('### Options');
    expect(rowCells(text, 'layout')[1]).toBe('`auto`, `horizontal`, `vertical`');
    expect([...tableNames(text)]).not.toContain('detail');
  });

  test('the visual editor section names every section of the editor', () => {
    const text = section('### Visual editor').replace(/\s+/g, ' ');
    for (const title of Object.values(EDITOR.sections)) expect(text, title).toContain(`**${title}:**`);
    expect(text).toContain('Variant default');
  });
});

describe('README installation and releases', () => {
  test('the HACS steps name the repository and the hacsfiles resource', () => {
    const text = section('### With HACS').replace(/\s+/g, ' ');
    expect(text).toContain('https://github.com/peeter123/ha-ecogeo-card');
    expect(text).toContain('category Dashboard');
    expect(text).toContain('/hacsfiles/ha-ecogeo-card/ecogeo-card.js');
  });

  test('the HACS steps come before the manual ones', () => {
    expect(README.indexOf('### With HACS')).toBeGreaterThan(0);
    expect(README.indexOf('### With HACS')).toBeLessThan(README.indexOf('### By hand'));
  });
});
