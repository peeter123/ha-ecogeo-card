# Tasks

Each of groups 1-5 is implemented by one Sonnet subagent, reviewed by Opus and committed alone (see
`openspec/config.yaml`). Group 6 is run by the orchestrator itself (design D7): its outward steps are commands, not
file edits, and each one is confirmed with the user first. Every group ends with `npm run check` green (from group 1
on, it includes the Home Assistant quality checks). Nothing installation-specific goes into a tracked file or into
this change's artifacts: values from `private/installation.md` are used only in files under `private/`.

## 1. Home Assistant quality checks

- [ ] 1.1 Add `.codespellrc` and `.yamllint` (design D9), and `scripts/lint-ha.mjs` with the npm script `lint:ha`,
  added to `npm run check` after `format:check`. It runs `uvx codespell@2.4.3`, `uvx yamllint@1.38.0`,
  `uvx check-jsonschema` (pinned to its current version) with `vendor.github-workflows` when
  `.github/workflows/` exists, and the Markdown format check. It fails on any finding, and with a message naming uv
  when `uvx` is missing.
  Verify: `npm run lint:ha` runs every tool. A unit test or a scripted run with a temporary file covers
  release-packaging "Misspelling" and "Invalid workflow".
- [ ] 1.2 Add `scripts/md-format.mjs`, a Node port of hot-water-tank-estimator's `scripts/md_format.py` (design D9:
  scope, rules, exemptions, `--fix` for line endings and final newline only). Name the source and the deviation in
  its header.
  Verify: unit tests of its line check cover release-packaging "Long Markdown line" and "Table rows and code
  blocks", plus CRLF and a missing final newline.
- [ ] 1.3 Fix the existing findings. Rename the identifiers codespell flags (`colorIn`, `positionOf`, `onOther`).
  Accept the intended foreign keywords in `.codespellrc` with comments. Wrap `openspec/config.yaml`'s long lines as
  folded scalars without changing their text. Rewrap README.md, docs/ecogeo-card.md, AGENTS.md and the accepted
  specs to 120 characters without changing their wording or tables.
  Verify: `npm run check` (with `lint:ha`) passes. `test/readme.test.ts` and `test/docs.test.ts` pass. `git diff
  --word-diff` on the Markdown shows line breaks only. `openspec validate --specs` passes.
- [ ] 1.4 Extend `scripts/check-on-edit.mjs`: an edited `.md` file gets the Markdown format check on that file, and
  an edited YAML file gets yamllint, with findings exiting 2 like the TypeScript checks (design D9).
  Verify: editing a Markdown file to have a 121-character prose line makes the hook report it, and undoing the edit
  clears it.
- [ ] 1.5 Document the checks in docs/ecogeo-card.md's development section: what each tool checks, the pinned
  versions with their source (a table as in hot-water-tank-estimator), and that `npm run check` needs uv. Mention
  them in README.md's development notes.
  Verify: `test/docs.test.ts` passes, and the table lists codespell, yamllint, check-jsonschema and the Markdown
  check with versions.

## 2. Version, load message, picker link and HACS manifest

- [ ] 2.1 Set `package.json` `version` to `1.0.0` (it stays `private`). In `vite.config.ts` read it and define
  `__ECOGEO_VERSION__`. Declare the constant in a `.d.ts` under `src/`, and export it as `CARD_VERSION` from
  `src/lib/version.ts` (design D1). Expose it as a static `version` on the card class.
  Verify: a unit test checks that `CARD_VERSION` equals the `package.json` version and matches `MAJOR.MINOR.PATCH`
  (release-packaging "Bundle carries the package version", "Version is a semantic version").
- [ ] 2.2 Make `defineOnce` (`src/lib/define.ts`) return whether it defined the element. Have the card module log
  `ecogeo-card <version>` with one plain `console.info` only then (design D2).
  Verify: unit tests with a `console.info` spy cover release-packaging "First load logs the version" (one call, with
  `ecogeo-card` and the version) and "Second load is silent". The existing `defineOnce` tests still pass.
- [ ] 2.3 Add `documentationURL` (`https://github.com/peeter123/ha-ecogeo-card#readme`) to `CARD_PICKER` and the
  optional member to `CustomCardEntry` (design D3).
  Verify: `test/index.test.ts` covers release-packaging "Picker entry".
- [ ] 2.4 Add `hacs.json` at the root with `name` `ecoGEO Schematic Card` and `filename` `ecogeo-card.js`, and nothing
  else (design D3).
  Verify: a unit test reads `hacs.json` and covers release-packaging "Manifest names the bundle" and "Manifest holds
  no unsupported key".
- [ ] 2.5 Extend `scripts/check-release.mjs`: move its pure checks into `scripts/release-checks.mjs` (exported, so
  tests import them), and after the registration check, compare the registered card's `version` with `package.json`.
  On a mismatch, refuse and name both versions (design D4).
  Verify: unit tests of `release-checks.mjs` cover release-packaging "Version mismatch" and "Matching build", and
  `npm run release` passes and copies the build.
- [ ] 2.6 Release live. Run `npm run release`, deploy `dist/ecogeo-card.js` with the command in
  `private/installation.md`, and bump the resource's `?v=` (id and current value there).
  Verify: the resource lists the new `?v=`. After a reload, system_log has no `frontend.js` error for the card. A
  subagent's verdict on a light-mode dashboard screenshot says the card renders as before. Record the deploy and the
  `?v=` in `private/installation.md`.

## 3. Dist check and continuous checks

- [ ] 3.1 Add `--verify-dist` to `scripts/check-release.mjs`. It runs the checks of group 2 on
  `build/ecogeo-card.js`, then compares it byte for byte with `dist/ecogeo-card.js`. It copies nothing and fails
  naming `dist/ecogeo-card.js` when they differ. Add the npm script `verify-dist` (`vite build` and then this mode)
  (design D4).
  Verify: unit tests of the comparison cover release-packaging "Stale bundle" and "Current bundle", and
  `npm run verify-dist` passes on the working tree.
- [ ] 3.2 Add `.github/workflows/validate.yml`: the HACS validation workflow with `category: plugin`, on push, pull
  request, a daily schedule and workflow_dispatch, with `permissions: {}` (design D5).
  Verify: `npm run lint:ha` passes, including yamllint and the workflow schema check on the new file. The review
  compares it with the HACS docs' example.
- [ ] 3.3 Add `.github/workflows/check.yml` (design D5): `actions/checkout@v7`, `actions/setup-node` at its latest
  major with Node 24 and the npm cache, `astral-sh/setup-uv` pinned by SHA with uv 0.13.1 (as in
  hot-water-tank-estimator's `lint.yml`), `npm ci`, the Playwright Chromium and WebKit install with system
  dependencies, `npm run check`, `npm run verify-dist`. It runs on push, pull request and workflow_dispatch, with
  `permissions: contents: read`. Record the action versions in the docs' tool table.
  Verify: `npm run lint:ha` passes on it. The review walks each step against the local commands, which pass on the
  working tree. The workflow first runs on GitHub in group 6.

## 4. Documentation and release procedure

- [ ] 4.1 README.md: an Installation section with HACS first (add `https://github.com/peeter123/ha-ecogeo-card` as
  a custom repository of category Dashboard, install, and the resource that HACS adds,
  `/hacsfiles/ha-ecogeo-card/ecogeo-card.js`, or how to add it by hand in YAML mode), then the manual steps. Add a
  note that the browser console shows the loaded version and that the card editor links to the README. In the
  status paragraph, drop `add-hacs-release` from the planned follow-ups.
  Verify: `test/readme.test.ts` passes, and a new README test checks that the HACS steps name the repository URL and
  the `hacsfiles` path.
- [ ] 4.2 docs/ecogeo-card.md: the same HACS installation ahead of the manual one, which stays, and a Releases
  section. It covers the version in `package.json`, the load message, `CHANGELOG.md`, `npm run release`,
  `npm run verify-dist`, the two workflows, and the tag and GitHub release (design D8).
  Verify: `test/docs.test.ts` passes. The Releases section names `verify-dist` and both workflow files.
- [ ] 4.3 Add `CHANGELOG.md` with a `1.0.0` section (dated on release, filled in by group 6) summarizing what the card
  does: the schematic for models B and C and variants 1-4, the sources and DHW storage, temperature colouring and
  flow, live values and more-info, the compact layout, the visual editor with entity suggestions, HTR recovery and
  the footer's power items. No emoji. Every number keeps its unit with a no-break space where it is UI text.
  Verify: `npm run lint:ha` passes on it, and a unit test checks that its top section is the `package.json`
  version.
- [ ] 4.4 AGENTS.md and `openspec/config.yaml`: record the release procedure (design D8) and the quality checks. A
  change's release group bumps the version and adds a `CHANGELOG.md` entry. Pushing, tagging and the GitHub release
  happen only on the user's explicit request for that release. In AGENTS.md's Layout, name `hacs.json`,
  `CHANGELOG.md`, `.github/workflows/`, `.codespellrc`, `.yamllint` and `lint:ha`. The orchestrator may edit these
  workspace instructions itself; the subagent edits the rest.
  Verify: `openspec validate add-hacs-release --strict` and `npm run lint:ha` pass. The review reads both texts
  against design D8 and D9.

## 5. History scrub before publication

- [ ] 5.1 Check that `uvx git-filter-repo --version` runs, and record its output in `private/`. Save the full history
  with `git bundle create private/pre-hacs-rewrite.bundle --all`, and note the old HEAD hash in `private/`.
  Verify: `git bundle verify private/pre-hacs-rewrite.bundle` passes.
- [ ] 5.2 Build the scan list in `private/` from every installation value in `private/installation.md` (design D6).
  Run the scan over the tree and every commit's diff and message, and write the hits (commit, file, value name, never
  the value) to `private/`.
  Verify: the list covers each kind named in design D6. The hits are the two known early commits and nothing else, or
  every other hit is reported to the orchestrator before 5.3.
- [ ] 5.3 Write the replacement expressions in `private/` and rewrite with `uvx git-filter-repo --replace-text` and
  `--replace-message`, with `--force` (design D6).
  Verify: the commit count is unchanged, `git diff <old HEAD> HEAD` is empty, and the scan of 5.2 finds nothing
  (release-packaging "History scan"). `npm run check` and `npm run verify-dist` pass.
  The review re-reads `private/installation.md` against the scan list.

## 6. Publication (orchestrator, each outward step confirmed)

- [ ] 6.1 Set the repository's description and topics with `gh repo edit` (design D7).
  Verify: `gh repo view peeter123/ha-ecogeo-card --json description,repositoryTopics` shows them.
- [ ] 6.2 Add `origin` (`https://github.com/peeter123/ha-ecogeo-card.git`) and push `main`.
  Verify: both workflows run on `main` and pass (`gh run list`). If the dist check fails only because the Linux
  build differs, stop and bring the diff to the user (design, Risks).
- [ ] 6.3 Date the `1.0.0` section of `CHANGELOG.md` (a Sonnet subagent edits it; `npm run check` green; committed as
  a small fix within this group). Push it. Create and push the annotated tag `v1.0.0`, and create the release:
  `gh release create v1.0.0 dist/ecogeo-card.js` with that section as notes.
  Verify: `gh release view v1.0.0` lists `ecogeo-card.js`. The tag's `dist/ecogeo-card.js` equals the local one.
  `validate.yml`, run on demand, passes.
- [ ] 6.4 Check the release as a HACS user would, read-only: the repository page shows the README, the release and
  `hacs.json`. Record the release in `private/installation.md` (the live installation keeps the manual deploy).
  Verify: the Opus review of group 6 reads the published state (`gh` output, workflow results) and is clean.
  Afterwards, the group's check-off commit is pushed as the last confirmed step.

## Workflow follow-up

- One fresh Opus review of the whole change before archiving.
- Archive the change and merge its delta spec into `openspec/specs/release-packaging/`. Name it in `AGENTS.md`, and
  push the archive commit only on the user's request.
- Later change: submit the card to the HACS default list (`hacs/default`) once the custom repository has been in use
  for a while.
