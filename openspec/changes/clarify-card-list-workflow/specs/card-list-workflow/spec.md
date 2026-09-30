# Spec Delta

## Purpose

This capability gives users a clear, continuous workflow for turning a card list into printable proxies. It makes card identity, quantity, edition, language, and printing actions understandable without requiring users to manage intermediate pending states.

## ADDED Requirements

### Requirement: The workspace presents three clear workflow steps

The application SHALL present the workflow using exactly three user-facing steps: adding a list, adjusting the list, and printing. Each step MAY use a playful title, but its title or supporting subtitle SHALL clearly communicate the action the user performs at that stage. The print preview SHALL belong to the printing step and SHALL NOT be presented as a fourth numbered step.

#### Scenario: User sees the workflow structure

- **WHEN** the workspace is rendered
- **THEN** the visible step titles communicate “Añadir lista”, “Ajustar lista”, and “Imprimir”, in that order, even if the wording is playful
- **AND** each title or subtitle makes the current action understandable without relying on the user guessing the joke
- **AND** no visible step label presents the preview as step four

### Requirement: Card rows separate quantity from resolved card selection

Cards SHALL be created only through list import or quick add. Once a card is added successfully, its name SHALL be read-only in the row, while the selected edition/set and language SHALL remain adjustable in the result card. The row SHALL allow quantity adjustment and removal and SHALL NOT require separate duplicate or search actions for the normal flow.

#### Scenario: User edits a card row

- **WHEN** a card row is displayed
- **THEN** the row displays its name and quantity controls without duplicating result-card metadata
- **AND** the user can increase or decrease quantity with plus and minus controls
- **AND** the quantity cannot be reduced below one
- **AND** the user can remove the card using an accessible trash control
- **AND** the result card exposes controls to change the selected edition/set and language

### Requirement: Card identity supports set and collector-number selection

The system SHALL accept set and collector-number constraints independently or together when resolving a card. List input SHALL support compact selectors such as `e:INR cn:13`, and the resulting row SHALL preserve those constraints for automatic resolution and visible editing.

#### Scenario: User imports a set and collector-number selector

- **WHEN** the user enters a card list item containing `e:INR cn:13`
- **THEN** the parser creates one card entry with set `INR` and collector number `13`, even when no card name is provided
- **AND** the workspace searches for that specific printing rather than only filtering by card name

#### Scenario: User imports only set and collector number

- **WHEN** the user enters `e:INR cn:13`
- **THEN** the workspace searches Scryfall using the set and collector-number constraints
- **AND** the input is accepted without reporting a missing card name error

#### Scenario: User changes the printing constraints

- **WHEN** the user changes the set or collector number of an existing row
- **THEN** the row's previous printing selection is cleared
- **AND** the system automatically resolves the updated card identity without requiring a separate search button

#### Scenario: User quickly adds a card with syntax

- **WHEN** the user enters a card name or selector expression such as `Lightning Bolt e:INR cn:13` in the quick-add control
- **AND** activates the add-card action
- **THEN** the system creates a new card in the editable list with the parsed name, set, and collector number
- **AND** the system starts resolving the new card automatically
- **AND** the quick-add control uses the same playful visual language as the surrounding workflow

### Requirement: Card rows resolve dynamically without a pending user state

The system SHALL automatically resolve cards after import and after changes to card identity fields. The normal interface SHALL NOT expose a “pending” status or require the user to click duplicate or search actions to continue editing.

#### Scenario: Imported cards resolve automatically

- **WHEN** a valid list is imported
- **THEN** each imported card starts automatic resolution
- **AND** the user can continue editing the list while resolution runs
- **AND** a successful resolution selects a printing and updates the preview

#### Scenario: Automatic resolution fails

- **WHEN** a card cannot be resolved
- **THEN** the card is not added to or retained in the editable card list
- **AND** the original list input identifies the rejected card with a visible error treatment, including red styling or an equivalent line-level error marker
- **AND** the user receives a clear error message using the shared terminology
- **AND** the error is shown in a floating notification that dismisses automatically after a short delay
- **AND** no generic “pending” label is shown

### Requirement: Printing is available when the list contains a valid card

The workspace SHALL expose the print action as the primary action for the printing step only when the workspace contains at least one valid card. The preview SHALL update from the currently resolved printings, and rejected cards SHALL be communicated through the list input rather than by retaining invalid rows.

#### Scenario: User prints an edited list

- **WHEN** the workspace contains at least one valid card
- **THEN** the printing step exposes the print action
- **AND** the preview reflects current quantities and selected printings
- **AND** invoking the action delegates to the browser print flow

#### Scenario: User has no valid cards

- **WHEN** the workspace contains no valid cards
- **THEN** the printing step shows an empty preview message
- **AND** the print action is disabled
- **AND** the application explains that the user must add at least one valid card before there is anything to print

### Requirement: User-facing terminology and punctuation are consistent

The interface SHALL use “carta” for an individual card, “lista” for a group of cards, “edición” for a printing, “idioma” for language, and “cantidad” for copies. Step labels, helper text, and errors SHALL use one consistent punctuation style and SHALL NOT describe an imported item as a “línea”.

#### Scenario: User reads labels and errors

- **WHEN** labels, instructions, statuses, or parse errors are displayed
- **THEN** they use the shared card-list terminology
- **AND** parse errors identify the affected carta or list item without presenting “Línea” as the domain term
- **AND** step labels do not mix trailing punctuation styles
