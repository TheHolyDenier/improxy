# Design

## Context

See `proposal.md` for the motivation and user-visible scope. The current Vue app has one import card, a row editor with explicit duplicate/search buttons, a readiness card, and a separate preview card. Card rows currently store name, quantity, and set, while the parser and Scryfall client do not retain or query collector numbers. Spanish copy is centralized in `src/i18n.ts`, and existing tests cover parser, composable, and component behavior.

## Goals / Non-Goals

**Goals:**

- Make the page read as one three-step flow while keeping the existing proxy composition and browser print behavior.
- Keep the resolved card name and quantity/removal controls in the row; keep edition/set and language selectors in the result card so the selected printing can still be adjusted without changing the card name.
- Extend the row/list data path with collector number constraints and exact printing matching.
- Remove the visual “pending” concept from normal UI copy and provide clear errors when automatic resolution cannot complete.
- Keep rejected cards out of the editable row collection while preserving enough source-line error state to mark them in the list input.
- Gate the print action on at least one valid resolved card.
- Preserve the playful visual voice while making every section title self-explanatory.
- Provide a quick-add syntax control in the first card rather than copying the reference UI literally.
- Preserve the existing language selection, ink-saving preview option, responsive layout, and print-sheet format.

**Non-Goals:**

- Changing Scryfall as the external card data source.
- Redesigning the proxy sheet dimensions, image processing, or print CSS.
- Adding persistence, accounts, or a separate multi-page navigation system.
- Supporting arbitrary Scryfall query syntax beyond the specified set and collector-number selectors.

## Decisions

### Keep one row state and extend its identity constraints

Add collector number to the card-list entry and row state rather than introducing a second selection model. This lets parser input, row editing, automatic search, and preview continue to share one source of truth. A separate search-form state would make the desired “always dynamic” behavior harder to keep consistent.

The row editor must not expose inputs for the card name or duplicate the result-card metadata. The result card retains edition/set and language selectors; changing those selectors updates the selected printing without recreating the row.

### Parse compact selectors before searching

Extend the list parser to recognize `e:<set>` and `cn:<number>` tokens alongside the existing quantity/name/set syntax. Normalize set codes to uppercase and collector numbers to trimmed strings. A card name is optional when both selectors are present, allowing set-plus-number searches. The Scryfall client should receive both constraints and perform final exact matching against returned printings so the row can select the requested printing deterministically.

The first card also exposes a quick-add field. It reuses the same parser and row-creation path as multiline import, appends the accepted expression to the source list, and starts the same automatic search flow. This keeps quick add and pasted lists behaviorally consistent.

### Trigger searches from composable state changes

Keep the existing request deduplication in the workspace composable. Identity changes happen only before a row is created, through import or quick add; quantity-only changes remain local and do not cause network requests. Duplicate and explicit search actions are removed from the normal UI; row creation remains available through the add-card action.

When an import search returns no matching printing, the import pipeline should remove that entry from the row collection and add a source-line rejection to the input error state. This keeps invalid cards from blocking or appearing in the print preview while still explaining what happened to the user. Input errors are presented as a floating, dismissible notification that auto-hides after a short delay; the textarea remains marked invalid while the error state exists.

### Treat preview as the third step

Use step headings and layout grouping in `App.vue` rather than adding a new routing or wizard state. The adjustment area contains row editing and language controls; the printing area contains readiness messaging, print action, ink-saving controls, and the preview. This preserves direct scrolling and the current print media behavior while making the information hierarchy explicit.

Step titles should use a short, memorable phrase preceded by an explicit action subtitle. For example, “Pon las cartas sobre la mesa” can be paired with “Añade tus cartas”, “Escoge tu veneno” with “Elige idioma y edición”, and “Calienta rodillos” with “Pulsa imprimir”. This keeps the personality of the existing UI without duplicating the action title.

### Use existing icon dependency with accessible text

Use the already-installed `lucide-vue-next` icons for trash, plus, and minus controls. Each icon button must retain an accessible name from i18n, and quantity controls must expose the current quantity and disabled state to assistive technology. This avoids introducing a new icon package while preventing icon-only controls from becoming ambiguous.

### Centralize terminology in i18n

Update all affected Spanish strings in `src/i18n.ts` rather than embedding copy in components. Step labels, parser errors, row statuses, and readiness messages should share the same nouns and punctuation convention. Tests should assert the important user-visible labels so future copy changes do not reintroduce “línea”, “pendiente”, or a fourth numbered step.

### Gate printing on valid content

Use the count of retained valid rows as the print-action gate. An empty or fully rejected import leaves the preview empty and the print control disabled; one or more valid rows enables printing even if the input also contains rejected entries, which are shown in the input error treatment.

## Risks / Trade-offs

- **[Risk] Automatic searches can create more requests while users type.** → Debounce identity-field changes and retain request-key deduplication; do not search for incomplete empty values.
- **[Risk] Set and collector-number syntax can conflict with card names containing similar text.** → Tokenize only recognized `e:` and `cn:` forms, preserve the remaining text as the card name, and add parser coverage for malformed and mixed input.
- **[Risk] Removing explicit search buttons can hide recovery actions.** → Keep automatic retry on corrected identity fields and expose a clear row error with an accessible way to retry only if the final interaction design requires it.
- **[Risk] Removing rejected cards can make users think their input was silently changed.** → Preserve rejected source values and show line-level red/error feedback in the list input.
- **[Risk] A partially valid import can be confusing if the print action is gated incorrectly.** → Base the gate only on retained valid rows, and test both mixed valid/rejected input and fully rejected input.

## Migration Plan

1. Update the card entry/row model, parser, Scryfall search parameters, and composable behavior behind existing component boundaries.
2. Update the row editor, workflow headings, preview grouping, icons, and Spanish translations.
3. Extend parser, workspace, component, and app tests, then run type-check, unit tests, lint, and build.
4. If the UI change must be rolled back, revert the presentation and i18n changes together with the new collector-number state/query changes so the data contract remains coherent.
