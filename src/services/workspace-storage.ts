import type { CardRowState, RowStatus, ScryfallPrinting } from '@/domain/card'

export interface WorkspaceSnapshot {
  rawList: string
  rows: CardRowState[]
  parseErrors: string[]
  failedEntryCount: number
  globalLanguage: string
  inkSaving: boolean
}

export interface WorkspaceStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export const WORKSPACE_STORAGE_KEY = 'improxy.workspace'
const WORKSPACE_STORAGE_VERSION = 1
const rowStatuses = ['idle', 'loading', 'resolved', 'error'] as const

type InvalidWorkspaceReason = 'malformed' | 'unsupported-version'

export type WorkspaceLoadResult =
  | { status: 'empty' }
  | { status: 'restored'; snapshot: WorkspaceSnapshot }
  | { status: 'invalid'; reason: InvalidWorkspaceReason }
  | { status: 'unavailable' }

export type WorkspaceStorageResult = 'success' | 'unavailable'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

const isRowStatus = (value: unknown): value is RowStatus =>
  rowStatuses.some((status) => status === value)

const isPrinting = (value: unknown): value is ScryfallPrinting =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.setCode === 'string' &&
  typeof value.setName === 'string' &&
  typeof value.collectorNumber === 'string' &&
  typeof value.language === 'string' &&
  typeof value.imageUri === 'string'

const isRow = (value: unknown): value is CardRowState =>
  isRecord(value) &&
  typeof value.id === 'string' &&
  typeof value.sourceLine === 'number' &&
  Number.isInteger(value.sourceLine) &&
  value.sourceLine >= 0 &&
  typeof value.name === 'string' &&
  typeof value.queryName === 'string' &&
  typeof value.quantity === 'number' &&
  Number.isInteger(value.quantity) &&
  value.quantity > 0 &&
  typeof value.setCode === 'string' &&
  typeof value.collectorNumber === 'string' &&
  isRowStatus(value.status) &&
  typeof value.errorMessage === 'string' &&
  Array.isArray(value.printings) &&
  value.printings.every(isPrinting) &&
  isStringArray(value.loadedLanguages) &&
  typeof value.selectedPrintingId === 'string' &&
  typeof value.languageOverride === 'string' &&
  (!value.selectedPrintingId ||
    value.printings.some(
      (printing) => printing.id === value.selectedPrintingId,
    ))

const isSnapshot = (value: unknown): value is WorkspaceSnapshot =>
  isRecord(value) &&
  typeof value.rawList === 'string' &&
  Array.isArray(value.rows) &&
  value.rows.every(isRow) &&
  isStringArray(value.parseErrors) &&
  typeof value.failedEntryCount === 'number' &&
  Number.isInteger(value.failedEntryCount) &&
  value.failedEntryCount >= 0 &&
  typeof value.globalLanguage === 'string' &&
  typeof value.inkSaving === 'boolean'

export function createWorkspaceStorage(storage?: WorkspaceStorageLike) {
  function getStorage() {
    return storage ?? globalThis.localStorage
  }

  function load(): WorkspaceLoadResult {
    let serialized: string | null
    try {
      serialized = getStorage().getItem(WORKSPACE_STORAGE_KEY)
    } catch {
      return { status: 'unavailable' }
    }

    if (serialized === null) {
      return { status: 'empty' }
    }

    let envelope: unknown
    try {
      envelope = JSON.parse(serialized)
    } catch {
      return { status: 'invalid', reason: 'malformed' }
    }

    if (!isRecord(envelope) || typeof envelope.version !== 'number') {
      return { status: 'invalid', reason: 'malformed' }
    }
    if (envelope.version !== WORKSPACE_STORAGE_VERSION) {
      return { status: 'invalid', reason: 'unsupported-version' }
    }
    if (!isSnapshot(envelope.workspace)) {
      return { status: 'invalid', reason: 'malformed' }
    }

    return { status: 'restored', snapshot: envelope.workspace }
  }

  function save(snapshot: WorkspaceSnapshot): WorkspaceStorageResult {
    try {
      const envelope = JSON.stringify({
        version: WORKSPACE_STORAGE_VERSION,
        workspace: snapshot,
      })
      getStorage().setItem(WORKSPACE_STORAGE_KEY, envelope)
      return 'success'
    } catch {
      return 'unavailable'
    }
  }

  function clear(): WorkspaceStorageResult {
    try {
      getStorage().removeItem(WORKSPACE_STORAGE_KEY)
      return 'success'
    } catch {
      return 'unavailable'
    }
  }

  return { load, save, clear }
}
