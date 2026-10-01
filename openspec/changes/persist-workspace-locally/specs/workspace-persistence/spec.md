# Spec Delta

## Purpose

Preserves the user's card workspace across page reloads and browser restarts,
restoring selected card data locally without repeating Scryfall searches for
cards that were already resolved.

## ADDED Requirements

### Requirement: Automatically persist the workspace locally

The system SHALL automatically persist the current card-list text and workspace
state in the current application origin's browser storage. Persisted state
SHALL include card rows, quantities, selected printings, global and per-card
language preferences, loaded printing data and languages, and relevant parse
and resolution errors.

#### Scenario: Save workspace changes

- **WHEN** the user imports cards, changes a quantity or printing, changes a
  language, adds or removes a card, or edits the list text
- **THEN** the latest workspace state is saved automatically without requiring
  a separate save action

#### Scenario: Preserve unimported list text

- **WHEN** the user has edited the card-list text but has not imported it
- **THEN** the text is restored when the application is reopened

### Requirement: Restore saved workspace without searching Scryfall

The system SHALL restore valid saved workspace data automatically when the
application opens and SHALL NOT re-import restored list text or issue Scryfall
card searches for restored rows during hydration.

#### Scenario: Restore resolved cards without card searches

- **WHEN** the application opens with saved resolved rows and selected
  printings
- **THEN** it restores those rows and print previews from saved printing data
  without calling the Scryfall card-search API

#### Scenario: Restore loaded language data

- **WHEN** a restored row contains printing results and loaded-language
  history from prior searches
- **THEN** switching to one of those loaded languages reuses the restored data
  without a new Scryfall search

#### Scenario: Restore an interrupted import without completing it silently

- **WHEN** the page closes during an import after some rows have resolved
- **THEN** reopening restores the saved list text and resolved rows without
  automatically searching the remaining text again

#### Scenario: Restore transient row states safely

- **WHEN** a saved row was marked as loading when the page closed
- **THEN** the application restores its available saved data in a stable
  non-loading state and does not automatically restart its search

### Requirement: Handle invalid saved data and storage failures explicitly

The system SHALL validate saved data before restoring it. If the saved data is
invalid, has an unsupported version, or browser storage cannot be read or
written, the system SHALL communicate the problem and SHALL NOT silently
discard the active workspace or overwrite saved data that could not be
restored.

#### Scenario: Invalid saved workspace

- **WHEN** the stored workspace cannot be parsed or fails validation
- **THEN** the application reports that the saved workspace could not be
  restored and does not automatically replace it with empty state

#### Scenario: Unsupported saved workspace version

- **WHEN** the stored workspace uses a version the application cannot read
- **THEN** the application reports that the saved data is incompatible and
  preserves it until the user explicitly clears it

#### Scenario: Storage write fails

- **WHEN** browser storage is unavailable or cannot save the latest workspace
- **THEN** the application remains usable and clearly reports that the latest
  changes are not being persisted

### Requirement: Let the user clear saved workspace data

The system SHALL provide an explicit action to clear the current workspace and
its saved browser data.

#### Scenario: Clear saved workspace

- **WHEN** the user activates the clear-workspace action
- **THEN** the current rows, list text, errors, and saved workspace are removed
  and the application returns to its empty state

### Requirement: Keep persistence local to the browser

The system SHALL store workspace data only in the current application origin's
browser storage. It SHALL NOT upload workspace data to a server or persist
card image binaries as part of the workspace.

#### Scenario: Reopen in the same browser profile

- **WHEN** the user reopens the application at the same origin in the same
  browser profile
- **THEN** the saved workspace is available for restoration

#### Scenario: Open on another device or origin

- **WHEN** the user opens the application on another device, browser profile,
  or origin
- **THEN** that environment does not receive the locally saved workspace

#### Scenario: Restore card images

- **WHEN** a restored card printing is displayed
- **THEN** its existing image URL is used and the image is fetched as needed
  rather than restoring a stored image binary
