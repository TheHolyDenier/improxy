import type { CardListEntry, ParseResult } from './card'

const entryPattern = /^(?:(\d+)\s+)?(.+?)(?:\s+\(([^()]+)\))?$/
const selectorPattern = /(?:^|\s)(e|cn):(\S+)/gi
const malformedSelectorPattern = /(?:^|\s)(e|cn):(?=\s|$)/i

export class CardListParser {
  parse(input: string): ParseResult {
    const entries: CardListEntry[] = []
    const errors: ParseResult['errors'] = []

    input.split(/\r?\n/).forEach((rawLine, index) => {
      const value = rawLine.trim()
      if (!value) {
        return
      }

      if (malformedSelectorPattern.test(value)) {
        errors.push({
          line: index + 1,
          value: rawLine,
          message: 'El set y el número de carta deben tener un valor.',
        })
        return
      }

      const match = entryPattern.exec(value)
      const quantity = match?.[1] ? Number.parseInt(match[1], 10) : 1
      const selectorMatches = [...value.matchAll(selectorPattern)]
      const selectorValues = new Map(
        selectorMatches.map((selector) => [
          selector[1]?.toLowerCase(),
          selector[2]?.trim(),
        ]),
      )
      const name = (match?.[2] ?? value)
        .replace(selectorPattern, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      const setCode =
        selectorValues.get('e')?.toUpperCase() ??
        match?.[3]?.trim().toUpperCase() ??
        ''
      const collectorNumber = selectorValues.get('cn') ?? ''

      const hasSetAndCollectorNumber = Boolean(setCode && collectorNumber)

      if (!match || (!name && !hasSetAndCollectorNumber)) {
        errors.push({
          line: index + 1,
          value: rawLine,
          message:
            'Escribe el nombre de una carta o indica la edición y el número de carta.',
        })
        return
      }

      if (!Number.isInteger(quantity) || quantity < 1) {
        errors.push({
          line: index + 1,
          value: rawLine,
          message: 'La cantidad debe ser un número entero mayor que cero.',
        })
        return
      }

      entries.push({
        id: crypto.randomUUID(),
        sourceLine: index + 1,
        name,
        quantity,
        setCode,
        collectorNumber,
      })
    })

    return { entries, errors }
  }
}
