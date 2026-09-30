import { describe, expect, it } from 'vitest'

import type { CardRowState } from '@/domain/card'
import { ProxySheetComposer } from '@/domain/proxy-sheet'

const printing = {
  id: 'printing-1',
  name: 'Lightning Bolt',
  setCode: 'lea',
  setName: 'Limited Edition Alpha',
  collectorNumber: '161',
  language: 'en',
  imageUri: 'https://example.com/card.jpg',
}

const row = (quantity: number): CardRowState => ({
  id: 'row-1',
  sourceLine: 1,
  name: 'Lightning Bolt',
  queryName: 'Lightning Bolt',
  quantity,
  setCode: '',
  collectorNumber: '',
  status: 'resolved',
  errorMessage: '',
  printings: [printing],
  selectedPrintingId: printing.id,
  languageOverride: '',
})

describe('ProxySheetComposer', () => {
  it('creates one copy for the default quantity', () => {
    expect(new ProxySheetComposer().compose([row(1)])).toEqual([
      { copies: [{ rowId: 'row-1', printing }] },
    ])
  })

  it('splits copies into pages of nine', () => {
    const pages = new ProxySheetComposer().compose([row(10)])

    expect(pages).toHaveLength(2)
    expect(pages[0]?.copies).toHaveLength(9)
    expect(pages[1]?.copies).toHaveLength(1)
  })
})
