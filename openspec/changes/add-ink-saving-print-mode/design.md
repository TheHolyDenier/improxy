# Design

## Context

The existing print preview renders selected Scryfall images in a dedicated 3x3 region with physical card dimensions and print-only CSS. The workspace already has a localized Vue UI and a browser print action; this change should add a session-level print preference without changing card resolution or proxy composition.

## Goals / Non-Goals

**Goals:**

- Add a clear, localized ink-saving toggle close to the print preview and primary print action.
- Keep the normal interactive card previews unchanged.
- Apply a deterministic monochrome, contrast-oriented treatment only to printable proxy slots.
- Preserve existing dimensions, page grouping, selected printing, and language behavior.
- Test the toggle state, accessibility label, print-only class/attribute, and unchanged proxy composition.

**Non-Goals:**

- Do not generate a new image file or permanently transform Scryfall assets.
- Do not alter the selected card language or replace a localized printing.
- Do not estimate printer-specific ink usage.
- Do not persist the preference across browser sessions.

## Decisions

### Session state owned by the workspace

The print preference will live as a reactive boolean in the existing workspace orchestration and will be passed to the print preview. This keeps the setting scoped to the current session and avoids introducing global storage for a print-only option.

**Alternative considered:** storing the preference in `localStorage`. This is rejected because printer and paper workflows can differ between sessions, and persistence is not required by the behavior contract.

### CSS filter applied through a printable-region state

The preview will expose the active state through a class or data attribute on the printable region. Print-slot images will use a grayscale/high-contrast/brightness filter only when that state is active, while the interactive result cards remain unfiltered.

**Alternative considered:** mutating image URLs or drawing to a canvas. This is rejected because it duplicates remote image data, complicates loading/error behavior, and could change the physical rendering dimensions.

### Control placed with print preview controls

The toggle and its localized explanation will be placed in the print preview section near the existing 63 × 88 mm notice. The print button remains in the readiness summary, so the preference is visible before opening the browser print dialog without duplicating the print action.

### Explicit state and accessible semantics

The control will use a native checkbox or switch-like button with an accessible label and a visible active/inactive state. The printable region will expose the same state through a class/data attribute so component tests can verify the boundary without relying on visual pixel comparisons.

## Risks / Trade-offs

- [A filter can reduce fine detail] → Use conservative grayscale, contrast, and brightness values; validate card names, text, symbols, and borders in component/style tests plus a manual print sample.
- [Browser print engines can treat CSS filters differently] → Keep the filter in print-compatible CSS and retain the normal image as the source; document that a physical sample remains necessary.
- [Users may assume the workspace preview is also monochrome] → Keep the interactive preview unchanged and show an explicit localized notice that the optimization applies to printed sheets.

## Migration Plan

1. Add the session state, localized copy, control, and printable-region state marker.
2. Apply the print-only filter while preserving existing print dimensions and page breaks.
3. Add component and integration tests, then run the existing quality checks.
4. Manually print a representative sheet in black and white and adjust conservative filter values if text or symbols lose legibility.

Rollback consists of removing the toggle state and printable filter; no persisted data or API contract changes are involved.
