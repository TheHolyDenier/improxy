import type { CardRowState, ScryfallPrinting } from './card'

export interface PrintableCopy {
  readonly rowId: string
  readonly printing: ScryfallPrinting
}

export interface ProxyPage {
  readonly copies: PrintableCopy[]
}

export class ProxySheetComposer {
  compose(rows: readonly CardRowState[]): ProxyPage[] {
    const copies = rows.flatMap((row) => {
      if (!row.selectedPrintingId || row.quantity < 1) {
        return []
      }

      const printing = row.printings.find(
        (candidate) => candidate.id === row.selectedPrintingId,
      )
      if (!printing) {
        return []
      }

      return Array.from({ length: row.quantity }, () => ({
        rowId: row.id,
        printing,
      }))
    })

    const pages: ProxyPage[] = []
    for (let index = 0; index < copies.length; index += 9) {
      pages.push({ copies: copies.slice(index, index + 9) })
    }

    return pages
  }
}
