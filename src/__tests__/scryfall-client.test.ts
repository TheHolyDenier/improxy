import { describe, expect, it, vi } from 'vitest'

import { ScryfallClient, ScryfallError } from '@/services/scryfall-client'

const card = {
  id: 'card-1',
  name: 'Lightning Bolt',
  set: 'lea',
  set_name: 'Limited Edition Alpha',
  collector_number: '161',
  lang: 'en',
  image_uris: { normal: 'https://example.com/card.jpg' },
}

describe('ScryfallClient', () => {
  it('maps a valid search response', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [card] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    const result = await new ScryfallClient(fetcher).searchPrintings(
      'Lightning Bolt',
    )

    expect(result[0]).toMatchObject({
      id: 'card-1',
      setCode: 'lea',
      imageUri: 'https://example.com/card.jpg',
    })
  })

  it('maps rate limits to a recoverable error', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response('', {
        status: 429,
      }),
    )

    await expect(
      new ScryfallClient(fetcher).searchPrintings('Lightning Bolt'),
    ).rejects.toBeInstanceOf(ScryfallError)
  })

  it('rejects malformed payloads', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ nope: true }), {
        status: 200,
      }),
    )

    await expect(
      new ScryfallClient(fetcher).searchPrintings('Lightning Bolt'),
    ).rejects.toThrow('respuesta no válida')
  })

  it('deduplicates simultaneous requests for the same card and set', async () => {
    let resolveResponse: (response: Response) => void = () => {}
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve
    })
    const fetcher = vi.fn().mockReturnValue(response)
    const client = new ScryfallClient(fetcher)

    const first = client.searchPrintings('Lightning Bolt', 'LEA')
    const second = client.searchPrintings('lightning bolt', 'lea')
    resolveResponse(
      new Response(JSON.stringify({ data: [card] }), { status: 200 }),
    )

    await Promise.all([first, second])

    expect(fetcher).toHaveBeenCalledTimes(1)
  })
})
