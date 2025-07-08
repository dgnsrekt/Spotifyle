/**
 * Spotify Package Types
 * Re-export all types for easy consumption
 */

// Spotify API types
export * from './spotify-api'

// Client types
export * from './client'

// Utility types
export type SpotifyId = string
export type SpotifyUri = string
export type ISO8601String = string
export type UnixTimestamp = number

// Common union types
export type SpotifyEntityType = 'track' | 'artist' | 'album' | 'playlist' | 'user'
export type SpotifyTimeRange = 'short_term' | 'medium_term' | 'long_term'
export type SpotifyMarket = string // ISO 3166-1 alpha-2 country code

// Error type guards
export function isSpotifyApiError(error: unknown): error is import('./client').SpotifyApiError {
  return error instanceof Error && error.name === 'SpotifyApiError'
}

export function isSpotifyAuthError(error: unknown): error is import('./client').SpotifyAuthError {
  return error instanceof Error && error.name === 'SpotifyAuthError'
}

export function isSpotifyRateLimitError(error: unknown): error is import('./client').SpotifyRateLimitError {
  return error instanceof Error && error.name === 'SpotifyRateLimitError'
}

// Type guards for API responses
export function isSpotifyTrack(item: any): item is import('./spotify-api').SpotifyTrack {
  return item !== null && item !== undefined && typeof item === 'object' && item.type === 'track'
}

export function isSpotifyArtist(item: any): item is import('./spotify-api').SpotifyArtist {
  return item !== null && item !== undefined && typeof item === 'object' && item.type === 'artist'
}

export function isSpotifyAlbum(item: any): item is import('./spotify-api').SpotifyAlbum {
  return item !== null && item !== undefined && typeof item === 'object' && item.type === 'album'
}

export function isSpotifyPlaylist(item: any): item is import('./spotify-api').SpotifyPlaylist {
  return item !== null && item !== undefined && typeof item === 'object' && item.type === 'playlist'
}

// Validation schemas (using Zod)
import { z } from 'zod'

export const SpotifyIdSchema = z.string().min(1).max(255)
export const SpotifyUriSchema = z.string().regex(/^spotify:[a-zA-Z]+:[a-zA-Z0-9]+$/)

export const SpotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().nullable(),
  width: z.number().nullable()
})

export const SpotifyExternalUrlsSchema = z.object({
  spotify: z.string().url()
})

export const SpotifyTokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().nullable(),
  expiresAt: z.number().positive(),
  scope: z.string()
})

export const SpotifyUserProfileSchema = z.object({
  id: SpotifyIdSchema,
  displayName: z.string().nullable(),
  email: z.string().email().nullable(),
  country: z.string().length(2).nullable(),
  product: z.enum(['premium', 'free', 'open']).nullable(),
  images: z.array(SpotifyImageSchema),
  followers: z.number().nonnegative()
})

// Configuration validation
export const SpotifyClientConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  redirectUri: z.string().url(),
  scopes: z.array(z.string()),
  baseUrl: z.string().url().default('https://api.spotify.com/v1')
})