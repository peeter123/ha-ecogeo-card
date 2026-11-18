# Proposal

## Why

The card is finished enough for other ecoGEO owners, but only one installation can use it: it reaches Home Assistant
through a private deploy script and has no version, no public repository and no HACS manifest. The public repository
now exists and is empty (`https://github.com/peeter123/ha-ecogeo-card`, created 2026-11-18). This change makes the
card installable through HACS as a custom repository, holds the repository to the same Home Assistant quality checks
as the author's other published repositories (hrv-ventilation-card, hot-water-tank-estimator), and publishes version
1.0.0.

## What Changes

- **One version, carried by the bundle.** `package.json` gets version `1.0.0` and is the only place it is written.
  The build stamps it into the bundle; the card logs one info line with its name and version when it loads, so a user
  can see which version the browser runs. `npm run release` refuses a bundle whose version is not the one in
  `package.json`.
- **HACS manifest.** A `hacs.json` at the root names the card and points HACS at `dist/ecogeo-card.js` (`filename`),
  because the repository name (`ha-ecogeo-card`) differs from the bundle name. The bundle keeps its name, so the live
  installation's resource URL does not change.
- **Card picker help link.** The card picker entry gets the `documentationURL` that Home Assistant's custom card
  guide describes, pointing to the README, so the card editor shows a help link. The card already has the other
  members the guide names (`getConfigElement`, `getStubConfig`, `getCardSize`, `getGridOptions`, a preview).
- **Home Assistant quality checks.** As in hot-water-tank-estimator: codespell and yamllint at the versions Home
  Assistant core pins (2.4.3 and 1.38.0, run with `uvx`), a Markdown format check (LF, one final newline, 120
  characters per line) and a schema check of the workflow files, all part of `npm run check` and of the quality
  hook for Markdown and YAML edits. The existing findings are fixed: the long lines in README.md, docs and
  `openspec/config.yaml`, and codespell's hits on identifiers and on the intended foreign keywords.
- **Continuous checks on GitHub.** Two workflows: HACS validation (`hacs/action`, category `plugin`) and the project
  check (`npm ci`, uv, `npm run check` with the browser tests and the quality checks, then a fresh build compared
  byte for byte with the committed `dist/ecogeo-card.js`, so a tag can never ship a stale bundle).
- **Public documentation.** README: HACS installation (custom repository, category Dashboard) before the manual
  steps, the HACS resource path, and a version note. `docs/ecogeo-card.md`: the same, plus how releases are made and
  which quality checks run. A `CHANGELOG.md` whose `1.0.0` entry becomes the release notes. `AGENTS.md` and
  `openspec/config.yaml`: the release procedure (version bump with each change's release, tag, GitHub release), with
  pushing and releasing only on the user's explicit request.
- **History scrubbed before the first push.** The tracked tree holds nothing installation-specific, but two early
  commits mention the live dashboard's URL path and the bridge hardware. The local history is rewritten
  (`git filter-repo --replace-text`, run with `uvx`) to replace them, after a backup bundle, and the whole history is
  scanned again for every installation value in `private/installation.md`. Author lines and session trailers stay
  (the user's decision, 2026-11-18).
- **Publication.** A last group, at the user's explicit request (2026-11-18), sets the repository's description and
  topics, adds the remote, pushes `main`, waits for both workflows to pass, tags `v1.0.0` and creates the GitHub
  release with `dist/ecogeo-card.js` attached. The orchestrator confirms each outward step with the user before it
  runs it. `gh` is installed and logged in.

## Capabilities

### New Capabilities

- `release-packaging`: what a released card consists of: the single bundle and its HACS manifest, the version that
  `package.json`, the bundle and its load message share, the card picker's documentation link, the release check
  that refuses a stale or mismatched bundle, the check that the committed bundle is the build of the committed
  sources, the Home Assistant quality checks, and that nothing installation-specific is published.

### Modified Capabilities

None. The card's drawing, values, layout and editor are unchanged.

## Out of scope

- Home Assistant's Integration Quality Scale and hassfest: they apply to integrations, and this repository holds a
  card only. Their counterparts for a card are the checks above.
- Submitting the card to the HACS default list (a pull request to `hacs/default`): a later change, once the custom
  repository has been in use for a while. Until then users add it as a custom repository.
- Installing the card through HACS on the live installation: it keeps the manual deploy (the user's decision,
  2026-11-18), so unreleased builds can still be tested live.
- Publishing to npm: `package.json` stays `private`.
- The README's other planned follow-up, `add-browser-tests`: unchanged here. Most of it already exists as the
  browser test project.
- A minimum Home Assistant version in `hacs.json`: none has been checked on older versions, so none is set, as in
  hrv-ventilation-card. Added when one is known.
- Firmware registers and entities: no entity, register or component fact changes (no manual-figure,
  firmware-entity, Registers.csv or derived fact is added or changed).

## Impact

- New files: `hacs.json`, `CHANGELOG.md`, `.github/workflows/validate.yml`, `.github/workflows/check.yml`,
  `.codespellrc`, `.yamllint`, the quality check and Markdown format scripts in `scripts/`.
- Code: `vite.config.ts` (the version define), `src/index.ts` (the picker's `documentationURL`), the card module
  (the load message), a small version module and its declaration, `scripts/check-release.mjs` (the version check and
  a `--verify-dist` mode), `scripts/check-on-edit.mjs` (Markdown and YAML edits), `package.json` (version and
  scripts), tests. Identifiers that codespell flags are renamed or listed as accepted words.
- Docs: README.md and docs/ecogeo-card.md (HACS, releases, checks, and rewrapped to 120 characters), AGENTS.md,
  `openspec/config.yaml`, the accepted specs where a line is too long.
- Tooling: `uv` (installed) runs codespell, yamllint, check-jsonschema and git-filter-repo; CI installs it pinned.
- Git: the local history is rewritten once, before anything is pushed; every commit hash changes. A backup bundle
  of the old history is kept in `private/`.
- External: the GitHub repository `peeter123/ha-ecogeo-card` receives the history, the tag `v1.0.0` and a release.
- Live installation: yes, a rebuilt bundle (the load message, the version and the help link). `npm run release`,
  explicit deploy of `dist/ecogeo-card.js`, the dashboard resource bumped to the next `?v=` (id and current value
  in `private/installation.md`). The dashboard config and the resource URL stay as they are.
