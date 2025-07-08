/**
 * Spotify Token Manager
 * Handles OAuth token storage, refresh, and validation
 */

import type {
  SpotifyTokens,
  SpotifyTokenRefreshResult,
  SpotifyClientConfig
} from '../types/client'
import {
  SpotifyAuthError
} from '../types/client'
import type { SpotifyTokenResponse } from '../types/spotify-api'

export interface TokenStorage {
  get(userId: string): Promise<SpotifyTokens | null>
  set(userId: string, tokens: SpotifyTokens): Promise<void>
  delete(userId: string): Promise<void>
}

export class SpotifyTokenManager {
  private readonly config: SpotifyClientConfig
  private readonly storage: TokenStorage

  constructor(config: SpotifyClientConfig, storage: TokenStorage) {
    this.config = config
    this.storage = storage
  }

  /**
   * Get valid access token for user, refreshing if necessary
   */
  async getValidAccessToken(userId: string): Promise<SpotifyTokenRefreshResult> {
    const tokens = await this.storage.get(userId)
    
    if (!tokens) {
      throw new SpotifyAuthError('No tokens found for user. Re-authentication required.')
    }

    // Check if token is still valid (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000)
    const bufferTime = 300 // 5 minutes
    
    if (tokens.expiresAt > now + bufferTime) {
      return {
        tokens,
        wasRefreshed: false
      }
    }

    // Token needs refresh
    if (!tokens.refreshToken) {
      throw new SpotifyAuthError('No refresh token available. Re-authentication required.')
    }

    return this.refreshAccessToken(userId, tokens.refreshToken)
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(userId: string, refreshToken: string): Promise<SpotifyTokenRefreshResult> {
    try {
      const response = await this.makeTokenRequest({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      })

      const newTokens: SpotifyTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token || refreshToken, // Spotify may not return new refresh token
        expiresAt: Math.floor(Date.now() / 1000) + response.expires_in,
        scope: response.scope
      }

      await this.storage.set(userId, newTokens)

      return {
        tokens: newTokens,
        wasRefreshed: true
      }
    } catch (error) {
      // If refresh fails, remove stored tokens
      await this.storage.delete(userId)
      
      if (error instanceof Error) {
        throw new SpotifyAuthError(
          `Token refresh failed: ${error.message}`,
          error
        )
      }
      
      throw new SpotifyAuthError('Token refresh failed with unknown error')
    }
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(userId: string, code: string): Promise<SpotifyTokens> {
    try {
      const response = await this.makeTokenRequest({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri
      })

      const tokens: SpotifyTokens = {
        accessToken: response.access_token,
        refreshToken: response.refresh_token || null,
        expiresAt: Math.floor(Date.now() / 1000) + response.expires_in,
        scope: response.scope
      }

      await this.storage.set(userId, tokens)
      return tokens
    } catch (error) {
      if (error instanceof Error) {
        throw new SpotifyAuthError(
          `Code exchange failed: ${error.message}`,
          error
        )
      }
      
      throw new SpotifyAuthError('Code exchange failed with unknown error')
    }
  }

  /**
   * Revoke tokens and remove from storage
   */
  async revokeTokens(userId: string): Promise<void> {
    const tokens = await this.storage.get(userId)
    
    if (tokens && tokens.refreshToken) {
      try {
        // Revoke refresh token (which also revokes access token)
        await this.revokeToken(tokens.refreshToken)
      } catch (error) {
        // Log error but continue with removal from storage
        console.warn('Failed to revoke tokens:', error)
      }
    }

    await this.storage.delete(userId)
  }

  /**
   * Check if user has valid tokens
   */
  async hasValidTokens(userId: string): Promise<boolean> {
    try {
      await this.getValidAccessToken(userId)
      return true
    } catch {
      return false
    }
  }

  /**
   * Make token request to Spotify
   */
  private async makeTokenRequest(body: Record<string, string>): Promise<SpotifyTokenResponse> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as any
      throw new Error(errorData.error_description || `HTTP ${response.status}`)
    }

    return response.json() as Promise<SpotifyTokenResponse>
  }

  /**
   * Revoke a token
   */
  private async revokeToken(token: string): Promise<void> {
    const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
    
    const response = await fetch('https://accounts.spotify.com/api/token/revoke', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        token,
        token_type_hint: 'refresh_token'
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to revoke token: HTTP ${response.status}`)
    }
  }

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      scope: this.config.scopes.join(' '),
      redirect_uri: this.config.redirectUri,
      show_dialog: 'false'
    })

    if (state) {
      params.set('state', state)
    }

    return `https://accounts.spotify.com/authorize?${params.toString()}`
  }

  /**
   * Validate token scope against required scopes
   */
  validateTokenScope(tokens: SpotifyTokens, requiredScopes: string[]): boolean {
    const tokenScopes = tokens.scope.split(' ')
    return requiredScopes.every(scope => tokenScopes.includes(scope))
  }

  /**
   * Get remaining token lifetime in seconds
   */
  getTokenLifetime(tokens: SpotifyTokens): number {
    const now = Math.floor(Date.now() / 1000)
    return Math.max(0, tokens.expiresAt - now)
  }
}

/**
 * In-memory token storage (for development/testing)
 * In production, you should use database storage
 */
export class MemoryTokenStorage implements TokenStorage {
  private tokens = new Map<string, SpotifyTokens>()

  async get(userId: string): Promise<SpotifyTokens | null> {
    return this.tokens.get(userId) || null
  }

  async set(userId: string, tokens: SpotifyTokens): Promise<void> {
    this.tokens.set(userId, tokens)
  }

  async delete(userId: string): Promise<void> {
    this.tokens.delete(userId)
  }

  clear(): void {
    this.tokens.clear()
  }

  size(): number {
    return this.tokens.size
  }
}