# Tasks

## 1. Extend card identity and automatic resolution

- [x] 1.1 Add an optional collector-number constraint to card list entries and row state, preserving existing quantity, set, language, and printing data; verify TypeScript type-check passes and existing row behavior remains covered.
- [x] 1.2 Extend the list parser for `e:<set>` and `cn:<number>` selectors, including normalization, mixed selectors, malformed selectors, and existing quantity syntax; verify parser tests cover valid and invalid inputs without regressing name-only and parenthesized-set entries.
- [x] 1.3 Extend Scryfall search inputs and result filtering to honor set and collector-number constraints, preserving request deduplication; verify client tests assert the generated query/filter behavior and exact printing selection.
- [x] 1.4 Trigger automatic card resolution after identity-field edits with debounce/deduplication, clear stale selections on changes, and remove normal reliance on explicit search/duplicate actions; verify composable tests cover import, name/set/collector-number changes, quantity-only changes, success, and error states.
- [x] 1.5 Remove not-found cards from the retained row collection while preserving rejected source entries for input feedback; verify mixed valid/not-found imports retain only valid rows and expose a red or equivalent line-level error.

## 2. Rework the card-row editing experience

- [x] 2.1 Replace the quantity input with accessible plus/minus controls that enforce a minimum of one and keep quantity changes local; verify component and workspace tests cover increment, decrement, minimum behavior, and no unnecessary search.
- [x] 2.2 Display the resolved card name beside the quantity controls without duplicating result-card metadata; verify component tests render the name without an editable input.
- [x] 2.3 Replace duplicate/search row actions with the accessible trash removal control and retain an explicit add-card action for creating new rows; verify component tests assert icon button accessible names and absence of normal duplicate/search controls.
- [x] 2.4 Update row status and result copy to use carta, edición, idioma, and cantidad terminology without exposing a pending state; verify component tests cover resolved and error messaging.
- [x] 2.5 Add a styled quick-add syntax control to the list card for card names and `e:<set> cn:<number>` expressions; verify it appends valid cards, starts automatic resolution, and reports invalid/not-found cards through the existing input errors.
- [x] 2.6 Keep printing/set and language selectors in the result card so the selected printing remains adjustable while the row name stays fixed; verify component tests cover both selectors.

## 3. Clarify workflow structure and language

- [x] 3.1 Restructure the main page headings and grouping into exactly three steps with playful, action-oriented titles—“Pon las cartas sobre la mesa”, “Escoge tu veneno”, and “Calienta rodillos”—with action subtitles and preview inside the printing step; verify app tests assert ordering, clear action subtitles, and absence of a fourth numbered step.
- [x] 3.2 Move or restyle readiness and preview controls so the print action is enabled only when at least one valid card exists, while rejected input errors remain visible; verify app and component tests cover empty, mixed valid/rejected, and fully rejected workspaces.
- [x] 3.3 Unify Spanish i18n labels, playful step titles, helper text, parser errors, punctuation, and accessibility labels, removing “línea” as the domain term; verify translation-focused component and parser tests assert the agreed vocabulary and that each title remains understandable.
- [x] 3.4 Update responsive styles and icon affordances without changing the existing proxy sheet dimensions or print CSS; verify the production build and component tests pass at desktop and narrow-layout breakpoints where covered.

## 4. Integrate and validate the workflow

- [x] 4.1 Run the full targeted test suite for parser, Scryfall client, workspace composable, app, and workspace components; verify all tests pass.
- [x] 4.2 Run type-check, lint, format check, and production build; verify each command completes successfully with no new warnings or errors.
