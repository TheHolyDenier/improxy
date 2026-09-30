import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CardListParser } from '@/domain/card-list-parser'

describe('CardListParser', () => {
  beforeEach(() => {
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => 'row-id') })
  })

  it('parses a name-only entry with quantity one', () => {
    const result = new CardListParser().parse('Lightning Bolt')

    expect(result.errors).toEqual([])
    expect(result.entries[0]).toMatchObject({
      name: 'Lightning Bolt',
      quantity: 1,
      setCode: '',
    })
  })

  it('parses quantity and set', () => {
    const result = new CardListParser().parse('2 Counterspell (STA)')

    expect(result.entries[0]).toMatchObject({
      name: 'Counterspell',
      quantity: 2,
      setCode: 'STA',
    })
  })

  it('ignores blank lines and keeps valid entries beside errors', () => {
    const result = new CardListParser().parse(
      '\nLightning Bolt\n0 Invalid Quantity\n',
    )

    expect(result.entries).toHaveLength(1)
    expect(result.errors[0]?.line).toBe(3)
  })
})
