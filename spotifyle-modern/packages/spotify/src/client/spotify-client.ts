/**
 * Spotify API Client
 * Main client for interacting with Spotify Web API
 */

import { SpotifyHttpClient } from './http-client'
import { SpotifyTokenManager, type TokenStorage } from './token-manager'
import type {
  SpotifyClientConfig,
  SpotifyApiOptions,
  SpotifyResponse
} from '../types/client'
import {
  SpotifyApiError,
  SpotifyAuthError
} from '../types/client'
import type {
  SpotifyUser,
  SpotifyArtist,
  SpotifyTrack,
  SpotifyAlbum,
  SpotifyPlaylist,
  SpotifySearchResult,
  SpotifySearchParams,
  SpotifyTopItemsResponse,
  SpotifyRecentlyPlayedResponse,
  SpotifyAudioFeatures,
  SpotifyArtistTopTracksResponse,
  SpotifyApiParams
} from '../types/spotify-api'

export class SpotifyClient {
  private readonly httpClient: SpotifyHttpClient
  private readonly tokenManager: SpotifyTokenManager
  private readonly config: SpotifyClientConfig

  constructor(
    config: SpotifyClientConfig,
    tokenStorage: TokenStorage,
    options: SpotifyApiOptions = {}
  ) {
    this.config = config
    this.httpClient = new SpotifyHttpClient(config.baseUrl, options)
    this.tokenManager = new SpotifyTokenManager(config, tokenStorage)
  }

  // ========== Authentication Methods ==========

  /**
   * Get authorization URL for OAuth flow
   */
  getAuthorizationUrl(state?: string): string {
    return this.tokenManager.getAuthorizationUrl(state)
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(userId: string, code: string) {
    return this.tokenManager.exchangeCodeForTokens(userId, code)
  }

  /**
   * Check if user has valid tokens
   */
  async hasValidTokens(userId: string): Promise<boolean> {
    return this.tokenManager.hasValidTokens(userId)
  }

  /**
   * Revoke user's tokens
   */
  async revokeTokens(userId: string): Promise<void> {
    return this.tokenManager.revokeTokens(userId)
  }

  // ========== User Profile Methods ==========

  /**
   * Get current user's profile
   */
  async getCurrentUser(userId: string): Promise<SpotifyUser> {
    const response = await this.makeAuthenticatedRequest<SpotifyUser>(userId, {
      endpoint: '/me',
      method: 'GET'
    })
    return response.data
  }

  /**
   * Get user profile by ID
   */
  async getUser(userId: string, targetUserId: string): Promise<SpotifyUser> {
    const response = await this.makeAuthenticatedRequest<SpotifyUser>(userId, {
      endpoint: `/users/${targetUserId}`,
      method: 'GET'
    })
    return response.data
  }

  // ========== Top Items Methods ==========

  /**
   * Get user's top artists
   */
  async getTopArtists(
    userId: string,
    params: SpotifyApiParams = {}
  ): Promise<SpotifyTopItemsResponse<SpotifyArtist>> {
    const response = await this.makeAuthenticatedRequest<SpotifyTopItemsResponse<SpotifyArtist>>(userId, {
      endpoint: '/me/top/artists',
      method: 'GET',
      params: {
        limit: 20,
        time_range: 'medium_term',
        ...params
      }
    })
    return response.data
  }

  /**
   * Get user's top tracks
   */
  async getTopTracks(
    userId: string,
    params: SpotifyApiParams = {}
  ): Promise<SpotifyTopItemsResponse<SpotifyTrack>> {
    const response = await this.makeAuthenticatedRequest<SpotifyTopItemsResponse<SpotifyTrack>>(userId, {
      endpoint: '/me/top/tracks',
      method: 'GET',
      params: {
        limit: 20,
        time_range: 'medium_term',
        ...params
      }
    })
    return response.data
  }

  /**
   * Get user's recently played tracks
   */
  async getRecentlyPlayed(
    userId: string,
    params: { limit?: number; after?: string; before?: string } = {}
  ): Promise<SpotifyRecentlyPlayedResponse> {
    const response = await this.makeAuthenticatedRequest<SpotifyRecentlyPlayedResponse>(userId, {
      endpoint: '/me/player/recently-played',
      method: 'GET',
      params: {
        limit: 20,
        ...params
      }
    })
    return response.data
  }

  // ========== Search Methods ==========

  /**
   * Search for items
   */
  async search(
    userId: string,
    params: SpotifySearchParams
  ): Promise<SpotifySearchResult> {
    const response = await this.makeAuthenticatedRequest<SpotifySearchResult>(userId, {
      endpoint: '/search',
      method: 'GET',
      params: {
        ...params,
        type: params.type.join(',')
      }
    })
    return response.data
  }

  // ========== Artist Methods ==========

  /**
   * Get artist by ID
   */
  async getArtist(userId: string, artistId: string): Promise<SpotifyArtist> {
    const response = await this.makeAuthenticatedRequest<SpotifyArtist>(userId, {
      endpoint: `/artists/${artistId}`,
      method: 'GET'
    })
    return response.data
  }

  /**
   * Get multiple artists
   */
  async getArtists(userId: string, artistIds: string[]): Promise<{ artists: SpotifyArtist[] }> {
    const response = await this.makeAuthenticatedRequest<{ artists: SpotifyArtist[] }>(userId, {
      endpoint: '/artists',
      method: 'GET',
      params: {
        ids: artistIds.join(',')
      }
    })
    return response.data
  }

  /**
   * Get artist's albums
   */
  async getArtistAlbums(
    userId: string,
    artistId: string,
    params: SpotifyApiParams & { include_groups?: string } = {}
  ) {
    const response = await this.makeAuthenticatedRequest(userId, {
      endpoint: `/artists/${artistId}/albums`,
      method: 'GET',
      params: {
        limit: 20,
        ...params
      }
    })
    return response.data
  }

  /**
   * Get artist's top tracks
   */
  async getArtistTopTracks(
    userId: string,
    artistId: string,
    market: string = 'US'
  ): Promise<SpotifyArtistTopTracksResponse> {
    const response = await this.makeAuthenticatedRequest<SpotifyArtistTopTracksResponse>(userId, {
      endpoint: `/artists/${artistId}/top-tracks`,
      method: 'GET',
      params: { market }
    })
    return response.data
  }

  /**
   * Get related artists
   */
  async getRelatedArtists(userId: string, artistId: string): Promise<{ artists: SpotifyArtist[] }> {
    const response = await this.makeAuthenticatedRequest<{ artists: SpotifyArtist[] }>(userId, {
      endpoint: `/artists/${artistId}/related-artists`,
      method: 'GET'
    })
    return response.data
  }

  // ========== Track Methods ==========

  /**
   * Get track by ID
   */
  async getTrack(userId: string, trackId: string, market?: string): Promise<SpotifyTrack> {
    const response = await this.makeAuthenticatedRequest<SpotifyTrack>(userId, {
      endpoint: `/tracks/${trackId}`,
      method: 'GET',
      params: market ? { market } : undefined
    })
    return response.data
  }

  /**
   * Get multiple tracks
   */
  async getTracks(userId: string, trackIds: string[], market?: string): Promise<{ tracks: SpotifyTrack[] }> {
    const response = await this.makeAuthenticatedRequest<{ tracks: SpotifyTrack[] }>(userId, {
      endpoint: '/tracks',
      method: 'GET',
      params: {
        ids: trackIds.join(','),
        ...(market ? { market } : {})
      }
    })
    return response.data
  }

  /**
   * Get audio features for track
   */
  async getAudioFeatures(userId: string, trackId: string): Promise<SpotifyAudioFeatures> {
    const response = await this.makeAuthenticatedRequest<SpotifyAudioFeatures>(userId, {
      endpoint: `/audio-features/${trackId}`,
      method: 'GET'
    })
    return response.data
  }

  /**
   * Get audio features for multiple tracks
   */
  async getAudioFeaturesForTracks(
    userId: string,
    trackIds: string[]
  ): Promise<{ audio_features: SpotifyAudioFeatures[] }> {
    const response = await this.makeAuthenticatedRequest<{ audio_features: SpotifyAudioFeatures[] }>(userId, {
      endpoint: '/audio-features',
      method: 'GET',
      params: {
        ids: trackIds.join(',')
      }
    })
    return response.data
  }

  // ========== Album Methods ==========

  /**
   * Get album by ID
   */
  async getAlbum(userId: string, albumId: string, market?: string): Promise<SpotifyAlbum> {
    const response = await this.makeAuthenticatedRequest<SpotifyAlbum>(userId, {
      endpoint: `/albums/${albumId}`,
      method: 'GET',
      params: market ? { market } : undefined
    })
    return response.data
  }

  /**
   * Get album tracks
   */
  async getAlbumTracks(
    userId: string,
    albumId: string,
    params: SpotifyApiParams = {}
  ) {
    const response = await this.makeAuthenticatedRequest(userId, {
      endpoint: `/albums/${albumId}/tracks`,
      method: 'GET',
      params: {
        limit: 20,
        ...params
      }
    })
    return response.data
  }

  // ========== Playlist Methods ==========

  /**
   * Get current user's playlists
   */
  async getCurrentUserPlaylists(
    userId: string,
    params: SpotifyApiParams = {}
  ) {
    const response = await this.makeAuthenticatedRequest(userId, {
      endpoint: '/me/playlists',
      method: 'GET',
      params: {
        limit: 20,
        ...params
      }
    })
    return response.data
  }

  /**
   * Get playlist by ID
   */
  async getPlaylist(
    userId: string,
    playlistId: string,
    params: SpotifyApiParams & { fields?: string } = {}
  ): Promise<SpotifyPlaylist> {
    const response = await this.makeAuthenticatedRequest<SpotifyPlaylist>(userId, {
      endpoint: `/playlists/${playlistId}`,
      method: 'GET',
      params
    })
    return response.data
  }

  /**
   * Get playlist tracks
   */
  async getPlaylistTracks(
    userId: string,
    playlistId: string,
    params: SpotifyApiParams & { fields?: string } = {}
  ) {
    const response = await this.makeAuthenticatedRequest(userId, {
      endpoint: `/playlists/${playlistId}/tracks`,
      method: 'GET',
      params: {
        limit: 20,
        ...params
      }
    })
    return response.data
  }

  // ========== Helper Methods ==========

  /**
   * Make authenticated request
   */
  private async makeAuthenticatedRequest<T>(
    userId: string,
    context: Omit<import('../types/client').SpotifyRequestContext, 'requiresAuth'>
  ): Promise<SpotifyResponse<T>> {
    try {
      const { tokens } = await this.tokenManager.getValidAccessToken(userId)
      
      return this.httpClient.request<T>({
        ...context,
        headers: {
          Authorization: `Bearer ${tokens.accessToken}`,
          ...context.headers
        },
        requiresAuth: true
      })
    } catch (error) {
      if (error instanceof SpotifyAuthError) {
        throw error
      }
      
      if (error instanceof SpotifyApiError) {
        throw error
      }
      
      throw new SpotifyApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0,
        'REQUEST_ERROR',
        context
      )
    }
  }

  /**
   * Get rate limit state
   */
  getRateLimitState() {
    return this.httpClient.getRateLimitState()
  }

  /**
   * Get client configuration
   */
  getConfig(): SpotifyClientConfig {
    return { ...this.config }
  }
}