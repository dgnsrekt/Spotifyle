/**
 * Spotify Data Fetcher
 * Provides the implementation for fetching Spotify data for game generation
 */

import { SpotifyClient } from '@spotifyle/spotify'
import type { SpotifyArtist, SpotifyTrack } from '@spotifyle/spotify'

/**
 * Get user's top items from Spotify
 */
export async function getUserTopItems(
  userId: string,
  _accessToken: string, // Currently unused, but kept for API compatibility
  type: 'artists' | 'tracks',
  params?: { limit?: number }
): Promise<{ items: SpotifyArtist[] | SpotifyTrack[] }> {
  const client = new SpotifyClient()
  
  if (type === 'artists') {
    const result = await client.getTopArtists(userId, params)
    return { items: result.items as SpotifyArtist[] }
  } else {
    const result = await client.getTopTracks(userId, params)
    return { items: result.items as SpotifyTrack[] }
  }
}