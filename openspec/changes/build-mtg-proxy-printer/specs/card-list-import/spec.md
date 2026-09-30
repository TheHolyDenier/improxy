# Spec Delta

## Purpose

Permite transformar una lista de cartas escrita por el usuario en entradas estructuradas, editables y verificables antes de buscar sus impresiones.

## ADDED Requirements

### Requirement: Parse card names with optional details

The system SHALL accept a card name as the only required value and SHALL default its quantity to `1`. It SHALL also accept an optional positive quantity and an optional set constraint.

#### Scenario: Parse a name-only entry

- **WHEN** the user enters `Lightning Bolt`
- **THEN** the system creates one entry with card name `Lightning Bolt`, quantity `1`, and no set constraint

#### Scenario: Parse a name with set

- **WHEN** the user enters `Counterspell (STA)`
- **THEN** the system creates one entry with card name `Counterspell`, quantity `1`, and set constraint `STA`

#### Scenario: Parse quantity and set

- **WHEN** the user enters `2 Counterspell (STA)`
- **THEN** the system creates one entry with quantity `2`, card name `Counterspell`, and set constraint `STA`

### Requirement: Report invalid lines without blocking valid entries

The system SHALL identify lines without a usable card name or with an invalid quantity without discarding valid entries from the same list. Empty lines SHALL be ignored.

#### Scenario: Invalid quantity

- **WHEN** a line has no positive integer quantity after a quantity is provided
- **THEN** the system marks that line as invalid and explains the expected format

#### Scenario: Mixed valid and invalid input

- **WHEN** the list contains both valid and invalid lines
- **THEN** the system keeps valid entries available for search and shows the invalid lines for correction

#### Scenario: Blank lines

- **WHEN** the list contains blank or whitespace-only lines
- **THEN** the system ignores those lines without showing an error

### Requirement: Edit each imported row independently

The system SHALL expose each parsed entry as an editable row where the user can change the card name, quantity, and optional set constraint without re-entering the complete list.

#### Scenario: Correct an imported entry

- **WHEN** the user edits a parsed row and saves the change
- **THEN** the system validates the edited values and updates only that row

#### Scenario: Add a row

- **WHEN** the user adds a new card row
- **THEN** the system creates an editable row with quantity `1` and leaves existing rows, results, and selections unchanged

#### Scenario: Remove a row

- **WHEN** the user removes a card row
- **THEN** the system removes only that row and leaves all remaining rows and their selections unchanged

### Requirement: Preserve row identity during edits

The system SHALL keep a stable identity for each row so that adding, removing, or editing one row does not replace unrelated rows or reset their loading, result, language, printing, or error state.

#### Scenario: Edit one row after another is resolved

- **WHEN** the user edits an unresolved row while another row has a selected printing
- **THEN** the resolved row keeps its selected printing and the edit affects only the unresolved row
