import { describe, expect, it, vi } from 'vitest'

import {
  createWorkspaceStorage,
  WORKSPACE_STORAGE_KEY,
  type WorkspaceSnapshot,
  type WorkspaceStorageLike,
} from '@/services/workspace-storage'

const snapshot: WorkspaceSnapshot = {
  rawList: 'Lightning Bolt',
  rows: [
    {
      id: 'row-1',
      sourceLine: 1,
      name: 'Lightning Bolt',
      queryName: 'Lightning Bolt',
      quantity: 2,
      setCode: 'lea',
      collectorNumber: '161',
      status: 'resolved',
      errorMessage: '',
      printings: [
        {
          id: 'printing-1',
          name: 'Lightning Bolt',
          setCode: 'lea',
          setName: 'Limited Edition Alpha',
          collectorNumber: '161',
          language: 'en',
          imageUri: 'https://example.com/card.jpg',
        },
      ],
      loadedLanguages: ['en', 'es'],
      selectedPrintingId: 'printing-1',
      languageOverride: '',
    },
  ],
  parseErrors: [],
  failedEntryCount: 0,
  globalLanguage: 'es',
  inkSaving: false,
}

function createMemoryStorage(): WorkspaceStorageLike & {
  values: Map<string, string>
} {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  }
}

describe('workspace storage', () => {
  it('saves and restores a versioned workspace snapshot', () => {
    const memory = createMemoryStorage()
    const storage = createWorkspaceStorage(memory)

    expect(storage.save(snapshot)).toBe('success')
    expect(memory.values.get(WORKSPACE_STORAGE_KEY)).toContain('"version":1')
    expect(storage.load()).toEqual({ status: 'restored', snapshot })
  })

  it('reports an empty store', () => {
    const storage = createWorkspaceStorage(createMemoryStorage())

    expect(storage.load()).toEqual({ status: 'empty' })
  })

  it('rejects malformed JSON and invalid workspace fields', () => {
    const memory = createMemoryStorage()
    const storage = createWorkspaceStorage(memory)

    memory.values.set(WORKSPACE_STORAGE_KEY, '{')
    expect(storage.load()).toEqual({
      status: 'invalid',
      reason: 'malformed',
    })

    memory.values.set(
      WORKSPACE_STORAGE_KEY,
      JSON.stringify({ version: 1, workspace: { ...snapshot, rows: [{}] } }),
    )
    expect(storage.load()).toEqual({
      status: 'invalid',
      reason: 'malformed',
    })
  })

  it('reports an unsupported envelope version without clearing it', () => {
    const memory = createMemoryStorage()
    const storage = createWorkspaceStorage(memory)
    const unsupportedData = JSON.stringify({ version: 2, workspace: snapshot })
    memory.values.set(WORKSPACE_STORAGE_KEY, unsupportedData)

    expect(storage.load()).toEqual({
      status: 'invalid',
      reason: 'unsupported-version',
    })
    expect(memory.values.get(WORKSPACE_STORAGE_KEY)).toBe(unsupportedData)
  })

  it('reports read, write, and clear storage failures', () => {
    const storageFailure = new Error('Storage unavailable')
    const failingStorage: WorkspaceStorageLike = {
      getItem: vi.fn(() => {
        throw storageFailure
      }),
      setItem: vi.fn(() => {
        throw storageFailure
      }),
      removeItem: vi.fn(() => {
        throw storageFailure
      }),
    }
    const storage = createWorkspaceStorage(failingStorage)

    expect(storage.load()).toEqual({ status: 'unavailable' })
    expect(storage.save(snapshot)).toBe('unavailable')
    expect(storage.clear()).toBe('unavailable')
  })
})
