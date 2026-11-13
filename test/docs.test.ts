/// <reference types="vite/client" />
import { describe, expect, test } from 'vitest';
import { configErrors } from '../src/config/options';
import { resolveConfig } from '../src/config/resolve';
import { COMPACT_BELOW, COMPACT_HYSTERESIS } from '../src/lib/layout';

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

describe('the compact threshold in the docs', () => {
  test('the docs state the threshold and the width where an auto card returns to full', () => {
    const text = DOCS.replace(/\s+/g, ' ');
    expect(text).toContain(`The threshold is ${String(COMPACT_BELOW)} px`);
    expect(text).toContain(`the threshold plus 24 px, ${String(COMPACT_BELOW + COMPACT_HYSTERESIS)} px`);
    expect(COMPACT_HYSTERESIS).toBe(24);
  });
});
