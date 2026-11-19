/// <reference types="vite/client" />
import { describe, expect, test } from 'vitest';
import { configErrors } from '../src/config/options';
import { resolveConfig } from '../src/config/resolve';
import { VERTICAL_BELOW, VERTICAL_HYSTERESIS } from '../src/lib/layout';

const files = import.meta.glob<string>('../docs/ecogeo-card.md', { query: '?raw', import: 'default', eager: true });
const DOCS = (Object.values(files)[0] ?? '').replaceAll('\r\n', '\n');

/** The text of a heading's section, up to the next heading of the same level. */
function section(heading: string): string {
  const from = DOCS.indexOf(`\n${heading}\n`);
  if (from < 0) throw new Error(`docs have no "${heading}"`);
  const rest = DOCS.slice(from + heading.length + 2);
  const end = /\n## /.exec(rest);
  return end ? rest.slice(0, end.index) : rest;
}

/** A scalar of the small YAML subset the docs use. */
const scalar = (text: string): unknown => {
  const flow = /^\[(.*)\]$/.exec(text);
  return flow ? (flow[1] ?? '').split(',').map((item) => item.trim()) : text;
};

/** Parses the YAML subset of the docs' examples: nested maps by indent, `key: value` and `key: [a, b]`. */
function parseYaml(text: string): Record<string, unknown> {
  const root: Record<string, unknown> = {};
  const stack: { indent: number; map: Record<string, unknown> }[] = [{ indent: -1, map: root }];
  for (const line of text.split('\n').filter((entry) => entry.trim() !== '')) {
    const indent = line.length - line.trimStart().length;
    while (stack.length > 1 && (stack[stack.length - 1]?.indent ?? 0) >= indent) stack.pop();
    const [key = '', ...rest] = line.trim().split(':');
    const value = rest.join(':').trim();
    const parent = stack[stack.length - 1]?.map ?? root;
    if (value === '') {
      const map: Record<string, unknown> = {};
      parent[key] = map;
      stack.push({ indent, map });
    } else {
      parent[key] = scalar(value);
    }
  }
  return root;
}

describe('docs: Using another source', () => {
  const text = section('## Using another source');

  test('the section has one YAML example, and it is a valid config', () => {
    const blocks = [...text.matchAll(/```yaml\n([\s\S]*?)```/g)];
    expect(blocks).toHaveLength(1);
    const config = parseYaml(blocks[0]?.[1] ?? '');
    expect(configErrors(config)).toEqual([]);
    expect(resolveConfig(config).states).toEqual({ off: ['Uit', 'Standby'], defrost: ['Ontdooien'] });
  });
});

describe('the vertical threshold in the docs', () => {
  test('the docs state the threshold and the width where an auto card returns to horizontal', () => {
    const text = DOCS.replace(/\s+/g, ' ');
    expect(text).toContain(`The threshold is ${String(VERTICAL_BELOW)} px`);
    expect(text).toContain(`the threshold plus 24 px, ${String(VERTICAL_BELOW + VERTICAL_HYSTERESIS)} px`);
    expect(VERTICAL_HYSTERESIS).toBe(24);
  });

  test('the docs name the layout values and no longer describe the detail levels or the compact layout', () => {
    const text = DOCS.replace(/\s+/g, ' ');
    expect(text).toContain('(`auto`, `horizontal` or `vertical`, default `auto`)');
    expect(text).not.toContain('What the compact layout shows');
    expect(text).not.toContain('### Detail levels');
    expect(text).not.toContain('COMPACT_');
    expect(text).not.toContain('FULL_PLACES');
  });
});

describe('docs installation and releases', () => {
  test('the HACS installation comes before the manual one and names the resource', () => {
    const text = section('## Installation');
    expect(text.indexOf('### With HACS')).toBeGreaterThan(-1);
    expect(text.indexOf('### With HACS')).toBeLessThan(text.indexOf('### By hand'));
    expect(text).toContain('/hacsfiles/ha-ecogeo-card/ecogeo-card.js');
  });

  test('the Releases section names the checks, both workflows and the tag', () => {
    const text = section('## Releases');
    for (const name of ['npm run release', 'verify-dist', 'CHANGELOG.md', 'check.yml', 'validate.yml', 'v<version>']) {
      expect(text, name).toContain(name);
    }
  });
});
