import '@testing-library/jest-dom'
import { vi, beforeEach } from 'vitest'

// Ensure history is polyfilled globally for vue-router
if (typeof window !== 'undefined' && typeof window.history !== 'undefined') {
  try {
    Object.defineProperty(globalThis, 'history', {
      value: window.history,
      writable: true,
      configurable: true
    })
    Object.defineProperty(global, 'history', {
      value: window.history,
      writable: true,
      configurable: true
    })
  } catch {
    // fallback
    ;(globalThis as any).history = window.history
  }
}

// Mock sweetalert2 globally
vi.mock('sweetalert2', () => {
  const fire = vi.fn().mockImplementation(async () => ({
    isConfirmed: true,
    isDismissed: false,
    value: true
  }))
  return {
    default: {
      fire
    },
    fire
  }
})

// Mock window.matchMedia if not implemented in jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  })
}

// Default mock for global.fetch to prevent unhandled rejections during lifecycle hooks
const defaultMockResponse = {
  status: 'success',
  message: 'OK',
  data: {
    cash_flows: [],
    cash_flow: null,
    stats: {},
    labels: [],
    users: [],
    user: { id: 1, name: 'Delcom Testing', email: 'test@delcom.org' }
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  if (typeof localStorage !== 'undefined') {
    localStorage.clear()
  }

  // Restore safe default fetch
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: async () => defaultMockResponse,
    text: async () => JSON.stringify(defaultMockResponse)
  } as any)
})
