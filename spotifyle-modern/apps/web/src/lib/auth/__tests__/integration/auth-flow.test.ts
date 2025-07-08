import { AuthService } from '../../auth-service'
import { CookieManager } from '../../cookie-manager'
import { SpotifyClient } from '../../spotify-client'
import { DatabaseService } from '../../db-service'
import { OAuthError } from '@/types/auth'

// Mock dependencies
jest.mock('../../cookie-manager')
jest.mock('../../spotify-client')
jest.mock('../../db-service')
jest.mock('arctic', () => ({
  Spotify: jest.fn().mockImplementation(() => ({
    createAuthorizationURL: jest.fn().mockResolvedValue(new URL('https://accounts.spotify.com/authorize')),
    validateAuthorizationCode: jest.fn().mockResolvedValue({
      accessToken: () => 'mock-access-token',
      refreshToken: () => 'mock-refresh-token',
      accessTokenExpiresAt: () => Date.now() + 3600000,
    }),
  })),
  generateState: jest.fn().mockReturnValue('mock-state'),
  generateCodeVerifier: jest.fn().mockReturnValue('mock-verifier'),
}))

describe('AuthService Integration Tests', () => {
  const mockCookieManager = CookieManager as jest.Mocked<typeof CookieManager>
  const mockSpotifyClient = SpotifyClient as jest.Mocked<typeof SpotifyClient>
  const mockDatabaseService = DatabaseService as jest.Mocked<typeof DatabaseService>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Complete OAuth Flow', () => {
    it('should complete the entire OAuth flow successfully', async () => {
      // Step 1: Create authorization URL
      const authUrl = await AuthService.createAuthorizationURL()
      
      expect(authUrl).toContain('https://accounts.spotify.com/authorize')
      expect(mockCookieManager.setState).toHaveBeenCalledWith('mock-state')
      expect(mockCookieManager.setCodeVerifier).toHaveBeenCalledWith('mock-verifier')

      // Step 2: Handle callback
      mockCookieManager.getState.mockReturnValue('mock-state')
      mockCookieManager.getCodeVerifier.mockReturnValue('mock-verifier')
      
      mockSpotifyClient.fetchUserProfile.mockResolvedValue({
        id: 'spotify-user-id',
        display_name: 'Test User',
        email: 'test@example.com',
        images: [{ url: 'https://example.com/avatar.jpg', height: 300, width: 300 }],
      })

      mockDatabaseService.upsertUser.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        spotifyId: 'spotify-user-id',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        emailVerified: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      mockDatabaseService.createSession.mockResolvedValue({
        id: 'session-id',
        sessionToken: 'session-token',
        userId: 'user-id',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          spotifyId: 'spotify-user-id',
          name: 'Test User',
          image: 'https://example.com/avatar.jpg',
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      const session = await AuthService.handleCallback('auth-code', 'mock-state')

      expect(session).toBeDefined()
      expect(session.user.email).toBe('test@example.com')
      expect(mockCookieManager.setSessionCookie).toHaveBeenCalled()
      expect(mockCookieManager.clearAuthCookies).toHaveBeenCalled()
    })

    it('should handle invalid state error', async () => {
      mockCookieManager.getState.mockReturnValue('different-state')

      await expect(
        AuthService.handleCallback('auth-code', 'mock-state')
      ).rejects.toThrow(OAuthError)

      await expect(
        AuthService.handleCallback('auth-code', 'mock-state')
      ).rejects.toMatchObject({
        message: 'Invalid state',
        code: 'INVALID_STATE',
      })
    })

    it('should handle missing code verifier error', async () => {
      mockCookieManager.getState.mockReturnValue('mock-state')
      mockCookieManager.getCodeVerifier.mockReturnValue(undefined)

      await expect(
        AuthService.handleCallback('auth-code', 'mock-state')
      ).rejects.toMatchObject({
        message: 'Missing code verifier',
        code: 'MISSING_CODE_VERIFIER',
      })
    })
  })

  describe('Session Management', () => {
    it('should get existing session', async () => {
      mockCookieManager.getSessionCookie.mockReturnValue('session-token')
      mockDatabaseService.findSessionByToken.mockResolvedValue({
        id: 'session-id',
        sessionToken: 'session-token',
        userId: 'user-id',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresAt: new Date(Date.now() + 3600000),
        user: {
          id: 'user-id',
          email: 'test@example.com',
          spotifyId: 'spotify-id',
          name: 'Test User',
          image: null,
          emailVerified: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })

      const session = await AuthService.getSession()

      expect(session).toBeDefined()
      expect(session?.user.email).toBe('test@example.com')
    })

    it('should return null when no session cookie', async () => {
      mockCookieManager.getSessionCookie.mockReturnValue(undefined)

      const session = await AuthService.getSession()

      expect(session).toBeNull()
      expect(mockDatabaseService.findSessionByToken).not.toHaveBeenCalled()
    })

    it('should clear cookie when session not found in DB', async () => {
      mockCookieManager.getSessionCookie.mockReturnValue('invalid-token')
      mockDatabaseService.findSessionByToken.mockResolvedValue(null)

      const session = await AuthService.getSession()

      expect(session).toBeNull()
      expect(mockCookieManager.deleteSessionCookie).toHaveBeenCalled()
    })
  })

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      mockCookieManager.getSessionCookie.mockReturnValue('session-token')

      await AuthService.signOut()

      expect(mockDatabaseService.deleteSession).toHaveBeenCalledWith('session-token')
      expect(mockCookieManager.deleteSessionCookie).toHaveBeenCalled()
    })

    it('should handle sign out with no session', async () => {
      mockCookieManager.getSessionCookie.mockReturnValue(undefined)

      await AuthService.signOut()

      expect(mockDatabaseService.deleteSession).not.toHaveBeenCalled()
      expect(mockCookieManager.deleteSessionCookie).not.toHaveBeenCalled()
    })
  })
})