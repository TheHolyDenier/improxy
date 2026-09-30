# Tasks

## 1. Project foundation and quality tooling

- [x] 1.1 Replace the starter Vue screen with the initial application shell and verify the project still passes `npm run type-check` and `npm run build`.
- [x] 1.2 Add shadcn-vue-style accessible primitives and establish the shared visual tokens for the energetic, feminine, defiant theme; verify the shell renders the selected primitives without console errors.
- [x] 1.3 Add Vitest, Vue Test Utils, ESLint, and Prettier configuration with single quotes; verify `npm run test`, `npm run lint`, and `npm run format:check` are available and pass on the initial code.

## 2. Card list import and incremental domain model

- [x] 2.1 Define typed domain models with stable row identities for list entries, parse errors, printings, language preferences, and resolved proxy copies; verify type-checking rejects incomplete domain values without unnecessary casts.
- [x] 2.2 Implement parsing for name-only lines, optional quantities, optional sets, blank lines, and mixed valid/invalid input; default every parsed name to quantity `1` and verify unit tests cover the `card-list-import` scenarios.
- [x] 2.3 Implement row-level add, remove, duplicate, and edit actions for name, quantity, and set; verify unit tests prove that unrelated row identities and state remain unchanged.
- [x] 2.4 Build the list import and editing components with accessible labels, compact row controls, and error states; add a test for each created or modified component and verify the list can be adjusted without re-entering the whole text.
- [x] 2.5 Document the accepted name-first list syntax and row editing behavior in the user-facing README or application help; verify the examples match the parser tests.

## 3. Scryfall search and printing selection

- [x] 3.1 Implement the typed Scryfall client with `async`/`await`, response validation, HTTP/network error mapping, and request deduplication; verify unit tests cover success, no result, rate limit, malformed response, and retry behavior.
- [x] 3.2 Implement search orchestration keyed by stable row identity; verify changing quantity does not issue a new request and adding or editing one row does not clear successful results for other rows.
- [x] 3.3 Build the card result and printing selector components with visual printing previews, set/collector metadata, and explicit loading/error/empty states; add a test for each component and verify manual printing selection updates the corresponding row only.
- [x] 3.4 Build global and per-entry language controls with explicit override semantics; add component tests and verify a global change does not overwrite an explicit per-entry language.

## 4. Proxy workspace and review flow

- [x] 4.1 Implement the workspace state orchestration for import, resolution, review, and print readiness using localized row actions; verify tests cover empty, loading, resolved, unresolved, recoverable-error, add, remove, and edit states.
- [x] 4.2 Compose the workspace layout from shadcn-vue-based components with responsive styling, direct row controls, and visible primary actions; add a test for each component created or modified and verify required actions remain accessible at narrow viewport widths.
- [x] 4.3 Implement the readiness summary for unresolved entries, total copies, selected printings, and languages; verify the print action is disabled until every requested copy has a printable image and updates after one row changes.

## 5. Physical 3x3 printing

- [x] 5.1 Implement proxy copy expansion with default quantity `1` and a 3x3 page compositor with 63 mm by 88 mm card dimensions and no dropped or duplicated copies; verify unit tests cover one page, multiple pages, quantity changes, row addition, and row removal.
- [x] 5.2 Build the print preview components and print-only CSS with A4-first page settings, page breaks, hidden workspace controls, and a 100 percent scaling warning; add a test for each component and verify the DOM contains nine slots per full page.
- [x] 5.3 Connect the print action to the browser print dialog and verify an end-to-end component test includes only resolved proxy sheets in the printable region.

## 6. Integration and delivery checks

- [x] 6.1 Update project documentation with setup, Scryfall usage, name-first list format, row editing, browser-print instructions, and known physical-print limitations; verify every documented command exists in `package.json`.
- [x] 6.2 Run the complete quality gate `npm run type-check`, `npm run lint`, `npm run test`, `npm run format:check`, and `npm run build`; fix failures without adding broad casts or React-style abstractions.
- [ ] 6.3 Manually validate a representative list with name-only entries, optional quantities and sets, global and per-card languages, multiple printings, adding/removing rows, quantity changes, more than nine copies, and an unresolved card; verify a sample print at 100 percent scale preserves the 63 mm by 88 mm card dimensions.
