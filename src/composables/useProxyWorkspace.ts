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

const appendUniqueErrors = (current: string[], next: string[]) => [
  ...new Set([...current, ...next]),
]

const createRow = (
  name = '',
  quantity = 1,
  setCode = '',
  collectorNumber = '',
  sourceLine = 0,
): CardRowState => ({
  id: crypto.randomUUID(),
  sourceLine,
  name,
  quantity,
  setCode,
  collectorNumber,
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
  const inkSaving = ref(false)
  const searchRequests = new Map<string, Promise<void>>()
  const searchTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const searchVersions = new Map<string, number>()

  const totalCopies = computed(() =>
    rows.value.reduce(
      (total, row) =>
        total +
        (row.status !== 'error' && row.selectedPrintingId ? row.quantity : 0),
      0,
    ),
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
      rows.value.some(
        (row) => row.status !== 'error' && row.selectedPrintingId,
      ),
  )

  async function importList() {
    const result = parser.parse(rawList.value)
    parseErrors.value = result.errors.map((error) =>
      i18n.global.t('errors.parseLine', {
        line: error.line,
        message: error.message,
      }),
    )
    rows.value = result.entries.map((entry) =>
      createRow(
        entry.name,
        entry.quantity,
        entry.setCode,
        entry.collectorNumber,
        entry.sourceLine,
      ),
    )
    await searchAll()
  }

  async function searchRow(
    row: CardRowState,
    language = row.languageOverride || globalLanguage.value,
  ) {
    if (!row.name.trim() && !(row.setCode && row.collectorNumber)) {
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
    const version = (searchVersions.get(row.id) ?? 0) + 1
    searchVersions.set(row.id, version)
    const request = (async () => {
      try {
        const printings = await client.searchPrintings(
          row.name,
          row.setCode,
          language,
          row.collectorNumber,
        )
        if (searchVersions.get(row.id) !== version) {
          return
        }
        row.printings = printings
        const preferred = findPrintingWithFallback(
          printings,
          row.languageOverride || globalLanguage.value,
        )
        if (!row.name.trim()) {
          row.name = preferred?.name ?? printings[0]?.name ?? ''
        }
        row.selectedPrintingId = preferred?.id ?? ''
        row.status = printings.length ? 'resolved' : 'error'
        row.errorMessage = printings.length
          ? ''
          : i18n.global.t('errors.notFound')
        if (!printings.length) {
          parseErrors.value = appendUniqueErrors(parseErrors.value, [
            i18n.global.t('errors.parseLine', {
              line: row.sourceLine,
              message: row.errorMessage,
            }),
          ])
          rows.value = rows.value.filter((candidate) => candidate !== row)
        }
      } catch (error: unknown) {
        if (searchVersions.get(row.id) !== version) {
          return
        }
        row.status = 'error'
        row.errorMessage =
          error instanceof Error
            ? error.message
            : i18n.global.t('errors.searchFailed')
      } finally {
        searchRequests.delete(requestKey)
      }
    })()
    searchRequests.set(requestKey, request)
    await request
  }

  async function searchAll() {
    await Promise.all(rows.value.map((row) => searchRow(row)))
  }

  function scheduleSearch(row: CardRowState) {
    const existingTimer = searchTimers.get(row.id)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    if (!row.name.trim()) {
      return
    }

    const timer = setTimeout(() => {
      searchTimers.delete(row.id)
      void searchRow(row)
    }, 250)
    searchTimers.set(row.id, timer)
  }

  function updateRow(rowId: string, patch: Partial<CardRowState>) {
    const row = rows.value.find((candidate) => candidate.id === rowId)
    if (!row) {
      return
    }

    const searchChanged =
      ('name' in patch && patch.name !== row.name) ||
      ('setCode' in patch && patch.setCode !== row.setCode) ||
      ('collectorNumber' in patch &&
        patch.collectorNumber !== row.collectorNumber)
    Object.assign(row, patch)
    if (searchChanged) {
      row.status = 'idle'
      row.printings = []
      row.selectedPrintingId = ''
      row.errorMessage = ''
      scheduleSearch(row)
    }
  }

  function addRow() {
    rows.value.push(createRow())
  }

  async function addCardFromSyntax(value: string) {
    const sourceLine = rawList.value.trim()
      ? rawList.value.trim().split(/\r?\n/).length + 1
      : 1
    const result = parser.parse(value)
    if (result.errors.length || !result.entries[0]) {
      parseErrors.value = appendUniqueErrors(parseErrors.value, [
        ...result.errors.map((error) =>
          i18n.global.t('errors.parseLine', {
            line: sourceLine,
            message: error.message,
          }),
        ),
      ])
      return
    }

    const [entry] = result.entries
    rawList.value = rawList.value.trim()
      ? `${rawList.value.trim()}\n${value}`
      : value
    const row = createRow(
      entry.name,
      entry.quantity,
      entry.setCode,
      entry.collectorNumber,
      sourceLine,
    )
    rows.value.push(row)
    await searchRow(row)
    if (row.errorMessage === i18n.global.t('errors.notFound')) {
      rows.value = rows.value.filter((candidate) => candidate !== row)
      parseErrors.value = appendUniqueErrors(parseErrors.value, [
        i18n.global.t('errors.parseLine', {
          line: sourceLine,
          message: row.errorMessage,
        }),
      ])
    }
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
      sourceLine: 0,
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

  function setInkSaving(enabled: boolean) {
    inkSaving.value = enabled
  }

  return {
    rawList,
    rows,
    parseErrors,
    globalLanguage,
    inkSaving,
    totalCopies,
    unresolvedCount,
    pages,
    readyToPrint,
    importList,
    searchRow,
    updateRow,
    addRow,
    addCardFromSyntax,
    removeRow,
    duplicateRow,
    setGlobalLanguage,
    setRowLanguage,
    setInkSaving,
    print,
  }
}
