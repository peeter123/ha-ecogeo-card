# Design

## Context

`openspec validate --specs --strict` on 2026-11-26 fails 9 of 13 specs. Every failure is the same warning: a
requirement description (the text between `### Requirement:` and its first `#### Scenario`) over 500 characters.
The validator names requirements by index (`requirements[n]`, counted from 0 in file order); the proposal lists them
by name. The component-info and README facts are in the proposal.

## Goals / Non-Goals

**Goals:**

- All 13 accepted specs pass `openspec validate --specs --strict` after archive.
- No requirement changes meaning, except "Tap a component" for exchangers 7 and 8, which is corrected to match the
  card.

**Non-Goals:**

- Rewording, reordering or merging requirements that pass.
- New tests. Existing tests already cover the behaviour; the split does not add behaviour to test.

## Decisions

### D1. Which requirements

The 16 requirements are the ones the validator reports on the day the change starts (see the proposal for names).
Index `n` maps to the `n`-th `### Requirement:` heading of the spec file. Anything the validator reports beyond that
list also gets split, under the same rules.

### D2. How a requirement is split

The OpenSpec rule for splitting an existing requirement is followed:

- Under `## MODIFIED Requirements`, the requirement keeps its exact header and every scenario, unchanged. Its
  description keeps the one behaviour that the header names and that most of its scenarios test.
- Each behaviour taken out of the description becomes an `## ADDED Requirements` block in the same delta spec, with
  a short name of its own that does not exist in the spec yet, and at least one scenario with a WHEN and a THEN step.
- Examples and edge cases in the description ("for example ...", lists of item numbers, of roles or of values) become
  scenarios of the requirement they belong to, not description text.
- The text keeps its normative words (SHALL, SHALL NOT), its source tags and its item numbers. Nothing is dropped: every
  statement in the old description is in exactly one of the resulting requirements, either in a description or in a
  scenario.
- Every resulting description is 500 characters or fewer; aim for about 400 so later edits have room.
- Original scenarios stay under their MODIFIED header even where they now test a rule that moved to an ADDED
  requirement (for example "Unknown option" testing "Unknown options rejected"). Moving them would break the
  unchanged-scenarios rule above; the ADDED requirement gets scenarios of its own instead (decided 2026-11-26, group 1
  review).

Alternative considered: shorten the descriptions by rewording alone, with no new requirements. Rejected: most of these
descriptions state two or three behaviours, and squeezing them would drop meaning.

### D3. Tap a component

The MODIFIED "Tap a component" description states that a component opens the entity of its own role. A new ADDED
requirement names that role per component where it is not a value label's: evaporator 7 opens the evaporating
temperature, condenser 8 the condensing temperature and DHW valve 26 the DHW demand, entities no value label shows
(7 and 8 colour the refrigerant pipes). The compressor 11 fallback (speed, then percentage, then power) and "no
entity, not tappable" stay as they are. Source: `COMPONENT_ROLES` and `componentRole` in
`src/diagram/component-info.ts` (derived).

### D4. Verification

- `openspec validate tidy-specs --strict` passes for the change.
- A check that the split dropped nothing: for each split requirement, a reviewer reads the old description next to
  the new requirements and confirms that every statement survived (D2).
- After sync or archive, `openspec validate --specs --strict` passes for all 13 specs.
- `npm run check` passes, which also checks the README text through the Markdown format check and the README tests.

## Risks / Trade-offs

- [A split changes meaning by accident] → the D4 statement-by-statement check, and the whole-change review before
  archive.
- [Tests or docs cite a requirement by name] → only names that already exist are kept; new names are new. A grep for
  each old name in `test/` and `docs/` during the spec group confirms nothing cites a moved sentence.
- [Archive merges MODIFIED blocks by header] → headers are kept exactly as they are in the accepted specs.
