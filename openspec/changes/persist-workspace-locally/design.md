# Design

## Context

See `proposal.md` for the motivation. `useProxyWorkspace` currently owns the
list text, rows, parse errors, language preferences, ink-saving preference,
and derived print pages. A row already contains the Scryfall printing
metadata, selected printing identity, and loaded-language history needed to
restore its choices without searching. The Vite app is browser-only and has no
account or server persistence layer.

## Goals / Non-Goals

**Goals:**

- Restore all user-visible workspace state while keeping persistence isolated
  from Scryfall and print composition.
- Prevent saved rows from flowing through `importList` or `resolveEntry` during
  startup.
- Make malformed data, incompatible versions, and storage failures visible
  while keeping the in-memory workspace usable.
- Avoid persisting image binaries or unrelated UI state.

**Non-Goals:**

- No account-based, cross-device, or cloud synchronization.
- No offline caching of Scryfall image files.
- No automatic resolution of unimported list text during restore.
- No migration between incompatible persisted versions in the first iteration.

## Decisions

### Use versioned localStorage with an isolated service

Create a small workspace-storage service around a single namespaced
`localStorage` key and a versioned serialized payload. `localStorage` is
appropriate because the saved data is card metadata and user selections, not
image binaries; synchronous writes also avoid out-of-order asynchronous saves
when a tab closes. Keep browser access behind an injectable storage interface
so validation and failure cases can be tested without the browser.

Validate the envelope version and each persisted field before hydration.
Unsupported or malformed data is reported and retained rather than being
silently cleared or overwritten. A storage write error updates a visible
storage status, but does not roll back or disable current in-memory edits.

**Alternative considered:** IndexedDB. It offers more capacity, but adds
asynchronous hydration and write ordering for a compact workspace; it can be
considered later if real storage-size measurements justify it.

### Hydrate before enabling autosave

On workspace creation, synchronously read and validate the saved envelope,
then populate the existing refs directly. Only after hydration is complete
should a deep watcher serialize subsequent workspace edits. This prevents an
initial empty state from overwriting saved data before it has been read.

Hydration never calls `importList`, `resolveEntry`, or the search client.
Restore the stored rows and `loadedLanguages` as the source of truth. Normalize
transient `loading` row statuses to a stable state derived from the saved
selection and printing data; do not automatically restart an interrupted
search.

### Persist the minimal state required to reconstruct the workspace

Persist raw list text, rows and their printing metadata, loaded-language
history, selected printing IDs, language overrides, global language,
ink-saving preference, parse errors, and the failed-entry count. Do not persist
derived totals/pages, in-flight promises/timers, or image contents; the
existing composer derives pages from restored rows and the preview loads image
URLs as before.

### Make clear and failure states explicit

Expose a workspace clear action that resets in-memory state and removes the
saved key. Surface read/write errors through a user-visible status message.
When data cannot be restored, do not start autosave against the unusable
payload; the user can explicitly clear it before starting a fresh workspace.

## Risks / Trade-offs

- [Browser storage can be cleared by the user or browser policy] → Explain
  that persistence is local to the current origin and browser profile.
- [A large printing result may exceed localStorage quota] → Keep the payload
  limited to metadata, report write failures, and consider IndexedDB only if
  normal workspace sizes demonstrate a quota problem.
- [Persisted data can become stale after model changes] → Version the envelope,
  validate every read, and preserve incompatible data until explicit clearing.
- [Autosave may serialize often] → Store only workspace data, not derived
  pages or image bytes; keep the implementation measurable and simple.

## Migration Plan

1. Add and test the versioned storage service and payload validation.
2. Hydrate workspace refs from saved state without any card-search calls.
3. Autosave state changes after hydration and expose storage status.
4. Add the clear-workspace action, component coverage, and README explanation.
5. Run type-check, lint, tests, formatting, and build; verify a reload restores
   selected cards without repeating Scryfall searches.
