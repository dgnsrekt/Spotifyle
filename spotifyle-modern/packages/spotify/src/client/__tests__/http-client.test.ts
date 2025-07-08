/**
 * Tests for SpotifyHttpClient
 */

import { SpotifyHttpClient } from '../http-client'
import { SpotifyApiError, SpotifyRateLimitError } from '../../types/client'

// Mock fetch globally
global.fetch = jest.fn()

describe('SpotifyHttpClient', () => {
  let client: SpotifyHttpClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    client = new SpotifyHttpClient('https://api.spotify.com/v1', {
      retries: 2,
      timeout: 5000,
      rateLimit: false, // Disable for testing
    })
    mockFetch.mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful requests', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = { id: 'test', name: 'Test Track' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json'
        }),
        json: async () => mockResponse,
      } as Response)

      const result = await client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })

      expect(result.data).toEqual(mockResponse)
      expect(result.status).toBe(200)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/tracks/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          })
        })
      )
    })

    it('should handle query parameters correctly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({}),
      } as Response)

      await client.request({
        endpoint: '/search',
        method: 'GET',
        params: {
          q: 'test query',
          type: ['track', 'artist'],
          limit: 20
        }
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/search?q=test+query&type=track%2Cartist&limit=20',
        expect.any(Object)
      )
    })

    it('should handle POST requests with body', async () => {
      const requestBody = { name: 'Test Playlist' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({ id: 'playlist123' }),
      } as Response)

      await client.request({
        endpoint: '/playlists',
        method: 'POST',
        body: requestBody
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/playlists',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should throw SpotifyApiError for 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          error: {
            status: 404,
            message: 'Track not found'
          }
        })
      } as Response)

      await expect(client.request({
        endpoint: '/tracks/nonexistent',
        method: 'GET'
      })).rejects.toThrow(SpotifyApiError)
    })

    it.skip('should throw SpotifyRateLimitError for 429 status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        headers: new Headers({
          'Retry-After': '60'
        }),
        json: async () => ({
          error: {
            status: 429,
            message: 'Rate limit exceeded'
          }
        })
      } as Response)

      await expect(client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })).rejects.toThrow(SpotifyRateLimitError)
    }, 10000)

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      await expect(client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })).rejects.toThrow(SpotifyApiError)
    })

    it('should parse non-JSON error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Server Error',
        json: async () => { throw new Error('Not JSON') }
      } as Response)

      await expect(client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })).rejects.toThrow(SpotifyApiError)
    })
  })

  describe('Retry logic', () => {
    it('should retry on 5xx errors', async () => {
      // First call fails, second succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
          headers: new Headers(),
          json: async () => ({})
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Headers({ 'content-type': 'application/json' }),
          json: async () => ({ success: true })
        } as Response)

      const result = await client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })

      expect(result.data).toEqual({ success: true })
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should not retry 4xx errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({
          error: { status: 400, message: 'Bad request' }
        })
      } as Response)

      await expect(client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })).rejects.toThrow(SpotifyApiError)

      expect(mockFetch).toHaveBeenCalledTimes(1)
    })

    it('should respect max retries', async () => {
      // Always return 500 error
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: new Headers(),
        json: async () => ({})
      } as Response)

      await expect(client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })).rejects.toThrow(SpotifyApiError)

      // Should try 3 times total (initial + 2 retries)
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })
  })

  describe('Rate limiting', () => {
    beforeEach(() => {
      client = new SpotifyHttpClient('https://api.spotify.com/v1', {
        rateLimit: true
      })
    })

    it('should update rate limit state from headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'content-type': 'application/json',
          'X-RateLimit-Remaining': '95',
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 3600)
        }),
        json: async () => ({ success: true })
      } as Response)

      await client.request({
        endpoint: '/tracks/test',
        method: 'GET'
      })

      const rateLimitState = client.getRateLimitState()
      expect(rateLimitState.remaining).toBe(95)
      expect(rateLimitState.limit).toBe(100)
    })
  })

  describe('Response parsing', () => {
    it('should parse JSON responses', async () => {
      const mockData = { id: 'test', name: 'Test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => mockData
      } as Response)

      const result = await client.request({
        endpoint: '/test',
        method: 'GET'
      })

      expect(result.data).toEqual(mockData)
    })

    it('should parse text responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        text: async () => 'Success'
      } as Response)

      const result = await client.request({
        endpoint: '/test',
        method: 'GET'
      })

      expect(result.data).toBe('Success')
    })
  })

  describe('Configuration', () => {
    it('should use custom base URL', async () => {
      const customClient = new SpotifyHttpClient('https://custom.api.com')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      } as Response)

      await customClient.request({
        endpoint: '/test',
        method: 'GET'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.api.com/test',
        expect.any(Object)
      )
    })

    it('should handle trailing slashes in base URL', async () => {
      const trailingSlashClient = new SpotifyHttpClient('https://api.spotify.com/v1/')
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => ({})
      } as Response)

      await trailingSlashClient.request({
        endpoint: '/test',
        method: 'GET'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.spotify.com/v1/test',
        expect.any(Object)
      )
    })
  })
})