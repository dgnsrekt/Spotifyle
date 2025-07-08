import { SpotifyUser, SpotifyError } from '@/types/spotify'
import { OAuthError } from '@/types/auth'

export class SpotifyClient {
  private static readonly API_BASE_URL = 'https://api.spotify.com/v1'
  private static readonly TIMEOUT_MS = 10000

  static async fetchUserProfile(accessToken: string): Promise<SpotifyUser> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS)

    try {
      const response = await fetch(`${this.API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json() as SpotifyError
        throw new OAuthError(
          error.error_description || 'Failed to fetch user profile',
          error.error
        )
      }

      return await response.json() as SpotifyUser
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof OAuthError) {
        throw error
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new OAuthError('Spotify API request timed out', 'TIMEOUT')
      }
      
      throw new OAuthError('Failed to fetch user profile', 'UNKNOWN_ERROR')
    }
  }

  static async refreshAccessToken(): Promise<void> {
    // Implementation for token refresh
    // This would be used in a future update for automatic token refresh
    // Parameters: clientId, clientSecret, refreshToken
    throw new Error('Not implemented yet')
  }
}