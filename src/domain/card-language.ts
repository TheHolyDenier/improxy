import type { ScryfallPrinting } from './card'

export interface PrintingEdition {
  readonly key: string
  readonly printings: ScryfallPrinting[]
}

export const filterPrintingsByLanguage = (
  printings: readonly ScryfallPrinting[],
  language: string,
) =>
  printings.filter(
    (printing) =>
      printing.language === language ||
      (language !== 'en' && printing.language === 'en'),
  )

export const mergePrintings = (
  current: readonly ScryfallPrinting[],
  incoming: readonly ScryfallPrinting[],
) => {
  const merged = new Map(current.map((printing) => [printing.id, printing]))
  incoming.forEach((printing) => merged.set(printing.id, printing))
  return [...merged.values()]
}

export const getPrintingEditionKey = (printing: ScryfallPrinting) =>
  `${printing.setCode}:${printing.collectorNumber}`

export const groupPrintingsByEdition = (
  printings: readonly ScryfallPrinting[],
  language: string,
): PrintingEdition[] => {
  const groups = new Map<string, ScryfallPrinting[]>()

  filterPrintingsByLanguage(printings, language).forEach((printing) => {
    const key = getPrintingEditionKey(printing)
    const group = groups.get(key)
    if (group) {
      group.push(printing)
    } else {
      groups.set(key, [printing])
    }
  })

  return [...groups].map(([key, editionPrintings]) => ({
    key,
    printings: editionPrintings,
  }))
}

export const selectPrintingForLanguage = (
  printings: readonly ScryfallPrinting[],
  language: string,
  preferredEditionKey = '',
) => {
  const editions = groupPrintingsByEdition(printings, language)
  const preferredEdition =
    editions.find((edition) => edition.key === preferredEditionKey) ??
    editions[0]
  const preferredPrinting = preferredEdition?.printings.find(
    (printing) => printing.language === language,
  )
  return (
    preferredPrinting ??
    preferredEdition?.printings.find(
      (printing) => printing.language === 'en',
    ) ??
    editions
      .flatMap((edition) => edition.printings)
      .find((printing) => printing.language === language) ??
    editions
      .flatMap((edition) => edition.printings)
      .find((printing) => printing.language === 'en')
  )
}
