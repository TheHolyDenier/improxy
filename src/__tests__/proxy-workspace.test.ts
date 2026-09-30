import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useProxyWorkspace } from '@/composables/useProxyWorkspace'

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

describe('useProxyWorkspace', () => {
  beforeEach(() => {
    cryptoId = 0
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => `row-${cryptoId++}`) })
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
    await new Promise((resolve) => setTimeout(resolve, 300))

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
    workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))

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

  it('duplicates a row as a fresh editable row', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    await workspace.importList()
    const original = workspace.rows.value[0]

    workspace.duplicateRow(original?.id ?? '')

    expect(workspace.rows.value).toHaveLength(2)
    expect(workspace.rows.value[1]).toMatchObject({
      name: '',
      queryName: 'Lightning Bolt',
      quantity: 1,
      status: 'idle',
      selectedPrintingId: '',
      collectorNumber: '',
    })
    expect(workspace.rows.value[1]?.id).not.toBe(original?.id)
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
    workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const first = workspace.rows.value[0]
    const second = workspace.rows.value[1]

    workspace.setRowLanguage(second?.id ?? '', 'en')
    workspace.setGlobalLanguage('es')

    expect(first?.selectedPrintingId).toBe('printing-es')
    expect(second?.selectedPrintingId).toBe('printing-1')
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
})
