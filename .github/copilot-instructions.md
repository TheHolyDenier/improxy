# Copilot instructions for Improxy

## Project overview

Improxy is a Vue 3 + TypeScript single-page application that turns a pasted
Magic: The Gathering card list into printable 3x3 proxy sheets. The UI is
Spanish-first with English support and queries Scryfall directly from the browser for card
printings and images.

## Build, test, and lint

Use Node.js 22.18+ (or 24.12+) and npm.

```sh
npm install
npm run dev
npm run type-check
npm run lint
npm run test
npm run format:check
npm run build
npm run preview
```

Run one test file:

```sh
npm run test -- src/__tests__/card-list-parser.test.ts
```

Run one test by name:

```sh
npm run test -- src/__tests__/proxy-workspace.test.ts -t "changes quantity"
```

`npm run build` runs the type-check and production Vite build together.
The GitHub Pages workflow uses `npm ci`, Node 22, and
`VITE_BASE_PATH=/${repository-name}/` before building. Keep that base-path
behavior intact when changing Vite configuration or asset URLs.

## Architecture

- `src/App.vue` is the page coordinator. It wires UI components to
  `useProxyWorkspace` and should not become the home for domain or API logic.
- `src/domain/` contains framework-independent typed models and business
  rules:
  - `card-list-parser.ts` parses one card per line, quantities, parenthesized
    sets, and `e:`/`cn:` selectors.
  - `proxy-sheet.ts` expands selected quantities into copies and groups them
    into pages of nine.
  - `card.ts` defines row, printing, parse, and status types.
- `src/services/scryfall-client.ts` is the only Scryfall API adapter. It builds
  Scryfall search queries, deduplicates identical in-flight requests, validates
  response shapes, and maps unusable/error responses to recoverable errors.
- `src/services/ink-saving-image.ts` performs optional image processing for the
  printable preview. Ink saving must not mutate card rows or printing data.
- `src/composables/useProxyWorkspace.ts` owns the incremental workspace state:
  stable row identities, import and quick-add flows, per-row searches,
  language selection, readiness totals, and print actions. It serializes
  searches with a short delay to respect Scryfall request pacing.
- `src/components/` contains presentational Vue components using props and
  emits. `components/ui/` contains shared primitives. Keep API/search logic in
  the composable or service rather than in templates.
- `src/i18n.ts` is the translation source. Preserve the Spanish locale and
  use `vue-i18n` keys for user-visible text.
- `src/__tests__/` contains Vitest tests for domain logic, the Scryfall
  client, the workspace composable, and Vue components. The shared test setup
  installs the global i18n plugin.

The main data flow is: pasted text -> `CardListParser` -> resolved
`CardRowState` rows -> Scryfall printings selected per row ->
`ProxySheetComposer` pages -> `ProxyPrintPreview`. Editing quantity must only
change derived copy totals; editing search fields invalidates and searches only
that row. A global language change must preserve an explicit row language
override, and language selection should stay within the selected edition when
possible.

## Repository conventions

- Use Vue’s direct Composition API style with `<script setup lang="ts">`,
  `ref`, `computed`, `watch`, typed `defineProps`, and typed `defineEmits`.
  Do not introduce React-style state/rendering patterns nor naming conventions.
- Keep domain and service code independently testable. Prefer explicit
  interfaces, type guards for external data, and small pure functions over
  broad casts or `any`.
- Prefer single responsibility and small functions over large monolithic components. Avoid
  deeply nested loops or conditionals; break them into smaller functions.
- Prefer single use class, interfaces, enums and types over large multi-purpose ones. Avoid deeply nested types; break them into smaller types.
- Preserve stable row identity and localized updates. Do not rebuild the
  entire workspace or re-query unrelated rows when one row changes.
- Resolved card identity is read-only in the workspace; users change quantity,
  selected printing, language, or search selectors through the existing row
  actions. Failed searches are reported and removed from visible printable
  rows rather than represented as printable copies.
- Use the existing formatting rules: single quotes, no semicolons, trailing
  commas, and Prettier formatting. Use the `@/` alias for imports from
  `src/`.
- User-related strings belong in `src/i18n.ts`; do not add ad hoc translated
  text in component templates.
- Do not use magical strings nor numbers for anything. Use
  the existing enums and types or add new ones for any new domain concepts. Avoid
  hard-coded values in templates, styles, or tests.
- Every created or modified Vue component should have corresponding Vue Test
  Utils coverage. Add domain/service/composable tests for behavior changes,
  especially row isolation, request deduplication/ordering, language fallback,
  parsing edge cases, and page copy counts.
- The print layout is physical-size sensitive: cards are `63mm × 88mm`,
  pages contain nine slots, and print CSS targets A4 with browser scaling at
  100%. Do not replace these with pixel-only dimensions or PDF generation
  without an explicit design change.
- Keep the printable region separate from workspace controls. Ink-saving
  processing applies only to preview images and must retain the original image
  URL as a fallback.

## OpenSpec workflow

This repository uses a spec-driven OpenSpec workflow configured in
`openspec/config.yaml`. Existing change artifacts under
`openspec/changes/` are the source of feature requirements and design
decisions. For OpenSpec work:

- Use the repository’s `/opsx-explore`, `/opsx-propose`, `/opsx-apply`,
  `/opsx-update`, `/opsx-sync`, and `/opsx-archive` workflows when applicable.
- Exploration and proposal work is planning-only; do not edit application code
  until an apply workflow is explicitly started.
- During implementation, follow the selected change’s proposal, design,
  specs, and tasks together. Keep tests and directly related documentation in
  sync with behavior changes.
- Do not silently narrow or defer specified behavior when implementation
  conflicts with a spec; surface the scope decision first.

## MCP

For browser-level validation, a Playwright MCP server is useful for exercising
the running Vite app, importing representative card lists, checking row and
language interactions, and inspecting the print preview at 100% scale. Use it
for end-to-end/browser behavior that jsdom component tests cannot verify; keep
the existing Vitest suite as the primary automated unit and component
coverage.
