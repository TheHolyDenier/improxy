import { computed, ref } from 'vue'

import { CardListParser } from '@/domain/card-list-parser'
import type { CardRowState } from '@/domain/card'
import { ProxySheetComposer } from '@/domain/proxy-sheet'
import { defaultCardLanguage, i18n } from '@/i18n'
import { ScryfallClient } from '@/services/scryfall-client'

type ScryfallSearchClient = Pick<ScryfallClient, 'searchPrintings'>
const SEARCH_INTERVAL_MS = 150

const wait = (duration: number) =>
  new Promise<void>((resolve) => globalThis.setTimeout(resolve, duration))

const findPrintingForLanguage = (
  printings: CardRowState['printings'],
  language: string,
) => printings.find((printing) => printing.language === language)

const findCanonicalPrinting = (printings: CardRowState['printings']) =>
  findPrintingForLanguage(printings, 'en') ?? printings[0]

const findPrintingWithFallback = (
  printings: CardRowState['printings'],
  language: string,
) =>
  findPrintingForLanguage(printings, language) ??
  findPrintingForLanguage(printings, 'en')

const findPrintingInEdition = (
  printings: CardRowState['printings'],
  selectedPrintingId: string,
  language: string,
) => {
  const selected = printings.find(
    (printing) => printing.id === selectedPrintingId,
  )
  if (!selected) {
    return undefined
  }

  const sameEdition = printings.filter(
    (printing) =>
      printing.setCode === selected.setCode &&
      printing.collectorNumber === selected.collectorNumber,
  )
  return (
    findPrintingForLanguage(sameEdition, language) ??
    findPrintingForLanguage(sameEdition, 'en') ??
    sameEdition[0]
  )
}

const applyPrintingsToRow = (
  row: CardRowState,
  printings: CardRowState['printings'],
  language: string,
  preserveEdition = false,
) => {
  const preferred =
    (preserveEdition
      ? findPrintingInEdition(printings, row.selectedPrintingId, language)
      : undefined) ?? findPrintingWithFallback(printings, language)
  row.printings = printings
  row.name = findCanonicalPrinting(printings)?.name ?? preferred?.name ?? ''
  row.selectedPrintingId = preferred?.id ?? ''
}

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
  name: '',
  queryName: name,
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
  const failedEntryCount = ref(0)
  const isLoading = ref(false)
  const globalLanguage = ref(defaultCardLanguage)
  const inkSaving = ref(false)
  const searchRequests = new Map<string, Promise<void>>()
  const searchTimers = new Map<string, ReturnType<typeof setTimeout>>()
  const searchVersions = new Map<string, number>()
  let searchQueue = Promise.resolve()
  let hasQueuedSearch = false

  function enqueueSearch<T>(request: () => Promise<T>) {
    const queuedSearch = searchQueue.then(async () => {
      if (hasQueuedSearch) {
        await wait(SEARCH_INTERVAL_MS)
      }
      hasQueuedSearch = true
      return request()
    })
    searchQueue = queuedSearch.then(
      () => undefined,
      () => undefined,
    )
    return queuedSearch
  }

  function rejectRow(row: CardRowState, message: string) {
    row.status = 'error'
    row.errorMessage = message
    row.printings = []
    row.selectedPrintingId = ''
    parseErrors.value = appendUniqueErrors(parseErrors.value, [message])
    rows.value = rows.value.filter((candidate) => candidate !== row)
  }

  function getSearchLabel(row: CardRowState) {
    if (row.queryName.trim()) {
      return row.queryName.trim()
    }

    return `e:${row.setCode.toUpperCase()} cn:${row.collectorNumber.trim()}`
  }

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
      failedEntryCount.value +
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
  const visibleRows = computed(() =>
    rows.value.filter((row) => row.status !== 'error'),
  )

  async function importList() {
    if (isLoading.value) {
      return
    }

    isLoading.value = true
    try {
      const result = parser.parse(rawList.value)
      parseErrors.value = result.errors.map((error) =>
        i18n.global.t('errors.parseLine', {
          line: error.line,
          message: error.message,
        }),
      )
      failedEntryCount.value = result.errors.length
      rows.value = []
      for (const entry of result.entries) {
        const row = await resolveEntry(entry)
        if (row) {
          rows.value = [...rows.value, row]
        } else {
          failedEntryCount.value += 1
        }
      }
    } finally {
      isLoading.value = false
    }
  }

  async function resolveEntry(entry: {
    name: string
    quantity: number
    setCode: string
    collectorNumber: string
    sourceLine: number
  }): Promise<CardRowState | null> {
    const searchLabel = entry.name.trim()
      ? entry.name.trim()
      : `e:${entry.setCode.toUpperCase()} cn:${entry.collectorNumber.trim()}`

    try {
      const printings = await enqueueSearch(() =>
        client.searchPrintings(
          entry.name,
          entry.setCode,
          globalLanguage.value,
          entry.collectorNumber,
        ),
      )
      if (!printings.length) {
        parseErrors.value = appendUniqueErrors(parseErrors.value, [
          i18n.global.t('errors.notFoundNamed', { name: searchLabel }),
        ])
        return null
      }

      const row = createRow(
        entry.name,
        entry.quantity,
        entry.setCode,
        entry.collectorNumber,
        entry.sourceLine,
      )
      applyPrintingsToRow(row, printings, globalLanguage.value)
      row.status = 'resolved'
      return row
    } catch {
      parseErrors.value = appendUniqueErrors(parseErrors.value, [
        i18n.global.t('errors.searchFailedNamed', { name: searchLabel }),
      ])
      return null
    }
  }

  async function searchRow(
    row: CardRowState,
    language = row.languageOverride || globalLanguage.value,
  ) {
    if (!row.queryName.trim() && !(row.setCode && row.collectorNumber)) {
      rejectRow(row, i18n.global.t('errors.missingName'))
      return
    }

    const searchLabel = getSearchLabel(row)
    const searchName = row.name.trim() || row.queryName.trim()
    const requestKey = [
      row.id,
      language,
      searchName.toLowerCase(),
      row.setCode.toLowerCase(),
      row.collectorNumber.trim(),
    ].join('::')
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
        const printings = await enqueueSearch(() =>
          client.searchPrintings(
            searchName,
            row.setCode,
            language,
            row.collectorNumber,
          ),
        )
        if (searchVersions.get(row.id) !== version) {
          return
        }
        applyPrintingsToRow(
          row,
          printings,
          row.languageOverride || globalLanguage.value,
          true,
        )
        if (!printings.length) {
          rejectRow(
            row,
            i18n.global.t('errors.notFoundNamed', { name: searchLabel }),
          )
        } else {
          row.status = 'resolved'
          row.errorMessage = ''
        }
      } catch {
        if (searchVersions.get(row.id) !== version) {
          return
        }
        rejectRow(
          row,
          i18n.global.t('errors.searchFailedNamed', { name: searchLabel }),
        )
      } finally {
        searchRequests.delete(requestKey)
      }
    })()
    searchRequests.set(requestKey, request)
    await request
  }

  function scheduleSearch(row: CardRowState) {
    const existingTimer = searchTimers.get(row.id)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    if (!row.queryName.trim()) {
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
      ('queryName' in patch && patch.queryName !== row.queryName) ||
      ('setCode' in patch && patch.setCode !== row.setCode) ||
      ('collectorNumber' in patch &&
        patch.collectorNumber !== row.collectorNumber)
    Object.assign(row, patch)
    if (searchChanged) {
      searchVersions.set(row.id, (searchVersions.get(row.id) ?? 0) + 1)
      row.status = 'idle'
      row.printings = []
      row.selectedPrintingId = ''
      row.name = ''
      row.errorMessage = ''
      scheduleSearch(row)
    }
  }

  async function addCardFromSyntax(value: string): Promise<boolean> {
    if (isLoading.value) {
      return false
    }

    isLoading.value = true
    const sourceLine = rawList.value.trim()
      ? rawList.value.trim().split(/\r?\n/).length + 1
      : 1
    try {
      const result = parser.parse(value)
      if (result.errors.length || result.entries.length !== 1) {
        const messages = result.errors.map((error) =>
          i18n.global.t('errors.parseLine', {
            line: sourceLine,
            message: error.message,
          }),
        )
        if (result.entries.length !== 1) {
          messages.push(i18n.global.t('errors.quickAddSingle'))
        }
        parseErrors.value = appendUniqueErrors(parseErrors.value, messages)
        failedEntryCount.value += 1
        return false
      }

      const entry = result.entries[0]
      if (!entry) {
        failedEntryCount.value += 1
        return false
      }
      const row = await resolveEntry({
        ...entry,
        sourceLine,
      })
      if (!row) {
        failedEntryCount.value += 1
        return false
      }

      rawList.value = rawList.value.trim()
        ? `${rawList.value.trim()}\n${value}`
        : value
      rows.value.push(row)
      return true
    } finally {
      isLoading.value = false
    }
  }

  function removeRow(rowId: string) {
    rows.value = rows.value.filter((row) => row.id !== rowId)
  }

  function setGlobalLanguage(language: string) {
    globalLanguage.value = language
    rows.value.forEach((row) => {
      if (!row.languageOverride) {
        applyPrintingsToRow(row, row.printings, language, true)
      }
    })
  }

  function setRowLanguage(rowId: string, language: string) {
    const row = rows.value.find((candidate) => candidate.id === rowId)
    if (!row) {
      return
    }

    row.languageOverride = language
    applyPrintingsToRow(row, row.printings, language, true)
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
    visibleRows,
    parseErrors,
    globalLanguage,
    inkSaving,
    totalCopies,
    unresolvedCount,
    pages,
    readyToPrint,
    isLoading,
    importList,
    searchRow,
    updateRow,
    addCardFromSyntax,
    removeRow,
    setGlobalLanguage,
    setRowLanguage,
    setInkSaving,
    print,
  }
}
