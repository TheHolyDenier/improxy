import { computed, ref } from 'vue'

import { CardListParser } from '@/domain/card-list-parser'
import type { CardRowState } from '@/domain/card'
import { ProxySheetComposer } from '@/domain/proxy-sheet'
import { defaultCardLanguage, i18n } from '@/i18n'
import { ScryfallClient } from '@/services/scryfall-client'

type ScryfallSearchClient = Pick<ScryfallClient, 'searchPrintings'>

const findPrintingForLanguage = (
  printings: CardRowState['printings'],
  language: string,
) => printings.find((printing) => printing.language === language)

const findPrintingWithFallback = (
  printings: CardRowState['printings'],
  language: string,
) =>
  findPrintingForLanguage(printings, language) ??
  findPrintingForLanguage(printings, 'en')

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
  const globalLanguage = ref(defaultCardLanguage)
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
    parseErrors.value = result.errors.map((error) =>
      i18n.global.t('errors.parseLine', {
        line: error.line,
        message: error.message,
      }),
    )
    rows.value = result.entries.map((entry) =>
      createRow(entry.name, entry.quantity, entry.setCode),
    )
    void searchAll()
  }

  async function searchRow(
    row: CardRowState,
    language = row.languageOverride || globalLanguage.value,
  ) {
    if (!row.name.trim()) {
      row.status = 'error'
      row.errorMessage = i18n.global.t('errors.missingName')
      return
    }

    const requestKey = `${row.id}::${language}`
    const existingRequest = searchRequests.get(requestKey)
    if (existingRequest) {
      await existingRequest
      return
    }

    row.status = 'loading'
    row.errorMessage = ''
    const request = client
      .searchPrintings(row.name, row.setCode, language)
      .then((printings) => {
        row.printings = printings
        const preferred = findPrintingWithFallback(
          printings,
          row.languageOverride || globalLanguage.value,
        )
        row.selectedPrintingId = preferred?.id ?? ''
        row.status = printings.length ? 'resolved' : 'error'
        row.errorMessage = printings.length
          ? ''
          : i18n.global.t('errors.notFound')
      })
      .catch((error: unknown) => {
        row.status = 'error'
        row.errorMessage =
          error instanceof Error
            ? error.message
            : i18n.global.t('errors.searchFailed')
      })
      .finally(() => {
        searchRequests.delete(requestKey)
      })
    searchRequests.set(requestKey, request)
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
        row.selectedPrintingId =
          findPrintingWithFallback(row.printings, language)?.id ?? ''
        if (!findPrintingForLanguage(row.printings, language)) {
          void searchRow(row, language)
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
    row.selectedPrintingId =
      findPrintingWithFallback(row.printings, language)?.id ?? ''
    if (!findPrintingForLanguage(row.printings, language)) {
      void searchRow(row, language)
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
