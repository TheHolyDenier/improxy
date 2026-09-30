# Spec Delta

## Purpose

Permite preparar hojas de proxies para impresión en blanco y negro reduciendo la cobertura de tinta sin perder la legibilidad básica de nombres, símbolos, bordes y texto de las cartas.

## ADDED Requirements

### Requirement: Toggle ink-saving print mode

The system SHALL provide an explicit control that enables or disables ink-saving mode for the current workspace session, with the mode disabled by default.

#### Scenario: Enable ink-saving mode

- **WHEN** the user enables the ink-saving control
- **THEN** the printable preview visibly indicates that ink-saving mode is active and applies the ink-saving treatment to the proxy sheets

#### Scenario: Disable ink-saving mode

- **WHEN** the user disables the ink-saving control
- **THEN** the proxy sheets return to their normal visual treatment without changing selected cards, languages, quantities, or pagination

### Requirement: Preserve readable proxy content

The system SHALL reduce color and dark-area coverage while preserving enough contrast for the card name, card text, mana symbols, borders, and major visual boundaries to remain distinguishable in a black-and-white print.

#### Scenario: Readable monochrome sheet

- **WHEN** a resolved proxy sheet is rendered with ink-saving mode enabled
- **THEN** the sheet uses a monochrome or near-monochrome treatment with increased readability and no loss of the card image or text region

### Requirement: Limit the treatment to printable output

The system SHALL apply ink-saving styling to the printable proxy sheets without altering the interactive card search, printing selection, language controls, or workspace cards.

#### Scenario: Interactive workspace remains unchanged

- **WHEN** the user enables ink-saving mode
- **THEN** the editable workspace continues to show its normal preview and controls while the printable region reflects the selected mode

### Requirement: Preserve physical print layout

The system SHALL preserve the existing 3x3 composition, card dimensions of 63 mm by 88 mm, page breaks, selected copies, and print-only control hiding when ink-saving mode is enabled.

#### Scenario: Print dimensions remain stable

- **WHEN** the user prints a sheet with ink-saving mode enabled
- **THEN** every proxy keeps its 63 mm by 88 mm dimensions and the sheet contains the same copies and page grouping as normal mode

### Requirement: Explain the active mode accessibly

The system SHALL provide a visible localized label or notice describing that ink-saving mode is active and SHALL expose an accessible name and state for the toggle.

#### Scenario: Active mode is understandable

- **WHEN** the ink-saving mode is enabled
- **THEN** the user can identify from nearby localized text that the printed output is optimized for black-and-white ink usage
