import { describe, expect, it } from 'vitest'

import type { ScryfallPrinting } from '@/domain/card'
import {
  filterPrintingsByLanguage,
  groupPrintingsByEdition,
  mergePrintings,
  selectPrintingForLanguage,
} from '@/domain/card-language'

const printing = (
  id: string,
  setCode: string,
  language: string,
): ScryfallPrinting => ({
  id,
  name: 'Lightning Bolt',
  setCode,
  setName: setCode.toUpperCase(),
  collectorNumber: '1',
  language,
  imageUri: `https://example.com/${id}.jpg`,
})

const printings = [
  printing('lea-en', 'lea', 'en'),
  printing('lea-es', 'lea', 'es'),
  printing('lea-ja', 'lea', 'ja'),
  printing('neo-ja', 'neo', 'ja'),
  printing('neo-de', 'neo', 'de'),
]

describe('card language policy', () => {
  it('filters non-English choices to the requested language and English', () => {
    expect(
      filterPrintingsByLanguage(printings, 'es').map(({ id }) => id),
    ).toEqual(['lea-en', 'lea-es'])
  })

  it('filters English choices to English only', () => {
    expect(
      filterPrintingsByLanguage(printings, 'en').map(({ id }) => id),
    ).toEqual(['lea-en'])
  })

  it('excludes editions without a requested-language or English printing', () => {
    expect(
      groupPrintingsByEdition(printings, 'es').map(({ key }) => key),
    ).toEqual(['lea:1'])
  })

  it('prefers the requested language in the selected edition', () => {
    expect(selectPrintingForLanguage(printings, 'es', 'lea:1')?.id).toBe(
      'lea-es',
    )
  })

  it('falls back to English in the selected edition', () => {
    expect(selectPrintingForLanguage(printings, 'de', 'lea:1')?.id).toBe(
      'lea-en',
    )
  })

  it('merges new language results by Scryfall printing identity', () => {
    const updatedEnglish = { ...printings[0]!, name: 'Updated name' }
    const merged = mergePrintings(
      [printings[0]!],
      [updatedEnglish, printings[1]!],
    )

    expect(merged).toEqual([updatedEnglish, printings[1]])
  })
})
