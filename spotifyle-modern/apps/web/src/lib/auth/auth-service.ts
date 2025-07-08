import { Spotify, generateState, generateCodeVerifier } from 'arctic'
import { authConfig } from '@/config/auth.config'
import { CookieManager } from './cookie-manager'
import { TokenManager } from './token-manager'
import { SpotifyClient } from './spotify-client'
import { DatabaseService } from './db-service'
import type { Session } from '@/types/auth'
import { OAuthError, SessionError } from '@/types/auth'

// Initialize Spotify OAuth client
const spotify = new Spotify(
  authConfig.spotify.clientId,
  authConfig.spotify.clientSecret,
  authConfig.spotify.redirectUri
)

export class AuthService {
  static async createAuthorizationURL(): Promise<string> {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    const url = await spotify.createAuthorizationURL(
      state,
      codeVerifier,
      [...authConfig.spotify.scopes] // Convert readonly array to mutable array
    )

    // Store state and code verifier in cookies
    CookieManager.setState(state)
    CookieManager.setCodeVerifier(codeVerifier)

    return url.toString()
  }

  static async handleCallback(code: string, state: string): Promise<Session> {
    // Verify state
    const storedState = CookieManager.getState()
    if (!storedState || storedState !== state) {
      throw new OAuthError('Invalid state', 'INVALID_STATE')
    }

    // Get code verifier
    const codeVerifier = CookieManager.getCodeVerifier()
    if (!codeVerifier) {
      throw new OAuthError('Missing code verifier', 'MISSING_CODE_VERIFIER')
    }

    try {
      // Exchange code for tokens
      const tokens = await spotify.validateAuthorizationCode(code, codeVerifier)
      const { accessToken, refreshToken, expiresAt } = TokenManager.extractTokens(tokens)

      // Fetch user profile from Spotify
      const spotifyUser = await SpotifyClient.fetchUserProfile(accessToken)

      // Upsert user in database
      const user = await DatabaseService.upsertUser({
        email: spotifyUser.email,
        spotifyId: spotifyUser.id,
        name: spotifyUser.display_name,
        image: spotifyUser.images?.[0]?.url || null,
      })

      // Create session
      const sessionToken = TokenManager.generateSessionToken()
      const session = await DatabaseService.createSession({
        userId: user.id,
        sessionToken,
        accessToken,
        refreshToken,
        expiresAt,
      })

      // Set session cookie
      CookieManager.setSessionCookie(sessionToken)

      // Clear auth cookies
      CookieManager.clearAuthCookies()

      return session
    } catch (error) {
      // Clear auth cookies on error
      CookieManager.clearAuthCookies()
      
      if (error instanceof OAuthError) {
        throw error
      }
      
      throw new OAuthError(
        'Failed to complete OAuth flow',
        'OAUTH_FLOW_ERROR'
      )
    }
  }

  static async getSession(): Promise<Session | null> {
    const sessionToken = CookieManager.getSessionCookie()
    if (!sessionToken) {
      return null
    }

    const session = await DatabaseService.findSessionByToken(sessionToken)
    if (!session) {
      CookieManager.deleteSessionCookie()
      return null
    }

    // Check if access token is expired and needs refresh
    if (session.expiresAt && TokenManager.isTokenExpired(session.expiresAt)) {
      // TODO: Implement token refresh
      // For now, just return the session
    }

    return session
  }

  static async signOut(): Promise<void> {
    const sessionToken = CookieManager.getSessionCookie()
    if (sessionToken) {
      await DatabaseService.deleteSession(sessionToken)
      CookieManager.deleteSessionCookie()
    }
  }

  static async refreshAccessToken(sessionToken: string): Promise<Session> {
    const session = await DatabaseService.findSessionByToken(sessionToken)
    if (!session || !session.refreshToken) {
      throw new SessionError('No valid session or refresh token')
    }

    // TODO: Implement token refresh with Spotify
    throw new Error('Token refresh not implemented yet')
  }
}