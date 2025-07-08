import { CookieManager } from '../cookie-manager'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'

// Mock the cookies-next module
jest.mock('cookies-next')

describe('CookieManager', () => {
  const mockGetCookie = getCookie as jest.MockedFunction<typeof getCookie>
  const mockSetCookie = setCookie as jest.MockedFunction<typeof setCookie>
  const mockDeleteCookie = deleteCookie as jest.MockedFunction<typeof deleteCookie>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Session Cookie Methods', () => {
    it('should set session cookie with correct options', () => {
      const token = 'test-session-token'
      CookieManager.setSessionCookie(token)

      expect(mockSetCookie).toHaveBeenCalledWith(
        'session',
        token,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 30 * 24 * 60 * 60,
        })
      )
    })

    it('should get session cookie', () => {
      mockGetCookie.mockReturnValue('test-session-token')
      
      const result = CookieManager.getSessionCookie()
      
      expect(mockGetCookie).toHaveBeenCalledWith('session')
      expect(result).toBe('test-session-token')
    })

    it('should return undefined when no session cookie exists', () => {
      mockGetCookie.mockReturnValue(undefined)
      
      const result = CookieManager.getSessionCookie()
      
      expect(result).toBeUndefined()
    })

    it('should delete session cookie', () => {
      CookieManager.deleteSessionCookie()
      
      expect(mockDeleteCookie).toHaveBeenCalledWith('session')
    })
  })

  describe('Code Verifier Methods', () => {
    it('should set code verifier with correct options', () => {
      const verifier = 'test-code-verifier'
      CookieManager.setCodeVerifier(verifier)

      expect(mockSetCookie).toHaveBeenCalledWith(
        'spotify_code_verifier',
        verifier,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 600,
        })
      )
    })

    it('should get code verifier', () => {
      mockGetCookie.mockReturnValue('test-code-verifier')
      
      const result = CookieManager.getCodeVerifier()
      
      expect(mockGetCookie).toHaveBeenCalledWith('spotify_code_verifier')
      expect(result).toBe('test-code-verifier')
    })

    it('should delete code verifier', () => {
      CookieManager.deleteCodeVerifier()
      
      expect(mockDeleteCookie).toHaveBeenCalledWith('spotify_code_verifier')
    })
  })

  describe('State Methods', () => {
    it('should set state with correct options', () => {
      const state = 'test-state'
      CookieManager.setState(state)

      expect(mockSetCookie).toHaveBeenCalledWith(
        'spotify_auth_state',
        state,
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 600,
        })
      )
    })

    it('should get state', () => {
      mockGetCookie.mockReturnValue('test-state')
      
      const result = CookieManager.getState()
      
      expect(mockGetCookie).toHaveBeenCalledWith('spotify_auth_state')
      expect(result).toBe('test-state')
    })

    it('should delete state', () => {
      CookieManager.deleteState()
      
      expect(mockDeleteCookie).toHaveBeenCalledWith('spotify_auth_state')
    })
  })

  describe('clearAuthCookies', () => {
    it('should delete both code verifier and state cookies', () => {
      CookieManager.clearAuthCookies()
      
      expect(mockDeleteCookie).toHaveBeenCalledWith('spotify_code_verifier')
      expect(mockDeleteCookie).toHaveBeenCalledWith('spotify_auth_state')
      expect(mockDeleteCookie).toHaveBeenCalledTimes(2)
    })
  })
})