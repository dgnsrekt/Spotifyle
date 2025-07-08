/**
 * Spotify Client Exports
 * Main exports for the client package
 */

export { SpotifyClient } from './spotify-client'
export { SpotifyHttpClient } from './http-client'
export { SpotifyTokenManager, MemoryTokenStorage, type TokenStorage } from './token-manager'

// Re-export client types
export type {
  SpotifyClientConfig,
  SpotifyApiOptions,
  SpotifyTokens,
  SpotifyTokenRefreshResult,
  SpotifyRequestContext,
  SpotifyResponse,
  SpotifyApiError,
  SpotifyAuthError,
  SpotifyRateLimitError
} from '../types/client'