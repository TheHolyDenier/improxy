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

  it('loads the requested language and English fallback', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [{ ...card, id: 'card-es', lang: 'es' }, card],
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    const result = await new ScryfallClient(fetcher).searchPrintings(
      'Lightning Bolt',
      '',
      'es',
    )

    expect(fetcher).toHaveBeenCalledOnce()
    expect(String(fetcher.mock.calls[0]?.[0])).toContain(
      '%28lang%3Aes+or+lang%3Aen%29',
    )
    expect(result.map((printing) => printing.language)).toEqual(['es', 'en'])
  })

  it('filters unrelated languages from Scryfall responses', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { ...card, id: 'card-es', lang: 'es' },
            card,
            { ...card, id: 'card-ja', lang: 'ja' },
          ],
        }),
        { status: 200 },
      ),
    )

    const result = await new ScryfallClient(fetcher).searchPrintings(
      'Lightning Bolt',
      '',
      'es',
    )

    expect(result.map((printing) => printing.language)).toEqual(['es', 'en'])
  })

  it('retries with Scryfall canonical name after a localized match', async () => {
    const localizedCard = {
      ...card,
      name: 'Counterspell',
      printed_name: 'Contrahechizo',
      lang: 'es',
    }
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [localizedCard] }), {
          status: 200,
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [card] }), {
          status: 200,
        }),
      )

    const result = await new ScryfallClient(fetcher).searchPrintings(
      'contrahechizo',
    )

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(String(fetcher.mock.calls[1]?.[0])).toContain('%22Counterspell%22')
    expect(result[0]?.name).toBe('Lightning Bolt')
  })

  it('filters results by set and collector number', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [card, { ...card, id: 'card-2', collector_number: '162' }],
        }),
        { status: 200 },
      ),
    )

    const result = await new ScryfallClient(fetcher).searchPrintings(
      'Lightning Bolt',
      'LEA',
      'en',
      '161',
    )

    expect(result).toHaveLength(1)
    expect(result[0]?.collectorNumber).toBe('161')
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('set%3Alea')
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('cn%3A161')
  })

  it('treats Scryfall not-found responses as an empty result', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('', { status: 404 }))

    await expect(
      new ScryfallClient(fetcher).searchPrintings('Unknown Card'),
    ).resolves.toEqual([])
  })

  it('can search by set and collector number without a name', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: [card] }), {
        status: 200,
      }),
    )

    const result = await new ScryfallClient(fetcher).searchPrintings(
      '',
      'LEA',
      'en',
      '161',
    )

    expect(result).toHaveLength(1)
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('set%3Alea')
    expect(String(fetcher.mock.calls[0]?.[0])).toContain('cn%3A161')
    expect(String(fetcher.mock.calls[0]?.[0])).not.toContain('%22%22')
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

  it('rejects cards missing fields used by the printer', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({ data: [{ id: 'card-1', name: 'Lightning Bolt' }] }),
          { status: 200 },
        ),
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

  it('normalizes language and set values in request deduplication keys', async () => {
    let resolveResponse: (response: Response) => void = () => {}
    const response = new Promise<Response>((resolve) => {
      resolveResponse = resolve
    })
    const fetcher = vi.fn().mockReturnValue(response)
    const client = new ScryfallClient(fetcher)

    const first = client.searchPrintings('Lightning Bolt', ' LEA ', ' es ')
    const second = client.searchPrintings('lightning bolt', 'lea', 'es')
    resolveResponse(
      new Response(JSON.stringify({ data: [{ ...card, lang: 'es' }] }), {
        status: 200,
      }),
    )

    await Promise.all([first, second])

    expect(fetcher).toHaveBeenCalledOnce()
  })

  it('binds the browser fetch function before invoking it', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [card] }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetcher)

    await new ScryfallClient().searchPrintings('Lightning Bolt')

    expect(fetcher).toHaveBeenCalledOnce()
  })
})
