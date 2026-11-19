# Spec Delta

## Purpose

What a released ecoGEO card consists of and how a release is checked: the single bundle and its HACS manifest, the one
version that the package, the bundle and its load message share, the card picker's documentation link, the release
check that refuses a stale or mismatched bundle, the check that the committed bundle is the build of the committed
sources, the Home Assistant quality checks, and that nothing installation-specific is published.

## ADDED Requirements

### Requirement: Single bundle with a HACS manifest
The released card SHALL be one self-contained JavaScript module at `dist/ecogeo-card.js`. A `hacs.json` at the
repository root SHALL give the display name `ecoGEO Schematic Card` and name that file in `filename`, so HACS finds it
although the repository is named `ha-ecogeo-card`. The manifest SHALL hold no installation-specific value.

#### Scenario: Manifest names the bundle
- **WHEN** `hacs.json` is read
- **THEN** it is valid JSON with `name` set to `ecoGEO Schematic Card` and `filename` set to `ecogeo-card.js`, and
  `dist/ecogeo-card.js` exists in the repository

#### Scenario: Manifest holds no unsupported key
- **WHEN** the keys of `hacs.json` are compared with the keys HACS supports for a dashboard plugin
- **THEN** every key is one of `name`, `filename`, `content_in_root`, `hide_default_branch`, `country`,
  `homeassistant` and `hacs`, and `content_in_root` is absent or `false`

### Requirement: One version
The card's version SHALL be written in one place, the `version` of `package.json`, as a semantic version
(`MAJOR.MINOR.PATCH`). The bundle SHALL carry that version, and a release tag SHALL be that version prefixed with `v`.
The first release is `1.0.0`.

#### Scenario: Bundle carries the package version
- **WHEN** the bundle is built with `package.json` at version `1.0.0`
- **THEN** the version the card reports is `1.0.0`

#### Scenario: Version is a semantic version
- **WHEN** the `version` of `package.json` is read
- **THEN** it matches `MAJOR.MINOR.PATCH` with numeric parts and no prefix

### Requirement: Load message
When the bundle defines the card's element, it SHALL log exactly one informational console line naming the card and
its version, in plain text (no emoji, no styling escapes that hide the text). Loading the bundle a second time,
which defines no element, SHALL log no further informational line; the existing warning when another copy holds the
tag stays.

#### Scenario: First load logs the version
- **WHEN** the bundle is loaded into a page where `ecogeo-card` is not defined and the version is `1.0.0`
- **THEN** exactly one `console.info` call is made, and its text contains `ecogeo-card` and `1.0.0`

#### Scenario: Second load is silent
- **WHEN** the bundle is loaded again into the same page
- **THEN** no further `console.info` call is made

### Requirement: Release check refuses a mismatched bundle
`npm run release` SHALL copy a build to `dist/` only when the build registers the card and its editor and reports the
version in `package.json`. Otherwise it SHALL leave `dist/` untouched and name the reason.

#### Scenario: Version mismatch
- **WHEN** the build reports `0.9.0` while `package.json` says `1.0.0`
- **THEN** the release check fails, names both versions, and `dist/ecogeo-card.js` is unchanged

#### Scenario: Matching build
- **WHEN** the build registers the card and its editor and reports the version in `package.json`
- **THEN** the release check copies it to `dist/ecogeo-card.js`

### Requirement: Committed bundle is the build of the committed sources
A dist check SHALL build the card from the sources and compare the result byte for byte with the committed
`dist/ecogeo-card.js`, failing when they differ, so a tagged release cannot ship a bundle older or newer than its
sources. The repository's continuous checks SHALL run it on every push and pull request, together with the
project check (type check, lint, format and the unit and browser tests) and HACS validation.

#### Scenario: Stale bundle
- **WHEN** a source file changes and `dist/ecogeo-card.js` is not rebuilt
- **THEN** the dist check fails and names `dist/ecogeo-card.js`

#### Scenario: Current bundle
- **WHEN** `dist/ecogeo-card.js` was written by `npm run release` from the current sources
- **THEN** the dist check passes

### Requirement: Card picker entry links the documentation
The card's entry in Home Assistant's card picker (`window.customCards`) SHALL carry `type`, `name`, `description`,
`preview: true` and a `documentationURL` that points to the README of the public repository
(`https://github.com/peeter123/ha-ecogeo-card`), so the card editor shows a help link.

#### Scenario: Picker entry
- **WHEN** the bundle is loaded and `window.customCards` is read
- **THEN** it holds one entry of type `ecogeo-card` whose `documentationURL` starts with
  `https://github.com/peeter123/ha-ecogeo-card`

### Requirement: Home Assistant quality checks
The project check SHALL also run the tools Home Assistant core pins for non-code files, at core's versions:
codespell over the tracked text and yamllint over the tracked YAML (GitHub workflows included). It SHALL also run a
Markdown format check (LF line endings, one final newline, at most 120 characters per line outside tables, code
blocks and unbreakable lines) and a schema check of the GitHub workflow files. Any finding SHALL fail the check.

#### Scenario: Misspelling
- **WHEN** a tracked Markdown file contains the word `recieve` in prose (not quoted in backticks)
- **THEN** the project check fails and names that file

#### Scenario: Long Markdown line
- **WHEN** a tracked Markdown file outside `.claude/` and `openspec/changes/archive/` has a prose line of 121
  characters with a space to break at
- **THEN** the Markdown format check fails and names that file and line

#### Scenario: Table rows and code blocks
- **WHEN** a line longer than 120 characters is a table row or lies inside a fenced code block
- **THEN** the Markdown format check accepts it

#### Scenario: Invalid workflow
- **WHEN** a workflow file under `.github/workflows/` has a job without `runs-on`
- **THEN** the workflow schema check fails and names that file

### Requirement: Nothing installation-specific is published
No tracked file and no commit in the published history SHALL contain a value listed in the git-ignored
`private/installation.md` that identifies the installation (entity ids of the live installation, resource and
dashboard ids or paths, hostnames, local paths, bridge hardware).

#### Scenario: Public values are named
- **WHEN** a value listed in `private/installation.md` is public or generic (the firmware's default prefix and
  release versions, Home Assistant's standard paths, the live readings that seed the emulator)
- **THEN** it may appear, and the scan list or its notes in `private/` name it and why

#### Scenario: History scan
- **WHEN** every identifying value from `private/installation.md` is searched for in the tree and in every commit's
  diff and message of the history to be pushed
- **THEN** no value is found
