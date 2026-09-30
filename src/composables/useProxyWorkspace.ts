import { computed, ref } from 'vue'

import { CardListParser } from '@/domain/card-list-parser'
import type { CardRowState } from '@/domain/card'
import { ProxySheetComposer } from '@/domain/proxy-sheet'
import { ScryfallClient } from '@/services/scryfall-client'

type ScryfallSearchClient = Pick<ScryfallClient, 'searchPrintings'>

const createRow = (name = '', quantity = 1, setCode = ''): CardRowState => ({
  id: crypto.randomUUID(),
  name,
  quantity,
  setCode,
  status: 'idle',
  errorMessage: '',
  printings: [],
  selectedPrintingId: '',
  languageOverride: '',
})

export function useProxyWorkspace(
  client: ScryfallSearchClient = new ScryfallClient(),
  parser = new CardListParser(),
  composer = new ProxySheetComposer(),
) {
  const rawList = ref('')
  const rows = ref<CardRowState[]>([])
  const parseErrors = ref<string[]>([])
  const globalLanguage = ref('en')
  const searchRequests = new Map<string, Promise<void>>()

  const totalCopies = computed(() =>
    rows.value.reduce((total, row) => total + row.quantity, 0),
  )
  const unresolvedCount = computed(
    () =>
      rows.value.filter(
        (row) => !row.selectedPrintingId || row.status === 'error',
      ).length,
  )
  const pages = computed(() => composer.compose(rows.value))
  const readyToPrint = computed(
    () =>
      rows.value.length > 0 &&
      rows.value.every(
        (row) => row.status === 'resolved' && row.selectedPrintingId,
      ),
  )

  function importList() {
    const result = parser.parse(rawList.value)
    parseErrors.value = result.errors.map(
      (error) => `Línea ${error.line}: ${error.message}`,
    )
    rows.value = result.entries.map((entry) =>
      createRow(entry.name, entry.quantity, entry.setCode),
    )
    void searchAll()
  }

  async function searchRow(row: CardRowState) {
    if (!row.name.trim()) {
      row.status = 'error'
      row.errorMessage = 'Escribe un nombre antes de buscar.'
      return
    }

    const existingRequest = searchRequests.get(row.id)
    if (existingRequest) {
      await existingRequest
      return
    }

    row.status = 'loading'
    row.errorMessage = ''
    const request = client
      .searchPrintings(row.name, row.setCode)
      .then((printings) => {
        row.printings = printings
        const preferred =
          printings.find(
            (printing) =>
              printing.language ===
              (row.languageOverride || globalLanguage.value),
          ) ?? printings[0]
        row.selectedPrintingId = preferred?.id ?? ''
        row.status = printings.length ? 'resolved' : 'error'
        row.errorMessage = printings.length
          ? ''
          : 'No encontramos esa carta en Scryfall.'
      })
      .catch((error: unknown) => {
        row.status = 'error'
        row.errorMessage =
          error instanceof Error ? error.message : 'No se pudo buscar la carta.'
      })
      .finally(() => {
        searchRequests.delete(row.id)
      })
    searchRequests.set(row.id, request)
    await request
  }

  async function searchAll() {
    await Promise.all(rows.value.map((row) => searchRow(row)))
  }

  function updateRow(rowId: string, patch: Partial<CardRowState>) {
    const row = rows.value.find((candidate) => candidate.id === rowId)
    if (!row) {
      return
    }

    const searchChanged =
      ('name' in patch && patch.name !== row.name) ||
      ('setCode' in patch && patch.setCode !== row.setCode)
    Object.assign(row, patch)
    if (searchChanged) {
      row.status = 'idle'
      row.printings = []
      row.selectedPrintingId = ''
      row.errorMessage = ''
    }
  }

  function addRow() {
    rows.value.push(createRow())
  }

  function removeRow(rowId: string) {
    rows.value = rows.value.filter((row) => row.id !== rowId)
  }

  function duplicateRow(rowId: string) {
    const source = rows.value.find((row) => row.id === rowId)
    if (!source) {
      return
    }

    rows.value.push({
      ...source,
      id: crypto.randomUUID(),
      status: 'idle',
      errorMessage: '',
      printings: [],
      selectedPrintingId: '',
    })
  }

  function setGlobalLanguage(language: string) {
    globalLanguage.value = language
    rows.value.forEach((row) => {
      if (!row.languageOverride) {
        const preferred = row.printings.find(
          (printing) => printing.language === language,
        )
        if (preferred) {
          row.selectedPrintingId = preferred.id
        }
      }
    })
  }

  function setRowLanguage(rowId: string, language: string) {
    const row = rows.value.find((candidate) => candidate.id === rowId)
    if (!row) {
      return
    }

    row.languageOverride = language
    const preferred = row.printings.find(
      (printing) => printing.language === language,
    )
    if (preferred) {
      row.selectedPrintingId = preferred.id
    }
  }

  function print() {
    window.print()
  }

  return {
    rawList,
    rows,
    parseErrors,
    globalLanguage,
    totalCopies,
    unresolvedCount,
    pages,
    readyToPrint,
    importList,
    searchRow,
    updateRow,
    addRow,
    removeRow,
    duplicateRow,
    setGlobalLanguage,
    setRowLanguage,
    print,
  }
}
