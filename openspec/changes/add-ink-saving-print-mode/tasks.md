# Tasks

## 1. Session preference and localized control

- [x] 1.1 Add reactive ink-saving state to the proxy workspace and pass it to the print preview; verify the default is disabled and toggling it preserves rows, selections, languages, quantities, and pages.
- [x] 1.2 Add a localized accessible toggle and active-mode notice beside the print preview controls; add component tests for label, checked state, and emitted updates.
- [x] 1.3 Keep floating navigation and other workspace controls out of the proxy preview and printed output; verify the back-to-top control hides when the preview is visible and under `@media print`.

## 2. Printable treatment

- [x] 2.1 Add a print-region state marker and apply a grayscale, contrast, and brightness treatment only to printable proxy images; verify the interactive result cards remain unfiltered.
- [x] 2.2 Preserve the existing 3x3 grid, 63 mm × 88 mm slots, page breaks, and selected copies in both modes; extend print preview tests to assert both modes contain the same slots and copies.

## 3. Documentation and integration quality

- [x] 3.1 Document the black-and-white ink-saving mode and its manual print validation limitation in the README or application help; verify the documented behavior matches the UI labels.
- [x] 3.2 Run the complete quality gate with `npm run type-check`, `npm run lint`, `npm run test`, `npm run format:check`, and `npm run build`; verify the new mode does not change normal printing behavior.
