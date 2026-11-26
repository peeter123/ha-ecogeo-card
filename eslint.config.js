import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import { configs as lit } from 'eslint-plugin-lit';
import { configs as wc } from 'eslint-plugin-wc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['dist/', 'build/', 'openspec/', 'node_modules/', '.claude/'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // `const { key, ...rest } = obj` is the idiomatic way to leave a key out.
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  {
    files: ['{src,test,dev}/**/*.{ts,mts,cts,tsx}'],
    ...lit['flat/recommended'],
  },
  {
    files: ['{src,test,dev}/**/*.{ts,mts,cts,tsx}'],
    ...wc['flat/recommended'],
    languageOptions: { globals: globals.browser },
    settings: { wc: { elementBaseClasses: ['LitElement'] } },
  },
  { files: ['**/*.js', '**/*.mjs', '**/*.cjs'], ...tseslint.configs.disableTypeChecked },
  { files: ['**/*.js', '**/*.mjs', '**/*.cjs'], languageOptions: { globals: globals.node } },
  {
    // Cyclomatic complexity 15 at most, as ESLint's classic `complexity` rule counts it (`?.`, `??`, `||=` and
    // default values each count a path). test/ is exempt (user decision 2026-11-26):
    // test bodies branch per case and guard optional lookups with `?.` and `??`, and that count says little about
    // the code's quality.
    files: ['{src,dev,scripts}/**/*.{ts,mts,cts,tsx,js,mjs,cjs}', '*.{ts,mts,cts,js,mjs,cjs}'],
    rules: { complexity: ['error', { max: 15 }] },
  },
  prettier,
);
