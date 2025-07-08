import { TokenManager } from '../token-manager'

describe('TokenManager', () => {
  describe('generateSessionToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = TokenManager.generateSessionToken()
      expect(token).toMatch(/^[a-f0-9]{64}$/)
    })

    it('should generate unique tokens', () => {
      const token1 = TokenManager.generateSessionToken()
      const token2 = TokenManager.generateSessionToken()
      expect(token1).not.toBe(token2)
    })
  })

  describe('generateState', () => {
    it('should generate a base64url string', () => {
      const state = TokenManager.generateState()
      expect(state).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate unique states', () => {
      const state1 = TokenManager.generateState()
      const state2 = TokenManager.generateState()
      expect(state1).not.toBe(state2)
    })
  })

  describe('generateCodeVerifier', () => {
    it('should generate a base64url string', () => {
      const verifier = TokenManager.generateCodeVerifier()
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate unique verifiers', () => {
      const verifier1 = TokenManager.generateCodeVerifier()
      const verifier2 = TokenManager.generateCodeVerifier()
      expect(verifier1).not.toBe(verifier2)
    })
  })

  describe('extractTokens', () => {
    it('should extract tokens from response object', () => {
      const mockResponse = {
        accessToken: () => 'test-access-token',
        refreshToken: () => 'test-refresh-token',
        accessTokenExpiresAt: () => new Date(Date.now() + 3600000),
      }

      const tokens = TokenManager.extractTokens(mockResponse)
      
      expect(tokens.accessToken).toBe('test-access-token')
      expect(tokens.refreshToken).toBe('test-refresh-token')
      expect(tokens.expiresAt).toBeInstanceOf(Date)
    })

    it('should handle null refresh token', () => {
      const mockResponse = {
        accessToken: () => 'test-access-token',
        refreshToken: () => null,
        accessTokenExpiresAt: () => null,
      }

      const tokens = TokenManager.extractTokens(mockResponse)
      
      expect(tokens.accessToken).toBe('test-access-token')
      expect(tokens.refreshToken).toBeNull()
      expect(tokens.expiresAt).toBeNull()
    })
  })

  describe('isTokenExpired', () => {
    it('should return false for null expiry', () => {
      expect(TokenManager.isTokenExpired(null)).toBe(false)
    })

    it('should return true for expired token', () => {
      const pastDate = new Date(Date.now() - 1000)
      expect(TokenManager.isTokenExpired(pastDate)).toBe(true)
    })

    it('should return false for valid token', () => {
      const futureDate = new Date(Date.now() + 3600000)
      expect(TokenManager.isTokenExpired(futureDate)).toBe(false)
    })
  })

  describe('calculateTokenExpiry', () => {
    it('should calculate correct expiry date', () => {
      const expiresIn = 3600 // 1 hour in seconds
      const expiry = TokenManager.calculateTokenExpiry(expiresIn)
      
      const expectedTime = Date.now() + (expiresIn * 1000)
      const actualTime = expiry.getTime()
      
      // Allow 100ms tolerance for test execution time
      expect(Math.abs(actualTime - expectedTime)).toBeLessThan(100)
    })
  })
})