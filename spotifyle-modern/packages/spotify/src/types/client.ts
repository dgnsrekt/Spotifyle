/**
 * Spotify Client Types
 * Types specific to our client implementation
 */

import type { SpotifyTokenResponse } from './spotify-api'

// Client configuration
export interface SpotifyClientConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
  baseUrl?: string
}

// Token management
export interface SpotifyTokens {
  accessToken: string
  refreshToken: string | null
  expiresAt: number // Unix timestamp
  scope: string
}

export interface SpotifyTokenRefreshResult {
  tokens: SpotifyTokens
  wasRefreshed: boolean
}

// API client options
export interface SpotifyApiOptions {
  retries?: number
  timeout?: number
  rateLimit?: boolean
  cache?: boolean
  cacheTtl?: number
}

// Request context
export interface SpotifyRequestContext {
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  params?: Record<string, any>
  body?: any
  headers?: Record<string, string>
  requiresAuth?: boolean
}

// Response wrapper
export interface SpotifyResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  rateLimit?: {
    limit: number
    remaining: number
    resetTime: number
  }
}

// Error types
export class SpotifyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public context?: SpotifyRequestContext
  ) {
    super(message)
    this.name = 'SpotifyApiError'
  }
}

export class SpotifyAuthError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'SpotifyAuthError'
  }
}

export class SpotifyRateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number
  ) {
    super(message)
    this.name = 'SpotifyRateLimitError'
  }
}

// Cache types
export interface SpotifyCacheEntry<T = any> {
  data: T
  expiresAt: number
  key: string
}

export interface SpotifyCacheOptions {
  ttl: number // Time to live in seconds
  keyPrefix?: string
}

// Service response types
export interface SpotifyUserProfile {
  id: string
  displayName: string | null
  email: string | null
  country: string | null
  product: 'premium' | 'free' | 'open' | null
  images: Array<{
    url: string
    width: number | null
    height: number | null
  }>
  followers: number
}

export interface SpotifyUserTopItems<T> {
  items: T[]
  total: number
  timeRange: 'short_term' | 'medium_term' | 'long_term'
  limit: number
  offset: number
}

export interface SpotifyUserRecentTracks {
  tracks: Array<{
    track: {
      id: string
      name: string
      artists: Array<{
        id: string
        name: string
      }>
      album: {
        id: string
        name: string
        images: Array<{
          url: string
          width: number | null
          height: number | null
        }>
      }
      previewUrl: string | null
      durationMs: number
    }
    playedAt: string
  }>
  hasMore: boolean
  cursors: {
    after: string | null
    before: string | null
  }
}

// Artist enrichment
export interface SpotifyArtistDetails {
  id: string
  name: string
  genres: string[]
  popularity: number
  followers: number
  images: Array<{
    url: string
    width: number | null
    height: number | null
  }>
  topTracks: Array<{
    id: string
    name: string
    popularity: number
    previewUrl: string | null
    album: {
      id: string
      name: string
      images: Array<{
        url: string
        width: number | null
        height: number | null
      }>
    }
  }>
}

// Game-specific types
export interface SpotifyGameData {
  userId: string
  artists: SpotifyArtistDetails[]
  tracks: Array<{
    id: string
    name: string
    artists: Array<{
      id: string
      name: string
    }>
    album: {
      id: string
      name: string
      images: Array<{
        url: string
        width: number | null
        height: number | null
      }>
    }
    popularity: number
    previewUrl: string | null
    audioFeatures?: {
      danceability: number
      energy: number
      valence: number
      tempo: number
      key: number
      mode: number
    }
  }>
  playlists: Array<{
    id: string
    name: string
    description: string | null
    images: Array<{
      url: string
      width: number | null
      height: number | null
    }>
    trackCount: number
  }>
  collectedAt: string
}

// Batch processing
export interface SpotifyBatchRequest {
  id: string
  endpoint: string
  params?: Record<string, any>
}

export interface SpotifyBatchResponse<T = any> {
  id: string
  data?: T
  error?: SpotifyApiError
}

// Progress tracking
export interface SpotifyDataCollectionProgress {
  step: 'profile' | 'top_artists' | 'top_tracks' | 'recent_tracks' | 'playlists' | 'audio_features' | 'complete'
  progress: number // 0-100
  message: string
  estimatedTimeRemaining?: number
}