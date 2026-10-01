# Spec Delta

## Purpose

Provides predictable language navigation for card printings by limiting choices
to the requested language and English fallback while fetching only missing
language data when the user changes language preferences.

## ADDED Requirements

### Requirement: Keep all supported languages discoverable

The system SHALL show every language from the application's supported-language
list in both the global language selector and each per-card language selector.
A language SHALL remain selectable even when it has not been loaded for the
current row; selecting it SHALL initiate the normal missing-language search
when necessary.

#### Scenario: Global selector includes unloaded languages

- **WHEN** the application has only loaded Spanish and English printings
- **THEN** the global selector still shows every supported language, including
  Japanese and German

#### Scenario: Per-card selector includes unloaded languages

- **WHEN** a card has no Japanese printing data loaded
- **THEN** its language selector still offers Japanese and identifies that the
  choice is not loaded or may require a search

#### Scenario: Selecting an unloaded language searches only that row

- **WHEN** the user selects Japanese for one card and Japanese data is not
  loaded for that card
- **THEN** the system searches for Japanese plus English for that row without
  changing the language preference or printings of other rows

### Requirement: Scope available printings to the requested language

The system SHALL expose only printing and edition choices in the requested
card language and English as a fallback. This filtering SHALL apply to results,
not to the language selectors. When the requested language is English, the
system SHALL expose only English printings.

#### Scenario: Non-English language includes English fallback

- **WHEN** the requested language is Spanish
- **THEN** the card's available printing choices contain Spanish and English
  printings only

#### Scenario: English language excludes other languages

- **WHEN** the requested language is English
- **THEN** the card's available printing choices contain English printings only

#### Scenario: Unrelated languages are hidden

- **WHEN** Scryfall data includes Japanese, German, Spanish, and English
  printings for an entry requested in Spanish
- **THEN** Japanese and German printings are not available for selection

#### Scenario: Language selector is not reduced to loaded results

- **WHEN** Scryfall data contains only English printings for an entry
- **THEN** the printing choices contain only English, while the language
  selector still offers every supported language

### Requirement: Choose a requested-language printing with English fallback

The system SHALL select a printing in the requested language when one exists
for the selected edition. If that edition has no requested-language printing,
the system SHALL select its English printing. An edition with neither language
available SHALL not be selectable for that language preference.

#### Scenario: Requested language is available in the selected edition

- **WHEN** the selected edition has both Spanish and English printings and the
  requested language is Spanish
- **THEN** the Spanish printing is selected

#### Scenario: Requested language is unavailable in the selected edition

- **WHEN** the selected edition has English but no Spanish printing and the
  requested language is Spanish
- **THEN** the English printing is selected and the interface identifies the
  English fallback

#### Scenario: Edition has no valid language fallback

- **WHEN** an edition has neither a printing in the requested language nor an
  English printing
- **THEN** that edition is excluded from the selectable edition choices

### Requirement: Re-fetch only missing global languages

The system SHALL re-fetch only rows without an explicit per-card language
override when the global language changes and the row has not loaded data for
the newly requested language. Rows that already have the requested language
available SHALL reuse their existing printings without a new request.

#### Scenario: Global language uses already-loaded data

- **WHEN** the global language changes from Spanish to English and a row already
  has English printings loaded
- **THEN** the row updates its selection using the loaded data without a
  Scryfall request

#### Scenario: Global language loads missing data

- **WHEN** the global language changes from Spanish to German and a row has no
  German printing data loaded
- **THEN** that row performs one search for German plus English and updates its
  choices when the search resolves

#### Scenario: Unrelated rows are not re-fetched

- **WHEN** only one row is missing the newly selected global language
- **THEN** rows with the language already loaded remain unchanged and do not
  issue new searches

### Requirement: Preserve explicit per-card language overrides

The system SHALL keep an explicit per-card language override independent from
the global language and SHALL apply the same requested-language-plus-English
filtering and fallback rules to that row.

#### Scenario: Global language does not overwrite an override

- **WHEN** a row explicitly uses English and the global language changes to
  Spanish
- **THEN** the row remains English and is not re-fetched for Spanish

#### Scenario: Per-card language change loads only missing data

- **WHEN** a row's explicit language changes to Japanese and Japanese data is
  not loaded for that row
- **THEN** only that row searches for Japanese plus English and then applies
  the Japanese or English fallback

### Requirement: Preserve loaded language data across navigation

The system SHALL retain previously loaded printings when another language is
searched so that switching back to a previously loaded language does not lose
available editions or require another request.

#### Scenario: Return to a previously loaded language

- **WHEN** a row has loaded Spanish data, then loads German data, and the user
  changes the language back to Spanish
- **THEN** the row reuses its Spanish printings without another Scryfall search

#### Scenario: Merge newly loaded language printings

- **WHEN** a language search returns printings for editions already present and
  new editions
- **THEN** the row keeps one entry per Scryfall printing identity and exposes
  all editions valid for the active language preference
