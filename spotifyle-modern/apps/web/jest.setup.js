// Add custom jest matchers from jest-dom
import '@testing-library/jest-dom'

// Mock environment variables for tests
process.env.NODE_ENV = 'test'
process.env.SPOTIFY_CLIENT_ID = 'test-client-id'
process.env.SPOTIFY_CLIENT_SECRET = 'test-client-secret'
process.env.DATABASE_URL = 'postgresql://test'
process.env.NEXTAUTH_URL = 'http://127.0.0.1:3000'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-tests-that-is-long-enough'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '',
      query: {},
      asPath: '',
    }
  },
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

// Mock cookies
jest.mock('cookies-next', () => ({
  getCookie: jest.fn(),
  setCookie: jest.fn(),
  deleteCookie: jest.fn(),
}))

// Suppress console errors during tests unless explicitly testing error handling
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})