import type { ScryfallPrinting } from '@/domain/card'

interface ScryfallCard {
  id: string
  name: string
  set: string
  set_name: string
  collector_number: string
  lang: string
  image_uris?: {
    normal?: string
  }
  card_faces?: Array<{
    image_uris?: {
      normal?: string
    }
  }>
}

interface ScryfallSearchResponse {
  data: ScryfallCard[]
}

export class ScryfallError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'ScryfallError'
  }
}

export class ScryfallClient {
  private readonly pendingRequests = new Map<
    string,
    Promise<ScryfallPrinting[]>
  >()

  constructor(
    private readonly fetcher: typeof fetch = globalThis.fetch.bind(globalThis),
    private readonly baseUrl = 'https://api.scryfall.com',
  ) {}

  async searchPrintings(
    name: string,
    setCode = '',
  ): Promise<ScryfallPrinting[]> {
    const requestKey = `${name.trim().toLowerCase()}::${setCode.toLowerCase()}`
    const pendingRequest = this.pendingRequests.get(requestKey)
    if (pendingRequest) {
      return pendingRequest
    }

    const request = this.fetchPrintings(name, setCode).finally(() => {
      this.pendingRequests.delete(requestKey)
    })
    this.pendingRequests.set(requestKey, request)
    return request
  }

  private async fetchPrintings(
    name: string,
    setCode: string,
  ): Promise<ScryfallPrinting[]> {
    const query = `!"${name.trim()}"`
    const url = new URL('/cards/search', this.baseUrl)
    url.searchParams.set('q', query)
    url.searchParams.set('unique', 'prints')
    url.searchParams.set('order', 'released')

    const response = await this.fetcher(url)
    if (!response.ok) {
      throw new ScryfallError(
        response.status === 429
          ? 'Scryfall ha limitado temporalmente las búsquedas.'
          : 'No se pudo consultar Scryfall.',
        response.status,
      )
    }

    const payload: unknown = await response.json()
    if (!this.isSearchResponse(payload)) {
      throw new ScryfallError('Scryfall devolvió una respuesta no válida.')
    }

    return payload.data
      .map((card) => this.toPrinting(card))
      .filter((printing): printing is ScryfallPrinting => printing !== null)
      .filter(
        (printing) => !setCode || printing.setCode === setCode.toLowerCase(),
      )
  }

  private toPrinting(card: ScryfallCard): ScryfallPrinting | null {
    const imageUri =
      card.image_uris?.normal ?? card.card_faces?.[0]?.image_uris?.normal
    if (!imageUri) {
      return null
    }

    return {
      id: card.id,
      name: card.name,
      setCode: card.set,
      setName: card.set_name,
      collectorNumber: card.collector_number,
      language: card.lang,
      imageUri,
    }
  }

  private isSearchResponse(value: unknown): value is ScryfallSearchResponse {
    if (!value || typeof value !== 'object' || !('data' in value)) {
      return false
    }

    const data = value.data
    return (
      Array.isArray(data) &&
      data.every(
        (card) =>
          typeof card === 'object' &&
          card !== null &&
          'id' in card &&
          typeof card.id === 'string' &&
          'name' in card &&
          typeof card.name === 'string',
      )
    )
  }
}
