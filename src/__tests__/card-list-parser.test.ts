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
      collectorNumber: '',
    })
  })

  it('parses quantity and set', () => {
    const result = new CardListParser().parse('2 Counterspell (STA)')

    expect(result.entries[0]).toMatchObject({
      name: 'Counterspell',
      quantity: 2,
      setCode: 'STA',
      collectorNumber: '',
    })
  })

  it('parses set and collector number selectors', () => {
    const result = new CardListParser().parse('2 Counterspell e:inr cn:13')

    expect(result.entries[0]).toMatchObject({
      name: 'Counterspell',
      quantity: 2,
      setCode: 'INR',
      collectorNumber: '13',
    })
  })

  it('accepts set and collector number without a card name', () => {
    const result = new CardListParser().parse('e:INR cn:13')

    expect(result.errors).toEqual([])
    expect(result.entries[0]).toMatchObject({
      name: '',
      setCode: 'INR',
      collectorNumber: '13',
    })
  })

  it('rejects a set selector without its collector number or name', () => {
    const result = new CardListParser().parse('e:INR')

    expect(result.entries).toHaveLength(0)
    expect(result.errors[0]?.message).toContain('nombre')
  })

  it('reports malformed selectors', () => {
    const result = new CardListParser().parse('Counterspell e: cn:')

    expect(result.entries).toHaveLength(0)
    expect(result.errors[0]?.message).toContain('valor')
  })

  it('ignores blank lines and keeps valid entries beside errors', () => {
    const result = new CardListParser().parse(
      '\nLightning Bolt\n0 Invalid Quantity\n',
    )

    expect(result.entries).toHaveLength(1)
    expect(result.errors[0]?.line).toBe(3)
  })
})
