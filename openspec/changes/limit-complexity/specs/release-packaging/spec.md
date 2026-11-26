# Spec Delta

## ADDED Requirements

### Requirement: Complexity limit
The project check SHALL fail when a function in the card's sources, the emulator, the scripts or the root config
files has a cyclomatic complexity above 15, counted as ESLint's `complexity` rule counts it (classic variant). The
failure SHALL name the file and the function. Test files SHALL NOT be held to the limit.

#### Scenario: Function over the limit
- **WHEN** a function in a file under `scripts/` has a cyclomatic complexity of 16
- **THEN** the lint fails and names that file and that function

#### Scenario: Function at the limit
- **WHEN** a function in a file under `src/` has a cyclomatic complexity of 15
- **THEN** the lint reports no complexity finding for it

#### Scenario: Test files exempt
- **WHEN** a function in a file under `test/` has a cyclomatic complexity of 16
- **THEN** the lint reports no complexity finding for it

#### Scenario: The repository passes
- **WHEN** `npm run lint` runs on the repository at the end of the change
- **THEN** it reports no complexity finding
