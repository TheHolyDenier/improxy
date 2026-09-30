# Proposal

## Why

The first product feedback is that the current interface is confusing: the card-row controls, workflow steps, status language, and preview are presented as separate concepts even though users need one continuous editing flow. The app should make the intended action obvious at every point: add a list, adjust cards, and print, with no “pending” state between editing and printing when a card can be resolved automatically.

## What Changes

- Rework the page into three user-facing steps with playful but meaningful titles: **Pon las cartas sobre la mesa** (añadir cartas), **Ajusta el mazo a tu gusto** (elegir idioma y edición), and **Calienta rodillos** (imprimir).
- Make the card row the primary adjustment surface: the resolved card name remains fixed, quantity and removal are adjusted in the row, while the selected edition/set and language remain adjustable in the result card.
- Add set plus collector-number selection during card addition, including input syntax such as `e:INR cn:13`.
- Add a quick-add control inside the first card: a playful syntax input that accepts a card name or selectors such as `e:INR cn:13`, then creates the card in the editable list and resolves it automatically.
- Replace manual duplicate/search actions with a more dynamic flow that searches when card identity fields change and keeps printing available whenever all cards resolve.
- Do not keep cards that cannot be found in the editable list; report them back in the list input with a visible error treatment, such as a red line/error marker.
- Enable the print action only when the list contains at least one valid card.
- Keep card removal, using a trash icon with an accessible label instead of a prominent “Quitar” text action.
- Replace direct quantity editing with compact plus and minus controls while preserving a minimum quantity of one.
- Present the preview as the printing step rather than as a fourth numbered step.
- Unify Spanish terminology around **carta**, **lista**, **edición**, **idioma**, and **cantidad**; replace confusing uses of “línea” and remove inconsistent punctuation in step labels and helper text.
- Keep the app’s fun voice in section titles, while pairing each title with a clear action or subtitle so the next step is immediately understandable.
- Update responsive layout and component tests to cover the revised controls, workflow labels, parsing, and readiness behavior.

## Capabilities

### New Capabilities

- `card-list-workflow`: Defines the three-step card-list editing and printing experience, including dynamic row controls, set/collector-number selection, terminology, and print readiness.

### Modified Capabilities

None. The repository does not currently contain a main capability spec; this change establishes the first behavioral contract for the workflow.

## Impact

- Vue presentation components in `src/App.vue` and `src/components/`, especially `CardListInput.vue`, `CardRowEditor.vue`, `ReadinessSummary.vue`, and `ProxyPrintPreview.vue`.
- Card-list parsing, row state, Scryfall search parameters, and print-readiness logic in `src/domain/`, `src/composables/useProxyWorkspace.ts`, and `src/services/`.
- Spanish i18n messages in `src/i18n.ts`.
- Component, parser, workspace, and app tests under `src/__tests__/`.
- No new runtime dependency is expected; the existing `lucide-vue-next` dependency can provide the trash and quantity-control icons.
