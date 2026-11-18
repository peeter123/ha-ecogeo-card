# Design

## Context

See proposal.md for the motivation. The facts that shape the approach:

- The bundle is built by Vite into `build/ecogeo-card.js`. `npm run release` runs `scripts/check-release.mjs`, which
  loads the build in happy-dom, checks that `ecogeo-card` and `ecogeo-card-editor` are registered, and only then
  copies it to the committed `dist/ecogeo-card.js`. `package.json` is at version `0.0.0` and `private`.
- `src/card/ecogeo-card.ts` defines the element through `defineOnce` (`src/lib/define.ts`), which defines it only
  if the tag is free and warns when another copy holds it. `src/index.ts` adds the card picker entry
  (`CARD_PICKER`, named `ecoGEO Schematic`, with `preview: true`). The card has `getConfigElement`,
  `getStubConfig(hass)`, `getCardSize` and `getGridOptions`.
- `.gitattributes` forces LF and `dist/ecogeo-card.js` is LF, with module paths in posix form, so a build on Linux
  can be compared with the one committed from Windows.
- HACS (docs read 2026-11-18): a dashboard plugin's `.js` file lies in `dist/` or the root; HACS looks in `dist/`,
  then the latest release, then the root. The file must match the repository name unless `hacs.json` names it in
  `filename` (as established cards do, for example `lovelace-mushroom` with `mushroom.js`). Supported `hacs.json`
  keys: `name` (required), `content_in_root`, `filename`, `hide_default_branch`, `country`, `homeassistant`,
  `hacs`. The validation action is `hacs/action` with `category: plugin`. It also checks the repository's
  description, topics and issues.
- Home Assistant's custom card guide (developers.home-assistant.io, `frontend/custom-ui/custom-card`): a
  `window.customCards` entry takes `type`, `name`, `preview`, `description` and `documentationURL` (a help link in
  the card editor).
- The author's published repositories set the quality bar. hot-water-tank-estimator (`docs/development.md`,
  `scripts/lint.py`, `scripts/md_format.py`, `.yamllint`, `.codespellrc`, `.github/workflows/`) runs core's pinned
  codespell 2.4.3 and yamllint 1.38.0 through `uvx`, a Markdown format check, the workflow schema check
  `uvx check-jsonschema --builtin-schema vendor.github-workflows`, HACS validation, and `actions/checkout@v7` with
  `astral-sh/setup-uv` pinned by SHA (v10.3.3, uv 0.13.1). hrv-ventilation-card publishes `dist/` with a
  name-only `hacs.json` and no `homeassistant` minimum. Its Python-only parts (ruff, hassfest, the Integration
  Quality Scale) do not apply to a card.
- A dry run on 2026-11-18 found 18 codespell hits:
  - identifiers: `colorIn`, `positionOf` and `onOther`;
  - intended foreign keywords in `src/config/keywords.ts` and `dev/foreign.ts`: `compresor`, `produktion`, `ue` and
    `te`.

  It also found yamllint line-length errors in `openspec/config.yaml` (lines 102-105), and about 125 Markdown lines
  over 120 characters, mostly in `docs/ecogeo-card.md` (98) and README.md (25).
- The GitHub repository `peeter123/ha-ecogeo-card` exists, is public and empty, with issues enabled and no
  description or topics. `gh` is installed and logged in as `peeter123`. uv 0.13.1 is installed, and
  `uvx git-filter-repo` runs.
- The history has 66 commits by one author. The tracked tree holds no value from `private/installation.md`. Two
  early commits (the first bootstrap and the first live release) contain, in planning text since removed, the live
  dashboard's URL path and the bridge's hardware name.

## Goals / Non-Goals

**Goals:**

- A reviewer can confirm from the repository alone that a tag ships the bundle of its own sources, at its own
  version, and that the repository passes the same quality checks locally and on GitHub.
- The live installation sees no change except the new load message and help link.

**Non-Goals:**

- Automating releases from CI (a tag-triggered release job). The first release is made by hand with `gh` in
  group 6; automation can follow once the procedure has run a few times.
- Changing the bundle's name or the live resource URL.
- Rewrapping archived change artifacts (`openspec/changes/archive/`): they are excluded from the Markdown check, as
  in hot-water-tank-estimator.

## Decisions

### D1. The version lives in `package.json`, stamped in at build time

`vite.config.ts` reads `package.json` and defines a compile-time constant (`__ECOGEO_VERSION__`, declared in a
`.d.ts` under `src/`). A one-line module `src/lib/version.ts` exports it as `CARD_VERSION`. Vitest reads the same
config, so the tests see the real version. The card class exposes it as a static `version`, which the release check
reads from the registered element. That way the check does not have to parse console output.

Alternatives: a hand-written constant in `src/` (two places to bump, which is what the spec rules out), or reading
the version from the git tag (not available in a local build or a source checkout).

### D2. The load message is logged where the element is defined

`defineOnce` returns whether it defined the element. The card module logs
`console.info(\`ecogeo-card ${CARD_VERSION}\`)` only when it did. A second copy of the bundle, which defines
nothing, stays silent apart from the existing warning when the copies differ. The text is plain, with no `%c`
styling, so it reads the same in every console and in a test spy.

### D3. `hacs.json` holds only `name` and `filename`; the picker links the README

- `hacs.json` is `{ "name": "ecoGEO Schematic Card", "filename": "ecogeo-card.js" }`.
  - The name follows the card picker (`ecoGEO Schematic`).
  - No `homeassistant` minimum: no older version has been checked, so a minimum would be guesswork that could
    block users. hrv-ventilation-card makes the same choice.
  - No `hide_default_branch`, because the dist check keeps the default branch's bundle current, so offering it is
    harmless.
  - No `country`, because the card is not country-specific.
- `CARD_PICKER` in `src/strings.ts` gains `documentationURL: 'https://github.com/peeter123/ha-ecogeo-card#readme'`.
  The `CustomCardEntry` type gains the optional member. It is a public URL, not an installation value.

### D4. The release check gains a version check and a dist mode

The pure checks move into `scripts/release-checks.mjs` (exported functions: version mismatch, bundle comparison),
so unit tests can import them. `scripts/check-release.mjs` stays the command-line entry and keeps its current
behaviour, plus:

- After the registration check, it compares the registered card's `version` with `package.json` and refuses on a
  mismatch, naming both.
- `--verify-dist`: it runs the same checks on `build/ecogeo-card.js`, then compares it byte for byte with
  `dist/ecogeo-card.js`. It fails, naming `dist/ecogeo-card.js`, when they differ, and copies nothing. A new npm
  script `verify-dist` runs `vite build` and then this mode.

Alternative: commit no `dist/` and let CI attach the build to releases. HACS would then fetch the release asset.
Rejected: the live deploy and the README's manual install use the committed `dist/`, and the default branch would
have no installable file.

### D5. Two workflows, pinned like hot-water-tank-estimator's

- `.github/workflows/validate.yml`: the workflow from the HACS docs, with `category: plugin`. It runs on push, pull
  request, daily and on demand, with `permissions: {}`, using `hacs/action@main` (the HACS docs' recommendation:
  it tracks HACS's current rules; it has no release tags).
- `.github/workflows/check.yml`: `ubuntu-latest` and Node 24 (inside `engines`, the version used locally). Steps:
  1. `actions/checkout@v7` and `actions/setup-node` at its latest major (checked at implementation and recorded in
     docs), with the npm cache.
  2. `astral-sh/setup-uv` pinned by SHA to v10.3.3 with `version: 0.13.1`, copied from hot-water-tank-estimator's
     `lint.yml`.
  3. `npm ci` and `npx playwright install --with-deps chromium webkit`.
  4. `npm run check`, then `npm run verify-dist`.

  It runs on push, pull request and on demand, with `permissions: contents: read`.

The workflows are YAML: yamllint and the workflow schema check (D9) cover them, and Prettier formats them. They are
first exercised on GitHub, in group 6.

### D6. The history is rewritten with `git filter-repo --replace-text`, after a backup

`git-filter-repo` runs through `uvx git-filter-repo`, with no installation. The commit hash of the version it prints
is recorded in `private/`. Before the rewrite, `git bundle create private/pre-hacs-rewrite.bundle --all` saves the
old history in the git-ignored `private/`. The replacement expressions file also lives in `private/`, because it
contains the values it removes. It maps the dashboard URL path to `<dashboard>` and the bridge hardware phrase to
`an ESP32 board`, and the rewrite runs with both `--replace-text` and `--replace-message`, with `--force` because
the repository is not a fresh clone.

Verification:
- The commit count is unchanged.
- `git diff <old HEAD> HEAD` is empty, since the tree at HEAD never held the values.
- A scan of the tree and of every commit's diff and message finds none of the values in `private/installation.md`.
  The scan list is kept in `private/`: the live entity prefix, the resource id, the dashboard id and URL path,
  local drive paths and folder names, the private workspace's name, the bridge hardware, and the reference files'
  folder names. Values that are public anyway, such as the firmware default prefix `ecoforest_ecogeo` and the
  firmware repository's name, are not in the list.

All commit hashes change. No artifact cites a commit hash, so nothing in the tree needs updating.

Alternatives: a fresh single-commit history (it would lose the planning trail, and the user chose against it), or
`git filter-branch` (deprecated, slow, and easy to get wrong with message rewriting).

### D7. Publication runs in the orchestrator, one confirmed step at a time

Group 6 consists of `gh` and `git` commands with outward effects, not file edits, so the orchestrator runs it itself
and asks the user before each outward step. A subagent cannot ask. Order:

1. Set the repository's description and topics (`home-assistant`, `hacs`, `lovelace`, `lovelace-card`,
   `ecoforest`, `heat-pump`). HACS validation checks them, so they come first.
2. Add `origin`, push `main`.
3. Wait for both workflows to pass on `main`.
4. Create an annotated tag `v1.0.0` and push it.
5. Run `gh release create v1.0.0 dist/ecogeo-card.js --notes-file <the 1.0.0 section of CHANGELOG.md>`.
6. Check that `validate.yml`, re-run on demand, still passes.

The group's tasks.md check-offs are committed afterwards, and that commit is pushed as the last confirmed step.

### D8. Future releases

AGENTS.md and `openspec/config.yaml` record the procedure:
- A change's release group bumps `version` (minor for new behaviour, patch for fixes) and adds a `CHANGELOG.md`
  entry, then runs `npm run release` as now.
- Pushing, tagging and creating the GitHub release happen only on the user's explicit request, for that release.

The config's "never push" stays the default for task groups.

### D9. The Home Assistant quality checks run from one Node entry point

`scripts/lint-ha.mjs` (npm script `lint:ha`, added to `npm run check` after `format:check`) runs each tool and fails
on any finding:

- `uvx codespell@2.4.3`, configured by `.codespellrc`:
  - skip `.git`, `private`, `.claude`, `node_modules`, `build`, `dist`, `*.json` and images;
  - accept `hass`;
  - accept the foreign keywords that are meant to be foreign (`compresor`, `produktion`, `ue`, `te`), each with a
    comment naming the file that needs it.

  The identifiers it flags (`colorIn`, `positionOf`, `onOther`) are renamed, not ignored, because a clearer name is
  cheap. An `ignore-regex` accepts exactly those words, and `recieve`, when they stand in backticks, because this
  change's artifacts and the merged `release-packaging` spec quote them (the "Misspelling" scenario needs a
  misspelling). Skipping `openspec/changes/` instead would drop the archive from the check (settled in group 1).
- `tsconfig.json` sets `allowJs` (no `checkJs`), so tests can import the `.mjs` scripts' exported checks.
- `uvx yamllint@1.38.0` with `.yamllint` copied from hot-water-tank-estimator (default rules, 120 characters,
  `document-start` off, `truthy` keys unchecked). It covers `.github/workflows/`, `openspec/config.yaml` and the
  change metadata. The long lines in `openspec/config.yaml` are wrapped as folded scalars.
- `uvx check-jsonschema@<current>` with the built-in schema `vendor.github-workflows` on `.github/workflows/*.yml`,
  once that folder exists. The version is pinned at implementation and recorded in docs.
- `scripts/md-format.mjs`: a Node port of hot-water-tank-estimator's `scripts/md_format.py`.
  - It covers every tracked Markdown file outside `.claude/` and `openspec/changes/archive/`.
  - It checks for LF only, exactly one final newline, and at most 120 characters per line. Table rows, fenced code
    and lines with no space to break at are exempt.
  - `--fix` repairs only line endings and final newlines; prose is never rewrapped automatically.
  - Deviation from the source: it is written in Node rather than Python, so it runs without uv. It lists the
    tracked files with `git ls-files`, as the original does.

`scripts/check-on-edit.mjs` also handles an edited `.md` file (the Markdown format check on that file) and an
edited YAML file (yamllint on that file), as hot-water-tank-estimator's hook does, so an editing agent sees a
finding at once. Tool versions are listed in a table in `docs/ecogeo-card.md`'s development section, with their
source (core's `requirements_test_pre_commit.txt`, as recorded in hot-water-tank-estimator on 2026-10-31).

Alternatives: run codespell and yamllint through npm ports (not the tools core pins), or keep them out of
`npm run check` and run them in CI only (findings would surface only after a push).

## Risks / Trade-offs

- [The Linux build differs from the Windows build by a byte, so the dist check fails on CI] → Group 3 runs the
  check locally on Windows. If CI still differs on the first push, the orchestrator stops and brings the diff to
  the user, who decides between building `dist/` in CI and normalizing the comparison. A decision point, not a
  silent fix.
- [`npm run check` now needs uv] → uv is installed locally and pinned in CI. `lint-ha.mjs` fails with a clear
  message naming uv when `uvx` is missing.
- [`hacs/action@main` changes its rules and the daily run turns red] → That is the point of the daily run. The
  card keeps working, and the fix is a follow-up.
- [Rewrapping README.md and the docs changes text that tests read] → `test/readme.test.ts` and `test/docs.test.ts`
  run in the same group. Tables are exempt, so the option tables keep their rows.
- [The history rewrite goes wrong] → The bundle in `private/` restores it (`git clone` from the bundle). Nothing has
  been pushed before the rewrite, so no one else holds the old hashes.
- [An installation value missed by the scan list ends up public] → The list is built from every line of
  `private/installation.md`, and the Opus review of group 5 checks the list against that file before anything is
  pushed.
- [Browser tests are slower or flaky on CI (WebKit on Linux)] → They run with the same config as locally. A
  flaky test is a should-fix for the group that owns it, not a reason to drop WebKit.

## Migration Plan

- Live installation: group 2 releases the rebuilt bundle and deploys it explicitly, then bumps the resource's `?v=`.
  The dashboard config and resource URL stay. Rollback: deploy the previous `dist/ecogeo-card.js` from git and bump
  `?v=` again.
- Repository: the rewrite (group 5) happens before the first push (group 6). Rollback before the push: restore from
  the bundle. After the push, a mistake is fixed with a new commit, or, if an installation value leaked, by a
  rewrite and force-push, which the user decides.
