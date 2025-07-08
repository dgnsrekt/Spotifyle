/**
 * Spotify Services Exports
 */

export { SpotifyUserDataService } from './user-data-service'
export { 
  SpotifyCacheService, 
  MemoryCacheStorage, 
  CacheTTL,
  type CacheStorage 
} from './cache-service'

// Re-export service types
export type {
  SpotifyUserProfile,
  SpotifyUserTopItems,
  SpotifyUserRecentTracks,
  SpotifyArtistDetails,
  SpotifyGameData,
  SpotifyDataCollectionProgress,
  SpotifyCacheEntry,
  SpotifyCacheOptions
} from '../types/client'