# Spec Delta

## Purpose

Ofrece un espacio de trabajo claro y visualmente distintivo para recorrer el flujo completo desde la importación de una lista hasta la revisión e impresión de proxies.

## ADDED Requirements

### Requirement: Guide the user through the proxy workflow

The system SHALL present the import, resolution, review, and print stages in a coherent workspace without requiring the user to navigate unrelated pages.

#### Scenario: Start with an empty workspace

- **WHEN** the application opens without an imported list
- **THEN** the user sees the list input as the primary action and a clear explanation of the expected format

#### Scenario: Continue after importing

- **WHEN** the user imports at least one valid entry
- **THEN** the workspace shows progress toward resolving cards and exposes the next relevant action

### Requirement: Edit the card list as a flexible row collection

The system SHALL present imported cards as independent editable rows, with direct actions to add, remove, duplicate if useful, and modify card details without forcing the user to rebuild the whole list.

#### Scenario: Add a card after searching

- **WHEN** the user adds a new row after other cards have been searched
- **THEN** only the new row enters a pending state and existing results and selections remain visible

#### Scenario: Remove a card after selecting a printing

- **WHEN** the user removes one row after selecting printings for other rows
- **THEN** only the removed row disappears and other selections remain intact

#### Scenario: Change a row quantity

- **WHEN** the user changes one row's quantity
- **THEN** the total and print preview update for that row without reloading or clearing unrelated state

### Requirement: Communicate state and actions accessibly

The system SHALL provide visible loading, success, empty, error, and disabled states for the primary workflow actions, with labels that identify their purpose.

#### Scenario: Search in progress

- **WHEN** Scryfall searches are running
- **THEN** the affected rows show a loading state and the user cannot start a conflicting duplicate search for those rows

#### Scenario: Action unavailable

- **WHEN** an action cannot be performed because required data is missing
- **THEN** the action is visibly disabled and the reason is available in nearby text or an accessible description

### Requirement: Provide an energetic visual identity

The system SHALL use a cohesive, high-energy visual style with feminine and defiant cues while preserving readable contrast, clear hierarchy, and usable controls.

#### Scenario: Visual hierarchy

- **WHEN** the user views the workspace
- **THEN** primary actions, unresolved cards, and print readiness are visually distinguishable from secondary information

#### Scenario: Responsive workspace

- **WHEN** the viewport changes between desktop and smaller widths
- **THEN** the workspace remains usable without hiding required actions or making card selection inaccessible

### Requirement: Preserve imported work during recoverable failures

The system SHALL retain the user's parsed list and selections when a search or preview operation fails in a recoverable way.

#### Scenario: Retry after failure

- **WHEN** a recoverable Scryfall request fails and the user retries
- **THEN** the existing list, successful results, and manual selections remain intact
