/**
 * Tests for SpotifyUserDataService
 */

import { SpotifyUserDataService } from '../user-data-service'
import type { SpotifyClient } from '../../client/spotify-client'
import type { SpotifyUser, SpotifyArtist, SpotifyTrack } from '../../types/spotify-api'

// Mock the Spotify client
const mockSpotifyClient = {
  getCurrentUser: jest.fn(),
  getTopArtists: jest.fn(),
  getTopTracks: jest.fn(),
  getRecentlyPlayed: jest.fn(),
  getArtist: jest.fn(),
  getArtistTopTracks: jest.fn(),
  getCurrentUserPlaylists: jest.fn(),
  getAudioFeaturesForTracks: jest.fn(),
} as unknown as jest.Mocked<SpotifyClient>

describe('SpotifyUserDataService', () => {
  let userDataService: SpotifyUserDataService

  beforeEach(() => {
    userDataService = new SpotifyUserDataService(mockSpotifyClient)
    jest.clearAllMocks()
  })

  describe('getUserProfile', () => {
    it('should return simplified user profile', async () => {
      const mockUser: SpotifyUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        country: 'US',
        product: 'premium',
        images: [
          { url: 'https://example.com/avatar.jpg', width: 300, height: 300 }
        ],
        followers: { total: 100, href: null },
        external_urls: { spotify: 'https://spotify.com/user123' },
        href: 'https://api.spotify.com/v1/users/user123',
        type: 'user',
        uri: 'spotify:user:user123'
      }

      mockSpotifyClient.getCurrentUser.mockResolvedValue(mockUser)

      const profile = await userDataService.getUserProfile('user123')

      expect(profile).toEqual({
        id: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
        country: 'US',
        product: 'premium',
        images: [
          { url: 'https://example.com/avatar.jpg', width: 300, height: 300 }
        ],
        followers: 100
      })

      expect(mockSpotifyClient.getCurrentUser).toHaveBeenCalledWith('user123')
    })

    it('should handle null values gracefully', async () => {
      const mockUser: SpotifyUser = {
        id: 'user123',
        display_name: null,
        email: null,
        country: null,
        product: null,
        images: [],
        followers: { total: 0, href: null },
        external_urls: { spotify: 'https://spotify.com/user123' },
        href: 'https://api.spotify.com/v1/users/user123',
        type: 'user',
        uri: 'spotify:user:user123'
      }

      mockSpotifyClient.getCurrentUser.mockResolvedValue(mockUser)

      const profile = await userDataService.getUserProfile('user123')

      expect(profile).toEqual({
        id: 'user123',
        displayName: null,
        email: null,
        country: null,
        product: null,
        images: [],
        followers: 0
      })
    })
  })

  describe('getTopArtists', () => {
    it('should return top artists with default parameters', async () => {
      const mockArtists: SpotifyArtist[] = [
        {
          id: 'artist1',
          name: 'Artist 1',
          genres: ['pop', 'rock'],
          popularity: 85,
          followers: { total: 1000000, href: null },
          images: [{ url: 'https://example.com/artist1.jpg', width: 300, height: 300 }],
          external_urls: { spotify: 'https://spotify.com/artist1' },
          href: 'https://api.spotify.com/v1/artists/artist1',
          type: 'artist',
          uri: 'spotify:artist:artist1'
        }
      ]

      const mockResponse = {
        items: mockArtists,
        total: 1,
        limit: 20,
        offset: 0,
        href: 'https://api.spotify.com/v1/me/top/artists',
        next: null,
        previous: null
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockResponse)

      const result = await userDataService.getTopArtists('user123')

      expect(result).toEqual({
        items: mockArtists,
        total: 1,
        timeRange: 'medium_term',
        limit: 20,
        offset: 0
      })

      expect(mockSpotifyClient.getTopArtists).toHaveBeenCalledWith('user123', {
        time_range: 'medium_term',
        limit: 50
      })
    })

    it('should handle custom parameters', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        limit: 10,
        offset: 0,
        href: 'https://api.spotify.com/v1/me/top/artists',
        next: null,
        previous: null
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockResponse)

      await userDataService.getTopArtists('user123', 'short_term', 10)

      expect(mockSpotifyClient.getTopArtists).toHaveBeenCalledWith('user123', {
        time_range: 'short_term',
        limit: 10
      })
    })

    it('should limit to Spotify maximum of 50', async () => {
      const mockResponse = {
        items: [],
        total: 0,
        limit: 50,
        offset: 0,
        href: 'https://api.spotify.com/v1/me/top/artists',
        next: null,
        previous: null
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockResponse)

      await userDataService.getTopArtists('user123', 'medium_term', 100)

      expect(mockSpotifyClient.getTopArtists).toHaveBeenCalledWith('user123', {
        time_range: 'medium_term',
        limit: 50 // Should be capped at 50
      })
    })
  })

  describe('getTopTracks', () => {
    it('should return top tracks', async () => {
      const mockTracks: SpotifyTrack[] = [
        {
          id: 'track1',
          name: 'Track 1',
          artists: [{ id: 'artist1', name: 'Artist 1', external_urls: { spotify: '' }, href: '', type: 'artist', uri: '' }],
          album: {
            id: 'album1',
            name: 'Album 1',
            images: [{ url: 'https://example.com/album1.jpg', width: 300, height: 300 }],
            album_type: 'album',
            total_tracks: 10,
            available_markets: ['US'],
            external_urls: { spotify: '' },
            href: '',
            release_date: '2023-01-01',
            release_date_precision: 'day',
            type: 'album',
            uri: '',
            artists: []
          },
          available_markets: ['US'],
          disc_number: 1,
          duration_ms: 240000,
          explicit: false,
          external_ids: {},
          external_urls: { spotify: '' },
          href: '',
          popularity: 80,
          preview_url: 'https://example.com/preview.mp3',
          track_number: 1,
          type: 'track',
          uri: '',
          is_local: false
        }
      ]

      const mockResponse = {
        items: mockTracks,
        total: 1,
        limit: 20,
        offset: 0,
        href: 'https://api.spotify.com/v1/me/top/tracks',
        next: null,
        previous: null
      }

      mockSpotifyClient.getTopTracks.mockResolvedValue(mockResponse)

      const result = await userDataService.getTopTracks('user123')

      expect(result).toEqual({
        items: mockTracks,
        total: 1,
        timeRange: 'medium_term',
        limit: 20,
        offset: 0
      })
    })
  })

  describe('getRecentTracks', () => {
    it('should return formatted recent tracks', async () => {
      const mockRecentResponse = {
        items: [
          {
            track: {
              id: 'track1',
              name: 'Recent Track',
              artists: [{ id: 'artist1', name: 'Artist 1' }],
              album: {
                id: 'album1',
                name: 'Album 1',
                images: [{ url: 'https://example.com/album.jpg', width: 300, height: 300 }]
              },
              preview_url: 'https://example.com/preview.mp3',
              duration_ms: 180000
            },
            played_at: '2023-01-01T12:00:00Z'
          }
        ],
        next: null,
        cursors: {
          after: 'cursor123',
          before: 'cursor456'
        },
        limit: 20,
        href: 'https://api.spotify.com/v1/me/player/recently-played'
      }

      mockSpotifyClient.getRecentlyPlayed.mockResolvedValue(mockRecentResponse)

      const result = await userDataService.getRecentTracks('user123', 20)

      expect(result).toEqual({
        tracks: [
          {
            track: {
              id: 'track1',
              name: 'Recent Track',
              artists: [{ id: 'artist1', name: 'Artist 1' }],
              album: {
                id: 'album1',
                name: 'Album 1',
                images: [{ url: 'https://example.com/album.jpg', width: 300, height: 300 }]
              },
              previewUrl: 'https://example.com/preview.mp3',
              durationMs: 180000
            },
            playedAt: '2023-01-01T12:00:00Z'
          }
        ],
        hasMore: false,
        cursors: {
          after: 'cursor123',
          before: 'cursor456'
        }
      })

      expect(mockSpotifyClient.getRecentlyPlayed).toHaveBeenCalledWith('user123', {
        limit: 20
      })
    })
  })

  describe('getArtistDetails', () => {
    it('should return enriched artist data', async () => {
      const mockArtist: SpotifyArtist = {
        id: 'artist123',
        name: 'Test Artist',
        genres: ['pop', 'rock'],
        popularity: 85,
        followers: { total: 1000000, href: null },
        images: [{ url: 'https://example.com/artist.jpg', width: 300, height: 300 }],
        external_urls: { spotify: '' },
        href: '',
        type: 'artist',
        uri: ''
      }

      const mockTopTracks = {
        tracks: [
          {
            id: 'track1',
            name: 'Top Track 1',
            popularity: 90,
            preview_url: 'https://example.com/preview1.mp3',
            album: {
              id: 'album1',
              name: 'Album 1',
              images: [{ url: 'https://example.com/album1.jpg', width: 300, height: 300 }]
            }
          }
        ]
      }

      mockSpotifyClient.getArtist.mockResolvedValue(mockArtist)
      mockSpotifyClient.getArtistTopTracks.mockResolvedValue(mockTopTracks)

      const result = await userDataService.getArtistDetails('user123', 'artist123')

      expect(result).toEqual({
        id: 'artist123',
        name: 'Test Artist',
        genres: ['pop', 'rock'],
        popularity: 85,
        followers: 1000000,
        images: [{ url: 'https://example.com/artist.jpg', width: 300, height: 300 }],
        topTracks: [
          {
            id: 'track1',
            name: 'Top Track 1',
            popularity: 90,
            previewUrl: 'https://example.com/preview1.mp3',
            album: {
              id: 'album1',
              name: 'Album 1',
              images: [{ url: 'https://example.com/album1.jpg', width: 300, height: 300 }]
            }
          }
        ]
      })

      expect(mockSpotifyClient.getArtist).toHaveBeenCalledWith('user123', 'artist123')
      expect(mockSpotifyClient.getArtistTopTracks).toHaveBeenCalledWith('user123', 'artist123')
    })
  })

  describe('validateUserDataForGames', () => {
    it('should return valid when user has sufficient data', async () => {
      const mockArtistsResponse = {
        items: Array(10).fill(null).map((_, i) => ({
          id: `artist${i}`,
          name: `Artist ${i}`,
          genres: ['pop', 'rock', 'jazz'][i % 3] ? [['pop', 'rock', 'jazz'][i % 3]] : []
        })),
        total: 10,
        limit: 10,
        offset: 0
      }

      const mockTracksResponse = {
        items: Array(10).fill(null).map((_, i) => ({
          id: `track${i}`,
          name: `Track ${i}`
        })),
        total: 10,
        limit: 10,
        offset: 0
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockArtistsResponse)
      mockSpotifyClient.getTopTracks.mockResolvedValue(mockTracksResponse)

      const result = await userDataService.validateUserDataForGames('user123')

      expect(result.isValid).toBe(true)
      expect(result.issues).toHaveLength(0)
    })

    it('should return invalid when user has insufficient artists', async () => {
      const mockArtistsResponse = {
        items: Array(3).fill(null).map((_, i) => ({
          id: `artist${i}`,
          name: `Artist ${i}`,
          genres: ['pop']
        })),
        total: 3,
        limit: 10,
        offset: 0
      }

      const mockTracksResponse = {
        items: Array(10).fill(null).map((_, i) => ({
          id: `track${i}`,
          name: `Track ${i}`
        })),
        total: 10,
        limit: 10,
        offset: 0
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockArtistsResponse)
      mockSpotifyClient.getTopTracks.mockResolvedValue(mockTracksResponse)

      const result = await userDataService.validateUserDataForGames('user123')

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Insufficient artist data')
      expect(result.recommendations).toContain('Listen to more music to build up your artist preferences')
    })

    it('should return invalid when user has insufficient tracks', async () => {
      const mockArtistsResponse = {
        items: Array(10).fill(null).map((_, i) => ({
          id: `artist${i}`,
          name: `Artist ${i}`,
          genres: ['pop', 'rock', 'jazz'][i % 3] ? [['pop', 'rock', 'jazz'][i % 3]] : []
        })),
        total: 10,
        limit: 10,
        offset: 0
      }

      const mockTracksResponse = {
        items: Array(3).fill(null).map((_, i) => ({
          id: `track${i}`,
          name: `Track ${i}`
        })),
        total: 3,
        limit: 10,
        offset: 0
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockArtistsResponse)
      mockSpotifyClient.getTopTracks.mockResolvedValue(mockTracksResponse)

      const result = await userDataService.validateUserDataForGames('user123')

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Insufficient track data')
    })

    it('should suggest genre diversity when needed', async () => {
      const mockArtistsResponse = {
        items: Array(10).fill(null).map((_, i) => ({
          id: `artist${i}`,
          name: `Artist ${i}`,
          genres: ['pop'] // All same genre
        })),
        total: 10,
        limit: 10,
        offset: 0
      }

      const mockTracksResponse = {
        items: Array(10).fill(null).map((_, i) => ({
          id: `track${i}`,
          name: `Track ${i}`
        })),
        total: 10,
        limit: 10,
        offset: 0
      }

      mockSpotifyClient.getTopArtists.mockResolvedValue(mockArtistsResponse)
      mockSpotifyClient.getTopTracks.mockResolvedValue(mockTracksResponse)

      const result = await userDataService.validateUserDataForGames('user123')

      expect(result.isValid).toBe(true) // Still valid, just suggestions
      expect(result.recommendations).toContain('Try listening to different genres for more diverse games')
    })

    it('should handle API errors gracefully', async () => {
      mockSpotifyClient.getTopArtists.mockRejectedValue(new Error('API Error'))
      mockSpotifyClient.getTopTracks.mockRejectedValue(new Error('API Error'))

      const result = await userDataService.validateUserDataForGames('user123')

      expect(result.isValid).toBe(false)
      expect(result.issues).toContain('Unable to access Spotify data')
      expect(result.recommendations).toContain('Please ensure your Spotify account is properly connected')
    })
  })

  describe('collectGameData', () => {
    it('should collect comprehensive game data with progress updates', async () => {
      // Mock all the API calls
      const mockUser: SpotifyUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        country: 'US',
        product: 'premium',
        images: [],
        followers: { total: 100, href: null },
        external_urls: { spotify: '' },
        href: '',
        type: 'user',
        uri: ''
      }

      const mockArtistsResponse = {
        items: [
          {
            id: 'artist1',
            name: 'Artist 1',
            genres: ['pop'],
            popularity: 85,
            followers: { total: 1000000, href: null },
            images: [],
            external_urls: { spotify: '' },
            href: '',
            type: 'artist' as const,
            uri: ''
          }
        ],
        total: 1,
        limit: 20,
        offset: 0
      }

      const mockTracksResponse = {
        items: [
          {
            id: 'track1',
            name: 'Track 1',
            artists: [{ id: 'artist1', name: 'Artist 1' }],
            album: {
              id: 'album1',
              name: 'Album 1',
              images: []
            },
            popularity: 80,
            preview_url: null,
            duration_ms: 240000
          }
        ],
        total: 1,
        limit: 30,
        offset: 0
      }

      const mockRecentTracks = {
        tracks: [],
        hasMore: false,
        cursors: { after: null, before: null }
      }

      const mockPlaylists = {
        items: [
          {
            id: 'playlist1',
            name: 'My Playlist',
            description: 'Test playlist',
            images: [],
            tracks: { total: 10 }
          }
        ]
      }

      const mockAudioFeatures = {
        audio_features: [
          {
            id: 'track1',
            danceability: 0.8,
            energy: 0.9,
            valence: 0.7,
            tempo: 120,
            key: 5,
            mode: 1
          }
        ]
      }

      const mockArtistTopTracks = {
        tracks: [
          {
            id: 'top-track1',
            name: 'Top Track 1',
            popularity: 90,
            preview_url: null,
            album: {
              id: 'album1',
              name: 'Album 1',
              images: []
            }
          }
        ]
      }

      mockSpotifyClient.getCurrentUser.mockResolvedValue(mockUser)
      mockSpotifyClient.getTopArtists.mockResolvedValue(mockArtistsResponse)
      mockSpotifyClient.getTopTracks.mockResolvedValue(mockTracksResponse)
      mockSpotifyClient.getArtist.mockResolvedValue(mockArtistsResponse.items[0])
      mockSpotifyClient.getArtistTopTracks.mockResolvedValue(mockArtistTopTracks)
      mockSpotifyClient.getCurrentUserPlaylists.mockResolvedValue(mockPlaylists)
      mockSpotifyClient.getAudioFeaturesForTracks.mockResolvedValue(mockAudioFeatures)

      // Mock the getUserProfile, getTopArtists, etc. methods
      jest.spyOn(userDataService, 'getUserProfile').mockResolvedValue({
        id: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
        country: 'US',
        product: 'premium',
        images: [],
        followers: 100
      })

      jest.spyOn(userDataService, 'getTopArtists').mockResolvedValue({
        items: mockArtistsResponse.items,
        total: 1,
        timeRange: 'medium_term',
        limit: 20,
        offset: 0
      })

      jest.spyOn(userDataService, 'getTopTracks').mockResolvedValue({
        items: mockTracksResponse.items as any,
        total: 1,
        timeRange: 'medium_term',
        limit: 30,
        offset: 0
      })

      jest.spyOn(userDataService, 'getRecentTracks').mockResolvedValue(mockRecentTracks)
      jest.spyOn(userDataService, 'getArtistDetails').mockResolvedValue({
        id: 'artist1',
        name: 'Artist 1',
        genres: ['pop'],
        popularity: 85,
        followers: 1000000,
        images: [],
        topTracks: []
      })

      const progressUpdates: string[] = []
      const onProgress = jest.fn((progress) => {
        progressUpdates.push(progress.step)
      })

      const gameData = await userDataService.collectGameData('user123', onProgress)

      expect(gameData.userId).toBe('user123')
      expect(gameData.artists).toHaveLength(1)
      expect(gameData.tracks).toHaveLength(1)
      expect(gameData.playlists).toHaveLength(1)
      expect(gameData.collectedAt).toBeTruthy()

      // Check that progress was reported
      expect(onProgress).toHaveBeenCalled()
      expect(progressUpdates).toContain('complete')
    })

    it('should handle errors during data collection', async () => {
      jest.spyOn(userDataService, 'getUserProfile').mockRejectedValue(new Error('Profile error'))

      await expect(userDataService.collectGameData('user123'))
        .rejects.toThrow('Failed to collect game data: Profile error')
    })
  })
})