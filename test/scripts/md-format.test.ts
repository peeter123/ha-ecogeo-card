/// <reference types="node" />
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { checkBytes, checkText, fixBytes, inScope, markdownFiles, ToolError } from '../../scripts/md-format.mjs';

const prose = (length: number) => 'word '.repeat(Math.ceil(length / 5)).slice(0, length - 1) + 'x';

describe('md-format: line length', () => {
  test('a prose line of 121 characters with a space fails and names its line', () => {
    const line = prose(121);
    expect(line).toHaveLength(121);
    const findings = checkText(`# Title\n\n${line}\n`);
    expect(findings).toEqual([{ line: 3, message: 'line is 121 characters (maximum 120)' }]);
  });

  test('a line of exactly 120 characters passes', () => {
    expect(checkText(`${prose(120)}\n`)).toEqual([]);
  });

  test('table rows and fenced code are accepted however long', () => {
    const long = 'x '.repeat(100);
    const text = ['| a | b |', `| ${long} | ${long} |`, '', '```sh', long, '```', '~~~', long, '~~~', ''].join('\n');
    expect(checkText(text)).toEqual([]);
  });

  test('a line after a closed fence is checked again', () => {
    expect(checkText(`\`\`\`\ncode\n\`\`\`\n${prose(130)}\n`)).toHaveLength(1);
  });

  test('a line with no space to break at is accepted, also behind a list marker', () => {
    const url = `https://example.com/${'a'.repeat(150)}`;
    expect(checkText(`${url}\n- ${url}\n`)).toEqual([]);
  });
});

describe('md-format: line endings and final newline', () => {
  test('a carriage return is reported', () => {
    expect(checkBytes(Buffer.from('one\r\ntwo\r\n')).map((f) => f.line)).toEqual([1, 2]);
  });

  test('a missing final newline is reported on the last line', () => {
    expect(checkText('one\ntwo')).toEqual([{ line: 2, message: 'no newline at the end of the file' }]);
  });

  test('more than one final newline is reported', () => {
    expect(checkText('one\n\n')).toEqual([{ line: 2, message: 'more than one newline at the end of the file' }]);
  });

  test('an empty file is reported', () => {
    expect(checkText('')).toEqual([{ line: 1, message: 'file is empty' }]);
  });

  test('--fix repairs line endings and the final newline, and leaves prose alone', () => {
    const fixed = fixBytes(Buffer.from('one\r\ntwo\r\n\r\n\r\n'));
    expect(fixed.toString()).toBe('one\ntwo\n');
    expect(fixBytes(Buffer.from('no newline')).toString()).toBe('no newline\n');
    const long = `${prose(130)}\n`;
    expect(fixBytes(Buffer.from(long)).toString()).toBe(long);
  });

  test('--fix keeps multi-byte characters', () => {
    expect(fixBytes(Buffer.from('café °C\r\n')).toString()).toBe('café °C\n');
  });
});

describe('md-format: scope', () => {
  test('.claude and the archive are outside, other Markdown is inside', () => {
    expect(inScope('.claude/commands/opsx/apply.md')).toBe(false);
    expect(inScope('openspec/changes/archive/2026-11-18-x/design.md')).toBe(false);
    expect(inScope('openspec/changes/add-hacs-release/design.md')).toBe(true);
    expect(inScope('README.md')).toBe(true);
    expect(inScope('package.json')).toBe(false);
  });
});

describe('md-format: file list', () => {
  const git = (cwd: string, ...args: string[]) => execFileSync('git', args, { cwd, stdio: 'pipe' });

  test('a tracked file removed from the working tree is left out, and a missing repository is a ToolError', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ecogeo-md-format-'));
    const ceiling = process.env['GIT_CEILING_DIRECTORIES'];
    try {
      git(dir, 'init', '-q');
      writeFileSync(join(dir, 'kept.md'), 'kept\n');
      writeFileSync(join(dir, 'gone.md'), 'gone\n');
      git(dir, 'add', '.');
      rmSync(join(dir, 'gone.md'));
      expect(markdownFiles(dir)).toEqual(['kept.md']);
      rmSync(join(dir, '.git'), { recursive: true, force: true });
      // Keep git from finding a repository in a parent folder of the temp dir.
      process.env['GIT_CEILING_DIRECTORIES'] = dirname(dir);
      expect(() => markdownFiles(dir)).toThrow(ToolError);
    } finally {
      if (ceiling === undefined) delete process.env['GIT_CEILING_DIRECTORIES'];
      else process.env['GIT_CEILING_DIRECTORIES'] = ceiling;
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
