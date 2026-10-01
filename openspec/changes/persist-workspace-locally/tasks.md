# Tasks

## 1. Storage model and validation

- [x] 1.1 Define a versioned workspace persistence model and an isolated
  browser-storage service; verify service tests cover valid round trips,
  malformed payloads, unsupported versions, and storage access/write errors.

## 2. Workspace hydration and autosave

- [x] 2.1 Hydrate workspace refs directly from valid saved data before enabling
  autosave, normalize interrupted loading rows, and never run list import or
  card search during restore; verify composable tests restore selected rows,
  language caches, errors, and print pages with zero Scryfall search calls.
- [x] 2.2 Automatically save list and workspace changes after hydration, and
  block overwriting data that failed validation until the user clears it;
  verify tests cover list edits, row add/remove, quantity/printing/language
  changes, and failed storage writes without losing in-memory work.

## 3. Recovery controls and documentation

- [x] 3.1 Expose storage and restore errors accessibly and add an explicit
  clear-workspace action that resets both memory and browser data; verify
  component tests cover error status and clearing valid or incompatible data.
- [x] 3.2 Document automatic local persistence, same-browser/origin scope,
  restore-without-search behavior, and the fact that images still load from
  their URLs; verify the README matches the persistence behavior and reset
  control.

## 4. Integration verification

- [x] 4.1 Run `npm run type-check`, `npm run lint`, `npm run test`,
  `npm run format:check`, and `npm run build`; verify the complete quality
  gate passes and a reopen/restore flow preserves selected cards without
  issuing Scryfall card searches.
