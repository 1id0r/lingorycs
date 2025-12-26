import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock fetch globally
global.fetch = jest.fn()

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.getItem.mockReset()
  localStorageMock.setItem.mockReset()
  localStorageMock.removeItem.mockReset()
})

// Suppress console errors during tests (optional - can be removed if you want to see them)
const originalError = console.error
beforeAll(() => {
  console.error = (...args: Parameters<typeof console.error>) => {
    // Only suppress expected test errors
    if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})
