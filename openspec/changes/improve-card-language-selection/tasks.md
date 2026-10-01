# Tasks

## 1. Language policy and row state

- [x] 1.1 Add typed per-row tracking for searched languages and centralize
  language/English filtering, edition grouping, and requested-language
  selection with fallback; verify unit tests cover English-only filtering,
  non-English filtering, edition exclusion, and stable edition preference.
- [x] 1.2 Update row resolution and selection helpers to merge printings by
  Scryfall ID while retaining previously loaded language data; verify tests
  cover merging duplicate/new printings and switching back to a loaded
  language without another search.

## 2. Selective language searches

- [x] 2.1 Update the Scryfall search boundary and request keys so each
  language search returns only the requested language plus English and can be
  reused safely; verify client tests cover English-only queries, non-English
  queries, normalized keys, and request deduplication.
- [x] 2.2 Update global and per-card language actions to search only rows
  missing the requested language, preserve explicit overrides, and ignore
  stale responses; verify composable tests cover reuse, selective re-fetching,
  override isolation, fallback, and failed requests.

## 3. Language-aware controls

- [x] 3.1 Keep all supported languages visible in global and per-card
  selectors, indicate unloaded/loading availability, and trigger a row-scoped
  search when an unloaded language is selected; verify Vue Test Utils coverage
  preserves discoverability and emits the correct language changes.
- [x] 3.2 Update printing and edition controls to expose only choices with a
  requested-language or English printing and to select the requested language
  before English; verify component tests hide unrelated languages while the
  language selector retains all supported options.
- [x] 3.3 Preserve accessible fallback and loading/error states while language
  searches are pending; verify component tests cover fallback messaging,
  loading state, empty valid-language choices, and conflicting interactions.

## 4. Integration and documentation

- [x] 4.1 Document the language-selection behavior, English fallback, global
  versus per-card overrides, and selective re-fetch behavior in the relevant
  project documentation; verify examples match the language policy tests.
- [x] 4.2 Run `npm run type-check`, `npm run lint`, `npm run test`,
  `npm run format:check`, and `npm run build`; verify the complete quality
  gate passes and the representative language-navigation flow remains
  functional.
