# Proposal

## Why

Closing or reloading the page currently loses the user's imported list and
carefully selected printings, quantities, and languages. Persisting the
workspace locally lets users recover that work without repeating card searches
or relying on a server account.

## What Changes

- Automatically save the current list and workspace state in the current
  browser so it survives closing and reopening the application.
- Restore saved rows, selected printings, quantities, language preferences,
  loaded printing data, list text, and relevant unresolved/error state without
  re-importing the list or searching Scryfall for restored cards.
- Reuse previously loaded language and printing data after restoration; only
  a new card or a language not previously loaded may initiate a Scryfall
  search.
- Version and validate saved workspace data, and report storage access,
  capacity, or invalid-data problems without silently discarding the active
  workspace.
- Provide an explicit action to clear the saved workspace and start fresh.
- Document that saved data belongs to this browser/device and is not synced
  between devices; card images continue to load from their existing URLs.
- Add tests for autosave, restoration, no-search hydration, validation,
  failure handling, and clearing saved data.

## Capabilities

### New Capabilities

- `workspace-persistence`: Local autosave and restoration of the card workspace
  without repeating searches for already-restored cards.

### Modified Capabilities

<!-- No published capabilities exist under openspec/specs. -->

## Impact

- `src/composables/useProxyWorkspace.ts` will initialize from and keep local
  workspace state synchronized with browser storage.
- A small storage service and validated, versioned persistence model will
  isolate browser storage access from the UI and workspace orchestration.
- `src/App.vue` and `src/i18n.ts` will expose storage status and an explicit
  clear-workspace action.
- Workspace, storage-service, and component tests plus the README will cover
  recovery behavior. No backend or runtime dependency is required.
