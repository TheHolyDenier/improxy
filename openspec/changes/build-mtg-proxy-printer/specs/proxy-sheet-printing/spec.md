# Spec Delta

## Purpose

Genera una composición de proxies preparada para imprimir nueve cartas por hoja, manteniendo las dimensiones físicas de una carta estándar de Magic: The Gathering.

## ADDED Requirements

### Requirement: Compose a 3x3 proxy sheet

The system SHALL arrange selected cards in rows and columns of three, preserving the requested card quantity and starting a new page when a sheet is full.

#### Scenario: Default quantity prints once

- **WHEN** a resolved entry has no explicit quantity
- **THEN** the print preview includes exactly one copy of that card

#### Scenario: Nine cards fit one sheet

- **WHEN** the resolved list contains nine card copies
- **THEN** the print preview shows exactly three rows and three columns on one page

#### Scenario: More than nine cards

- **WHEN** the resolved list contains more than nine card copies
- **THEN** the system continues the same 3x3 layout on additional pages without dropping or duplicating copies

### Requirement: Update composition incrementally

The system SHALL reflect a quantity or row change in the print preview without reloading the application or rebuilding unaffected card selections.

#### Scenario: Increase one quantity

- **WHEN** the user increases one row's quantity by one
- **THEN** the preview adds one copy for that row while preserving the order and selections of all other rows

#### Scenario: Remove one row

- **WHEN** the user removes one row
- **THEN** the preview removes only that row's copies and recomputes page grouping without duplicating remaining cards

### Requirement: Preserve physical card dimensions

The system SHALL render each proxy at 63 mm by 88 mm in the print layout and SHALL not scale the card image to fill remaining page space.

#### Scenario: Print preview uses card size

- **WHEN** the user opens the print preview
- **THEN** each card slot has a 63 mm by 88 mm print dimension

#### Scenario: Browser print scaling warning

- **WHEN** the browser print dialog is opened
- **THEN** the interface instructs the user to disable browser scaling or use 100 percent scale

### Requirement: Review print readiness

The system SHALL show unresolved entries, total copies, selected printings, and selected languages before printing.

#### Scenario: Unresolved cards remain

- **WHEN** one or more entries have no selected printing
- **THEN** the print action is disabled and the unresolved entries are listed

#### Scenario: All cards resolved

- **WHEN** every requested copy has a selected printing with an image
- **THEN** the print action is enabled and the preview reflects the complete list

### Requirement: Print only the proxy sheets

The system SHALL provide a print action whose printed output excludes interactive workspace controls and uses print-specific page breaks.

#### Scenario: Start printing

- **WHEN** the user activates the print action
- **THEN** the browser print dialog opens with only the 3x3 proxy sheets included in the printable output
