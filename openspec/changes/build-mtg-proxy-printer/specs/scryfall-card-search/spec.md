# Spec Delta

## Purpose

Permite encontrar cartas e impresiones concretas mediante Scryfall y resolver cada entrada de la lista con una edición e idioma elegidos por el usuario.

## ADDED Requirements

### Requirement: Search Scryfall cards

The system SHALL search Scryfall for each valid card entry and present the card name, set, collector number, language, and available image when a result is found.

#### Scenario: Exact card search

- **WHEN** a valid entry has a matching Scryfall card
- **THEN** the workspace shows the matching card and its available printing details

#### Scenario: Card not found

- **WHEN** Scryfall returns no matching card
- **THEN** the entry is marked unresolved with an actionable message and does not block other entries from being searched

### Requirement: Select a specific printing

The system SHALL allow the user to select a specific printing manually and SHALL show enough visual and textual information to distinguish available printings.

#### Scenario: Choose printing by image

- **WHEN** multiple printings are available and the user selects one preview
- **THEN** that printing becomes the selected printing for the entry

#### Scenario: Preserve requested set preference

- **WHEN** an imported entry includes a set constraint
- **THEN** the search prioritizes matching printings while still allowing the user to choose another printing explicitly

### Requirement: Apply language preferences

The system SHALL allow a global language selection and an individual language selection for each card entry.

#### Scenario: Apply global language

- **WHEN** the user selects a language globally
- **THEN** all entries with available printings in that language are updated to that language without overwriting explicit per-entry overrides

#### Scenario: Override language for one entry

- **WHEN** the user selects a different language for one entry
- **THEN** only that entry uses the selected language and the global preference remains unchanged

### Requirement: Handle Scryfall failures

The system SHALL show a recoverable error when Scryfall is unavailable, rate-limits the request, or returns malformed data.

#### Scenario: Temporary API failure

- **WHEN** a card search cannot be completed because of a network or API error
- **THEN** the affected entry shows the failure state and offers retry without losing the imported list
