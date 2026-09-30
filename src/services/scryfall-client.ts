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

interface ScryfallErrorResponse {
  object: 'error'
  status: number
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
    language = 'en',
    collectorNumber = '',
  ): Promise<ScryfallPrinting[]> {
    void language
    const requestKey = `${name.trim().toLowerCase()}::${setCode.toLowerCase()}::${collectorNumber.trim()}`
    const pendingRequest = this.pendingRequests.get(requestKey)
    if (pendingRequest) {
      return pendingRequest
    }

    const request = this.fetchPrintings(name, setCode, collectorNumber)
    this.pendingRequests.set(requestKey, request)
    try {
      const printings = await request
      const canonicalName = printings.find(
        (printing) =>
          name.trim() &&
          printing.name.trim().toLowerCase() !== name.trim().toLowerCase(),
      )?.name

      if (canonicalName) {
        return await this.fetchPrintings(
          canonicalName,
          setCode,
          collectorNumber,
        )
      }

      return printings
    } finally {
      if (this.pendingRequests.get(requestKey) === request) {
        this.pendingRequests.delete(requestKey)
      }
    }
  }

  private async fetchPrintings(
    name: string,
    setCode: string,
    collectorNumber: string,
  ): Promise<ScryfallPrinting[]> {
    const selectors = [
      setCode ? `set:${setCode.trim().toLowerCase()}` : '',
      collectorNumber ? `cn:${collectorNumber.trim()}` : '',
    ]
      .filter(Boolean)
      .join(' ')
    const escapedName = name
      .trim()
      .replaceAll('\\', '\\\\')
      .replaceAll('"', '\\"')
    const nameQuery = escapedName ? `!"${escapedName}"` : ''
    const query = [nameQuery, selectors].filter(Boolean).join(' ')
    const url = new URL('/cards/search', this.baseUrl)
    url.searchParams.set('q', query)
    url.searchParams.set('unique', 'prints')
    url.searchParams.set('order', 'released')

    const response = await this.fetcher(url)
    if (response.status === 404) {
      return []
    }

    if (!response.ok) {
      throw new ScryfallError(
        response.status === 429
          ? 'Scryfall ha limitado temporalmente las búsquedas.'
          : 'No se pudo consultar Scryfall.',
        response.status,
      )
    }

    const payload: unknown = await response.json()
    if (this.isErrorResponse(payload) && payload.status === 404) {
      return []
    }
    if (!this.isSearchResponse(payload)) {
      throw new ScryfallError('Scryfall devolvió una respuesta no válida.')
    }

    return payload.data
      .map((card) => this.toPrinting(card))
      .filter((printing): printing is ScryfallPrinting => printing !== null)
      .filter(
        (printing) => !setCode || printing.setCode === setCode.toLowerCase(),
      )
      .filter(
        (printing) =>
          !collectorNumber ||
          printing.collectorNumber === collectorNumber.trim(),
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
      Array.isArray(data) && data.every((card) => this.isScryfallCard(card))
    )
  }

  private isScryfallCard(value: unknown): value is ScryfallCard {
    if (typeof value !== 'object' || value === null) {
      return false
    }

    const card = value as Record<string, unknown>
    const hasValidImageUris =
      card.image_uris === undefined || this.isImageUris(card.image_uris)
    const hasValidCardFaces =
      card.card_faces === undefined ||
      (Array.isArray(card.card_faces) &&
        card.card_faces.every((face) => {
          if (typeof face !== 'object' || face === null) {
            return false
          }

          const cardFace = face as Record<string, unknown>
          return (
            cardFace.image_uris === undefined ||
            this.isImageUris(cardFace.image_uris)
          )
        }))

    return (
      typeof card.id === 'string' &&
      typeof card.name === 'string' &&
      typeof card.set === 'string' &&
      typeof card.set_name === 'string' &&
      typeof card.collector_number === 'string' &&
      typeof card.lang === 'string' &&
      hasValidImageUris &&
      hasValidCardFaces
    )
  }

  private isImageUris(value: unknown): value is { normal?: string } {
    if (typeof value !== 'object' || value === null) {
      return false
    }

    const imageUris = value as Record<string, unknown>
    return (
      imageUris.normal === undefined || typeof imageUris.normal === 'string'
    )
  }

  private isErrorResponse(value: unknown): value is ScryfallErrorResponse {
    return (
      typeof value === 'object' &&
      value !== null &&
      'object' in value &&
      value.object === 'error' &&
      'status' in value &&
      typeof value.status === 'number'
    )
  }
}
