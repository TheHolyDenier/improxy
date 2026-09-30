import type { CardListEntry, ParseResult } from './card'

const entryPattern = /^(?:(\d+)\s+)?(.+?)(?:\s+\(([^()]+)\))?$/

export class CardListParser {
  parse(input: string): ParseResult {
    const entries: CardListEntry[] = []
    const errors: ParseResult['errors'] = []

    input.split(/\r?\n/).forEach((rawLine, index) => {
      const value = rawLine.trim()
      if (!value) {
        return
      }

      const match = entryPattern.exec(value)
      const quantity = match?.[1] ? Number.parseInt(match[1], 10) : 1
      const name = match?.[2]?.trim() ?? ''
      const setCode = match?.[3]?.trim().toUpperCase() ?? ''

      if (!match || !name) {
        errors.push({
          line: index + 1,
          value: rawLine,
          message: 'Escribe al menos el nombre de una carta.',
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
        name,
        quantity,
        setCode,
      })
    })

    return { entries, errors }
  }
}
