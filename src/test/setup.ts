// ============================================================================
// TEST SETUP
// Global test configuration and mocks
// ============================================================================

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Mock window.matchMedia (for theme detection)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver (used by some UI libraries)
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock crypto.randomUUID (for generating IDs)
if (!global.crypto) {
  global.crypto = {} as Crypto
}
global.crypto.randomUUID = vi.fn(() => 'test-uuid-' + Math.random().toString(36).substring(7)) as any

// Mock localStorage (for Zustand persist middleware)
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock DragEvent (for drag-and-drop tests)
class MockDragEvent extends Event {
  dataTransfer: DataTransfer

  constructor(type: string, options?: EventInit) {
    super(type, options)
    this.dataTransfer = {
      dropEffect: 'none',
      effectAllowed: 'all',
      files: [] as unknown as FileList,
      items: [] as unknown as DataTransferItemList,
      types: [],
      clearData: vi.fn(),
      getData: vi.fn(() => ''),
      setData: vi.fn(),
      setDragImage: vi.fn(),
    } as DataTransfer
  }
}

global.DragEvent = MockDragEvent as any

// Cleanup after each test
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  localStorageMock.clear()
})
