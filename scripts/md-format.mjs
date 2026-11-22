// Markdown format check for the tracked Markdown files outside `.claude/` and `openspec/changes/archive/`.
// A port of scripts/md_format.py of the hot-water-tank-estimator repository (same author). The deviation: it is
// written in Node instead of Python, so it runs without uv.
//
// Rules, each finding is { line, message }:
// 1. LF line endings only: no carriage return.
// 2. The file is not empty and ends with exactly one newline.
// 3. Lines are at most MAX_LINE characters, except
//    - table rows (the first non-blank character is `|`),
//    - lines inside a fenced code block (``` or ~~~), fence lines included,
//    - lines that cannot be wrapped: after the indentation, blockquote marker and list marker there is no space at
//      or before column MAX_LINE, so there is no place to break (a long URL or path alone on a line). A line with
//      a space in reach can be wrapped, so it is a finding even when its overflow is one long word.
//
// Trailing whitespace is not checked, and nothing here rewraps prose: --fix repairs only the line endings and the
// final newline.
//
// Usage: node scripts/md-format.mjs [--fix] [files...]   (no files: the tracked Markdown files in scope)
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** A tool could not be run (git failed, uv is missing). The command line exits 2 for it. */
export class ToolError extends Error {}

export const MAX_LINE = 120;
export const MARKDOWN_EXCLUDE = ['.agents/', '.claude/', 'openspec/changes/archive/'];

// Indentation, blockquote markers, then one list marker (-, *, + or 1. / 1)) and its spaces.
const PREFIX = /^(?:\s*>)*\s*(?:(?:[-*+]|\d{1,9}[.)])\s+)?/u;
const FENCE = /^\s*(`{3,}|~{3,})/u;

/**
 * True when a space within reach of column MAX_LINE gives a break that fits.
 * @param {string} line
 */
function canWrap(line) {
  const start = (PREFIX.exec(line) ?? [''])[0].length;
  return [...line.slice(start)].slice(0, MAX_LINE + 1 - start).includes(' ');
}

/**
 * The findings in a decoded Markdown file, in line order.
 * @param {string} text
 * @returns {{ line: number, message: string }[]}
 */
export function checkText(text) {
  if (!text) return [{ line: 1, message: 'file is empty' }];
  /** @type {{ line: number, message: string }[]} */
  const findings = [];
  const lines = text.split('\n');
  /** @type {string | null} the opening fence run while inside a code block */
  let fence = null;
  lines.forEach((raw, index) => {
    const number = index + 1;
    const line = raw.endsWith('\r') ? raw.slice(0, -1) : raw;
    if (raw.includes('\r')) findings.push({ line: number, message: 'carriage return (use LF line endings)' });
    const marker = FENCE.exec(line);
    if (fence !== null) {
      const run = marker?.[1] ?? '';
      if (marker && run[0] === fence[0] && run.length >= fence.length && line.trim() === run) fence = null;
      return;
    }
    if (marker) {
      fence = marker[1] ?? null;
      return;
    }
    if (line.trimStart().startsWith('|')) return;
    const trimmed = line.trimEnd();
    const length = [...trimmed].length;
    if (length > MAX_LINE && canWrap(trimmed)) {
      findings.push({ line: number, message: `line is ${String(length)} characters (maximum ${String(MAX_LINE)})` });
    }
  });
  if (!text.endsWith('\n')) {
    findings.push({ line: lines.length, message: 'no newline at the end of the file' });
  } else if (text.endsWith('\n\n') || text.endsWith('\n\r\n')) {
    findings.push({ line: lines.length - 1, message: 'more than one newline at the end of the file' });
  }
  return findings;
}

/**
 * The findings in a raw Markdown file, in line order.
 * @param {Buffer} data
 */
export function checkBytes(data) {
  let text;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(data);
  } catch (error) {
    return [{ line: 1, message: `not valid UTF-8: ${String(error)}` }];
  }
  return checkText(text);
}

/**
 * CRLF to LF and exactly one final newline. Prose is never rewrapped.
 * @param {Buffer} data
 */
export function fixBytes(data) {
  const fixed = data.toString('latin1').replaceAll('\r\n', '\n');
  if (!fixed.trim()) return data;
  return Buffer.from(fixed.replace(/\n+$/u, '') + '\n', 'latin1');
}

/**
 * Whether a repository-relative path (posix or native separators) is covered by the check.
 * @param {string} name
 */
export function inScope(name) {
  const posix = name.replaceAll('\\', '/');
  return posix.endsWith('.md') && !MARKDOWN_EXCLUDE.some((prefix) => posix.startsWith(prefix));
}

/**
 * The tracked (and untracked, not ignored) Markdown files in scope, relative to `root`.
 * @param {string} root
 */
export function markdownFiles(root) {
  const result = spawnSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '*.md'], {
    cwd: root,
    encoding: 'utf8',
  });
  if (result.error || result.status !== 0) {
    throw new ToolError(`git ls-files: ${result.error ? String(result.error) : result.stderr.trim()}`);
  }
  // A tracked file that is gone from the working tree (for example after a move) has nothing to check.
  return result.stdout.split('\n').filter((name) => name && inScope(name) && existsSync(join(root, name)));
}

/**
 * Checks (and with `fix`, repairs) the files; prints `file:line: message` per finding. Returns the failure count.
 * @param {string} root
 * @param {string[]} names
 * @param {boolean} fix
 */
export function checkFiles(root, names, fix) {
  let failed = 0;
  for (const name of names) {
    const path = join(root, name);
    /** @type {Buffer} */
    let data = readFileSync(path);
    if (fix) {
      const fixed = fixBytes(data);
      if (!fixed.equals(data)) {
        writeFileSync(path, fixed);
        data = fixed;
      }
    }
    for (const { line, message } of checkBytes(data)) {
      process.stdout.write(`${name}:${String(line)}: ${message}\n`);
      failed += 1;
    }
  }
  return failed;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = dirname(dirname(fileURLToPath(import.meta.url)));
  const args = process.argv.slice(2);
  const fix = args.includes('--fix');
  const given = args.filter((arg) => arg !== '--fix');
  process.stdout.write('$ markdown format check\n');
  try {
    const names = given.length > 0 ? given.filter(inScope) : markdownFiles(root);
    process.exitCode = checkFiles(root, names, fix) > 0 ? 1 : 0;
  } catch (error) {
    if (!(error instanceof ToolError)) throw error;
    process.stderr.write(`md-format: ${error.message}
`);
    process.exitCode = 2;
  }
}
