/**
 * Tests for SpotifyTokenManager
 */

import { SpotifyTokenManager, MemoryTokenStorage } from '../token-manager'
import { SpotifyAuthError } from '../../types/client'
import type { SpotifyClientConfig, SpotifyTokens } from '../../types/client'

// Mock fetch globally
global.fetch = jest.fn()

describe('SpotifyTokenManager', () => {
  let tokenManager: SpotifyTokenManager
  let storage: MemoryTokenStorage
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  const config: SpotifyClientConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['user-read-private', 'user-top-read']
  }

  const validTokens: SpotifyTokens = {
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    expiresAt: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    scope: 'user-read-private user-top-read'
  }

  beforeEach(() => {
    storage = new MemoryTokenStorage()
    tokenManager = new SpotifyTokenManager(config, storage)
    mockFetch.mockClear()
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
    storage.clear()
  })

  describe('getValidAccessToken', () => {
    it('should return valid tokens without refresh', async () => {
      await storage.set('user123', validTokens)

      const result = await tokenManager.getValidAccessToken('user123')

      expect(result.tokens).toEqual(validTokens)
      expect(result.wasRefreshed).toBe(false)
      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should refresh expired tokens', async () => {
      const expiredTokens: SpotifyTokens = {
        ...validTokens,
        expiresAt: Math.floor(Date.now() / 1000) - 3600 // 1 hour ago
      }
      
      await storage.set('user123', expiredTokens)

      const newTokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        scope: 'user-read-private user-top-read'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => newTokenResponse
      } as Response)

      const result = await tokenManager.getValidAccessToken('user123')

      expect(result.wasRefreshed).toBe(true)
      expect(result.tokens.accessToken).toBe('new-access-token')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }),
          body: expect.any(URLSearchParams)
        })
      )
    })

    it('should refresh tokens with buffer time', async () => {
      const soonToExpireTokens: SpotifyTokens = {
        ...validTokens,
        expiresAt: Math.floor(Date.now() / 1000) + 60 // 1 minute from now (within 5min buffer)
      }
      
      await storage.set('user123', soonToExpireTokens)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          access_token: 'refreshed-token',
          refresh_token: 'new-refresh-token',
          expires_in: 3600,
          scope: 'user-read-private user-top-read'
        })
      } as Response)

      const result = await tokenManager.getValidAccessToken('user123')

      expect(result.wasRefreshed).toBe(true)
      expect(mockFetch).toHaveBeenCalled()
    })

    it('should throw error when no tokens found', async () => {
      await expect(tokenManager.getValidAccessToken('nonexistent'))
        .rejects.toThrow(SpotifyAuthError)
    })

    it('should throw error when no refresh token available', async () => {
      const tokensWithoutRefresh: SpotifyTokens = {
        ...validTokens,
        refreshToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 3600
      }
      
      await storage.set('user123', tokensWithoutRefresh)

      await expect(tokenManager.getValidAccessToken('user123'))
        .rejects.toThrow(SpotifyAuthError)
    })

    it('should handle refresh token failure', async () => {
      const expiredTokens: SpotifyTokens = {
        ...validTokens,
        expiresAt: Math.floor(Date.now() / 1000) - 3600
      }
      
      await storage.set('user123', expiredTokens)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Refresh token has been revoked'
        })
      } as Response)

      await expect(tokenManager.getValidAccessToken('user123'))
        .rejects.toThrow(SpotifyAuthError)

      // Should remove tokens after failed refresh
      const storedTokens = await storage.get('user123')
      expect(storedTokens).toBeNull()
    })
  })

  describe('exchangeCodeForTokens', () => {
    it('should exchange authorization code for tokens', async () => {
      const tokenResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
        expires_in: 3600,
        scope: 'user-read-private user-top-read'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => tokenResponse
      } as Response)

      const tokens = await tokenManager.exchangeCodeForTokens('user123', 'auth-code')

      expect(tokens.accessToken).toBe('new-access-token')
      expect(tokens.refreshToken).toBe('new-refresh-token')
      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token',
        expect.objectContaining({
          body: expect.any(URLSearchParams)
        })
      )

      // Should store tokens
      const storedTokens = await storage.get('user123')
      expect(storedTokens).toEqual(tokens)
    })

    it('should handle code exchange failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_grant',
          error_description: 'Authorization code has expired'
        })
      } as Response)

      await expect(tokenManager.exchangeCodeForTokens('user123', 'invalid-code'))
        .rejects.toThrow(SpotifyAuthError)
    })

    it('should handle missing refresh token in response', async () => {
      const tokenResponse = {
        access_token: 'access-token-only',
        expires_in: 3600,
        scope: 'user-read-private'
        // No refresh_token
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => tokenResponse
      } as Response)

      const tokens = await tokenManager.exchangeCodeForTokens('user123', 'auth-code')

      expect(tokens.accessToken).toBe('access-token-only')
      expect(tokens.refreshToken).toBeNull()
    })
  })

  describe('revokeTokens', () => {
    it('should revoke tokens and remove from storage', async () => {
      await storage.set('user123', validTokens)

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200
      } as Response)

      await tokenManager.revokeTokens('user123')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://accounts.spotify.com/api/token/revoke',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(URLSearchParams)
        })
      )

      const storedTokens = await storage.get('user123')
      expect(storedTokens).toBeNull()
    })

    it('should remove tokens even if revocation fails', async () => {
      await storage.set('user123', validTokens)

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      } as Response)

      await tokenManager.revokeTokens('user123')

      // Should still remove from storage
      const storedTokens = await storage.get('user123')
      expect(storedTokens).toBeNull()
    })

    it('should handle missing tokens gracefully', async () => {
      // Should not throw when no tokens exist
      await expect(tokenManager.revokeTokens('nonexistent'))
        .resolves.not.toThrow()
    })
  })

  describe('hasValidTokens', () => {
    it('should return true for valid tokens', async () => {
      await storage.set('user123', validTokens)

      const hasValid = await tokenManager.hasValidTokens('user123')
      expect(hasValid).toBe(true)
    })

    it('should return false for expired tokens without refresh', async () => {
      const expiredTokens: SpotifyTokens = {
        ...validTokens,
        refreshToken: null,
        expiresAt: Math.floor(Date.now() / 1000) - 3600
      }
      
      await storage.set('user123', expiredTokens)

      const hasValid = await tokenManager.hasValidTokens('user123')
      expect(hasValid).toBe(false)
    })

    it('should return false for nonexistent user', async () => {
      const hasValid = await tokenManager.hasValidTokens('nonexistent')
      expect(hasValid).toBe(false)
    })
  })

  describe('getAuthorizationUrl', () => {
    it('should generate correct authorization URL', () => {
      const url = tokenManager.getAuthorizationUrl('test-state')

      expect(url).toContain('https://accounts.spotify.com/authorize')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback')
      expect(url).toContain('scope=user-read-private')
      expect(url).toContain('state=test-state')
      expect(url).toContain('response_type=code')
    })

    it('should generate URL without state parameter', () => {
      const url = tokenManager.getAuthorizationUrl()

      expect(url).toContain('https://accounts.spotify.com/authorize')
      expect(url).not.toContain('state=')
    })
  })

  describe('validateTokenScope', () => {
    it('should return true when all required scopes are present', () => {
      const isValid = tokenManager.validateTokenScope(
        validTokens,
        ['user-read-private']
      )
      expect(isValid).toBe(true)
    })

    it('should return false when required scopes are missing', () => {
      const isValid = tokenManager.validateTokenScope(
        validTokens,
        ['user-read-private', 'playlist-modify-public']
      )
      expect(isValid).toBe(false)
    })

    it('should handle empty scope requirements', () => {
      const isValid = tokenManager.validateTokenScope(validTokens, [])
      expect(isValid).toBe(true)
    })
  })

  describe('getTokenLifetime', () => {
    it('should return correct lifetime for valid tokens', () => {
      const lifetime = tokenManager.getTokenLifetime(validTokens)
      expect(lifetime).toBeGreaterThan(3500) // Should be close to 3600
      expect(lifetime).toBeLessThanOrEqual(3600)
    })

    it('should return 0 for expired tokens', () => {
      const expiredTokens: SpotifyTokens = {
        ...validTokens,
        expiresAt: Math.floor(Date.now() / 1000) - 100
      }
      
      const lifetime = tokenManager.getTokenLifetime(expiredTokens)
      expect(lifetime).toBe(0)
    })
  })
})

describe('MemoryTokenStorage', () => {
  let storage: MemoryTokenStorage

  beforeEach(() => {
    storage = new MemoryTokenStorage()
  })

  afterEach(() => {
    storage.clear()
  })

  it('should store and retrieve tokens', async () => {
    const tokens: SpotifyTokens = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() + 3600000,
      scope: 'test-scope'
    }

    await storage.set('user123', tokens)
    const retrieved = await storage.get('user123')

    expect(retrieved).toEqual(tokens)
  })

  it('should return null for nonexistent keys', async () => {
    const result = await storage.get('nonexistent')
    expect(result).toBeNull()
  })

  it('should delete tokens', async () => {
    const tokens: SpotifyTokens = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() + 3600000,
      scope: 'test-scope'
    }

    await storage.set('user123', tokens)
    await storage.delete('user123')
    
    const result = await storage.get('user123')
    expect(result).toBeNull()
  })

  it('should clear all tokens', async () => {
    const tokens: SpotifyTokens = {
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      expiresAt: Date.now() + 3600000,
      scope: 'test-scope'
    }

    await storage.set('user1', tokens)
    await storage.set('user2', tokens)
    
    expect(storage.size()).toBe(2)
    
    storage.clear()
    expect(storage.size()).toBe(0)
  })
})