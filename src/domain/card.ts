export type RowStatus = 'idle' | 'loading' | 'resolved' | 'error'

export interface CardListEntry {
  readonly id: string
  name: string
  quantity: number
  setCode: string
}

export interface ScryfallPrinting {
  readonly id: string
  readonly name: string
  readonly setCode: string
  readonly setName: string
  readonly collectorNumber: string
  readonly language: string
  readonly imageUri: string
}

export interface CardRowState extends CardListEntry {
  status: RowStatus
  errorMessage: string
  printings: ScryfallPrinting[]
  selectedPrintingId: string
  languageOverride: string
}

export interface ParseError {
  readonly line: number
  readonly value: string
  readonly message: string
}

export interface ParseResult {
  readonly entries: CardListEntry[]
  readonly errors: ParseError[]
}
