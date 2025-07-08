/**
 * Jest setup for handling React 19 compatibility
 */

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock Element.prototype methods for Radix UI
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = jest.fn()
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = jest.fn()
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = jest.fn()
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = jest.fn()
}

// No longer need React 19 workarounds with React 18

// Suppress expected console errors in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Ignore expected error boundaries
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Error: Uncaught [Error:') ||
       args[0].includes('The above error occurred'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test timeout
jest.setTimeout(10000)

export {}