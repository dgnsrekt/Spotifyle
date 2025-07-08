/**
 * Spotify User Data Service
 * High-level service for collecting and managing user's Spotify data
 */

import type { SpotifyClient } from '../client/spotify-client'
import type {
  SpotifyUserProfile,
  SpotifyUserTopItems,
  SpotifyUserRecentTracks,
  SpotifyArtistDetails,
  SpotifyGameData,
  SpotifyDataCollectionProgress
} from '../types/client'
import type {
  SpotifyUser,
  SpotifyArtist,
  SpotifyTrack
} from '../types/spotify-api'
import type { SpotifyTimeRange } from '../types/spotify-api'

export class SpotifyUserDataService {
  constructor(private client: SpotifyClient) {}

  /**
   * Get user's profile information
   */
  async getUserProfile(userId: string): Promise<SpotifyUserProfile> {
    const user = await this.client.getCurrentUser(userId)
    
    return {
      id: user.id,
      displayName: user.display_name,
      email: user.email || null,
      country: user.country || null,
      product: user.product || null,
      images: user.images.map(img => ({
        url: img.url,
        width: img.width,
        height: img.height
      })),
      followers: user.followers.total
    }
  }

  /**
   * Get user's top artists for a specific time range
   */
  async getTopArtists(
    userId: string,
    timeRange: SpotifyTimeRange = 'medium_term',
    limit: number = 50
  ): Promise<SpotifyUserTopItems<SpotifyArtist>> {
    const response = await this.client.getTopArtists(userId, {
      time_range: timeRange,
      limit: Math.min(limit, 50) // Spotify max is 50
    })
    
    return {
      items: response.items,
      total: response.total,
      timeRange,
      limit: response.limit,
      offset: response.offset
    }
  }

  /**
   * Get user's top tracks for a specific time range
   */
  async getTopTracks(
    userId: string,
    timeRange: SpotifyTimeRange = 'medium_term',
    limit: number = 50
  ): Promise<SpotifyUserTopItems<SpotifyTrack>> {
    const response = await this.client.getTopTracks(userId, {
      time_range: timeRange,
      limit: Math.min(limit, 50)
    })
    
    return {
      items: response.items,
      total: response.total,
      timeRange,
      limit: response.limit,
      offset: response.offset
    }
  }

  /**
   * Get user's recently played tracks
   */
  async getRecentTracks(
    userId: string,
    limit: number = 50
  ): Promise<SpotifyUserRecentTracks> {
    const response = await this.client.getRecentlyPlayed(userId, {
      limit: Math.min(limit, 50)
    })
    
    return {
      tracks: response.items.map(item => ({
        track: {
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map(artist => ({
            id: artist.id,
            name: artist.name
          })),
          album: {
            id: item.track.album.id,
            name: item.track.album.name,
            images: item.track.album.images.map(img => ({
              url: img.url,
              width: img.width,
              height: img.height
            }))
          },
          previewUrl: item.track.preview_url,
          durationMs: item.track.duration_ms
        },
        playedAt: item.played_at
      })),
      hasMore: response.next !== null,
      cursors: {
        after: response.cursors.after,
        before: response.cursors.before
      }
    }
  }

  /**
   * Get detailed artist information including top tracks
   */
  async getArtistDetails(userId: string, artistId: string): Promise<SpotifyArtistDetails> {
    const [artist, topTracks] = await Promise.all([
      this.client.getArtist(userId, artistId),
      this.client.getArtistTopTracks(userId, artistId)
    ])
    
    return {
      id: artist.id,
      name: artist.name,
      genres: artist.genres || [],
      popularity: artist.popularity || 0,
      followers: artist.followers?.total || 0,
      images: (artist.images || []).map(img => ({
        url: img.url,
        width: img.width,
        height: img.height
      })),
      topTracks: topTracks.tracks.slice(0, 10).map(track => ({
        id: track.id,
        name: track.name,
        popularity: track.popularity,
        previewUrl: track.preview_url,
        album: {
          id: track.album.id,
          name: track.album.name,
          images: track.album.images.map(img => ({
            url: img.url,
            width: img.width,
            height: img.height
          }))
        }
      }))
    }
  }

  /**
   * Collect comprehensive game data for a user
   */
  async collectGameData(
    userId: string,
    onProgress?: (progress: SpotifyDataCollectionProgress) => void
  ): Promise<SpotifyGameData> {
    const steps = [
      'profile',
      'top_artists',
      'top_tracks',
      'recent_tracks',
      'playlists',
      'audio_features',
      'complete'
    ] as const
    
    let currentStep = 0
    const totalSteps = steps.length - 1 // Exclude 'complete'
    
    const updateProgress = (step: typeof steps[number], message: string) => {
      const progress = Math.round((currentStep / totalSteps) * 100)
      onProgress?.({ step, progress, message })
    }

    try {
      // Step 1: Get user profile
      updateProgress('profile', 'Fetching user profile...')
      const profile = await this.getUserProfile(userId)
      currentStep++

      // Step 2: Get top artists (multiple time ranges)
      updateProgress('top_artists', 'Fetching top artists...')
      const [shortTermArtists, mediumTermArtists, longTermArtists] = await Promise.all([
        this.getTopArtists(userId, 'short_term', 20),
        this.getTopArtists(userId, 'medium_term', 20),
        this.getTopArtists(userId, 'long_term', 20)
      ])
      
      // Combine and deduplicate artists
      const allArtists = new Map<string, SpotifyArtist>()
      ;[...shortTermArtists.items, ...mediumTermArtists.items, ...longTermArtists.items]
        .forEach(artist => allArtists.set(artist.id, artist))
      
      currentStep++

      // Step 3: Get detailed artist information
      updateProgress('top_artists', 'Enriching artist data...')
      const artistDetails = await Promise.all(
        Array.from(allArtists.values())
          .slice(0, 15) // Limit to prevent too many API calls
          .map(artist => this.getArtistDetails(userId, artist.id))
      )
      currentStep++

      // Step 4: Get top tracks
      updateProgress('top_tracks', 'Fetching top tracks...')
      const [shortTermTracks, mediumTermTracks, longTermTracks] = await Promise.all([
        this.getTopTracks(userId, 'short_term', 30),
        this.getTopTracks(userId, 'medium_term', 30),
        this.getTopTracks(userId, 'long_term', 30)
      ])
      
      // Combine and deduplicate tracks
      const allTracks = new Map<string, SpotifyTrack>()
      ;[...shortTermTracks.items, ...mediumTermTracks.items, ...longTermTracks.items]
        .forEach(track => allTracks.set(track.id, track))
      
      currentStep++

      // Step 5: Get recent tracks
      updateProgress('recent_tracks', 'Fetching recent listening history...')
      const recentTracks = await this.getRecentTracks(userId, 50)
      
      // Add recent tracks to our collection
      recentTracks.tracks.forEach(item => {
        if (!allTracks.has(item.track.id)) {
          // Convert to SpotifyTrack format
          const track: SpotifyTrack = {
            id: item.track.id,
            name: item.track.name,
            artists: item.track.artists.map(a => ({
              id: a.id,
              name: a.name,
              external_urls: { spotify: '' },
              href: '',
              type: 'artist' as const,
              uri: ''
            })),
            album: {
              id: item.track.album.id,
              name: item.track.album.name,
              images: item.track.album.images,
              album_type: 'album' as const,
              total_tracks: 0,
              available_markets: [],
              external_urls: { spotify: '' },
              href: '',
              release_date: '',
              release_date_precision: 'day' as const,
              type: 'album' as const,
              uri: '',
              artists: []
            },
            available_markets: [],
            disc_number: 1,
            duration_ms: item.track.durationMs,
            explicit: false,
            external_ids: {},
            external_urls: { spotify: '' },
            href: '',
            popularity: 0,
            preview_url: item.track.previewUrl,
            track_number: 1,
            type: 'track' as const,
            uri: '',
            is_local: false
          }
          allTracks.set(item.track.id, track)
        }
      })
      
      currentStep++

      // Step 6: Get user's playlists
      updateProgress('playlists', 'Fetching playlists...')
      const playlists = await this.client.getCurrentUserPlaylists(userId, { limit: 20 }) as any
      currentStep++

      // Step 7: Get audio features for tracks
      updateProgress('audio_features', 'Analyzing audio features...')
      const trackIds = Array.from(allTracks.keys()).slice(0, 100) // Spotify allows max 100 per request
      const audioFeatures = trackIds.length > 0 
        ? await this.client.getAudioFeaturesForTracks(userId, trackIds)
        : { audio_features: [] }
      
      // Create audio features map
      const audioFeaturesMap = new Map()
      audioFeatures.audio_features
        .filter(Boolean)
        .forEach(features => audioFeaturesMap.set(features.id, features))
      
      currentStep++

      // Final data compilation
      updateProgress('complete', 'Finalizing data...')
      
      const gameData: SpotifyGameData = {
        userId: profile.id,
        artists: artistDetails,
        tracks: Array.from(allTracks.values()).map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map(a => ({
            id: a.id,
            name: a.name
          })),
          album: {
            id: track.album.id,
            name: track.album.name,
            images: track.album.images.map(img => ({
              url: img.url,
              width: img.width,
              height: img.height
            }))
          },
          popularity: track.popularity,
          previewUrl: track.preview_url,
          audioFeatures: audioFeaturesMap.has(track.id) ? {
            danceability: audioFeaturesMap.get(track.id).danceability,
            energy: audioFeaturesMap.get(track.id).energy,
            valence: audioFeaturesMap.get(track.id).valence,
            tempo: audioFeaturesMap.get(track.id).tempo,
            key: audioFeaturesMap.get(track.id).key,
            mode: audioFeaturesMap.get(track.id).mode
          } : undefined
        })),
        playlists: playlists.items.map((playlist: any) => ({
          id: playlist.id,
          name: playlist.name,
          description: playlist.description,
          images: playlist.images.map((img: any) => ({
            url: img.url,
            width: img.width,
            height: img.height
          })),
          trackCount: playlist.tracks.total
        })),
        collectedAt: new Date().toISOString()
      }

      updateProgress('complete', 'Data collection complete!')
      return gameData

    } catch (error) {
      throw new Error(`Failed to collect game data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Check if user has sufficient data for game creation
   */
  async validateUserDataForGames(userId: string): Promise<{
    isValid: boolean
    issues: string[]
    recommendations: string[]
  }> {
    try {
      const [topArtists, topTracks] = await Promise.all([
        this.getTopArtists(userId, 'medium_term', 10),
        this.getTopTracks(userId, 'medium_term', 10)
      ])

      const issues: string[] = []
      const recommendations: string[] = []

      if (topArtists.items.length < 5) {
        issues.push('Insufficient artist data')
        recommendations.push('Listen to more music to build up your artist preferences')
      }

      if (topTracks.items.length < 5) {
        issues.push('Insufficient track data')
        recommendations.push('Listen to more songs to build up your music library')
      }

      // Check for diversity
      const genres = new Set()
      topArtists.items.forEach(artist => {
        if (artist.genres) {
          artist.genres.forEach(genre => genres.add(genre))
        }
      })

      if (genres.size < 3) {
        recommendations.push('Try listening to different genres for more diverse games')
      }

      return {
        isValid: issues.length === 0,
        issues,
        recommendations
      }
    } catch (error) {
      return {
        isValid: false,
        issues: ['Unable to access Spotify data'],
        recommendations: ['Please ensure your Spotify account is properly connected']
      }
    }
  }
}