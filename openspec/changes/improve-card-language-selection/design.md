# Design

## Context

See `proposal.md` for the motivation and scope. The current Scryfall client
already queries a requested language plus English, but the workspace stores the
result as one undifferentiated printing list. `setGlobalLanguage` and
`setRowLanguage` only change the selected printing from that list, so a
language that was not part of the original search cannot be loaded later.
`CardResultCard` groups editions but currently permits an arbitrary remaining
printing as a final fallback.

## Goals / Non-Goals

**Goals:**

- Keep all supported languages discoverable in language selectors while making
  the active language the single source of truth for visible printing choices
  and selected-printing fallback.
- Track which languages have been searched for each row so global and per-card
  changes can distinguish reuse from missing data.
- Merge newly fetched printings without losing previous language results or
  duplicating Scryfall printing identities.
- Keep per-row overrides isolated and preserve unrelated row state.
- Keep filtering and selection rules testable without coupling them to Vue
  templates.

**Non-Goals:**

- No backend, persistence, or change to Scryfall's external API.
- No new language codes beyond the existing `cardLanguageCodes` list.
- No automatic translation of card names or UI copy.
- No change to the user's selected edition unless the current edition has no
  valid requested-language or English printing.

## Decisions

### Track loaded languages per row

Add explicit per-row loaded-language state, initialized with the language used
for the initial search. A language search marks the requested language as
loaded even when Scryfall returns no localized result, because the English
fallback response has still established that no additional localized data was
returned for that query. This lets later global changes avoid duplicate
requests.

The row's existing printing collection remains the accumulated source data.
New results are merged by Scryfall printing ID, with the latest representation
winning. The active language is applied only when deriving visible choices and
the selected printing.

### Centralize language filtering and edition selection

Use small typed helpers shared by the workspace and result-card boundary to:

1. filter accumulated printings to the active language and English;
2. group valid printings by set code and collector number;
3. prefer the active language within an edition, then English;
4. exclude editions with neither valid language.

These helpers filter only printing and edition choices. The language selectors
continue to use the complete supported-language list, with a lightweight
loaded/available indication so users can request a language that requires a
search. The UI should receive already-valid printing choices or use the same
helper rather than implementing a second fallback policy in a template event
handler. The selected edition key remains stable when possible, so changing
language does not unexpectedly jump to another set.

### Selective language re-fetching

When the global language changes, iterate only rows without an explicit
override. For each row, apply accumulated data immediately if the requested
language is loaded; otherwise start the existing row-scoped search flow. A
per-card language change follows the same check for its single row. The
selector remains usable before the search completes and exposes loading or
fallback state rather than hiding the requested language.

Search requests continue to use the existing Scryfall client contract, whose
query returns the requested language and English. Request keys must include
the normalized language and row search constraints, and the existing version
guard must prevent stale responses from replacing newer row state.

### Keep fallback visibility explicit

When English is selected because the requested language is unavailable, retain
the existing fallback notice. The notice is derived from the selected printing
language and active requested language, so it cannot claim a fallback when an
actual requested-language printing is selected.

## Risks / Trade-offs

- [Accumulated printings increase row memory usage] → Deduplicate by Scryfall
  ID and retain only the small printing metadata already used by the preview.
- [A language search may return an English-only fallback] → Mark the requested
  language as loaded only after the request completes and keep the fallback
  notice visible; a failed request remains retryable.
- [Global language changes can trigger several searches] → Reuse loaded
  languages, keep the existing serialized request queue, and issue requests
  only for rows missing the requested language.
- [Filtering rules duplicated between state and UI could drift] → Keep the
  filter/selection helper as the shared policy and cover it with focused tests.
- [Users may mistake an unloaded language for an unavailable language] → Keep
  every supported language visible and distinguish unloaded, loading, and
  English-fallback states in the controls.

## Migration Plan

1. Extend the row model and language-selection helpers without changing the
   initial user flow.
2. Update workspace search and language actions to merge results and re-fetch
   only missing languages.
3. Update printing controls to render only valid active-language/English
   options.
4. Add unit, composable, and component tests for filtering, fallback, caching,
   and overrides.
5. Run type-check, lint, tests, formatting, and build; manually verify
   language navigation against representative Scryfall-like responses.
