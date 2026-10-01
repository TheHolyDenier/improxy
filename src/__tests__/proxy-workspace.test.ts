import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProxyWorkspace } from '@/composables/useProxyWorkspace'
import {
  createWorkspaceStorage,
  WORKSPACE_STORAGE_KEY,
  type WorkspaceStorageLike,
} from '@/services/workspace-storage'

const printing = {
  id: 'printing-1',
  name: 'Lightning Bolt',
  setCode: 'lea',
  setName: 'Limited Edition Alpha',
  collectorNumber: '161',
  language: 'en',
  imageUri: 'https://example.com/card.jpg',
}

let cryptoId = 0

function createMemoryStorage(): WorkspaceStorageLike & {
  values: Map<string, string>
} {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('useProxyWorkspace', () => {
  beforeEach(() => {
    cryptoId = 0
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `row-${cryptoId++}`) })
    window.localStorage.clear()
  })

  it('adds only resolved rows and removes them by identity', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()
    const firstRow = workspace.rows.value[0]

    expect(workspace.rows.value).toHaveLength(1)
    expect(workspace.rows.value[0]?.id).toBe(firstRow?.id)

    workspace.removeRow(firstRow?.id ?? '')

    expect(workspace.rows.value).toHaveLength(0)
  })

  it('changes quantity without issuing a new search', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const row = workspace.rows.value[0]

    workspace.updateRow(row?.id ?? '', { quantity: 3 })

    expect(client.searchPrintings).toHaveBeenCalledTimes(1)
    expect(workspace.totalCopies.value).toBe(3)
  })

  it('blocks a second import while the first one is loading', async () => {
    let resolveSearch: ((value: (typeof printing)[]) => void) | undefined
    const pendingSearch = new Promise<(typeof printing)[]>((resolve) => {
      resolveSearch = resolve
    })
    const client = {
      searchPrintings: vi.fn().mockReturnValue(pendingSearch),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    const firstImport = workspace.importList()
    expect(workspace.isLoading.value).toBe(true)

    workspace.rawList.value = 'Counterspell'
    await workspace.importList()

    expect(client.searchPrintings).toHaveBeenCalledTimes(1)
    expect(workspace.isLoading.value).toBe(true)

    resolveSearch?.([printing])
    await firstImport

    expect(workspace.isLoading.value).toBe(false)
    expect(workspace.rows.value).toHaveLength(1)
  })

  it('queues long-list searches one at a time', async () => {
    let activeRequests = 0
    let maxActiveRequests = 0
    const client = {
      searchPrintings: vi.fn(async (name: string) => {
        activeRequests += 1
        maxActiveRequests = Math.max(maxActiveRequests, activeRequests)
        await new Promise((resolve) => setTimeout(resolve, 5))
        activeRequests -= 1
        return [{ ...printing, name }]
      }),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt\nCounterspell\nDark Ritual'
    await workspace.importList()

    expect(client.searchPrintings).toHaveBeenCalledTimes(3)
    expect(maxActiveRequests).toBe(1)
  })

  it('publishes each resolved row before the full list finishes', async () => {
    let resolveSecond: ((value: (typeof printing)[]) => void) | undefined
    const secondSearch = new Promise<(typeof printing)[]>((resolve) => {
      resolveSecond = resolve
    })
    const client = {
      searchPrintings: vi
        .fn()
        .mockResolvedValueOnce([printing])
        .mockReturnValueOnce(secondSearch),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    const importPromise = workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 10))

    expect(workspace.rows.value).toHaveLength(1)
    resolveSecond?.([{ ...printing, name: 'Counterspell' }])
    await importPromise

    expect(workspace.rows.value).toHaveLength(2)
  })

  it('rejects multiline quick-add input without changing the list', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    const added = await workspace.addCardFromSyntax(
      'Lightning Bolt\nCounterspell',
    )

    expect(added).toBe(false)
    expect(client.searchPrintings).not.toHaveBeenCalled()
    expect(workspace.rawList.value).toBe('')
  })

  it('keeps quick-add input data available when resolution fails', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([]),
    }
    const workspace = useProxyWorkspace(client)

    const added = await workspace.addCardFromSyntax('Unknown Card')

    expect(added).toBe(false)
    expect(workspace.rawList.value).toBe('')
    expect(workspace.isLoading.value).toBe(false)
    expect(workspace.unresolvedCount.value).toBe(1)
  })

  it('searches automatically when the collector number changes', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()
    const row = workspace.rows.value[0]
    client.searchPrintings.mockClear()

    workspace.updateRow(row?.id ?? '', { collectorNumber: '161' })
    await new Promise((resolve) => setTimeout(resolve, 500))

    expect(client.searchPrintings).toHaveBeenCalledWith(
      'Lightning Bolt',
      '',
      'es',
      '161',
    )
  })

  it('removes cards not found during import and reports their source line', async () => {
    const client = {
      searchPrintings: vi
        .fn()
        .mockImplementation((name: string) =>
          Promise.resolve(name === 'Lightning Bolt' ? [printing] : []),
        ),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt\nUnknown Card'
    await workspace.importList()

    expect(workspace.rows.value).toHaveLength(1)
    expect(workspace.rows.value[0]?.name).toBe('Lightning Bolt')
    expect(workspace.parseErrors.value.join(' ')).toContain(
      'No hemos encontrado ninguna carta llamada «Unknown Card».',
    )
    expect(workspace.parseErrors.value.join(' ')).not.toContain('Carta 2:')
  })

  it('removes cards when the search fails and reports the failure', async () => {
    const client = {
      searchPrintings: vi
        .fn()
        .mockRejectedValue(new Error('No se pudo conectar con Scryfall.')),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()

    expect(workspace.rows.value).toHaveLength(0)
    expect(workspace.totalCopies.value).toBe(0)
    expect(workspace.parseErrors.value.join(' ')).toContain(
      'No hemos podido buscar la carta «Lightning Bolt».',
    )
  })

  it('resolves a card using only set and collector number', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'e:LEA cn:161'
    await workspace.importList()

    expect(workspace.parseErrors.value).toEqual([])
    expect(workspace.rows.value[0]).toMatchObject({
      name: 'Lightning Bolt',
      queryName: '',
      setCode: 'LEA',
      collectorNumber: '161',
      status: 'resolved',
      selectedPrintingId: printing.id,
    })
  })

  it('keeps the official name for a quick-add query with set selectors', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([
        {
          ...printing,
          name: "Cathars' Crusade",
          setCode: 'inr',
          setName: 'Innistrad Remastered',
          collectorNumber: '13',
        },
      ]),
    }
    const workspace = useProxyWorkspace(client)

    await workspace.addCardFromSyntax('Lightning Bolt e:INR cn:13')

    expect(workspace.rows.value).toHaveLength(1)
    expect(workspace.rows.value[0]).toMatchObject({
      queryName: 'Lightning Bolt',
      name: "Cathars' Crusade",
      status: 'resolved',
      selectedPrintingId: 'printing-1',
    })
  })

  it('falls back to English when the requested language is unavailable', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()

    expect(workspace.globalLanguage.value).toBe('es')
    expect(workspace.rows.value[0]?.selectedPrintingId).toBe('printing-1')
    expect(workspace.readyToPrint.value).toBe(true)
  })

  it('uses the canonical English card name for the visible title', async () => {
    const spanishPrinting = {
      ...printing,
      id: 'printing-es',
      language: 'es',
      name: 'Contrahechizo',
    }
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([spanishPrinting, printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'counterspell'
    await workspace.importList()

    expect(workspace.rows.value[0]?.name).toBe('Lightning Bolt')
    expect(workspace.rows.value[0]?.selectedPrintingId).toBe('printing-es')
  })

  it('updates one row without resetting another row', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    await workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const first = workspace.rows.value[0]
    const second = workspace.rows.value[1]
    const selectedPrintingId = second?.selectedPrintingId

    workspace.updateRow(first?.id ?? '', { queryName: 'Dark Ritual' })

    expect(first?.selectedPrintingId).toBe('')
    expect(second?.selectedPrintingId).toBe(selectedPrintingId)
    expect(second?.status).toBe('resolved')
  })

  it('searches a renamed row without adding another row', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const row = workspace.rows.value[0]
    if (!row) {
      throw new Error('Expected an imported row')
    }

    workspace.updateRow(row.id, { queryName: 'Counterspell' })
    await workspace.searchRow(row)

    expect(workspace.rows.value).toHaveLength(1)
    expect(workspace.rows.value[0]?.name).toBe(printing.name)
    expect(workspace.rows.value[0]?.queryName).toBe('Counterspell')
  })

  it('does not expose a row until its search has resolved', async () => {
    let resolveSearch: ((value: (typeof printing)[]) => void) | undefined
    const pendingSearch = new Promise<(typeof printing)[]>((resolve) => {
      resolveSearch = resolve
    })
    const client = {
      searchPrintings: vi.fn().mockReturnValue(pendingSearch),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    const importPromise = workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    if (!resolveSearch) {
      throw new Error('Expected an in-flight card search')
    }

    expect(workspace.rows.value).toHaveLength(0)
    resolveSearch([printing])
    await importPromise
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(workspace.rows.value[0]?.name).toBe(printing.name)
    expect(workspace.rows.value[0]?.status).toBe('resolved')
  })

  it('applies a global language without replacing an explicit override', async () => {
    const spanishPrinting = { ...printing, id: 'printing-es', language: 'es' }
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing, spanishPrinting]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    await workspace.importList()
    const first = workspace.rows.value[0]
    const second = workspace.rows.value[1]

    await workspace.setRowLanguage(second?.id ?? '', 'en')
    await workspace.setGlobalLanguage('es')

    expect(first?.selectedPrintingId).toBe('printing-es')
    expect(second?.selectedPrintingId).toBe('printing-1')
    expect(client.searchPrintings).toHaveBeenCalledTimes(2)
  })

  it('does not re-fetch an explicitly overridden row on global language changes', async () => {
    const germanPrinting = { ...printing, id: 'printing-de', language: 'de' }
    const spanishPrinting = { ...printing, id: 'printing-es', language: 'es' }
    const client = {
      searchPrintings: vi.fn(
        async (_name: string, _set: string, language: string) =>
          language === 'de'
            ? [germanPrinting, printing]
            : [spanishPrinting, printing],
      ),
    }
    const workspace = useProxyWorkspace(client)
    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    await workspace.importList()
    const [first, second] = workspace.rows.value
    if (!first || !second) {
      throw new Error('Expected two imported rows')
    }
    await workspace.setRowLanguage(second.id, 'en')

    await workspace.setGlobalLanguage('de')

    expect(client.searchPrintings).toHaveBeenCalledTimes(3)
    expect(client.searchPrintings.mock.calls[2]?.[0]).toBe(first.queryName)
    expect(first.selectedPrintingId).toBe(germanPrinting.id)
    expect(second.selectedPrintingId).toBe(printing.id)
    expect(second.languageOverride).toBe('en')
  })

  it('searches only rows missing the global language and reuses loaded languages', async () => {
    const spanishPrinting = {
      ...printing,
      id: 'printing-es',
      language: 'es',
    }
    const germanPrinting = {
      ...printing,
      id: 'printing-de',
      language: 'de',
    }
    const client = {
      searchPrintings: vi.fn(
        async (_name: string, _set: string, language: string) =>
          language === 'de'
            ? [germanPrinting, printing]
            : [spanishPrinting, printing],
      ),
    }
    const workspace = useProxyWorkspace(client)
    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    await workspace.importList()
    const [first, second] = workspace.rows.value
    if (!first || !second) {
      throw new Error('Expected two imported rows')
    }

    first.printings.push(germanPrinting)
    first.loadedLanguages.push('de')

    await workspace.setGlobalLanguage('de')

    expect(client.searchPrintings).toHaveBeenCalledTimes(3)
    expect(first.selectedPrintingId).toBe(germanPrinting.id)
    expect(second.selectedPrintingId).toBe(germanPrinting.id)
    expect(second.loadedLanguages).toContain('de')

    await workspace.setGlobalLanguage('es')

    expect(client.searchPrintings).toHaveBeenCalledTimes(3)
    expect(first.selectedPrintingId).toBe(spanishPrinting.id)
    expect(second.selectedPrintingId).toBe(spanishPrinting.id)
  })

  it('loads a per-card language without changing other rows or the global language', async () => {
    const japanesePrinting = {
      ...printing,
      id: 'printing-ja',
      language: 'ja',
    }
    const client = {
      searchPrintings: vi.fn(
        async (_name: string, _set: string, language: string) =>
          language === 'ja' ? [japanesePrinting, printing] : [printing],
      ),
    }
    const workspace = useProxyWorkspace(client)
    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    await workspace.importList()
    const [first, second] = workspace.rows.value
    if (!first || !second) {
      throw new Error('Expected two imported rows')
    }
    const firstSelectedPrintingId = first.selectedPrintingId

    await workspace.setRowLanguage(second.id, 'ja')

    expect(workspace.globalLanguage.value).toBe('es')
    expect(first.selectedPrintingId).toBe(firstSelectedPrintingId)
    expect(second.selectedPrintingId).toBe(japanesePrinting.id)
    expect(second.languageOverride).toBe('ja')
    expect(client.searchPrintings).toHaveBeenCalledTimes(3)
  })

  it('preserves existing printings and allows retry when a language search fails', async () => {
    const client = {
      searchPrintings: vi.fn(
        async (_name: string, _set: string, language: string) => {
          if (language === 'de') {
            throw new Error('Network unavailable')
          }
          return [printing]
        },
      ),
    }
    const workspace = useProxyWorkspace(client)
    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()
    const row = workspace.rows.value[0]
    if (!row) {
      throw new Error('Expected an imported row')
    }
    const selectedPrintingId = row.selectedPrintingId

    await workspace.setGlobalLanguage('de')

    expect(workspace.rows.value).toHaveLength(1)
    expect(row.selectedPrintingId).toBe(selectedPrintingId)
    expect(row.status).toBe('resolved')
    expect(row.errorMessage).toContain('No hemos podido buscar')
    expect(row.loadedLanguages).not.toContain('de')

    await workspace.searchRow(row, 'de')

    expect(client.searchPrintings).toHaveBeenCalledTimes(3)
  })

  it('ignores stale language search results after a newer language is selected', async () => {
    let resolveGerman: ((value: (typeof printing)[]) => void) | undefined
    let resolveJapanese: ((value: (typeof printing)[]) => void) | undefined
    const germanPrinting = { ...printing, id: 'printing-de', language: 'de' }
    const japanesePrinting = { ...printing, id: 'printing-ja', language: 'ja' }
    const client = {
      searchPrintings: vi.fn(
        (
          _name: string,
          _set: string,
          language: string,
        ): Promise<(typeof printing)[]> => {
          if (language === 'de') {
            return new Promise((resolve) => {
              resolveGerman = resolve
            })
          }
          if (language === 'ja') {
            return new Promise((resolve) => {
              resolveJapanese = resolve
            })
          }
          return Promise.resolve([printing])
        },
      ),
    }
    const workspace = useProxyWorkspace(client)
    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()
    const row = workspace.rows.value[0]
    if (!row) {
      throw new Error('Expected an imported row')
    }

    const germanSearch = workspace.setRowLanguage(row.id, 'de')
    const japaneseSearch = workspace.setRowLanguage(row.id, 'ja')

    await vi.waitFor(() => {
      expect(client.searchPrintings).toHaveBeenCalledTimes(2)
    })
    resolveGerman?.([germanPrinting, printing])
    await vi.waitFor(() => {
      expect(client.searchPrintings).toHaveBeenCalledTimes(3)
    })
    resolveJapanese?.([japanesePrinting, printing])
    await Promise.all([germanSearch, japaneseSearch])

    expect(row.languageOverride).toBe('ja')
    expect(row.selectedPrintingId).toBe(japanesePrinting.id)
    expect(row.printings.map(({ id }) => id)).not.toContain(germanPrinting.id)
    expect(row.status).toBe('resolved')
  })

  it('changes language within the selected edition', async () => {
    const iceAgeEnglish = {
      ...printing,
      id: 'printing-ice-en',
      setCode: 'ice',
      setName: 'Ice Age',
      language: 'en',
    }
    const iceAgeSpanish = {
      ...iceAgeEnglish,
      id: 'printing-ice-es',
      language: 'es',
    }
    const foundations = {
      ...printing,
      id: 'printing-foundations',
      setCode: 'fdn',
      setName: 'Foundations',
      language: 'en',
    }
    const client = {
      searchPrintings: vi
        .fn()
        .mockResolvedValue([foundations, iceAgeEnglish, iceAgeSpanish]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Counterspell'
    await workspace.importList()
    const row = workspace.rows.value[0]
    if (!row) {
      throw new Error('Expected an imported row')
    }

    workspace.updateRow(row.id, { selectedPrintingId: iceAgeEnglish.id })
    workspace.setRowLanguage(row.id, 'es')

    expect(row.selectedPrintingId).toBe(iceAgeSpanish.id)
    expect(
      row.printings.find((candidate) => candidate.id === row.selectedPrintingId)
        ?.setCode,
    ).toBe('ice')
  })

  it('delegates printing to the browser', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const workspace = useProxyWorkspace()

    workspace.print()

    expect(print).toHaveBeenCalledOnce()
    print.mockRestore()
  })

  it('keeps ink-saving disabled and preserves workspace data when enabled', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const rowsBefore = JSON.stringify(workspace.rows.value)
    const pagesBefore = JSON.stringify(workspace.pages.value)
    expect(workspace.inkSaving.value).toBe(false)

    workspace.setInkSaving(true)

    expect(workspace.inkSaving.value).toBe(true)
    expect(JSON.stringify(workspace.rows.value)).toBe(rowsBefore)
    expect(JSON.stringify(workspace.pages.value)).toBe(pagesBefore)
  })

  it('restores saved rows and loaded languages without searching again', async () => {
    const memory = createMemoryStorage()
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const original = useProxyWorkspace(client, undefined, undefined, memory)
    original.rawList.value = 'Lightning Bolt'
    await original.importList()
    const row = original.rows.value[0]
    if (!row) {
      throw new Error('Expected an imported row')
    }
    await original.addCardFromSyntax('Lightning Bolt\nCounterspell')
    expect(original.parseErrors.value).not.toHaveLength(0)
    const germanPrinting = { ...printing, id: 'printing-de', language: 'de' }
    row.printings.push(germanPrinting)
    row.loadedLanguages.push('de')
    row.status = 'loading'
    await nextTick()

    const restoredClient = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const restored = useProxyWorkspace(
      restoredClient,
      undefined,
      undefined,
      memory,
    )
    const restoredRow = restored.rows.value[0]

    expect(restored.rawList.value).toBe('Lightning Bolt')
    expect(restoredRow?.status).toBe('resolved')
    expect(restoredRow?.loadedLanguages).toContain('de')
    expect(restored.parseErrors.value).toEqual(original.parseErrors.value)
    expect(restored.unresolvedCount.value).toBe(1)
    expect(restored.pages.value).toHaveLength(1)
    await restored.setGlobalLanguage('de')

    expect(restoredRow?.selectedPrintingId).toBe(germanPrinting.id)
    expect(restoredClient.searchPrintings).not.toHaveBeenCalled()
  })

  it('autosaves list edits and workspace changes', async () => {
    const memory = createMemoryStorage()
    const storage = createWorkspaceStorage(memory)
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client, undefined, undefined, memory)
    workspace.rawList.value = 'Lightning Bolt'
    await nextTick()

    expect(storage.load()).toMatchObject({
      status: 'restored',
      snapshot: { rawList: 'Lightning Bolt', rows: [] },
    })

    await workspace.importList()
    const row = workspace.rows.value[0]
    if (!row) {
      throw new Error('Expected an imported row')
    }
    workspace.updateRow(row.id, { quantity: 3 })
    workspace.setInkSaving(true)
    await workspace.setRowLanguage(row.id, 'de')
    await nextTick()

    expect(storage.load()).toMatchObject({
      status: 'restored',
      snapshot: {
        rows: [{ quantity: 3, selectedPrintingId: printing.id }],
        globalLanguage: 'es',
        inkSaving: true,
      },
    })
    const savedWorkspace = storage.load()
    if (savedWorkspace.status !== 'restored') {
      throw new Error('Expected the workspace to be saved')
    }
    expect(savedWorkspace.snapshot.rows[0]?.loadedLanguages).toContain('de')

    expect(await workspace.addCardFromSyntax('Lightning Bolt')).toBe(true)
    await nextTick()
    expect(storage.load()).toMatchObject({
      status: 'restored',
      snapshot: { rows: [{}, {}] },
    })
    workspace.removeRow(workspace.rows.value[1]?.id ?? '')
    await nextTick()
    expect(storage.load()).toMatchObject({
      status: 'restored',
      snapshot: { rows: [{ quantity: 3 }] },
    })
  })

  it('does not overwrite incompatible data and clears it only on request', async () => {
    const memory = createMemoryStorage()
    const unsupportedData = JSON.stringify({ version: 2, workspace: {} })
    memory.values.set(WORKSPACE_STORAGE_KEY, unsupportedData)
    const workspace = useProxyWorkspace(
      { searchPrintings: vi.fn() },
      undefined,
      undefined,
      memory,
    )

    workspace.rawList.value = 'New workspace'
    await nextTick()

    expect(workspace.persistenceError.value).toBe('unsupported')
    expect(memory.values.get(WORKSPACE_STORAGE_KEY)).toBe(unsupportedData)
    expect(await workspace.clearWorkspace()).toBe(true)
    expect(memory.values.has(WORKSPACE_STORAGE_KEY)).toBe(false)
    expect(workspace.rawList.value).toBe('')
    expect(workspace.persistenceError.value).toBe('')
  })

  it('keeps in-memory edits available when automatic saving fails', async () => {
    const failingStorage: WorkspaceStorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error('Storage quota exceeded')
      },
      removeItem: () => {},
    }
    const workspace = useProxyWorkspace(
      { searchPrintings: vi.fn() },
      undefined,
      undefined,
      failingStorage,
    )

    workspace.rawList.value = 'Lightning Bolt'
    await nextTick()

    expect(workspace.rawList.value).toBe('Lightning Bolt')
    expect(workspace.persistenceError.value).toBe('write')
  })
})
