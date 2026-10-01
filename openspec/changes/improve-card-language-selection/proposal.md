# Proposal

## Why

The current language controls expose all supported languages, but changing the
global language only reuses the printings already loaded for each row. Users
can therefore see irrelevant edition options, miss a newly requested language,
or receive a fallback that is not clearly constrained to their selected
language and English. The language selector should keep every supported
language discoverable, while the printing results themselves should be
strictly filtered and fetched only when needed.

## What Changes

- Keep all supported languages visible in the global and per-card language
  selectors so users can request a language that has not been loaded yet.
- Filter each row's available printing and edition choices to the selected
  language plus English; when English is selected, expose only English
  printings.
- Mark language choices that are not loaded or not available without hiding
  them; selecting one may trigger a search for that row.
- Keep the selected edition stable where possible and choose the requested
  language within that edition, falling back to English only when necessary.
- Re-fetch only rows that do not already have the newly requested language
  available when the global language changes.
- Reuse already loaded printings and avoid duplicate searches for the same row,
  query, edition constraints, and language.
- Prevent printing selection from choosing an unrelated language or an edition
  without the requested language or English fallback.
- Preserve explicit per-card language overrides when the global language
  changes.
- Add focused domain, service, composable, and component tests for filtering,
  fallback, selective re-fetching, request reuse, and language navigation.
- Keep the implementation small and explicit so the language flow is easier to
  maintain.

## Capabilities

### New Capabilities

- `card-language-selection`: Language-scoped printing options, English
  fallback, per-card overrides, and selective re-fetch behavior.

### Modified Capabilities

<!-- No published capabilities exist under openspec/specs; the existing
     change-local search/workspace contracts are preserved and refined by the
     new capability. -->

## Impact

- `src/services/scryfall-client.ts` will expose language-scoped search results
  without weakening existing response validation or request deduplication.
- `src/composables/useProxyWorkspace.ts` will track enough loaded-language
  state to re-fetch only rows missing the newly selected language.
- `src/components/CardResultCard.vue` will present only valid
  language/English printing and edition choices, while the global and
  per-card language selectors keep all supported languages discoverable and
  preserve per-row overrides.
- Existing Scryfall, workspace, and component tests will be extended; no new
  runtime dependency or backend is required.
