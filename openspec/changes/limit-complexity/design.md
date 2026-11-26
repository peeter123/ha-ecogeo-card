# Design

## Context

ESLint 10 runs in `npm run lint` (`eslint . --max-warnings 0`) and in the quality hook, which runs ESLint on each edited
TypeScript file under `src/`, `test/` or `dev/` (`scripts/check-on-edit.mjs`). `eslint.config.js` has separate blocks
for TypeScript and for `.js`/`.mjs` files. The rule's options and its count are from the ESLint 10.5 docs for
`complexity` (Context7, `/eslint/eslint/v10.5.0`): `max` defaults to 20, and `variant` is `classic` (the default) or
`modified`.

Guards that already pin the card's output:

- the markup snapshot (`test/diagram/arrangement-snapshot.test.ts`): the SVG markup and label positions for every
  capture in `dev/captures.ts`, one snapshot file per capture;
- the unit and browser tests, including the overlap tests;
- the pixel references on CI Linux (`npm run test:visual`, compared in `check.yml` only).

## Goals / Non-Goals

**Goals:**

- Every function outside `test/` is at complexity 15 or lower, and the lint keeps it so.
- The card's output is unchanged: the same markup, the same values, the same editor.

**Non-Goals:**

- Lower complexity elsewhere, file moves or renames, new abstractions beyond what a split needs.

## Decisions

### D1. The list to fix

The list is what ESLint reports when the work starts, run with the rule enabled and the limit set to 15, over `src/`,
`dev/`, `scripts/` and the root config files:
`npx eslint src dev scripts *.js *.ts --rule '{"complexity":["error",15]}'`. Each group starts by running this for
its folders. A function that a refactor splits must leave every new function at 15 or lower.

### D2. How a function is brought under the limit

Behaviour-preserving moves only, in this order of preference:

1. **A lookup table instead of a branch chain:** a `Record` or `Map` from key to value or handler, where the branches
   map one value to another (for example mode to circuits, unit to format).
2. **Extract a named helper** for a block that does one thing: a pure function in the same file, next to its caller,
   with a doc comment. It is exported only when a test needs it.
3. **Early returns** instead of nested conditions.
4. **Defaults gathered once:** an options object normalised at the top, instead of `?.` and `??` repeated through
   the body (each one counts in the classic variant).

Not allowed: changing a public signature, changing an order of evaluation that a test or the markup can observe, or
an `eslint-disable` comment for `complexity`. If a function cannot reach 15 without one of these, it is a decision
point for the user.

### D3. Proof of no change

- The arrangement snapshots pass without being updated. A diff under `test/diagram/__snapshots__/` is a blocking
  finding.
- `npm run check` passes: the unit tests, and the browser tests in Chromium and WebKit.
- The release group runs `npm run release` and `npm run verify-dist`. CI runs the visual references after the user
  pushes, not as part of a task.
- Scripts (`search-places.mjs`, `check-on-edit.mjs`):
  - `npm run search-places -- --layout=horizontal --width=560` and `-- --layout=vertical --width=320` print the same
    report before and after the refactor (it is saved to the scratchpad and compared);
  - the hook is checked by its own tests in `test/scripts/` and by a manual edit of a TypeScript and a Markdown file.

### D4. The rule in the config and its test

- `eslint.config.js` gets one block for `src/`, `dev/`, `scripts/` and the root config files, with
  `complexity: ['error', { max: 15 }]`. `test/` is not in its `files`.
- A unit test, `test/scripts/complexity.test.ts`, lints three fixture texts through ESLint's Node API (`lintText`,
  `filePath` set so the config's file blocks apply). Each fixture has a function of known complexity:
  - 16 under a `scripts/` path: reported;
  - 15 under a `scripts/` path: not reported;
  - 16 under a `test/` path: not reported.

  The fixtures use `.mjs` paths so no type information is needed. The `src/` side shares the same config block, and
  "The repository passes" covers it.

### D5. The review pass

- `npx knip@6.45.1` and `npx jscpd@5.4.3 src` run once, in the review group. Their reports are saved to the scratchpad.
  They are not added to `package.json`.
- knip may need a small config to know the entry points (`src/index.ts`, `dev/`, `scripts/`, `test/`). It is passed on
  the command line or written to the scratchpad, not committed, because the tool is not adopted.
- A finding is fixed only after it is confirmed in the code:
  - for an unused export, nothing imports it, including the tests and `dev/`;
  - for a copied block, both copies do the same thing for the same reason.
- `strings.ts` entries that nothing uses are dead code too.
- Settled in the group 5 review (2026-11-26):
  - `CIRCUIT_IDS` stays an exported const, because only its type is used and a module-local const fails
    `no-unused-vars`. Turning `CircuitId` into a literal union is a change of its own.
  - The `RolePath` re-export in the hrv-ventilation copy `src/lib/config.ts` goes, and the copy header names the
    deviation.
  - Duplicates below jscpd's default threshold stay, because the pass fixes what the tools report. Merging the three
    plain-object guards would need a shared module, which is a file reorganisation.
- A finding that is kept, for example a test-only export or a deliberate copy from hrv-ventilation, goes in the group's
  commit body with its reason.

### D6. Order of the groups

The refactors come first, one group per area, then the review pass, then the rule. Enabling the rule last keeps
`npm run check` green at every group commit, and the review pass may create helpers that the rule then measures. Each
refactor group still runs D1's command for its own folders, so the rule's group only confirms.

## Risks / Trade-offs

- **[A refactor changes the drawing in a way the snapshots do not see, such as a measured layout]** → the browser
  overlap tests in both engines, the visual references on CI after the push, and a live screenshot check at the end.
- **[The classic variant counts `?.` and `??`, which pushes a function over the limit for null-safety rather than
  branching]** → D2 move 4. If that is still not enough, it is a decision point (switch to the `modified` variant or
  raise the limit), not an exception.
- **[knip reports exports that only the tests or the emulator use]** → D5: confirmed in the code before anything is
  removed. The tests and `dev/` count as users.
- **[The quality hook (`check-on-edit.mjs`) is refactored while it runs on every edit]** → its tests, and an edit
  checked by hand right after the change. A broken hook shows on the next edit.
