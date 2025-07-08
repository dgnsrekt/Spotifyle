/**
 * Tests for SpotifyClient
 */

import { SpotifyClient } from '../spotify-client'
import { MemoryTokenStorage } from '../token-manager'
import { SpotifyApiError, SpotifyAuthError } from '../../types/client'
import type { SpotifyClientConfig, SpotifyTokens } from '../../types/client'

// Mock the HTTP client
jest.mock('../http-client')
jest.mock('../token-manager')

// Mock fetch for token operations
global.fetch = jest.fn()

describe('SpotifyClient', () => {
  let client: SpotifyClient
  let storage: MemoryTokenStorage
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  const config: SpotifyClientConfig = {
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    redirectUri: 'http://localhost:3000/callback',
    scopes: ['user-read-private', 'user-top-read', 'user-read-recently-played']
  }

  const validTokens: SpotifyTokens = {
    accessToken: 'valid-access-token',
    refreshToken: 'valid-refresh-token',
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
    scope: 'user-read-private user-top-read user-read-recently-played'
  }

  beforeEach(() => {
    storage = new MemoryTokenStorage()
    client = new SpotifyClient(config, storage)
    mockFetch.mockClear()
    
    // Mock the token manager methods
    ;(client as any).tokenManager = {
      getAuthorizationUrl: jest.fn((state?: string) => {
        const params = new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          scope: config.scopes.join(' '),
          response_type: 'code'
        })
        if (state) {
          params.set('state', state)
        }
        return `https://accounts.spotify.com/authorize?${params.toString()}`
      }),
      exchangeCodeForTokens: jest.fn(async (userId: string, code: string) => {
        // This will be overridden in individual tests as needed
        return validTokens
      }),
      getValidAccessToken: jest.fn(async (userId: string) => {
        return { tokens: validTokens, wasRefreshed: false }
      }),
      hasValidTokens: jest.fn(async (userId: string) => true),
      revokeTokens: jest.fn(async (userId: string) => {})
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
    storage.clear()
  })

  // Mock the HTTP client request method
  const mockHttpRequest = jest.fn()
  beforeEach(() => {
    // Access the private httpClient and mock its request method
    ;(client as any).httpClient = {
      request: mockHttpRequest,
      getRateLimitState: jest.fn(() => ({
        remaining: 100,
        limit: 100,
        resetTime: Date.now() + 3600000
      }))
    }
  })

  describe('Authentication methods', () => {
    it('should generate authorization URL', () => {
      const url = client.getAuthorizationUrl('test-state')
      
      expect(url).toContain('https://accounts.spotify.com/authorize')
      expect(url).toContain('client_id=test-client-id')
      expect(url).toContain('state=test-state')
    })

    it('should exchange code for tokens', async () => {
      const expectedTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: Math.floor(Date.now() / 1000) + 3600,
        scope: 'user-read-private'
      }

      // Override the mock for this specific test
      ;(client as any).tokenManager.exchangeCodeForTokens = jest.fn().mockResolvedValueOnce(expectedTokens)

      const tokens = await client.exchangeCodeForTokens('user123', 'auth-code')
      
      expect(tokens.accessToken).toBe('new-access-token')
      expect(tokens.refreshToken).toBe('new-refresh-token')
      expect((client as any).tokenManager.exchangeCodeForTokens).toHaveBeenCalledWith('user123', 'auth-code')
    })

    it('should check if user has valid tokens', async () => {
      await storage.set('user123', validTokens)
      
      // Mock token manager to return valid tokens
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        }),
        hasValidTokens: jest.fn().mockResolvedValue(true),
        revokeTokens: jest.fn().mockResolvedValue(undefined),
        getAuthorizationUrl: jest.fn().mockReturnValue('https://example.com'),
        exchangeCodeForTokens: jest.fn().mockResolvedValue(validTokens)
      }

      const hasValid = await client.hasValidTokens('user123')
      expect(hasValid).toBe(true)
    })
  })

  describe('User profile methods', () => {
    beforeEach(() => {
      // Mock successful token retrieval
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        })
      }
    })

    it('should get current user profile', async () => {
      const mockUser = {
        id: 'user123',
        display_name: 'Test User',
        email: 'test@example.com',
        followers: { total: 100 },
        images: [{ url: 'https://example.com/avatar.jpg', width: 300, height: 300 }]
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockUser,
        status: 200,
        headers: {}
      })

      const user = await client.getCurrentUser('user123')

      expect(user).toEqual(mockUser)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/me',
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get user by ID', async () => {
      const mockUser = {
        id: 'target-user',
        display_name: 'Target User',
        followers: { total: 500 },
        images: []
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockUser,
        status: 200,
        headers: {}
      })

      const user = await client.getUser('user123', 'target-user')

      expect(user).toEqual(mockUser)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/users/target-user',
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })
  })

  describe('Top items methods', () => {
    beforeEach(() => {
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        })
      }
    })

    it('should get top artists with default parameters', async () => {
      const mockArtists = {
        items: [
          { id: 'artist1', name: 'Artist 1', type: 'artist' },
          { id: 'artist2', name: 'Artist 2', type: 'artist' }
        ],
        total: 2,
        limit: 20,
        offset: 0
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockArtists,
        status: 200,
        headers: {}
      })

      const artists = await client.getTopArtists('user123')

      expect(artists).toEqual(mockArtists)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/me/top/artists',
        method: 'GET',
        params: {
          limit: 20,
          time_range: 'medium_term'
        },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get top tracks with custom parameters', async () => {
      const mockTracks = {
        items: [
          { id: 'track1', name: 'Track 1', type: 'track' },
          { id: 'track2', name: 'Track 2', type: 'track' }
        ],
        total: 2,
        limit: 10,
        offset: 0
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockTracks,
        status: 200,
        headers: {}
      })

      const tracks = await client.getTopTracks('user123', {
        limit: 10,
        time_range: 'short_term'
      })

      expect(tracks).toEqual(mockTracks)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/me/top/tracks',
        method: 'GET',
        params: {
          limit: 10,
          time_range: 'short_term'
        },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get recently played tracks', async () => {
      const mockRecentTracks = {
        items: [
          {
            track: { id: 'track1', name: 'Recent Track 1' },
            played_at: '2023-01-01T00:00:00Z'
          }
        ],
        cursors: { after: 'cursor123', before: 'cursor456' },
        next: null
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockRecentTracks,
        status: 200,
        headers: {}
      })

      const recentTracks = await client.getRecentlyPlayed('user123', { limit: 10 })

      expect(recentTracks).toEqual(mockRecentTracks)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/me/player/recently-played',
        method: 'GET',
        params: {
          limit: 10
        },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })
  })

  describe('Search methods', () => {
    beforeEach(() => {
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        })
      }
    })

    it('should search for items', async () => {
      const mockSearchResults = {
        tracks: {
          items: [{ id: 'track1', name: 'Search Result Track' }],
          total: 1
        },
        artists: {
          items: [{ id: 'artist1', name: 'Search Result Artist' }],
          total: 1
        }
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockSearchResults,
        status: 200,
        headers: {}
      })

      const results = await client.search('user123', {
        q: 'test query',
        type: ['track', 'artist'],
        limit: 20
      })

      expect(results).toEqual(mockSearchResults)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/search',
        method: 'GET',
        params: {
          q: 'test query',
          type: 'track,artist',
          limit: 20
        },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })
  })

  describe('Artist methods', () => {
    beforeEach(() => {
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        })
      }
    })

    it('should get artist by ID', async () => {
      const mockArtist = {
        id: 'artist123',
        name: 'Test Artist',
        genres: ['pop', 'rock'],
        popularity: 85
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockArtist,
        status: 200,
        headers: {}
      })

      const artist = await client.getArtist('user123', 'artist123')

      expect(artist).toEqual(mockArtist)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/artists/artist123',
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get multiple artists', async () => {
      const mockArtistsResponse = {
        artists: [
          { id: 'artist1', name: 'Artist 1' },
          { id: 'artist2', name: 'Artist 2' }
        ]
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockArtistsResponse,
        status: 200,
        headers: {}
      })

      const artists = await client.getArtists('user123', ['artist1', 'artist2'])

      expect(artists).toEqual(mockArtistsResponse)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/artists',
        method: 'GET',
        params: {
          ids: 'artist1,artist2'
        },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get artist top tracks', async () => {
      const mockTopTracks = {
        tracks: [
          { id: 'track1', name: 'Top Track 1', popularity: 90 },
          { id: 'track2', name: 'Top Track 2', popularity: 85 }
        ]
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockTopTracks,
        status: 200,
        headers: {}
      })

      const topTracks = await client.getArtistTopTracks('user123', 'artist123', 'US')

      expect(topTracks).toEqual(mockTopTracks)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/artists/artist123/top-tracks',
        method: 'GET',
        params: { market: 'US' },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })
  })

  describe('Track methods', () => {
    beforeEach(() => {
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        })
      }
    })

    it('should get track by ID', async () => {
      const mockTrack = {
        id: 'track123',
        name: 'Test Track',
        artists: [{ id: 'artist1', name: 'Artist 1' }],
        album: { id: 'album1', name: 'Album 1' },
        duration_ms: 240000
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockTrack,
        status: 200,
        headers: {}
      })

      const track = await client.getTrack('user123', 'track123')

      expect(track).toEqual(mockTrack)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/tracks/track123',
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get audio features for track', async () => {
      const mockAudioFeatures = {
        id: 'track123',
        danceability: 0.8,
        energy: 0.9,
        tempo: 120.0,
        valence: 0.7
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockAudioFeatures,
        status: 200,
        headers: {}
      })

      const audioFeatures = await client.getAudioFeatures('user123', 'track123')

      expect(audioFeatures).toEqual(mockAudioFeatures)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/audio-features/track123',
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })

    it('should get audio features for multiple tracks', async () => {
      const mockAudioFeatures = {
        audio_features: [
          { id: 'track1', danceability: 0.8 },
          { id: 'track2', danceability: 0.6 }
        ]
      }

      mockHttpRequest.mockResolvedValueOnce({
        data: mockAudioFeatures,
        status: 200,
        headers: {}
      })

      const audioFeatures = await client.getAudioFeaturesForTracks(
        'user123',
        ['track1', 'track2']
      )

      expect(audioFeatures).toEqual(mockAudioFeatures)
      expect(mockHttpRequest).toHaveBeenCalledWith({
        endpoint: '/audio-features',
        method: 'GET',
        params: {
          ids: 'track1,track2'
        },
        headers: {
          Authorization: 'Bearer valid-access-token'
        },
        requiresAuth: true
      })
    })
  })

  describe('Error handling', () => {
    it('should handle authentication errors', async () => {
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockRejectedValue(
          new SpotifyAuthError('Token expired')
        )
      }

      await expect(client.getCurrentUser('user123'))
        .rejects.toThrow(SpotifyAuthError)
    })

    it('should wrap other errors as SpotifyApiError', async () => {
      ;(client as any).tokenManager = {
        getValidAccessToken: jest.fn().mockResolvedValue({
          tokens: validTokens,
          wasRefreshed: false
        })
      }

      mockHttpRequest.mockRejectedValueOnce(new SpotifyApiError('Network error', 0, 'NETWORK_ERROR'))

      await expect(client.getCurrentUser('user123'))
        .rejects.toThrow(SpotifyApiError)
    })
  })

  describe('Configuration', () => {
    it('should return client configuration', () => {
      const clientConfig = client.getConfig()
      expect(clientConfig).toEqual(config)
    })

    it('should return rate limit state', () => {
      const rateLimitState = client.getRateLimitState()
      expect(rateLimitState).toEqual({
        remaining: 100,
        limit: 100,
        resetTime: expect.any(Number)
      })
    })
  })
})