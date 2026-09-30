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

  it('keeps row identities and local state when adding and removing rows', () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    workspace.importList()
    const firstRow = workspace.rows.value[0]
    workspace.addRow()

    expect(workspace.rows.value).toHaveLength(2)
    expect(workspace.rows.value[0]?.id).toBe(firstRow?.id)

    workspace.removeRow(workspace.rows.value[1]?.id ?? '')

    expect(workspace.rows.value).toHaveLength(1)
    expect(workspace.rows.value[0]?.id).toBe(firstRow?.id)
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

  it('duplicates a row as a fresh pending row', () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt'
    workspace.importList()
    const original = workspace.rows.value[0]

    workspace.duplicateRow(original?.id ?? '')

    expect(workspace.rows.value).toHaveLength(2)
    expect(workspace.rows.value[1]).toMatchObject({
      name: 'Lightning Bolt',
      quantity: 1,
      status: 'idle',
      selectedPrintingId: '',
    })
    expect(workspace.rows.value[1]?.id).not.toBe(original?.id)
  })

  it('updates one row without resetting another row', async () => {
    const client = {
      searchPrintings: vi.fn().mockResolvedValue([printing]),
    }
    const workspace = useProxyWorkspace(client)

    workspace.rawList.value = 'Lightning Bolt\nCounterspell'
    workspace.importList()
    await new Promise((resolve) => setTimeout(resolve, 0))
    const first = workspace.rows.value[0]
    const second = workspace.rows.value[1]
    const selectedPrintingId = second?.selectedPrintingId

    workspace.updateRow(first?.id ?? '', { name: 'Dark Ritual' })

    expect(first?.selectedPrintingId).toBe('')
    expect(second?.selectedPrintingId).toBe(selectedPrintingId)
    expect(second?.status).toBe('resolved')
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
})
