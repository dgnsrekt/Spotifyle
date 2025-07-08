/**
 * Tests for type validation and schemas
 */

import {
  isSpotifyApiError,
  isSpotifyAuthError,
  isSpotifyRateLimitError,
  isSpotifyTrack,
  isSpotifyArtist,
  isSpotifyAlbum,
  isSpotifyPlaylist,
  SpotifyIdSchema,
  SpotifyUriSchema,
  SpotifyImageSchema,
  SpotifyExternalUrlsSchema,
  SpotifyTokensSchema,
  SpotifyUserProfileSchema,
  SpotifyClientConfigSchema
} from '../index'

import {
  SpotifyApiError,
  SpotifyAuthError,
  SpotifyRateLimitError
} from '../client'

describe('Type Guards', () => {
  describe('Error type guards', () => {
    it('should identify SpotifyApiError correctly', () => {
      const apiError = new SpotifyApiError('API error', 400, 'bad_request')
      const regularError = new Error('Regular error')
      const authError = new SpotifyAuthError('Auth error')

      expect(isSpotifyApiError(apiError)).toBe(true)
      expect(isSpotifyApiError(regularError)).toBe(false)
      expect(isSpotifyApiError(authError)).toBe(false)
      expect(isSpotifyApiError(null)).toBe(false)
      expect(isSpotifyApiError(undefined)).toBe(false)
      expect(isSpotifyApiError('string')).toBe(false)
    })

    it('should identify SpotifyAuthError correctly', () => {
      const authError = new SpotifyAuthError('Auth error')
      const apiError = new SpotifyApiError('API error', 400)
      const regularError = new Error('Regular error')

      expect(isSpotifyAuthError(authError)).toBe(true)
      expect(isSpotifyAuthError(apiError)).toBe(false)
      expect(isSpotifyAuthError(regularError)).toBe(false)
      expect(isSpotifyAuthError(null)).toBe(false)
    })

    it('should identify SpotifyRateLimitError correctly', () => {
      const rateLimitError = new SpotifyRateLimitError('Rate limit exceeded', 60)
      const apiError = new SpotifyApiError('API error', 400)
      const regularError = new Error('Regular error')

      expect(isSpotifyRateLimitError(rateLimitError)).toBe(true)
      expect(isSpotifyRateLimitError(apiError)).toBe(false)
      expect(isSpotifyRateLimitError(regularError)).toBe(false)
      expect(isSpotifyRateLimitError(null)).toBe(false)
    })
  })

  describe('Spotify entity type guards', () => {
    it('should identify Spotify track correctly', () => {
      const track = {
        id: 'track123',
        name: 'Test Track',
        type: 'track',
        artists: [],
        album: {}
      }

      const artist = {
        id: 'artist123',
        name: 'Test Artist',
        type: 'artist'
      }

      expect(isSpotifyTrack(track)).toBe(true)
      expect(isSpotifyTrack(artist)).toBe(false)
      expect(isSpotifyTrack(null)).toBe(false)
      expect(isSpotifyTrack({})).toBe(false)
      expect(isSpotifyTrack({ type: 'track' })).toBe(true) // Minimal valid track
    })

    it('should identify Spotify artist correctly', () => {
      const artist = {
        id: 'artist123',
        name: 'Test Artist',
        type: 'artist',
        genres: ['pop']
      }

      const track = {
        id: 'track123',
        name: 'Test Track',
        type: 'track'
      }

      expect(isSpotifyArtist(artist)).toBe(true)
      expect(isSpotifyArtist(track)).toBe(false)
      expect(isSpotifyArtist(null)).toBe(false)
      expect(isSpotifyArtist({ type: 'artist' })).toBe(true)
    })

    it('should identify Spotify album correctly', () => {
      const album = {
        id: 'album123',
        name: 'Test Album',
        type: 'album',
        artists: []
      }

      const track = {
        id: 'track123',
        name: 'Test Track',
        type: 'track'
      }

      expect(isSpotifyAlbum(album)).toBe(true)
      expect(isSpotifyAlbum(track)).toBe(false)
      expect(isSpotifyAlbum(null)).toBe(false)
      expect(isSpotifyAlbum({ type: 'album' })).toBe(true)
    })

    it('should identify Spotify playlist correctly', () => {
      const playlist = {
        id: 'playlist123',
        name: 'Test Playlist',
        type: 'playlist',
        tracks: {}
      }

      const album = {
        id: 'album123',
        name: 'Test Album',
        type: 'album'
      }

      expect(isSpotifyPlaylist(playlist)).toBe(true)
      expect(isSpotifyPlaylist(album)).toBe(false)
      expect(isSpotifyPlaylist(null)).toBe(false)
      expect(isSpotifyPlaylist({ type: 'playlist' })).toBe(true)
    })
  })
})

describe('Validation Schemas', () => {
  describe('SpotifyIdSchema', () => {
    it('should validate correct Spotify IDs', () => {
      expect(SpotifyIdSchema.safeParse('4uLU6hMCjMI75M1A2tKUQC').success).toBe(true)
      expect(SpotifyIdSchema.safeParse('abc123').success).toBe(true)
      expect(SpotifyIdSchema.safeParse('1234567890').success).toBe(true)
    })

    it('should reject invalid Spotify IDs', () => {
      expect(SpotifyIdSchema.safeParse('').success).toBe(false)
      expect(SpotifyIdSchema.safeParse(null).success).toBe(false)
      expect(SpotifyIdSchema.safeParse(undefined).success).toBe(false)
      expect(SpotifyIdSchema.safeParse('a'.repeat(256)).success).toBe(false) // Too long
    })
  })

  describe('SpotifyUriSchema', () => {
    it('should validate correct Spotify URIs', () => {
      expect(SpotifyUriSchema.safeParse('spotify:track:4uLU6hMCjMI75M1A2tKUQC').success).toBe(true)
      expect(SpotifyUriSchema.safeParse('spotify:artist:4Z8W4fKeB5YxbusRsdQVPb').success).toBe(true)
      expect(SpotifyUriSchema.safeParse('spotify:album:1DFixLWuPkv3KT3TnV35m3').success).toBe(true)
      expect(SpotifyUriSchema.safeParse('spotify:playlist:37i9dQZF1DX0XUsuxWHRQd').success).toBe(true)
    })

    it('should reject invalid Spotify URIs', () => {
      expect(SpotifyUriSchema.safeParse('invalid:uri').success).toBe(false)
      expect(SpotifyUriSchema.safeParse('spotify:invalid').success).toBe(false)
      expect(SpotifyUriSchema.safeParse('http://spotify.com/track/123').success).toBe(false)
      expect(SpotifyUriSchema.safeParse('').success).toBe(false)
    })
  })

  describe('SpotifyImageSchema', () => {
    it('should validate correct image objects', () => {
      const validImage = {
        url: 'https://i.scdn.co/image/ab67616d0000b273e3b5a6f4e22e4a0e5f2e2e2e',
        width: 640,
        height: 640
      }

      expect(SpotifyImageSchema.safeParse(validImage).success).toBe(true)
    })

    it('should allow null dimensions', () => {
      const imageWithNullDimensions = {
        url: 'https://i.scdn.co/image/test.jpg',
        width: null,
        height: null
      }

      expect(SpotifyImageSchema.safeParse(imageWithNullDimensions).success).toBe(true)
    })

    it('should reject invalid image objects', () => {
      expect(SpotifyImageSchema.safeParse({}).success).toBe(false)
      expect(SpotifyImageSchema.safeParse({
        url: 'not-a-url',
        width: 640,
        height: 640
      }).success).toBe(false)
      expect(SpotifyImageSchema.safeParse({
        url: 'https://example.com/image.jpg',
        width: 'not-a-number',
        height: 640
      }).success).toBe(false)
    })
  })

  describe('SpotifyExternalUrlsSchema', () => {
    it('should validate correct external URLs', () => {
      const validUrls = {
        spotify: 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'
      }

      expect(SpotifyExternalUrlsSchema.safeParse(validUrls).success).toBe(true)
    })

    it('should reject invalid external URLs', () => {
      expect(SpotifyExternalUrlsSchema.safeParse({}).success).toBe(false)
      expect(SpotifyExternalUrlsSchema.safeParse({
        spotify: 'not-a-url'
      }).success).toBe(false)
    })
  })

  describe('SpotifyTokensSchema', () => {
    it('should validate correct token objects', () => {
      const validTokens = {
        accessToken: 'BQA4YFrRUHXOwP0VHdC4g8YYlY7B0z1aS',
        refreshToken: 'AQApPeRU-qHgtHhQyr0Tdmj-',
        expiresAt: Date.now() + 3600000,
        scope: 'user-read-private user-top-read'
      }

      expect(SpotifyTokensSchema.safeParse(validTokens).success).toBe(true)
    })

    it('should allow null refresh token', () => {
      const tokensWithoutRefresh = {
        accessToken: 'BQA4YFrRUHXOwP0VHdC4g8YYlY7B0z1aS',
        refreshToken: null,
        expiresAt: Date.now() + 3600000,
        scope: 'user-read-private'
      }

      expect(SpotifyTokensSchema.safeParse(tokensWithoutRefresh).success).toBe(true)
    })

    it('should reject invalid token objects', () => {
      expect(SpotifyTokensSchema.safeParse({}).success).toBe(false)
      expect(SpotifyTokensSchema.safeParse({
        accessToken: '',
        refreshToken: null,
        expiresAt: Date.now(),
        scope: 'test'
      }).success).toBe(false) // Empty access token
      expect(SpotifyTokensSchema.safeParse({
        accessToken: 'valid-token',
        refreshToken: null,
        expiresAt: -1, // Negative timestamp
        scope: 'test'
      }).success).toBe(false)
    })
  })

  describe('SpotifyUserProfileSchema', () => {
    it('should validate correct user profile', () => {
      const validProfile = {
        id: 'user123',
        displayName: 'Test User',
        email: 'test@example.com',
        country: 'US',
        product: 'premium',
        images: [
          {
            url: 'https://i.scdn.co/image/user.jpg',
            width: 300,
            height: 300
          }
        ],
        followers: 100
      }

      expect(SpotifyUserProfileSchema.safeParse(validProfile).success).toBe(true)
    })

    it('should allow null optional fields', () => {
      const profileWithNulls = {
        id: 'user123',
        displayName: null,
        email: null,
        country: null,
        product: null,
        images: [],
        followers: 0
      }

      expect(SpotifyUserProfileSchema.safeParse(profileWithNulls).success).toBe(true)
    })

    it('should reject invalid user profiles', () => {
      expect(SpotifyUserProfileSchema.safeParse({}).success).toBe(false)
      expect(SpotifyUserProfileSchema.safeParse({
        id: '',
        displayName: null,
        email: null,
        country: null,
        product: null,
        images: [],
        followers: 0
      }).success).toBe(false) // Empty ID
      expect(SpotifyUserProfileSchema.safeParse({
        id: 'user123',
        displayName: null,
        email: 'invalid-email',
        country: null,
        product: null,
        images: [],
        followers: 0
      }).success).toBe(false) // Invalid email
      expect(SpotifyUserProfileSchema.safeParse({
        id: 'user123',
        displayName: null,
        email: null,
        country: 'USA', // Should be 2 characters
        product: null,
        images: [],
        followers: 0
      }).success).toBe(false)
    })
  })

  describe('SpotifyClientConfigSchema', () => {
    it('should validate correct client configuration', () => {
      const validConfig = {
        clientId: 'client123',
        clientSecret: 'secret123',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['user-read-private', 'user-top-read'],
        baseUrl: 'https://api.spotify.com/v1'
      }

      expect(SpotifyClientConfigSchema.safeParse(validConfig).success).toBe(true)
    })

    it('should use default baseUrl when not provided', () => {
      const configWithoutBaseUrl = {
        clientId: 'client123',
        clientSecret: 'secret123',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['user-read-private']
      }

      const result = SpotifyClientConfigSchema.safeParse(configWithoutBaseUrl)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.baseUrl).toBe('https://api.spotify.com/v1')
      }
    })

    it('should reject invalid client configurations', () => {
      expect(SpotifyClientConfigSchema.safeParse({}).success).toBe(false)
      expect(SpotifyClientConfigSchema.safeParse({
        clientId: '',
        clientSecret: 'secret123',
        redirectUri: 'http://localhost:3000/callback',
        scopes: []
      }).success).toBe(false) // Empty client ID
      expect(SpotifyClientConfigSchema.safeParse({
        clientId: 'client123',
        clientSecret: 'secret123',
        redirectUri: 'invalid-url',
        scopes: []
      }).success).toBe(false) // Invalid redirect URI
      expect(SpotifyClientConfigSchema.safeParse({
        clientId: 'client123',
        clientSecret: 'secret123',
        redirectUri: 'http://localhost:3000/callback',
        scopes: [],
        baseUrl: 'invalid-url'
      }).success).toBe(false) // Invalid base URL
    })
  })
})