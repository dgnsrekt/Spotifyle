/**
 * Spotify Package Main Exports
 * @spotifyle/spotify - Spotify Web API client and services
 */

// Main client exports
export * from './src/client'

// Service exports  
export * from './src/services'

// Type exports
export * from './src/types'

// Default export for convenience
export { SpotifyClient as default } from './src/client'

// Package metadata
export const version = '0.1.0'
export const name = '@spotifyle/spotify'