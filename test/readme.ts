/// <reference types="vite/client" />
// Reads README.md for the test that keeps the docs and the code in step. Adapted from hrv-ventilation test/readme.ts.

const files = import.meta.glob<string>('../README.md', { query: '?raw', import: 'default', eager: true });
export const README = Object.values(files)[0] ?? '';

/** The text from the heading `start` up to the next heading of the same or a higher level. */
export function section(heading: string): string {
  const level = /^#+/.exec(heading)?.[0].length ?? 2;
  const from = README.indexOf(`\n${heading}\n`);
  if (from < 0) throw new Error(`README has no "${heading}"`);
  const rest = README.slice(from + heading.length + 2);
  const end = new RegExp(`\\n#{1,${String(level)}} `).exec(rest);
  return end ? rest.slice(0, end.index) : rest;
}

/** The first-column names of the table rows of a text, written as `name`. */
export function tableNames(text: string): string[] {
  return [...text.matchAll(/^\| `([^`]+)` \|/gm)].map((match) => match[1] ?? '');
}

/** The cells of the row named `name` in a text. */
export function rowCells(text: string, name: string): string[] {
  const row = text.split('\n').find((line) => line.startsWith(`| \`${name}\` |`));
  return row === undefined
    ? []
    : row
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim());
}
